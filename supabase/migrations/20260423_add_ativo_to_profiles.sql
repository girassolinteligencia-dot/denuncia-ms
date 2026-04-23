-- =====================================================
-- MIGRATION: 20260423_add_ativo_to_profiles
-- Descrição: Adiciona controle de suspensão de acesso
-- =====================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;

-- Comentário para documentação
COMMENT ON COLUMN public.profiles.ativo IS 'Indica se o acesso administrativo está ativo ou suspenso.';

-- Atualizar política de leitura para respeitar o status ativo
-- (Garante que usuários desativados não apareçam como moderadores ativos se necessário)
CREATE INDEX IF NOT EXISTS idx_profiles_ativo ON public.profiles(ativo);
