# deploy.ps1 - Despliegue con build
# Uso: .\deploy.ps1
#
# Flujo:
#   1. Si hay zip → extraer (sobreescribe src/ y otros archivos)
#   2. node build.js → genera index.html desde src/
#   3. git add + commit + push

$ErrorActionPreference = "Stop"
Set-Location "C:\Liquidaciones-GTC"

Write-Host ""

# 1. Si hay algun zip, extraer y borrar
$zips = Get-ChildItem *.zip -ErrorAction SilentlyContinue
if ($zips) {
    foreach ($z in $zips) {
        Write-Host "Descomprimiendo $($z.Name)..." -ForegroundColor Cyan
        Expand-Archive -Path $z.FullName -DestinationPath . -Force
        # Listar lo extraido
        $extracted = Expand-Archive -Path $z.FullName -DestinationPath "$env:TEMP\_deploy_peek" -Force -PassThru 2>$null
        # Approach: just list files after extraction
        Remove-Item $z.FullName -Force
    }
    # Show what was updated
    $files = Get-ChildItem *.zip -ErrorAction SilentlyContinue
    Write-Host "  Zip(s) procesado(s)" -ForegroundColor DarkGray
}

# 2. Build: concatenar src/ → index.html
if (Test-Path "build.js") {
    Write-Host ""
    $buildResult = node build.js 2>&1
    $buildExit = $LASTEXITCODE
    $buildResult | ForEach-Object { Write-Host "  $_" -ForegroundColor $(if ($_ -match '✅') { 'Green' } elseif ($_ -match '⚠|❌') { 'Red' } else { 'Gray' }) }
    if ($buildExit -ne 0) {
        Write-Host "`n❌ Build fallido. Abortando deploy." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  (sin build.js — usando index.html directo)" -ForegroundColor DarkGray
}

# 3. Git: add + commit + push
Write-Host ""
git add -A
$status = git status --porcelain
if ($status) {
    # Leer version del index.html generado
    $verLine = Select-String -Path "index.html" -Pattern "^const APP_VERSION = '(.+)';" | Select-Object -First 1
    if ($verLine) {
        $ver = $verLine.Matches.Groups[1].Value
    } else {
        $ver = "update"
    }
    
    # Leer cambios
    $chgLine = Select-String -Path "index.html" -Pattern "^const APP_CHANGES = '(.+)';" | Select-Object -First 1
    if ($chgLine) {
        $chg = $chgLine.Matches.Groups[1].Value
    } else {
        $chg = "update"
    }
    
    $msg = "v${ver}: ${chg}"
    git commit -m $msg
    git push origin main
    Write-Host "`n=== $msg desplegado ===" -ForegroundColor Green
} else {
    Write-Host "Sin cambios." -ForegroundColor Yellow
}
