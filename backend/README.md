# Backend Django - Loja Web

Backend refatorado de Node.js para Django REST Framework.

## Pré-requisitos

- Python 3.11+
- PostgreSQL (rodando via Docker Compose)
- Virtual environment (venv)

## Instalação

1. **Criar e ativar ambiente virtual:**
```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate
```

2. **Instalar dependências:**
```bash
pip install -r requirements.txt
```

3. **Configurar variáveis de ambiente:**
```bash
# Copiar arquivo de exemplo
copy .env.example .env

# Editar .env com suas configurações
```

4. **Aplicar migrações (se necessário):**
```bash
python manage.py migrate
```

**Nota:** As tabelas já existem no banco de dados PostgreSQL. O modelo `Usuario` está configurado com `managed = False` para não criar/migrar tabelas.

## Executar o servidor

```bash
python manage.py runserver
```

O servidor estará disponível em: `http://localhost:8000`

## Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token (protegido)

### Usuário
- `GET /api/user/me` - Dados do usuário autenticado (protegido)

### Health Check
- `GET /health` - Verificar status da API
- `GET /` - Rota raiz

## Estrutura do Projeto

```
backend/
├── api/                 # App principal da API
│   ├── models.py        # Modelos (Usuario)
│   ├── serializers.py   # Serializers DRF
│   ├── views.py         # Views/Controllers
│   ├── services.py      # Lógica de negócio
│   ├── urls.py          # Rotas
│   └── utils/           # Utilitários
├── loja_web/            # Configurações do projeto
│   ├── settings.py      # Configurações Django
│   └── urls.py          # URLs principais
├── manage.py            # Script de gerenciamento Django
└── requirements.txt     # Dependências Python
```

## Diferenças do Backend Node.js

- **Autenticação:** Usa `djangorestframework-simplejwt` em vez de `jsonwebtoken`
- **ORM:** Usa Django ORM (mas com `managed = False` para tabelas existentes)
- **Respostas:** Mantém o mesmo formato de resposta (`status`, `message`, `data`)
- **Hashing:** Mantém MD5 para CPF, telefone e senha (compatibilidade)

## Desenvolvimento

Para desenvolvimento com hot-reload, use:
```bash
python manage.py runserver --noreload
```

## Produção

Para produção, configure:
- `DEBUG=False`
- `SECRET_KEY` seguro
- `ALLOWED_HOSTS` específicos
- Use um servidor WSGI como Gunicorn ou uWSGI


