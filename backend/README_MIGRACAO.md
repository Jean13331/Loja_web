# Guia de Migração - Datas e Histórico de Produtos

## 📋 Resumo das Alterações

### 1. Tabela `usuario` - Novos Campos:
- ✅ `data_cadastro` (TIMESTAMP): Data/hora do cadastro do usuário
- ✅ `data_admin` (TIMESTAMP, nullable): Data/hora em que virou admin

### 2. Nova Tabela `produto_historico`:
- ✅ Rastreia quem criou/editou/deletou produtos
- ✅ Armazena dados anteriores e novos (para edições)
- ✅ Inclui data/hora de cada ação

## 🚀 Como Aplicar

### Método 1: Script Python (Recomendado)
```bash
cd backend
.\.venv\Scripts\activate
python scripts/migrate-database-dates.py
```

### Método 2: SQL Direto
```sql
-- Conectar ao PostgreSQL e executar:
\i back-end/postgres_docker/init/03-migrate-usuario-dates.sql
\i back-end/postgres_docker/init/04-create-produto-historico.sql
```

### Método 3: Via Docker
```bash
cd back-end/postgres_docker
docker-compose exec postgres psql -U appuser -d appdb -f /docker-entrypoint-initdb.d/03-migrate-usuario-dates.sql
docker-compose exec postgres psql -U appuser -d appdb -f /docker-entrypoint-initdb.d/04-create-produto-historico.sql
```

## 📝 Uso no Código

### Registrar histórico ao criar produto:
```python
from api.utils.produto_historico import registrar_historico_produto

# Após criar produto
registrar_historico_produto(
    produto_id=produto.idproduto,
    usuario_id=request.user.idusuario,
    acao='criado',
    dados_novos={
        'nome': produto.nome,
        'valor': str(produto.valor),
        'estoque': produto.estoque,
    }
)
```

### Registrar histórico ao editar produto:
```python
# Antes de editar, salvar estado anterior
dados_anteriores = {
    'nome': produto.nome,
    'valor': str(produto.valor),
    'estoque': produto.estoque,
}

# Fazer edição...
produto.nome = novo_nome
produto.save()

# Registrar histórico
registrar_historico_produto(
    produto_id=produto.idproduto,
    usuario_id=request.user.idusuario,
    acao='editado',
    dados_anteriores=dados_anteriores,
    dados_novos={
        'nome': produto.nome,
        'valor': str(produto.valor),
        'estoque': produto.estoque,
    }
)
```

## 🔍 Consultas Úteis

```sql
-- Ver histórico completo de um produto
SELECT ph.*, u.nome as usuario_nome
FROM produto_historico ph
JOIN usuario u ON ph.usuario_idusuario = u.idusuario
WHERE ph.produto_idproduto = 1
ORDER BY ph.data_acao DESC;

-- Ver quem criou cada produto
SELECT p.nome, u.nome as criado_por, ph.data_acao
FROM produto p
JOIN produto_historico ph ON p.idproduto = ph.produto_idproduto
JOIN usuario u ON ph.usuario_idusuario = u.idusuario
WHERE ph.acao = 'criado';

-- Ver quando usuários foram promovidos a admin
SELECT nome, email, data_admin
FROM usuario
WHERE admin = 1 AND data_admin IS NOT NULL
ORDER BY data_admin DESC;
```

## ⚠️ Importante

- **Backup**: Faça backup do banco antes de aplicar as migrações
- **Usuários existentes**: `data_cadastro` será preenchido com a data atual
- **Admins existentes**: `data_admin` será preenchido com a data atual
- **Trigger automático**: `data_admin` é atualizado automaticamente quando `admin` muda

