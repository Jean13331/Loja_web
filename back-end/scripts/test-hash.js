require('dotenv').config();
const crypto = require('crypto');

// Funções de hash (copiadas do authService)
function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

function hashValue(value) {
  const cleanValue = value.replace(/\D/g, '');
  return crypto.createHash('md5').update(cleanValue).digest('hex');
}

// Teste
console.log('🧪 Testando hash MD5...\n');

const testCPF = '12345678900';
const testPhone = '11987654321';
const testPassword = 'senha123';

console.log('📝 Valores originais:');
console.log('  CPF:', testCPF);
console.log('  Telefone:', testPhone);
console.log('  Senha:', testPassword);

console.log('\n🔐 Valores hasheados:');
console.log('  CPF hash:', hashValue(testCPF));
console.log('  Telefone hash:', hashValue(testPhone));
console.log('  Senha hash:', hashPassword(testPassword));

console.log('\n✅ Teste concluído!');



