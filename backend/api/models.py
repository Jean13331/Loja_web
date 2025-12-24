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
        }
        if not exclude_sensitive:
            data.update({
                'numero_telefone': self.numero_telefone,
                'cpf': self.cpf,
            })
        return data
