-- =====================================================================
-- SCRIPT DE CORREÇÃO — PRODUÇÃO
-- Projeto: vfnwtxglknfbwlohblnp (DenunciaMS produção)
-- Data: 2026-05-23
--
-- Execute este script no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/vfnwtxglknfbwlohblnp/sql/new
--
-- PROBLEMAS CORRIGIDOS:
--   1. ERROR "Could not find the table 'public.enquete_votos' in the schema cache"
--      — Faltava policy SELECT na tabela enquete_votos com RLS ativo
--   2. audit_identidade não existia em produção
--      — O código em admin-denuncias.ts já tenta inserir aqui, causando erro silencioso
-- =====================================================================

-- ─── PASSO 1: Verificar estado atual ─────────────────────────────────────────
-- (Opcional) Rode este SELECT antes para confirmar o que falta:
/*
SELECT
  t.table_name,
  p.policyname,
  p.cmd
FROM information_schema.tables t
LEFT JOIN pg_policies p ON p.tablename = t.table_name
WHERE t.table_schema = 'public'
  AND t.table_name IN ('enquete_votos', 'audit_identidade')
ORDER BY t.table_name, p.cmd;
*/

-- ─── PASSO 2: Fix enquete_votos — adicionar política SELECT ──────────────────
-- Causa do erro: RLS ativo + sem policy SELECT = PostgREST não expõe a tabela
-- no schema cache, mesmo para leituras via service_role em Server Actions.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'enquete_votos' AND policyname = 'Public read count'
  ) THEN
    CREATE POLICY "Public read count" ON public.enquete_votos
      FOR SELECT USING (true);
    RAISE NOTICE 'Policy "Public read count" criada em enquete_votos';
  ELSE
    RAISE NOTICE 'Policy "Public read count" já existe — nenhuma ação necessária';
  END IF;
END $$;

-- ─── PASSO 3: Criar tabela audit_identidade ───────────────────────────────────
-- Tabela de auditoria LGPD: registra cada acesso a PII descriptografado (nome, email, telefone).
-- O código em lib/actions/admin-denuncias.ts (~linha 151) já tenta inserir aqui.
CREATE TABLE IF NOT EXISTS public.audit_identidade (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    denuncia_id uuid        NOT NULL REFERENCES public.denuncias(id) ON DELETE CASCADE,
    usuario_id  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_acesso   text,
    acessado_em timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_id_denuncia ON public.audit_identidade(denuncia_id);
CREATE INDEX IF NOT EXISTS idx_audit_id_data     ON public.audit_identidade(acessado_em DESC);

-- Habilitar RLS
ALTER TABLE public.audit_identidade ENABLE ROW LEVEL SECURITY;

-- Somente superadmins podem ler o log de auditoria
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'audit_identidade' AND policyname = 'audit_identidade_superadmin'
  ) THEN
    CREATE POLICY audit_identidade_superadmin ON public.audit_identidade
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'superadmin'
        )
      );
    RAISE NOTICE 'Policy SELECT de superadmin criada em audit_identidade';
  END IF;
END $$;

-- Inserção via service_role (Server Actions com createAdminClient)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'audit_identidade' AND policyname = 'audit_identidade_insert_system'
  ) THEN
    CREATE POLICY audit_identidade_insert_system ON public.audit_identidade
      FOR INSERT
      WITH CHECK (true);
    RAISE NOTICE 'Policy INSERT criada em audit_identidade';
  END IF;
END $$;

-- ─── PASSO 4: Forçar reload do schema cache do PostgREST ─────────────────────
-- Necessário para que a nova policy e tabela apareçam imediatamente
NOTIFY pgrst, 'reload schema';

-- ─── VERIFICAÇÃO FINAL ───────────────────────────────────────────────────────
SELECT
  p.tablename,
  p.policyname,
  p.cmd,
  p.roles
FROM pg_policies p
WHERE p.tablename IN ('enquete_votos', 'audit_identidade')
ORDER BY p.tablename, p.cmd;
