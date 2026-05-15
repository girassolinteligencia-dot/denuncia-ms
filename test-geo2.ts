import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function testGeo() {
  const { data, error } = await supabase.from('denuncias').select('id, latitude, longitude, municipio, local, bairro, cidade').limit(50)
  if (error) {
    console.error(error)
  } else {
    const valid = data.filter(d => d.latitude !== null && d.longitude !== null)
    const invalid = data.filter(d => d.latitude === null || d.longitude === null)
    console.log(`Total: ${data.length}`)
    console.log(`Com coordenadas: ${valid.length}`)
    console.log(`Sem coordenadas: ${invalid.length}`)
    
    if (invalid.length > 0) {
      console.log('Sample sem coordenadas:', invalid[0])
    }
  }
}
testGeo()
