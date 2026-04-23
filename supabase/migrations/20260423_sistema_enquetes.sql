-- Tabelas para Sistema de Enquetes Parametrizáveis

-- 1. Tabela de Enquetes
CREATE TABLE IF NOT EXISTS public.enquetes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT,
    ativa BOOLEAN DEFAULT true,
    local_exibicao TEXT DEFAULT 'landing', -- 'landing' ou 'noticias'
    criado_em TIMESTAMPTZ DEFAULT now(),
    encerrada_em TIMESTAMPTZ
);

-- 2. Tabela de Opções
CREATE TABLE IF NOT EXISTS public.enquete_opcoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    enquete_id UUID REFERENCES public.enquetes(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    ordem INTEGER DEFAULT 0,
    votos_fake INTEGER DEFAULT 0 -- Opcional: para iniciar com base
);

-- 3. Tabela de Votos (Controle de IP)
CREATE TABLE IF NOT EXISTS public.enquete_votos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    enquete_id UUID REFERENCES public.enquetes(id) ON DELETE CASCADE,
    opcao_id UUID REFERENCES public.enquete_opcoes(id) ON DELETE CASCADE,
    ip_hash TEXT NOT NULL, -- SHA256 do IP do usuário
    criado_em TIMESTAMPTZ DEFAULT now(),
    UNIQUE(enquete_id, ip_hash) -- Impede votos duplicados do mesmo IP na mesma enquete
);

-- Habilitar RLS
ALTER TABLE public.enquetes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquete_opcoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquete_votos ENABLE ROW LEVEL SECURITY;

-- Políticas Públicas (Leitura e Voto)
CREATE POLICY "Permitir leitura pública de enquetes ativas" ON public.enquetes
FOR SELECT USING (ativa = true);

CREATE POLICY "Permitir leitura pública de opções" ON public.enquete_opcoes
FOR SELECT USING (true);

CREATE POLICY "Permitir inserção anônima de votos" ON public.enquete_votos
FOR INSERT WITH CHECK (true);

-- Configuração inicial para a pesquisa de satisfação global (Toggle)
INSERT INTO public.plataforma_config (chave, valor)
VALUES ('funcionalidade.pesquisa_satisfacao_ativa', 'true')
ON CONFLICT (chave) DO NOTHING;
