from rest_framework_simplejwt.tokens import RefreshToken
from .models import Usuario


class AuthService:
    """Serviço de autenticação"""

    @staticmethod
    def generate_token(user):
        """Gera token JWT para o usuário"""
        refresh = RefreshToken()
        # Usar 'id' como chave (compatível com o backend Node.js)
        refresh['id'] = user.idusuario
        refresh['email'] = user.email
        refresh['nome'] = user.nome
        refresh['admin'] = user.admin
        
        # Retornar apenas o access token (compatível com frontend)
        return str(refresh.access_token)

    @staticmethod
    def register(user_data):
        """Registra um novo usuário"""
        # Hash do CPF e telefone
        hashed_cpf = Usuario.hash_value(user_data['cpf'])
        hashed_phone = Usuario.hash_value(user_data['numero_telefone'])
        
        # Verificar se CPF já existe
        if Usuario.objects.filter(cpf=hashed_cpf).exists():
            raise ValueError('CPF já cadastrado')
        
        # Hash da senha
        hashed_password = Usuario.hash_password(user_data['senha'])
        
        # Criar usuário
        user = Usuario(
            nome=user_data['nome'],
            email=user_data['email'],
            numero_telefone=hashed_phone,
            senha=hashed_password,
            cpf=hashed_cpf,
            nascimento=user_data['nascimento'],
            admin=user_data.get('admin', 0),
        )
        user.save()
        
        # Gerar token
        token = AuthService.generate_token(user)
        
        return {
            'user': user.to_dict(),
            'token': token,
        }

    @staticmethod
    def login(email, senha):
        """Autentica um usuário"""
        try:
            user = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            raise ValueError('Email ou senha inválidos')
        
        # Verificar senha
        if not user.compare_password(senha):
            raise ValueError('Email ou senha inválidos')
        
        # Gerar token
        token = AuthService.generate_token(user)
        
        return {
            'user': user.to_dict(),
            'token': token,
        }

