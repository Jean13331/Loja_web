from django.db import connection
from rest_framework.decorators import api_view

from api.utils import response_helper


@api_view(["GET"])
def check_health(_request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT NOW()")
            cursor.fetchone()
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    data = {
        "database": db_status,
        "timestamp": None,
        "uptime": None,
    }
    return response_helper.success(data, "API está funcionando")


