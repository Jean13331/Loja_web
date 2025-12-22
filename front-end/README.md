# Front-end - Loja Web

Interface desenvolvida com React, Vite e React Router.

## 📁 Estrutura do Projeto

```
front-end/
├── public/                 # Arquivos estáticos
├── src/
│   ├── assets/            # Recursos estáticos
│   │   ├── images/        # Imagens
│   │   └── styles/        # Estilos CSS
│   ├── components/         # Componentes reutilizáveis
│   ├── context/            # Contexts do React
│   ├── hooks/              # Custom hooks
│   ├── pages/              # Páginas da aplicação
│   ├── routes/             # Configuração de rotas
│   ├── services/           # Serviços de API
│   ├── types/              # Tipos e constantes
│   ├── utils/              # Funções utilitárias
│   ├── App.jsx             # Componente principal
│   └── main.jsx            # Ponto de entrada
├── index.html
├── vite.config.js
└── package.json
```

## 🏗️ Arquitetura

O projeto segue uma arquitetura **component-based** com separação de responsabilidades:

- **Pages**: Páginas completas da aplicação
- **Components**: Componentes reutilizáveis
- **Services**: Comunicação com a API
- **Hooks**: Lógica reutilizável (custom hooks)
- **Context**: Estado global da aplicação
- **Utils**: Funções utilitárias
- **Routes**: Configuração de rotas

## 🚀 Como Usar

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm start
# ou
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build para Produção
```bash
npm run build
```

### Preview do Build
```bash
npm run preview
```

## 📝 Exemplo de Uso

### Criar um Componente
```jsx
// src/components/Button.jsx
const Button = ({ children, onClick, variant = 'primary' }) => {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  )
}

export default Button
```

### Criar uma Página
```jsx
// src/pages/Products.jsx
import { useEffect, useState } from 'react'
import productService from '../services/productService'

const Products = () => {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await productService.getAll()
      setProducts(data)
    }
    fetchProducts()
  }, [])

  return (
    <div>
      <h1>Produtos</h1>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}

export default Products
```

### Criar um Service
```jsx
// src/services/productService.js
import api from './api'

const productService = {
  async getAll() {
    return await api.get('/products')
  },
  
  async getById(id) {
    return await api.get(`/products/${id}`)
  },
  
  async create(productData) {
    return await api.post('/products', productData)
  },
}

export default productService
```

### Usar Custom Hook
```jsx
// src/pages/Products.jsx
import useApi from '../hooks/useApi'
import productService from '../services/productService'

const Products = () => {
  const { data: products, loading, error } = useApi(
    () => productService.getAll()
  )

  if (loading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error.message}</div>

  return (
    <div>
      <h1>Produtos</h1>
      {products?.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}

export default Products
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do front-end:

```env
VITE_API_URL=http://localhost:3000/api
```

## 📦 Dependências Principais

- **React**: Biblioteca para construção de interfaces
- **React Router**: Roteamento
- **Axios**: Cliente HTTP
- **Vite**: Build tool e dev server

## 🎨 Estilização

Os estilos estão organizados em:
- `src/assets/styles/index.css` - Estilos globais
- `src/assets/styles/App.css` - Estilos da aplicação

Você pode adicionar bibliotecas como:
- Tailwind CSS
- Styled Components
- Material-UI
- Chakra UI

