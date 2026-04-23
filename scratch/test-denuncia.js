const { createAdminClient } = require('./lib/supabase-admin');
const { registrarDenuncia } = require('./lib/actions/denuncia');

// Mock data
const formData = {
  categoria_id: 'saude-publica', // Assuming this exists or using a real one
  titulo: 'Teste de Submissão',
  descricao_original: 'Descrição de teste para validar o erro de submissão.',
  local: 'Rua de Teste',
  cep: '79000-000',
  numero: '123',
  bairro: 'Centro',
  cidade: 'Campo Grande',
  data_ocorrido: '2026-04-23',
  nome: 'Teste Usuário',
  email: 'teste@example.com',
  telefone: '(67) 99999-9999',
  cpf: '000.000.000-00',
  otpToken: '123456' // Need a valid one or bypass validation
};

async function test() {
  console.log('Iniciando teste de registrarDenuncia...');
  try {
    // Note: This might fail because of OTP validation.
    // I should probably check if I can bypass it for testing or if I should mock it.
    const res = await registrarDenuncia(formData, []);
    console.log('Resultado:', res);
  } catch (err) {
    console.error('Erro no teste:', err);
  }
}

// test();
console.log('Script pronto. Ajuste o categoria_id e rode se necessário.');
