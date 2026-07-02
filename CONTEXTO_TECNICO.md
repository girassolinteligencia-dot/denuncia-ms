# CONTEXTO TÉCNICO — DenunciaMS

# Leia este arquivo antes de qualquer modificação no projeto.

> Status atual (23/05/2026): o diretório oficial do projeto é `c:\.MAIS\denuncia-ms`.
> A cópia `denuncia-ms-1` foi auditada e está obsoleta; não deve ser usada para desenvolvimento ou deploy.
> Vínculo oficial permanente: GitHub e Vercel associados a `girassolinteligencia@gmail.com`.
> Atualização (02/07/2026): commit `a21d2cd` publicado em produção com Localidades Públicas, Cargos Públicos e importações CSV.

## DECISÕES ARQUITETURAIS CRÍTICAS (NÃO SOBRESCREVER)


### 1. Função incrementar_protocolo (Supabase)

- SEMPRE deve ter SECURITY DEFINER e WHERE clause
- SQL correto está em: docs/sql/incrementar_protocolo.sql
- Sem o WHERE, gera erro "UPDATE requires a WHERE clause"

### 2. getMe() em lib/actions/admin-usuarios.ts

- USA createClient com cookies (utils/supabase/server.ts)
- NÃO usa createAdminClient para auth.getUser()
- Motivo: service role não acessa sessão do usuário

### 3. next.config.mjs

- serverActions.bodySizeLimit: '10mb' — NÃO remover
- Sem isso, uploads causam erro 413

### 4. middleware.ts (raiz)

- Remove headers de IP para anonimização LGPD
- NÃO substituir pelo middleware padrão do Supabase

### 5. lib/actions/denuncia.ts

- NÃO passa arquivos como buffer para Server Action
- Upload é feito no cliente via Supabase Storage
- Server Action recebe apenas URLs (string[])

### 6. components/ui/lucide-icon.tsx

- Fallback para emojis com font-family forçado
- NÃO remover o WebkitFontSmoothing

### 7. public/assets/mascote_sem_fundo.png

- Arquivo com transparência real (640757 bytes)
- NÃO substituir por versão com fundo

### 8. Schema do banco (Supabase)

- Tabelas novas: identidades, pdf_assinaturas, despacho_queue, audit_log, auth_tokens
- config_protocolo: deve ter APENAS 1 linha
- Colunas PII removidas de denuncias (denunciante_nome, email, cpf, telefone)
- Dados de identidade ficam em: identidades (criptografados)

### 9. pg_cron jobs ativos

- limpar-otps-expirados: 0 2 * * *
- expurgo-denuncias-antigas: 0 3 1 * *
- worker-despacho: */2 * * * * (chama /api/worker/despacho)

### 10. Variáveis de ambiente obrigatórias no Vercel

- RESEND_API_KEY, EMAIL_FROM, EMAIL_REPLY_TO
- ENCRYPTION_KEY, CRON_SECRET
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

### 11. Vínculo oficial GitHub/Vercel

- Conta oficial GitHub/Vercel: `girassolinteligencia@gmail.com`
- GitHub repo: `github.com/girassolinteligencia-dot/denuncia-ms`
- Vercel project: `denuncia-ms`
- Vercel scope: `girassolinteligencia-8661s-projects`
- Produção: `https://www.denunciams.com.br`
- NÃO relinkar `.vercel`, alterar remote, promover deploy ou autenticar publicação por outra conta/workspace.

### 12. Localidades Públicas e Cargos Públicos

- Categorias podem alternar a localização entre `manual` e `orgao_publico` por `categorias.tipo_localizacao`.
- Quando `tipo_localizacao = 'orgao_publico'`, o formulário público substitui CEP/GPS/endereço por autocomplete de `localidades_publicas`.
- Nunca exibir localização manual e seleção de órgão público ao mesmo tempo para a mesma categoria.
- `localidades_publicas`: tabela pública somente para leitura de registros ativos; manutenção via `/admin/localidades`.
- `/admin/localidades`: CRUD manual e importação CSV em lote. Duplicidade tratada por CNPJ ou por `nome + municipio`.
- `cargos_publicos`: tabela pública somente para leitura de registros ativos; manutenção via `/admin/cargos`.
- `/admin/cargos`: CRUD manual e importação CSV em lote para cargos/funções.
- `cargos_publicos.tipo`: `servidor_publico`, `agente_politico` ou `ambos`.
- Denúncia anônima: campo de cargo usa autocomplete a partir de 3 caracteres, mas permanece livre para digitação manual se não houver sugestão.
- SQL de `cargos_publicos` foi aplicado manualmente no Supabase SQL Editor em 02/07/2026.
- Evitar policies que dependam de `tem_role` nessas tabelas públicas auxiliares; usar RLS com SELECT público apenas para `ativo = true`.

## PADRÕES QUE DEVEM SER MANTIDOS

- OTP: armazena email_hash SHA-256, nunca email em texto puro
- Identidades: sempre criptografadas com encryptData() de lib/encrypt.ts
- PDF: hash SHA-256 registrado em pdf_assinaturas após geração
- Deploy: sempre via npx vercel --prod após npm run build

## MARCOS DE ESTABILIZAÇÃO (TIMESTAMPS)

### 02/07/2026 — Localidades, Cargos e Importação em Lote
- [x] **Commit produção**: `a21d2cd Add public location and role imports`.
- [x] **Deploy**: Vercel Production concluído com sucesso para o commit `a21d2cd`.
- [x] **Localidades Públicas**: `/admin/localidades` com CRUD manual, ativação/desativação e importação CSV.
- [x] **Categorias**: `tipo_localizacao` permite ativar seleção de órgão público individualmente por categoria.
- [x] **Denúncia pública**: autocomplete de localidades com 3+ caracteres/números; substitui localização manual quando habilitado.
- [x] **Cargos Públicos**: `/admin/cargos` com CRUD manual, ativação/desativação e importação CSV.
- [x] **Denúncia anônima**: autocomplete de cargo para servidor público/agente político, mantendo preenchimento manual.
- [x] **Layout admin**: gavetas laterais ajustadas para não cortar títulos abaixo do header.
- [x] **Banco aplicado manualmente**: SQL de `cargos_publicos` aplicado no Supabase SQL Editor.
- [x] **Build**: `npm run build` validado localmente e no GitHub Actions.
- [!] **Débitos existentes**: `npm run lint` e `npx tsc --noEmit` ainda falham por pendências antigas fora desta entrega.

### 24/04/2026 — Estabilização de Branding e UI
- [x] **Mascote**: Utilizar SEMPRE `mascote_sem_fundo.png` (640.757 bytes) para garantir transparência.
- [x] **Ícones**: Revertidos para Emojis originais via banco de dados (`icon_name`). Fallback de renderização robusto no componente `LucideIcon.tsx`.
- [x] **Sidebar Admin**: Configurada para exibir dashboards de Impacto, Geográfico e Governança com visibilidade total para administradores.
- [x] **Performance**: Verificado o limite de 10mb para uploads de mídia.
- [x] **Arquitetura**: Cumprimento rigoroso das 10 decisões arquiteturais críticas listadas acima.


## CORREÇÕES APLICADAS EM 24/04/2026
- Página /admin/usuarios: verificação de role deve aceitar 'admin' E 'superadmin'
- Se aparecer erro 'column X does not exist' no PostgREST: executar NOTIFY pgrst, 'reload schema' no SQL Editor


### 23/05/2026 — Fix Enquetes + Audit Log (pendente aplicação manual em prod)
- **BUG**: `enquete_votos` e `enquete_opcoes` não existem no banco `jntbmydqvacrjsbsvgml`
  — migrations `20260423_sistema_enquetes.sql` e `20260424_enquetes_avancadas.sql` não foram aplicadas nesse banco
- **BUG**: `audit_identidade` também não existe em produção
  — código em `lib/actions/admin-denuncias.ts:151` já tenta inserir nessa tabela (erro silencioso)
- **FIX SQL**: `docs/sql/FIX_PRODUCAO_ENQUETES_E_AUDIT.sql` — rodar no SQL Editor do Supabase
  URL: https://supabase.com/dashboard/project/jntbmydqvacrjsbsvgml/sql/new
- **Migration local**: `supabase/migrations/20260523_fix_enquetes_audit_identidade.sql` criada
- **env.local atualizado**: SUPABASE_SERVICE_ROLE_KEY agora usa JWT clássico `eyJ...` (necessário para autenticação correta)

### 22/05/2026 — Implementação de Anonimato & Controle de Acesso
- [x] **Coluna `permite_anonimato`**: Adicionada a tabela `categorias` via migration 20260521_add_permite_anonimato.sql
- [x] **Commit 79199b7**: `feat: implement anonymous donations & access control` — 23 arquivos alterados
- [x] **Schema Sincronizado**: Todas as 4 migrations aplicadas com sucesso
  - 20260422_create_identidades_and_chave.sql — Tabela `identidades` (PII criptografada)
  - 20260423_sistema_enquetes.sql — Enquetes parametrizáveis
  - 20260423_production_readiness.sql — Tabelas de despacho, PDF e blacklist
  - 20260521_add_permite_anonimato.sql — Suporte a denúncias anônimas por categoria
- [x] **Build**: Compilado com sucesso, 44 rotas disponíveis
- [x] **Servidor**: Localhost rodando em porta 3001 sem erros críticos
- [x] **Arquivos Novos**: 
  - lib/admin-access.ts — Controle de acesso centralizado por role
  - components/admin/geo-heatmap-layer.tsx — Mapa de calor geográfico
- [x] **Status**: 100% implementado e sincronizado


## SCHEMA REAL DA TABELA categorias
- Colunas: id, slug, label, bloco, icon_name, instrucao_publica, aviso_legal, template_descricao, ativo, permite_anonimato, ordem, criado_em, atualizado_em, destaque, ordem_destaque, alerta_urgencia, exige_local, exige_data, numeros_emergencia
- **NOVO (22/05)**: permite_anonimato boolean DEFAULT false
- IconPicker usa position:fixed para escapar de containers com overflow-y-auto
