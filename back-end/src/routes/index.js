const express = require('express');
const router = express.Router();

// Importar todas as rotas
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');

// Registrar rotas
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// Adicione outras rotas aqui:
// router.use('/users', userRoutes);
// router.use('/products', productRoutes);
// router.use('/orders', orderRoutes);

module.exports = router;

