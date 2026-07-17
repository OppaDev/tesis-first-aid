# Lanza la API de pruebas para las corridas de carga (Locust).
# - Usa la base dedicada firstaid_test (la BD de desarrollo NO se toca).
# - Sin parámetros: configuración de producción (límites de tasa activos)
#   -> Escenario A (protección).
# - Con -SinLimite: eleva los límites por variables de entorno (configuración
#   legítima, sin tocar código) -> Escenario B (capacidad y estrés).
#
# Uso (desde backend/ o desde cualquier ruta):
#   .\test_carga\iniciar_api_carga.ps1
#   .\test_carga\iniciar_api_carga.ps1 -SinLimite
# Detener: Ctrl+C en esta misma ventana.

param([switch]$SinLimite)

$backend = Split-Path $PSScriptRoot -Parent

$linea = Get-Content (Join-Path $backend ".env") |
    Where-Object { $_ -match '^\s*DATABASE_URL\s*=' } |
    Select-Object -First 1
if (-not $linea) {
    Write-Error "DATABASE_URL no encontrada en backend/.env"
    exit 1
}
$url = ($linea -split '=', 2)[1].Trim().Trim('"').Trim("'")
# Reemplaza el nombre de la base (último segmento) por firstaid_test.
# La URL contiene credenciales: no se imprime.
$env:DATABASE_URL = $url -replace '/[^/?]+(\?.*)?$', '/firstaid_test$1'

if ($SinLimite) {
    $env:RATE_LIMIT_DEFAULT  = "1000000/minute"
    $env:RATE_LIMIT_LOGIN    = "1000000/minute"
    $env:RATE_LIMIT_REGISTRO = "1000000/minute"
    Write-Host "API de pruebas SIN limites de tasa (Escenario B: capacidad/estres)." -ForegroundColor Yellow
} else {
    Write-Host "API de pruebas con limites de PRODUCCION (Escenario A: proteccion)." -ForegroundColor Green
}
Write-Host "Base de datos: firstaid_test | Puerto: 8000 | Detener: Ctrl+C"

Set-Location $backend
conda run -n tesis --no-capture-output python -m uvicorn main:app --port 8000
