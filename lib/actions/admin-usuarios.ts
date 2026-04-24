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
      .select('*')
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
  const supabase = createAdminClient()
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.error('[AUTH ERROR] getMe failed to get user:', authError)
      return { success: false, error: authError.message }
    }
    if (!user) return { success: false, error: 'Não autenticado' }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('[DB ERROR] getMe failed to fetch profile for user:', user.id, error)
      throw error
    }
    
    return { success: true, data: profile as Profile }
  } catch (err: unknown) {
    console.error('[CRITICAL ERROR] getMe exception:', err)
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
    // mas por garantia vamos forçar o update dos dados extras se necessário
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        nome: data.nome, 
        role: data.role,
        permissoes: data.permissoes,
        ativo: true 
      })
      .eq('id', authUser.user.id)

    if (profileError) {
      console.warn('Erro ao atualizar profile (pode não ter sido criado via trigger ainda):', profileError)
      // Se a trigger falhou ou não existe, inserimos manualmente
      await supabase.from('profiles').upsert({
        id: authUser.user.id,
        nome: data.nome,
        role: data.role,
        ativo: true
      })
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
