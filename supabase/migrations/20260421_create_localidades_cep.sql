-- MIGRATION: Criar tabela de localidades por CEP
-- Data: 2026-04-21

CREATE TABLE IF NOT EXISTS localidades_cep (
  cep               text PRIMARY KEY,
  logradouro        text,
  bairro            text,
  cidade            text,
  uf                text DEFAULT 'MS',
  id_municipio      text,
  estabelecimentos  text,
  centroide         text,
  criado_em         timestamptz DEFAULT now()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_localidades_cep_cidade ON localidades_cep(cidade);
CREATE INDEX IF NOT EXISTS idx_localidades_cep_bairro ON localidades_cep(bairro);

-- Habilitar RLS
ALTER TABLE localidades_cep ENABLE ROW LEVEL SECURITY;

-- Permissões: Leitura pública para o formulário
DROP POLICY IF EXISTS "public_read_localidades" ON localidades_cep;
CREATE POLICY "public_read_localidades" ON localidades_cep FOR SELECT USING (true);

-- Permissões: Escrita apenas para admin/escopo interno (via Service Role se necessário)
-- Por padrão, ninguém além do admin via dashboard ou service role pode inserir.
