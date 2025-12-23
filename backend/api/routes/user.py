from django.urls import path

from api.controllers import user_controller

urlpatterns = [
    path("me", user_controller.get_me, name="user-me"),
]


