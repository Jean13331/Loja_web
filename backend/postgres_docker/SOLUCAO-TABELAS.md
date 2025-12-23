# 🔧 Solução: Banco sem Tabelas

## ❌ Problema

Quando você executou `docker-compose up` no outro computador, o banco foi criado mas **sem tabelas**.

## 🔍 Por que aconteceu?

1. A pasta `init/` estava **vazia** quando você executou
2. O PostgreSQL Docker só executa scripts de `init/` na **primeira inicialização** (quando o volume está vazio)
3. Como o volume já foi criado (mesmo vazio), os scripts não rodam mais

## ✅ Solução: Criar Tabelas SEM Perder Dados (Recomendado)

### 🛡️ Se você JÁ TEM DADOS no banco:

**⚠️ NÃO use `docker-compose down -v` - isso apaga tudo!**

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

**Por que é seguro?** O script usa `CREATE TABLE IF NOT EXISTS` - só cria tabelas que não existem, preservando seus dados! ✅

---

## 🔄 Solução Alternativa: Recriar Container (Só se banco estiver VAZIO)

### ⚠️ Use APENAS se o banco estiver vazio (sem dados importantes):

```bash
# 1. Ir para a pasta do docker
cd back-end/postgres_docker

# 2. Parar e REMOVER o volume (⚠️ APAGA TODOS OS DADOS!)
docker-compose down -v

# 3. Iniciar novamente (agora vai executar o script init/01-init.sql)
docker-compose up -d

# 4. Aguardar alguns segundos para o banco inicializar
sleep 5

# 5. Verificar se as tabelas foram criadas
docker exec -it postgres_local psql -U appuser -d appdb -c "\dt"
```

### Verificação Completa:

```bash
# Ver todas as tabelas
docker exec -it postgres_local psql -U appuser -d appdb -c "\dt"

# Ver estrutura de uma tabela específica
docker exec -it postgres_local psql -U appuser -d appdb -c "\d usuario"

# Contar registros (deve retornar 0, mas tabela existe)
docker exec -it postgres_local psql -U appuser -d appdb -c "SELECT COUNT(*) FROM usuario;"
```

## 📋 Tabelas que devem ser criadas:

- ✅ produto
- ✅ produto_imagem
- ✅ usuario
- ✅ cartoes
- ✅ endereco
- ✅ produto_favorito
- ✅ produto_favorito_has_produto
- ✅ avaliacao_usuario
- ✅ avaliacao_usuario_has_usuario
- ✅ avaliacao_usuario_has_produto
- ✅ carrinho
- ✅ carrinho_item
- ✅ pedido
- ✅ pedido_item

## 🚨 Importante

**O comando `docker-compose down -v` apaga TODOS os dados do banco!**

Se você já tem dados importantes:
1. Faça backup primeiro
2. Ou execute o SQL manualmente (veja abaixo)

## 🔄 Alternativa: Executar SQL Manualmente

Se você **já tem dados** e não quer perder:

```bash
# Executar o SQL diretamente no container
docker exec -i postgres_local psql -U appuser -d appdb < ../../loja_postgres.sql
```

Ou conecte manualmente:

```bash
# Conectar ao banco
docker exec -it postgres_local psql -U appuser -d appdb

# Dentro do psql, execute:
\i /docker-entrypoint-initdb.d/01-init.sql
# ou copie e cole o conteúdo do arquivo SQL
```

## ✅ Depois de resolver

Após executar os comandos acima, as tabelas devem estar criadas. Você pode testar fazendo um cadastro pelo front-end!

