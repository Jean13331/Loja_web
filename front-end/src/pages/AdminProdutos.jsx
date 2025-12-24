import { useNavigate } from 'react-router-dom'
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  AppBar, 
  Toolbar, 
  IconButton,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Checkbox,
  FormControlLabel
} from '@mui/material'
import { ShoppingCart, Logout, AdminPanelSettings, ArrowBack, Add, Edit, Save, Cancel, Image as ImageIcon, Delete } from '@mui/icons-material'
import authService from '../services/authService'
import { useEffect, useState } from 'react'
import api from '../services/api'

const AdminProdutos = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [produtos, setProdutos] = useState([])
  const [loadingProdutos, setLoadingProdutos] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [produtoToDelete, setProdutoToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    valor: '',
    estoque: '',
    imagens: [],
    isDestaque: false,
    descontoPercentual: '',
    valorComDesconto: '',
  })

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

  // Buscar produtos quando não estiver no modo de formulário
  useEffect(() => {
    if (!showForm && !loading) {
      fetchProdutos()
    }
  }, [showForm, loading])

  const fetchProdutos = async () => {
    setLoadingProdutos(true)
    try {
      const response = await api.get('/produtos')
      if (response.status === 'success' && response.data) {
        setProdutos(response.data)
      } else {
        setProdutos([])
      }
    } catch (err) {
      console.error('Erro ao buscar produtos:', err)
      setProdutos([])
    } finally {
      setLoadingProdutos(false)
    }
  }

  const handleDeleteClick = (produto) => {
    setProdutoToDelete(produto)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!produtoToDelete) return

    setDeleting(true)
    try {
      const response = await api.delete(`/produtos/${produtoToDelete.idproduto}/deletar`)
      
      if (response.status === 'success') {
        setSuccess('Produto deletado com sucesso!')
        setDeleteDialogOpen(false)
        setProdutoToDelete(null)
        // Recarregar lista de produtos
        fetchProdutos()
        // Limpar mensagem de sucesso após 3 segundos
        setTimeout(() => {
          setSuccess(null)
        }, 3000)
      } else {
        setError(response.message || 'Erro ao deletar produto. Tente novamente.')
      }
    } catch (err) {
      console.error('Erro ao deletar produto:', err)
      const errorMessage = err.message || err.response?.data?.message || 'Erro ao deletar produto. Tente novamente.'
      setError(errorMessage)
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setProdutoToDelete(null)
  }

  const handleEditClick = async (produto) => {
    try {
      setLoading(true)
      const response = await api.get(`/produtos/${produto.idproduto}`)
      
      if (response.status === 'success' && response.data) {
        const produtoData = response.data
        setEditingProductId(produto.idproduto)
        
        // Converter imagens existentes para o formato esperado
        const imagensExistentes = (produtoData.imagens || []).map((img, index) => ({
          file: null, // Não temos o arquivo original
          preview: img.data,
          ordem: img.ordem,
          id: `existing-${index}`,
        }))
        
        // Buscar dados de destaque se existir
        let isDestaque = false
        let descontoPercentual = ''
        let valorComDesconto = ''
        
        if (produtoData.destaque) {
          isDestaque = true
          descontoPercentual = produtoData.destaque.desconto_percentual?.toString() || ''
          // Calcular valor com desconto se não estiver disponível
          const valorOriginal = parseFloat(produtoData.valor || 0)
          if (produtoData.destaque.valor_com_desconto) {
            valorComDesconto = parseFloat(produtoData.destaque.valor_com_desconto).toFixed(2)
          } else if (descontoPercentual && valorOriginal > 0) {
            const desconto = parseFloat(descontoPercentual)
            valorComDesconto = (valorOriginal * (1 - desconto / 100)).toFixed(2)
          }
        }
        
        setFormData({
          nome: produtoData.nome || '',
          descricao: produtoData.descricao || '',
          valor: parseFloat(produtoData.valor || 0).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          estoque: produtoData.estoque?.toString() || '',
          imagens: imagensExistentes,
          isDestaque,
          descontoPercentual,
          valorComDesconto,
        })
        
        setShowForm(true)
      } else {
        setError('Erro ao carregar dados do produto')
      }
    } catch (err) {
      console.error('Erro ao carregar produto:', err)
      setError('Erro ao carregar dados do produto. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    localStorage.removeItem('isAdmin')
    navigate('/admin/login')
  }

  const formatCurrency = (value) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '')
    
    if (!numbers) return ''
    
    // Converte para número e divide por 100 para ter centavos
    const amount = parseFloat(numbers) / 100
    
    // Formata como moeda brasileira
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const parseCurrency = (value) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '')
    
    if (!numbers) return ''
    
    // Converte para número e divide por 100 para ter centavos
    const amount = parseFloat(numbers) / 100
    
    return amount.toString()
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        // Limpar desconto e valor se desmarcar destaque
        descontoPercentual: checked ? prev.descontoPercentual : '',
        valorComDesconto: checked ? prev.valorComDesconto : '',
      }))
    } else if (name === 'valor') {
      // Aplicar máscara de moeda
      const formatted = formatCurrency(value)
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }))
    } else if (name === 'descontoPercentual') {
      // Validar desconto (0-100) e calcular valor com desconto
      const numValue = parseFloat(value) || 0
      if (numValue >= 0 && numValue <= 100) {
        setFormData((prev) => {
          const desconto = numValue
          const valorOriginal = parseFloat(parseCurrency(prev.valor)) || 0
          const novoValorComDesconto = valorOriginal > 0 
            ? (valorOriginal * (1 - desconto / 100)).toFixed(2)
            : ''
          
          return {
            ...prev,
            [name]: value,
            valorComDesconto: novoValorComDesconto,
          }
        })
      }
    } else if (name === 'valorComDesconto') {
      // Calcular desconto percentual baseado no valor com desconto
      const valorComDesconto = parseFloat(value) || 0
      const valorOriginal = parseFloat(parseCurrency(formData.valor)) || 0
      
      if (valorOriginal > 0 && valorComDesconto >= 0 && valorComDesconto <= valorOriginal) {
        const descontoCalculado = ((valorOriginal - valorComDesconto) / valorOriginal) * 100
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          descontoPercentual: descontoCalculado.toFixed(2),
        }))
      } else if (valorComDesconto === 0 || value === '') {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }))
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
    
    // Limpar mensagens de erro ao digitar
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length === 0) return

    const validFiles = []
    const invalidFiles = []

    files.forEach((file) => {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name}: não é um arquivo de imagem válido`)
        return
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name}: deve ter no máximo 5MB`)
        return
      }

      validFiles.push(file)
    })

    if (invalidFiles.length > 0) {
      setError(invalidFiles.join('; '))
    }

    if (validFiles.length > 0) {
      // Criar previews para todas as imagens válidas
      const readers = validFiles.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            resolve({
              file,
              preview: reader.result,
            })
          }
          reader.readAsDataURL(file)
        })
      })

      Promise.all(readers).then((imagePreviews) => {
        setFormData((prev) => ({
          ...prev,
          imagens: [...(prev.imagens || []), ...imagePreviews],
        }))
        if (error && invalidFiles.length === 0) setError(null)
      })
    }

    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = ''
  }

  const handleRemoveImage = (index) => {
    setFormData((prev) => {
      const imagens = [...(prev.imagens || [])]
      const imagemRemovida = imagens[index]
      
      // Se for uma imagem existente (não tem file), marcar como removida
      if (imagemRemovida && imagemRemovida.id && imagemRemovida.id.startsWith('existing-')) {
        imagemRemovida.removed = true
      }
      
      // Remover da lista
      imagens.splice(index, 1)
      
      return {
        ...prev,
        imagens,
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)

    // Validação básica
    if (!formData.nome.trim()) {
      setError('O nome do produto é obrigatório')
      setSubmitting(false)
      return
    }
    if (!formData.descricao.trim()) {
      setError('A descrição do produto é obrigatória')
      setSubmitting(false)
      return
    }
    // Converter valor formatado para número
    const valorNumerico = parseFloat(parseCurrency(formData.valor))
    if (!valorNumerico || valorNumerico <= 0) {
      setError('O valor do produto deve ser maior que zero')
      setSubmitting(false)
      return
    }
    if (!formData.estoque || parseInt(formData.estoque) < 0) {
      setError('O estoque deve ser um número válido')
      setSubmitting(false)
      return
    }
    // Validar imagens apenas se for cadastro novo (não edição)
    if (!editingProductId && (!formData.imagens || formData.imagens.length === 0)) {
      setError('É necessário adicionar pelo menos uma imagem para o produto')
      setSubmitting(false)
      return
    }

    // Validar desconto ou valor com desconto se for destaque
    if (formData.isDestaque) {
      const desconto = parseFloat(formData.descontoPercentual) || 0
      const valorComDesconto = parseFloat(formData.valorComDesconto) || 0
      const valorOriginal = valorNumerico
      
      if (desconto <= 0 && valorComDesconto <= 0) {
        setError('É necessário informar o desconto percentual ou o valor com desconto')
        setSubmitting(false)
        return
      }
      
      if (desconto > 100) {
        setError('O desconto não pode ser maior que 100%')
        setSubmitting(false)
        return
      }
      
      if (valorComDesconto > valorOriginal) {
        setError('O valor com desconto não pode ser maior que o valor original')
        setSubmitting(false)
        return
      }
    }

    try {
      // Criar FormData para enviar dados e imagens
      const formDataToSend = new FormData()
      formDataToSend.append('nome', formData.nome.trim())
      formDataToSend.append('descricao', formData.descricao.trim())
      formDataToSend.append('valor', valorNumerico.toString())
      formDataToSend.append('estoque', formData.estoque.toString())
      formDataToSend.append('is_destaque', formData.isDestaque ? 'true' : 'false')
      if (formData.isDestaque) {
        // Priorizar desconto percentual se ambos estiverem preenchidos
        if (formData.descontoPercentual && parseFloat(formData.descontoPercentual) > 0) {
          formDataToSend.append('desconto_percentual', formData.descontoPercentual.toString())
        } else if (formData.valorComDesconto && parseFloat(formData.valorComDesconto) > 0) {
          // Calcular desconto baseado no valor com desconto
          const valorComDesconto = parseFloat(formData.valorComDesconto)
          const descontoCalculado = ((valorNumerico - valorComDesconto) / valorNumerico) * 100
          formDataToSend.append('desconto_percentual', descontoCalculado.toFixed(2))
        }
        if (formData.valorComDesconto && parseFloat(formData.valorComDesconto) > 0) {
          formDataToSend.append('valor_com_desconto', formData.valorComDesconto.toString())
        }
      }
      
      // Separar imagens existentes (que não devem ser enviadas) e novas imagens
      const imagensNovas = formData.imagens.filter(img => img.file !== null && img.file !== undefined)
      
      // Adicionar apenas novas imagens (imagens existentes permanecem no banco)
      imagensNovas.forEach((img) => {
        if (img.file) {
          formDataToSend.append('imagens', img.file)
        }
      })

      let response
      if (editingProductId) {
        // Editar produto existente
        response = await api.put(`/produtos/${editingProductId}/editar`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      } else {
        // Cadastrar novo produto
        response = await api.post('/produtos/cadastrar', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      }

      console.log('Resposta da API:', response)

      // O interceptor do axios já retorna response.data, então response já é o objeto { status, message, data }
      const status = response.status || response.data?.status
      const message = response.message || response.data?.message

      if (status === 'success') {
        setSuccess(message || (editingProductId ? 'Produto editado com sucesso!' : 'Produto cadastrado com sucesso!'))
        setFormData({
          nome: '',
          descricao: '',
          valor: '',
          estoque: '',
          imagens: [],
          isDestaque: false,
          descontoPercentual: '',
          valorComDesconto: '',
        })
        setEditingProductId(null)
        
        // Opcional: fechar o formulário após 2 segundos
        setTimeout(() => {
          setShowForm(false)
          setSuccess(null)
          fetchProdutos() // Recarregar lista de produtos
        }, 2000)
      } else {
        setError(message || (editingProductId ? 'Erro ao editar produto. Tente novamente.' : 'Erro ao cadastrar produto. Tente novamente.'))
      }
    } catch (err) {
      console.error('Erro ao cadastrar produto:', err)
      console.error('Detalhes do erro:', {
        message: err.message,
        response: err.response,
        data: err.response?.data,
      })
      const errorMessage = err.message || err.response?.data?.message || 'Erro ao cadastrar produto. Tente novamente.'
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingProductId(null)
    setFormData({
      nome: '',
      descricao: '',
      valor: '',
      estoque: '',
      imagens: [],
      isDestaque: false,
      descontoPercentual: '',
      valorComDesconto: '',
    })
    setError(null)
    setSuccess(null)
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
          <IconButton
            onClick={() => navigate('/admin/dashboard')}
            sx={{ color: 'white', mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 3 }}>
            <ShoppingCart sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: 'white' }}>
              Gerenciar Produtos
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
          {!showForm ? (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                  {success}
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setShowForm(true)}
                  sx={{
                    backgroundColor: '#F7401B',
                    '&:hover': {
                      backgroundColor: '#FF6B35',
                    },
                  }}
                >
                  Cadastrar Novo Produto
                </Button>
              </Box>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, color: '#213547', fontWeight: 600 }}>
                  Lista de Produtos
                </Typography>

                {loadingProdutos ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : produtos.length === 0 ? (
                  <Paper
                    elevation={2}
                    sx={{
                      padding: 4,
                      borderRadius: 3,
                      backgroundColor: '#f5f5f5',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="body1" sx={{ color: '#666' }}>
                      Nenhum produto cadastrado ainda.
                    </Typography>
                  </Paper>
                ) : (
                  <TableContainer component={Paper} elevation={2}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#F7401B' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Imagem</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nome</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Descrição</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Valor</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Estoque</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Avaliação</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {produtos.map((produto) => (
                          <TableRow
                            key={produto.idproduto}
                            sx={{
                              '&:nth-of-type(odd)': {
                                backgroundColor: '#fafafa',
                              },
                              '&:hover': {
                                backgroundColor: '#fff5f2',
                              },
                            }}
                          >
                            <TableCell>
                              {produto.imagem_principal ? (
                                <Box
                                  component="img"
                                  src={produto.imagem_principal}
                                  alt={produto.nome}
                                  sx={{
                                    width: 60,
                                    height: 60,
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                    border: '2px solid #F7401B',
                                  }}
                                />
                              ) : (
                                <Box
                                  sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 1,
                                    backgroundColor: '#f5f5f5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid #ddd',
                                  }}
                                >
                                  <ImageIcon sx={{ color: '#999', fontSize: 30 }} />
                                </Box>
                              )}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{produto.nome}</TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  maxWidth: 300,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                title={produto.descricao}
                              >
                                {produto.descricao}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: '#F7401B' }}>
                              R$ {parseFloat(produto.valor).toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={produto.estoque}
                                sx={{
                                  backgroundColor: produto.estoque > 0 ? 'rgba(33, 150, 243, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                  color: produto.estoque > 0 ? '#1976d2' : '#d32f2f',
                                  fontWeight: 500,
                                }}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" sx={{ color: '#666' }}>
                                {parseFloat(produto.media_avaliacao || 0).toFixed(1)} ⭐
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditClick(produto)}
                                  sx={{
                                    color: 'white',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    },
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteClick(produto)}
                                  sx={{
                                    color: 'white',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    },
                                  }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </>
          ) : (
            <Box>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#213547' }}>
                {editingProductId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                  {success}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nome do Produto"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#F7401B',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#F7401B',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#F7401B',
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Descrição"
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleInputChange}
                      required
                      multiline
                      rows={4}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#F7401B',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#F7401B',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#F7401B',
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Valor"
                      name="valor"
                      value={formData.valor}
                      onChange={handleInputChange}
                      required
                      placeholder="0,00"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <Typography sx={{ mr: 1, color: '#666', fontWeight: 500 }}>R$</Typography>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#F7401B',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#F7401B',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#F7401B',
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Estoque"
                      name="estoque"
                      type="number"
                      value={formData.estoque}
                      onChange={handleInputChange}
                      required
                      inputProps={{ min: 0 }}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#F7401B',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#F7401B',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#F7401B',
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.isDestaque}
                          onChange={handleInputChange}
                          name="isDestaque"
                          sx={{
                            color: '#F7401B',
                            '&.Mui-checked': {
                              color: '#F7401B',
                            },
                          }}
                        />
                      }
                      label="Produto em Destaque"
                    />
                  </Grid>

                  {formData.isDestaque && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Desconto Percentual (%)"
                          name="descontoPercentual"
                          type="number"
                          value={formData.descontoPercentual}
                          onChange={handleInputChange}
                          inputProps={{ min: 0, max: 100, step: 0.01 }}
                          helperText="Digite o desconto de 0 a 100%"
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: '#F7401B',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#F7401B',
                              },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#F7401B',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Valor com Desconto"
                          name="valorComDesconto"
                          type="number"
                          value={formData.valorComDesconto}
                          onChange={handleInputChange}
                          inputProps={{ min: 0, step: 0.01 }}
                          helperText="Ou digite o valor final (desconto será calculado automaticamente)"
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <Typography sx={{ mr: 1, color: '#666', fontWeight: 500 }}>R$</Typography>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: '#F7401B',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#F7401B',
                              },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#F7401B',
                            },
                          }}
                        />
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12}>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: '#213547' }}>
                      Imagens do Produto {formData?.imagens?.length > 0 && `(${formData.imagens.length})`}
                    </Typography>
                    
                    {/* Preview das imagens selecionadas */}
                    {formData?.imagens?.length > 0 && (
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        {(formData?.imagens || []).map((img, index) => (
                          <Box
                            key={index}
                            sx={{
                              position: 'relative',
                              display: 'inline-block',
                            }}
                          >
                            <Box
                              component="img"
                              src={img.preview}
                              alt={`Preview ${index + 1}`}
                              sx={{
                                width: 150,
                                height: 150,
                                objectFit: 'cover',
                                borderRadius: 2,
                                border: '2px solid #F7401B',
                              }}
                            />
                            <IconButton
                              onClick={() => handleRemoveImage(index)}
                              sx={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                backgroundColor: '#F7401B',
                                color: 'white',
                                width: 32,
                                height: 32,
                                '&:hover': {
                                  backgroundColor: '#FF6B35',
                                },
                              }}
                            >
                              <Delete sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* Área de upload */}
                    <Box
                      sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        padding: 3,
                        textAlign: 'center',
                        backgroundColor: '#f9f9f9',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#F7401B',
                          backgroundColor: '#fff5f2',
                        },
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 48, color: '#999', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                        Clique para selecionar ou arraste imagens aqui
                      </Typography>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="image-upload"
                        type="file"
                        multiple
                        onChange={handleImageChange}
                      />
                      <label htmlFor="image-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<ImageIcon />}
                          sx={{
                            borderColor: '#F7401B',
                            color: '#F7401B',
                            '&:hover': {
                              borderColor: '#FF6B35',
                              backgroundColor: 'rgba(247, 64, 27, 0.1)',
                            },
                          }}
                        >
                          {formData?.imagens?.length > 0 ? 'Adicionar Mais Imagens' : 'Selecionar Imagens'}
                        </Button>
                      </label>
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#999' }}>
                        Formatos aceitos: JPG, PNG, GIF (máx. 5MB cada)
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                        disabled={submitting}
                        sx={{
                          borderColor: '#666',
                          color: '#666',
                          '&:hover': {
                            borderColor: '#333',
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                          },
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        disabled={submitting}
                        sx={{
                          backgroundColor: '#F7401B',
                          '&:hover': {
                            backgroundColor: '#FF6B35',
                          },
                        }}
                      >
                        {submitting ? (editingProductId ? 'Salvando alterações...' : 'Salvando...') : (editingProductId ? 'Salvar Alterações' : 'Salvar Produto')}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Box>
          )}
        </Paper>
      </Container>

      {/* Dialog de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ color: '#d32f2f', fontWeight: 600 }}>
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Tem certeza que deseja deletar o produto <strong>"{produtoToDelete?.nome}"</strong>?
            <br />
            <br />
            Esta ação não pode ser desfeita. Todas as imagens e dados relacionados ao produto serão permanentemente removidos.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel} 
            disabled={deleting}
            sx={{ color: '#666' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            variant="contained"
            startIcon={deleting ? <CircularProgress size={20} color="inherit" /> : <Delete />}
            sx={{
              backgroundColor: '#d32f2f',
              '&:hover': {
                backgroundColor: '#b71c1c',
              },
            }}
          >
            {deleting ? 'Deletando...' : 'Deletar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminProdutos

