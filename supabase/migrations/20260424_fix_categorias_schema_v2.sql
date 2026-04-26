-- =====================================================
-- Migration: 20260424_fix_categorias_schema_v2.sql
-- Descrição: Adiciona colunas para e-mail de destino e 
--            garante integridade dos campos de instrução e aviso.
-- =====================================================

DO $$ 
BEGIN
    -- 1. Adicionar email_destino se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categorias' AND column_name='email_destino') THEN
        ALTER TABLE categorias ADD COLUMN email_destino text;
    END IF;

    -- 2. Garantir que instrucao_publica exista
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categorias' AND column_name='instrucao_publica') THEN
        ALTER TABLE categorias ADD COLUMN instrucao_publica text;
    END IF;

    -- 3. Garantir que aviso_legal exista
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categorias' AND column_name='aviso_legal') THEN
        ALTER TABLE categorias ADD COLUMN aviso_legal text;
    END IF;

    -- 4. Garantir que icon_name exista (fallback caso a migração anterior tenha falhado)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categorias' AND column_name='icon_name') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categorias' AND column_name='emoji') THEN
            ALTER TABLE categorias RENAME COLUMN emoji TO icon_name;
        ELSE
            ALTER TABLE categorias ADD COLUMN icon_name text DEFAULT 'FolderOpen';
        END IF;
    END IF;

END $$;

-- Tentar forçar o reload do cache do PostgREST para refletir as mudanças na API
NOTIFY pgrst, 'reload schema';
