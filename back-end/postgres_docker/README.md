# 🐳 Docker PostgreSQL Setup

Este diretório contém a configuração do PostgreSQL usando Docker Compose.

## 📋 Estrutura

```
postgres_docker/
├── docker-compose.yml    # Configuração do container PostgreSQL
├── init/                 # Scripts SQL executados na primeira inicialização
│   ├── 01-init.sql      # Criação das tabelas (estrutura)
│   └── 02-seed-data.sql # Dados iniciais (será executado após 01-init.sql)
└── data/                # Dados do banco (volume Docker - não commitado)
```

## 🚀 Como Usar

### 1. Iniciar o banco de dados

```bash
cd back-end/postgres_docker
docker-compose up -d
```

Isso irá:
- Criar o container PostgreSQL
- Executar `01-init.sql` (cria as tabelas)
- Executar `02-seed-data.sql` (insere dados iniciais, se existirem)

### 2. Parar o banco de dados

```bash
docker-compose down
```

### 3. Parar e remover todos os dados (⚠️ CUIDADO!)

```bash
docker-compose down -v
```

Isso remove o volume com todos os dados. Na próxima inicialização, os scripts serão executados novamente.

## 📦 Exportar Dados Atuais

Se você cadastrou dados e quer que eles sejam incluídos no repositório:

```bash
cd back-end
npm run dump:db
```

Isso irá:
- Exportar todos os dados do banco atual
- Salvar em `postgres_docker/init/02-seed-data.sql`
- Você pode fazer commit deste arquivo no Git

**Importante:** 
- Execute `npm run dump:db` sempre que quiser atualizar os dados no repositório
- Faça commit do arquivo `02-seed-data.sql` após exportar
- Outras pessoas que fizerem `docker-compose up` terão os mesmos dados

## 🔄 Fluxo Completo

1. **Primeira vez (você):**
   ```bash
   docker-compose up -d
   # Cadastra dados na aplicação
   npm run dump:db
   git add postgres_docker/init/02-seed-data.sql
   git commit -m "Adiciona dados iniciais"
   git push
   ```

2. **Outra pessoa (clone do repositório):**
   ```bash
   git clone <repositorio>
   cd Loja_web/back-end/postgres_docker
   docker-compose up -d
   # ✅ Banco criado com estrutura E dados!
   ```

## 📝 Notas

- Os scripts em `init/` são executados **apenas na primeira inicialização** do banco
- Se você já tem um banco rodando, os scripts não serão executados novamente
- Para forçar a execução novamente, remova o volume: `docker-compose down -v`
- O arquivo `02-seed-data.sql` é commitado no Git, então os dados estarão disponíveis para todos
