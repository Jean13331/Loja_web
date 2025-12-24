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
  IconButton,
  Card,
  CardContent,
  Grid
} from '@mui/material'
import { ShoppingCart, AccountCircle, Search, LocalOffer, Category } from '@mui/icons-material'
import Badge from '@mui/material/Badge'
import authService from '../services/authService'
import { useEffect, useState } from 'react'
import api from '../services/api'

const Loja = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [produtosDestaque, setProdutosDestaque] = useState([])
  const [carrinho, setCarrinho] = useState({
    itens: [],
    quantidadeTotal: 0,
    valorTotal: 0,
  })

  // Categorias disponíveis
  const categorias = [
    { id: 1, nome: 'Eletrodomésticos', icone: '🔌', cor: '#FF6B35' },
    { id: 2, nome: 'Cama, Mesa e Banho', icone: '🛏️', cor: '#4ECDC4' },
    { id: 3, nome: 'Móveis', icone: '🪑', cor: '#95E1D3' },
    { id: 4, nome: 'Eletrônicos', icone: '📱', cor: '#F38181' },
    { id: 5, nome: 'Casa e Decoração', icone: '🏠', cor: '#AA96DA' },
    { id: 6, nome: 'Esportes', icone: '⚽', cor: '#FCBAD3' },
    { id: 7, nome: 'Outros', icone: '📦', cor: '#95A5A6' },
  ]

  const handleCategoriaClick = (categoriaId) => {
    // TODO: Implementar navegação/filtro por categoria
    console.log('Categoria clicada:', categoriaId)
    // Exemplo: navigate(`/loja?categoria=${categoriaId}`)
  }

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
          borderRadius: 0,
        }}
      >
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 4 }}>
              <ShoppingCart sx={{ fontSize: 32, color: 'white' }} />
              <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: 'white' }}>
                Cajuzinho
              </Typography>
            </Box>

            {/* Campo de pesquisa */}
            <Box
              sx={{
                flexGrow: 1,
                maxWidth: 'none',
                position: 'relative',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                },
                marginRight: 4,
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

          {/* Carrinho */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mr: 2,
              ml: 'auto',
              padding: '6px 12px',
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
            onClick={() => {
              // TODO: Implementar navegação para página do carrinho
              console.log('Carrinho clicado')
            }}
          >
            <Badge badgeContent={carrinho.quantidadeTotal} color="error">
              <ShoppingCart sx={{ fontSize: 28, color: 'white' }} />
            </Badge>
            <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'white',
                  fontSize: '0.7rem',
                  lineHeight: 1,
                  opacity: 0.9,
                }}
              >
                {carrinho.quantidadeTotal} {carrinho.quantidadeTotal === 1 ? 'item' : 'itens'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  lineHeight: 1.2,
                }}
              >
                R$ {carrinho.valorTotal.toFixed(2).replace('.', ',')}
              </Typography>
            </Box>
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
        {/* Seção Destaques */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocalOffer sx={{ fontSize: 30, color: '#F7401B', mr: 1 }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: '#213547' }}>
              Destaques
            </Typography>
          </Box>

          <Paper
            elevation={4}
            sx={{
              padding: 4,
              borderRadius: 3,
              backgroundColor: 'white',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              minHeight: 300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" sx={{ mb: 1, color: '#666', fontWeight: 500 }}>
              Nenhum produto em destaque no momento
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', textAlign: 'center' }}>
              Os produtos em destaque aparecerão aqui quando forem cadastrados
            </Typography>
          </Paper>
        </Box>

        {/* Seção de Categorias */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Category sx={{ fontSize: 30, color: '#F7401B', mr: 1 }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: '#213547' }}>
              Categorias
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              justifyContent: 'space-between',
            }}
          >
            {categorias.map((categoria) => (
              <Card
                key={categoria.id}
                onClick={() => handleCategoriaClick(categoria.id)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderRadius: 3,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 auto' },
                  minWidth: { xs: 'calc(50% - 8px)', sm: 'auto' },
                  maxWidth: { xs: 'calc(50% - 8px)', sm: 'none' },
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                  },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 2,
                  backgroundColor: 'white',
                  border: '2px solid transparent',
                  borderBottom: '3px solid transparent',
                  '&:hover': {
                    borderBottom: '3px solid #4CAF50',
                  },
                }}
              >
                  <Box
                    sx={{
                      fontSize: '3rem',
                      mb: 1,
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    {categoria.icone}
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: '#213547',
                      textAlign: 'center',
                      fontSize: { xs: '0.85rem', sm: '0.95rem' },
                    }}
                  >
                    {categoria.nome}
                  </Typography>
                </Card>
            ))}
          </Box>
          </Box>

        {/* Seção de Produtos */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ShoppingCart sx={{ fontSize: 30, color: '#F7401B', mr: 1 }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: '#213547' }}>
              Produtos
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Placeholder para produtos - será substituído quando houver produtos no banco */}
            <Grid item xs={12}>
              <Paper
                elevation={2}
                sx={{
                  padding: 4,
                  borderRadius: 3,
                  backgroundColor: 'white',
                  textAlign: 'center',
                  minHeight: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h6" sx={{ mb: 1, color: '#666', fontWeight: 500 }}>
                  Nenhum produto disponível no momento
                </Typography>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  Os produtos aparecerão aqui quando forem cadastrados
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  )
}

export default Loja

