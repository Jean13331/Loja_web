import api from './api'

const authService = {
  /**
   * Realiza login do usuário
   */
  async login(email, senha) {
    return await api.post('/auth/login', { email, senha })
  },

  /**
   * Registra um novo usuário
   */
  async register(userData) {
    return await api.post('/auth/register', userData)
  },

  /**
   * Faz logout
   */
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated() {
    return !!localStorage.getItem('token')
  },

  /**
   * Obtém dados do usuário logado
   */
  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  /**
   * Verifica se o token é válido no servidor
   */
  async verifyToken() {
    try {
      const response = await api.get('/auth/verify')
      // response já é o response.data do axios, que contém { status, message, data }
      // response.data contém { user, valid }
      return response?.data?.valid === true
    } catch (error) {
      // Se der erro (401, token inválido), limpar dados
      if (error.status === 401) {
        this.logout()
      }
      return false
    }
  },
}

export default authService

