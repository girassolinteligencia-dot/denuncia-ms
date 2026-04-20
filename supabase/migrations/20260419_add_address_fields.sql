-- MIGRATION: Adicionar campos detalhados de endereço
-- Data: 2026-04-19

ALTER TABLE IF EXISTS denuncias
ADD COLUMN IF NOT EXISTS cep text,
ADD COLUMN IF NOT EXISTS numero text,
ADD COLUMN IF NOT EXISTS bairro text,
ADD COLUMN IF NOT EXISTS cidade text;

-- Comentários para documentação
COMMENT ON COLUMN denuncias.cep IS 'CEP do local da ocorrência';
COMMENT ON COLUMN denuncias.numero IS 'Número do logradouro';
COMMENT ON COLUMN denuncias.bairro IS 'Bairro do local da ocorrência';
COMMENT ON COLUMN denuncias.cidade IS 'Cidade do local da ocorrência';
