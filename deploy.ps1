# deploy.ps1 - Despliegue con build
# Uso: .\deploy.ps1
#
# Flujo:
#   0. Limpiar .tmp residuales + esperar descargas en curso
#   1. Si hay zip → extraer (sobreescribe src/ y otros archivos)
#   2. node build.js → genera index.html desde src/
#   3. git add + commit + push

$ErrorActionPreference = "Stop"
Set-Location "C:\Liquidaciones-GTC"

Write-Host ""

# 0. Limpiar .tmp residuales y esperar descargas en curso
$tmps = Get-ChildItem *.tmp -ErrorAction SilentlyContinue
if ($tmps) {
    foreach ($t in $tmps) {
        Write-Host "  Eliminando residuo: $($t.Name)" -ForegroundColor DarkYellow
        Remove-Item $t.FullName -Force -ErrorAction SilentlyContinue
    }
}

# Esperar si hay descargas en curso (.crdownload = Chrome)
$waitMax = 30
$waited = 0
while ((Get-ChildItem *.crdownload -ErrorAction SilentlyContinue) -and $waited -lt $waitMax) {
    if ($waited -eq 0) { Write-Host "Esperando descarga..." -NoNewline -ForegroundColor Cyan }
    Write-Host "." -NoNewline -ForegroundColor Cyan
    Start-Sleep -Seconds 1
    $waited++
}
if ($waited -gt 0) {
    Write-Host ""
    # Limpiar .tmp que hayan aparecido durante la espera
    Get-ChildItem *.tmp -ErrorAction SilentlyContinue | ForEach-Object {
        Write-Host "  Eliminando residuo: $($_.Name)" -ForegroundColor DarkYellow
        Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
    }
    if ($waited -ge $waitMax) {
        Write-Host "  Timeout esperando descarga. Revisa si el zip se bajo bien." -ForegroundColor Yellow
    }
}

# 1. Si hay algun zip, extraer y borrar
$zips = Get-ChildItem *.zip -ErrorAction SilentlyContinue
if ($zips) {
    foreach ($z in $zips) {
        Write-Host "Descomprimiendo $($z.Name)..." -ForegroundColor Cyan
        Expand-Archive -Path $z.FullName -DestinationPath . -Force
        Remove-Item $z.FullName -Force
    }
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

# 3. Limpiar .tmp del repo si quedó tracked
$trackedTmps = git ls-files "*.tmp" 2>$null
if ($trackedTmps) {
    $trackedTmps | ForEach-Object {
        git rm -f $_ 2>$null
        Write-Host "  git rm: $_" -ForegroundColor DarkYellow
    }
}

# 4. Git: add + commit + push
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
