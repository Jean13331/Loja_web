# 🏗️ Arquitetura do Front-end

## Estrutura de Pastas

```
front-end/
│
├── public/                  # Arquivos estáticos públicos
│   └── [arquivos estáticos]
│
├── src/                     # Código fonte principal
│   │
│   ├── assets/              # Recursos estáticos
│   │   ├── images/         # Imagens
│   │   └── styles/         # Arquivos CSS
│   │       ├── index.css   # Estilos globais
│   │       └── App.css      # Estilos da aplicação
│   │
│   ├── components/          # Componentes reutilizáveis
│   │   ├── common/         # Componentes genéricos
│   │   ├── forms/          # Componentes de formulário
│   │   └── layout/         # Componentes de layout
│   │
│   ├── pages/              # Páginas da aplicação
│   │   ├── Home.jsx
│   │   ├── NotFound.jsx
│   │   └── [outras páginas]
│   │
│   ├── routes/             # Configuração de rotas
│   │   └── AppRoutes.jsx   # Definição de todas as rotas
│   │
│   ├── services/           # Serviços de API
│   │   ├── api.js          # Configuração do Axios
│   │   ├── healthService.js
│   │   └── [outros services]
│   │
│   ├── hooks/              # Custom hooks
│   │   ├── useApi.js       # Hook para requisições API
│   │   └── [outros hooks]
│   │
│   ├── context/            # Contexts do React
│   │   └── [contexts]
│   │
│   ├── utils/              # Funções utilitárias
│   │   ├── format.js       # Formatação de dados
│   │   └── validation.js   # Validações
│   │
│   ├── types/              # Tipos e constantes
│   │   └── [tipos]
│   │
│   ├── App.jsx             # Componente raiz
│   └── main.jsx            # Ponto de entrada
│
├── index.html              # HTML principal
├── vite.config.js          # Configuração do Vite
└── package.json
```

## Fluxo de Dados

```
┌─────────────┐
│   Usuário   │
│  (Browser)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│      React App (App.jsx)            │
│  ┌───────────────────────────────┐  │
│  │  Router (AppRoutes.jsx)       │  │
│  │  - Define rotas               │  │
│  │  - Renderiza páginas          │  │
│  └───────────────────────────────┘  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│      Pages (pages/)                 │
│  - Componentes de página            │
│  - Usam componentes                  │
│  - Chamam services                   │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│   Components (components/)          │
│  - Componentes reutilizáveis        │
│  - Recebem props                    │
│  - Podem usar hooks                  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│      Hooks (hooks/)                │
│  - Lógica reutilizável              │
│  - Podem chamar services            │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│    Services (services/)            │
│  - Comunicação com API              │
│  - Usam axios (api.js)              │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│    Backend API                      │
│    (http://localhost:3000/api)     │
└─────────────────────────────────────┘
```

## Responsabilidades de Cada Camada

### 🎯 Pages
- **Responsabilidade**: Páginas completas da aplicação
- **Deve**: Compor componentes, gerenciar estado da página
- **Não deve**: Conter lógica de negócio complexa

### 🧩 Components
- **Responsabilidade**: Componentes reutilizáveis
- **Deve**: Ser reutilizável, receber props, ser independente
- **Não deve**: Fazer chamadas diretas à API

### 🔌 Services
- **Responsabilidade**: Comunicação com a API
- **Deve**: Encapsular chamadas HTTP, tratar erros
- **Não deve**: Conter lógica de UI

### 🎣 Hooks
- **Responsabilidade**: Lógica reutilizável
- **Deve**: Encapsular lógica comum, retornar estado
- **Pode**: Chamar services, gerenciar estado local

### 🗂️ Context
- **Responsabilidade**: Estado global da aplicação
- **Deve**: Gerenciar estado compartilhado (auth, theme, etc)
- **Não deve**: Substituir props para estado local

### 🛠️ Utils
- **Responsabilidade**: Funções utilitárias puras
- **Deve**: Ser funções puras, sem side effects
- **Exemplos**: Formatação, validação, cálculos

## Princípios da Arquitetura

1. **Separação de Responsabilidades**: Cada camada tem uma responsabilidade específica
2. **Reutilização**: Componentes e hooks são reutilizáveis
3. **Single Responsibility**: Cada componente/função faz uma coisa bem feita
4. **Composição**: Componentes são compostos para criar interfaces complexas
5. **Unidirectional Data Flow**: Dados fluem de cima para baixo

## Padrões Utilizados

- **Component-Based Architecture**: Interface construída com componentes
- **Container/Presentational Pattern**: Separação entre lógica e apresentação
- **Custom Hooks Pattern**: Lógica reutilizável em hooks
- **Service Layer Pattern**: Abstração da comunicação com API
- **Context Pattern**: Estado global compartilhado

## Exemplo de Fluxo Completo

```
1. Usuário acessa /products

2. Router renderiza Products page

3. Products page usa useApi hook

4. useApi hook chama productService.getAll()

5. productService faz requisição via api (axios)

6. API retorna dados

7. useApi atualiza estado (data, loading, error)

8. Products page renderiza componentes com os dados

9. Componentes exibem produtos na tela
```

## Boas Práticas

✅ **Faça:**
- Separe componentes em pastas por funcionalidade
- Use custom hooks para lógica reutilizável
- Centralize chamadas de API em services
- Use Context para estado global
- Mantenha componentes pequenos e focados
- Use props para passar dados
- Valide dados de entrada

❌ **Evite:**
- Componentes muito grandes
- Lógica de negócio em componentes
- Chamadas diretas à API em componentes
- Estado global desnecessário
- Props drilling excessivo
- Efeitos colaterais em utils

