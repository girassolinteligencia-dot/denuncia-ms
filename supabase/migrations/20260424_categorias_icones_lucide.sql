-- =====================================================
-- Migration: 20260424_categorias_icones_lucide.sql
-- Descrição: Migração de emojis para ícones Lucide
-- =====================================================

-- 1. Renomear a coluna emoji para icon_name
ALTER TABLE categorias RENAME COLUMN emoji TO icon_name;

-- 2. Atualizar os ícones para nomes compatíveis com Lucide React
UPDATE categorias SET icon_name = 'Hospital' WHERE slug = 'saude-publica';
UPDATE categorias SET icon_name = 'Pill' WHERE slug = 'falta-medicamentos';
UPDATE categorias SET icon_name = 'Stethoscope' WHERE slug = 'irregularidade-upa';
UPDATE categorias SET icon_name = 'ShieldCheck' WHERE slug = 'vigilancia-sanitaria';

UPDATE categorias SET icon_name = 'Construction' WHERE slug = 'buracos-vias';
UPDATE categorias SET icon_name = 'Lightbulb' WHERE slug = 'iluminacao-publica';
UPDATE categorias SET icon_name = 'HardHat' WHERE slug = 'obra-irregular';
UPDATE categorias SET icon_name = 'Waves' WHERE slug = 'alagamento-drenagem';
UPDATE categorias SET icon_name = 'Bus' WHERE slug = 'transporte-publico';

UPDATE categorias SET icon_name = 'Leaf' WHERE slug = 'desmatamento';
UPDATE categorias SET icon_name = 'ShieldAlert' WHERE slug = 'maus-tratos-animais';
UPDATE categorias SET icon_name = 'Trash2' WHERE slug = 'descarte-lixo';
UPDATE categorias SET icon_name = 'Factory' WHERE slug = 'poluicao-geral';
UPDATE categorias SET icon_name = 'Volume2' WHERE slug = 'poluicao-sonora';

UPDATE categorias SET icon_name = 'GraduationCap' WHERE slug = 'escola-precaria';
UPDATE categorias SET icon_name = 'Utensils' WHERE slug = 'merenda-irregular';
UPDATE categorias SET icon_name = 'BookOpen' WHERE slug = 'falta-professor';

UPDATE categorias SET icon_name = 'Gavel' WHERE slug = 'corrupcao-desvio';
UPDATE categorias SET icon_name = 'Users' WHERE slug = 'nepotismo';
UPDATE categorias SET icon_name = 'FileText' WHERE slug = 'improbidade-admin';
UPDATE categorias SET icon_name = 'Hammer' WHERE slug = 'licitacao-fraudulenta';
UPDATE categorias SET icon_name = 'UserX' WHERE slug = 'servidor-inatividade';

UPDATE categorias SET icon_name = 'Siren' WHERE slug = 'trafico-drogas';
UPDATE categorias SET icon_name = 'ShieldAlert' WHERE slug = 'porte-armas';
UPDATE categorias SET icon_name = 'Eye' WHERE slug = 'ponto-vulnerabilidade';
UPDATE categorias SET icon_name = 'Home' WHERE slug = 'ocupacao-irregular';

UPDATE categorias SET icon_name = 'Baby' WHERE slug = 'crianca-risco';
UPDATE categorias SET icon_name = 'UserRound' WHERE slug = 'idoso-risco';
UPDATE categorias SET icon_name = 'Accessibility' WHERE slug = 'acessibilidade-negada';
UPDATE categorias SET icon_name = 'Home' WHERE slug = 'familia-vulnerabilidade';

UPDATE categorias SET icon_name = 'ShieldAlert' WHERE slug = 'violencia-domestica';
UPDATE categorias SET icon_name = 'UserRound' WHERE slug = 'feminicidio-ameaca';
UPDATE categorias SET icon_name = 'Scale' WHERE slug = 'discriminacao';

-- Fallback para ícones não mapeados
UPDATE categorias SET icon_name = 'FolderOpen' WHERE icon_name IS NULL;
