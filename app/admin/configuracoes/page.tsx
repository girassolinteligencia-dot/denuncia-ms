import { getConfigsByPrefix } from '@/lib/config'
import { UnifiedConfigTabs } from '@/components/admin/config/unified-config-tabs'

export const metadata = {
  title: 'Configurações e Governança | Painel Admin',
}

export default async function ConfiguracoesGeraisPage() {
  let initialConfigs = {}
  
  try {
    const identidades = await getConfigsByPrefix('identidade')
    const cores = await getConfigsByPrefix('cores')
    const funcionalidade = await getConfigsByPrefix('funcionalidade')
    initialConfigs = { ...identidades, ...cores, ...funcionalidade }
  } catch (err) {
    console.error('Erro ao buscar configurações iniciais:', err)
  }

  return (
    <div className="space-y-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 italic">
            Módulo de Governança Integrada
          </div>
          <h1 className="text-3xl font-black text-dark tracking-tighter uppercase italic">
            Configurações do <span className="text-primary underline decoration-secondary decoration-8 underline-offset-4">Sistema</span>
          </h1>
        </div>
      </div>

      <UnifiedConfigTabs initialConfigs={initialConfigs} />
    </div>
  )
}
