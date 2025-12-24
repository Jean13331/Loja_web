from django.db import models
import hashlib
import re


class Usuario(models.Model):
    """Modelo de usuário baseado na tabela usuario do PostgreSQL"""
    idusuario = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=45)
    email = models.EmailField(max_length=100, unique=True)
    numero_telefone = models.CharField(max_length=32)  # MD5 hash
    senha = models.CharField(max_length=100)  # MD5 hash
    cpf = models.CharField(max_length=32, unique=True)  # MD5 hash
    nascimento = models.DateField()
    admin = models.SmallIntegerField(default=0)
    data_cadastro = models.DateTimeField(auto_now_add=True)
    data_admin = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'usuario'
        managed = False  # Não criar/migrar tabela, já existe no banco

    @staticmethod
    def hash_value(value):
        """Gera hash MD5 de um valor (CPF, telefone, etc)"""
        clean_value = re.sub(r'\D', '', str(value))
        return hashlib.md5(clean_value.encode()).hexdigest()

    @staticmethod
    def hash_password(password):
        """Gera hash MD5 da senha"""
        return hashlib.md5(password.encode()).hexdigest()

    def compare_password(self, password):
        """Compara senha com hash MD5"""
        password_hash = self.hash_password(password)
        return password_hash == self.senha

    def to_dict(self, exclude_sensitive=True):
        """Converte modelo para dicionário, excluindo dados sensíveis"""
        data = {
            'idusuario': self.idusuario,
            'nome': self.nome,
            'email': self.email,
            'nascimento': self.nascimento.isoformat() if self.nascimento else None,
            'admin': self.admin,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'data_admin': self.data_admin.isoformat() if self.data_admin else None,
        }
        if not exclude_sensitive:
            data.update({
                'numero_telefone': self.numero_telefone,
                'cpf': self.cpf,
            })
        return data


class Produto(models.Model):
    """Modelo de produto baseado na tabela produto do PostgreSQL"""
    idproduto = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=45)
    descricao = models.TextField(max_length=5000)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    estoque = models.IntegerField()
    media_avaliacao = models.DecimalField(max_digits=3, decimal_places=2, default=0)

    class Meta:
        db_table = 'produto'
        managed = False  # Não criar/migrar tabela, já existe no banco

    def to_dict(self):
        """Converte modelo para dicionário"""
        return {
            'idproduto': self.idproduto,
            'nome': self.nome,
            'descricao': self.descricao,
            'valor': float(self.valor),
            'estoque': self.estoque,
            'media_avaliacao': float(self.media_avaliacao),
        }


class ProdutoHistorico(models.Model):
    """Modelo de histórico de produtos - rastreia quem criou/editou/deletou produtos"""
    idproduto_historico = models.AutoField(primary_key=True)
    produto_idproduto = models.IntegerField()
    usuario_idusuario = models.IntegerField()
    acao = models.CharField(max_length=20)  # 'criado', 'editado', 'deletado'
    data_acao = models.DateTimeField(auto_now_add=True)
    dados_anteriores = models.JSONField(null=True, blank=True)
    dados_novos = models.JSONField(null=True, blank=True)
    observacao = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'produto_historico'
        managed = False  # Não criar/migrar tabela, já existe no banco

    def to_dict(self):
        """Converte modelo para dicionário"""
        return {
            'idproduto_historico': self.idproduto_historico,
            'produto_idproduto': self.produto_idproduto,
            'usuario_idusuario': self.usuario_idusuario,
            'acao': self.acao,
            'data_acao': self.data_acao.isoformat() if self.data_acao else None,
            'dados_anteriores': self.dados_anteriores,
            'dados_novos': self.dados_novos,
            'observacao': self.observacao,
        }


class Categoria(models.Model):
    """Modelo de categoria de produtos"""
    idcategoria = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100, unique=True)
    descricao = models.CharField(max_length=500, null=True, blank=True)
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categoria'
        managed = False  # Não criar/migrar tabela, já existe no banco

    def to_dict(self):
        """Converte modelo para dicionário"""
        return {
            'idcategoria': self.idcategoria,
            'nome': self.nome,
            'descricao': self.descricao,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
        }


class ProdutoHasCategoria(models.Model):
    """Modelo de relacionamento N:N entre produto e categoria"""
    produto_idproduto = models.IntegerField()
    categoria_idcategoria = models.IntegerField()

    class Meta:
        db_table = 'produto_has_categoria'
        managed = False
        unique_together = (('produto_idproduto', 'categoria_idcategoria'),)


class Destaque(models.Model):
    """Modelo de produtos em destaque com desconto"""
    iddestaque = models.AutoField(primary_key=True)
    produto_idproduto = models.IntegerField(unique=True)
    desconto_percentual = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    valor_com_desconto = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    data_inicio = models.DateTimeField(auto_now_add=True)
    data_fim = models.DateTimeField(null=True, blank=True)
    ativo = models.SmallIntegerField(default=1)
    ordem = models.IntegerField(default=0)

    class Meta:
        db_table = 'destaque'
        managed = False  # Não criar/migrar tabela, já existe no banco

    def to_dict(self):
        """Converte modelo para dicionário"""
        return {
            'iddestaque': self.iddestaque,
            'produto_idproduto': self.produto_idproduto,
            'desconto_percentual': float(self.desconto_percentual),
            'valor_com_desconto': float(self.valor_com_desconto) if self.valor_com_desconto else None,
            'data_inicio': self.data_inicio.isoformat() if self.data_inicio else None,
            'data_fim': self.data_fim.isoformat() if self.data_fim else None,
            'ativo': self.ativo,
            'ordem': self.ordem,
        }
