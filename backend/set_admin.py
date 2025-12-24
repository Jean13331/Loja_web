"""
Script para marcar um usuário como administrador no banco de dados.

Uso:
    python set_admin.py <email> [--remove]

Exemplos:
    python set_admin.py admin@cajuzinho.com
    python set_admin.py admin@cajuzinho.com --remove
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'loja_web.settings')
django.setup()

from api.models import Usuario


def set_admin(email, is_admin=True):
    """Marca ou remove privilégios de admin de um usuário"""
    try:
        user = Usuario.objects.get(email=email)
        
        if is_admin:
            user.admin = 1
            action = "agora é"
            status_icon = "✅"
        else:
            user.admin = 0
            action = "não é mais"
            status_icon = "ℹ️"
        
        user.save()
        
        print(f'{status_icon} Usuário {user.nome} ({user.email}) {action} administrador!')
        print(f'   ID: {user.idusuario}')
        print(f'   Admin: {user.admin}')
        return True
        
    except Usuario.DoesNotExist:
        print(f'❌ Usuário com email {email} não encontrado.')
        print('\nUsuários disponíveis:')
        users = Usuario.objects.all()[:10]
        for u in users:
            admin_status = "👑 Admin" if u.admin == 1 else "👤 Usuário"
            print(f'   - {u.email} ({u.nome}) - {admin_status}')
        return False
    except Exception as e:
        print(f'❌ Erro: {e}')
        return False


def list_admins():
    """Lista todos os administradores"""
    admins = Usuario.objects.filter(admin=1)
    
    if not admins.exists():
        print('ℹ️ Nenhum administrador encontrado.')
        return
    
    print(f'👑 Administradores ({admins.count()}):\n')
    for admin in admins:
        print(f'   - {admin.nome} ({admin.email})')
        print(f'     ID: {admin.idusuario}')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Uso: python set_admin.py <email> [--remove]')
        print('\nExemplos:')
        print('  python set_admin.py admin@cajuzinho.com')
        print('  python set_admin.py admin@cajuzinho.com --remove')
        print('  python set_admin.py --list')
        sys.exit(1)
    
    if sys.argv[1] == '--list':
        list_admins()
        sys.exit(0)
    
    email = sys.argv[1]
    is_admin = '--remove' not in sys.argv
    
    set_admin(email, is_admin)

