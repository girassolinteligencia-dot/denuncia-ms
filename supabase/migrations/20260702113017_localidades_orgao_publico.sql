-- Localidades/orgaos publicos selecionaveis no formulario de denuncia.
CREATE TABLE IF NOT EXISTS public.localidades_publicas (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome           text NOT NULL,
  sigla          text,
  endereco       text,
  municipio      text NOT NULL,
  cnpj           text,
  telefone       text,
  ativo          boolean NOT NULL DEFAULT true,
  criado_em      timestamptz NOT NULL DEFAULT now(),
  atualizado_em  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categorias
  ADD COLUMN IF NOT EXISTS tipo_localizacao text NOT NULL DEFAULT 'manual'
  CHECK (tipo_localizacao IN ('manual', 'orgao_publico'));

ALTER TABLE public.denuncias
  ADD COLUMN IF NOT EXISTS localidade_publica_id uuid
  REFERENCES public.localidades_publicas(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_localidades_publicas_ativo
  ON public.localidades_publicas (ativo);

CREATE INDEX IF NOT EXISTS idx_localidades_publicas_nome_lower
  ON public.localidades_publicas (lower(nome));

CREATE INDEX IF NOT EXISTS idx_localidades_publicas_sigla_lower
  ON public.localidades_publicas (lower(sigla));

CREATE INDEX IF NOT EXISTS idx_localidades_publicas_municipio_lower
  ON public.localidades_publicas (lower(municipio));

CREATE INDEX IF NOT EXISTS idx_localidades_publicas_cnpj
  ON public.localidades_publicas (cnpj);

CREATE INDEX IF NOT EXISTS idx_denuncias_localidade_publica
  ON public.denuncias (localidade_publica_id);

ALTER TABLE public.localidades_publicas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "localidades_publicas_public_read" ON public.localidades_publicas;
DROP POLICY IF EXISTS "localidades_publicas_admin_all" ON public.localidades_publicas;

CREATE POLICY "localidades_publicas_public_read"
  ON public.localidades_publicas
  FOR SELECT
  TO anon, authenticated
  USING (ativo = true);

GRANT SELECT ON public.localidades_publicas TO anon, authenticated;
