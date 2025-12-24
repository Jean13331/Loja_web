import { useNavigate } from 'react-router-dom'
import { Box, Container, Typography, Paper, Button, AppBar, Toolbar, IconButton } from '@mui/material'
import { ShoppingCart, Logout, AdminPanelSettings, ArrowBack, People } from '@mui/icons-material'
import authService from '../services/authService'
import { useEffect, useState } from 'react'
import api from '../services/api'

const AdminUsuarios = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se está autenticado e é admin
    if (!authService.isAuthenticated()) {
      navigate('/admin/login')
      return
    }

    const storedUser = authService.getCurrentUser()
    if (!storedUser || (storedUser.admin !== 1 && storedUser.admin !== true)) {
      navigate('/admin/login')
      return
    }

    const fetchUserData = async () => {
      try {
        const response = await api.get('/user/me')
        if (response?.data) {
          const userData = response.data
          if (userData.admin !== 1 && userData.admin !== true) {
            authService.logout()
            navigate('/admin/login')
            return
          }
          setUser(userData)
        } else {
          setUser(storedUser)
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error)
        if (error.status === 401) {
          authService.logout()
          navigate('/admin/login')
        } else {
          setUser(storedUser)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [navigate])

  const handleLogout = () => {
    authService.logout()
    localStorage.removeItem('isAdmin')
    navigate('/admin/login')
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
        paddingTop: 8,
      }}
    >
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(135deg, #F7401B 0%, #FF6B35 100%)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Toolbar>
          <IconButton
            onClick={() => navigate('/admin/dashboard')}
            sx={{ color: 'white', mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 3 }}>
            <People sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: 'white' }}>
              Gerenciar Usuários
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
            <AdminPanelSettings sx={{ fontSize: 24, color: 'white' }} />
            <Typography variant="body1" sx={{ color: 'white' }}>
              {user?.nome || 'Admin'}
            </Typography>
          </Box>

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
            <Logout />
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
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: '#213547' }}>
            Gerenciamento de Usuários
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
            Gerencie usuários, permissões e acessos do sistema.
          </Typography>

          <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#213547' }}>
              Lista de Usuários
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Funcionalidade em desenvolvimento. Em breve você poderá visualizar, editar e gerenciar todos os usuários.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default AdminUsuarios

