# AGENTS.md

## Regra operacional

Este projeto esta em producao e e usado pela populacao. Durante os sprints locais, nao publicar deploy, nao rodar migrations em producao e nao executar scripts com service role contra o banco real sem autorizacao explicita.

> Status atual (23/05/2026): o diretório oficial é `c:\.MAIS\denuncia-ms`. A cópia `denuncia-ms-1` é obsoleta e deve ser ignorada.

## Vinculos oficiais

Tratar este workspace exclusivamente como **DenunciaMS / denunciams.com.br**.

| Servico | Valor correto |
|---|---|
| Pasta local autorizada | `C:\.MAIS\denuncia-ms` |
| GitHub repo | `github.com/girassolinteligencia-dot/denuncia-ms` |
| Git remote | `https://github.com/girassolinteligencia-dot/denuncia-ms.git` |
| Branch de producao | `main` |
| Vercel scope | `girassolinteligencia-8661s-projects` |
| Vercel project | `denuncia-ms` |
| Vercel projectId | `prj_EBKncVd1Jj7mWVUbsKcmW0FtnmIp` |
| Vercel orgId | `team_t6Os7ZBVkdwghLi5j3lV8Btb` |
| Producao | `https://www.denunciams.com.br` |
| Supabase project ref | `jntbmydqvacrjsbsvgml` |

Nunca usar, vincular ou fazer deploy deste projeto a Pulso Eleitoral MS, Voz Publica MS, OneTwoBrand, PE26 ou qualquer outro workspace.

## Ambiente seguro

- Trabalhar no diretorio `denuncia-ms`.
- Usar branch de trabalho antes de alterar codigo.
- Usar `.env.local` local ou staging, baseado em `.env.local.example`.
- Confirmar para qual Supabase as variaveis apontam antes de rodar Server Actions, scripts ou cron.
- Tratar `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, `RESEND_API_KEY`, `ENCRYPTION_KEY` e `CRON_SECRET` como secrets server-only.

## Vercel

Referencia informada do painel/projeto:

```txt
https://vercel.com/girassolinteligencia-8661s-projects?repo=https%3A%2F%2Fgithub.com%2Fgirassolinteligencia-dot%2Fdenuncia-ms
```

Esta referencia nao autoriza deploy. Antes de qualquer publicacao futura, validar branch, preview, variaveis, banco alvo e plano de rollback.

## Verificacoes antes de qualquer deploy futuro

- `npm ci`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- Validacao manual dos fluxos: login admin, denuncia publica, acompanhamento por protocolo, PDF, storage e despacho.

## Prioridade dos sprints

1. Estabilizacao e seguranca.
2. Saneamento tecnico.
3. Evolucao funcional.
4. Producao profissional com backup, monitoramento, rollback e documentacao final.
