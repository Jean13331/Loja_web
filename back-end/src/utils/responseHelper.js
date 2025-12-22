/**
 * Utilitários para padronizar respostas da API
 */
const responseHelper = {
  /**
   * Resposta de sucesso
   */
  success(res, data, message = 'Operação realizada com sucesso', statusCode = 200) {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data,
    });
  },

  /**
   * Resposta de erro
   */
  error(res, message = 'Erro ao processar requisição', statusCode = 400) {
    return res.status(statusCode).json({
      status: 'error',
      message,
    });
  },

  /**
   * Resposta de criação
   */
  created(res, data, message = 'Registro criado com sucesso') {
    return this.success(res, data, message, 201);
  },

  /**
   * Resposta não encontrado
   */
  notFound(res, message = 'Registro não encontrado') {
    return this.error(res, message, 404);
  },

  /**
   * Resposta de validação
   */
  validationError(res, errors, message = 'Erro de validação') {
    return res.status(400).json({
      status: 'error',
      message,
      errors,
    });
  },
};

module.exports = responseHelper;

