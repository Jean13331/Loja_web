const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');

// GET /api/user/me - Retorna dados do usuário autenticado
router.get('/me', authenticate, userController.getMe);

module.exports = router;



