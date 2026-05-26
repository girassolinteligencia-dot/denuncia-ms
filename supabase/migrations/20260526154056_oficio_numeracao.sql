-- =====================================================
-- Migration: oficio_numeracao
-- Controle de numeração sequencial de ofícios, renovado anualmente.
-- Formato: DMS-OFÍCIO-AAAA-NNNNN
-- =====================================================

CREATE TABLE IF NOT EXISTS public.oficio_numeracao (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ano          integer     NOT NULL,
  sequencial   integer     NOT NULL,
  denuncia_id  uuid        NOT NULL REFERENCES public.denuncias(id) ON DELETE RESTRICT,
  gerado_por   uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  gerado_em    timestamptz DEFAULT now(),
  UNIQUE (ano, sequencial),
  UNIQUE (ano, denuncia_id)
);

CREATE INDEX IF NOT EXISTS idx_oficio_ano_seq ON public.oficio_numeracao(ano, sequencial);
CREATE INDEX IF NOT EXISTS idx_oficio_denuncia ON public.oficio_numeracao(denuncia_id);

ALTER TABLE public.oficio_numeracao ENABLE ROW LEVEL SECURITY;

CREATE POLICY oficio_numeracao_admin_select ON public.oficio_numeracao
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY oficio_numeracao_insert_system ON public.oficio_numeracao
  FOR INSERT
  WITH CHECK (true);

-- Retorna o próximo número sequencial para o ano informado
CREATE OR REPLACE FUNCTION public.proximo_numero_oficio(p_ano integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seq integer;
BEGIN
  SELECT COALESCE(MAX(sequencial), 0) + 1
    INTO v_seq
    FROM public.oficio_numeracao
   WHERE ano = p_ano;
  RETURN v_seq;
END;
$$;

REVOKE ALL ON FUNCTION public.proximo_numero_oficio(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.proximo_numero_oficio(integer) TO service_role;

NOTIFY pgrst, 'reload schema';
