const authService = require('../services/authService');
const responseHelper = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');

const authController = {
  /**
   * Registra um novo usuário
   */
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    return responseHelper.created(res, {
      user: result.user,
      token: result.token,
    }, 'Usuário cadastrado com sucesso');
  }),

  /**
   * Autentica um usuário
   */
  login: asyncHandler(async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return responseHelper.error(res, 'Email e senha são obrigatórios', 400);
    }

    const result = await authService.login(email, senha);
    
    return responseHelper.success(res, {
      user: result.user,
      token: result.token,
    }, 'Login realizado com sucesso');
  }),

  /**
   * Verifica se o token é válido
   * Esta rota é protegida pelo middleware authenticate
   */
  verifyToken: asyncHandler(async (req, res) => {
    // Se chegou aqui, o token é válido (middleware authenticate já validou)
    // Retornar dados do usuário do token
    return responseHelper.success(res, {
      user: req.user,
      valid: true,
    }, 'Token válido');
  }),
};

module.exports = authController;

