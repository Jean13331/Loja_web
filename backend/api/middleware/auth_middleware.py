from rest_framework.exceptions import AuthenticationFailed

from api.utils import jwt_utils


def get_user_from_authorization_header(authorization: str | None):
    if not authorization:
        raise AuthenticationFailed("Token não fornecido")

    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0] != "Bearer":
        raise AuthenticationFailed("Formato de token inválido. Use: Bearer <token>")

    token = parts[1]
    try:
        decoded = jwt_utils.verify_token(token)
    except Exception as exc:  # jwt errors
        raise AuthenticationFailed(str(exc))

    return decoded


