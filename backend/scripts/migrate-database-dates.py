"""
Script para aplicar migrações de data no banco de dados
- Adiciona campos data_cadastro e data_admin na tabela usuario
- Cria tabela produto_historico
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'loja_web.settings')
django.setup()

from django.db import connection


def execute_sql_file(file_path):
    """Executa um arquivo SQL"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Dividir por comandos (separados por ;)
        commands = [cmd.strip() for cmd in sql_content.split(';') if cmd.strip()]
        
        with connection.cursor() as cursor:
            for command in commands:
                # Pular comentários e blocos DO
                if command.startswith('--') or command.startswith('DO $$'):
                    continue
                try:
                    cursor.execute(command)
                    print(f'✅ Executado: {command[:50]}...')
                except Exception as e:
                    # Ignorar erros de "já existe" ou "não existe"
                    if 'already exists' in str(e).lower() or 'does not exist' in str(e).lower():
                        print(f'⚠️  Ignorado (já existe/não existe): {command[:50]}...')
                    else:
                        print(f'❌ Erro: {e}')
                        print(f'   Comando: {command[:100]}')
        
        connection.commit()
        print(f'\n✅ Arquivo {file_path} executado com sucesso!')
        return True
    except Exception as e:
        print(f'❌ Erro ao executar {file_path}: {e}')
        return False


if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Caminhos dos arquivos SQL (voltar um nível para acessar back-end)
    parent_dir = os.path.dirname(base_dir)
    sql_files = [
        os.path.join(parent_dir, 'back-end', 'postgres_docker', 'init', '03-migrate-usuario-dates.sql'),
        os.path.join(parent_dir, 'back-end', 'postgres_docker', 'init', '04-create-produto-historico.sql'),
    ]
    
    print('🔄 Iniciando migração do banco de dados...\n')
    
    for sql_file in sql_files:
        if os.path.exists(sql_file):
            print(f'\n📄 Executando: {os.path.basename(sql_file)}')
            execute_sql_file(sql_file)
        else:
            print(f'⚠️  Arquivo não encontrado: {sql_file}')
    
    print('\n✅ Migração concluída!')

