# Script PowerShell para criar tabelas sem perder dados existentes
# Execute este script se você já tem dados no banco

Write-Host "🔍 Verificando se o container está rodando..." -ForegroundColor Cyan

$containerRunning = docker ps --format "{{.Names}}" | Select-String "postgres_local"

if (-not $containerRunning) {
    Write-Host "❌ Container postgres_local não está rodando!" -ForegroundColor Red
    Write-Host "Execute: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Container está rodando" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Verificando tabelas existentes..." -ForegroundColor Cyan
docker exec -it postgres_local psql -U appuser -d appdb -c "\dt"

Write-Host ""
Write-Host "🚀 Executando script de criação de tabelas..." -ForegroundColor Cyan
Write-Host "⚠️  As tabelas serão criadas apenas se não existirem (CREATE TABLE IF NOT EXISTS)" -ForegroundColor Yellow
Write-Host ""

# Executar o script SQL
$scriptPath = Join-Path $PSScriptRoot "init\01-init.sql"
Get-Content $scriptPath | docker exec -i postgres_local psql -U appuser -d appdb

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Script executado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Verificando tabelas criadas..." -ForegroundColor Cyan
    docker exec -it postgres_local psql -U appuser -d appdb -c "\dt"
    Write-Host ""
    Write-Host "✨ Pronto! Suas tabelas foram criadas e seus dados foram preservados." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Erro ao executar o script. Verifique os logs acima." -ForegroundColor Red
    exit 1
}

