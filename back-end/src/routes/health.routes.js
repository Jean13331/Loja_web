const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');

// GET /health - Verifica saúde da API e banco de dados
router.get('/', healthController.checkHealth);

module.exports = router;

