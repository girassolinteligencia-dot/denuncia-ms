-- =====================================================
-- Migration: 20260423_audit_identidade.sql
-- Descrição: Cria tabela para registrar quem visualizou PII
-- =====================================================

CREATE TABLE IF NOT EXISTS public.audit_identidade (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    denuncia_id uuid NOT NULL REFERENCES public.denuncias(id) ON DELETE CASCADE,
    usuario_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_acesso   text,
    acessado_em timestamptz DEFAULT now()
);

-- Indexar para relatórios de conformidade
CREATE INDEX IF NOT EXISTS idx_audit_id_denuncia ON public.audit_identidade(denuncia_id);
CREATE INDEX IF NOT EXISTS idx_audit_id_data ON public.audit_identidade(acessado_em DESC);

-- RLS: Apenas superadmins podem ver o log de auditoria de PII
ALTER TABLE public.audit_identidade ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_identidade_superadmin ON public.audit_identidade
    FOR SELECT
    USING (tem_role('superadmin'));

-- Inserção é permitida via Server Actions (Security Definer)
CREATE POLICY audit_identidade_insert_system ON public.audit_identidade
    FOR INSERT
    WITH CHECK (true);
