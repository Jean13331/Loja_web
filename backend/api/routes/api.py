from django.urls import include, path

urlpatterns = [
    path("health/", include("api.routes.health")),
    path("auth/", include("api.routes.auth")),
    path("user/", include("api.routes.user")),
]


