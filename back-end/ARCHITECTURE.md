# 🏗️ Arquitetura do Back-end

## Estrutura de Pastas

```
back-end/
│
├── config/                    # Configurações do projeto
│   └── database.js           # Pool de conexões PostgreSQL
│
├── src/                       # Código fonte principal
│   │
│   ├── app.js                # Configuração do Express e middlewares
│   ├── server.js             # Ponto de entrada da aplicação
│   │
│   ├── controllers/          # Controllers (camada de controle)
│   │   ├── health.controller.js
│   │   └── [outros controllers]
│   │
│   ├── models/               # Models (camada de dados)
│   │   ├── BaseModel.js      # Classe base para models
│   │   └── [outros models]
│   │
│   ├── services/             # Services (lógica de negócio)
│   │   └── [serviços de negócio]
│   │
│   ├── routes/               # Rotas da API
│   │   ├── index.js          # Índice de rotas
│   │   ├── health.routes.js
│   │   └── [outras rotas]
│   │
│   ├── middleware/           # Middlewares customizados
│   │   ├── errorHandler.js   # Tratamento de erros
│   │   └── requestLogger.js  # Log de requisições
│   │
│   ├── utils/                # Utilitários
│   │   ├── asyncHandler.js   # Wrapper para async/await
│   │   └── responseHelper.js # Padronização de respostas
│   │
│   ├── validators/           # Validadores de entrada
│   │   └── [validadores]
│   │
│   └── examples/             # Exemplos e documentação
│       └── example-complete-structure.md
│
├── postgres_docker/          # Configuração Docker
│   └── docker-compose.yml
│
└── package.json
```

## Fluxo de Dados

```
┌─────────────┐
│   Cliente   │
│  (Request)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         Express App (app.js)        │
│  ┌───────────────────────────────┐  │
│  │  Middlewares Globais:        │  │
│  │  - CORS                      │  │
│  │  - JSON Parser               │  │
│  │  - Request Logger            │  │
│  └───────────────────────────────┘  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│         Routes (routes/)            │
│  - Define endpoints                 │
│  - Valida entrada (opcional)       │
│  - Chama controllers                │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│      Controllers (controllers/)      │
│  - Recebe requisição                │
│  - Chama services                    │
│  - Retorna resposta                  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│       Services (services/)          │
│  - Lógica de negócio                │
│  - Validações de negócio            │
│  - Chama models                     │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│        Models (models/)             │
│  - Interage com banco de dados      │
│  - Queries SQL                      │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│    Database (PostgreSQL)            │
└─────────────────────────────────────┘
```

## Responsabilidades de Cada Camada

### 🎯 Controllers
- **Responsabilidade**: Receber requisições HTTP e retornar respostas
- **Não deve**: Conter lógica de negócio complexa
- **Deve**: Ser simples e delegar para services

### 💼 Services
- **Responsabilidade**: Lógica de negócio e orquestração
- **Pode**: Usar múltiplos models, fazer validações de negócio
- **Não deve**: Interagir diretamente com req/res do Express

### 📊 Models
- **Responsabilidade**: Interação com banco de dados
- **Deve**: Conter apenas queries e operações CRUD
- **Não deve**: Conter lógica de negócio

### 🛣️ Routes
- **Responsabilidade**: Definir endpoints e validar entrada
- **Deve**: Ser simples e direto ao ponto
- **Pode**: Usar validators para validar dados

### 🔧 Middleware
- **Responsabilidade**: Interceptar requisições/respostas
- **Exemplos**: Logs, autenticação, tratamento de erros

### 🛠️ Utils
- **Responsabilidade**: Funções utilitárias reutilizáveis
- **Exemplos**: Formatação, helpers, wrappers

## Princípios da Arquitetura

1. **Separação de Responsabilidades**: Cada camada tem uma responsabilidade específica
2. **DRY (Don't Repeat Yourself)**: Reutilize código através de utils e base classes
3. **Single Responsibility**: Cada arquivo/função faz uma coisa bem feita
4. **Dependency Injection**: Dependências são injetadas, não criadas dentro
5. **Error Handling**: Erros são tratados de forma centralizada

## Padrões Utilizados

- **MVC (Model-View-Controller)**: Separação entre dados, lógica e controle
- **Repository Pattern**: Models abstraem acesso ao banco
- **Service Layer**: Services encapsulam lógica de negócio
- **Middleware Pattern**: Interceptação de requisições/respostas

## Exemplo de Fluxo Completo

```
1. Cliente faz: GET /api/products?category=1

2. Route recebe e valida query params

3. Controller chama: productService.getAllProducts({ categoryId: 1 })

4. Service valida regras de negócio e chama: productModel.findByCategory(1)

5. Model executa query SQL: SELECT * FROM products WHERE category_id = 1

6. Database retorna dados

7. Model retorna para Service

8. Service processa e retorna para Controller

9. Controller formata resposta usando responseHelper

10. Response é enviada ao cliente
```

## Boas Práticas

✅ **Faça:**
- Separe responsabilidades claramente
- Use asyncHandler para evitar try/catch repetitivo
- Use responseHelper para padronizar respostas
- Valide dados de entrada
- Trate erros adequadamente
- Use nomes descritivos

❌ **Evite:**
- Lógica de negócio em controllers
- Queries SQL complexas em controllers
- Código duplicado
- Dependências circulares
- Funções muito grandes

