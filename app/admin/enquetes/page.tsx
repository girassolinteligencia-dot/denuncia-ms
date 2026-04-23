import React from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { EnquetesManager } from '@/components/admin/enquetes-manager'

export const metadata = {
  title: 'Gestão de Enquetes | Painel Admin',
}

export default async function EnquetesAdminPage() {
  const supabase = createAdminClient()
  
  // 1. Busca Enquetes com Opções e Votos
  const { data: enquetes, error } = await supabase
    .from('enquetes')
    .select(`
      *,
      opcoes:enquete_opcoes(*),
      votos:enquete_votos(opcao_id)
    `)
    .order('criado_em', { ascending: false })

  // 2. Busca Configuração da Pesquisa de Satisfação
  const { data: config } = await supabase
    .from('plataforma_config')
    .select('valor')
    .eq('chave', 'funcionalidade.pesquisa_satisfacao_ativa')
    .maybeSingle()

  if (error) {
    return <div className="p-8 text-error">Erro ao carregar enquetes: {error.message}</div>
  }

  // Processar dados para o componente
  const processedEnquetes = (enquetes || []).map(e => ({
    ...e,
    total_votos: e.votos?.length || 0,
    opcoes: e.opcoes.map((o: any) => ({
      ...o,
      votos: e.votos?.filter((v: any) => v.opcao_id === o.id).length || 0
    }))
  }))

  const satisfacaoAtiva = config?.valor === 'true'

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-dark tracking-tighter uppercase italic">
            Gestão de <span className="text-primary underline decoration-secondary decoration-4 underline-offset-4">Engajamento</span>
          </h1>
          <p className="text-muted text-sm font-medium">Configure enquetes e pesquisas de satisfação para o público.</p>
        </div>
      </div>

      <EnquetesManager 
        initialEnquetes={processedEnquetes} 
        satisfacaoAtiva={satisfacaoAtiva} 
      />
    </div>
  )
}
