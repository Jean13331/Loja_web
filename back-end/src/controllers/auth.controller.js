const authService = require('../services/authService');
const responseHelper = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');

const authController = {
  /**
   * Registra um novo usuário
   */
  register: asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    return responseHelper.created(res, user, 'Usuário cadastrado com sucesso');
  }),

  /**
   * Autentica um usuário
   */
  login: asyncHandler(async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return responseHelper.error(res, 'Email e senha são obrigatórios', 400);
    }

    const user = await authService.login(email, senha);
    
    // Aqui você pode gerar um token JWT se quiser
    // Por enquanto, retornamos apenas os dados do usuário
    return responseHelper.success(res, {
      user,
      // token: 'seu-token-jwt-aqui' // Implementar JWT depois se necessário
    }, 'Login realizado com sucesso');
  }),
};

module.exports = authController;

