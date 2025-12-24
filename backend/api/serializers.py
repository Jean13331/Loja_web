from rest_framework import serializers
from .models import Usuario


class UsuarioSerializer(serializers.Serializer):
    """Serializer para usuário (sem dados sensíveis)"""
    idusuario = serializers.IntegerField(read_only=True)
    nome = serializers.CharField()
    email = serializers.EmailField()
    nascimento = serializers.DateField()
    admin = serializers.IntegerField(read_only=True)

    def to_representation(self, instance):
        """Remove dados sensíveis da representação"""
        return {
            'idusuario': instance.idusuario,
            'nome': instance.nome,
            'email': instance.email,
            'nascimento': instance.nascimento.isoformat() if instance.nascimento else None,
            'admin': instance.admin,
        }


class RegisterSerializer(serializers.Serializer):
    """Serializer para registro de usuário"""
    nome = serializers.CharField(max_length=45)
    email = serializers.EmailField(max_length=100)
    senha = serializers.CharField(write_only=True, min_length=6)
    numero_telefone = serializers.CharField()
    cpf = serializers.CharField()
    nascimento = serializers.DateField()
    admin = serializers.IntegerField(default=0, required=False)

    def validate_email(self, value):
        """Valida se email já existe"""
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email já cadastrado")
        return value

    def validate_cpf(self, value):
        """Valida CPF e verifica se já existe"""
        # Hash do CPF para verificar
        hashed_cpf = Usuario.hash_value(value)
        if Usuario.objects.filter(cpf=hashed_cpf).exists():
            raise serializers.ValidationError("CPF já cadastrado")
        return value


class LoginSerializer(serializers.Serializer):
    """Serializer para login"""
    email = serializers.EmailField()
    senha = serializers.CharField(write_only=True)

