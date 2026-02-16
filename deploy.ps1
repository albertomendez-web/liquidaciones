# deploy.ps1 - Despliegue con build
# Uso: .\deploy.ps1
#
# Flujo:
#   1. Si hay zip: extraer (sobreescribe src/ y otros archivos)
#   2. Limpiar basura (.tmp, .zip residuales)
#   3. node build.js: genera index.html desde src/
#   4. git add + commit + push

$ErrorActionPreference = "Stop"
Set-Location "C:\Liquidaciones-GTC"

Write-Host ""

# 1. Si hay algun zip, extraer y borrar
$zips = Get-ChildItem *.zip -ErrorAction SilentlyContinue
if ($zips) {
    foreach ($z in $zips) {
        Write-Host "Descomprimiendo $($z.Name)..." -ForegroundColor Cyan
        Expand-Archive -Path $z.FullName -DestinationPath . -Force
        Remove-Item $z.FullName -Force
        Write-Host "  OK" -ForegroundColor Green
    }
}

# 2. Limpiar basura (.tmp que dejan los zips/descargas)
$tmps = Get-ChildItem *.tmp -ErrorAction SilentlyContinue
if ($tmps) {
    foreach ($t in $tmps) {
        # Si git lo trackea, marcarlo para borrar del repo
        $tracked = git ls-files $t.Name 2>$null
        if ($tracked) {
            git rm -f $t.Name 2>$null
        } else {
            Remove-Item $t.FullName -Force
        }
    }
    Write-Host "  Limpieza: $($tmps.Count) .tmp eliminado(s)" -ForegroundColor DarkGray
}

# 3. Build: concatenar src/ -> index.html
if (Test-Path "build.js") {
    Write-Host ""
    $buildResult = node build.js 2>&1
    $buildExit = $LASTEXITCODE
    $buildResult | ForEach-Object { Write-Host "  $_" }
    if ($buildExit -ne 0) {
        Write-Host "`nBuild fallido. Abortando deploy." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  (sin build.js - usando index.html directo)" -ForegroundColor DarkGray
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
