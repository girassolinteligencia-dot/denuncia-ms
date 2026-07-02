# AGENTS.md

## Regra operacional

Este projeto esta em producao e e usado pela populacao. Durante os sprints locais, nao publicar deploy, nao rodar migrations em producao e nao executar scripts com service role contra o banco real sem autorizacao explicita.

> Status atual (23/05/2026): o diretório oficial é `c:\.MAIS\denuncia-ms`. A cópia `denuncia-ms-1` é obsoleta e deve ser ignorada.
> Atualizacao (02/07/2026): ultimas alteracoes publicadas em producao no commit `a21d2cd` (`Add public location and role imports`).

## Vinculos oficiais

Tratar este workspace exclusivamente como **DenunciaMS / denunciams.com.br**.

| Servico | Valor correto |
|---|---|
| Pasta local autorizada | `C:\.MAIS\denuncia-ms` |
| Conta oficial GitHub/Vercel | `girassolinteligencia@gmail.com` |
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

Este projeto deve permanecer definitivamente vinculado às contas GitHub e Vercel associadas a `girassolinteligencia@gmail.com`. Antes de autenticar, publicar, relinkar `.vercel`, alterar remotes ou promover deploy, confirmar que a conta ativa corresponde a esse vínculo oficial.

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

Observacao em 02/07/2026: `npm run build` passou para o commit `a21d2cd`. `npm run lint` e `npx tsc --noEmit` ainda apontam debitos tecnicos antigos fora do escopo das funcionalidades de Localidades/Cargos; nao tratar essas falhas como regressao automatica dessas alteracoes sem revisar o diff.

## Marco funcional publicado em 02/07/2026

Commit de producao: `a21d2cd Add public location and role imports`.

Deployment Vercel Production confirmado com sucesso:
`https://denuncia-cizeppkpo-girassolinteligencia-8661s-projects.vercel.app`

Funcionalidades incluidas:

- Categorias podem usar `tipo_localizacao = 'orgao_publico'`, substituindo o preenchimento manual/GPS pela selecao de orgao/localidade publica.
- Painel `/admin/localidades` permite CRUD manual e importacao CSV em lote de localidades publicas.
- `localidades_publicas` possui campos `nome`, `sigla`, `endereco`, `municipio`, `cnpj`, `telefone`, `ativo`.
- Denuncia publica tem autocomplete de localidades a partir de 3 caracteres/numeros quando a categoria usa orgao publico.
- Painel `/admin/cargos` permite CRUD manual e importacao CSV em lote de cargos/funcoes publicas.
- `cargos_publicos` possui campos `nome`, `tipo` (`servidor_publico`, `agente_politico`, `ambos`), `setor`, `ativo`.
- Denuncia anonima tem autocomplete para o campo de cargo do servidor/agente politico a partir de 3 caracteres, mantendo digitacao manual quando nao houver resultado.
- Gavetas laterais dos paineis admin foram ajustadas para iniciar abaixo do header, evitando corte de titulo.

Banco de dados:

- Migration de localidades: `supabase/migrations/20260702113017_localidades_orgao_publico.sql`.
- Migration de cargos: `supabase/migrations/20260702124617_cargos_publicos_autocomplete.sql`.
- SQL de `cargos_publicos` foi aplicado manualmente no SQL Editor do Supabase em 02/07/2026.
- As policies publicas dessas tabelas usam apenas leitura de registros `ativo = true` para `anon` e `authenticated`; nao dependem da funcao `tem_role`.

## Prioridade dos sprints

1. Estabilizacao e seguranca.
2. Saneamento tecnico.
3. Evolucao funcional.
4. Producao profissional com backup, monitoramento, rollback e documentacao final.
