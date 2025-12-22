import { useState, useEffect } from 'react'

/**
 * Hook customizado para fazer requisições à API
 * @param {Function} apiFunction - Função que retorna uma Promise
 * @param {Array} dependencies - Dependências para reexecutar a requisição
 * @returns {Object} { data, loading, error, refetch }
 */
const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiFunction()
      setData(result)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, dependencies)

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

export default useApi

