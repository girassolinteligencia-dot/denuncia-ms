-- Migration: 20260421_create_auth_tokens.sql
-- Propósito: Criar tabela para Autenticação temporária (OTP) em conformidade legal (Sem registro permanente em perfis)

CREATE TABLE IF NOT EXISTS public.auth_tokens (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices e restrições para não aceitar lixo ou buscar lento
CREATE INDEX IF NOT EXISTS auth_tokens_email_idx ON public.auth_tokens (email);
CREATE INDEX IF NOT EXISTS auth_tokens_codigo_idx ON public.auth_tokens (codigo);

-- A segurança RLS garante que o frontend "anônimo" na Vercel (cliente) NUNCA possa ler essa tabela publicamente.
-- Somente via Node Server Actions com privilégio administrativo bypass (Service Role)
ALTER TABLE public.auth_tokens ENABLE ROW LEVEL SECURITY;

-- Por segurança, nem Select nem Insert público
CREATE POLICY "server_only_auth_tokens"
ON public.auth_tokens
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
