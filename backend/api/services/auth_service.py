from api.models import Usuario
from api.utils.hash_utils import md5_hash, md5_hash_numeric_only
from api.utils.jwt_utils import generate_token


def register_user(user_data):
    """
    Registra um novo usuário
    Compatível com o backend Node.js original
    """
    email = user_data.get("email")
    if not email:
        raise ValueError("Email é obrigatório")

    # Verificar se email já existe
    if Usuario.objects.filter(email=email).exists():
        raise ValueError("Email já cadastrado")

    # Hash do CPF e telefone (só dígitos, igual ao Node)
    cpf = user_data.get("cpf")
    if not cpf:
        raise ValueError("CPF é obrigatório")
    
    hashed_cpf = md5_hash_numeric_only(cpf)
    
    # Verificar se CPF já existe
    if Usuario.objects.filter(cpf=hashed_cpf).exists():
        raise ValueError("CPF já cadastrado")

    # Hash do telefone
    numero_telefone = user_data.get("numero_telefone")
    if not numero_telefone:
        raise ValueError("Número de telefone é obrigatório")
    
    hashed_phone = md5_hash_numeric_only(numero_telefone)

    # Hash da senha em MD5
    senha = user_data.get("senha")
    if not senha:
        raise ValueError("Senha é obrigatória")
    
    hashed_password = md5_hash(senha)

    # Criar usuário
    # Converter admin para boolean (pode vir como 0/1 ou True/False)
    admin_value = user_data.get("admin", False)
    if isinstance(admin_value, int):
        admin_value = bool(admin_value)
    
    # Definir data_cadastro explicitamente
    from django.utils import timezone
    
    user = Usuario(
        nome=user_data.get("nome"),
        email=email,
        numero_telefone=hashed_phone,
        senha=hashed_password,
        cpf=hashed_cpf,
        nascimento=user_data.get("nascimento"),
        admin=admin_value,
        data_cadastro=timezone.now(),
    )
    user.save()

    # Retornar dados sem informações sensíveis
    user_dict = user.to_dict(exclude_sensitive=True)
    
    # Gerar token JWT (compatível com o Node)
    token_payload = {
        "id": user.idusuario,
        "email": user.email,
        "nome": user.nome,
        "admin": user.admin,
    }
    token = generate_token(token_payload)

    return {
        "user": user_dict,
        "token": token,
    }


def login_user(email, senha):
    """
    Autentica um usuário
    Compatível com o backend Node.js original
    """
    if not email or not senha:
        raise ValueError("Email e senha são obrigatórios")

    # Buscar usuário por email
    try:
        user = Usuario.objects.get(email=email)
    except Usuario.DoesNotExist:
        raise ValueError("Email ou senha inválidos")

    # Verificar senha (MD5)
    password_hash = md5_hash(senha)
    if password_hash != user.senha:
        raise ValueError("Email ou senha inválidos")

    # Retornar dados sem informações sensíveis
    user_dict = user.to_dict(exclude_sensitive=True)
    
    # Gerar token JWT (compatível com o Node)
    token_payload = {
        "id": user.idusuario,
        "email": user.email,
        "nome": user.nome,
        "admin": user.admin,
    }
    token = generate_token(token_payload)

    return {
        "user": user_dict,
        "token": token,
    }

