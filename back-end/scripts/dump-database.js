require('dotenv').config();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);

async function dumpDatabase() {
  console.log('📦 Exportando dados do banco de dados...\n');
  
  try {
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || 5432;
    const dbName = process.env.DB_NAME || 'appdb';
    const dbUser = process.env.DB_USER || 'appuser';
    const dbPassword = process.env.DB_PASSWORD || 'app123';
    
    // Caminho do arquivo de dump
    const dumpPath = path.join(__dirname, '../postgres_docker/init/02-seed-data.sql');
    
    // Comando pg_dump
    // Usando PGPASSWORD para evitar prompt de senha
    const dumpCommand = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} --data-only --column-inserts --no-owner --no-privileges`;
    
    console.log('🔄 Executando dump...');
    const { stdout, stderr } = await execPromise(dumpCommand, {
      env: { ...process.env, PGPASSWORD: dbPassword }
    });
    
    if (stderr && !stderr.includes('NOTICE')) {
      console.error('⚠️  Avisos:', stderr);
    }
    
    // Processa o output para remover comandos desnecessários e manter apenas INSERTs
    const lines = stdout.split('\n');
    const filteredLines = lines.filter(line => {
      const trimmed = line.trim();
      // Mantém apenas INSERTs e comentários úteis
      return trimmed.startsWith('INSERT INTO') || 
             trimmed.startsWith('--') ||
             trimmed === '' ||
             trimmed.startsWith('SET ') ||
             trimmed.startsWith('SELECT ');
    });
    
    // Adiciona cabeçalho
    const header = `-- =========================================
-- Dados iniciais do banco de dados
-- Este arquivo contém os dados de exemplo
-- É executado automaticamente após a criação das tabelas
-- =========================================
-- Gerado automaticamente em: ${new Date().toISOString()}
-- =========================================

`;
    
    const content = header + filteredLines.join('\n');
    
    // Salva o arquivo
    fs.writeFileSync(dumpPath, content, 'utf8');
    
    console.log(`✅ Dados exportados com sucesso!`);
    console.log(`📁 Arquivo salvo em: ${dumpPath}`);
    console.log(`\n💡 Para incluir no Git, faça commit deste arquivo.`);
    console.log(`💡 Os dados serão carregados automaticamente na próxima inicialização do banco.\n`);
    
  } catch (error) {
    console.error('❌ Erro ao exportar dados:', error.message);
    
    if (error.message.includes('pg_dump')) {
      console.error('\n💡 Certifique-se de que:');
      console.error('   1. O PostgreSQL está rodando');
      console.error('   2. O pg_dump está instalado no sistema');
      console.error('   3. As credenciais do banco estão corretas no .env\n');
    }
    
    process.exit(1);
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  dumpDatabase()
    .then(() => {
      console.log('✨ Processo concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { dumpDatabase };
