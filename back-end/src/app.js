const express = require('express');
const cors = require('cors');

// Importar middlewares
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

// Importar rotas
const routes = require('./routes');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Rotas da API
app.use('/api', routes);

// Health check direto (sem /api)
app.use('/health', require('./routes/health.routes'));

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'API Loja Back-end está funcionando!',
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

module.exports = app;

