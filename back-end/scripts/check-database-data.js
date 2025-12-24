require('dotenv').config();
const { query } = require('../config/database');

async function checkDatabaseData() {
  console.log('🔍 Verificando dados no banco de dados...\n');
  
  try {
    const result = await query('SELECT idusuario, nome, email, cpf, numero_telefone, senha FROM usuario LIMIT 5');
    
    if (result.rows.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado no banco.');
      return;
    }
    
    console.log(`📊 Encontrados ${result.rows.length} usuário(s):\n`);
    
    result.rows.forEach((user, index) => {
      console.log(`Usuário ${index + 1}:`);
      console.log(`  ID: ${user.idusuario}`);
      console.log(`  Nome: ${user.nome}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  CPF (no banco): ${user.cpf}`);
      console.log(`  CPF é hash? ${user.cpf.length === 32 && /^[a-f0-9]{32}$/i.test(user.cpf) ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`  Telefone (no banco): ${user.numero_telefone}`);
      console.log(`  Telefone é hash? ${user.numero_telefone.length === 32 && /^[a-f0-9]{32}$/i.test(user.numero_telefone) ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`  Senha (no banco): ${user.senha}`);
      console.log(`  Senha é hash? ${user.senha.length === 32 && /^[a-f0-9]{32}$/i.test(user.senha) ? '✅ SIM' : '❌ NÃO'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error.message);
  }
}

checkDatabaseData()
  .then(() => {
    console.log('✨ Verificação concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });



