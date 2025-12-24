# Guia de Instalação e Configuração - Backend Django

## Passo a Passo

### 1. Criar e Ativar Ambiente Virtual

```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate
```

### 2. Instalar Dependências

```bash
pip install -r requirements.txt
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend/` com o seguinte conteúdo:

```env
# Django Settings
SECRET_KEY=django-insecure-change-this-in-production
DEBUG=True

# Database (mesmas credenciais do backend Node.js)
DB_NAME=appdb
DB_USER=appuser
DB_PASSWORD=app123
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET=seu-secret-key-aqui-mude-em-producao
```

### 4. Verificar Conexão com Banco de Dados

Certifique-se de que o PostgreSQL está rodando (via Docker Compose):

```bash
cd ../back-end/postgres_docker
docker-compose up -d
```

### 5. Iniciar o Servidor Django

```bash
python manage.py runserver
```

O servidor estará disponível em: `http://localhost:8000`

## Testando a API

### Health Check
```bash
curl http://localhost:8000/health
```

### Registrar Usuário
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste",
    "email": "teste@teste.com",
    "senha": "123456",
    "cpf": "12345678901",
    "numero_telefone": "11999999999",
    "nascimento": "2000-01-01"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@teste.com",
    "senha": "123456"
  }'
```

## Troubleshooting

### Erro: "No module named 'django'"
- Certifique-se de que o ambiente virtual está ativado
- Execute: `pip install -r requirements.txt`

### Erro: "could not connect to server"
- Verifique se o PostgreSQL está rodando
- Verifique as credenciais no arquivo `.env`

### Erro: "relation 'usuario' does not exist"
- As tabelas devem ser criadas pelo script SQL do PostgreSQL
- Execute o script de inicialização do banco de dados

