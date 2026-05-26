import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8')
}

function assertFile(relativePath) {
  assert.equal(existsSync(join(root, relativePath)), true, `${relativePath} deve existir`)
}

function assertIncludes(source, text, label = text) {
  assert.ok(source.includes(text), `Contrato ausente: ${label}`)
}

test('auth OTP guarda hash, expiração e uso único', () => {
  const auth = read('lib/actions/auth.ts')

  assertIncludes(auth, "createHash('sha256')", 'hash SHA-256 para OTP/e-mail')
  assertIncludes(auth, 'email_hash', 'e-mail persistido como hash')
  assertIncludes(auth, '.eq(\'is_used\', false)', 'token usado uma única vez')
  assertIncludes(auth, '.gte(\'expires_at\'', 'bloqueio de token expirado')
  assertIncludes(auth, 'randomInt(100000, 999999)', 'código OTP numérico de 6 dígitos')
})

test('denuncia valida entrada, protege PII e usa integração de destino', () => {
  assertFile('lib/validations/denuncia.ts')

  const action = read('lib/actions/denuncia.ts')
  const validation = read('lib/validations/denuncia.ts')

  assertIncludes(validation, 'submitDenunciaSchema', 'schema Zod da denuncia')
  assertIncludes(validation, 'arquivosVinculadosSchema', 'schema Zod de arquivos')
  assertIncludes(action, 'submitDenunciaSchema.safeParse', 'validação da denuncia antes de gravar')
  assertIncludes(action, 'arquivosVinculadosSchema.safeParse', 'validação dos arquivos antes de gravar')
  assertIncludes(action, "from('identidades')", 'PII gravada fora da tabela denuncias')
  assertIncludes(action, 'encryptData', 'PII criptografada')
  assertIncludes(action, "from('integracoes_destino')", 'destino via integração por categoria')
  assertIncludes(action, ".order('criado_em'", 'integrações ordenadas de forma determinística')
  assertIncludes(action, 'flatMap(integracao => integracao.email_para || [])', 'todas as integrações ativas são agregadas')
  assertIncludes(action, 'Erro em processamento crítico; protocolo não será entregue', 'falha crítica impede sucesso')
  assertIncludes(action, 'Marca OTP como usado apenas após o registro estar completo', 'OTP consumido só após persistência crítica')
  assert.equal(action.includes('email_destino'), false, 'fluxo não deve depender de categorias.email_destino')
  assert.equal(action.includes('.limit(1)\n      .maybeSingle()'), false, 'não deve selecionar integração arbitrária')
  assert.equal(action.includes('Erro em processo secundário não crítico'), false, 'identidade/PDF/fila não podem ser tratados como não críticos')
})

test('worker de despacho agrega todas as integrações de e-mail ativas', () => {
  const webhook = read('lib/webhook.ts')

  assertIncludes(webhook, ".in('tipo', ['email', 'ambos'])", 'worker considera integrações email e ambos')
  assertIncludes(webhook, ".order('criado_em'", 'worker ordena integrações de forma determinística')
  assertIncludes(webhook, 'flatMap(integracao => integracao.email_para || [])', 'worker agrega destinatários de todas as integrações')
  assert.equal(webhook.includes(".eq('tipo', 'email')"), false, 'worker não deve ignorar integrações do tipo ambos')
  assert.equal(webhook.includes('.limit(1)\n        .maybeSingle()'), false, 'worker não deve escolher integração arbitrária')
})

test('storage sensivel usa signed URLs e bucket_path, nao URL publica permanente', () => {
  const action = read('lib/actions/denuncia.ts')
  const storage = read('lib/storage.ts')
  const admin = read('lib/actions/admin-denuncias.ts')

  assertIncludes(storage, 'createSignedUrl', 'helper central de signed URL')
  assertIncludes(action, "criarSignedUrl('denuncias', path)", 'upload de anexo retorna signed URL')
  assertIncludes(action, 'url: f.bucket_path', 'banco persiste caminho do bucket para anexo sensível')
  assertIncludes(action, 'url_storage: pdfPath', 'assinatura do PDF persiste caminho do bucket')
  assertIncludes(action, ".from('denuncias')\n            .download(f.bucket_path)", 'e-mail baixa anexo server-side por bucket_path')
  assertIncludes(admin, "criarSignedUrl('denuncias'", 'admin recebe signed URL temporária')
  assert.equal(action.includes("getPublicUrl(path)"), false, 'anexos não devem usar getPublicUrl')
  assert.equal(action.includes("getPublicUrl(pdfPath)"), false, 'PDF oficial não deve usar getPublicUrl')
})

test('paginas publicas leem configuracoes server-side sem depender de RLS anonima', () => {
  const files = [
    'app/layout.tsx',
    'app/(public)/layout.tsx',
    'app/(public)/page.tsx',
    'app/(public)/denunciar/page.tsx',
    'app/(public)/transparencia/page.tsx',
  ]

  for (const file of files) {
    const source = read(file)
    assertIncludes(source, 'createAdminClient', `${file} usa leitura server-side para config`)
  }
})

test('acompanhamento exige protocolo, chave e rate limit', () => {
  const consulta = read('lib/actions/consulta.ts')

  assertIncludes(consulta, "from('logs_acesso_denuncia')", 'log de tentativas de acesso')
  assertIncludes(consulta, ".eq('protocolo'", 'consulta por protocolo')
  assertIncludes(consulta, ".eq('chave_acesso'", 'consulta por chave de acesso')
  assertIncludes(consulta, 'tentativasRecentes.length >= 5', 'limite de tentativas falhas')
  assertIncludes(consulta, 'Protocolo ou Chave de Acesso incorretos.', 'erro genérico para credenciais inválidas')
})

test('PDF oficial gera Buffer e registra assinatura SHA-256 no fluxo', () => {
  const pdf = read('lib/pdf.ts')
  const denuncia = read('lib/actions/denuncia.ts')

  assertIncludes(pdf, 'export async function gerarPDFDenuncia', 'gerador oficial de PDF')
  assertIncludes(pdf, 'new jsPDF()', 'PDF gerado via jsPDF')
  assertIncludes(pdf, 'return Buffer.from(arrayBuffer)', 'retorno em Buffer')
  assertIncludes(denuncia, "from('pdf_assinaturas')", 'assinatura registrada')
  assertIncludes(denuncia, "createHash('sha256').update(pdfBuffer).digest('hex')", 'hash SHA-256 do PDF')
})

test('admin exige autenticação/role no servidor', () => {
  const layout = read('app/admin/layout.tsx')
  const auth = read('lib/admin-auth.ts')

  assertIncludes(layout, 'await requireAdminPage()', 'layout admin protegido no servidor')
  assertIncludes(auth, 'supabase.auth.getUser()', 'sessão validada via Supabase Auth')
  assertIncludes(auth, 'ADMIN_ROLES', 'roles administrativas centralizadas')
  assertIncludes(auth, 'requireAdminAction', 'guard para server actions administrativas')
})

test('rotas principais existem para smoke local', () => {
  const routes = [
    'app/(public)/page.tsx',
    'app/(public)/denunciar/page.tsx',
    'app/(public)/acompanhar/page.tsx',
    'app/(public)/acompanhar/[protocolo]/page.tsx',
    'app/(public)/transparencia/page.tsx',
    'app/admin/layout.tsx',
    'app/admin/denuncias/page.tsx',
    'app/api/pdf/download/route.ts',
  ]

  for (const route of routes) {
    assertFile(route)
  }
})
