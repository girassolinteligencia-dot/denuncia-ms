import React from 'react'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { BarChart3, Building2, Fingerprint, FolderTree, ShieldCheck } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase-admin'

export const metadata = {
  title: 'Transparência | DENUNCIA MS',
  description: 'Percentuais públicos de denuncias por categoria, município e tipo.',
}

type DenunciaResumo = {
  anonima: boolean | null
  municipio: string | null
  cidade: string | null
  categorias: { label: string | null } | { label: string | null }[] | null
}

type PercentItem = {
  label: string
  percentage: number
}

const formatPercent = (value: number) => `${Math.round(value)}%`

function getCategoriaLabel(row: DenunciaResumo) {
  const categoria = Array.isArray(row.categorias) ? row.categorias[0] : row.categorias
  return categoria?.label?.trim() || 'Categoria não informada'
}

function getMunicipioLabel(row: DenunciaResumo) {
  return row.municipio?.trim() || row.cidade?.trim() || 'Município não informado'
}

function toPercentItems(labels: string[], limit = 8): PercentItem[] {
  const total = labels.length
  if (total === 0) return []

  const counts = labels.reduce((acc: Record<string, number>, label) => {
    acc[label] = (acc[label] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, limit)
}

export default async function TransparenciaPage() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('denuncias')
    .select('anonima, municipio, cidade, categorias(label)')
    .order('criado_em', { ascending: false })

  if (error) {
    console.error('[transparencia] Erro ao carregar percentuais:', error)
  }

  const denuncias = (data || []) as DenunciaResumo[]
  const categorias = toPercentItems(denuncias.map(getCategoriaLabel))
  const municipios = toPercentItems(denuncias.map(getMunicipioLabel))
  const tipos = toPercentItems(
    denuncias.map((denuncia) => denuncia.anonima ? 'Denúncia Anônima' : 'Denúncia com Identificação'),
    2
  )

  return (
    <div className="min-h-screen bg-surface">
      <section className="bg-dark text-white py-12 sm:py-16 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="container-page relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">
            <ShieldCheck size={14} className="text-secondary" />
            Números da Cidadania
          </div>
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase italic">
              Números da <span className="text-secondary italic">Cidadania</span>
            </h1>
            <p className="text-white/50 text-sm sm:text-lg font-medium leading-relaxed">
              Aqui você acompanha como as denuncias se distribuem por tipo, categoria e lugar.
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-surface">
        <div className="container-page grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PercentCard
            title="Por categoria"
            description="Qual tipo de problema mais aparece? Aqui está o percentual de cada categoria recebida."
            icon={FolderTree}
            items={categorias}
          />
          <PercentCard
            title="Por município"
            description="Onde você vê mais denuncias chegar? Distribuição percentual por município informado."
            icon={Building2}
            items={municipios}
          />
          <PercentCard
            title="Por tipo"
            description="Quantas pessoas denunciam com nome? Quantas ficam anônimas? O equilíbrio entre os dois."
            icon={Fingerprint}
            items={tipos}
          />
        </div>
      </section>
    </div>
  )
}

function PercentCard({
  title,
  description,
  icon: Icon,
  items,
}: {
  title: string
  description: string
  icon: React.ElementType
  items: PercentItem[]
}) {
  return (
    <div className="bg-white border border-border rounded-[2rem] p-6 sm:p-8 shadow-sm min-h-[460px] flex flex-col">
      <div className="flex items-start justify-between gap-4 pb-6 border-b border-border/60">
        <div className="space-y-2">
          <h2 className="text-xl font-black text-dark uppercase tracking-tight italic">{title}</h2>
          <p className="text-xs text-muted font-medium leading-relaxed">{description}</p>
        </div>
        <div className="p-3 rounded-2xl bg-primary/5 text-primary border border-primary/10 shrink-0">
          <Icon size={24} />
        </div>
      </div>

      <div className="space-y-4 pt-6 flex-1">
        {items.length === 0 ? (
          <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center text-muted gap-3">
            <BarChart3 size={32} className="opacity-30" />
            <p className="text-xs font-black uppercase tracking-widest">Sem dados percentuais nesse momento.</p>
            <p className="text-[10px] text-muted/80 font-bold leading-relaxed max-w-xs">
              A plataforma mostra apenas percentuais públicos. Totais absolutos permanecem privados por questão de segurança.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between gap-4 text-xs font-black uppercase tracking-tight">
                <span className="text-dark truncate">{item.label}</span>
                <span className="text-primary shrink-0">{formatPercent(item.percentage)}</span>
              </div>
              <div className="h-2.5 rounded-full bg-surface overflow-hidden border border-border/60">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(item.percentage, 3)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <p className="text-[9px] text-muted/70 font-black uppercase tracking-widest leading-relaxed pt-6 mt-6 border-t border-border/60">
        A plataforma mostra apenas percentuais públicos. Totais absolutos permanecem privados por questão de segurança.
      </p>
    </div>
  )
}
