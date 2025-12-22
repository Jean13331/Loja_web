import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Link as MuiLink,
  CircularProgress,
  Grid
} from '@mui/material'
import { ShoppingCart } from '@mui/icons-material'
import authService from '../services/authService'
import { isValidEmail, isValidCPF, isValidPhone } from '../utils/validation'

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
  const [dateFocused, setDateFocused] = useState(false)

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
      if (!isValidPhone(formData.numero_telefone)) {
        newErrors.numero_telefone = 'Telefone inválido. Use formato (DDD) 9XXXX-XXXX para celular ou (DDD) XXXX-XXXX para fixo'
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
      if (cleanCPF.length !== 11) {
        newErrors.cpf = 'CPF deve ter 11 dígitos'
      } else if (!isValidCPF(cleanCPF)) {
        newErrors.cpf = 'CPF inválido. Verifique os dígitos'
      }
    }

    if (!formData.nascimento) {
      newErrors.nascimento = 'Data de nascimento é obrigatória'
    } else {
      const birthDate = new Date(formData.nascimento)
      const today = new Date()
      
      // Verificar se a data é válida
      if (isNaN(birthDate.getTime())) {
        newErrors.nascimento = 'Data de nascimento inválida'
      } else {
        // Calcular idade considerando mês e dia
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        const dayDiff = today.getDate() - birthDate.getDate()
        
        // Ajustar idade se ainda não fez aniversário este ano
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          age--
        }
        
        if (age < 16) {
          newErrors.nascimento = 'Você deve ter pelo menos 16 anos'
        }
        
        // Verificar se a data não é no futuro
        if (birthDate > today) {
          newErrors.nascimento = 'Data de nascimento não pode ser no futuro'
        }
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
      // response já é o response.data do axios, que contém { status, message, data }
      if (response?.data?.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        navigate('/home')
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        background: 'linear-gradient(135deg, #FFF8F0 0%, #FFEEDD 50%, #FFF5E6 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ícones de caju decorativos no fundo */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {/* SVG de caju - formato característico com castanha */}
        <svg
          viewBox="0 0 100 120"
          style={{
            position: 'absolute',
            top: '15%',
            left: '10%',
            width: '60px',
            height: '72px',
            opacity: 0.15,
            transform: 'rotate(-20deg)',
          }}
        >
          <ellipse cx="50" cy="80" rx="35" ry="30" fill="#F7401B" />
          <ellipse cx="50" cy="75" rx="30" ry="25" fill="#FF6B35" />
          <circle cx="50" cy="30" r="12" fill="#8B4513" />
        </svg>
        <svg
          viewBox="0 0 100 120"
          style={{
            position: 'absolute',
            top: '25%',
            right: '15%',
            width: '50px',
            height: '60px',
            opacity: 0.15,
            transform: 'rotate(15deg)',
          }}
        >
          <ellipse cx="50" cy="80" rx="30" ry="28" fill="#FF6B35" />
          <ellipse cx="50" cy="75" rx="25" ry="23" fill="#F7401B" />
          <circle cx="50" cy="30" r="10" fill="#8B4513" />
        </svg>
        <svg
          viewBox="0 0 100 120"
          style={{
            position: 'absolute',
            top: '40%',
            left: '8%',
            width: '55px',
            height: '66px',
            opacity: 0.15,
            transform: 'rotate(-10deg)',
          }}
        >
          <ellipse cx="50" cy="80" rx="32" ry="29" fill="#F7401B" />
          <ellipse cx="50" cy="75" rx="27" ry="24" fill="#FF6B35" />
          <circle cx="50" cy="30" r="11" fill="#8B4513" />
        </svg>
        <svg
          viewBox="0 0 100 120"
          style={{
            position: 'absolute',
            top: '50%',
            right: '12%',
            width: '45px',
            height: '54px',
            opacity: 0.15,
            transform: 'rotate(25deg)',
          }}
        >
          <ellipse cx="50" cy="80" rx="28" ry="26" fill="#FF6B35" />
          <ellipse cx="50" cy="75" rx="23" ry="21" fill="#F7401B" />
          <circle cx="50" cy="30" r="9" fill="#8B4513" />
        </svg>
        <svg
          viewBox="0 0 100 120"
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '15%',
            width: '60px',
            height: '72px',
            opacity: 0.15,
            transform: 'rotate(-15deg)',
          }}
        >
          <ellipse cx="50" cy="80" rx="35" ry="30" fill="#F7401B" />
          <ellipse cx="50" cy="75" rx="30" ry="25" fill="#FF6B35" />
          <circle cx="50" cy="30" r="12" fill="#8B4513" />
        </svg>
        <svg
          viewBox="0 0 100 120"
          style={{
            position: 'absolute',
            bottom: '30%',
            right: '10%',
            width: '50px',
            height: '60px',
            opacity: 0.15,
            transform: 'rotate(20deg)',
          }}
        >
          <ellipse cx="50" cy="80" rx="30" ry="28" fill="#FF6B35" />
          <ellipse cx="50" cy="75" rx="25" ry="23" fill="#F7401B" />
          <circle cx="50" cy="30" r="10" fill="#8B4513" />
        </svg>
        <svg
          viewBox="0 0 100 120"
          style={{
            position: 'absolute',
            bottom: '15%',
            left: '25%',
            width: '55px',
            height: '66px',
            opacity: 0.15,
            transform: 'rotate(-25deg)',
          }}
        >
          <ellipse cx="50" cy="80" rx="32" ry="29" fill="#F7401B" />
          <ellipse cx="50" cy="75" rx="27" ry="24" fill="#FF6B35" />
          <circle cx="50" cy="30" r="11" fill="#8B4513" />
        </svg>
        <svg
          viewBox="0 0 100 120"
          style={{
            position: 'absolute',
            top: '60%',
            right: '8%',
            width: '45px',
            height: '54px',
            opacity: 0.15,
            transform: 'rotate(10deg)',
          }}
        >
          <ellipse cx="50" cy="80" rx="28" ry="26" fill="#FF6B35" />
          <ellipse cx="50" cy="75" rx="23" ry="21" fill="#F7401B" />
          <circle cx="50" cy="30" r="9" fill="#8B4513" />
        </svg>
        <svg
          viewBox="0 0 100 120"
          style={{
            position: 'absolute',
            top: '70%',
            left: '20%',
            width: '50px',
            height: '60px',
            opacity: 0.15,
            transform: 'rotate(-18deg)',
          }}
        >
          <ellipse cx="50" cy="80" rx="30" ry="28" fill="#F7401B" />
          <ellipse cx="50" cy="75" rx="25" ry="23" fill="#FF6B35" />
          <circle cx="50" cy="30" r="10" fill="#8B4513" />
        </svg>
        <svg
          viewBox="0 0 100 120"
          style={{
            position: 'absolute',
            bottom: '40%',
            right: '20%',
            width: '55px',
            height: '66px',
            opacity: 0.15,
            transform: 'rotate(22deg)',
          }}
        >
          <ellipse cx="50" cy="80" rx="32" ry="29" fill="#FF6B35" />
          <ellipse cx="50" cy="75" rx="27" ry="24" fill="#F7401B" />
          <circle cx="50" cy="30" r="11" fill="#8B4513" />
        </svg>
      </Box>
      <Container 
        maxWidth="md"
        sx={{
          overflow: 'visible',
          position: 'relative',
          zIndex: 1,
          '& > *': {
            overflow: 'visible',
          },
        }}
      >
        <Paper
          elevation={8}
          sx={{
            padding: { xs: 3, sm: 4 },
            paddingTop: { xs: 7, sm: 8 },
            borderRadius: 3,
            background: 'linear-gradient(135deg, #F7401B 0%, #FF6B35 100%)',
            overflow: 'visible',
            position: 'relative',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 1 }}>
              <ShoppingCart sx={{ fontSize: 40, color: 'white' }} />
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'white', margin: 0 }}>
                Cajuzinho
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Plataforma de compras online
            </Typography>
          </Box>

          {errorMessage && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                backgroundColor: 'rgba(220, 53, 69, 0.2)',
                color: 'white',
                '& .MuiAlert-icon': {
                  color: 'white',
                },
              }}
            >
              {errorMessage}
            </Alert>
          )}

          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 4,
              overflow: 'visible',
              marginTop: 1,
              '& > *': {
                overflow: 'visible',
              },
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome Completo"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  error={!!errors.nome}
                  helperText={errors.nome}
                  placeholder="Seu nome completo"
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      '& input': {
                        color: '#213547',
                      },
                      '& input::placeholder': {
                        color: '#999',
                        opacity: 1,
                        textShadow: '0.5px 0.5px 1px rgba(255, 255, 255, 0.9), -0.5px -0.5px 1px rgba(255, 255, 255, 0.9), 0.5px -0.5px 1px rgba(255, 255, 255, 0.9), -0.5px 0.5px 1px rgba(255, 255, 255, 0.9)',
                        WebkitTextStroke: '0.3px rgba(255, 255, 255, 0.9)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#666',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                      color: 'white',
                      backgroundColor: 'transparent',
                      transform: 'translate(14px, -22px) scale(0.8)',
                      top: 0,
                      zIndex: 1,
                    },
                    '& .MuiInputBase-root': {
                      overflow: 'visible',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '& .MuiFormHelperText-root': {
                      color: 'white !important',
                      backgroundColor: 'transparent',
                      margin: '4px 0 0 0',
                      padding: 0,
                      fontSize: '0.8rem',
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px',
                    },
                    '& .MuiFormHelperText-root.Mui-error': {
                      color: 'white !important',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  placeholder="seu@email.com"
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      '& input': {
                        color: '#213547',
                      },
                      '& input::placeholder': {
                        color: '#999',
                        opacity: 1,
                        textShadow: '0.5px 0.5px 1px rgba(255, 255, 255, 0.9), -0.5px -0.5px 1px rgba(255, 255, 255, 0.9), 0.5px -0.5px 1px rgba(255, 255, 255, 0.9), -0.5px 0.5px 1px rgba(255, 255, 255, 0.9)',
                        WebkitTextStroke: '0.3px rgba(255, 255, 255, 0.9)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#666',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                      color: 'white',
                      backgroundColor: 'transparent',
                      transform: 'translate(14px, -22px) scale(0.8)',
                      top: 0,
                      zIndex: 1,
                    },
                    '& .MuiInputBase-root': {
                      overflow: 'visible',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '& .MuiFormHelperText-root': {
                      color: 'white !important',
                      backgroundColor: 'transparent',
                      margin: '4px 0 0 0',
                      padding: 0,
                      fontSize: '0.8rem',
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px',
                    },
                    '& .MuiFormHelperText-root.Mui-error': {
                      color: 'white !important',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  name="numero_telefone"
                  value={formData.numero_telefone}
                  onChange={handlePhoneChange}
                  error={!!errors.numero_telefone}
                  helperText={errors.numero_telefone}
                  placeholder="(00) 00000-0000"
                  inputProps={{ maxLength: 15 }}
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      '& input': {
                        color: '#213547',
                      },
                      '& input::placeholder': {
                        color: '#999',
                        opacity: 1,
                        textShadow: '0.5px 0.5px 1px rgba(255, 255, 255, 0.9), -0.5px -0.5px 1px rgba(255, 255, 255, 0.9), 0.5px -0.5px 1px rgba(255, 255, 255, 0.9), -0.5px 0.5px 1px rgba(255, 255, 255, 0.9)',
                        WebkitTextStroke: '0.3px rgba(255, 255, 255, 0.9)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#666',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                      color: 'white',
                      backgroundColor: 'transparent',
                      transform: 'translate(14px, -22px) scale(0.8)',
                      top: 0,
                      zIndex: 1,
                    },
                    '& .MuiInputBase-root': {
                      overflow: 'visible',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '& .MuiFormHelperText-root': {
                      color: 'white !important',
                      backgroundColor: 'transparent',
                      margin: '4px 0 0 0',
                      padding: 0,
                      fontSize: '0.8rem',
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px',
                    },
                    '& .MuiFormHelperText-root.Mui-error': {
                      color: 'white !important',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CPF"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  error={!!errors.cpf}
                  helperText={errors.cpf}
                  placeholder="000.000.000-00"
                  inputProps={{ maxLength: 14 }}
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      '& input': {
                        color: '#213547',
                      },
                      '& input::placeholder': {
                        color: '#999',
                        opacity: 1,
                        textShadow: '0.5px 0.5px 1px rgba(255, 255, 255, 0.9), -0.5px -0.5px 1px rgba(255, 255, 255, 0.9), 0.5px -0.5px 1px rgba(255, 255, 255, 0.9), -0.5px 0.5px 1px rgba(255, 255, 255, 0.9)',
                        WebkitTextStroke: '0.3px rgba(255, 255, 255, 0.9)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#666',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                      color: 'white',
                      backgroundColor: 'transparent',
                      transform: 'translate(14px, -22px) scale(0.8)',
                      top: 0,
                      zIndex: 1,
                    },
                    '& .MuiInputBase-root': {
                      overflow: 'visible',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '& .MuiFormHelperText-root': {
                      color: 'white !important',
                      backgroundColor: 'transparent',
                      margin: '4px 0 0 0',
                      padding: 0,
                      fontSize: '0.8rem',
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px',
                    },
                    '& .MuiFormHelperText-root.Mui-error': {
                      color: 'white !important',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Data de Nascimento"
                  type="date"
                  name="nascimento"
                  value={formData.nascimento}
                  onChange={handleChange}
                  onFocus={() => setDateFocused(true)}
                  onBlur={() => setDateFocused(false)}
                  error={!!errors.nascimento}
                  helperText={errors.nascimento}
                  disabled={loading}
                  InputLabelProps={{
                    shrink: dateFocused || !!formData.nascimento,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      '& input': {
                        color: '#213547',
                        '&::-webkit-calendar-picker-indicator': {
                          cursor: 'pointer',
                          opacity: 1,
                        },
                        '&::-webkit-datetime-edit-text': {
                          color: formData.nascimento ? '#213547' : 'transparent',
                        },
                        '&::-webkit-datetime-edit-month-field': {
                          color: formData.nascimento ? '#213547' : 'transparent',
                        },
                        '&::-webkit-datetime-edit-day-field': {
                          color: formData.nascimento ? '#213547' : 'transparent',
                        },
                        '&::-webkit-datetime-edit-year-field': {
                          color: formData.nascimento ? '#213547' : 'transparent',
                        },
                        '&:focus::-webkit-datetime-edit-text': {
                          color: '#213547',
                        },
                        '&:focus::-webkit-datetime-edit-month-field': {
                          color: '#213547',
                        },
                        '&:focus::-webkit-datetime-edit-day-field': {
                          color: '#213547',
                        },
                        '&:focus::-webkit-datetime-edit-year-field': {
                          color: '#213547',
                        },
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#666',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                      color: 'white',
                      backgroundColor: 'transparent',
                      transform: 'translate(14px, -22px) scale(0.8)',
                      top: 0,
                      zIndex: 1,
                    },
                    '& .MuiInputBase-root': {
                      overflow: 'visible',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '& .MuiFormHelperText-root': {
                      color: 'white !important',
                      backgroundColor: 'transparent',
                      margin: '4px 0 0 0',
                      padding: 0,
                      fontSize: '0.8rem',
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px',
                    },
                    '& .MuiFormHelperText-root.Mui-error': {
                      color: 'white !important',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Senha"
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  error={!!errors.senha}
                  helperText={errors.senha}
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      '& input': {
                        color: '#213547',
                      },
                      '& input::placeholder': {
                        color: '#999',
                        opacity: 1,
                        textShadow: '0.5px 0.5px 1px rgba(255, 255, 255, 0.9), -0.5px -0.5px 1px rgba(255, 255, 255, 0.9), 0.5px -0.5px 1px rgba(255, 255, 255, 0.9), -0.5px 0.5px 1px rgba(255, 255, 255, 0.9)',
                        WebkitTextStroke: '0.3px rgba(255, 255, 255, 0.9)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#666',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                      color: 'white',
                      backgroundColor: 'transparent',
                      transform: 'translate(14px, -22px) scale(0.8)',
                      top: 0,
                      zIndex: 1,
                    },
                    '& .MuiInputBase-root': {
                      overflow: 'visible',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '& .MuiFormHelperText-root': {
                      color: 'white !important',
                      backgroundColor: 'transparent',
                      margin: '4px 0 0 0',
                      padding: 0,
                      fontSize: '0.8rem',
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px',
                    },
                    '& .MuiFormHelperText-root.Mui-error': {
                      color: 'white !important',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirmar Senha"
                  type="password"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  error={!!errors.confirmarSenha}
                  helperText={errors.confirmarSenha}
                  placeholder="Digite a senha novamente"
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      '& input': {
                        color: '#213547',
                      },
                      '& input::placeholder': {
                        color: '#999',
                        opacity: 1,
                        textShadow: '0.5px 0.5px 1px rgba(255, 255, 255, 0.9), -0.5px -0.5px 1px rgba(255, 255, 255, 0.9), 0.5px -0.5px 1px rgba(255, 255, 255, 0.9), -0.5px 0.5px 1px rgba(255, 255, 255, 0.9)',
                        WebkitTextStroke: '0.3px rgba(255, 255, 255, 0.9)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#666',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                      color: 'white',
                      backgroundColor: 'transparent',
                      transform: 'translate(14px, -22px) scale(0.8)',
                      top: 0,
                      zIndex: 1,
                    },
                    '& .MuiInputBase-root': {
                      overflow: 'visible',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '& .MuiFormHelperText-root': {
                      color: 'white !important',
                      backgroundColor: 'transparent',
                      margin: '4px 0 0 0',
                      padding: 0,
                      fontSize: '0.8rem',
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px',
                    },
                    '& .MuiFormHelperText-root.Mui-error': {
                      color: 'white !important',
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="outlined"
              disabled={loading}
              sx={{
                mt: 1,
                py: 0.75,
                px: 4,
                fontSize: '0.9rem',
                minHeight: '42px',
                backgroundColor: 'white',
                color: '#F7401B',
                fontWeight: 600,
                border: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                background: 'white',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: 'white',
                  background: 'white',
                  color: '#F7401B',
                  opacity: 0.9,
                  border: 'none',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  background: 'rgba(255, 255, 255, 0.6)',
                  color: '#F7401B',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: '#F7401B' }} />
              ) : (
                'Cadastrar'
              )}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Já tem uma conta?{' '}
              <MuiLink
                component={Link}
                to="/login"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  '&:hover': {
                    color: 'rgba(255, 255, 255, 0.8)',
                  },
                }}
              >
                Faça login
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default Cadastro
