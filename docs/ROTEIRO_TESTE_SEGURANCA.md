# Roteiro de Teste - Segurança e Refatoramento

Use este roteiro para validar localmente ou em preview. Nao execute deploy de producao a partir deste arquivo.

## 1. Validacao automatizada

No diretorio `denuncia-ms-1`:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Resultado esperado:

- Testes passam.
- Typecheck passa.
- Build passa.
- Lint pode exibir warnings conhecidos de `any` e `<img>`, mas nao deve falhar.

## 2. Checklist de ambiente

Antes de testar fluxo real:

- `NEXT_PUBLIC_SUPABASE_URL` aponta para ambiente local/staging.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ou publishable key esta configurada.
- `SUPABASE_SERVICE_ROLE_KEY` existe apenas server-side.
- `RESEND_API_KEY`, `EMAIL_FROM` e `EMAIL_REPLY_TO` estao configurados no ambiente de teste.
- `ENCRYPTION_KEY` tem 32 bytes em hex.
- `CRON_SECRET` esta definido para rotas cron.

Nao usar service role de producao em teste local.

## 3. Checklist de storage

No Supabase alvo de teste:

- Bucket `denuncias` existe.
- Bucket `relatos-oficiais` existe.
- Ambos estao privados.
- Nao existem policies publicas de leitura para esses buckets.
- Upload server-side com service role funciona.
- Signed URL temporaria abre anexo no admin.

SQL de referencia para ambiente de teste/staging:

```sql
drop policy if exists "Public Access Denuncias" on storage.objects;
drop policy if exists "Public Access Relatos" on storage.objects;

update storage.buckets
set public = false
where id in ('denuncias', 'relatos-oficiais');
```

Nao aplicar em producao sem backup e aprovacao explicita.

## 4. Fluxo publico

Validar:

1. Abrir `/`.
2. Abrir `/denunciar`.
3. Selecionar uma categoria ativa.
4. Preencher dados obrigatorios.
5. Solicitar OTP.
6. Validar OTP.
7. Anexar imagem ou PDF pequeno.
8. Enviar denuncia.
9. Confirmar redirecionamento para `/sucesso`.
10. Copiar protocolo e chave.

Resultado esperado:

- Upload de anexo funciona.
- Protocolo e chave sao gerados.
- Denuncia nao retorna sucesso se falhar identidade, PDF, assinatura ou fila de despacho.

## 5. Acompanhamento e PDF

Validar:

1. Abrir `/acompanhar`.
2. Consultar com protocolo e chave.
3. Baixar PDF, se a pagina expuser a acao.

Resultado esperado:

- Consulta exige protocolo + chave.
- PDF e gerado server-side.
- Dados pessoais nao ficam em URL publica permanente.

## 6. Painel admin

Validar:

1. Abrir `/admin`.
2. Confirmar redirecionamento para login quando nao autenticado.
3. Entrar com usuario admin/staging.
4. Abrir `/admin/denuncias`.
5. Abrir detalhe da denuncia enviada.
6. Abrir anexos.

Resultado esperado:

- `/admin` e protegido server-side.
- Anexos abrem por signed URL temporaria.
- Dados de identidade aparecem apenas para admin autorizado.
- Acesso a PII gera auditoria quando aplicavel.

## 7. Encaminhamento

Validar:

1. Configurar mais de uma integracao ativa em uma categoria.
2. Incluir integracoes do tipo `email` e `ambos`.
3. Enviar denuncia nessa categoria.
4. Acionar worker/cron em ambiente de teste, se configurado.
5. Conferir `despacho_queue` e `log_integracoes`.

Resultado esperado:

- Destinatarios de todas as integracoes ativas sao agregados.
- Tipo `ambos` nao e ignorado.
- Fila registra despacho pendente/processado.
- Falhas ficam visiveis em admin/saude ou integracoes.

## 8. Nao testar em producao ainda

Antes de producao real:

- Gerar backup.
- Validar preview.
- Confirmar rollback.
- Confirmar buckets privados.
- Confirmar aprovacao explicita.
