const { Pool } = require('pg');
require('dotenv').config();

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'appdb',
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'app123',
  max: 20, // máximo de clientes no pool
  idleTimeoutMillis: 30000, // fecha clientes inativos após 30 segundos
  connectionTimeoutMillis: 2000, // timeout de conexão de 2 segundos
});

// Testa a conexão ao inicializar
pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool de conexões:', err);
  process.exit(-1);
});

// Função para testar a conexão
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Conexão com banco de dados estabelecida com sucesso!');
    console.log('⏰ Hora do servidor:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error.message);
    return false;
  }
}

// Função para executar queries
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query executada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Erro na query:', error.message);
    throw error;
  }
}

// Função para obter um cliente do pool
async function getClient() {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;
  
  // Timeout para evitar vazamento de conexões
  const timeout = setTimeout(() => {
    console.error('⚠️ Cliente do pool não foi liberado após 5 segundos');
    console.error(new Error().stack);
  }, 5000);
  
  // Monitora quando a query termina
  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };
  
  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };
  
  return client;
}

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
};

