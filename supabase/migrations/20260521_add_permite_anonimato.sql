-- =====================================================
-- Migration: 20260521_add_permite_anonimato.sql
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categorias' AND column_name='permite_anonimato') THEN
        ALTER TABLE categorias ADD COLUMN permite_anonimato boolean DEFAULT false;
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
