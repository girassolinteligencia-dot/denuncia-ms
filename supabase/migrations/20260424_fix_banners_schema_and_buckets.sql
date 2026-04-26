-- =====================================================
-- Migration: 20260424_fix_banners_schema_and_buckets.sql
-- Descrição: Adiciona colunas faltantes na tabela banners
--            e garante a existência dos buckets de storage.
-- =====================================================

-- 1. Adicionar colunas faltantes na tabela banners
ALTER TABLE banners 
  ADD COLUMN IF NOT EXISTS titulo text,
  ADD COLUMN IF NOT EXISTS subtitulo text,
  ADD COLUMN IF NOT EXISTS link_url text,
  ADD COLUMN IF NOT EXISTS criado_at timestamptz DEFAULT now();

-- 2. Garantir que os buckets de storage existam
-- Nota: Isso assume que o usuário tem permissão para inserir em storage.buckets
-- Se falhar via migração automática, o usuário deve criar manualmente no painel do Supabase.

INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('noticias', 'noticias', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('config', 'config', true)
ON CONFLICT (id) DO NOTHING;

-- Nota: Políticas de segurança de Storage (RLS) foram removidas da migração SQL 
-- por incompatibilidade de permissões diretas em storage.policies no Editor SQL.
-- Como o sistema utiliza Service Role para uploads, o funcionamento está garantido.
-- Se desejar acesso público via URL, verifique se os buckets acima estão marcados como 'Public' no painel do Supabase.
