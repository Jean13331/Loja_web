# Como Configurar um Usuário como Administrador

Para que um usuário possa fazer login no painel administrativo (`/admin/login`), é necessário que o campo `admin` no banco de dados esteja configurado como `1` (ou `true`).

## Verificar se um usuário é admin

No PostgreSQL, você pode verificar o status de admin de um usuário:

```sql
SELECT idusuario, nome, email, admin FROM usuario WHERE email = 'seu@email.com';
```

## Marcar um usuário como admin

### Opção 1: Via SQL direto

```sql
-- Marcar um usuário específico como admin
UPDATE usuario SET admin = 1 WHERE email = 'seu@email.com';

-- Verificar se foi atualizado
SELECT idusuario, nome, email, admin FROM usuario WHERE email = 'seu@email.com';
```

### Opção 2: Via script Python

Crie um arquivo `set_admin.py` na pasta `backend/`:

```python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'loja_web.settings')
django.setup()

from api.models import Usuario

# Buscar usuário por email
email = 'seu@email.com'
try:
    user = Usuario.objects.get(email=email)
    user.admin = 1
    user.save()
    print(f'✅ Usuário {user.nome} ({user.email}) agora é administrador!')
except Usuario.DoesNotExist:
    print(f'❌ Usuário com email {email} não encontrado.')
```

Execute:
```bash
python set_admin.py
```

### Opção 3: Durante o cadastro

Ao criar um novo usuário via API `/api/auth/register`, você pode passar `"admin": 1` no JSON:

```json
{
  "nome": "Admin",
  "email": "admin@cajuzinho.com",
  "senha": "senha123",
  "cpf": "12345678901",
  "numero_telefone": "11999999999",
  "nascimento": "1990-01-01",
  "admin": 1
}
```

## Validação no Backend

O endpoint `/api/auth/admin/login` verifica:

1. ✅ Se o email existe
2. ✅ Se o usuário tem `admin = 1` no banco
3. ✅ Se a senha está correta

**Importante:** A validação de admin acontece ANTES da verificação de senha, então usuários não-admin não conseguem descobrir se a senha está correta ou não.

## Testar

1. Marque um usuário como admin no banco:
   ```sql
   UPDATE usuario SET admin = 1 WHERE email = 'seu@email.com';
   ```

2. Acesse `/admin/login` no frontend

3. Faça login com as credenciais do usuário admin

4. Você será redirecionado para `/admin/dashboard`

## Remover privilégios de admin

```sql
UPDATE usuario SET admin = 0 WHERE email = 'seu@email.com';
```

