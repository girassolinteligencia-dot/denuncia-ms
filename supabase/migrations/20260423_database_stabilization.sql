-- =====================================================
-- Migration: 20260423_database_stabilization.sql
-- Descrição: Estabiliza funções core, RLS e índices.
-- =====================================================

-- 1. Garantir tabela de perfis (se não existir)
CREATE TABLE IF NOT EXISTS public.profiles (
    id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome        text,
    email       text UNIQUE,
    role        text DEFAULT 'moderador' CHECK (role IN ('admin', 'superadmin', 'moderador')),
    ativo       boolean DEFAULT true,
    criado_em   timestamptz DEFAULT now(),
    atualizado_em timestamptz DEFAULT now()
);

-- 2. Função Auxiliar para RLS (tem_role)
-- Permite checar o cargo do usuário autenticado de forma performática
CREATE OR REPLACE FUNCTION public.tem_role(role_minimo text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (
      role = role_minimo 
      OR role = 'superadmin' -- Superadmin herda tudo
      OR (role_minimo = 'moderador' AND role = 'admin') -- Admin herda moderador
    )
    AND ativo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Índices de Performance
CREATE INDEX IF NOT EXISTS idx_denuncias_status ON public.denuncias(status);
CREATE INDEX IF NOT EXISTS idx_denuncias_criado_em ON public.denuncias(criado_em DESC);

-- 4. Garantir Buckets de Storage (Políticas de Produção)
-- Nota: Buckets geralmente são criados via UI, mas políticas podem ser via SQL.
-- Assume-se buckets: 'denuncias' e 'relatos-oficiais'

-- Permitir leitura pública dos anexos (apenas se tiver a URL)
-- Isso é necessário para o admin e para o PDF oficial
DO $$
BEGIN
    -- Política para Bucket 'denuncias'
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Denuncias') THEN
        CREATE POLICY "Public Access Denuncias" ON storage.objects FOR SELECT USING (bucket_id = 'denuncias');
    END IF;

    -- Política para Bucket 'relatos-oficiais'
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Relatos') THEN
        CREATE POLICY "Public Access Relatos" ON storage.objects FOR SELECT USING (bucket_id = 'relatos-oficiais');
    END IF;
END $$;

-- 5. Correção de coluna na Blacklist (se necessário)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blacklist_usuarios' AND column_name='banido_em') THEN
    ALTER TABLE public.blacklist_usuarios RENAME COLUMN banido_em TO criado_em;
  END IF;
END $$;
