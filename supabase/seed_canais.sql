-- =====================================================
-- DENUNCIA MS — Seed de Categorias e Canais
-- Executar no SQL Editor do Supabase para atualizar
-- =====================================================

-- 1. Atualizar/Inserir Categorias
INSERT INTO categorias (bloco, slug, label, emoji, instrucao_publica, ordem) VALUES
('Saúde e Bem-estar', 'saude-publica', 'Saúde Pública', '🏥', 'Encaminhado para SESAU-CG (Ouvidoria Municipal) e SES-MS (Ouvidoria SUS Estadual).', 1),
('Infraestrutura e Urbanismo', 'buracos-vias', 'Buracos e Vias', '🕳️', 'Relatado via SISEP (Campo Grande) e Portal FalaCG.', 2),
('Corrupção e Gestão Pública', 'corrupcao-desvio', 'Corrupção / Desvio de Verba', '⚖️', 'Encaminhado à CGM-CG e CGE-MS / Ouvidoria Geral do Estado.', 3),
('Segurança Pública', 'trafico-drogas', 'Tráfico de Drogas', '🚓', 'Acionamento da Guarda Municipal, SEJUSP-MS e DOF.', 4),
('Assistência Social', 'crianca-risco', 'Criança em Situação de Risco', '👶', 'Acionamento da SEMAS, CREAS, Conselho Tutelar e MP-MS.', 5),
('Violência e Gênero', 'violencia-domestica', 'Violência Doméstica', '🚨', 'Encaminhado à Sec. da Mulher, Casa da Mulher Brasileira, PC-MS e DEAM.', 6),
('Meio Ambiente', 'descarte-lixo', 'Descarte Irregular de Lixo', '♻️', 'Encaminhado ao IMAM / SISEP e IMASUL.', 7),
('Educação', 'escola-precaria', 'Escola em Situação Precária', '🎓', 'Encaminhado à SEMED e SED-MS.', 8),
('Saúde e Bem-estar', 'falta-medicamentos', 'Falta de Medicamentos', '💊', 'Relatos encaminhados à SESAU-CG e SES-MS / Ouvidoria SUS.', 9),
('Saúde e Bem-estar', 'irregularidade-upa', 'Irregularidade em UPA/Hospital', '🚑', 'Fiscalização pela SESAU-CG e SES-MS.', 10),
('Saúde e Bem-estar', 'vigilancia-sanitaria', 'Vigilância Sanitária', '🧼', 'Encaminhado para VISA-CG e VISA-MS.', 11),
('Infraestrutura e Urbanismo', 'iluminacao-publica', 'Iluminação Pública', '💡', 'Encaminhado para SISEP e Energisa MS.', 20),
('Infraestrutura e Urbanismo', 'obra-irregular', 'Obra Irregular / Abandonada', '🚧', 'Fiscalização pela Sec. Munic. de Meio Ambiente e Gestão Urbana (SEMADUR).', 21),
('Infraestrutura e Urbanismo', 'alagamento-drenagem', 'Alagamento / Drenagem', '🌊', 'Acionamento da SISEP e Defesa Civil (CG e MS).', 22),
('Infraestrutura e Urbanismo', 'transporte-publico', 'Transporte Público', '🚌', 'Encaminhado para AGETRAN e AGEMS (Fiscalização Estadual).', 23),
('Meio Ambiente', 'desmatamento', 'Desmatamento', '🌿', 'Denuncia enviada ao IMAM e IMASUL.', 30),
('Meio Ambiente', 'maus-tratos-animais', 'Maus-tratos a Animais', '🐾', 'Acionamento do IMAM, Guarda Municipal e Polícia Civil MS.', 31),
('Meio Ambiente', 'poluicao-geral', 'Poluição (ar, água, solo)', '🏭', 'Encaminhado ao IMAM e IMASUL.', 32),
('Meio Ambiente', 'poluicao-sonora', 'Poluição Sonora', '🔊', 'Acionamento do IMAM e Fiscalização Municipal.', 33),
('Educação', 'merenda-irregular', 'Irregularidade na Merenda', '🍽️', 'Denuncia enviada à SEMED, SED-MS e FNDE.', 40),
('Educação', 'falta-professor', 'Falta de Professor / Aula', '📚', 'Encaminhado à SEMED e SED-MS.', 41),
('Corrupção e Gestão Pública', 'nepotismo', 'Nepotismo', '👥', 'Encaminhado à CGM-CG, CGE-MS e Ministério Público MS.', 50),
('Corrupção e Gestão Pública', 'improbidade-admin', 'Improbidade Administrativa', '📋', 'Relato enviado à CGM-CG, PGM, MP-MS e TCE-MS.', 51),
('Corrupção e Gestão Pública', 'licitacao-fraudulenta', 'Licitação Fraudulenta', '🏗️', 'Encaminhado à CGM-CG, SELC, TCE-MS e CGE-MS.', 52),
('Corrupção e Gestão Pública', 'servidor-inatividade', 'Servidor em Inatividade', '🪑', 'Encaminhado à CGM-CG, SAD e CGE-MS.', 53),
('Segurança Pública', 'porte-armas', 'Porte Ilegal de Armas', '🔫', 'Encaminhado à Guarda Municipal, Polícia Civil e Polícia Federal.', 60),
('Segurança Pública', 'ponto-vulnerabilidade', 'Ponto de Vulnerabilidade', '👁️', 'Relatado à Guarda Municipal e SEJUSP-MS.', 61),
('Segurança Pública', 'ocupacao-irregular', 'Ocupação Irregular', '🏚️', 'Encaminhado à EMHA (CG) e AGEHAB-MS.', 62),
('Assistência Social', 'idoso-risco', 'Idoso em Situação de Risco', '👴', 'Encaminhado à SEMAS, CREAS, MP-MS e SEAD-MS.', 70),
('Assistência Social', 'acessibilidade-negada', 'Acessibilidade Negada', '♿', 'Relatado à SEMAS, SISEP e MPF.', 71),
('Assistência Social', 'familia-vulnerabilidade', 'Família em Vulnerabilidade', '🏠', 'Acionamento da SEMAS, CRAS e SEJUSP.', 72),
('Violência e Gênero', 'feminicidio-ameaca', 'Feminicídio / Ameaça', '👩', 'Acionamento imediato da Sec. da Mulher e Delegacia da Mulher (DEAM).', 80),
('Violência e Gênero', 'discriminacao', 'Discriminação e Preconceito', '🏳️', 'Encaminhado à SEMAS, MP-MS e Defensoria Pública.', 81)
ON CONFLICT (slug) DO UPDATE SET 
  bloco = EXCLUDED.bloco, 
  label = EXCLUDED.label, 
  emoji = EXCLUDED.emoji, 
  instrucao_publica = EXCLUDED.instrucao_publica,
  ordem = EXCLUDED.ordem;

-- 2. Atualizar Avisos Legais (Urgência)
UPDATE categorias SET aviso_legal = '🚨 EMERGÊNCIA: Ligue 192 (SAMU) ou 190 (PM).' WHERE slug = 'irregularidade-upa';
UPDATE categorias SET aviso_legal = '🚨 EMERGÊNCIA: Ligue 199 (Defesa Civil) ou 190 (PM).' WHERE slug = 'alagamento-drenagem';
UPDATE categorias SET aviso_legal = '🚨 EMERGÊNCIA: Ligue 190 (PM) ou 153 (Guarda Municipal).' WHERE slug = 'maus-tratos-animais';
UPDATE categorias SET aviso_legal = '🚨 EMERGÊNCIA: Ligue 190 (PM) ou 197 (Polícia Civil).' WHERE slug = 'trafico-drogas';
UPDATE categorias SET aviso_legal = '🚨 EMERGÊNCIA: Ligue 190 (PM) ou 194 (Polícia Federal).' WHERE slug = 'porte-armas';
UPDATE categorias SET aviso_legal = '🚨 EMERGÊNCIA: Ligue 100 (Disque Direitos Humanos) ou 190 (PM).' WHERE slug = 'crianca-risco';
UPDATE categorias SET aviso_legal = '🚨 EMERGÊNCIA: Ligue 100 (Disque Direitos Humanos) ou 192 (SAMU).' WHERE slug = 'idoso-risco';
UPDATE categorias SET aviso_legal = '🚨 EMERGÊNCIA: Ligue 180 (Central da Mulher), 190 (PM) ou 197 (Polícia Civil).' WHERE slug = 'violencia-domestica';
UPDATE categorias SET aviso_legal = '🚨 EMERGÊNCIA: Ligue 190 (PM) ou 180 (Central da Mulher).' WHERE slug = 'feminicidio-ameaca';

-- 3. Inserir Integrações de Destino
-- Limpa integrações existentes para evitar duplicidade durante o seed (opcional, dependendo da necessidade)
-- DELETE FROM integracoes_destino; 

WITH categoria_ids AS (SELECT id, slug FROM categorias)
INSERT INTO integracoes_destino (categoria_id, tipo, email_para, prioridade)
SELECT 
  c.id, 
  'email', 
  CASE 
    WHEN c.slug IN ('saude-publica', 'falta-medicamentos', 'irregularidade-upa', 'vigilancia-sanitaria') 
      THEN ARRAY['ouvidoria@sesau.campogrande.ms.gov.br', 'ouvidoriasus@saude.ms.gov.br']
    WHEN c.slug IN ('corrupcao-desvio', 'nepotismo', 'servidor-inatividade') 
      THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br', 'oge-cge@cge.ms.gov.br']
    WHEN c.slug IN ('improbidade-admin') 
      THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br', 'ouvidoria@mpms.mp.br']
    WHEN c.slug IN ('licitacao-fraudulenta') 
      THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br', 'ouvidoria@tce.ms.gov.br']
    WHEN c.slug IN ('desmatamento', 'descarte-lixo', 'poluicao-geral', 'poluicao-sonora') 
      THEN ARRAY['atendimento@imasul.ms.gov.br']
    WHEN c.slug IN ('maus-tratos-animais', 'porte-armas', 'violencia-domestica', 'feminicidio-ameaca') 
      THEN ARRAY['ouvidoria.dgpc@pc.ms.gov.br']
    WHEN c.slug IN ('trafico-drogas') 
      THEN ARRAY['dof@sejusp.ms.gov.br']
    WHEN c.slug IN ('transporte-publico') 
      THEN ARRAY['ouvidoria@agems.ms.gov.br']
    WHEN c.slug IN ('escola-precaria', 'merenda-irregular', 'falta-professor')
      THEN ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br', 'ouvidoria@mpms.mp.br']
    WHEN c.slug IN ('crianca-risco', 'idoso-risco', 'discriminacao') 
      THEN ARRAY['ouvidoria@sas.campogrande.ms.gov.br', 'ouvidoria@mpms.mp.br']
    WHEN c.slug IN ('acessibilidade-negada') 
      THEN ARRAY['ouvidoria@sas.campogrande.ms.gov.br', 'municipio@mpf.mp.br']
    ELSE ARRAY['ouvidoriageral@cgm.campogrande.ms.gov.br'] 
  END,
  CASE 
    WHEN c.slug IN ('trafico-drogas', 'crianca-risco', 'violencia-domestica', 'feminicidio-ameaca', 'idoso-risco') THEN 'urgente'::text
    ELSE 'normal'::text
  END
FROM categoria_ids c
ON CONFLICT (id) DO UPDATE SET email_para = EXCLUDED.email_para, prioridade = EXCLUDED.prioridade;
