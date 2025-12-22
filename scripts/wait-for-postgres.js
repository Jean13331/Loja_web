// Carrega variáveis de ambiente do back-end se existir .env lá
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '../back-end/.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'appdb',
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'app123',
  connectionTimeoutMillis: 2000,
});

async function waitForPostgres(maxAttempts = 30, delay = 2000) {
  console.log('⏳ Aguardando PostgreSQL estar pronto...');
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('✅ PostgreSQL está pronto!');
      await pool.end();
      process.exit(0);
    } catch (error) {
      if (attempt === maxAttempts) {
        console.error(`❌ PostgreSQL não está disponível após ${maxAttempts} tentativas`);
        await pool.end();
        process.exit(1);
      }
      console.log(`   Tentativa ${attempt}/${maxAttempts}...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

waitForPostgres();

