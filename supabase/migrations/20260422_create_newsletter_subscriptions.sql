-- =====================================================
-- MIGRATION: 20260422_create_newsletter_subscriptions
-- Propósito: Armazenar e-mails para o Boletim Diário de Impacto
-- =====================================================

CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text UNIQUE NOT NULL,
  ativo       boolean DEFAULT true,
  criado_em   timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: Anon pode inserir (para o site público)
CREATE POLICY "Permitir inserção anônima" ON public.newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

-- Política: Apenas admin pode ver todos os e-mails
CREATE POLICY "Apenas admin vê assinaturas" ON public.newsletter_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

COMMENT ON TABLE public.newsletter_subscriptions IS 'Assinantes do boletim diário da plataforma DenunciaMS.';
