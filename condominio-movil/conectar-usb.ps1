param(
    [ValidateRange(1, 65535)][int]$PuertoBackend = 8000,
    [ValidateRange(1, 65535)][int]$PuertoMovil = 8001
)

$ErrorActionPreference = 'Stop'
$adbCommand = Get-Command adb -ErrorAction SilentlyContinue
$adbPath = if ($adbCommand) { $adbCommand.Source } else {
    Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe'
}
if (-not (Test-Path -LiteralPath $adbPath)) {
    throw 'No se encontró ADB. Instala Android SDK Platform Tools o añade adb al PATH.'
}

$deviceLines = & $adbPath devices
if ($LASTEXITCODE -ne 0) { throw 'No se pudo consultar ADB.' }
$connectedDevices = @($deviceLines | Where-Object { $_ -match '^\S+\s+device$' })
if ($connectedDevices.Count -ne 1) {
    throw 'Conecta un único teléfono autorizado por USB y acepta la depuración USB en Android.'
}

$status = $null
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:$PuertoBackend/api/me/" -UseBasicParsing -TimeoutSec 5
    $status = [int]$response.StatusCode
} catch {
    if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode }
    else { throw "Django no responde en el puerto $PuertoBackend. Inicia el backend antes de conectar la app." }
}
if ($status -ne 401) { throw "La API no devolvió la respuesta de autenticación esperada (HTTP $status)." }

& $adbPath reverse "tcp:$PuertoMovil" "tcp:$PuertoBackend"
if ($LASTEXITCODE -ne 0) { throw 'No se pudo configurar el enlace USB.' }
Write-Host "Enlace configurado: teléfono $PuertoMovil -> Django $PuertoBackend."
Write-Host 'Mantén Django funcionando. Repite este script si desconectas el teléfono o reinicias ADB.'
