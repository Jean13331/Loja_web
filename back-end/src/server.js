require('dotenv').config();
const app = require('./app');
const { testConnection } = require('../config/database');

const PORT = process.env.PORT || 3000;

// Inicia o servidor
async function startServer() {
  try {
    // Testa a conexão com o banco antes de iniciar
    console.log('🔍 Verificando conexão com o banco de dados...');
    await testConnection();
    
    app.listen(PORT, () => {
      console.log('\n✅ Servidor iniciado com sucesso!');
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📡 Acesse: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
