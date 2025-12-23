# 🐳 Setup do PostgreSQL com Docker

## ⚠️ Problema Comum: Tabelas não são criadas

Se você executou `docker-compose up` e o banco veio sem tabelas, é porque:

1. **A pasta `init/` estava vazia** (agora está corrigido)
2. **Os scripts só rodam na primeira inicialização** quando o volume está vazio

## ✅ Solução: Recriar o Container

### No seu outro computador, execute:

```bash
cd back-end/postgres_docker

# 1. Parar e remover o container e volume
docker-compose down -v

# 2. Iniciar novamente (agora vai executar o script init/01-init.sql)
docker-compose up -d

# 3. Verificar se as tabelas foram criadas
docker exec -it postgres_local psql -U appuser -d appdb -c "\dt"
```

## 🔍 Verificar se funcionou

```bash
# Listar todas as tabelas
docker exec -it postgres_local psql -U appuser -d appdb -c "\dt"

# Deve mostrar:
# - produto
# - produto_imagem
# - usuario
# - cartoes
# - endereco
# - produto_favorito
# - produto_favorito_has_produto
# - avaliacao_usuario
# - avaliacao_usuario_has_usuario
# - avaliacao_usuario_has_produto
# - carrinho
# - carrinho_item
# - pedido
# - pedido_item
```

## 📝 Alternativa: Executar SQL Manualmente

Se não quiser recriar o volume (e perder dados existentes):

```bash
# Executar o SQL diretamente
docker exec -i postgres_local psql -U appuser -d appdb < ../../loja_postgres.sql
```

**Nota**: O SQL original usa `INTEGER` para IDs. Se quiser auto-incremento, use o arquivo `init/01-init.sql` que já está corrigido com `SERIAL`.

## 🎯 Checklist

- [ ] Pasta `init/` contém o arquivo `01-init.sql`
- [ ] Executou `docker-compose down -v` para remover volume antigo
- [ ] Executou `docker-compose up -d` para criar novo container
- [ ] Verificou que as tabelas foram criadas

## 💡 Dica

Sempre que adicionar novos scripts SQL na pasta `init/`, eles serão executados automaticamente na próxima criação do container (volume vazio).

