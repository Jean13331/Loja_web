from django.urls import path
from . import views
from . import views_produto

urlpatterns = [
    # Autenticação
    path('auth/register', views.register, name='register'),
    path('auth/login', views.login, name='login'),
    path('auth/admin/login', views.admin_login, name='admin_login'),
    path('auth/verify', views.verify_token, name='verify'),
    
    # Usuário
    path('user/me', views.get_me, name='get_me'),
    
    # Produtos
    path('produtos', views_produto.listar_produtos, name='listar_produtos'),
    path('produtos/<int:produto_id>', views_produto.obter_produto, name='obter_produto'),
    path('produtos/cadastrar', views_produto.cadastrar_produto, name='cadastrar_produto'),
    path('produtos/<int:produto_id>/editar', views_produto.editar_produto, name='editar_produto'),
    path('produtos/<int:produto_id>/deletar', views_produto.deletar_produto, name='deletar_produto'),
    path('produtos/destaques', views_produto.listar_destaques, name='listar_destaques'),
    path('categorias', views_produto.listar_categorias, name='listar_categorias'),
    path('categorias/cadastrar', views_produto.cadastrar_categoria, name='cadastrar_categoria'),
    
    # Health check
    path('health', views.health_check, name='health'),
]

