import { createAdminClient } from './lib/supabase-admin'

async function elevateUser(email: string) {
  const supabase = createAdminClient()
  
  console.log(`[ELEVATE] Buscando usuário com e-mail: ${email}...`)
  
  // 1. Buscar o ID do usuário no Auth (usando admin API)
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  
  if (listError) {
    console.error('[ELEVATE] Erro ao listar usuários:', listError.message)
    return
  }
  
  const targetUser = users.find(u => u.email === email)
  
  if (!targetUser) {
    console.error(`[ELEVATE] Usuário ${email} não encontrado no Auth.`)
    return
  }
  
  console.log(`[ELEVATE] Usuário encontrado: ${targetUser.id}. Elevando para superadmin...`)
  
  // 2. Atualizar o profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      role: 'superadmin',
      permissoes: ["dashboard", "denuncias", "categorias", "comunicacao", "usuarios", "configuracoes", "seguranca"],
      ativo: true
    })
    .eq('id', targetUser.id)
  
  if (updateError) {
    console.error('[ELEVATE] Erro ao atualizar perfil:', updateError.message)
    // Tentar insert se não existir
    console.log('[ELEVATE] Tentando inserir perfil caso não exista...')
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: targetUser.id,
        nome: targetUser.user_metadata?.nome || 'Administrador',
        role: 'superadmin',
        permissoes: ["dashboard", "denuncias", "categorias", "comunicacao", "usuarios", "configuracoes", "seguranca"],
        ativo: true,
        criado_em: new Date().toISOString()
      })
    
    if (insertError) {
       console.error('[ELEVATE] Erro ao inserir perfil:', insertError.message)
    } else {
       console.log('[ELEVATE] Perfil criado com sucesso como superadmin.')
    }
  } else {
    console.log('[ELEVATE] Perfil atualizado com sucesso para superadmin.')
  }
}

const targetEmail = 'girassolinteligencia@gmail.com'
elevateUser(targetEmail).catch(console.error)
