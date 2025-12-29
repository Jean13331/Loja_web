import { useNavigate, useLocation } from 'react-router-dom'
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
  CardMedia,
  CardActions,
  Grid,
  Chip,
  CircularProgress,
  Tooltip
} from '@mui/material'
import { ShoppingCart, AccountCircle, Search, LocalOffer, Category, Star, ArrowBackIos, ArrowForwardIos, Favorite, FavoriteBorder } from '@mui/icons-material'
import Badge from '@mui/material/Badge'
import authService from '../services/authService'
import { useEffect, useState } from 'react'
import api from '../services/api'

const Loja = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [produtosDestaque, setProdutosDestaque] = useState([])
  const [loadingDestaques, setLoadingDestaques] = useState(false)
  const [destaqueAtual, setDestaqueAtual] = useState(0) // Índice do destaque atual
  const [swipeStart, setSwipeStart] = useState(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [produtos, setProdutos] = useState([])
  const [produtosFiltrados, setProdutosFiltrados] = useState([])
  const [termoPesquisa, setTermoPesquisa] = useState('')
  const [loadingProdutos, setLoadingProdutos] = useState(false)
  const [carrinho, setCarrinho] = useState({
    itens: [],
    quantidadeTotal: 0,
    valorTotal: 0,
  })
  const [categorias, setCategorias] = useState([])
  const [loadingCategorias, setLoadingCategorias] = useState(false)
  const [favoritos, setFavoritos] = useState([])
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)

  // Mapeamento de ícones e cores para categorias baseado no nome
  const getCategoriaIcone = (nome) => {
    const nomeLower = nome.toLowerCase()
    if (nomeLower.includes('eletrodoméstico') || nomeLower.includes('eletrodomestico')) return '🔌'
    if (nomeLower.includes('cama') || nomeLower.includes('banho') || nomeLower.includes('mesa')) return '🛏️'
    if (nomeLower.includes('móvel') || nomeLower.includes('movel')) return '🪑'
    if (nomeLower.includes('eletrônico') || nomeLower.includes('eletronico')) return '📱'
    if (nomeLower.includes('casa') || nomeLower.includes('decoração') || nomeLower.includes('decoracao')) return '🏠'
    if (nomeLower.includes('esporte')) return '⚽'
    if (nomeLower.includes('livro')) return '📚'
    if (nomeLower.includes('beleza') || nomeLower.includes('perfumaria')) return '💄'
    if (nomeLower.includes('brinquedo')) return '🧸'
    if (nomeLower.includes('alimento') || nomeLower.includes('bebida')) return '🍔'
    if (nomeLower.includes('automotivo') || nomeLower.includes('carro')) return '🚗'
    if (nomeLower.includes('saúde') || nomeLower.includes('saude')) return '💊'
    if (nomeLower.includes('informática') || nomeLower.includes('informatica')) return '💻'
    if (nomeLower.includes('roupa') || nomeLower.includes('vestuário') || nomeLower.includes('vestuario')) return '👕'
    if (nomeLower.includes('calçado') || nomeLower.includes('calcado')) return '👟'
    return '📦' // Ícone padrão
  }

  const getCategoriaCor = (nome, index) => {
    const cores = [
      '#FF6B35', '#4ECDC4', '#95E1D3', '#F38181', 
      '#AA96DA', '#FCBAD3', '#95A5A6', '#FFD93D',
      '#6BCB77', '#4D96FF', '#9B59B6', '#E74C3C'
    ]
    return cores[index % cores.length]
  }

  const handleCategoriaClick = (categoriaId) => {
    // TODO: Implementar navegação/filtro por categoria
    console.log('Categoria clicada:', categoriaId)
    // Exemplo: navigate(`/loja?categoria=${categoriaId}`)
  }

  const handleProximoDestaque = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setDestaqueAtual((prev) => (prev + 1) % produtosDestaque.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const handleDestaqueAnterior = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setDestaqueAtual((prev) => (prev - 1 + produtosDestaque.length) % produtosDestaque.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  // Handlers para swipe/touch
  const handleSwipeStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    setSwipeStart(clientX)
    setSwipeOffset(0)
  }

  const handleSwipeMove = (e) => {
    if (swipeStart === null) return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const diff = clientX - swipeStart
    setSwipeOffset(diff)
  }

  const handleSwipeEnd = () => {
    if (swipeStart === null) return
    
    const threshold = 50 // Mínimo de pixels para considerar um swipe
    if (Math.abs(swipeOffset) > threshold) {
      if (swipeOffset > 0) {
        // Swipe para direita = anterior
        handleDestaqueAnterior()
      } else {
        // Swipe para esquerda = próximo
        handleProximoDestaque()
      }
    }
    
    setSwipeStart(null)
    setSwipeOffset(0)
  }

  // Verificar se um produto está favoritado
  const isFavoritado = (produtoId) => {
    return favoritos.some(fav => fav.idproduto === produtoId || fav === produtoId)
  }

  // Adicionar ou remover favorito
  const handleToggleFavorito = async (produto) => {
    const produtoId = produto.idproduto
    const jaFavoritado = isFavoritado(produtoId)
    
    try {
      if (jaFavoritado) {
        // Remover favorito
        // TODO: Implementar chamada à API para remover favorito
        // await api.delete(`/favoritos/${produtoId}`)
        setFavoritos(prev => prev.filter(fav => {
          if (typeof fav === 'object') {
            return fav.idproduto !== produtoId
          }
          return fav !== produtoId
        }))
      } else {
        // Adicionar favorito
        // TODO: Implementar chamada à API para adicionar favorito
        // await api.post(`/favoritos`, { produto_id: produtoId })
        setFavoritos(prev => [...prev, produtoId])
      }
    } catch (error) {
      console.error('Erro ao favoritar produto:', error)
      setError('Erro ao favoritar produto. Tente novamente.')
    }
  }

  // Buscar produtos em destaque
  const fetchDestaques = async () => {
    setLoadingDestaques(true)
    try {
      const response = await api.get('/produtos/destaques')
      console.log('Resposta da API de destaques:', response)
      
      if (response && response.status === 'success' && response.data) {
        setProdutosDestaque(response.data)
      } else if (Array.isArray(response)) {
        setProdutosDestaque(response)
      } else {
        setProdutosDestaque([])
      }
    } catch (err) {
      console.error('Erro ao buscar destaques:', err)
      setProdutosDestaque([])
    } finally {
      setLoadingDestaques(false)
    }
  }

  // Buscar todos os produtos
  const fetchProdutos = async () => {
    setLoadingProdutos(true)
    try {
      const response = await api.get('/produtos')
      console.log('Resposta da API de produtos:', response)
      
      let produtosData = null
      if (response && response.status === 'success' && response.data) {
        produtosData = response.data
      } else if (Array.isArray(response)) {
        produtosData = response
      } else if (response && response.data && Array.isArray(response.data)) {
        produtosData = response.data
      }
      
      if (produtosData && produtosData.length > 0) {
        setProdutos(produtosData)
        setProdutosFiltrados(produtosData)
      } else {
        setProdutos([])
        setProdutosFiltrados([])
      }
    } catch (err) {
      console.error('Erro ao buscar produtos:', err)
      setProdutos([])
      setProdutosFiltrados([])
    } finally {
      setLoadingProdutos(false)
    }
  }

  // Filtrar produtos baseado no termo de pesquisa
  useEffect(() => {
    if (!termoPesquisa.trim()) {
      setProdutosFiltrados(produtos)
      setMostrarSugestoes(false)
    } else {
      const termo = termoPesquisa.toLowerCase().trim()
      const filtrados = produtos.filter((produto) => {
        const nome = produto.nome?.toLowerCase() || ''
        const descricao = produto.descricao?.toLowerCase() || ''
        return nome.includes(termo) || descricao.includes(termo)
      })
      setProdutosFiltrados(filtrados)
      setMostrarSugestoes(filtrados.length > 0)
    }
  }, [termoPesquisa, produtos])

  // Produtos para sugestões (limitado a 5)
  const produtosSugestoes = produtosFiltrados.slice(0, 5)

  // Buscar categorias do backend
  const fetchCategorias = async () => {
    setLoadingCategorias(true)
    try {
      console.log('Buscando categorias...')
      const response = await api.get('/categorias')
      console.log('Resposta da API de categorias:', response)
      
      // Verificar diferentes formatos de resposta
      let categoriasData = null
      if (response && response.status === 'success' && response.data) {
        categoriasData = response.data
      } else if (Array.isArray(response)) {
        // Se a resposta for diretamente um array
        categoriasData = response
      } else if (response && response.data && Array.isArray(response.data)) {
        categoriasData = response.data
      }
      
      if (categoriasData && categoriasData.length > 0) {
        // Usar ícone do banco ou mapear automaticamente se não tiver
        const categoriasComIcone = categoriasData.map((cat, index) => ({
          ...cat,
          icone: cat.icone || getCategoriaIcone(cat.nome),
          cor: getCategoriaCor(cat.nome, index),
        }))
        console.log('Categorias processadas:', categoriasComIcone)
        setCategorias(categoriasComIcone)
      } else {
        console.log('Nenhuma categoria encontrada ou resposta vazia')
        setCategorias([])
      }
    } catch (err) {
      console.error('Erro ao buscar categorias:', err)
      console.error('Detalhes do erro:', {
        message: err.message,
        status: err.status,
        response: err.response,
      })
      setCategorias([])
    } finally {
      setLoadingCategorias(false)
    }
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
          return
        } else {
          setUser(authService.getCurrentUser())
        }
      } finally {
        setLoading(false)
      }
    }

    // Buscar categorias independentemente do resultado do fetchUserData
    // pois categorias são públicas (AllowAny)
    fetchCategorias()
    fetchDestaques() // Buscar produtos em destaque
    fetchProdutos() // Buscar todos os produtos
    fetchUserData()

    // Atualizar dados quando a janela receber foco (usuário volta para a aba)
    const handleFocus = () => {
      fetchCategorias()
      fetchDestaques()
      fetchProdutos()
    }

    // Atualizar dados quando a página ficar visível novamente
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchCategorias()
        fetchDestaques()
        fetchProdutos()
      }
    }

    // Adicionar listeners
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup: remover listeners quando o componente for desmontado
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [navigate]) // Removido location.pathname para evitar recarregamentos desnecessários

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
              value={termoPesquisa}
              onChange={(e) => setTermoPesquisa(e.target.value)}
              onFocus={() => {
                if (termoPesquisa.trim() && produtosFiltrados.length > 0) {
                  setMostrarSugestoes(true)
                }
              }}
              onBlur={() => {
                // Delay para permitir cliques nos itens
                setTimeout(() => setMostrarSugestoes(false), 200)
              }}
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
            
            {/* Dropdown de sugestões */}
            {mostrarSugestoes && produtosSugestoes.length > 0 && (
              <Paper
                elevation={8}
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  mt: 1,
                  maxHeight: 400,
                  overflowY: 'auto',
                  zIndex: 1300,
                  borderRadius: 2,
                  backgroundColor: 'white',
                }}
              >
                {produtosSugestoes.map((produto) => (
                  <Box
                    key={produto.idproduto}
                    onClick={() => {
                      setTermoPesquisa(produto.nome)
                      setMostrarSugestoes(false)
                      // Scroll para o produto na lista
                      const produtoElement = document.querySelector(`[data-produto-id="${produto.idproduto}"]`)
                      if (produtoElement) {
                        produtoElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      cursor: 'pointer',
                      borderBottom: '1px solid #f0f0f0',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    {produto.imagem_principal ? (
                      <Box
                        component="img"
                        src={produto.imagem_principal}
                        alt={produto.nome}
                        sx={{
                          width: 60,
                          height: 60,
                          objectFit: 'contain',
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1,
                          padding: 0.5,
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ShoppingCart sx={{ fontSize: 30, color: '#ccc' }} />
                      </Box>
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          color: '#213547',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {produto.nome}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#F7401B',
                          fontWeight: 600,
                          mt: 0.5,
                        }}
                      >
                        R$ {produto.destaque?.valor_com_desconto && !isNaN(parseFloat(produto.destaque.valor_com_desconto))
                          ? parseFloat(produto.destaque.valor_com_desconto).toFixed(2).replace('.', ',')
                          : produto.valor && !isNaN(parseFloat(produto.valor))
                          ? parseFloat(produto.valor).toFixed(2).replace('.', ',')
                          : '0,00'}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Paper>
            )}
          </Box>

          {/* Favoritos */}
          <Tooltip title="Favoritos" arrow>
            <IconButton
              onClick={() => {
                // TODO: Implementar navegação para página de favoritos
                console.log('Favoritos clicado')
              }}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                mr: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <Badge badgeContent={favoritos.length} color="error">
                <Favorite sx={{ fontSize: 28 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Carrinho */}
          <Tooltip title="Carrinho" arrow>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mr: 2,
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
          </Tooltip>

          {/* Botão de usuário */}
          <Tooltip title="Perfil" arrow>
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
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Seção Destaques */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocalOffer sx={{ fontSize: 30, color: '#F7401B', mr: 1 }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: '#213547' }}>
              Destaques
            </Typography>
          </Box>

          {loadingDestaques ? (
            <Paper
              elevation={2}
              sx={{
                padding: 4,
                borderRadius: 3,
                backgroundColor: 'white',
                textAlign: 'center',
                minHeight: 300,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ color: '#666' }}>
                Carregando destaques...
              </Typography>
            </Paper>
          ) : produtosDestaque.length === 0 ? (
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
          ) : (
            <Box 
              sx={{ 
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                userSelect: 'none',
                touchAction: 'pan-y',
              }}
              onTouchStart={handleSwipeStart}
              onTouchMove={handleSwipeMove}
              onTouchEnd={handleSwipeEnd}
              onMouseDown={handleSwipeStart}
              onMouseMove={handleSwipeMove}
              onMouseUp={handleSwipeEnd}
              onMouseLeave={handleSwipeEnd}
            >
              {produtosDestaque.length > 0 && (
                <>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        transform: produtosDestaque.length > 0 
                          ? `translateX(calc(-${destaqueAtual * (100 / produtosDestaque.length)}% + ${swipeOffset}px))`
                          : 'translateX(0)',
                        transition: swipeStart === null ? 'transform 0.3s ease-in-out' : 'none',
                        width: produtosDestaque.length > 0 ? `${produtosDestaque.length * 100}%` : '100%',
                      }}
                    >
                      {produtosDestaque.length > 0 && produtosDestaque.map((produto, index) => {
                        // Calcular a largura base do container visível
                        const containerWidth = 100 / produtosDestaque.length
                        return (
                          <Box
                            key={index}
                            sx={{
                              width: `${containerWidth}%`,
                              minWidth: `${containerWidth}%`,
                              flexShrink: 0,
                              flex: '0 0 auto',
                            }}
                          >
                            <Card
                              sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                borderRadius: 3,
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                                overflow: 'visible',
                                height: { xs: 'auto', md: 400 },
                                backgroundColor: 'white',
                                position: 'relative',
                                width: '100%',
                                margin: '0 auto',
                              }}
                            >
                    {/* Imagem do produto */}
                    <Box
                      sx={{
                        width: { xs: '100%', md: '55%' },
                        height: { xs: 300, md: '100%' },
                        position: 'relative',
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                        {produto?.imagem_principal ? (
                          <Box
                            component="img"
                            src={produto.imagem_principal}
                            alt={produto.nome}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              objectPosition: 'center',
                              padding: 2,
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <ShoppingCart sx={{ fontSize: 80, color: '#ccc' }} />
                          </Box>
                        )}
                        {produto?.destaque && (
                          <Chip
                            label={`${produto.destaque.desconto_percentual}% OFF`}
                            sx={{
                              position: 'absolute',
                              top: 16,
                              right: 16,
                              backgroundColor: '#F7401B',
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '1rem',
                              padding: '8px 16px',
                              height: 'auto',
                              zIndex: 2,
                            }}
                          />
                        )}
                      </Box>

                      {/* Informações do produto */}
                      <Box
                        sx={{
                          width: { xs: '100%', md: '45%' },
                          padding: 4,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box>
                          <Typography variant="h4" component="h3" sx={{ fontWeight: 700, color: '#213547', mb: 2 }}>
                            {produto?.nome}
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                            {produto?.descricao}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                            <Star sx={{ fontSize: 24, color: '#FFC107' }} />
                            <Typography variant="h6" sx={{ color: '#666' }}>
                              {produto?.media_avaliacao && !isNaN(parseFloat(produto.media_avaliacao)) 
                                ? parseFloat(produto.media_avaliacao).toFixed(1) 
                                : '0.0'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
                            {produto?.destaque ? (
                              <>
                                <Typography
                                  variant="h3"
                                  sx={{
                                    color: '#F7401B',
                                    fontWeight: 700,
                                  }}
                                >
                                  R$ {produto.destaque.valor_com_desconto && !isNaN(parseFloat(produto.destaque.valor_com_desconto)) 
                                    ? parseFloat(produto.destaque.valor_com_desconto).toFixed(2).replace('.', ',') 
                                    : '0,00'}
                                </Typography>
                                <Typography
                                  variant="h5"
                                  sx={{
                                    color: '#999',
                                    textDecoration: 'line-through',
                                    fontWeight: 400,
                                  }}
                                >
                                  R$ {produto.valor && !isNaN(parseFloat(produto.valor)) 
                                    ? parseFloat(produto.valor).toFixed(2).replace('.', ',') 
                                    : '0,00'}
                                </Typography>
                              </>
                            ) : (
                              <Typography
                                variant="h3"
                                sx={{
                                  color: '#F7401B',
                                  fontWeight: 700,
                                }}
                              >
                                R$ {produto?.valor && !isNaN(parseFloat(produto.valor)) 
                                  ? parseFloat(produto.valor).toFixed(2).replace('.', ',') 
                                  : '0,00'}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Tooltip 
                          title={isFavoritado(produto.idproduto) ? "Remover dos favoritos" : "Adicionar aos favoritos"} 
                          arrow
                        >
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleFavorito(produto)
                            }}
                            sx={{
                              backgroundColor: isFavoritado(produto.idproduto) ? '#F7401B' : 'rgba(0, 0, 0, 0.1)',
                              color: 'white',
                              width: 48,
                              height: 48,
                              '&:hover': {
                                backgroundColor: isFavoritado(produto.idproduto) ? '#FF6B35' : 'rgba(0, 0, 0, 0.2)',
                                transform: 'scale(1.05)',
                              },
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {isFavoritado(produto.idproduto) ? (
                              <Favorite sx={{ fontSize: 24 }} />
                            ) : (
                              <FavoriteBorder sx={{ fontSize: 24 }} />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Adicionar ao Carrinho" arrow>
                          <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            startIcon={<ShoppingCart />}
                            sx={{
                              backgroundColor: '#F7401B',
                              padding: '14px 28px',
                              fontSize: '1.1rem',
                              fontWeight: 600,
                              flex: 1,
                              '&:hover': {
                                backgroundColor: '#FF6B35',
                              },
                            }}
                          >
                            Adicionar ao Carrinho
                          </Button>
                        </Tooltip>
                      </Box>
                      </Box>
                    </Card>
                          </Box>
                        )
                      })}
                    </Box>
                  </Box>

                  {/* Navegação entre destaques */}
                  {produtosDestaque.length > 1 && (
                    <>
                      <Tooltip title="Destaque anterior" arrow>
                        <IconButton
                          onClick={handleDestaqueAnterior}
                          sx={{
                            position: 'absolute',
                            left: { xs: 8, md: 16 },
                            top: 0,
                            bottom: 0,
                            margin: 'auto',
                            height: 'fit-content',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            width: { xs: 36, md: 40 },
                            minHeight: { xs: 36, md: 40 },
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            },
                            zIndex: 10,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                          }}
                        >
                          <ArrowBackIos sx={{ color: 'white', fontSize: { xs: 18, md: 20 } }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Próximo destaque" arrow>
                        <IconButton
                          onClick={handleProximoDestaque}
                          sx={{
                            position: 'absolute',
                            right: { xs: 8, md: 16 },
                            top: 0,
                            bottom: 0,
                            margin: 'auto',
                            height: 'fit-content',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            width: { xs: 36, md: 40 },
                            minHeight: { xs: 36, md: 40 },
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            },
                            zIndex: 10,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                          }}
                        >
                          <ArrowForwardIos sx={{ color: 'white', fontSize: { xs: 18, md: 20 } }} />
                        </IconButton>
                      </Tooltip>
                      
                      {/* Indicadores de destaque */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          gap: 1,
                          mt: 2,
                        }}
                      >
                        {produtosDestaque.map((_, index) => (
                          <Box
                            key={index}
                            onClick={() => setDestaqueAtual(index)}
                            sx={{
                              width: index === destaqueAtual ? 32 : 12,
                              height: 12,
                              borderRadius: 6,
                              backgroundColor: index === destaqueAtual ? '#F7401B' : '#ccc',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: index === destaqueAtual ? '#FF6B35' : '#999',
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </>
                  )}
                </>
              )}
            </Box>
          )}
        </Box>

        {/* Seção de Categorias */}
        <Paper
          elevation={2}
          sx={{
            mb: 4,
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 3,
            backgroundColor: 'white',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Category sx={{ fontSize: 30, color: '#F7401B', mr: 1 }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: '#213547' }}>
              Categorias
            </Typography>
          </Box>

          {loadingCategorias ? (
            <Paper
              elevation={2}
              sx={{
                padding: 4,
                borderRadius: 3,
                backgroundColor: 'white',
                textAlign: 'center',
                minHeight: 150,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body1" sx={{ color: '#666' }}>
                Carregando categorias...
              </Typography>
            </Paper>
          ) : categorias.length === 0 ? (
            <Paper
              elevation={2}
              sx={{
                padding: 4,
                borderRadius: 3,
                backgroundColor: 'white',
                textAlign: 'center',
                minHeight: 150,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" sx={{ mb: 1, color: '#666', fontWeight: 500 }}>
                Nenhuma categoria disponível
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                As categorias aparecerão aqui quando forem cadastradas
              </Typography>
            </Paper>
          ) : (
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
              }}
            >
              {categorias.map((categoria) => (
                <Card
                  key={categoria.idcategoria}
                  onClick={() => handleCategoriaClick(categoria.idcategoria)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    borderRadius: 3,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    flex: { xs: '1 1 calc(50% - 6px)', sm: '0 0 auto' },
                    minWidth: { xs: 'calc(50% - 6px)', sm: 140 },
                    maxWidth: { xs: 'calc(50% - 6px)', sm: 180 },
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
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
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
          )}
        </Paper>

        {/* Seção de Produtos */}
        <Paper
          elevation={2}
          sx={{
            mb: 4,
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 3,
            backgroundColor: 'white',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ShoppingCart sx={{ fontSize: 30, color: '#F7401B', mr: 1 }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: '#213547' }}>
              Produtos
            </Typography>
          </Box>

          {loadingProdutos ? (
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
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ color: '#666' }}>
                Carregando produtos...
              </Typography>
            </Paper>
          ) : produtosFiltrados.length === 0 && !loadingProdutos ? (
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
                {termoPesquisa.trim() ? 'Nenhum produto encontrado' : 'Nenhum produto disponível no momento'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                {termoPesquisa.trim() 
                  ? `Não encontramos produtos com "${termoPesquisa}"` 
                  : 'Os produtos aparecerão aqui quando forem cadastrados'}
              </Typography>
            </Paper>
          ) : (
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                overflowX: 'auto',
                overflowY: 'hidden',
                pb: 2,
                scrollbarWidth: 'thin',
                scrollbarColor: '#ccc transparent',
                '&::-webkit-scrollbar': {
                  height: 8,
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#ccc',
                  borderRadius: 4,
                  '&:hover': {
                    background: '#999',
                  },
                },
              }}
            >
              {produtosFiltrados.map((produto) => (
                <Card
                  key={produto.idproduto}
                  data-produto-id={produto.idproduto}
                  sx={{
                    minWidth: 280,
                    maxWidth: 280,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'white',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  {/* Container da imagem com tag de desconto */}
                  <Box sx={{ position: 'relative' }}>
                    {produto.imagem_principal ? (
                      <Box
                        component="img"
                        src={produto.imagem_principal}
                        alt={produto.nome}
                        sx={{
                          width: '100%',
                          height: 200,
                          objectFit: 'contain',
                          backgroundColor: '#f5f5f5',
                          padding: 1,
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          backgroundColor: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ShoppingCart sx={{ fontSize: 60, color: '#ccc' }} />
                      </Box>
                    )}
                    {/* Tag de desconto */}
                    {produto.destaque && (
                      <Chip
                        label={`-${produto.destaque.desconto_percentual}%`}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: '#F7401B',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          height: 28,
                        }}
                      />
                    )}
                  </Box>

                  {/* Conteúdo do card */}
                  <CardContent sx={{ flexGrow: 1, p: 2, pb: 1 }}>
                    {/* Label "Indicado" se for destaque */}
                    {produto.destaque && (
                      <Chip
                        label="Indicado"
                        size="small"
                        sx={{
                          backgroundColor: '#FF9800',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 20,
                          mb: 1,
                        }}
                      />
                    )}
                    
                    <Typography 
                      variant="body2" 
                      component="h3" 
                      sx={{ 
                        fontWeight: 500, 
                        color: '#213547', 
                        mb: 1,
                        fontSize: '0.875rem',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {produto.nome}
                    </Typography>

                    {/* Preço */}
                    <Box sx={{ mt: 1.5 }}>
                      {produto.destaque ? (
                        <>
                          <Typography
                            variant="h6"
                            sx={{
                              color: '#F7401B',
                              fontWeight: 700,
                              fontSize: '1.25rem',
                            }}
                          >
                            R$ {produto.destaque.valor_com_desconto && !isNaN(parseFloat(produto.destaque.valor_com_desconto)) 
                              ? parseFloat(produto.destaque.valor_com_desconto).toFixed(2).replace('.', ',') 
                              : '0,00'}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#999',
                              textDecoration: 'line-through',
                              fontSize: '0.875rem',
                            }}
                          >
                            R$ {produto.valor && !isNaN(parseFloat(produto.valor)) 
                              ? parseFloat(produto.valor).toFixed(2).replace('.', ',') 
                              : '0,00'}
                          </Typography>
                        </>
                      ) : (
                        <Typography
                          variant="h6"
                          sx={{
                            color: '#F7401B',
                            fontWeight: 700,
                            fontSize: '1.25rem',
                          }}
                        >
                          R$ {produto.valor && !isNaN(parseFloat(produto.valor)) 
                            ? parseFloat(produto.valor).toFixed(2).replace('.', ',') 
                            : '0,00'}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                  
                  {/* Botões de ação */}
                  <CardActions sx={{ p: 2, pt: 1, gap: 1 }}>
                    <Tooltip title={isFavoritado(produto.idproduto) ? "Remover dos favoritos" : "Adicionar aos favoritos"} arrow>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleFavorito(produto)
                        }}
                        size="small"
                        sx={{
                          backgroundColor: isFavoritado(produto.idproduto) ? '#F7401B' : 'rgba(0, 0, 0, 0.05)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: isFavoritado(produto.idproduto) ? '#FF6B35' : 'rgba(0, 0, 0, 0.2)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {isFavoritado(produto.idproduto) ? (
                          <Favorite sx={{ fontSize: 20, color: 'white' }} />
                        ) : (
                          <FavoriteBorder sx={{ fontSize: 20, color: 'white' }} />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Adicionar ao Carrinho" arrow>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<ShoppingCart />}
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Implementar adicionar ao carrinho
                          console.log('Adicionar ao carrinho:', produto)
                        }}
                        sx={{
                          backgroundColor: '#F7401B',
                          color: 'white',
                          flex: 1,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: '#FF6B35',
                          },
                        }}
                      >
                        Carrinho
                      </Button>
                    </Tooltip>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  )
}

export default Loja

