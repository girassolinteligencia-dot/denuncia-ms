import React from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { CategoryIntegrationForm } from '@/components/admin/category-integration-form'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function CategoryIntegracaoPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient()
  
  // Busca a categoria para exibir o nome
  const { data: categoria } = await supabase
    .from('categorias')
    .select('label')
    .eq('id', params.id)
    .single()

  // Busca a integração existente se houver
  const { data: integracao } = await supabase
    .from('integracoes_destino')
    .select('*')
    .eq('categoria_id', params.id)
    .single()

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <Link 
          href="/admin/categorias" 
          className="flex items-center gap-2 text-xs font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest mb-4"
        >
          <ChevronLeft size={16} />
          Voltar para Categorias
        </Link>
        <h1 className="text-2xl font-bold text-dark">
          Configurar Destinos: <span className="text-secondary">{categoria?.label || 'Categoria'}</span>
        </h1>
        <p className="text-muted text-sm">
          Defina para onde os dados serão enviados (E-mail, Webhook ou ambos) quando uma denúncia desta categoria for recebida.
        </p>
      </div>

      <CategoryIntegrationForm 
        categoriaId={params.id} 
        initialIntegracao={integracao as any} 
      />
    </div>
  )
}
