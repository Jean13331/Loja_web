/**
 * Formata um valor para moeda brasileira
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata uma data para formato brasileiro
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

/**
 * Formata uma data e hora para formato brasileiro
 */
export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date))
}

