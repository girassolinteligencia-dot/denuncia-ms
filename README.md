# DenunciaMS

Projeto oficial: `c:\.MAIS\denuncia-ms`

> Status atual (23/05/2026): diretório `denuncia-ms` é o único ambiente de desenvolvimento autorizado. A cópia `denuncia-ms-1` é obsoleta e não deve ser utilizada.

## Visão geral

Aplicação Next.js 14 + Supabase para a gestão de denúncias públicas.

- Frontend público e painel admin.
- Autenticação via Supabase.
- Uploads de anexos para buckets privados (`denuncias`, `relatos-oficiais`).
- Geração de PDF e hash de assinatura.
- Controle de anonimato por categoria.
- Worker de despacho e rotas cron para processamento assíncrono.

## Desenvolvimento local

```bash
cd denuncia-ms
npm ci
npm run dev
```

Abrir: `http://localhost:3000`.

## Validação obrigatória antes de alterações

```bash
npm ci
npm test
npm run lint
npx tsc --noEmit
npm run build
```

## Diretório oficial

- Código genuíno: `c:\.MAIS\denuncia-ms`
- Não usar: `c:\.MAIS\denuncia-ms-1`

## Deploy / Produção

Deploy deve ser executado apenas com aprovação explícita e após validação local completa.

- `npx vercel --prod`
- Confirmar variáveis de ambiente.
- Validar preview antes de promoção.
- Fazer rollback se necessário.

## Atenção

- Não aplicar migrations em produção sem plano de rollback.
- Não usar service role de produção em ambiente local.
- `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ENCRYPTION_KEY` e `CRON_SECRET` são secrets server-only.
