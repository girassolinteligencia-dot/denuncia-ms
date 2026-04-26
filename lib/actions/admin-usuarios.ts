'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import type { UserRole, Profile } from '@/types'
import { sendEmail } from '../email'

/**
 * Busca todos os usuários/perfis do sistema
 */
export async function getUsuarios() {
  const supabase = createAdminClient()

  try {
    const { data: usuarios, error } = await supabase
      .from('profiles')
      .select('id, nome, role, criado_em, permissoes, ativo')
      .order('criado_em', { ascending: false })

    if (error) throw error
    return { success: true, data: usuarios as Profile[] }
  } catch (err: unknown) {
    console.error('Erro ao buscar usuários:', err)
    return { success: false, error: (err as Error).message }
  }
}

/**
 * Busca o perfil do usuário atualmente logado
 */
export async function getMe() {
  const { cookies } = await import('next/headers')
  const { createClient } = await import('@/utils/supabase/server')
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.warn('[AUTH] getMe user fetch failed or no user')
      return { success: false, error: 'Não autenticado' }
    }
    
    // 1. Tentar buscar o perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, nome, role, criado_em, permissoes, ativo')
      .eq('id', user.id)
      .single()

    // 2. Lógica de Reparo para o e-mail mestre
    if (user.email === 'girassolinteligencia@gmail.com') {
      try {
        if (!profile || profile.role !== 'superadmin' || !profile.permissoes?.includes('usuarios')) {
          console.log('[REPAIR] Tentando elevar privilégios para girassolinteligencia@gmail.com')
          const adminSupabase = createAdminClient()
          
          // 1. Garantir Buckets de Storage
          const buckets = ['banners', 'noticias', 'config', 'denuncias', 'relatos-oficiais']
          for (const b of buckets) {
            const { data: existing } = await adminSupabase.storage.getBucket(b)
            if (!existing) {
              await adminSupabase.storage.createBucket(b, { public: true })
              console.log(`[REPAIR] Bucket '${b}' criado.`)
            }
          }

          // 2. Garantir Tabelas Críticas (Banners, Noticias, Enquetes)
          // Usamos RPC para rodar SQL se existir, ou tentamos um insert bobo para testar
          try {
            await adminSupabase.from('banners').select('id').limit(1)
            await adminSupabase.from('noticias').select('id').limit(1)
            await adminSupabase.from('enquetes').select('id').limit(1)
          } catch (e) {
            console.warn('[REPAIR] Erro ao validar tabelas:', e)
          }

          // 3. Garantir Perfil de Superadmin
          await adminSupabase
            .from('profiles')
            .upsert({
              id: user.id,
              nome: profile?.nome || 'Super Administrador',
              role: 'superadmin',
              permissoes: ["dashboard", "denuncias", "categorias", "comunicacao", "usuarios", "configuracoes", "seguranca"],
              ativo: true,
              atualizado_em: new Date().toISOString()
            })
          
          // Tentar buscar novamente após o reparo
          const { data: refreshedProfile } = await supabase
            .from('profiles')
            .select('id, nome, role, criado_em, permissoes, ativo')
            .eq('id', user.id)
            .single()
          
          if (refreshedProfile) {
            return { success: true, data: { ...refreshedProfile, email: user.email } as any }
          }
        }
      } catch (repairErr) {
        console.error('[REPAIR] Erro crítico no reparo:', repairErr)
      }
    }

    // 3. Retornar o perfil encontrado ou um objeto básico se falhar, mas garantindo o e-mail
    if (profileError || !profile) {
      console.warn('[DB] Perfil não encontrado, retornando dados básicos do Auth')
      return { 
        success: true, 
        data: { 
          id: user.id, 
          nome: user.user_metadata?.nome || 'Usuário', 
          role: (user.email === 'girassolinteligencia@gmail.com' ? 'superadmin' : 'user') as any,
          email: user.email,
          permissoes: user.email === 'girassolinteligencia@gmail.com' ? ["dashboard", "denuncias", "categorias", "comunicacao", "usuarios", "configuracoes", "seguranca"] : []
        } as any 
      }
    }
    
    return { success: true, data: { ...profile, email: user.email } as any }
  } catch (err: unknown) {
    console.error('[CRITICAL] getMe exception:', err)
    return { success: false, error: (err as Error).message }
  }
}

/**
 * Cria um novo usuário administrativo (Auth + Profile)
 */
export async function createUsuarioAdmin(data: {
  nome: string
  email: string
  password: string
  role: UserRole
  permissoes: string[]
}) {
  const supabase = createAdminClient()

  try {
    // 1. Criar no Auth do Supabase com senha definida e e-mail já confirmado
    let authUserRes = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { nome: data.nome }
    })

    // Se o erro for de usuário já cadastrado, vamos tentar recuperar o ID dele
    if (authUserRes.error?.message?.includes('already been registered')) {
      const { data: listData } = await supabase.auth.admin.listUsers()
      const existingUser = listData.users.find(u => u.email === data.email)
      
      if (existingUser) {
        authUserRes = { data: { user: existingUser }, error: null } as any
      } else {
        throw authUserRes.error
      }
    } else if (authUserRes.error) {
      throw authUserRes.error
    }

    const authUser = authUserRes.data
    if (!authUser?.user) throw new Error('Falha ao obter usuário')

    // 2. O Profile deve ser criado automaticamente por Trigger, 
    // mas vamos forçar a criação/update com todos os campos para garantir integridade
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ 
        id: authUser.user.id,
        nome: data.nome, 
        role: data.role,
        permissoes: data.permissoes,
        ativo: true,
        atualizado_em: new Date().toISOString()
      })

    if (profileError) {
      console.error('Erro ao criar/atualizar profile:', profileError)
      // Não lançamos erro aqui para não travar a criação do Auth, 
      // mas o log ajudará a depurar
    }

    let emailEnviado = true
    try {
      await sendEmail({
        to: data.email,
        subject: 'Bem-vindo à Plataforma DenunciaMS — Acesso Administrativo',
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:40px;border:1px solid #eee;border-radius:12px">
            <h2 style="color:#021691;margin-bottom:20px">Acesso Administrativo Liberado</h2>
            <p style="font-size:15px;color:#333;line-height:1.6">
              Olá, <strong>${data.nome}</strong>. Seu perfil de acesso como <strong>${data.role}</strong> foi criado com sucesso.
            </p>
            <div style="background:#f9f9f9;padding:20px;border-radius:8px;margin:25px 0">
              <p style="margin:0;font-size:13px;color:#666">Seus dados de acesso:</p>
              <p style="margin:10px 0 5px 0;font-size:14px"><strong>E-mail:</strong> ${data.email}</p>
              <p style="margin:0;font-size:14px"><strong>Senha:</strong> (Definida pelo administrador)</p>
            </div>
            <p style="font-size:13px;color:#666;font-style:italic">
              Por segurança, recomendamos alterar sua senha após o primeiro acesso no seu perfil.
            </p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin" 
               style="display:inline-block;background:#021691;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:20px">
               Acessar Painel
            </a>
          </div>
        `,
        text: `Bem-vindo ao DenunciaMS. Seu acesso como ${data.role} foi criado. Acesse o painel com seu e-mail.`
      })
    } catch (emailErr: any) {
      console.error('Erro ao enviar e-mail de boas-vindas:', emailErr)
      emailEnviado = false
    }

    revalidatePath('/admin/usuarios')
    return { 
      success: true, 
      warning: !emailEnviado ? 'Usuário criado, mas o e-mail de boas-vindas falhou (Verifique se o domínio do remetente está autorizado no Resend).' : null 
    }
  } catch (err: unknown) {
    console.error('Erro na criação de usuário:', err)
    return { success: false, error: (err as Error).message }
  }
}

/**
 * Ativa ou Desativa o acesso de um usuário
 */
export async function toggleUsuarioStatus(id: string, currentStatus: boolean) {
  const supabase = createAdminClient()

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ ativo: !currentStatus })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/usuarios')
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message }
  }
}

/**
 * Atualiza o papel (role) de um usuário
 */
export async function updateUsuarioAdmin(id: string, data: {
  nome: string
  role: UserRole
  permissoes: string[]
}) {
  const supabase = createAdminClient()

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        nome: data.nome, 
        role: data.role,
        permissoes: data.permissoes,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error
    
    revalidatePath('/admin/usuarios')
    return { success: true }
  } catch (err: any) {
    console.error('Erro ao atualizar usuário:', err)
    return { success: false, error: err.message }
  }
}

export async function updateUsuarioRole(id: string, role: UserRole) {
  const supabase = createAdminClient()

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/usuarios')
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message }
  }
}

/**
 * Remove/Deleta um perfil de usuário e sua conta no Auth
 */
export async function deleteUsuario(id: string) {
  const supabase = createAdminClient()

  try {
    // 1. Deletar do Auth (Service Role permite isso)
    const { error: authError } = await supabase.auth.admin.deleteUser(id)
    if (authError) {
      console.warn('Erro ao deletar do Auth (pode já não existir):', authError.message)
    }

    // 2. Deletar do Profile (o ON DELETE CASCADE no DB cuidaria disso se o ID fosse o mesmo, 
    // mas garantimos aqui se necessário)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/usuarios')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

