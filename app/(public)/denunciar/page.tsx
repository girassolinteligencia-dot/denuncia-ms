import React from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { DenunciaFormWizard } from '@/components/public/denuncia-form-wizard'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'

export const metadata = {
  title: 'Realizar Denúncia',
  description: 'Canal seguro para registro de denúncias e irregularidades no Mato Grosso do Sul.',
}

export default async function DenunciarPage() {
  let categorias: any[] = []
  let campos: any[] = []
  let politicasArquivo: any[] = []
  let errorMsg = ''

  try {
    const supabase = createAdminClient()
    
    // Busca todos os parâmetros necessários do Módulo 0
    const [catRes, camposRes, politicasRes] = await Promise.all([
      supabase.from('categorias').select('*').eq('ativo', true).order('ordem'),
      supabase.from('config_campos_formulario').select('*').order('ordem'),
      supabase.from('config_tipos_arquivo').select('*')
    ])

    if (catRes.error) throw new Error(`Erro categorias: ${catRes.error.message}`)
    if (camposRes.error) throw new Error(`Erro campos: ${camposRes.error.message}`)
    if (politicasRes.error) throw new Error(`Erro politicas: ${politicasRes.error.message}`)

    categorias = catRes.data || []
    campos = camposRes.data || []
    politicasArquivo = politicasRes.data || []

    if (categorias.length === 0) {
      errorMsg = 'Nenhuma categoria ativa encontrada no banco de dados.'
    }
  } catch (e: any) {
    console.error('Erro crítico no render da página:', e)
    errorMsg = e.message || 'Erro ao carregar configurações do sistema. Verifique as variáveis de ambiente.'
  }

  if (errorMsg) {
    return (
      <div className="bg-surface min-h-screen py-20">
        <div className="container-page text-center space-y-4">
          <h1 className="text-2xl font-black text-dark">Serviço Temporariamente Indisponível</h1>
          <p className="text-muted">{errorMsg}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface min-h-screen py-12 sm:py-20">
      
      <div className="container-page">
        
        <div className="text-center mb-12 space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black text-dark tracking-tighter uppercase italic">
             Canal de <span className="text-primary">Denúncia</span>
          </h1>
          <p className="text-muted max-w-xl mx-auto text-sm">
             Suas informações serão analisadas com critério e sigilo. 
             Preencha o formulário abaixo para gerar seu protocolo de acompanhamento.
          </p>
        </div>

        <Suspense fallback={
          <div className="flex flex-col items-center justify-center p-20 gap-4 bg-white rounded-card shadow-card">
            <Loader2 size={40} className="animate-spin text-primary" />
            <p className="text-muted font-black text-xs uppercase tracking-widest">Preparando Formulário Seguro...</p>
          </div>
        }>
          <DenunciaFormWizard 
            categorias={categorias} 
            campos={campos} 
            politicasArquivo={politicasArquivo} 
          />
        </Suspense>
      </div>
    </div>
  )
}
