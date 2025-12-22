# Exemplo Completo de Estrutura

Este documento mostra como criar um módulo completo seguindo a arquitetura do projeto.

## Exemplo: Módulo de Produtos

### 1. Model (src/models/Product.js)

```javascript
const BaseModel = require('./BaseModel');

class Product extends BaseModel {
  constructor() {
    super('products');
  }

  async findByCategory(categoryId) {
    return this.findWhere({ category_id: categoryId });
  }

  async findActive() {
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE active = true ORDER BY created_at DESC`
    );
    return result.rows;
  }
}

module.exports = new Product();
```

### 2. Service (src/services/productService.js)

```javascript
const productModel = require('../models/Product');
const { query } = require('../../config/database');

const productService = {
  async getAllProducts(filters = {}) {
    let products;
    
    if (filters.categoryId) {
      products = await productModel.findByCategory(filters.categoryId);
    } else if (filters.activeOnly) {
      products = await productModel.findActive();
    } else {
      products = await productModel.findAll();
    }
    
    return products;
  },

  async getProductById(id) {
    const product = await productModel.findById(id);
    if (!product) {
      throw new Error('Produto não encontrado');
    }
    return product;
  },

  async createProduct(productData) {
    // Validações de negócio aqui
    if (!productData.name || !productData.price) {
      throw new Error('Nome e preço são obrigatórios');
    }
    
    return await productModel.create(productData);
  },

  async updateProduct(id, productData) {
    const product = await this.getProductById(id);
    return await productModel.update(id, productData);
  },

  async deleteProduct(id) {
    const product = await this.getProductById(id);
    return await productModel.delete(id);
  }
};

module.exports = productService;
```

### 3. Controller (src/controllers/product.controller.js)

```javascript
const productService = require('../services/productService');
const responseHelper = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');

const productController = {
  getAll: asyncHandler(async (req, res) => {
    const filters = {
      categoryId: req.query.categoryId,
      activeOnly: req.query.active === 'true',
    };
    
    const products = await productService.getAllProducts(filters);
    return responseHelper.success(res, products, 'Produtos listados com sucesso');
  }),

  getById: asyncHandler(async (req, res) => {
    const product = await productService.getProductById(req.params.id);
    return responseHelper.success(res, product, 'Produto encontrado');
  }),

  create: asyncHandler(async (req, res) => {
    const product = await productService.createProduct(req.body);
    return responseHelper.created(res, product, 'Produto criado com sucesso');
  }),

  update: asyncHandler(async (req, res) => {
    const product = await productService.updateProduct(req.params.id, req.body);
    return responseHelper.success(res, product, 'Produto atualizado com sucesso');
  }),

  delete: asyncHandler(async (req, res) => {
    await productService.deleteProduct(req.params.id);
    return responseHelper.success(res, null, 'Produto deletado com sucesso');
  }),
};

module.exports = productController;
```

### 4. Routes (src/routes/product.routes.js)

```javascript
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// GET /api/products - Lista todos os produtos
router.get('/', productController.getAll);

// GET /api/products/:id - Busca produto por ID
router.get('/:id', productController.getById);

// POST /api/products - Cria novo produto
router.post('/', productController.create);

// PUT /api/products/:id - Atualiza produto
router.put('/:id', productController.update);

// DELETE /api/products/:id - Deleta produto
router.delete('/:id', productController.delete);

module.exports = router;
```

### 5. Registrar no index de rotas (src/routes/index.js)

```javascript
const productRoutes = require('./product.routes');
router.use('/products', productRoutes);
```

### 6. Validator (src/validators/product.validator.js) - Opcional

```javascript
// Exemplo usando express-validator
const { body, param, query } = require('express-validator');

const productValidator = {
  create: [
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('price').isFloat({ min: 0 }).withMessage('Preço deve ser um número positivo'),
    body('description').optional().isString(),
  ],
  
  update: [
    param('id').isInt().withMessage('ID deve ser um número'),
    body('name').optional().notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
  ],
  
  getById: [
    param('id').isInt().withMessage('ID deve ser um número'),
  ],
};

module.exports = productValidator;
```

### 7. Usar validator nas rotas

```javascript
const { validate } = require('express-validator');
const productValidator = require('../validators/product.validator');

router.post('/', productValidator.create, validate, productController.create);
router.put('/:id', productValidator.update, validate, productController.update);
```

## Fluxo de Requisição

1. **Cliente** → Faz requisição HTTP
2. **Route** → Recebe e direciona para o controller
3. **Validator** → Valida os dados (se houver)
4. **Controller** → Chama o service apropriado
5. **Service** → Executa lógica de negócio e chama o model
6. **Model** → Interage com o banco de dados
7. **Response** → Retorna resposta padronizada

## Boas Práticas

- ✅ Controllers devem ser simples (apenas receber e retornar)
- ✅ Lógica de negócio deve estar nos Services
- ✅ Models apenas interagem com banco de dados
- ✅ Use asyncHandler para evitar try/catch em todos os controllers
- ✅ Use responseHelper para padronizar respostas
- ✅ Valide dados de entrada
- ✅ Trate erros adequadamente
- ✅ Use nomes descritivos para funções e variáveis

