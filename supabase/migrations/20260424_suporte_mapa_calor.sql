-- =====================================================
-- Migration: 20260424_suporte_mapa_calor_v2.sql
-- Descrição: Adiciona coluna de município estruturada e migra dados
-- =====================================================

-- 1. Adicionar a coluna municipio
ALTER TABLE denuncias ADD COLUMN IF NOT EXISTS municipio text;

-- 2. Criar índice para performance de agregação
CREATE INDEX IF NOT EXISTS idx_denuncias_municipio ON denuncias(municipio);

-- 3. Tentar extrair o município de registros existentes
-- Assume o formato "Rua, Num, Bairro, Cidade"
UPDATE denuncias 
SET municipio = trim(split_part(local, ',', 4))
WHERE (municipio IS NULL OR municipio = '') 
  AND local IS NOT NULL 
  AND local LIKE '%,%,%,%';

-- 4. Backup: Se for apenas "Bairro, Cidade"
UPDATE denuncias 
SET municipio = trim(split_part(local, ',', 2))
WHERE (municipio IS NULL OR municipio = '') 
  AND local IS NOT NULL 
  AND local LIKE '%,%'
  AND local NOT LIKE '%,%,%,%';
