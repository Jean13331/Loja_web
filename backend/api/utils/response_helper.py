from rest_framework.response import Response


def success(data=None, message: str = "Operação realizada com sucesso", status_code: int = 200):
    return Response(
        {
            "status": "success",
            "message": message,
            "data": data,
        },
        status=status_code,
    )


def created(data=None, message: str = "Registro criado com sucesso"):
    return success(data, message, status_code=201)


def error(message: str = "Erro ao processar requisição", status_code: int = 400):
    return Response(
        {
            "status": "error",
            "message": message,
        },
        status=status_code,
    )


