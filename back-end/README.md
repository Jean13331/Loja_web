# Back-end - Loja Web

API REST desenvolvida com Node.js, Express e PostgreSQL.

## 📁 Estrutura do Projeto

```
back-end/
├── config/                 # Configurações
│   └── database.js         # Configuração do banco de dados
├── src/
│   ├── controllers/        # Controllers (lógica de controle)
│   │   └── health.controller.js
│   ├── models/             # Models (modelos de dados)
│   │   └── BaseModel.js    # Classe base para models
│   ├── routes/             # Rotas da API
│   │   └── health.routes.js
│   ├── services/           # Services (lógica de negócio)
│   ├── middleware/         # Middlewares customizados
│   │   ├── errorHandler.js
│   │   └── requestLogger.js
│   ├── utils/              # Utilitários
│   │   ├── responseHelper.js
│   │   └── asyncHandler.js
│   ├── validators/         # Validadores de entrada
│   ├── app.js              # Configuração do Express
│   └── server.js           # Ponto de entrada da aplicação
├── postgres_docker/        # Configuração Docker PostgreSQL
└── package.json
```

## 🏗️ Arquitetura

O projeto segue o padrão **MVC (Model-View-Controller)** com algumas melhorias:

- **Controllers**: Recebem requisições, chamam services e retornam respostas
- **Services**: Contêm a lógica de negócio complexa
- **Models**: Representam as entidades do banco de dados
- **Routes**: Definem os endpoints da API
- **Middleware**: Interceptam requisições/respostas (erros, logs, etc.)
- **Utils**: Funções utilitárias reutilizáveis
- **Validators**: Validação de dados de entrada

## 🚀 Como Usar

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## 📝 Exemplo de Uso

### Criar um Model
```javascript
// src/models/User.js
const BaseModel = require('./BaseModel');

class User extends BaseModel {
  constructor() {
    super('users');
  }

  async findByEmail(email) {
    const result = await this.findWhere({ email });
    return result[0];
  }
}

module.exports = new User();
```

### Criar um Service
```javascript
// src/services/userService.js
const userModel = require('../models/User');

const userService = {
  async createUser(userData) {
    // Lógica de negócio aqui
    const user = await userModel.create(userData);
    return user;
  }
};

module.exports = userService;
```

### Criar um Controller
```javascript
// src/controllers/userController.js
const userService = require('../services/userService');
const responseHelper = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');

const userController = {
  create: asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body);
    return responseHelper.created(res, user);
  })
};

module.exports = userController;
```

### Criar Rotas
```javascript
// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.post('/', userController.create);
router.get('/:id', userController.findById);

module.exports = router;
```

### Registrar Rotas no app.js
```javascript
const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes);
```

## 🔧 Configuração

Crie um arquivo `.env` na raiz do back-end:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=appdb
DB_USER=appuser
DB_PASSWORD=app123
NODE_ENV=development
```

