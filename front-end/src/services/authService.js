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
}

export default authService

