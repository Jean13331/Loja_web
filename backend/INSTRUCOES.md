# Como Iniciar o Backend Django

## Opção 1: Usando o Script Automático (Windows)

```bash
cd backend
start.bat
```

## Opção 2: Manual

### 1. Ativar Ambiente Virtual

**Windows:**
```bash
cd backend
.\.venv\Scripts\activate
```

**Linux/Mac:**
```bash
cd backend
source .venv/bin/activate
```

### 2. Instalar Dependências (primeira vez)

```bash
pip install -r requirements.txt
```

### 3. Configurar .env

Crie o arquivo `.env` na pasta `backend/` com:

```env
SECRET_KEY=django-insecure-change-this-in-production
DEBUG=True
DB_NAME=appdb
DB_USER=appuser
DB_PASSWORD=app123
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=seu-secret-key-aqui-mude-em-producao
```

### 4. Iniciar Servidor

```bash
python manage.py runserver
```

O servidor estará em: **http://localhost:8000**

## Importante: Atualizar Frontend

O frontend está configurado para usar `http://localhost:3000/api` (backend Node.js).

Para usar o backend Django, você precisa:

1. **Opção A:** Atualizar a variável de ambiente no frontend:
   - Criar/editar `.env` na pasta `front-end/`
   - Adicionar: `VITE_API_URL=http://localhost:8000/api`

2. **Opção B:** Atualizar diretamente em `front-end/src/services/api.js`:
   - Mudar `baseURL` de `http://localhost:3000/api` para `http://localhost:8000/api`

## Testar API

```bash
# Health check
curl http://localhost:8000/health

# Rota raiz
curl http://localhost:8000/
```


