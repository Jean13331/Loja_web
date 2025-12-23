from rest_framework.decorators import api_view
from rest_framework.request import Request

from api.middleware.auth_middleware import get_user_from_authorization_header
from api.services import auth_service
from api.utils import response_helper


@api_view(["POST"])
def register(request: Request):
    try:
        result = auth_service.register_user(request.data)
        return response_helper.created(
            {"user": result["user"], "token": result["token"]},
            "Usuário cadastrado com sucesso",
        )
    except ValueError as exc:
        return response_helper.error(str(exc), status_code=400)


@api_view(["POST"])
def login(request: Request):
    email = request.data.get("email")
    senha = request.data.get("senha")

    if not email or not senha:
        return response_helper.error("Email e senha são obrigatórios", status_code=400)

    try:
        result = auth_service.login_user(email, senha)
        return response_helper.success(
            {"user": result["user"], "token": result["token"]},
            "Login realizado com sucesso",
        )
    except ValueError as exc:
        return response_helper.error(str(exc), status_code=400)


@api_view(["GET"])
def verify_token(request: Request):
    decoded = get_user_from_authorization_header(request.headers.get("Authorization"))
    return response_helper.success(
        {"user": decoded, "valid": True},
        "Token válido",
    )


