'use client'

import React from 'react'

interface CategoryData {
  label: string
  percentage: number
}

const CATEGORY_COLORS = ['#1535C9', '#F5C800', '#14B8A6', '#F97316', '#8B5CF6']
const CATEGORY_POSITIONS = [
  { x: 118, y: 80 },
  { x: 260, y: 108 },
  { x: 205, y: 190 },
  { x: 125, y: 295 },
  { x: 275, y: 330 },
]

export const MSTransparencyCategoryMap = ({ data }: { data: CategoryData[] }) => {
  const categories = data.slice(0, 5)

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.95fr] items-start">
      <div className="rounded-[3rem] border border-border bg-surface/90 p-6 shadow-inner">
        <div className="text-xs font-black uppercase tracking-[0.35em] text-muted mb-4">Mapa de transparência sem nomes de municípios</div>
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#eef2ff] p-4">
          <div className="aspect-[4/4.5] w-full rounded-[2rem] overflow-hidden bg-white/80 shadow-inner border border-white/10">
            <svg viewBox="0 0 400 450" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="15" y="20" width="370" height="410" rx="36" fill="#e8efff" />
              {categories.map((category, index) => {
                const point = CATEGORY_POSITIONS[index] || { x: 200, y: 220 }
                const radius = 10 + Math.min(50, category.percentage * 0.35)
                const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                return (
                  <g key={category.label}>
                    <circle cx={point.x} cy={point.y} r={radius} fill={color} fillOpacity="0.18" />
                    <circle cx={point.x} cy={point.y} r={Math.max(4, radius * 0.35)} fill={color} fillOpacity="0.9" />
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[2rem] border border-border bg-white/80 p-6 shadow-sm">
          <div className="text-[11px] font-black uppercase tracking-[0.35em] text-dark/60 mb-4">Composição percentual por categoria</div>
          <div className="space-y-3">
            {categories.length > 0 ? categories.map((category, index) => (
              <div key={category.label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} />
                  <span className="text-sm font-bold text-dark">{category.label}</span>
                </div>
                <span className="text-sm font-black text-dark">{Math.round(category.percentage)}%</span>
              </div>
            )) : (
              <p className="text-sm text-muted">Nenhuma categoria disponível no momento.</p>
            )}
          </div>
        </div>
        <div className="rounded-[2rem] border border-border bg-surface/90 p-6 shadow-inner">
          <p className="text-sm text-dark/70 leading-relaxed">
            Os pontos no mapa representam a intensidade relacional de categorias em Mato Grosso do Sul. Não há identificação de municípios, apenas uma visão de distribuição territorial anônima.
          </p>
        </div>
      </div>
    </div>
  )
}
