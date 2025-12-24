@echo off
echo Verificando e corrigindo estrutura do banco de dados...
echo.

REM Verificar se o container está rodando
docker ps --filter "name=postgres_local" --format "{{.Names}}" | findstr postgres_local >nul
if %errorlevel% neq 0 (
    echo Container postgres_local nao esta rodando. Iniciando...
    docker start postgres_local
    timeout /t 3 /nobreak >nul
)

echo Executando script de verificacao e correcao...
type init\00-verificar-e-corrigir.sql | docker exec -i postgres_local psql -U appuser -d appdb

if %errorlevel% equ 0 (
    echo.
    echo Verificacao e correcao concluidas com sucesso!
    echo.
    echo Verificando estrutura da tabela usuario...
    docker exec postgres_local psql -U appuser -d appdb -c "\d usuario"
) else (
    echo.
    echo Erro ao executar script de verificacao!
    exit /b 1
)

pause

