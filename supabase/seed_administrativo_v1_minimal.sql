-- =====================================================
-- DENUNCIA MS — SEED ADMINISTRATIVO v1.0 (MINIMALISTA)
-- Objetivo: Configurar Categorias e Roteamento de E-mails
-- Impacto: Zero alterações no esquema de tabelas.
-- Executar no SQL Editor do Supabase.
-- =====================================================

-- 1. LIMPEZA PREVENTIVA (Opcional - remova se quiser manter denuncias/logs antigos)
-- DELETE FROM integracoes_destino;
-- DELETE FROM categorias;

-- 2. INSERÇÃO/ATUALIZAÇÃO DE CATEGORIAS (Bloco 1 e 3)
INSERT INTO categorias (slug, label, bloco, emoji, ativo, ordem) VALUES
-- Saude
('saude-publica', 'Saúde Pública', 'Saúde e Bem-Estar', '🏥', true, 1),
('falta-medicamentos', 'Falta de Medicamentos', 'Saúde e Bem-Estar', '💊', true, 9),
('irregularidade-upa', 'Irregularidade em UPA/Hospital', 'Saúde e Bem-Estar', '🚑', true, 4),
('vigilancia-sanitaria', 'Vigilância Sanitária', 'Saúde e Bem-Estar', '🧼', true, 11),
-- Infraestrutura
('buracos-vias', 'Buracos e Vias', 'Infraestrutura e Urbanismo', '🕳️', true, 2),
('iluminacao-publica', 'Iluminação Pública', 'Infraestrutura e Urbanismo', '💡', true, 20),
('obra-irregular', 'Obra Irregular / Abandonada', 'Infraestrutura e Urbanismo', '🚧', true, 21),
('alagamento-drenagem', 'Alagamento / Drenagem', 'Infraestrutura e Urbanismo', '🌊', true, 22),
('transporte-publico', 'Transporte Público', 'Infraestrutura e Urbanismo', '🚌', true, 23),
-- Meio Ambiente
('desmatamento', 'Desmatamento', 'Meio Ambiente', '🌿', true, 30),
('maus-tratos-animais', 'Maus-tratos a Animais', 'Meio Ambiente', '🐾', true, 31),
('descarte-lixo', 'Descarte Irregular de Lixo', 'Meio Ambiente', '♻️', true, 7),
('poluicao', 'Poluição (ar, água, solo)', 'Meio Ambiente', '🏭', true, 32),
('poluicao-sonora', 'Poluição Sonora', 'Meio Ambiente', '🔊', true, 33),
-- Educacao
('escola-precaria', 'Escola em Situação Precária', 'Educação', '🎓', true, 8),
('merenda-irregular', 'Irregularidade na Merenda', 'Educação', '🍽️', true, 40),
('falta-professor', 'Falta de Professor / Aula', 'Educação', '📚', true, 41),
-- Corrupcao
('corrupcao-desvio', 'Corrupção / Desvio de Verba', 'Corrupção e Gestão Pública', '⚖️', true, 3),
('nepotismo', 'Nepotismo', 'Corrupção e Gestão Pública', '👥', true, 50),
('improbidade', 'Improbidade Administrativa', 'Corrupção e Gestão Pública', '📋', true, 51),
('licitacao-fraudulenta', 'Licitação Fraudulenta', 'Corrupção e Gestão Pública', '🏗️', true, 52),
('servidor-inativo', 'Servidor em Inatividade', 'Corrupção e Gestão Pública', '🪑', true, 53),
-- Seguranca
('trafico-drogas', 'Tráfico de Drogas', 'Segurança Pública', '🚓', true, 4),
('porte-ilegal-armas', 'Porte Ilegal de Armas', 'Segurança Pública', '🔫', true, 60),
('ponto-vulnerabilidade', 'Ponto de Vulnerabilidade', 'Segurança Pública', '👁️', true, 61),
('ocupacao-irregular', 'Ocupação Irregular', 'Segurança Pública', '🏚️', true, 62),
-- Assistencia
('crianca-risco', 'Criança em Situação de Risco', 'Assistência Social', '👶', true, 5),
('idoso-risco', 'Idoso em Situação de Risco', 'Assistência Social', '👴', true, 70),
('acessibilidade-negada', 'Acessibilidade Negada', 'Assistência Social', '♿', true, 71),
('familia-vulnerabilidade', 'Família em Vulnerabilidade', 'Assistência Social', '🏠', true, 72),
-- Violencia
('violencia-domestica', 'Violência Doméstica', 'Violência e Gênero', '🚨', true, 6),
('feminicidio-ameaca', 'Feminicídio / Ameaça', 'Violência e Gênero', '👩', true, 80),
('discriminacao', 'Discriminação e Preconceito', 'Violência e Gênero', '🏳️', true, 81)
ON CONFLICT (slug) DO UPDATE SET 
    label = EXCLUDED.label,
    bloco = EXCLUDED.bloco,
    emoji = EXCLUDED.emoji,
    ordem = EXCLUDED.ordem;

-- 3. CONFIGURAÇÃO DE ROTEAMENTO (Bloco 2 e 4)
-- Deleta integrações antigas para limpar o roteamento
DELETE FROM integracoes_destino WHERE categoria_id IN (SELECT id FROM categorias);

-- Inserção massiva de roteamento vinculada aos Slugs
INSERT INTO integracoes_destino (categoria_id, tipo, email_para, email_cc, prioridade)
SELECT 
  id, 
  'email',
  CASE 
    WHEN slug = 'saude-publica' THEN ARRAY['ouvidoria@sesau.campogrande.ms.gov.br']
    WHEN slug = 'falta-medicamentos' THEN ARRAY['ouvidoria@sesau.campogrande.ms.gov.br']
    WHEN slug = 'irregularidade-upa' THEN ARRAY['ouvidoria@sesau.campogrande.ms.gov.br']
    WHEN slug = 'vigilancia-sanitaria' THEN ARRAY['ouvidoria@sesau.campogrande.ms.gov.br']
    WHEN slug = 'buracos-vias' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br'] -- Mapeado para PMCG fallback via e-mail
    WHEN slug = 'iluminacao-publica' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'obra-irregular' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'alagamento-drenagem' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'transporte-publico' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'desmatamento' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'maus-tratos-animais' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'descarte-lixo' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'poluicao' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'poluicao-sonora' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'escola-precaria' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'merenda-irregular' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'falta-professor' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'corrupcao-desvio' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'nepotismo' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'improbidade' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'licitacao-fraudulenta' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'servidor-inativo' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'trafico-drogas' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'porte-ilegal-armas' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'ponto-vulnerabilidade' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'ocupacao-irregular' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'crianca-risco' THEN ARRAY['ouvidoria@sas.campogrande.ms.gov.br']
    WHEN slug = 'idoso-risco' THEN ARRAY['ouvidoria@sas.campogrande.ms.gov.br']
    WHEN slug = 'acessibilidade-negada' THEN ARRAY['ouvidoria@sas.campogrande.ms.gov.br']
    WHEN slug = 'familia-vulnerabilidade' THEN ARRAY['ouvidoria@sas.campogrande.ms.gov.br']
    WHEN slug = 'violencia-domestica' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'feminicidio-ameaca' THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br']
    WHEN slug = 'discriminacao' THEN ARRAY['ouvidoria@sas.campogrande.ms.gov.br']
  END as email_para,
  CASE 
    WHEN slug = 'saude-publica' THEN ARRAY['ouvidoriasus@saude.ms.gov.br']
    WHEN slug = 'falta-medicamentos' THEN ARRAY['ouvidoriasus@saude.ms.gov.br']
    WHEN slug = 'irregularidade-upa' THEN ARRAY['ouvidoriasus@saude.ms.gov.br']
    WHEN slug = 'vigilancia-sanitaria' THEN ARRAY['atendimento@imasul.ms.gov.br'] -- Exemplo de roteamento secundário
    WHEN slug = 'transporte-publico' THEN ARRAY['ouvidoria@agems.ms.gov.br']
    WHEN slug = 'desmatamento' THEN ARRAY['atendimento@imasul.ms.gov.br']
    WHEN slug = 'maus-tratos-animais' THEN ARRAY['ouvidoria.dgpc@pc.ms.gov.br']
    WHEN slug = 'descarte-lixo' THEN ARRAY['atendimento@imasul.ms.gov.br']
    WHEN slug = 'poluicao' THEN ARRAY['atendimento@imasul.ms.gov.br']
    WHEN slug = 'poluicao-sonora' THEN ARRAY['atendimento@imasul.ms.gov.br']
    WHEN slug = 'escola-precaria' THEN ARRAY['sed.ms.gov.br'] -- Fallback url
    WHEN slug = 'merenda-irregular' THEN ARRAY['oge-cge@cge.ms.gov.br', 'ouvidoria@mpms.mp.br']
    WHEN slug = 'corrupcao-desvio' THEN ARRAY['oge-cge@cge.ms.gov.br']
    WHEN slug = 'nepotismo' THEN ARRAY['oge-cge@cge.ms.gov.br']
    WHEN slug = 'improbidade' THEN ARRAY['ouvidoria@mpms.mp.br']
    WHEN slug = 'licitacao-fraudulenta' THEN ARRAY['ouvidoria@tce.ms.gov.br', 'oge-cge@cge.ms.gov.br']
    WHEN slug = 'servidor-inativo' THEN ARRAY['oge-cge@cge.ms.gov.br']
    WHEN slug = 'trafico-drogas' THEN ARRAY['dof@sejusp.ms.gov.br']
    WHEN slug = 'porte-ilegal-armas' THEN ARRAY['ouvidoria.dgpc@pc.ms.gov.br']
    WHEN slug = 'ponto-vulnerabilidade' THEN ARRAY['dof@sejusp.ms.gov.br']
    WHEN slug = 'ocupacao-irregular' THEN ARRAY['agehab.ms.gov.br'] -- Fallback
    WHEN slug = 'crianca-risco' THEN ARRAY['ouvidoria@mpms.mp.br']
    WHEN slug = 'idoso-risco' THEN ARRAY['ouvidoria@mpms.mp.br']
    WHEN slug = 'acessibilidade-negada' THEN ARRAY['mpf.mp.br/atuacao/ouvidoria'] -- Fallback
    WHEN slug = 'violencia-domestica' THEN ARRAY['ouvidoria.dgpc@pc.ms.gov.br']
    WHEN slug = 'feminicidio-ameaca' THEN ARRAY['ouvidoria.dgpc@pc.ms.gov.br']
    WHEN slug = 'discriminacao' THEN ARRAY['ouvidoria@mpms.mp.br']
  END as email_cc,
  CASE 
    WHEN slug IN ('trafico-drogas', 'porte-ilegal-armas', 'crianca-risco', 'idoso-risco', 'violencia-domestica', 'feminicidio-ameaca') THEN 'urgente'
    ELSE 'normal'
  END as prioridade
FROM categorias;

-- 4. ATUALIZAÇÃO DE AVISOS LEGAIS E EMERGÊNCIA (Bloco 5 e 6)
UPDATE categorias SET aviso_legal = '🚨 EMERGÊNCIA: Ligue 192 (SAMU) ou 190 (PM).' WHERE slug = 'irregularidade-upa';
UPDATE categorias SET aviso_legal = '🚨 EMERGÊNCIA: Ligue 199 (Defesa Civil) ou 190 (PM).' WHERE slug = 'alagamento-drenagem';
UPDATE categorias SET aviso_legal = '🚨 EMERGÊNCIA: Ligue 190 (PM) ou 153 (Guarda Municipal).' WHERE slug = 'maus-tratos-animais';
UPDATE categorias SET aviso_legal = '🚨 EMERGÊNCIA: Ligue 190 (PM) ou 197 (Polícia Civil).' WHERE slug = 'trafico-drogas';
UPDATE categorias SET aviso_legal = '🚨 EMERGÊNCIA: Ligue 190 (PM) ou 194 (Polícia Federal).' WHERE slug = 'porte-ilegal-armas';
UPDATE categorias SET aviso_legal = '🚨 EMERGÊNCIA: Ligue 100 (Disque Direitos Humanos) ou 190 (PM).' WHERE slug = 'crianca-risco';
UPDATE categorias SET aviso_legal = '🚨 EMERGÊNCIA: Ligue 100 (Disque Direitos Humanos) ou 192 (SAMU).' WHERE slug = 'idoso-risco';
UPDATE categorias SET aviso_legal = '🚨 EMERGÊNCIA: Ligue 180 (Central da Mulher), 190 (PM) ou 197 (Polícia Civil).' WHERE slug = 'violencia-domestica';
UPDATE categorias SET aviso_legal = '🚨 EMERGÊNCIA: Ligue 190 (PM) ou 180 (Central da Mulher).' WHERE slug = 'feminicidio-ameaca';

-- 5. CONFIGURAÇÃO DE DESTAQUES DA HOME (Bloco 7)
-- Ajustamos a ordem das 8 categorias principais para aparecerem primeiro
UPDATE categorias SET ordem = 1 WHERE slug = 'saude-publica';
UPDATE categorias SET ordem = 2 WHERE slug = 'buracos-vias';
UPDATE categorias SET ordem = 3 WHERE slug = 'corrupcao-desvio';
UPDATE categorias SET ordem = 4 WHERE slug = 'trafico-drogas';
UPDATE categorias SET ordem = 5 WHERE slug = 'crianca-risco';
UPDATE categorias SET ordem = 6 WHERE slug = 'violencia-domestica';
UPDATE categorias SET ordem = 7 WHERE slug = 'descarte-lixo';
UPDATE categorias SET ordem = 8 WHERE slug = 'escola-precaria';

-- Resumo da Execução (Exibir no SQL Editor)
-- SELECT count(*) as total_categorias FROM categorias;
-- SELECT count(*) as total_roteamentos FROM integracoes_destino;
