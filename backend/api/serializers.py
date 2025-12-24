from rest_framework import serializers
from .models import Usuario, Produto, Categoria, Destaque


class UsuarioSerializer(serializers.Serializer):
    """Serializer para usuário (sem dados sensíveis)"""
    idusuario = serializers.IntegerField(read_only=True)
    nome = serializers.CharField()
    email = serializers.EmailField()
    nascimento = serializers.DateField()
    admin = serializers.IntegerField(read_only=True)
    data_cadastro = serializers.DateTimeField(read_only=True)
    data_admin = serializers.DateTimeField(read_only=True, allow_null=True)

    def to_representation(self, instance):
        """Remove dados sensíveis da representação"""
        return {
            'idusuario': instance.idusuario,
            'nome': instance.nome,
            'email': instance.email,
            'nascimento': instance.nascimento.isoformat() if instance.nascimento else None,
            'admin': instance.admin,
            'data_cadastro': instance.data_cadastro.isoformat() if instance.data_cadastro else None,
            'data_admin': instance.data_admin.isoformat() if instance.data_admin else None,
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


class CategoriaSerializer(serializers.Serializer):
    """Serializer para categoria"""
    idcategoria = serializers.IntegerField(read_only=True)
    nome = serializers.CharField(max_length=100)
    descricao = serializers.CharField(max_length=500, required=False, allow_blank=True)
    data_criacao = serializers.DateTimeField(read_only=True)


class ProdutoSerializer(serializers.Serializer):
    """Serializer para produto"""
    idproduto = serializers.IntegerField(read_only=True)
    nome = serializers.CharField(max_length=45)
    descricao = serializers.CharField()
    valor = serializers.DecimalField(max_digits=10, decimal_places=2)
    estoque = serializers.IntegerField()
    media_avaliacao = serializers.DecimalField(max_digits=3, decimal_places=2, read_only=True)


class DestaqueSerializer(serializers.Serializer):
    """Serializer para produto em destaque"""
    iddestaque = serializers.IntegerField(read_only=True)
    produto_idproduto = serializers.IntegerField()
    desconto_percentual = serializers.DecimalField(max_digits=5, decimal_places=2)
    valor_com_desconto = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, allow_null=True)
    data_inicio = serializers.DateTimeField(read_only=True)
    data_fim = serializers.DateTimeField(required=False, allow_null=True)
    ativo = serializers.IntegerField(default=1)
    ordem = serializers.IntegerField(default=0)
