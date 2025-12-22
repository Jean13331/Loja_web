# Docker PostgreSQL - Loja Web

Configuração do PostgreSQL usando Docker Compose.

## 🚀 Como Usar

### Primeira vez (cria banco e tabelas)
```bash
docker-compose up -d
```

### Parar o container
```bash
docker-compose down
```

### Parar e remover volumes (apaga todos os dados)
```bash
docker-compose down -v
```

### Ver logs
```bash
docker-compose logs -f
```

## ⚠️ Importante

### Por que as tabelas não são criadas em outro ambiente?

O PostgreSQL Docker **só executa scripts da pasta `init/` na primeira inicialização**, quando o volume está vazio.

**Se você já tem dados no volume:**
1. Pare o container: `docker-compose down`
2. Remova o volume: `docker-compose down -v`
3. Inicie novamente: `docker-compose up -d`

**Ou execute o SQL manualmente:**
```bash
# Conectar ao container
docker exec -it postgres_local psql -U appuser -d appdb

# Ou executar o SQL diretamente
docker exec -i postgres_local psql -U appuser -d appdb < ../loja_postgres.sql
```

## 📁 Estrutura

```
postgres_docker/
├── docker-compose.yml    # Configuração do Docker
├── init/                 # Scripts SQL executados na primeira inicialização
│   └── 01-init.sql       # Script de criação das tabelas
└── data/                 # Dados do PostgreSQL (volume)
```

## 🔧 Configuração

- **Banco**: appdb
- **Usuário**: appuser
- **Senha**: app123
- **Porta**: 5432

## 📝 Scripts de Inicialização

Os arquivos na pasta `init/` são executados em ordem alfabética quando o banco é criado pela primeira vez.

**Importante**: 
- Scripts só rodam quando o volume está vazio
- Use `SERIAL` ao invés de `INTEGER` para IDs auto-incrementais
- Adicione `UNIQUE` onde necessário (email, CPF, etc)
- Use `ON DELETE CASCADE` para manter integridade referencial

