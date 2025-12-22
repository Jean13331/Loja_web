const { testConnection } = require('../../config/database');
const asyncHandler = require('../utils/asyncHandler');
const responseHelper = require('../utils/responseHelper');

/**
 * Controller para rotas de health check
 */
const healthController = {
  /**
   * Verifica a saúde da API e conexão com o banco de dados
   */
  checkHealth: asyncHandler(async (req, res) => {
    const dbConnected = await testConnection();
    
    return responseHelper.success(res, {
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }, 'API está funcionando');
  }),
};

module.exports = healthController;

