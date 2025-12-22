/**
 * Wrapper para funções async que captura erros automaticamente
 * Evita ter que usar try/catch em todos os controllers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;

