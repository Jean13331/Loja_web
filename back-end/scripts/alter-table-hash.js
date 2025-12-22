require('dotenv').config();
const { query } = require('../config/database');

async function alterTableForHash() {
  console.log('🔧 Alterando estrutura da tabela para suportar hash MD5...\n');
  
  try {
    // Alterar tamanho dos campos para suportar hash MD5 (32 caracteres)
    console.log('📝 Alterando campo numero_telefone...');
    await query('ALTER TABLE usuario ALTER COLUMN numero_telefone TYPE VARCHAR(32)');
    console.log('✅ Campo numero_telefone alterado para VARCHAR(32)');
    
    console.log('📝 Alterando campo cpf...');
    await query('ALTER TABLE usuario ALTER COLUMN cpf TYPE VARCHAR(32)');
    console.log('✅ Campo cpf alterado para VARCHAR(32)');
    
    console.log('\n✨ Estrutura da tabela atualizada com sucesso!');
    console.log('💡 Agora você pode executar: npm run migrate:hash');
    
  } catch (error) {
    if (error.message.includes('does not exist')) {
      console.log('⚠️  Tabela não existe. Execute primeiro: npm run init:db');
    } else if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log('⚠️  Campos já foram alterados anteriormente.');
    } else {
      console.error('❌ Erro ao alterar tabela:', error.message);
      throw error;
    }
  }
}

alterTableForHash()
  .then(() => {
    console.log('\n🎉 Processo finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });

