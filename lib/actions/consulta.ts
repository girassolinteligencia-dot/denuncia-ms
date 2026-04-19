'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { headers } from 'next/headers'

/**
 * Consulta o status de uma denúncia de forma segura
 * Implementa Rate Limiting por IP para evitar ataques de força bruta
 */
export async function consultarStatusDenuncia(protocolo: string, chaveAcesso: string) {
  const supabase = createAdminClient()
  const headerList = headers()
  const ip = headerList.get('x-forwarded-for') || '127.0.0.1'

  try {
    // 1. Verificar Rate Limiting (Máximo 5 tentativas falhas em 10 minutos por IP)
    // Nota: Em um ambiente real, poderíamos usar um Redis ou uma tabela dedicada.
    // Aqui usaremos uma lógica de "log de erros" para bloquear IPs suspeitos.
    const { data: tentativasRecentes } = await supabase
      .from('logs_acesso_denuncia')
      .select('id')
      .eq('ip_origem', ip)
      .eq('sucesso', false)
      .gt('criado_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())

    if (tentativasRecentes && tentativasRecentes.length >= 5) {
      return { 
        success: false, 
        error: 'Muitas tentativas falhas. Seu acesso foi temporariamente bloqueado por 10 minutos para sua segurança.' 
      }
    }

    // 2. Buscar a denúncia validando Ambas as Credenciais
    const { data: denuncia, error } = await supabase
      .from('denuncias')
      .select('id, protocolo, status, criado_at, titulo, local, categoria_id, categorias(label)')
      .eq('protocolo', protocolo.trim().toUpperCase())
      .eq('chave_acesso', chaveAcesso.trim())
      .single()

    // 3. Registrar o Log de Acesso (Sucesso ou Falha)
    await supabase.from('logs_acesso_denuncia').insert({
      ip_origem: ip,
      protocolo_tentativa: protocolo,
      sucesso: !!denuncia,
      user_agent: headerList.get('user-agent')
    })

    if (!denuncia || error) {
      return { success: false, error: 'Protocolo ou Chave de Acesso incorretos.' }
    }

    return { 
      success: true, 
      denuncia: {
        ...denuncia,
        categoria_label: (denuncia as any).categorias?.label || 'Geral'
      } 
    }

  } catch (err: any) {
    console.error('Erro na consulta:', err)
    return { success: false, error: 'Ocorreu um erro interno na consulta.' }
  }
}
