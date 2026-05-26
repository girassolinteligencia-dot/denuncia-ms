-- Reparo definitivo para inscrição na newsletter via Supabase Data API.
-- Cria as duas tabelas historicamente usadas pelo app e uma RPC estável
-- para o frontend não depender diretamente do nome físico da tabela.

CREATE TABLE IF NOT EXISTS public.newsletter_inscricoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now()
);

ALTER TABLE public.newsletter_inscricoes
  ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;

CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now()
);

ALTER TABLE public.newsletter_inscricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.newsletter_inscricoes TO anon, authenticated;
GRANT INSERT ON public.newsletter_subscriptions TO anon, authenticated;
GRANT SELECT ON public.newsletter_inscricoes TO authenticated;
GRANT SELECT ON public.newsletter_subscriptions TO authenticated;

DROP POLICY IF EXISTS "Permitir inserção anônima de newsletter" ON public.newsletter_inscricoes;
DROP POLICY IF EXISTS "newsletter_inscricoes_public_insert" ON public.newsletter_inscricoes;
CREATE POLICY "newsletter_inscricoes_public_insert"
  ON public.newsletter_inscricoes
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "newsletter_inscricoes_admin_select" ON public.newsletter_inscricoes;
CREATE POLICY "newsletter_inscricoes_admin_select"
  ON public.newsletter_inscricoes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Permitir inserção anônima" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "newsletter_subscriptions_public_insert" ON public.newsletter_subscriptions;
CREATE POLICY "newsletter_subscriptions_public_insert"
  ON public.newsletter_subscriptions
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Apenas admin vê assinaturas" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "newsletter_subscriptions_admin_select" ON public.newsletter_subscriptions;
CREATE POLICY "newsletter_subscriptions_admin_select"
  ON public.newsletter_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE OR REPLACE FUNCTION public.inscrever_newsletter(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(coalesce(p_email, '')));
  v_inserted integer := 0;
BEGIN
  IF v_email = '' OR v_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' THEN
    RETURN jsonb_build_object('success', false, 'message', 'E-mail inválido.');
  END IF;

  INSERT INTO public.newsletter_inscricoes (email, ativo)
  VALUES (v_email, true)
  ON CONFLICT (email) DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  INSERT INTO public.newsletter_subscriptions (email, ativo)
  VALUES (v_email, true)
  ON CONFLICT (email) DO NOTHING;

  IF v_inserted = 0 THEN
    RETURN jsonb_build_object('success', true, 'already_registered', true, 'message', 'Este e-mail já está em nossa base!');
  END IF;

  RETURN jsonb_build_object('success', true, 'already_registered', false, 'message', 'Assinatura realizada com sucesso!');
END;
$$;

REVOKE ALL ON FUNCTION public.inscrever_newsletter(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.inscrever_newsletter(text) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.inscrever_newsletter(text) IS 'Inscreve e-mails na newsletter pública sem expor o frontend ao nome físico das tabelas.';

NOTIFY pgrst, 'reload schema';
