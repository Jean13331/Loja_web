from django.db import models


class Usuario(models.Model):
    idusuario = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=45)
    email = models.CharField(max_length=100, unique=True)
    numero_telefone = models.CharField(max_length=32)
    senha = models.CharField(max_length=100)
    cpf = models.CharField(max_length=32, unique=True)
    nascimento = models.DateField()
    admin = models.SmallIntegerField(default=0)

    class Meta:
        db_table = "usuario"
        managed = False  # Tabela já existe no banco (criada pelo script SQL)


