-- =====================================================
-- Migration: 20260424_configuracoes_sistema.sql
-- Descrição: Tabela central de chaves de controle do sistema
-- =====================================================

CREATE TABLE IF NOT EXISTS sistema_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chave text UNIQUE NOT NULL,
  valor text NOT NULL,
  descricao text,
  atualizado_em timestamptz DEFAULT now(),
  atualizado_por uuid REFERENCES auth.users(id)
);

-- Habilitar RLS
ALTER TABLE sistema_config ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver para evitar erro 42710
DROP POLICY IF EXISTS "Admin full access" ON sistema_config;
DROP POLICY IF EXISTS "Public read specific keys" ON sistema_config;
DROP POLICY IF EXISTS "Leitura pública seletiva" ON sistema_config;

-- Política de Acesso Total para Admins
CREATE POLICY "Admin full access" 
  ON sistema_config
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política de Leitura Pública Seletiva
CREATE POLICY "Leitura pública seletiva" 
  ON sistema_config
  FOR SELECT TO anon
  USING (chave IN ('sala_situacao_ativa', 'manutencao_global', 'status_emergencia', 'mensagem_emergencia'));

-- Inserir configuração inicial
INSERT INTO sistema_config (chave, valor, descricao)
VALUES 
  ('sala_situacao_ativa', 'true', 'Controla a visibilidade pública da Sala de Situação'),
  ('manutencao_global', 'false', 'Ativa o modo de manutenção em toda a plataforma'),
  ('status_emergencia', 'false', 'BOTÃO DE PÂNICO: Suspende todas as operações imediatamente'),
  ('mensagem_emergencia', 'Acesso suspenso temporariamente por motivos de segurança institucional.', 'Texto exibido durante o desligamento de emergência')
ON CONFLICT (chave) DO NOTHING;
