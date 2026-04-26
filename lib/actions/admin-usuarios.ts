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
    
    if (authError) {
      console.warn('[AUTH] getMe user fetch failed:', authError.message)
      return { success: false, error: authError.message }
    }
    
    if (!user) {
      console.warn('[AUTH] No user session found in getMe')
      return { success: false, error: 'Não autenticado' }
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, nome, role, criado_em, permissoes, ativo')
      .eq('id', user.id)
      .single()

    // Lógica de Autocorreção: Se for o e-mail mestre, garante privilégios de superadmin
    if (user && user.email === 'girassolinteligencia@gmail.com') {
      if (!profile || profile.role !== 'superadmin' || !profile.permissoes?.includes('usuarios')) {
        console.log('[REPAIR] Auto-elevando privilégios para girassolinteligencia@gmail.com')
        const adminSupabase = createAdminClient()
        const { error: upsertError } = await adminSupabase
          .from('profiles')
          .upsert({
            id: user.id,
            nome: profile?.nome || 'Super Administrador',
            role: 'superadmin',
            permissoes: ["dashboard", "denuncias", "categorias", "comunicacao", "usuarios", "configuracoes", "seguranca"],
            ativo: true,
            atualizado_em: new Date().toISOString()
          })

        if (!upsertError) {
          // Busca o perfil atualizado
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .select('id, nome, role, criado_em, permissoes, ativo')
            .eq('id', user.id)
            .single()
          
          if (updatedProfile) return { success: true, data: updatedProfile as Profile }
        } else {
          console.error('[REPAIR] Falha na auto-elevação:', upsertError.message)
        }
      }
    }

    if (error) {
      console.error('[DB] Profile fetch failed for user', user.id, ':', error.message)
      // Se não houver profile mas o user existe no Auth, pode ser um erro de sincronização
      return { success: false, error: 'Perfil não encontrado' }
    }
    
    return { success: true, data: profile as Profile }
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
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { nome: data.nome }
    })

    if (authError) throw authError
    if (!authUser.user) throw new Error('Falha ao criar usuário no Auth')

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

