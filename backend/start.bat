@echo off
echo Ativando ambiente virtual...
call .venv\Scripts\activate.bat

echo Instalando dependencias...
pip install -r requirements.txt

echo Iniciando servidor Django...
python manage.py runserver

pause

