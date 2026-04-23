-- Tabelas para engajamento e feedback
CREATE TABLE IF NOT EXISTS public.pesquisas_satisfacao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voto TEXT NOT NULL, -- ruim, regular, bom, excelente
    comentario TEXT,
    criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.newsletter_inscricoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    criado_em TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS (Segurança)
ALTER TABLE public.pesquisas_satisfacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_inscricoes ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir inserção anônima (Público)
CREATE POLICY "Permitir inserção anônima de feedback" ON public.pesquisas_satisfacao
FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir inserção anônima de newsletter" ON public.newsletter_inscricoes
FOR INSERT WITH CHECK (true);

-- Comentários para documentação
COMMENT ON TABLE public.pesquisas_satisfacao IS 'Armazena feedbacks anônimos de usuários sobre a experiência na plataforma.';
COMMENT ON TABLE public.newsletter_inscricoes IS 'Armazena e-mails de usuários interessados em receber notícias da plataforma.';
