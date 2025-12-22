/**
 * Valida se um email é válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida se uma string não está vazia
 */
export const isNotEmpty = (value) => {
  return value && value.trim().length > 0
}

/**
 * Valida se um CPF é válido
 */
export const isValidCPF = (cpf) => {
  const cleanCPF = cpf.replace(/[^\d]/g, '')
  
  if (cleanCPF.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cleanCPF.charAt(9))) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cleanCPF.charAt(10))) return false
  
  return true
}

/**
 * Valida se um telefone brasileiro é válido
 * Valida formato básico: DDD (11-99) + número
 * Para validação completa de DDDs específicos, considere usar uma API externa
 */
export const isValidPhone = (phone) => {
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Telefone fixo: 10 dígitos (DDD + 8 dígitos)
  // Celular: 11 dígitos (DDD + 9 dígitos começando com 9)
  if (cleanPhone.length === 10) {
    // Telefone fixo: DDD (2 dígitos) + número (8 dígitos)
    const ddd = parseInt(cleanPhone.substring(0, 2))
    const number = cleanPhone.substring(2)
    
    // DDD válido: range 11-99 (alguns números específicos não existem, mas validamos o range básico)
    if (ddd < 11 || ddd > 99) return false
    if (number.length !== 8) return false
    
    // Primeiro dígito do número fixo não pode ser 0 ou 1
    if (number.charAt(0) === '0' || number.charAt(0) === '1') return false
    
    return true
  } else if (cleanPhone.length === 11) {
    // Celular: DDD (2 dígitos) + 9 + número (8 dígitos)
    const ddd = parseInt(cleanPhone.substring(0, 2))
    const firstDigit = cleanPhone.charAt(2)
    const number = cleanPhone.substring(3)
    
    // DDD válido: range 11-99
    if (ddd < 11 || ddd > 99) return false
    if (firstDigit !== '9') return false // Celular deve começar com 9
    if (number.length !== 8) return false
    
    return true
  }
  
  return false
}

