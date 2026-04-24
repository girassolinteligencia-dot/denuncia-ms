import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import path from 'path';

// Carregar variáveis do .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testResend() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = 'onboarding@resend.dev';
  const toEmail = 'denunciams.ouvidoria@gmail.com';

  console.log('--- Iniciando Teste de Resend ---');
  console.log(`API Key: ${apiKey?.slice(0, 7)}...`);
  console.log(`De: ${fromEmail}`);
  console.log(`Para: ${toEmail}`);

  if (!apiKey) {
    console.error('ERRO: RESEND_API_KEY não encontrada no .env.local');
    return;
  }

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: `Teste DenunciaMS <${fromEmail}>`,
      to: [toEmail],
      subject: '✅ Teste de Integração: Nova API Key Resend',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #021691;">Teste Bem-Sucedido!</h2>
          <p>A nova chave de API do Resend foi configurada e está operacional.</p>
          <hr />
          <p style="font-size: 12px; color: #666;">Este é um teste técnico gerado pelo assistente Antigravity.</p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Falha no Resend:', error);
    } else {
      console.log('✅ E-mail enviado com sucesso!', data);
    }
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
  }
}

testResend();
