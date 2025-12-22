const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/register - Registra novo usuário
router.post('/register', authController.register);

// POST /api/auth/login - Autentica usuário
router.post('/login', authController.login);

// GET /api/auth/verify - Verifica se o token é válido (protegida)
router.get('/verify', authenticate, authController.verifyToken);

// Log para debug - verificar se a rota está sendo carregada
console.log('✅ Rotas de autenticação carregadas: /register, /login, /verify');

module.exports = router;

