import api from './api'

const healthService = {
  /**
   * Verifica a saúde da API
   */
  async checkHealth() {
    return await api.get('/health')
  },
}

export default healthService

