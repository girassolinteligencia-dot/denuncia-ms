-- Reparo: garante a tabela usada pelo formulário "Receba atualizações do MS"
-- e solicita reload do schema cache do PostgREST/Supabase.

CREATE TABLE IF NOT EXISTS public.newsletter_inscricoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now()
);

ALTER TABLE public.newsletter_inscricoes ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON public.newsletter_inscricoes TO anon, authenticated;
GRANT SELECT ON public.newsletter_inscricoes TO authenticated;

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

COMMENT ON TABLE public.newsletter_inscricoes IS 'Armazena e-mails de usuários interessados em receber notícias da plataforma.';

NOTIFY pgrst, 'reload schema';
