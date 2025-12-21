/**
 * Script para testar a conexão com o banco de dados PostgreSQL
 * Execute com: node src/test-connection.js
 */

require('dotenv').config();
const { testConnection, query } = require('../config/database');

async function testDatabaseConnection() {
  console.log('🔍 Testando conexão com o banco de dados...\n');
  
  console.log('📋 Configurações:');
  console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   Porta: ${process.env.DB_PORT || 5432}`);
  console.log(`   Banco: ${process.env.DB_NAME || 'appdb'}`);
  console.log(`   Usuário: ${process.env.DB_USER || 'appuser'}\n`);
  
  try {
    // Testa a conexão
    const connected = await testConnection();
    
    if (connected) {
      console.log('\n✅ Conexão estabelecida com sucesso!\n');
      
      // Testa uma query simples
      console.log('📊 Testando query simples...');
      try {
        const result = await query('SELECT version()');
        console.log('✅ Query executada com sucesso!');
        console.log(`📝 Versão do PostgreSQL: ${result.rows[0].version}\n`);
        
        // Lista as tabelas do banco
        console.log('📋 Listando tabelas do banco de dados...');
        const tablesResult = await query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name
        `);
        
        if (tablesResult.rows.length > 0) {
          console.log(`✅ Encontradas ${tablesResult.rows.length} tabela(s):`);
          tablesResult.rows.forEach((row, index) => {
            console.log(`   ${index + 1}. ${row.table_name}`);
          });
        } else {
          console.log('⚠️  Nenhuma tabela encontrada no banco de dados.');
          console.log('💡 Execute o script SQL (loja_postgres.sql) para criar as tabelas.');
        }
        
      } catch (queryError) {
        console.error('❌ Erro ao executar query:', queryError.message);
      }
      
    } else {
      console.log('\n❌ Falha ao conectar com o banco de dados.');
      console.log('\n💡 Verifique:');
      console.log('   1. O PostgreSQL está rodando?');
      console.log('   2. As credenciais no arquivo .env estão corretas?');
      console.log('   3. O banco de dados "appdb" existe?');
      console.log('   4. O usuário "appuser" tem permissão para acessar o banco?');
    }
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error('\n💡 Detalhes do erro:', error);
  }
  
  process.exit(0);
}

testDatabaseConnection();

