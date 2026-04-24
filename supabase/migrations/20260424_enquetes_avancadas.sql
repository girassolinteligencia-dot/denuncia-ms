-- Evolução do Sistema de Enquetes: Prazo, Limites e Status
ALTER TABLE public.enquetes 
ADD COLUMN IF NOT EXISTS data_expiracao TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS limite_votos INTEGER,
ADD COLUMN IF NOT EXISTS encerrada_manualmente BOOLEAN DEFAULT false;

-- Comentários para documentação
COMMENT ON COLUMN public.enquetes.data_expiracao IS 'Data e hora limite para votação.';
COMMENT ON COLUMN public.enquetes.limite_votos IS 'Quantidade máxima de votos permitida para esta enquete.';
COMMENT ON COLUMN public.enquetes.encerrada_manualmente IS 'Flag para intervenção direta do administrador.';

-- Criar uma View para facilitar o cálculo de status em tempo real
CREATE OR REPLACE VIEW public.view_enquetes_status AS
SELECT 
    e.*,
    COUNT(v.id) as total_votos,
    CASE 
        WHEN e.encerrada_manualmente THEN 'encerrada'
        WHEN e.data_expiracao IS NOT NULL AND e.data_expiracao < NOW() THEN 'expirada'
        WHEN e.limite_votos IS NOT NULL AND (SELECT COUNT(*) FROM public.enquete_votos v2 WHERE v2.enquete_id = e.id) >= e.limite_votos THEN 'limite_atingido'
        ELSE 'ativa'
    END as status_atual
FROM public.enquetes e
LEFT JOIN public.enquete_votos v ON v.enquete_id = e.id
GROUP BY e.id;
