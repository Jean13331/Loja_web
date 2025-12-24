from rest_framework.views import exception_handler
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    """Handler customizado para exceções da API"""
    response = exception_handler(exc, context)
    
    if response is not None:
        custom_response_data = {
            'status': 'error',
            'message': str(exc.detail) if hasattr(exc, 'detail') else 'Erro ao processar requisição',
        }
        if hasattr(exc, 'detail') and isinstance(exc.detail, dict):
            custom_response_data['errors'] = exc.detail
        response.data = custom_response_data
    
    return response

