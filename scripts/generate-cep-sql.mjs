import fs from 'fs';
import readline from 'readline';

const inputFile = 'c:/.MAIS/fontedados/cadastro_cep_ms.json';
const outputFile = 'supabase/seed_ceps.sql';

async function generateSql() {
  const fileStream = fs.createReadStream(inputFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  let batch = [];
  const batchSize = 1000;

  const writeStream = fs.createWriteStream(outputFile);
  writeStream.write('-- SEED: Cadastro de CEPs MS\n');
  writeStream.write('-- Gerado em: ' + new Date().toISOString() + '\n\n');

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const data = JSON.parse(line);
      
      // Escape single quotes for SQL
      const escape = (str) => {
        if (str === null || str === undefined) return 'NULL';
        return "'" + str.toString().replace(/'/g, "''") + "'";
      };

      batch.push(`(${escape(data.cep)}, ${escape(data.logradouro)}, ${escape(data.localidade)}, ${escape(data.nome_municipio)}, ${escape(data.sigla_uf)}, ${escape(data.id_municipio)}, ${escape(data.estabelecimentos)}, ${escape(data.centroide)})`);
      
      count++;

      if (batch.length >= batchSize) {
        writeStream.write(`INSERT INTO localidades_cep (cep, logradouro, bairro, cidade, uf, id_municipio, estabelecimentos, centroide) VALUES\n`);
        writeStream.write(batch.join(',\n') + '\n');
        writeStream.write(`ON CONFLICT (cep) DO NOTHING;\n\n`);
        batch = [];
        console.log(`Processados ${count} registros...`);
      }
    } catch (err) {
      console.error('Erro ao processar linha:', err);
    }
  }

  if (batch.length > 0) {
    writeStream.write(`INSERT INTO localidades_cep (cep, logradouro, bairro, cidade, uf, id_municipio, estabelecimentos, centroide) VALUES\n`);
    writeStream.write(batch.join(',\n') + '\n');
    writeStream.write(`ON CONFLICT (cep) DO NOTHING;\n\n`);
  }

  writeStream.end();
  console.log(`Finalizado! Total: ${count} registros.`);
}

generateSql();
