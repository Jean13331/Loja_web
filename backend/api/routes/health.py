from django.urls import path

from api.controllers import health_controller

urlpatterns = [
    path("", health_controller.check_health, name="health-check"),
]


