import React from 'react'
import * as LucideIcons from 'lucide-react'
import { LucideProps } from 'lucide-react'

interface LucideIconProps extends LucideProps {
  name: string
}

export const LucideIcon = ({ name, ...props }: LucideIconProps) => {
  // @ts-ignore - Dinamicamente acessando o componente pelo nome vindo do banco
  const IconComponent = LucideIcons[name]

  if (!IconComponent) {
    // Se não for um ícone do Lucide, renderiza como texto (provavelmente emoji)
    // Mantemos a classe e o tamanho para consistência visual
    // Adicionamos famílias de fontes específicas para emojis para evitar o '?'
    return (
      <span 
        className={props.className} 
        style={{ 
          fontSize: props.size || 24, 
          lineHeight: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif',
          WebkitFontSmoothing: 'antialiased'
        }}
      >
        {name}
      </span>
    )
  }

  return <IconComponent {...props} />
}

