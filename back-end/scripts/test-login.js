/**
 * Script para testar o login
 * Uso: node scripts/test-login.js <email> <senha>
 */

require('dotenv').config();
const authService = require('../src/services/authService');

async function testLogin() {
  const email = process.argv[2];
  const senha = process.argv[3];

  if (!email || !senha) {
    console.error('Uso: node scripts/test-login.js <email> <senha>');
    process.exit(1);
  }

  try {
    console.log('Testando login...');
    console.log('Email:', email);
    console.log('Senha:', senha);
    
    const result = await authService.login(email, senha);
    
    console.log('\n✅ Login bem-sucedido!');
    console.log('Token gerado:', result.token ? 'Sim' : 'Não');
    console.log('Dados do usuário:', JSON.stringify(result.user, null, 2));
  } catch (error) {
    console.error('\n❌ Erro no login:');
    console.error('Mensagem:', error.message);
    process.exit(1);
  }
}

testLogin();

