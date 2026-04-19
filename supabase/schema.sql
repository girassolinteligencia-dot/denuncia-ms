-- =====================================================
-- DENUNCIA MS — Schema Completo do Banco de Dados
-- Executar no SQL Editor do Supabase
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────
-- TABELAS
-- ─────────────────────────────────────────────────────────

-- Perfis de usuário (complementa auth.users do Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome      text NOT NULL,
  role      text NOT NULL DEFAULT 'moderador'
              CHECK (role IN ('superadmin', 'admin', 'moderador')),
  criado_em timestamptz DEFAULT now()
);

-- Configuração central (Módulo 0)
CREATE TABLE IF NOT EXISTS plataforma_config (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chave          text UNIQUE NOT NULL,
  valor          jsonb NOT NULL,
  atualizado_em  timestamptz DEFAULT now(),
  atualizado_por uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- Tipos de arquivo permitidos
CREATE TABLE IF NOT EXISTS config_tipos_arquivo (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo             text NOT NULL UNIQUE
                     CHECK (tipo IN ('foto', 'audio', 'video', 'pdf', 'documento')),
  ativo            boolean DEFAULT false,
  qtd_maxima       int DEFAULT 5 CHECK (qtd_maxima BETWEEN 1 AND 20),
  tamanho_max_mb   int DEFAULT 10 CHECK (tamanho_max_mb BETWEEN 1 AND 500),
  duracao_max_seg  int,
  atualizado_em    timestamptz DEFAULT now()
);

-- Templates de documento e e-mail
CREATE TABLE IF NOT EXISTS config_templates (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo                  text NOT NULL UNIQUE
                          CHECK (tipo IN ('cabecalho', 'rodape', 'email_orgao', 'email_denunciante')),
  conteudo              text NOT NULL DEFAULT '',
  variaveis_disponiveis jsonb DEFAULT '[]',
  incluir_qrcode        boolean DEFAULT false,
  atualizado_em         timestamptz DEFAULT now(),
  atualizado_por        uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- Configuração de protocolo
CREATE TABLE IF NOT EXISTS config_protocolo (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prefixo          text DEFAULT 'DNS',
  separador        text DEFAULT '-',
  formato_ano      text DEFAULT 'YYYY' CHECK (formato_ano IN ('YYYY', 'YY')),
  digitos_seq      int DEFAULT 6 CHECK (digitos_seq IN (4, 5, 6)),
  sequencia_atual  bigint DEFAULT 0,
  resetado_em      timestamptz
);

-- Campos do formulário público (configuráveis)
CREATE TABLE IF NOT EXISTS config_campos_formulario (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campo            text UNIQUE NOT NULL,
  label            text NOT NULL,
  placeholder      text,
  obrigatorio      boolean DEFAULT true,
  visivel          boolean DEFAULT true,
  validacao_regex  text,
  ordem            int DEFAULT 0,
  atualizado_em    timestamptz DEFAULT now()
);

-- Categorias de denúncia
CREATE TABLE IF NOT EXISTS categorias (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               text UNIQUE NOT NULL,
  label              text NOT NULL,
  bloco              text NOT NULL DEFAULT 'Geral',
  emoji              text,
  instrucao_publica  text,
  aviso_legal        text,
  template_descricao jsonb DEFAULT '[]',
  ativo              boolean DEFAULT true,
  ordem              int DEFAULT 0,
  criado_em          timestamptz DEFAULT now(),
  atualizado_em      timestamptz DEFAULT now()
);

-- Integrações de destino por categoria
CREATE TABLE IF NOT EXISTS integracoes_destino (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id           uuid NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
  tipo                   text NOT NULL CHECK (tipo IN ('email', 'webhook', 'ambos')),
  -- e-mail
  email_para             text[],
  email_cc               text[],
  email_bcc              text[],
  email_assunto_template text,
  prioridade             text DEFAULT 'normal'
                           CHECK (prioridade IN ('normal', 'urgente', 'confidencial')),
  -- webhook
  webhook_url            text,
  webhook_metodo         text DEFAULT 'POST' CHECK (webhook_metodo IN ('POST', 'PUT')),
  webhook_headers        jsonb,
  webhook_auth_tipo      text DEFAULT 'none'
                           CHECK (webhook_auth_tipo IN ('none', 'bearer', 'basic', 'apikey')),
  webhook_auth_dados     text,  -- criptografado com AES-256-GCM
  webhook_body_template  text,
  webhook_timeout        int DEFAULT 30 CHECK (webhook_timeout BETWEEN 5 AND 120),
  webhook_retry_max      int DEFAULT 3 CHECK (webhook_retry_max BETWEEN 0 AND 10),
  -- controle
  ativo                  boolean DEFAULT true,
  criado_em              timestamptz DEFAULT now(),
  atualizado_em          timestamptz DEFAULT now()
);

-- Denúncias
CREATE TABLE IF NOT EXISTS denuncias (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo                 text UNIQUE NOT NULL,
  categoria_id              uuid NOT NULL REFERENCES categorias(id),
  titulo                    text NOT NULL,
  descricao_original        text NOT NULL,
  documento_final           text NOT NULL,
  local                     text,
  data_ocorrido             date,
  status                    text DEFAULT 'recebida'
                              CHECK (status IN ('recebida','em_analise','encaminhada','resolvida','arquivada')),
  anonima                   boolean DEFAULT false,
  denunciante_nome          text,
  denunciante_email         text,
  denunciante_telefone      text,
  denunciante_cpf           text,
  denunciante_id            uuid REFERENCES profiles(id) ON DELETE SET NULL,
  cabecalho_snapshot        text,
  rodape_snapshot           text,
  protocolo_config_snapshot jsonb,
  criado_em                 timestamptz DEFAULT now(),
  atualizado_em             timestamptz DEFAULT now()
);

-- Arquivos das denúncias
CREATE TABLE IF NOT EXISTS arquivos_denuncia (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  denuncia_id    uuid NOT NULL REFERENCES denuncias(id) ON DELETE CASCADE,
  tipo           text NOT NULL
                   CHECK (tipo IN ('foto', 'audio', 'video', 'pdf', 'documento')),
  url            text NOT NULL,
  bucket_path    text NOT NULL,
  tamanho_bytes  int,
  ordem          int DEFAULT 0,
  criado_em      timestamptz DEFAULT now()
);

-- Log de disparos de integração
CREATE TABLE IF NOT EXISTS log_integracoes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  denuncia_id     uuid NOT NULL REFERENCES denuncias(id) ON DELETE CASCADE,
  integracao_id   uuid REFERENCES integracoes_destino(id) ON DELETE SET NULL,
  tipo            text NOT NULL,
  status          text NOT NULL CHECK (status IN ('sucesso', 'falha', 'pendente')),
  resposta_http   int,
  resposta_body   text,
  tentativa       int DEFAULT 1,
  disparado_em    timestamptz DEFAULT now()
);

-- Log de auditoria administrativa (append-only)
CREATE TABLE IF NOT EXISTS log_auditoria (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id      uuid REFERENCES profiles(id) ON DELETE SET NULL,
  acao            text NOT NULL,
  tabela          text NOT NULL,
  registro_id     text,
  valor_anterior  jsonb,
  valor_novo      jsonb,
  ip              text,
  criado_em       timestamptz DEFAULT now()
);

-- Notícias institucionais
CREATE TABLE IF NOT EXISTS noticias (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo       text NOT NULL,
  slug         text UNIQUE NOT NULL,
  conteudo     text NOT NULL,
  categoria    text,
  imagem_url   text,
  autor_id     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  publicado    boolean DEFAULT false,
  publicado_em timestamptz,
  criado_em    timestamptz DEFAULT now()
);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posicao    text NOT NULL CHECK (posicao IN ('topo', 'lateral', 'rodape')),
  imagem_url text NOT NULL,
  link_url   text,
  ativo      boolean DEFAULT true,
  ordem      int DEFAULT 0
);

-- ─────────────────────────────────────────────────────────
-- ÍNDICES
-- ─────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_denuncias_protocolo    ON denuncias(protocolo);
CREATE INDEX IF NOT EXISTS idx_denuncias_status       ON denuncias(status);
CREATE INDEX IF NOT EXISTS idx_denuncias_categoria    ON denuncias(categoria_id);
CREATE INDEX IF NOT EXISTS idx_denuncias_criado_em    ON denuncias(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_log_int_denuncia       ON log_integracoes(denuncia_id);
CREATE INDEX IF NOT EXISTS idx_log_int_status         ON log_integracoes(status);
CREATE INDEX IF NOT EXISTS idx_log_audit_usuario      ON log_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_log_audit_criado       ON log_auditoria(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_noticias_slug          ON noticias(slug);
CREATE INDEX IF NOT EXISTS idx_noticias_publicado     ON noticias(publicado, publicado_em DESC);
CREATE INDEX IF NOT EXISTS idx_categorias_ativo       ON categorias(ativo, ordem);

-- ─────────────────────────────────────────────────────────
-- FUNÇÃO RPC — Incremento Atômico de Protocolo
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION incrementar_protocolo()
RETURNS SETOF config_protocolo
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
    UPDATE config_protocolo
    SET sequencia_atual = sequencia_atual + 1
    RETURNING *;
END;
$$;

-- ─────────────────────────────────────────────────────────
-- RLS — Row Level Security
-- ─────────────────────────────────────────────────────────

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE plataforma_config     ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_tipos_arquivo  ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_templates      ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_protocolo      ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_campos_formulario ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias            ENABLE ROW LEVEL SECURITY;
ALTER TABLE integracoes_destino   ENABLE ROW LEVEL SECURITY;
ALTER TABLE denuncias             ENABLE ROW LEVEL SECURITY;
ALTER TABLE arquivos_denuncia     ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_integracoes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_auditoria         ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias              ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners               ENABLE ROW LEVEL SECURITY;

-- Helper: verifica se o usuário tem o role mínimo
CREATE OR REPLACE FUNCTION tem_role(role_minimo text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_role text;
  nivel_usuario int;
  nivel_minimo int;
BEGIN
  SELECT role INTO v_user_role FROM profiles WHERE id = auth.uid();

  nivel_usuario := CASE v_user_role
    WHEN 'superadmin' THEN 3
    WHEN 'admin'      THEN 2
    WHEN 'moderador'  THEN 1
    ELSE 0
  END;

  nivel_minimo := CASE role_minimo
    WHEN 'superadmin' THEN 3
    WHEN 'admin'      THEN 2
    WHEN 'moderador'  THEN 1
    ELSE 0
  END;

  RETURN nivel_usuario >= nivel_minimo;
END;
$$;



-- ─────────────────────────────────────────────────────────
-- SEED — Dados Iniciais
-- ─────────────────────────────────────────────────────────

-- Config: identidade da plataforma
INSERT INTO plataforma_config (chave, valor) VALUES
  ('identidade.nome',     '"DENUNCIA MS"'),
  ('identidade.slogan',   '"Sua voz, nossa missão"'),
  ('identidade.email',    '"contato@denunciams.com.br"'),
  ('identidade.rodape',   '"© 2026 DENUNCIA MS — Plataforma Cívica de Ouvidoria. Governo de Mato Grosso do Sul."'),
  ('cores.primaria',      '"#1535C9"'),
  ('cores.secundaria',    '"#F5C800"'),
  ('notificacoes.bcc',    '""'),
  ('notificacoes.alerta_admin', '"admin@denunciams.com.br"')
ON CONFLICT (chave) DO NOTHING;

-- Config: tipos de arquivo
INSERT INTO config_tipos_arquivo (tipo, ativo, qtd_maxima, tamanho_max_mb) VALUES
  ('foto',      true,  5,  10),
  ('audio',     false, 3,  20),
  ('video',     false, 2,  100),
  ('pdf',       false, 10, 50),
  ('documento', false, 5,  20)
ON CONFLICT (tipo) DO NOTHING;

-- Config: protocolo padrão
INSERT INTO config_protocolo (prefixo, separador, formato_ano, digitos_seq, sequencia_atual)
VALUES ('DNS', '-', 'YYYY', 6, 0)
ON CONFLICT DO NOTHING;

-- Config: campos do formulário
INSERT INTO config_campos_formulario (campo, label, placeholder, obrigatorio, visivel, ordem) VALUES
  ('titulo',         'Título da Denúncia',          'Descreva resumidamente o ocorrido',   true,  true,  1),
  ('local',          'Local do Ocorrido',            'Município, bairro ou endereço',        true,  true,  2),
  ('data_ocorrido',  'Data do Ocorrido',             'Quando aconteceu?',                    false, true,  3),
  ('nome',           'Nome Completo',                'Seu nome completo',                    false, true,  4),
  ('email',          'E-mail',                       'seu@email.com.br',                     false, true,  5),
  ('telefone',       'Telefone / WhatsApp',          '(67) 9 9999-9999',                     false, true,  6),
  ('cpf',            'CPF',                          '000.000.000-00',                       false, false, 7)
ON CONFLICT (campo) DO NOTHING;

-- Config: templates padrão
INSERT INTO config_templates (tipo, conteudo, variaveis_disponiveis) VALUES
  ('cabecalho',
   'DENÚNCIA FORMAL — {{categoria}}
Protocolo: {{protocolo}}
Data: {{data_envio}} às {{hora_envio}} (horário de Brasília)
Órgão Destinatário: {{orgao_nome}}
Município/Local: {{local}}
Situação do Denunciante: {{anonima}}',
   '[
     {"chave":"{{protocolo}}","descricao":"Número do protocolo"},
     {"chave":"{{categoria}}","descricao":"Categoria da denúncia"},
     {"chave":"{{data_envio}}","descricao":"Data de envio (DD/MM/YYYY)"},
     {"chave":"{{hora_envio}}","descricao":"Hora de envio (HH:mm)"},
     {"chave":"{{orgao_nome}}","descricao":"Nome do órgão destinatário"},
     {"chave":"{{local}}","descricao":"Local do ocorrido"},
     {"chave":"{{anonima}}","descricao":"Anônimo ou nome do denunciante"}
   ]'
  ),
  ('rodape',
   'Esta denúncia foi registrada na plataforma {{app_nome}} em {{data_envio}} às {{hora_envio}} (horário de Brasília).
Para acompanhamento, utilize o protocolo {{protocolo}} em {{app_url}}/acompanhar.
{{#unless anonima}}
Denunciante: {{nome}} — Contato: {{email}}
{{/unless}}
Documento gerado automaticamente. Não requer assinatura.',
   '[
     {"chave":"{{protocolo}}","descricao":"Número do protocolo"},
     {"chave":"{{app_nome}}","descricao":"Nome da plataforma"},
     {"chave":"{{app_url}}","descricao":"URL da plataforma"},
     {"chave":"{{data_envio}}","descricao":"Data de envio"},
     {"chave":"{{hora_envio}}","descricao":"Hora de envio"},
     {"chave":"{{nome}}","descricao":"Nome do denunciante (se não anônimo)"},
     {"chave":"{{email}}","descricao":"E-mail do denunciante (se não anônimo)"}
   ]'
  ),
  ('email_orgao',
   'Nova denúncia recebida — Protocolo {{protocolo}}

Categoria: {{categoria}}
Data: {{data_envio}}
Local: {{local}}

Acesse o painel administrativo para visualizar o documento completo.',
   '[{"chave":"{{protocolo}}","descricao":"Protocolo"},{"chave":"{{categoria}}","descricao":"Categoria"},{"chave":"{{data_envio}}","descricao":"Data"},{"chave":"{{local}}","descricao":"Local"}]'
  ),
  ('email_denunciante',
   'Olá, {{nome}}!

Recebemos sua denúncia e ela já está sendo processada.

Protocolo: {{protocolo}}
Categoria: {{categoria}}
Data de registro: {{data_envio}}

Acompanhe o status em: {{app_url}}/acompanhar/{{protocolo}}

Atenciosamente,
{{app_nome}}',
   '[{"chave":"{{protocolo}}","descricao":"Protocolo"},{"chave":"{{nome}}","descricao":"Nome do denunciante"},{"chave":"{{categoria}}","descricao":"Categoria"},{"chave":"{{data_envio}}","descricao":"Data"},{"chave":"{{app_url}}","descricao":"URL da plataforma"},{"chave":"{{app_nome}}","descricao":"Nome da plataforma"}]'
  )
ON CONFLICT (tipo) DO NOTHING;

-- Categorias — SEED COMPLETO (Mais de 30 categorias por blocos)
INSERT INTO categorias (bloco, slug, label, emoji, instrucao_publica, ordem) VALUES
-- Saúde e Bem-estar
('Saúde e Bem-estar', 'saude-publica', 'Saúde Pública', '🏥', 'SES-MS / Secretaria Municipal de Saúde', 1),
('Saúde e Bem-estar', 'falta-medicamentos', 'Falta de Medicamentos', '💊', 'SES-MS / Ouvidoria SUS', 2),
('Saúde e Bem-estar', 'irregularidade-upa', 'Irregularidade em UPA/Hospital', '🚑', 'SES-MS / Ouvidoria SUS', 3),
('Saúde e Bem-estar', 'vigilancia-sanitaria', 'Vigilância Sanitária', '🧼', 'VISA-MS', 4),

-- Infraestrutura e Urbanismo
('Infraestrutura e Urbanismo', 'buracos-vias', 'Buracos e Vias', '🕳️', 'PMCG / Secretaria de Obras', 10),
('Infraestrutura e Urbanismo', 'iluminacao-publica', 'Iluminação Pública', '💡', 'PMCG / Energisa', 11),
('Infraestrutura e Urbanismo', 'obra-irregular', 'Obra Irregular / Abandonada', '🚧', 'PMCG / Fiscalização', 12),
('Infraestrutura e Urbanismo', 'alagamento-drenagem', 'Alagamento / Drenagem', '🌊', 'PMCG / Defesa Civil', 13),
('Infraestrutura e Urbanismo', 'transporte-publico', 'Transporte Público', '🚌', 'AGETRAN', 14),

-- Meio Ambiente
('Meio Ambiente', 'desmatamento', 'Desmatamento', '🌿', 'IMASUL / IMAM', 20),
('Meio Ambiente', 'maus-tratos-animais', 'Maus-tratos a Animais', '🐾', 'IMAM / Polícia Civil', 21),
('Meio Ambiente', 'descarte-lixo', 'Descarte Irregular de Lixo', '♻️', 'IMAM / PMCG', 22),
('Meio Ambiente', 'poluicao-geral', 'Poluição (ar, água, solo)', '🏭', 'IMASUL', 23),
('Meio Ambiente', 'poluicao-sonora', 'Poluição Sonora', '🔊', 'IMAM / Fiscalização', 24),

-- Educação
('Educação', 'escola-precaria', 'Escola em Situação Precária', '🎓', 'SED-MS / Secretaria Municipal de Educação', 30),
('Educação', 'merenda-irregular', 'Irregularidade na Merenda', '🍽️', 'SED-MS / FNDE', 31),
('Educação', 'falta-professor', 'Falta de Professor / Aula', '📚', 'SED-MS', 32),

-- Corrupção e Gestão Pública
('Corrupção e Gestão Pública', 'corrupcao-desvio', 'Corrupção / Desvio de Verba', '⚖️', 'MP-MS / CGE-MS', 40),
('Corrupção e Gestão Pública', 'nepotismo', 'Nepotismo', '👥', 'MP-MS / CGE-MS', 41),
('Corrupção e Gestão Pública', 'improbidade-admin', 'Improbidade Administrativa', '📋', 'MP-MS / TCE-MS', 42),
('Corrupção e Gestão Pública', 'licitacao-fraudulenta', 'Licitação Fraudulenta', '🏗️', 'TCE-MS / CGE-MS', 43),
('Corrupção e Gestão Pública', 'servidor-inatividade', 'Servidor em Inatividade', '🪑', 'CGE-MS', 44),

-- Segurança Pública
('Segurança Pública', 'trafico-drogas', 'Tráfico de Drogas', '🚓', 'Polícia Civil MS / SENAD', 50),
('Segurança Pública', 'porte-armas', 'Porte Ilegal de Armas', '🔫', 'Polícia Federal / Polícia Civil', 51),
('Segurança Pública', 'ponto-vulnerabilidade', 'Ponto de Vulnerabilidade', '👁️', 'SEJUSP-MS', 52),
('Segurança Pública', 'ocupacao-irregular', 'Ocupação Irregular', '🏚️', 'PMCG / Secretaria de Habitação', 53),

-- Assistência Social
('Assistência Social', 'crianca-risco', 'Criança em Situação de Risco', '👶', 'CREAS / Conselho Tutelar', 60),
('Assistência Social', 'idoso-risco', 'Idoso em Situação de Risco', '👴', 'CREAS / MP-MS', 61),
('Assistência Social', 'acessibilidade-negada', 'Acessibilidade Negada', '♿', 'MPF / PMCG', 62),
('Assistência Social', 'familia-vulnerabilidade', 'Família em Vulnerabilidade', '🏠', 'SEMAS / CRAS', 63),

-- Violência e Gênero
('Violência e Gênero', 'violencia-domestica', 'Violência Doméstica', '🚨', 'Polícia Civil / Casa da Mulher Brasileira', 70),
('Violência e Gênero', 'feminicidio-ameaca', 'Feminicídio / Ameaça', '👩', 'Delegacia da Mulher — DEAM', 71),
('Violência e Gênero', 'discriminacao', 'Discriminação e Preconceito', '🏳️', 'MP-MS / Defensoria Pública MS', 72)
ON CONFLICT (slug) DO UPDATE SET bloco = EXCLUDED.bloco, label = EXCLUDED.label, emoji = EXCLUDED.emoji, instrucao_publica = EXCLUDED.instrucao_publica;

-- ─────────────────────────────────────────────────────────
-- SEGURANÇA (POLICIES) — EXECUTAR APÓS CRIAÇÃO DAS TABELAS
-- ─────────────────────────────────────────────────────────

-- Policies: profiles
DROP POLICY IF EXISTS "profiles_self_read" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
CREATE POLICY "profiles_self_read"   ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_admin_all"   ON profiles FOR ALL    USING (tem_role('admin'));

-- Policies: configurações — somente superadmin
DROP POLICY IF EXISTS "config_superadmin" ON plataforma_config;
DROP POLICY IF EXISTS "config_arquivos" ON config_tipos_arquivo;
DROP POLICY IF EXISTS "config_templates" ON config_templates;
DROP POLICY IF EXISTS "config_protocolo" ON config_protocolo;
DROP POLICY IF EXISTS "config_campos" ON config_campos_formulario;
CREATE POLICY "config_superadmin" ON plataforma_config     FOR ALL USING (tem_role('superadmin'));
CREATE POLICY "config_arquivos"   ON config_tipos_arquivo  FOR ALL USING (tem_role('superadmin'));
CREATE POLICY "config_templates"  ON config_templates      FOR ALL USING (tem_role('superadmin'));
CREATE POLICY "config_protocolo"  ON config_protocolo      FOR ALL USING (tem_role('superadmin'));
CREATE POLICY "config_campos"     ON config_campos_formulario FOR ALL USING (tem_role('superadmin'));

-- Policies: categorias — leitura pública (portal), escrita admin
DROP POLICY IF EXISTS "categorias_public_read" ON categorias;
DROP POLICY IF EXISTS "categorias_admin_all" ON categorias;
CREATE POLICY "categorias_public_read" ON categorias FOR SELECT USING (ativo = true);
CREATE POLICY "categorias_admin_all"   ON categorias FOR ALL    USING (tem_role('admin'));

-- Policies: integrações — somente admin
DROP POLICY IF EXISTS "integracoes_admin" ON integracoes_destino;
CREATE POLICY "integracoes_admin" ON integracoes_destino FOR ALL USING (tem_role('admin'));

-- Policies: denúncias — inserção pública, leitura/escrita admin/moderador
DROP POLICY IF EXISTS "denuncias_insert_public" ON denuncias;
DROP POLICY IF EXISTS "denuncias_admin_read" ON denuncias;
DROP POLICY IF EXISTS "denuncias_admin_update" ON denuncias;
CREATE POLICY "denuncias_insert_public" ON denuncias FOR INSERT WITH CHECK (true);
CREATE POLICY "denuncias_admin_read"    ON denuncias FOR SELECT USING (tem_role('moderador'));
CREATE POLICY "denuncias_admin_update"  ON denuncias FOR UPDATE USING (tem_role('moderador'));

-- Policies: arquivos — inserção pública, leitura admin
DROP POLICY IF EXISTS "arquivos_insert_public" ON arquivos_denuncia;
DROP POLICY IF EXISTS "arquivos_admin_read" ON arquivos_denuncia;
CREATE POLICY "arquivos_insert_public"  ON arquivos_denuncia FOR INSERT WITH CHECK (true);
CREATE POLICY "arquivos_admin_read"     ON arquivos_denuncia FOR SELECT USING (tem_role('moderador'));

-- Policies: logs — somente leitura superadmin
DROP POLICY IF EXISTS "log_int_superadmin" ON log_integracoes;
DROP POLICY IF EXISTS "log_audit_superadmin" ON log_auditoria;
CREATE POLICY "log_int_superadmin"   ON log_integracoes FOR SELECT USING (tem_role('admin'));
CREATE POLICY "log_audit_superadmin" ON log_auditoria   FOR SELECT USING (tem_role('superadmin'));

-- Policies: notícias — leitura pública publicadas, escrita admin
DROP POLICY IF EXISTS "noticias_public_read" ON noticias;
DROP POLICY IF EXISTS "noticias_admin_all" ON noticias;
CREATE POLICY "noticias_public_read"  ON noticias FOR SELECT USING (publicado = true);
CREATE POLICY "noticias_admin_all"    ON noticias FOR ALL    USING (tem_role('admin'));

-- Policies: banners — leitura pública ativos, escrita admin
DROP POLICY IF EXISTS "banners_public_read" ON banners;
DROP POLICY IF EXISTS "banners_admin_all" ON banners;
CREATE POLICY "banners_public_read"   ON banners FOR SELECT USING (ativo = true);
CREATE POLICY "banners_admin_all"     ON banners FOR ALL    USING (tem_role('admin'));
