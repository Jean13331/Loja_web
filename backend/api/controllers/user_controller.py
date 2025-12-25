from rest_framework.decorators import api_view
from rest_framework.request import Request

from api.middleware.auth_middleware import get_user_from_authorization_header
from api.models import Usuario
from api.utils import response_helper


@api_view(["GET"])
def get_me(request: Request):
    decoded = get_user_from_authorization_header(request.headers.get("Authorization"))
    user_id = decoded.get("id")
    
    # Buscar dados completos do usuário
    try:
        user = Usuario.objects.get(idusuario=user_id)
    except Usuario.DoesNotExist:
        return response_helper.error("Usuário não encontrado", status_code=404)
    
    # Retornar dados sem informações sensíveis (igual ao Node)
    user_dict = user.to_dict(exclude_sensitive=True)
    
    return response_helper.success(user_dict, "Dados do usuário")


