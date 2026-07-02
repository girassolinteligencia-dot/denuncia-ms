CREATE TABLE IF NOT EXISTS public.cargos_publicos (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome           text NOT NULL,
  tipo           text NOT NULL DEFAULT 'ambos'
                 CHECK (tipo IN ('servidor_publico', 'agente_politico', 'ambos')),
  setor          text,
  ativo          boolean NOT NULL DEFAULT true,
  criado_em      timestamptz NOT NULL DEFAULT now(),
  atualizado_em  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cargos_publicos_ativo
  ON public.cargos_publicos (ativo);

CREATE INDEX IF NOT EXISTS idx_cargos_publicos_tipo
  ON public.cargos_publicos (tipo);

CREATE INDEX IF NOT EXISTS idx_cargos_publicos_nome_lower
  ON public.cargos_publicos (lower(nome));

CREATE INDEX IF NOT EXISTS idx_cargos_publicos_setor_lower
  ON public.cargos_publicos (lower(setor));

ALTER TABLE public.cargos_publicos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cargos_publicos_public_read" ON public.cargos_publicos;

CREATE POLICY "cargos_publicos_public_read"
  ON public.cargos_publicos
  FOR SELECT
  TO anon, authenticated
  USING (ativo = true);

GRANT SELECT ON public.cargos_publicos TO anon, authenticated;
