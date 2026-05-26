# Runbook de Producao - DENUNCIA MS

Este runbook existe para preparar deploy profissional sem acionar producao por acidente.

Regra principal: nenhum deploy, migration, alteracao de variavel ou script com service role deve ser executado contra producao sem aprovacao explicita, plano de rollback e janela operacional.

## 1. Pre-flight obrigatorio

Executar localmente, no diretorio `denuncia-ms`:

```bash
npm ci
npm test
npm run lint
npm run typecheck
npm run build
```

Antes de qualquer preview ou publicacao:

- Confirmar branch de trabalho e revisar diff.
- Confirmar que `.env.local` nao aponta para Supabase de producao durante testes locais.
- Confirmar que `NEXT_PUBLIC_SUPABASE_URL` aponta para o ambiente esperado.
- Confirmar que `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, `RESEND_API_KEY`, `ENCRYPTION_KEY` e `CRON_SECRET` nao aparecem com prefixo `NEXT_PUBLIC`.
- Confirmar que migrations pendentes foram revisadas e que nao serao aplicadas em producao sem backup.
- Confirmar que buckets `denuncias` e `relatos-oficiais` estao privados e sem policies publicas de leitura.
- Confirmar que o fluxo manual passou em ambiente local/staging: login admin, denuncia publica, acompanhamento por protocolo, PDF, storage e despacho.

## 2. Deploy controlado

Deploy permitido apenas apos aprovacao explicita.

Checklist de execucao:

1. Gerar backup antes de qualquer alteracao de banco.
2. Registrar commit/branch que sera publicado.
3. Validar variaveis no painel da Vercel sem editar valores durante a checagem.
4. Publicar primeiro em preview quando aplicavel.
5. Executar smoke manual no preview.
6. Publicar em producao somente se preview estiver aprovado.
7. Acompanhar logs e metricas por pelo menos 30 minutos apos publicacao.

Comandos de deploy nao devem ser automatizados neste repositorio enquanto o projeto estiver em uso pela populacao.

## 3. Rollback

Rollback deve estar pronto antes do deploy.

Plano minimo:

- Identificar o deployment anterior estavel na Vercel.
- Confirmar que as variaveis de ambiente nao foram alteradas.
- Confirmar se houve migration. Se houve, rollback de app pode nao ser suficiente.
- Se apenas codigo mudou: promover novamente o deployment anterior estavel.
- Se banco mudou: restaurar backup ou aplicar migration reversa previamente revisada.
- Registrar incidente com horario, causa provavel, acao executada e validacao pos-rollback.

Nunca improvisar rollback de banco em producao sem backup validado.

## 4. Backup

Antes de qualquer mudanca de producao:

- Exportar dump logico do Postgres ou usar backup/snapshot do provedor.
- Confirmar que o backup contem `public`, funcoes, policies, triggers e dados criticos.
- Registrar horario, ambiente, responsavel e local seguro do artefato.
- Nao armazenar dumps com PII em diretorios versionados.
- Testar restauracao em ambiente isolado quando houver mudanca estrutural relevante.

Tabelas particularmente sensiveis:

- `denuncias`
- `identidades`
- `pdf_assinaturas`
- `despacho_queue`
- `auth_tokens`
- `profiles`
- `audit_log`
- `log_integracoes`

## 5. Monitoramento

Monitorar apos deploy e em rotina operacional:

- Erros 5xx em rotas publicas e `/api/*`.
- Falhas no worker `/api/worker/despacho`.
- Falhas no cron `/api/cron/cleanup-storage`.
- Crescimento de `despacho_queue` com status `erro` ou `falha_definitiva`.
- Falhas recentes em `log_integracoes`.
- Tentativas bloqueadas em `logs_acesso_denuncia`.
- Crescimento incomum em Storage.
- Erros de Resend e limites de anexo.

O logger local em `lib/logger.ts` padroniza escopo, mensagem e contexto. Para producao, a camada de captura pode ser conectada a um provedor externo sem alterar os fluxos principais.

## 6. Criterios de publicacao

Publicar somente se todos forem verdadeiros:

- Suite local verde.
- Preview validado manualmente.
- Backup registrado.
- Rollback definido.
- Variaveis conferidas.
- Storage revisado.
- Buckets sensiveis validados como privados.
- Aprovacao explicita recebida.

Se qualquer item falhar, nao publicar.
