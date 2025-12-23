from django.urls import path

from api.controllers import auth_controller

urlpatterns = [
    path("register", auth_controller.register, name="auth-register"),
    path("login", auth_controller.login, name="auth-login"),
    path("verify", auth_controller.verify_token, name="auth-verify"),
]


