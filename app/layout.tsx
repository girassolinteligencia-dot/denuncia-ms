export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import './globals.css'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'DENUNCIA MS'
const APP_URL  = process.env.NEXT_PUBLIC_APP_URL  ?? 'https://denunciams.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — Plataforma Cívica Independente de Mato Grosso do Sul`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    'Registre denuncias de forma segura e identificada. Plataforma cívica independente de ouvidoria digital para cidadãos de Mato Grosso do Sul.',
  keywords: ['denuncia', 'ouvidoria independente', 'Mato Grosso do Sul', 'cidadania', 'transparência', 'inteligência cívica'],
  authors: [{ name: 'DENUNCIA MS (Iniciativa Independente)' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: APP_NAME,
    title: `${APP_NAME} — Ouvidoria Cívica Independente`,
    description: 'Registre denuncias de forma segura e identificada. Ouvidoria cívica independente.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} — Ouvidoria Digital`,
    description: 'Registre denuncias de forma segura e identificada em Mato Grosso do Sul.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: '/manifest.json',
}

import { Analytics } from "@vercel/analytics/react"
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google'
import { createAdminClient } from '@/lib/supabase-admin'
import { EmergencyScreen } from '@/components/public/emergency-screen'
import { headers } from 'next/headers'

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
})

import { Toaster } from 'sonner'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createAdminClient()
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''

  // Busca status de emergência
  const { data: configs } = await supabase
    .from('sistema_config')
    .select('chave, valor')
    .in('chave', ['status_emergencia', 'mensagem_emergencia'])
  
  const configMap = (configs || []).reduce((acc: Record<string, string>, cur) => {
    acc[cur.chave] = cur.valor
    return acc
  }, {})

  const isEmergency = configMap['status_emergencia'] === 'true'
  const emergencyMsg = configMap['mensagem_emergencia'] || ''
  const isAdminPath = pathname.startsWith('/admin')

  return (
    <html lang="pt-BR" className={`scroll-smooth ${outfit.variable} ${jakarta.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen font-sans antialiased">
        {isEmergency && !isAdminPath ? (
          <EmergencyScreen mensagem={emergencyMsg} />
        ) : (
          children
        )}
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}
