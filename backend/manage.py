#!/usr/bin/env python
import os
import sys


def main():
    """Ponto de entrada para comandos Django (runserver, migrate, etc.)."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "loja_backend.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Não foi possível importar Django. Você instalou as dependências?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()


