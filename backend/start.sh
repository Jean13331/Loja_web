#!/bin/bash
echo "Ativando ambiente virtual..."
source .venv/bin/activate

echo "Instalando dependências..."
pip install -r requirements.txt

echo "Iniciando servidor Django..."
python manage.py runserver


