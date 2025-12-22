# 💾 Criar Tabelas SEM Perder Dados

## ⚠️ Você já tem dados no banco?

**NÃO execute `docker-compose down -v`!** Isso apaga todos os dados.

## ✅ Solução: Executar SQL Manualmente

### Opção 1: Usar o Script Automatizado (Recomendado)

#### No Windows (PowerShell):
```powershell
cd back-end/postgres_docker
.\init-tabelas-sem-perder-dados.ps1
```

#### No Linux/Mac:
```bash
cd back-end/postgres_docker
chmod +x init-tabelas-sem-perder-dados.sh
./init-tabelas-sem-perder-dados.sh
```

### Opção 2: Executar Manualmente

#### Windows (PowerShell):
```powershell
cd back-end/postgres_docker
Get-Content .\init\01-init.sql | docker exec -i postgres_local psql -U appuser -d appdb
```

#### Linux/Mac:
```bash
cd back-end/postgres_docker
docker exec -i postgres_local psql -U appuser -d appdb < ./init/01-init.sql
```

### Opção 3: Conectar e Executar

```bash
# 1. Conectar ao banco
docker exec -it postgres_local psql -U appuser -d appdb

# 2. Dentro do psql, copiar e colar o conteúdo de init/01-init.sql
# Ou executar:
\i /docker-entrypoint-initdb.d/01-init.sql
```

## 🔒 Por que é seguro?

O script usa `CREATE TABLE IF NOT EXISTS`, então:
- ✅ Se a tabela **não existe**, ela será criada
- ✅ Se a tabela **já existe**, nada acontece (dados preservados)
- ✅ Se a tabela existe mas está **vazia**, os dados continuam seguros

## 📋 Verificar Resultado

Depois de executar, verifique:

```bash
# Listar todas as tabelas
docker exec -it postgres_local psql -U appuser -d appdb -c "\dt"

# Verificar dados existentes (exemplo: tabela usuario)
docker exec -it postgres_local psql -U appuser -d appdb -c "SELECT COUNT(*) FROM usuario;"
```

## 🎯 Resumo

| Situação | Comando |
|----------|---------|
| **Banco vazio** (sem dados) | `docker-compose down -v && docker-compose up -d` |
| **Banco com dados** | Execute o script `init-tabelas-sem-perder-dados` |
| **Dúvida?** | Use sempre a opção que preserva dados! |

## ⚡ Quick Fix

**No seu outro computador (Windows):**

```powershell
cd back-end/postgres_docker
Get-Content .\init\01-init.sql | docker exec -i postgres_local psql -U appuser -d appdb
```

Pronto! Tabelas criadas, dados preservados! 🎉

