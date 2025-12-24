const usuarioModel = require('../models/Usuario');
const responseHelper = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');

const userController = {
  /**
   * Retorna dados do usuário autenticado
   */
  getMe: asyncHandler(async (req, res) => {
    // req.user é definido pelo middleware authenticate
    const userId = req.userId;
    
    // Buscar dados completos do usuário
    const user = await usuarioModel.findById(userId);
    
    if (!user) {
      return responseHelper.error(res, 'Usuário não encontrado', 404);
    }

    // Retornar dados sem informações sensíveis
    const { senha, cpf, numero_telefone, ...userWithoutSensitiveData } = user;
    
    return responseHelper.success(res, userWithoutSensitiveData, 'Dados do usuário');
  }),
};

module.exports = userController;



