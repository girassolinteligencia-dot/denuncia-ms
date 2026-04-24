# CONTEXTO TÉCNICO — DenunciaMS

# Leia este arquivo antes de qualquer modificação no projeto.


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

## PADRÕES QUE DEVEM SER MANTIDOS

- OTP: armazena email_hash SHA-256, nunca email em texto puro
- Identidades: sempre criptografadas com encryptData() de lib/encrypt.ts
- PDF: hash SHA-256 registrado em pdf_assinaturas após geração
- Deploy: sempre via npx vercel --prod após npm run build

## MARCOS DE ESTABILIZAÇÃO (TIMESTAMPS)

### 24/04/2026 — Estabilização de Branding e UI
- [x] **Mascote**: Utilizar SEMPRE `mascote_sem_fundo.png` (640.757 bytes) para garantir transparência.
- [x] **Ícones**: Revertidos para Emojis originais via banco de dados (`icon_name`). Fallback de renderização robusto no componente `LucideIcon.tsx`.
- [x] **Sidebar Admin**: Configurada para exibir dashboards de Impacto, Geográfico e Governança com visibilidade total para administradores.
- [x] **Performance**: Verificado o limite de 10mb para uploads de mídia.
- [x] **Arquitetura**: Cumprimento rigoroso das 10 decisões arquiteturais críticas listadas acima.


## CORREÇÕES APLICADAS EM 24/04/2026
- Página /admin/usuarios: verificação de role deve aceitar 'admin' E 'superadmin'
- Se aparecer erro 'column X does not exist' no PostgREST: executar NOTIFY pgrst, 'reload schema' no SQL Editor


## SCHEMA REAL DA TABELA categorias
- NÃO tem coluna email_destino
- Colunas: id, slug, label, bloco, icon_name, instrucao_publica, aviso_legal, template_descricao, ativo, ordem, criado_em, atualizado_em, destaque, ordem_destaque, alerta_urgencia, exige_local, exige_data, numeros_emergencia
- IconPicker usa position:fixed para escapar de containers com overflow-y-auto
