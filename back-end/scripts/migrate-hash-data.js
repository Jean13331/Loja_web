require('dotenv').config();
const { query } = require('../config/database');
const crypto = require('crypto');

function hashValue(value) {
  const cleanValue = value.replace(/\D/g, '');
  return crypto.createHash('md5').update(cleanValue).digest('hex');
}

async function migrateHashData() {
  console.log('🔄 Migrando dados antigos para hash MD5...\n');
  
  try {
    // Buscar todos os usuários
    const result = await query('SELECT idusuario, cpf, numero_telefone FROM usuario');
    
    if (result.rows.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado.');
      return;
    }
    
    console.log(`📊 Encontrados ${result.rows.length} usuário(s) para migrar.\n`);
    
    let migrated = 0;
    let skipped = 0;
    
    for (const user of result.rows) {
      // Verificar se já está hasheado (hash MD5 tem 32 caracteres hexadecimais)
      const isCPFHash = user.cpf.length === 32 && /^[a-f0-9]{32}$/i.test(user.cpf);
      const isPhoneHash = user.numero_telefone.length === 32 && /^[a-f0-9]{32}$/i.test(user.numero_telefone);
      
      if (isCPFHash && isPhoneHash) {
        console.log(`⏭️  Usuário ID ${user.idusuario}: já está hasheado, pulando...`);
        skipped++;
        continue;
      }
      
      // Fazer hash dos valores
      const hashedCPF = isCPFHash ? user.cpf : hashValue(user.cpf);
      const hashedPhone = isPhoneHash ? user.numero_telefone : hashValue(user.numero_telefone);
      
      // Atualizar no banco
      await query(
        'UPDATE usuario SET cpf = $1, numero_telefone = $2 WHERE idusuario = $3',
        [hashedCPF, hashedPhone, user.idusuario]
      );
      
      console.log(`✅ Usuário ID ${user.idusuario}: CPF e telefone hasheados`);
      migrated++;
    }
    
    console.log(`\n✨ Migração concluída!`);
    console.log(`   ✅ Migrados: ${migrated}`);
    console.log(`   ⏭️  Pulados: ${skipped}`);
    
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    throw error;
  }
}

migrateHashData()
  .then(() => {
    console.log('\n🎉 Processo finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });



