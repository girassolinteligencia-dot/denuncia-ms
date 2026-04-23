import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { gerarPDFDenuncia } from '@/lib/pdf'
import { decryptData } from '@/lib/encrypt'

export async function GET(
  request: NextRequest
) {
  const searchParams = request.nextUrl.searchParams
  const protocolo = searchParams.get('protocolo')
  const chaveAcesso = searchParams.get('chave')

  if (!protocolo || !chaveAcesso) {
    return NextResponse.json({ error: 'Credenciais ausentes' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // 1. Validar e buscar denúncia com dados sensíveis
  const { data: denuncia, error } = await supabase
    .from('denuncias')
    .select(`
      *,
      categorias (label),
      identidades (*)
    `)
    .eq('protocolo', protocolo.toUpperCase())
    .eq('chave_acesso', chaveAcesso)
    .single()

  if (error || !denuncia) {
    return NextResponse.json({ error: 'Denúncia não encontrada ou chave inválida' }, { status: 404 })
  }

  // 2. Descriptografar dados do denunciante se houver identidade vinculada
  let nome = 'Cidadão Identificado'
  let email = ''
  let telefone = ''

  if (denuncia.identidades) {
    try {
      nome = await decryptData(denuncia.identidades.nome_cripto)
      email = await decryptData(denuncia.identidades.email_cripto)
      telefone = await decryptData(denuncia.identidades.telefone_cripto)
    } catch (e) {
      console.error('Erro ao descriptografar dados para o PDF:', e)
    }
  }

  // 3. Gerar o PDF
  try {
    const pdfBuffer = await gerarPDFDenuncia({
      protocolo: denuncia.protocolo,
      categoria: denuncia.categorias?.label || 'Geral',
      titulo: denuncia.titulo,
      descricao: denuncia.descricao_original,
      local: `${denuncia.local}, ${denuncia.numero || 'S/N'} - ${denuncia.bairro}, ${denuncia.cidade}`,
      data_ocorrido: denuncia.data_ocorrido,
      criado_em: denuncia.criado_at,
      nome,
      email,
      telefone,
      orgao_nome: 'Ouvidoria Geral do Estado'
    })

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=protocolo-${protocolo}.pdf`,
      },
    })
  } catch (e: any) {
    console.error('Erro na geração do PDF:', e)
    return NextResponse.json({ error: 'Erro ao gerar documento: ' + e.message }, { status: 500 })
  }
}
