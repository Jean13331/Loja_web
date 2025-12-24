from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.models import AnonymousUser
from .serializers import RegisterSerializer, LoginSerializer, UsuarioSerializer
from .services import AuthService
from .models import Usuario


def format_response(status_type, message, data=None, status_code=200):
    """Formata resposta no padrão da API"""
    response_data = {
        'status': status_type,
        'message': message,
    }
    if data is not None:
        response_data['data'] = data
    return Response(response_data, status=status_code)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Registra um novo usuário"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        try:
            result = AuthService.register(serializer.validated_data)
            return format_response('success', 'Usuário cadastrado com sucesso', result, status.HTTP_201_CREATED)
        except ValueError as e:
            return format_response('error', str(e), None, status.HTTP_400_BAD_REQUEST)
    return format_response('error', 'Erro de validação', serializer.errors, status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Autentica um usuário"""
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return format_response('error', 'Email e senha são obrigatórios', None, status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    senha = serializer.validated_data['senha']
    
    try:
        result = AuthService.login(email, senha)
        return format_response('success', 'Login realizado com sucesso', result, status.HTTP_200_OK)
    except ValueError as e:
        return format_response('error', str(e), None, status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_token(request):
    """Verifica se o token é válido"""
    # Se chegou aqui, o token é válido (middleware já validou)
    if hasattr(request.user, 'idusuario') and not isinstance(request.user, AnonymousUser):
        user_data = {
            'id': request.user.idusuario,
            'email': request.user.email,
            'nome': request.user.nome,
            'admin': request.user.admin,
        }
    else:
        # Tentar extrair do token diretamente
        from rest_framework_simplejwt.tokens import UntypedToken
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                decoded = UntypedToken(token)
                user_data = {
                    'id': decoded.get('id'),
                    'email': decoded.get('email'),
                    'nome': decoded.get('nome'),
                    'admin': decoded.get('admin', 0),
                }
            except Exception:
                return format_response('error', 'Token inválido', None, status.HTTP_401_UNAUTHORIZED)
        else:
            return format_response('error', 'Token não fornecido', None, status.HTTP_401_UNAUTHORIZED)
    
    return format_response('success', 'Token válido', {'user': user_data, 'valid': True}, status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_me(request):
    """Retorna dados do usuário autenticado"""
    try:
        # Buscar usuário pelo ID do token
        user_id = None
        if hasattr(request.user, 'idusuario') and not isinstance(request.user, AnonymousUser):
            user_id = request.user.idusuario
        else:
            # Tentar extrair do token
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                try:
                    decoded = UntypedToken(token)
                    user_id = decoded.get('id')
                except (InvalidToken, TokenError):
                    pass
        
        if user_id:
            user = Usuario.objects.get(idusuario=user_id)
            serializer = UsuarioSerializer(user)
            return format_response('success', 'Dados do usuário', serializer.data, status.HTTP_200_OK)
        else:
            return format_response('error', 'Usuário não encontrado', None, status.HTTP_404_NOT_FOUND)
    except Usuario.DoesNotExist:
        return format_response('error', 'Usuário não encontrado', None, status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return format_response('error', str(e), None, status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint"""
    return format_response('success', 'API está funcionando', {'status': 'healthy'}, status.HTTP_200_OK)

