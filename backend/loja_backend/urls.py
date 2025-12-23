from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    # Health direto (sem /api), igual ao Node
    path("health/", include("api.routes.health")),
    # Rotas da API, sob /api
    path("api/", include("api.routes.api")),
]


