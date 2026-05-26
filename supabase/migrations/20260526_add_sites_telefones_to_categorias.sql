-- Adiciona campos de sites institucionais e telefones úteis à tabela categorias
ALTER TABLE categorias
  ADD COLUMN IF NOT EXISTS sites_institucionais TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS telefones_uteis TEXT DEFAULT NULL;
