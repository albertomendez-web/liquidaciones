# deploy.ps1 - Despliegue con build
# Uso: .\deploy.ps1
#
# Flujo:
#   1. Esperar descargas incompletas (.tmp/.crdownload)
#   2. Si hay zip: extraer y borrar
#   3. Limpiar basura (.tmp residuales)
#   4. node build.js: genera index.html desde src/
#   5. git add + commit + push

$ErrorActionPreference = "Stop"
Set-Location "C:\Liquidaciones-GTC"

Write-Host ""

# 1. Esperar descargas incompletas (Chrome deja .tmp y .crdownload)
$maxWait = 30
$waited = 0
while ($waited -lt $maxWait) {
    $pending = @(Get-ChildItem *.tmp, *.crdownload -ErrorAction SilentlyContinue | Where-Object { $_.Length -gt 0 })
    if ($pending.Count -eq 0) { break }
    if ($waited -eq 0) {
        Write-Host "Esperando descarga..." -ForegroundColor Yellow -NoNewline
    }
    Write-Host "." -NoNewline -ForegroundColor Yellow
    Start-Sleep -Seconds 1
    $waited++
}
if ($waited -gt 0 -and $waited -lt $maxWait) {
    Write-Host " OK" -ForegroundColor Green
} elseif ($waited -ge $maxWait) {
    Write-Host ""
    Write-Host "  Timeout esperando descarga. Revisa si el zip se bajo bien." -ForegroundColor Red
    exit 1
}

# 2. Si hay algun zip, extraer y borrar
$zips = Get-ChildItem *.zip -ErrorAction SilentlyContinue
if ($zips) {
    foreach ($z in $zips) {
        Write-Host "Descomprimiendo $($z.Name)..." -ForegroundColor Cyan
        Expand-Archive -Path $z.FullName -DestinationPath . -Force
        Remove-Item $z.FullName -Force
        Write-Host "  OK" -ForegroundColor Green
    }
}

# 3. Limpiar basura (.tmp residuales)
$tmps = Get-ChildItem *.tmp -ErrorAction SilentlyContinue
if ($tmps) {
    foreach ($t in $tmps) {
        $tracked = git ls-files $t.Name 2>$null
        if ($tracked) {
            git rm -f $t.Name 2>$null
        } else {
            Remove-Item $t.FullName -Force
        }
    }
    Write-Host "  Limpieza: $($tmps.Count) .tmp eliminado(s)" -ForegroundColor DarkGray
}

# 4. Build: concatenar src/ -> index.html
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

# 5. Git: add + commit + push
Write-Host ""
git add -A
$status = git status --porcelain
if ($status) {
    $verLine = Select-String -Path "index.html" -Pattern "^const APP_VERSION = '(.+)';" | Select-Object -First 1
    if ($verLine) { $ver = $verLine.Matches.Groups[1].Value } else { $ver = "update" }

    $chgLine = Select-String -Path "index.html" -Pattern "^const APP_CHANGES = '(.+)';" | Select-Object -First 1
    if ($chgLine) { $chg = $chgLine.Matches.Groups[1].Value } else { $chg = "update" }

    $msg = "v${ver}: ${chg}"
    git commit -m $msg
    git push origin main
    Write-Host "`n=== $msg desplegado ===" -ForegroundColor Green
} else {
    Write-Host "Sin cambios." -ForegroundColor Yellow
}
