/**
 * Middleware para logar requisições HTTP
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log da requisição
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  
  // Log da resposta quando terminar
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusEmoji = res.statusCode >= 400 ? '❌' : '✅';
    console.log(`${statusEmoji} ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

module.exports = requestLogger;

