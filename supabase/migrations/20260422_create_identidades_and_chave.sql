-- =====================================================
-- MIGRATION: 20260422_create_identidades_and_chave
-- Propósito:
--   1. Criar tabela `identidades` para armazenar PII criptografado (LGPD)
--   2. Adicionar coluna `chave_acesso` à tabela `denuncias` para consulta pública
-- =====================================================

-- 1. Adiciona chave_acesso em denuncias (se não existir)
ALTER TABLE IF EXISTS public.denuncias
  ADD COLUMN IF NOT EXISTS chave_acesso text;

COMMENT ON COLUMN public.denuncias.chave_acesso IS 'Chave de acesso aleatória entregue ao cidadão para consultar sua denúncia.';

-- Índice para acelerar consultas de acompanhamento
CREATE INDEX IF NOT EXISTS idx_denuncias_chave ON public.denuncias(chave_acesso);

-- 2. Cria tabela de identidades criptografadas (PII)
CREATE TABLE IF NOT EXISTS public.identidades (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  denuncia_id uuid NOT NULL REFERENCES public.denuncias(id) ON DELETE CASCADE,
  nome_enc    text,         -- Criptografado com AES-256-GCM
  email_enc   text,         -- Criptografado com AES-256-GCM
  email_hash  text,         -- SHA-256 para buscas sem descriptografar
  telefone_enc text,        -- Criptografado com AES-256-GCM
  cpf_enc     text,         -- Criptografado com AES-256-GCM
  criado_em   timestamptz DEFAULT now()
);

-- RLS: apenas service_role pode ler/escrever (bypass via Server Actions admin)
ALTER TABLE public.identidades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "identidades_service_only" ON public.identidades;
CREATE POLICY "identidades_service_only"
  ON public.identidades
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_identidades_denuncia ON public.identidades(denuncia_id);
CREATE INDEX IF NOT EXISTS idx_identidades_email_hash ON public.identidades(email_hash);

-- 3. Corrige a tabela auth_tokens para garantir campos corretos
-- (versão anterior pode ter 'email' em texto, a atual usa email_hash)
-- Adiciona coluna email_hash se não existir
ALTER TABLE IF EXISTS public.auth_tokens
  ADD COLUMN IF NOT EXISTS email_hash text;

-- Índice no email_hash se não existir
CREATE INDEX IF NOT EXISTS auth_tokens_email_hash_idx ON public.auth_tokens (email_hash);
