const express = require('express');
const router = express.Router();

// Importar todas as rotas
const healthRoutes = require('./health.routes');

// Registrar rotas
router.use('/health', healthRoutes);

// Adicione outras rotas aqui:
// router.use('/users', userRoutes);
// router.use('/products', productRoutes);
// router.use('/orders', orderRoutes);

module.exports = router;

