-- =====================================================
-- Migration: 20260424_suporte_coordenadas_precisas.sql
-- Descrição: Adiciona suporte a latitude e longitude para inteligência geográfica
-- =====================================================

-- 1. Adicionar as colunas de coordenadas (Decimal para alta precisão)
ALTER TABLE denuncias ADD COLUMN IF NOT EXISTS latitude numeric(10, 8);
ALTER TABLE denuncias ADD COLUMN IF NOT EXISTS longitude numeric(11, 8);

-- 2. Criar índices espaciais (Simples, para performance de busca por região)
CREATE INDEX IF NOT EXISTS idx_denuncias_coords ON denuncias(latitude, longitude);

-- 3. (Opcional) Comentários para documentação de banco
COMMENT ON COLUMN denuncias.latitude IS 'Latitude capturada pelo GPS ou geocodificação';
COMMENT ON COLUMN denuncias.longitude IS 'Longitude capturada pelo GPS ou geocodificação';
