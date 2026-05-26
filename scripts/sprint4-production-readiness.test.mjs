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

test('runbooks de producao existem e bloqueiam publicacao acidental', () => {
  assertFile('docs/PRODUCAO_RUNBOOK.md')
  assertFile('docs/STORAGE_E_SIGNED_URLS.md')
  assertFile('docs/MONITORAMENTO.md')

  const runbook = read('docs/PRODUCAO_RUNBOOK.md')

  assertIncludes(runbook, 'npm test', 'testes antes de deploy')
  assertIncludes(runbook, 'npm run lint', 'lint antes de deploy')
  assertIncludes(runbook, 'npm run typecheck', 'typecheck antes de deploy')
  assertIncludes(runbook, 'npm run build', 'build antes de deploy')
  assertIncludes(runbook, 'Backup', 'plano de backup')
  assertIncludes(runbook, 'Rollback', 'plano de rollback')
  assertIncludes(runbook, 'aprovacao explicita', 'bloqueio por aprovacao explicita')
})

test('revisao de storage registra signed URLs e validacao operacional dos buckets', () => {
  const storageDoc = read('docs/STORAGE_E_SIGNED_URLS.md')

  assertIncludes(storageDoc, 'signed URL temporaria', 'signed URLs para anexos')
  assertIncludes(storageDoc, 'Buckets privados', 'modelo de bucket privado')
  assertIncludes(storageDoc, 'createSignedUrl', 'plano de signed URLs')
  assertIncludes(storageDoc, 'denuncias', 'bucket de anexos sensiveis')
  assertIncludes(storageDoc, 'relatos-oficiais', 'bucket de PDFs sensiveis')
  assertIncludes(storageDoc, 'drop policy if exists "Public Access Denuncias"', 'SQL de remoção de policy pública')
  assertIncludes(storageDoc, 'set public = false', 'validação de bucket privado')
  assertIncludes(storageDoc, 'sem policies publicas de leitura', 'bloqueio operacional de producao')
})

test('monitoramento cobre filas, integracoes, cron e auditoria', () => {
  const monitoring = read('docs/MONITORAMENTO.md')

  assertIncludes(monitoring, 'despacho_queue', 'monitoramento da fila de despacho')
  assertIncludes(monitoring, 'log_integracoes', 'monitoramento de integracoes')
  assertIncludes(monitoring, '/api/cron/cleanup-storage', 'monitoramento do cron de limpeza')
  assertIncludes(monitoring, 'audit_log', 'monitoramento de auditoria')
  assertIncludes(monitoring, '30 minutos apos deploy', 'rotina pos-deploy')
})
