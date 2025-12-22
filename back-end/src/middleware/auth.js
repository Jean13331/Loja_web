const authService = require('../services/authService');
const responseHelper = require('../utils/responseHelper');

/**
 * Middleware de autenticação
 * Verifica se o token JWT é válido
 */
const authenticate = (req, res, next) => {
  try {
    // Buscar token no header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return responseHelper.error(res, 'Token não fornecido', 401);
    }

    // Formato esperado: "Bearer <token>"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return responseHelper.error(res, 'Formato de token inválido. Use: Bearer <token>', 401);
    }

    const token = parts[1];

    // Verificar e decodificar token
    const decoded = authService.verifyToken(token);

    // Adicionar dados do usuário ao request
    req.user = decoded;
    req.userId = decoded.id;

    next();
  } catch (error) {
    return responseHelper.error(res, error.message || 'Token inválido ou expirado', 401);
  }
};

/**
 * Middleware opcional - verifica se é admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.admin) {
    return responseHelper.error(res, 'Acesso negado. Apenas administradores.', 403);
  }
  next();
};

module.exports = {
  authenticate,
  requireAdmin,
};

