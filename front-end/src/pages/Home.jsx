import { useNavigate } from 'react-router-dom'
import { Box, Container, Typography, Paper } from '@mui/material'
import { ShoppingCart } from '@mui/icons-material'
import authService from '../services/authService'
import { useEffect, useState } from 'react'
import api from '../services/api'

const Home = () => {
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
          // Se não conseguir buscar, usar dados do localStorage
          setUser(authService.getCurrentUser())
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error)
        // Se der erro 401, redirecionar para login
        if (error.status === 401) {
          authService.logout()
          navigate('/login')
        } else {
          // Se outro erro, usar dados do localStorage
          setUser(authService.getCurrentUser())
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [navigate])

  // Redirecionar para /loja após 5 segundos
  useEffect(() => {
    if (!loading && user) {
      const timer = setTimeout(() => {
        navigate('/loja')
      }, 5000) // 5 segundos

      return () => clearTimeout(timer)
    }
  }, [loading, user, navigate])

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFF8F0 0%, #FFEEDD 50%, #FFF5E6 100%)',
        padding: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            padding: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #F7401B 0%, #FF6B35 100%)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2 }}>
              <ShoppingCart sx={{ fontSize: 40, color: 'white' }} />
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'white' }}>
                Cajuzinho
              </Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h3" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
              Bem-vindo, {user?.nome || 'Usuário'}!
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 4 }}>
              Plataforma de compras online
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Redirecionando para a loja...
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default Home

