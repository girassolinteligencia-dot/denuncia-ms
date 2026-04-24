-- =====================================================
-- Migration: 20260424_fix_denuncias_schema_final.sql
-- Descrição: Garante que todas as colunas de endereço existam na tabela denuncias
--            para evitar erros de sincronização de cache no Vercel/Supabase.
-- =====================================================

DO $$ 
BEGIN
    -- Adicionar colunas se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='denuncias' AND column_name='cep') THEN
        ALTER TABLE denuncias ADD COLUMN cep text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='denuncias' AND column_name='numero') THEN
        ALTER TABLE denuncias ADD COLUMN numero text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='denuncias' AND column_name='bairro') THEN
        ALTER TABLE denuncias ADD COLUMN bairro text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='denuncias' AND column_name='cidade') THEN
        ALTER TABLE denuncias ADD COLUMN cidade text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='denuncias' AND column_name='municipio') THEN
        ALTER TABLE denuncias ADD COLUMN municipio text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='denuncias' AND column_name='latitude') THEN
        ALTER TABLE denuncias ADD COLUMN latitude numeric;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='denuncias' AND column_name='longitude') THEN
        ALTER TABLE denuncias ADD COLUMN longitude numeric;
    END IF;

END $$;

-- Tentar forçar o reload do cache do PostgREST
NOTIFY pgrst, 'reload schema';
