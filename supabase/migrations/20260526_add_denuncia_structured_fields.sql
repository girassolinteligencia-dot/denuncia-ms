-- Migration: adiciona campos estruturados à tabela denuncias
-- Esses dados são coletados no formulário mas não estavam sendo persistidos,
-- fazendo com que se perdessem após o envio e não pudessem aparecer no PDF.

ALTER TABLE denuncias
  ADD COLUMN IF NOT EXISTS hora_ocorrido       time,
  ADD COLUMN IF NOT EXISTS autor_nome          text,
  ADD COLUMN IF NOT EXISTS testemunhas         text,
  ADD COLUMN IF NOT EXISTS servidor_publico    text CHECK (servidor_publico IN ('sim', 'nao')),
  ADD COLUMN IF NOT EXISTS setor_servidor      text,
  ADD COLUMN IF NOT EXISTS agente_politico     text CHECK (agente_politico IN ('sim', 'nao')),
  ADD COLUMN IF NOT EXISTS cargo_agente        text,
  ADD COLUMN IF NOT EXISTS links               text[];

COMMENT ON COLUMN denuncias.hora_ocorrido    IS 'Horário aproximado do ocorrido (preenchido pelo denunciante)';
COMMENT ON COLUMN denuncias.autor_nome       IS 'Nome completo do suposto autor declarado pelo denunciante';
COMMENT ON COLUMN denuncias.testemunhas      IS 'Nomes ou descrições de testemunhas indicadas pelo denunciante';
COMMENT ON COLUMN denuncias.servidor_publico IS 'O suposto autor é servidor público? (sim/nao)';
COMMENT ON COLUMN denuncias.setor_servidor   IS 'Setor de atuação do servidor público';
COMMENT ON COLUMN denuncias.agente_politico  IS 'O suposto autor é agente político? (sim/nao)';
COMMENT ON COLUMN denuncias.cargo_agente     IS 'Cargo declarado do servidor ou agente político';
COMMENT ON COLUMN denuncias.links            IS 'URLs indicadas pelo denunciante como evidência (até 5)';
