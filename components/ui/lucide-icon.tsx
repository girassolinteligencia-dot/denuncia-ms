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
    // Fallback caso o ícone não exista ou o nome esteja errado
    return <LucideIcons.HelpCircle {...props} />
  }

  return <IconComponent {...props} />
}
