'use client'
import React, { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { Search, X } from 'lucide-react'

// Lista curada de ícones populares e relevantes para o sistema
const POPULAR_ICONS = [
  'Hospital', 'Construction', 'ShieldAlert', 'Trash2', 'Trees', 'Scale', 'Droplets', 
  'Zap', 'Bus', 'School', 'HardHat', 'Stethoscope', 'AlertCircle', 'Flag', 
  'Leaf', 'CloudRain', 'Flame', 'Volume2', 'Users', 'Heart', 'Gavel', 'FileText',
  'Briefcase', 'Hammer', 'Wrench', 'Lightbulb', 'MapPin', 'Phone', 'ShoppingBag',
  'Car', 'Truck', 'Bike', 'Wind', 'Sun', 'Moon', 'Mountain', 'Waves', 'Baby',
  'Dog', 'Cat', 'Bird', 'Fish', 'Bug', 'Landmark', 'Church', 'Bypass', 'Shield'
]

interface IconPickerProps {
  currentIcon: string
  onSelect: (iconName: string) => void
}

export const IconPicker: React.FC<IconPickerProps> = ({ currentIcon, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filteredIcons = POPULAR_ICONS.filter(name => 
    name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const IconComponent = (LucideIcons as any)[currentIcon] || LucideIcons.FolderOpen

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl hover:border-primary transition-all group w-full"
      >
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
          <IconComponent size={24} />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black text-muted uppercase tracking-widest">Ícone Selecionado</p>
          <p className="text-sm font-bold text-dark">{currentIcon || 'Selecione...'}</p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[300px] bg-white border border-border shadow-2xl rounded-2xl z-[110] animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                type="text"
                placeholder="Pesquisar ícones..."
                className="input pl-10 h-10 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="p-2 grid grid-cols-5 gap-1 max-h-[300px] overflow-y-auto scrollbar-hide">
            {filteredIcons.map((iconName) => {
              const IconItem = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => {
                    onSelect(iconName)
                    setIsOpen(false)
                  }}
                  className={`p-3 rounded-lg flex items-center justify-center transition-all hover:bg-primary-50 hover:text-primary ${
                    currentIcon === iconName ? 'bg-primary text-white shadow-lg' : 'text-muted'
                  }`}
                  title={iconName}
                >
                  <IconItem size={20} />
                </button>
              )
            })}
          </div>

          {filteredIcons.length === 0 && (
            <div className="p-8 text-center text-xs text-muted italic">
              Nenhum ícone encontrado.
            </div>
          )}

          <div className="p-3 border-t border-border bg-surface rounded-b-2xl">
             <p className="text-[9px] font-bold text-muted uppercase text-center tracking-widest">
                Sugestões de Identidade Visual MS
             </p>
          </div>
        </div>
      )}
    </div>
  )
}
