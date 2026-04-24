-- =====================================================
-- Migration: Tabelas faltantes para produção
-- Data: 2026-04-23
-- Descrição: Cria despacho_queue, pdf_assinaturas,
--            logs_acesso_denuncia, blacklist_usuarios,
--            coluna gerado_por_ia em noticias,
--            e remove colunas PII não-criptografadas.
-- =====================================================

-- 1. Fila de Despacho (e-mails para órgãos)
CREATE TABLE IF NOT EXISTS despacho_queue (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  denuncia_id   uuid NOT NULL REFERENCES denuncias(id) ON DELETE CASCADE,
  pdf_base64    text,
  tentativas    int DEFAULT 0,
  status        text DEFAULT 'pendente'
                  CHECK (status IN ('pendente','pendente_pdf','processando','despachado','erro','falha_definitiva')),
  ultimo_erro   text,
  criado_em     timestamptz DEFAULT now(),
  despachado_em timestamptz
);

CREATE INDEX IF NOT EXISTS idx_despacho_status ON despacho_queue(status);
CREATE INDEX IF NOT EXISTS idx_despacho_denuncia ON despacho_queue(denuncia_id);

-- 2. Assinaturas de PDF (integridade documental)
CREATE TABLE IF NOT EXISTS pdf_assinaturas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  denuncia_id   uuid NOT NULL REFERENCES denuncias(id) ON DELETE CASCADE,
  protocolo     text NOT NULL,
  sha256        text NOT NULL,
  url_storage   text,
  gerado_em     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pdf_denuncia ON pdf_assinaturas(denuncia_id);
CREATE INDEX IF NOT EXISTS idx_pdf_protocolo ON pdf_assinaturas(protocolo);

-- 3. Logs de Acesso a Denuncias (rate limiting de consulta pública)
CREATE TABLE IF NOT EXISTS logs_acesso_denuncia (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_origem           text NOT NULL,
  protocolo_tentativa text,
  sucesso             boolean DEFAULT false,
  user_agent          text,
  criado_at           timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_logs_acesso_ip ON logs_acesso_denuncia(ip_origem, criado_at DESC);

-- 4. Blacklist de Usuários (bloqueio de e-mails suspensos)
CREATE TABLE IF NOT EXISTS blacklist_usuarios (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash  text UNIQUE NOT NULL,
  motivo      text,
  bloqueado_por uuid REFERENCES profiles(id) ON DELETE SET NULL,
  criado_em   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blacklist_email ON blacklist_usuarios(email_hash);

-- 5. Coluna gerado_por_ia na tabela noticias
ALTER TABLE noticias
  ADD COLUMN IF NOT EXISTS gerado_por_ia boolean DEFAULT false;

-- 6. Remover colunas PII não-criptografadas da tabela denuncias
-- (Os dados reais já estão na tabela 'identidades' com criptografia AES-256-GCM)
ALTER TABLE denuncias
  DROP COLUMN IF EXISTS denunciante_nome,
  DROP COLUMN IF EXISTS denunciante_email,
  DROP COLUMN IF EXISTS denunciante_telefone,
  DROP COLUMN IF EXISTS denunciante_cpf,
  DROP COLUMN IF EXISTS anonima;

-- ─────────────────────────────────────────────────────────
-- RLS — Row Level Security
-- ─────────────────────────────────────────────────────────

ALTER TABLE despacho_queue       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_assinaturas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_acesso_denuncia ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklist_usuarios   ENABLE ROW LEVEL SECURITY;

-- Policies: despacho_queue — inserção pública (via server action), leitura admin
CREATE POLICY "despacho_insert_public"  ON despacho_queue FOR INSERT WITH CHECK (true);
CREATE POLICY "despacho_admin_read"     ON despacho_queue FOR SELECT USING (tem_role('moderador'));
CREATE POLICY "despacho_admin_update"   ON despacho_queue FOR UPDATE USING (tem_role('moderador'));

-- Policies: pdf_assinaturas — inserção pública, leitura admin
CREATE POLICY "pdf_insert_public"  ON pdf_assinaturas FOR INSERT WITH CHECK (true);
CREATE POLICY "pdf_admin_read"     ON pdf_assinaturas FOR SELECT USING (tem_role('moderador'));

-- Policies: logs_acesso — inserção pública, leitura superadmin
CREATE POLICY "logs_acesso_insert" ON logs_acesso_denuncia FOR INSERT WITH CHECK (true);
CREATE POLICY "logs_acesso_read"   ON logs_acesso_denuncia FOR SELECT USING (tem_role('superadmin'));

-- Policies: blacklist — somente admin
CREATE POLICY "blacklist_admin_all" ON blacklist_usuarios FOR ALL USING (tem_role('admin'));
