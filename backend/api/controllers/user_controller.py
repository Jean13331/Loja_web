from rest_framework.decorators import api_view
from rest_framework.request import Request

from api.middleware.auth_middleware import get_user_from_authorization_header
from api.utils import response_helper


@api_view(["GET"])
def get_me(request: Request):
    decoded = get_user_from_authorization_header(request.headers.get("Authorization"))

    user_without_sensitive = {
        "idusuario": decoded.get("id"),
        "nome": decoded.get("nome"),
        "email": decoded.get("email"),
        "admin": decoded.get("admin"),
    }

    return response_helper.success(user_without_sensitive, "Dados do usuário")


