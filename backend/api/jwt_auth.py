from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.models import AnonymousUser
from .models import Usuario


class CustomJWTAuthentication(JWTAuthentication):
    """Autenticação JWT customizada para usar o modelo Usuario"""
    
    def get_user(self, validated_token):
        """Retorna o usuário baseado no token validado"""
        try:
            user_id = validated_token.get('id') or validated_token.get('user_id')
            if user_id:
                user = Usuario.objects.get(idusuario=user_id)
                # Adicionar atributos necessários para compatibilidade
                user.is_authenticated = True
                return user
        except (Usuario.DoesNotExist, KeyError):
            pass
        return AnonymousUser()

