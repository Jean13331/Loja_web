require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');

async function initDatabase() {
  console.log('🚀 Inicializando banco de dados...\n');
  
  try {
    // Lê o arquivo SQL
    const sqlPath = path.join(__dirname, '../../loja_postgres.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Corrige o idusuario para SERIAL
    const correctedSql = sql.replace(
      /idusuario INTEGER NOT NULL/g,
      'idusuario SERIAL NOT NULL'
    );
    
    // Divide o SQL em comandos individuais
    // Remove comentários de linha única
    const sqlWithoutComments = correctedSql
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n');
    
    // Divide por ponto e vírgula, mantendo apenas comandos válidos
    const commands = sqlWithoutComments
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => {
        const trimmed = cmd.trim();
        return trimmed.length > 0 && 
               !trimmed.startsWith('--') && 
               trimmed.toUpperCase().startsWith('CREATE');
      });
    
    console.log(`📝 Executando ${commands.length} comandos SQL...\n`);
    
    // Executa cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i] + ';';
      try {
        await query(command);
        console.log(`✅ Comando ${i + 1}/${commands.length} executado com sucesso`);
      } catch (error) {
        // Ignora erros de "já existe" para CREATE TABLE IF NOT EXISTS
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`⚠️  Comando ${i + 1}/${commands.length}: ${error.message}`);
        } else {
          console.error(`❌ Erro no comando ${i + 1}/${commands.length}:`, error.message);
        }
      }
    }
    
    console.log('\n✅ Banco de dados inicializado com sucesso!');
    
    // Verifica se as tabelas foram criadas
    console.log('\n📋 Verificando tabelas criadas...');
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tables.rows.length > 0) {
      console.log(`✅ ${tables.rows.length} tabela(s) encontrada(s):`);
      tables.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
    } else {
      console.log('⚠️  Nenhuma tabela encontrada.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('\n✨ Processo concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { initDatabase };

