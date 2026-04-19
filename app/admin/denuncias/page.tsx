import React from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { DenunciasListTable } from '@/components/admin/denuncias-list-table'
import { Filter, Search as SearchIcon } from 'lucide-react'

export const metadata = {
  title: 'Gestão de Denúncias | Painel Admin',
}

export default async function DenunciasAdminPage() {
  const supabase = createAdminClient()
  
  // Busca denúncias com categoria
  const { data: denuncias, error } = await supabase
    .from('denuncias')
    .select('*, categorias(label, emoji)')
    .order('criado_em', { ascending: false })

  if (error) {
    return <div className="p-8 text-error">Erro ao carregar denúncias: {error.message}</div>
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-dark tracking-tighter uppercase italic">Central de <span className="text-primary underline decoration-secondary decoration-4 underline-offset-4">Ocorrências</span></h1>
          <p className="text-muted text-sm font-medium">Visualize e processe as denúncias enviadas pelos cidadãos.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input 
                type="text" 
                placeholder="Buscar por protocolo..." 
                className="input pl-10 h-10 w-64 text-xs font-bold"
              />
           </div>
           <button className="btn-primary gap-2 h-10 bg-white border border-border text-dark hover:bg-surface shadow-none text-xs">
              <Filter size={16} />
              Filtros
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <StatCard label="Recebidas" value={denuncias?.filter(d => d.status === 'recebida').length || 0} color="text-primary" />
         <StatCard label="Em Análise" value={denuncias?.filter(d => d.status === 'em_analise').length || 0} color="text-info" />
         <StatCard label="Encaminhadas" value={denuncias?.filter(d => d.status === 'encaminhada').length || 0} color="text-secondary" />
         <StatCard label="Resolvidas" value={denuncias?.filter(d => d.status === 'resolvida').length || 0} color="text-success" />
      </div>

      <DenunciasListTable initialDenuncias={denuncias || []} />
    </div>
  )
}

function StatCard({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="bg-white p-6 rounded-card border border-border shadow-card hover:shadow-card-md transition-all">
       <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">{label}</p>
       <p className={`text-3xl font-black ${color} tracking-tighter`}>{value}</p>
    </div>
  )
}
