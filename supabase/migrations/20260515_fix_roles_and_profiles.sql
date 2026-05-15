-- MIGRATION: Fix Role Constraints and Repair Profiles
-- Objetivo: Garantir que todos os roles do sistema sejam aceitos e que todos os usuários tenham perfil.

-- 1. Remover constraint antiga de roles (se existir)
DO $$
BEGIN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- 2. Adicionar nova constraint com todos os roles suportados
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('superadmin', 'admin', 'moderador', 'comunicador', 'gestor_cupula', 'user'));

-- 3. Garantir colunas necessárias
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS permissoes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ DEFAULT now();

-- 4. REPARO: Criar perfis para usuários do Auth que não possuem perfil
INSERT INTO public.profiles (id, nome, role, ativo, criado_em)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'nome', split_part(email, '@', 1)), 
    'moderador', 
    true, 
    created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 5. REPARO: Garantir permissões para Administradores Mestres
UPDATE public.profiles 
SET 
    role = 'superadmin',
    permissoes = '["dashboard", "denuncias", "categorias", "comunicacao", "usuarios", "configuracoes", "seguranca"]'::jsonb
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('plataformainteligente@gmail.com', 'paulofernandogarcardoso@gmail.com', 'pastygomez@gmail.com')
);

-- 6. REPARO: Definir permissões padrão para outros roles se estiverem vazias
UPDATE public.profiles 
SET permissoes = '["dashboard", "denuncias", "categorias", "comunicacao"]'::jsonb
WHERE role = 'moderador' AND (permissoes IS NULL OR permissoes = '[]'::jsonb);

UPDATE public.profiles 
SET permissoes = '["dashboard", "comunicacao"]'::jsonb
WHERE role = 'comunicador' AND (permissoes IS NULL OR permissoes = '[]'::jsonb);
