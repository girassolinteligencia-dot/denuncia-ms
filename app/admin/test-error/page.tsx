export const dynamic = 'force-dynamic'
import { createAdminClient } from '@/lib/supabase-admin'

export default async function TestErrorPage() {
  const supabase = createAdminClient()
  
  try {
    const { data, error } = await supabase
      .from('denuncias')
      .select('*, categorias(label, icon_name)')
      .limit(1)
    
    if (error) {
      return (
        <div className="p-20">
          <h1 className="text-red-500 font-bold">REPRODUCED ERROR:</h1>
          <pre className="bg-gray-100 p-4 mt-4">{JSON.stringify(error, null, 2)}</pre>
        </div>
      )
    }
    
    return (
      <div className="p-20">
        <h1 className="text-green-500 font-bold">SUCCESS!</h1>
        <pre className="bg-gray-100 p-4 mt-4">{JSON.stringify(data, null, 2)}</pre>
      </div>
    )
  } catch (e: any) {
    return (
      <div className="p-20">
        <h1 className="text-orange-500 font-bold">CATCH ERROR:</h1>
        <pre className="bg-gray-100 p-4 mt-4">{e.message}</pre>
      </div>
    )
  }
}
