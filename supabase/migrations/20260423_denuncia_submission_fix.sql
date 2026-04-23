-- =====================================================
-- Migration: 20260423_denuncia_submission_fix.sql
-- Descrição: Corrige erros críticos que impedem o envio.
-- =====================================================

-- 1. Tornar documento_final opcional na tabela denuncias
-- (O PDF é gerado após a criação do registro e seu link é salvo em pdf_assinaturas)
ALTER TABLE public.denuncias 
ALTER COLUMN documento_final DROP NOT NULL;

-- 2. Garantir que a tabela config_protocolo tenha o registro inicial
-- Se não houver nenhum registro, o RPC retornar vazio e falha a geração do código.
INSERT INTO public.config_protocolo (prefixo, separador, formato_ano, digitos_seq, sequencia_atual)
SELECT 'DNS', '-', 'YYYY', 6, 0
WHERE NOT EXISTS (SELECT 1 FROM public.config_protocolo);

-- 3. Relaxar a restrição de tipos de arquivos para aceitar MIME types comuns
-- Atualmente falha se o browser enviar 'image/png' por causa do CHECK (tipo IN (...))
ALTER TABLE public.arquivos_denuncia DROP CONSTRAINT IF EXISTS arquivos_denuncia_tipo_check;

-- Adiciona uma nova restrição mais abrangente ou apenas permite texto livre para mapeamento via código
ALTER TABLE public.arquivos_denuncia 
ADD CONSTRAINT arquivos_denuncia_tipo_check 
CHECK (tipo IS NOT NULL); -- A validação será feita na Server Action

-- 4. Garantir que a função de incremento seja resiliente
CREATE OR REPLACE FUNCTION public.incrementar_protocolo()
RETURNS SETOF public.config_protocolo
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Se por algum motivo a tabela estiver vazia (apesar do insert acima), garante um fallback
  IF NOT EXISTS (SELECT 1 FROM public.config_protocolo) THEN
    INSERT INTO public.config_protocolo (prefixo, separador, formato_ano, digitos_seq, sequencia_atual)
    VALUES ('DNS', '-', 'YYYY', 6, 1);
  END IF;

  RETURN QUERY
    UPDATE public.config_protocolo
    SET sequencia_atual = sequencia_atual + 1
    RETURNING *;
END;
$$;
