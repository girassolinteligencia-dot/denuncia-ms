import React from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { DenunciaFormWizard } from '@/components/public/denuncia-form-wizard'
import { Megaphone, Loader2 } from 'lucide-react'
import { Suspense } from 'react'

export const metadata = {
  title: 'Realizar Denúncia',
  description: 'Canal seguro para registro de denúncias e irregularidades no Mato Grosso do Sul.',
}

export default async function DenunciarPage() {
  const supabase = createAdminClient()
  
  // Busca todos os parâmetros necessários do Módulo 0
  const [
    { data: categorias },
    { data: campos },
    { data: politicasArquivo }
  ] = await Promise.all([
    supabase.from('categorias').select('*').eq('ativo', true).order('ordem'),
    supabase.from('config_campos_formulario').select('*').order('ordem'),
    supabase.from('config_tipos_arquivo').select('*')
  ])

  return (
    <div className="bg-surface min-h-screen py-12 sm:py-20 overflow-hidden relative">
      
      {/* Background Decorativo */}
      <div className="absolute top-0 right-0 w-1/3 h-screen bg-primary/5 -skew-x-12 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-secondary/5 skew-x-12 -translate-x-1/2"></div>

      <div className="container-page relative z-10">
        
        <div className="text-center mb-16 space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-glow-cyan border border-border flex items-center justify-center text-primary mx-auto mb-6">
             <Megaphone size={32} className="fill-primary" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-dark tracking-tighter uppercase italic">
             Canal de <span className="text-primary underline decoration-secondary decoration-4 underline-offset-8">Denúncia</span>
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
            categorias={categorias || []} 
            campos={campos || []} 
            politicasArquivo={politicasArquivo || []} 
          />
        </Suspense>
      </div>
    </div>
  )
}
