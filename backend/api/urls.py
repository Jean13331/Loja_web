from django.urls import path
from . import views

urlpatterns = [
    # Autenticação
    path('auth/register', views.register, name='register'),
    path('auth/login', views.login, name='login'),
    path('auth/verify', views.verify_token, name='verify'),
    
    # Usuário
    path('user/me', views.get_me, name='get_me'),
    
    # Health check
    path('health', views.health_check, name='health'),
]

