const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST /api/auth/register - Registra novo usuário
router.post('/register', authController.register);

// POST /api/auth/login - Autentica usuário
router.post('/login', authController.login);

module.exports = router;

