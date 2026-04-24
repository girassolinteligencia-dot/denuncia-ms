-- Adiciona coluna de permissões granulares à tabela de perfis
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS permissoes JSONB DEFAULT '[]'::jsonb;

-- Comentário explicativo para documentação do DB
COMMENT ON COLUMN public.profiles.permissoes IS 'Array de chaves de módulos permitidos para acesso granular no painel adm.';

-- Atualiza permissões padrão para administradores existentes (Acesso Total)
UPDATE public.profiles 
SET permissoes = '["dashboard", "denuncias", "categorias", "comunicacao", "usuarios", "configuracoes", "seguranca"]'::jsonb
WHERE role = 'admin';

-- Atualiza permissões padrão para moderadores/analistas existentes (Foco Operacional)
UPDATE public.profiles 
SET permissoes = '["dashboard", "denuncias", "categorias", "comunicacao"]'::jsonb
WHERE role = 'moderador';

-- Atualiza permissões padrão para comunicadores existentes (Foco em Conteúdo)
UPDATE public.profiles 
SET permissoes = '["dashboard", "comunicacao"]'::jsonb
WHERE role = 'comunicador';
