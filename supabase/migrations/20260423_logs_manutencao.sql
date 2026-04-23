-- Migração: logs_manutencao
-- Tabela para registrar atividades de limpeza e integridade do sistema

CREATE TABLE IF NOT EXISTS logs_manutencao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL, -- 'cleanup_storage', 'cleanup_rascunhos', 'fix_integridade'
    status TEXT NOT NULL, -- 'sucesso', 'erro'
    detalhes JSONB, -- { "arquivos_deletados": 10, "espaço_recuperado_mb": 45 }
    executado_por TEXT DEFAULT 'sistema', -- 'sistema' (cron) ou ID do admin
    criado_em TIMESTAMPTZ DEFAULT now()
);

-- Indexar por tipo e data para relatórios rápidos
CREATE INDEX idx_logs_manutencao_tipo ON logs_manutencao(tipo);
CREATE INDEX idx_logs_manutencao_criado_em ON logs_manutencao(criado_em);

-- Política RLS (Apenas admins podem ver logs de manutenção)
ALTER TABLE logs_manutencao ENABLE ROW LEVEL SECURITY;

CREATE POLICY logs_manutencao_admin_all ON logs_manutencao
    FOR ALL
    TO authenticated
    USING (tem_role('admin'))
    WITH CHECK (tem_role('admin'));
