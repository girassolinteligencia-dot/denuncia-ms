
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

const updates = [
  { slug: 'saude-publica', emoji: '🏥' },
  { slug: 'falta-medicamentos', emoji: '💊' },
  { slug: 'irregularidade-upa', emoji: '🚑' },
  { slug: 'vigilancia-sanitaria', emoji: '🧼' },
  { slug: 'buracos-vias', emoji: '🕳️' },
  { slug: 'iluminacao-publica', emoji: '💡' },
  { slug: 'obra-irregular', emoji: '🚧' },
  { slug: 'alagamento-drenagem', emoji: '🌊' },
  { slug: 'transporte-publico', emoji: '🚌' },
  { slug: 'desmatamento', emoji: '🌿' },
  { slug: 'maus-tratos-animais', emoji: '🐾' },
  { slug: 'descarte-lixo', emoji: '♻️' },
  { slug: 'poluicao', emoji: '🏭' },
  { slug: 'poluicao-sonora', emoji: '🔊' },
  { slug: 'escola-precaria', emoji: '🎓' },
  { slug: 'merenda-irregular', emoji: '🍽️' },
  { slug: 'falta-professor', emoji: '📚' },
  { slug: 'corrupcao-desvio', emoji: '⚖️' },
  { slug: 'nepotismo', emoji: '👥' },
  { slug: 'improbidade', emoji: '📋' },
  { slug: 'licitacao-fraudulenta', emoji: '🏗️' },
  { slug: 'servidor-inativo', emoji: '🪑' },
  { slug: 'trafico-drogas', emoji: '🚓' },
  { slug: 'porte-armas', emoji: '🔫' },
  { slug: 'ponto-vulnerabilidade', emoji: '👁️' },
  { slug: 'ocupacao-irregular', emoji: '🏚️' },
  { slug: 'crianca-risco', emoji: '👶' },
  { slug: 'idoso-risco', emoji: '👴' },
  { slug: 'acessibilidade-negada', emoji: '♿' },
  { slug: 'familia-vulnerabilidade', emoji: '🏠' },
  { slug: 'violencia-domestica', emoji: '🚨' },
  { slug: 'feminicidio-ameaca', emoji: '👩' },
  { slug: 'discriminacao', emoji: '🏳️' }
]

async function runUpdates() {
  for (const update of updates) {
    const { error } = await supabase
      .from('categorias')
      .update({ icon_name: update.emoji })
      .eq('slug', update.slug)
    
    if (error) {
      console.error(`Error updating ${update.slug}:`, error)
    } else {
      console.log(`Updated ${update.slug} to ${update.emoji}`)
    }
  }
}

runUpdates()
