-- =====================================================
-- Migration: 20260523_fix_enquetes_audit_identidade.sql
-- Descrição:
--   1. Adiciona política SELECT em enquete_votos (fix schema cache error ao votar)
--   2. Cria tabela audit_identidade para auditoria LGPD de acesso a PII
--   3. Força reload do schema cache do PostgREST
-- =====================================================

-- ─── 1. enquete_votos: adicionar política SELECT pública ─────────────────────
-- Sem essa policy, o PostgREST retorna "not found in schema cache" para clientes
-- que tentam ler a tabela (mesmo que createAdminClient use service_role).
-- O aggregate de contagem de votos precisa de SELECT visível no schema.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'enquete_votos' AND policyname = 'Public read count'
  ) THEN
    CREATE POLICY "Public read count" ON public.enquete_votos
      FOR SELECT USING (true);
  END IF;
END $$;

-- ─── 2. audit_identidade: criar tabela de auditoria LGPD ─────────────────────
-- Registra cada acesso a dados PII descriptografados (nome, email, telefone).
-- O código em lib/actions/admin-denuncias.ts já tenta inserir aqui (linha ~151).
CREATE TABLE IF NOT EXISTS public.audit_identidade (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    denuncia_id uuid        NOT NULL REFERENCES public.denuncias(id) ON DELETE CASCADE,
    usuario_id  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_acesso   text,
    acessado_em timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_id_denuncia ON public.audit_identidade(denuncia_id);
CREATE INDEX IF NOT EXISTS idx_audit_id_data     ON public.audit_identidade(acessado_em DESC);

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
  END IF;
END $$;

-- ─── 3. Reload do schema cache do PostgREST ──────────────────────────────────
NOTIFY pgrst, 'reload schema';
