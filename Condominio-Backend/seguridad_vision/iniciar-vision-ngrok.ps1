$ErrorActionPreference = 'Stop'
$recursos = Join-Path $PSScriptRoot 'recursos'
$ngrok = Join-Path $recursos 'ngrok.exe'
$pidFile = Join-Path $recursos 'vision-ngrok.pid'
if (-not (Test-Path -LiteralPath $ngrok)) { throw 'No se encuentra la herramienta ngrok.' }
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'iniciar-vision-pc.ps1')
if ($LASTEXITCODE -ne 0) { throw 'La IA local no está disponible.' }
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'iniciar-imou-pc.ps1')
if ($LASTEXITCODE -ne 0) { throw 'Los servicios locales de Imou no están disponibles.' }

if (Test-Path -LiteralPath $pidFile) {
    $idAnterior = 0
    if ([int]::TryParse((Get-Content -LiteralPath $pidFile -Raw).Trim(), [ref]$idAnterior)) {
        $anterior = Get-Process -Id $idAnterior -ErrorAction SilentlyContinue
        if ($anterior -and $anterior.Path -eq $ngrok) { Write-Output 'El túnel de ngrok ya está iniciado.'; exit 0 }
    }
}
if (Get-NetTCPConnection -LocalPort 4040 -State Listen -ErrorAction SilentlyContinue) {
    throw 'El puerto de control de ngrok está ocupado; revisa si ya hay otro túnel.'
}
$proceso = Start-Process -FilePath $ngrok -ArgumentList @('http', '28767', '--inspect=false', '--log=stdout') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $recursos 'vision-ngrok.out.log') -RedirectStandardError (Join-Path $recursos 'vision-ngrok.err.log') -PassThru
Set-Content -LiteralPath $pidFile -Value $proceso.Id
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    if ($proceso.HasExited) { break }
    try {
        $resultado = Invoke-RestMethod -Uri 'http://127.0.0.1:4040/api/tunnels' -TimeoutSec 2
        $destinos = @($resultado.tunnels | Where-Object { $_.proto -eq 'https' -and $_.config.addr -match '^http://(127\.0\.0\.1|localhost):28767$' })
        if ($destinos.Count -eq 1) {
            Write-Output 'Túnel de ngrok iniciado; verifica la conexión antes de actualizar Railway.'
            exit 0
        }
    } catch {}
}
throw 'No se confirmó el inicio de ngrok; revisa que la cuenta esté configurada y el registro en recursos.'
