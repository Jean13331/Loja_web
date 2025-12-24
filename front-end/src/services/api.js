import axios from 'axios'

// Configuração base da API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:88000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {
    // Adicionar token de autenticação se existir
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    // Retorna o data do axios, que já contém a estrutura { data, message, etc }
    return response.data
  },
  (error) => {
    // Tratamento de erros global
    if (error.response) {
      // Erro da API
      const { status, data } = error.response
      
      if (status === 401) {
        // Não autorizado - redirecionar para login
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      
      return Promise.reject({
        message: data?.message || 'Erro ao processar requisição',
        status,
        response: error.response, // Manter referência completa para debug
        data: data?.errors || null,
      })
    } else if (error.request) {
      // Erro de rede
      return Promise.reject({
        message: 'Erro de conexão. Verifique sua internet.',
        status: 0,
      })
    } else {
      // Outro erro
      return Promise.reject({
        message: error.message || 'Erro desconhecido',
        status: 0,
      })
    }
  }
)

export default api

