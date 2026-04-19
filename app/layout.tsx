import type { Metadata } from 'next'
import './globals.css'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'DENUNCIA MS'
const APP_URL  = process.env.NEXT_PUBLIC_APP_URL  ?? 'https://denunciams.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — Plataforma Cívica de Ouvidoria de Mato Grosso do Sul`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    'Registre denúncias de forma segura e anônima. Plataforma oficial de ouvidoria digital para cidadãos de Mato Grosso do Sul.',
  keywords: ['denúncia', 'ouvidoria', 'Mato Grosso do Sul', 'cidadania', 'transparência', 'MS'],
  authors: [{ name: 'DENUNCIA MS' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: APP_NAME,
    title: `${APP_NAME} — Ouvidoria Digital de Mato Grosso do Sul`,
    description: 'Registre denúncias de forma segura e anônima.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} — Ouvidoria Digital`,
    description: 'Registre denúncias de forma segura e anônima em Mato Grosso do Sul.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: '/manifest.json',
}

import { Analytics } from "@vercel/analytics/react"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
