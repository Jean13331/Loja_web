import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import { isValidEmail, isValidCPF } from '../utils/validation'
import './Auth.css'

const Cadastro = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    numero_telefone: '',
    senha: '',
    confirmarSenha: '',
    cpf: '',
    nascimento: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    setErrorMessage('')
  }

  const formatCPF = (value) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a máscara
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    return value
  }

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
    }
    return value
  }

  const handleCPFChange = (e) => {
    const formatted = formatCPF(e.target.value)
    setFormData(prev => ({
      ...prev,
      cpf: formatted
    }))
  }

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value)
    setFormData(prev => ({
      ...prev,
      numero_telefone: formatted
    }))
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.nome || formData.nome.trim().length < 3) {
      newErrors.nome = 'Nome deve ter no mínimo 3 caracteres'
    }

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.numero_telefone) {
      newErrors.numero_telefone = 'Telefone é obrigatório'
    } else {
      const phoneNumbers = formData.numero_telefone.replace(/\D/g, '')
      if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
        newErrors.numero_telefone = 'Telefone inválido'
      }
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória'
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter no mínimo 6 caracteres'
    }

    if (!formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Confirmação de senha é obrigatória'
    } else if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem'
    }

    if (!formData.cpf) {
      newErrors.cpf = 'CPF é obrigatório'
    } else {
      const cleanCPF = formData.cpf.replace(/\D/g, '')
      if (!isValidCPF(cleanCPF)) {
        newErrors.cpf = 'CPF inválido'
      }
    }

    if (!formData.nascimento) {
      newErrors.nascimento = 'Data de nascimento é obrigatória'
    } else {
      const birthDate = new Date(formData.nascimento)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      if (age < 18) {
        newErrors.nascimento = 'Você deve ter pelo menos 18 anos'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      // Preparar dados para enviar (remover confirmarSenha e formatar)
      const userData = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        numero_telefone: formData.numero_telefone.replace(/\D/g, ''),
        senha: formData.senha,
        cpf: formData.cpf.replace(/\D/g, ''),
        nascimento: formData.nascimento,
        admin: 0, // Usuário comum por padrão
      }

      const response = await authService.register(userData)
      
      // Se o registro retornar token, fazer login automático
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        navigate('/')
      } else {
        // Se não retornar token, redirecionar para login
        navigate('/login', { 
          state: { message: 'Cadastro realizado com sucesso! Faça login para continuar.' }
        })
      }
    } catch (error) {
      setErrorMessage(error.message || 'Erro ao realizar cadastro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Cadastro</h1>
        <p className="auth-subtitle">Crie sua conta</p>

        {errorMessage && (
          <div className="error-message">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={errors.nome ? 'error' : ''}
              placeholder="Seu nome completo"
            />
            {errors.nome && <span className="error-text">{errors.nome}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="seu@email.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="numero_telefone">Telefone</label>
            <input
              type="text"
              id="numero_telefone"
              name="numero_telefone"
              value={formData.numero_telefone}
              onChange={handlePhoneChange}
              className={errors.numero_telefone ? 'error' : ''}
              placeholder="(00) 00000-0000"
              maxLength="15"
            />
            {errors.numero_telefone && <span className="error-text">{errors.numero_telefone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="cpf">CPF</label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleCPFChange}
              className={errors.cpf ? 'error' : ''}
              placeholder="000.000.000-00"
              maxLength="14"
            />
            {errors.cpf && <span className="error-text">{errors.cpf}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="nascimento">Data de Nascimento</label>
            <input
              type="date"
              id="nascimento"
              name="nascimento"
              value={formData.nascimento}
              onChange={handleChange}
              className={errors.nascimento ? 'error' : ''}
            />
            {errors.nascimento && <span className="error-text">{errors.nascimento}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              className={errors.senha ? 'error' : ''}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.senha && <span className="error-text">{errors.senha}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar Senha</label>
            <input
              type="password"
              id="confirmarSenha"
              name="confirmarSenha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              className={errors.confirmarSenha ? 'error' : ''}
              placeholder="Digite a senha novamente"
            />
            {errors.confirmarSenha && <span className="error-text">{errors.confirmarSenha}</span>}
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p className="auth-link">
          Já tem uma conta? <Link to="/login">Faça login</Link>
        </p>
      </div>
    </div>
  )
}

export default Cadastro

