# ============================================
# deploy.ps1 - Despliegue limpio en un solo push
# Uso: .\deploy.ps1 -Msg "v2.11.1: descripcion"
# ============================================
param(
    [Parameter(Mandatory=$true)]
    [string]$Msg
)

$ErrorActionPreference = "Stop"
$repoDir = "C:\Liquidaciones-GTC"

# 1. Ir al directorio del repo
Set-Location $repoDir
Write-Host "`n=== Desplegando en $repoDir ===" -ForegroundColor Cyan

# 2. Asegurar que estamos en main y actualizados
git checkout main 2>$null
git pull origin main --ff-only

# 3. Copiar los archivos nuevos SOBREESCRIBIENDO (sin borrar primero)
# Ajusta las rutas de origen segun donde generes los archivos
$sourceDir = "$env:USERPROFILE\Downloads"  # <-- Ajusta la carpeta de origen

$files = @("index.html", "email-module.js")
foreach ($file in $files) {
    $src = Join-Path $sourceDir $file
    if (Test-Path $src) {
        Copy-Item $src -Destination (Join-Path $repoDir $file) -Force
        Write-Host "  Copiado: $file" -ForegroundColor Green
    } else {
        Write-Host "  No encontrado: $src (se mantiene el existente)" -ForegroundColor Yellow
    }
}

# 4. Stage + commit + push en una sola operacion
git add -A
$status = git status --porcelain
if ($status) {
    git commit -m $Msg
    git push origin main
    Write-Host "`n=== $Msg desplegado ===" -ForegroundColor Green
} else {
    Write-Host "`nNo hay cambios que desplegar." -ForegroundColor Yellow
}
