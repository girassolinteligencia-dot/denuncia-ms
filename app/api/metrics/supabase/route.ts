import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * API para buscar métricas do Supabase e converter de Prometheus para JSON.
 * Versão otimizada conforme solicitação do usuário.
 */
export async function GET(request: Request) {
  // Mantendo a proteção por x-cron-secret solicitada anteriormente para segurança
  const cronSecret = request.headers.get('x-cron-secret');
  if (process.env.NODE_ENV === 'production' && cronSecret !== process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jntbmydqvacrjsbsvgml.supabase.co';
  const url = `${supabaseUrl}/customer/v1/privileged/metrics`;
  const secret = process.env.SUPABASE_SECRET_KEY;
  
  if (!secret) {
    return NextResponse.json({ error: 'SUPABASE_SECRET_KEY not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`service_role:${secret}`).toString('base64')
      },
      next: { revalidate: 30 }
    });

    if (!res.ok) {
      throw new Error(`Supabase API error: ${res.status} ${res.statusText}`);
    }

    const text = await res.text();
    
    // Parseia formato Prometheus
    const metrics: Record<string, number> = {};
    for (const line of text.split('\n')) {
      if (line.startsWith('#') || !line.trim()) continue;
      
      const parts = line.split(' ');
      if (parts.length >= 2) {
        // Pega o nome da métrica removendo labels entre chaves
        const name = parts[0].split('{')[0];
        // O valor é sempre a última parte da linha
        const value = parseFloat(parts[parts.length - 1]);
        if (!isNaN(value)) {
          // Se houver múltiplas instâncias da mesma métrica, somamos
          metrics[name] = (metrics[name] || 0) + value;
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      conexoes: metrics['pg_stat_database_numbackends'] || 0,
      tamanho_mb: Math.round((metrics['pg_database_size_bytes'] || 0) / 1024 / 1024),
      cpu: metrics['process_cpu_seconds_total'] || 0,
      commits: metrics['pg_stat_database_xact_commit'] || 0,
    });
  } catch (error: any) {
    console.error('Metrics fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
