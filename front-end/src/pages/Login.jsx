import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Link as MuiLink,
  CircularProgress
} from '@mui/material'
import { ShoppingCart } from '@mui/icons-material'
import authService from '../services/authService'
import { isValidEmail } from '../utils/validation'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      // Limpar o state após mostrar a mensagem
      window.history.replaceState({}, document.title)
    }
  }, [location])

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

  const validate = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória'
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter no mínimo 6 caracteres'
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
      const response = await authService.login(formData.email, formData.senha)
      
      // Debug: verificar estrutura da resposta
      console.log('Resposta do login:', response)
      
      // Salvar token e dados do usuário
      // response já é o response.data do axios, que contém { status, message, data }
      // response.data contém { user, token }
      if (response?.data?.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        // Redirecionar para a página inicial (Home)
        navigate('/home')
      } else {
        console.error('Token não encontrado na resposta:', response)
        setErrorMessage('Token não recebido. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro no login:', error)
      // O erro pode vir de diferentes formas dependendo de onde foi lançado
      const errorMessage = error.response?.data?.message || 
                          error.data?.message || 
                          error.message || 
                          'Erro ao fazer login. Verifique suas credenciais.'
      setErrorMessage(errorMessage)
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
        maxWidth="sm"
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

          {successMessage && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 2,
                backgroundColor: 'rgba(40, 167, 69, 0.2)',
                color: 'white',
                '& .MuiAlert-icon': {
                  color: 'white',
                },
              }} 
              onClose={() => setSuccessMessage('')}
            >
              {successMessage}
            </Alert>
          )}

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
              gap: 3,
              overflow: 'visible',
              marginTop: 1,
              '& > *': {
                overflow: 'visible',
              },
            }}
          >
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

            <TextField
              fullWidth
              label="Senha"
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              error={!!errors.senha}
              helperText={errors.senha}
              placeholder="Sua senha"
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
                width: 'auto',
                minWidth: '180px',
                maxWidth: '250px',
                alignSelf: 'center',
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
                'Entrar'
              )}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Não tem uma conta?{' '}
              <MuiLink
                component={Link}
                to="/cadastro"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  '&:hover': {
                    color: 'rgba(255, 255, 255, 0.8)',
                  },
                }}
              >
                Cadastre-se
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default Login
