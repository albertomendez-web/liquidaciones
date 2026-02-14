# deploy.ps1 — Deploy Liquidaciones-GTC
Set-Location "C:\Liquidaciones-GTC"

# 1. Descomprimir zips si hay
Get-ChildItem -Filter "*.zip" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Descomprimiendo $($_.Name)..." -ForegroundColor Cyan
    Expand-Archive -Path $_.FullName -DestinationPath "." -Force
    Remove-Item $_.FullName
}

# 2. Verificar ficheros
@("index.html","email-module.js") | ForEach-Object {
    if (Test-Path $_) { Write-Host "  OK $_" -ForegroundColor Green }
    else { Write-Host "  FALTA $_" -ForegroundColor Red }
}

# 3. Add + commit + push
git add -A
$diff = git diff --cached --stat
if ($diff) {
    $ver = (Select-String -Path "index.html" -Pattern "APP_VERSION = '([^']+)'" | Select-Object -First 1).Matches.Groups[1].Value
    Write-Host "`n$diff" -ForegroundColor Cyan
    git commit -m "v$ver"
    git push
    Write-Host "`n=== v$ver desplegado ===" -ForegroundColor Green
} else {
    Write-Host "`nSin cambios." -ForegroundColor Yellow
}
