import { useNavigate } from 'react-router-dom'
import { Box, Container, Typography, Paper, Button, AppBar, Toolbar, IconButton, Grid, Card, CardContent, CardActions } from '@mui/material'
import { ShoppingCart, Logout, AdminPanelSettings, Add, Edit, People } from '@mui/icons-material'
import authService from '../services/authService'
import { useEffect, useState } from 'react'
import api from '../services/api'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se está autenticado e é admin
    if (!authService.isAuthenticated()) {
      navigate('/admin/login')
      return
    }

    // Verificar se é admin
    const storedUser = authService.getCurrentUser()
    if (!storedUser || (storedUser.admin !== 1 && storedUser.admin !== true)) {
      navigate('/admin/login')
      return
    }

    // Buscar dados atualizados do usuário
    const fetchUserData = async () => {
      try {
        const response = await api.get('/user/me')
        if (response?.data) {
          const userData = response.data
          // Verificar novamente se é admin
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
            borderRadius: 0,
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 3 }}>
            <ShoppingCart sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: 'white' }}>
              Cajuzinho Admin
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
            Painel Administrativo
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
            Bem-vindo, {user?.nome || 'Administrador'}! Gerencie sua loja.
          </Typography>

          {/* Cards de funcionalidades */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {/* Card: Cadastrar Produto */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Add sx={{ fontSize: 40, color: '#F7401B' }} />
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: '#213547' }}>
                      Cadastrar Produto
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Adicione novos produtos ao catálogo da loja com nome, descrição, preço e estoque.
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/admin/produtos')}
                    sx={{
                      backgroundColor: '#F7401B',
                      '&:hover': {
                        backgroundColor: '#FF6B35',
                      },
                    }}
                  >
                    Cadastrar
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Card: Editar Produtos */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Edit sx={{ fontSize: 40, color: '#F7401B' }} />
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: '#213547' }}>
                      Editar Produtos
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Visualize, edite ou remova produtos existentes. Atualize preços, estoque e informações.
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => navigate('/admin/produtos')}
                    sx={{
                      backgroundColor: '#F7401B',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#FF6B35',
                      },
                    }}
                  >
                    Editar
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Card: Gerenciar Usuários */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <People sx={{ fontSize: 40, color: '#F7401B' }} />
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: '#213547' }}>
                      Gerenciar Usuários
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Gerencie usuários, permissões de administrador e acessos ao sistema.
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<People />}
                    onClick={() => navigate('/admin/usuarios')}
                    sx={{
                      backgroundColor: '#F7401B',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#FF6B35',
                      },
                    }}
                  >
                    Gerenciar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  )
}

export default AdminDashboard

