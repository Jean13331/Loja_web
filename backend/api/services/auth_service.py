from django.db import transaction

from api.models import Usuario
from api.utils import hash_utils, jwt_utils


def register_user(payload: dict):
    email = payload["email"]
    cpf_raw = payload["cpf"]
    phone_raw = payload["numero_telefone"]
    senha_raw = payload["senha"]

    if Usuario.objects.filter(email=email).exists():
        raise ValueError("Email já cadastrado")

    hashed_cpf = hash_utils.md5_hash_numeric_only(cpf_raw)
    hashed_phone = hash_utils.md5_hash_numeric_only(phone_raw)

    if Usuario.objects.filter(cpf=hashed_cpf).exists():
        raise ValueError("CPF já cadastrado")

    hashed_password = hash_utils.md5_hash(senha_raw)

    with transaction.atomic():
        user = Usuario.objects.create(
            nome=payload["nome"],
            email=email,
            numero_telefone=hashed_phone,
            senha=hashed_password,
            cpf=hashed_cpf,
            nascimento=payload["nascimento"],
            admin=payload.get("admin") or 0,
        )

    user_dict = {
        "idusuario": user.idusuario,
        "nome": user.nome,
        "email": user.email,
        "nascimento": user.nascimento.isoformat(),
        "admin": user.admin,
    }

    token_payload = {
        "id": user.idusuario,
        "email": user.email,
        "nome": user.nome,
        "admin": user.admin,
    }
    token = jwt_utils.generate_token(token_payload)

    return {"user": user_dict, "token": token}


def login_user(email: str, senha: str):
    try:
        user = Usuario.objects.get(email=email)
    except Usuario.DoesNotExist:
        raise ValueError("Email ou senha inválidos")

    password_hash = hash_utils.md5_hash(senha)
    if user.senha != password_hash:
        raise ValueError("Email ou senha inválidos")

    user_dict = {
        "idusuario": user.idusuario,
        "nome": user.nome,
        "email": user.email,
        "nascimento": user.nascimento.isoformat(),
        "admin": user.admin,
    }

    token_payload = {
        "id": user.idusuario,
        "email": user.email,
        "nome": user.nome,
        "admin": user.admin,
    }
    token = jwt_utils.generate_token(token_payload)

    return {"user": user_dict, "token": token}


