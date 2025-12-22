import { useNavigate } from 'react-router-dom'
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  AppBar, 
  Toolbar, 
  InputBase, 
  IconButton 
} from '@mui/material'
import { ShoppingCart, AccountCircle, Search } from '@mui/icons-material'
import authService from '../services/authService'
import { useEffect, useState } from 'react'
import api from '../services/api'

const Loja = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se está autenticado
    if (!authService.isAuthenticated()) {
      navigate('/login')
      return
    }

    // Buscar dados atualizados do usuário
    const fetchUserData = async () => {
      try {
        const response = await api.get('/user/me')
        if (response?.data) {
          setUser(response.data)
        } else {
          setUser(authService.getCurrentUser())
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error)
        if (error.status === 401) {
          authService.logout()
          navigate('/login')
        } else {
          setUser(authService.getCurrentUser())
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [navigate])

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Carregando...</Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF8F0 0%, #FFEEDD 50%, #FFF5E6 100%)',
        paddingTop: 8, // Espaço para a AppBar
      }}
    >
      {/* AppBar com pesquisa */}
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(135deg, #F7401B 0%, #FF6B35 100%)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 3 }}>
            <ShoppingCart sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: 'white' }}>
              Cajuzinho
            </Typography>
          </Box>

          {/* Campo de pesquisa */}
          <Box
            sx={{
              flexGrow: 1,
              maxWidth: 600,
              position: 'relative',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
              },
              marginRight: 2,
            }}
          >
            <Box
              sx={{
                padding: '0 16px',
                height: '100%',
                position: 'absolute',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Search sx={{ color: 'white' }} />
            </Box>
            <InputBase
              placeholder="Pesquisar produtos..."
              sx={{
                color: 'white',
                width: '100%',
                padding: '8px 8px 8px 48px',
                '& .MuiInputBase-input': {
                  color: 'white',
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>

          {/* Botão de usuário */}
          <IconButton
            onClick={handleLogout}
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <AccountCircle sx={{ fontSize: 32 }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Paper
          elevation={4}
          sx={{
            padding: 4,
            borderRadius: 3,
            backgroundColor: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#213547' }}>
            Bem-vindo à Loja, {user?.nome || 'Usuário'}!
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            Esta é a página da loja. Aqui você poderá ver e comprar produtos.
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}

export default Loja

