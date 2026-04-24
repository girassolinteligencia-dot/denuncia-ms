import React from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { CategoryManager } from '@/components/admin/category-manager'

export const metadata = {
  title: 'Gestão de Categorias',
}

export default async function CategoriasPage() {
  const supabase = createAdminClient()
  
  // Busca categorias cadastradas
  const { data: categorias, error } = await supabase
    .from('categorias')
    .select('id, slug, label, bloco, icon_name, instrucao_publica, aviso_legal, template_descricao, ativo, ordem, criado_em, atualizado_em')
    .order('ordem', { ascending: true })

  if (error) {
    return <div className="p-8 text-error">Erro ao carregar categorias: {error.message}</div>
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Categorias de Denúncia</h1>
          <p className="text-muted text-sm">
            Gerencie os tipos de ocorrências disponíveis para o cidadão e seus destinos de encaminhamento.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-muted uppercase">Total de Categorias</p>
              <p className="text-xl font-black text-primary">{categorias?.length || 0}</p>
           </div>
        </div>
      </div>

      <CategoryManager initialCategorias={categorias || []} />
    </div>
  )
}


