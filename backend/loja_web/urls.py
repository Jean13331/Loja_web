"""
URL configuration for loja_web project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from datetime import datetime

def root_view(request):
    """Rota raiz da API"""
    return JsonResponse({
        'message': 'API Loja Back-end está funcionando!',
        'status': 'online',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('health/', include('api.urls')),
    path('', root_view),
]


