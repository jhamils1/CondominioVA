param()

# Solo inicia procesos de loopback; no abre la cámara ni registra eventos.
$ErrorActionPreference = 'Stop'
$backend = Split-Path -Parent $PSScriptRoot
$recursos = Join-Path $PSScriptRoot 'recursos'
$backendPython = Join-Path $backend 'env\Scripts\python.exe'
$visionPython = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
$manage = Join-Path $backend 'manage.py'
$imou = Join-Path $PSScriptRoot 'imou_local.py'

foreach ($archivo in @($backendPython, $visionPython, $manage, $imou)) {
    if (-not (Test-Path -LiteralPath $archivo)) { throw 'Falta un componente del servicio local Imou.' }
}

function Get-ListenerProcess([int]$Puerto) {
    $listener = Get-NetTCPConnection -LocalPort $Puerto -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $listener) { return $null }
    return Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)" -ErrorAction Stop
}

function Test-BackendImou {
    try {
        $null = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8000/api/vision-imou/puente-interno/' -TimeoutSec 3
        return $false
    } catch {
        if ($_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 403) { return $true }
        return $false
    }
}

$procesoBackend = Get-ListenerProcess 8000
if ($procesoBackend) {
    if ($procesoBackend.CommandLine -notmatch 'manage\.py.*runserver' -or -not (Test-BackendImou)) {
        throw 'El puerto 8000 está ocupado o el backend local necesita reiniciarse con la versión actual.'
    }
} else {
    $debugAnterior = [Environment]::GetEnvironmentVariable('DEBUG', 'Process')
    try {
        $env:DEBUG = 'False'
        $null = Start-Process -FilePath $backendPython -ArgumentList @(('"' + $manage + '"'), 'runserver', '127.0.0.1:8000', '--noreload') `
            -WorkingDirectory $backend -WindowStyle Hidden -RedirectStandardOutput (Join-Path $recursos 'imou-backend.out.log') `
            -RedirectStandardError (Join-Path $recursos 'imou-backend.err.log') -PassThru
    } finally { [Environment]::SetEnvironmentVariable('DEBUG', $debugAnterior, 'Process') }
    $listo = $false
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 1
        if (Test-BackendImou) { $listo = $true; break }
    }
    if (-not $listo) { throw 'No se pudo comprobar el backend local de Imou.' }
}

$procesoImou = Get-ListenerProcess 28766
if ($procesoImou) {
    if ($procesoImou.CommandLine -notmatch 'imou_local\.py') { throw 'El puerto local de Imou está ocupado por otro proceso.' }
} else {
    $null = Start-Process -FilePath $visionPython -ArgumentList @('"' + $imou + '"') -WorkingDirectory $PSScriptRoot `
        -WindowStyle Hidden -RedirectStandardOutput (Join-Path $recursos 'imou-puente.out.log') `
        -RedirectStandardError (Join-Path $recursos 'imou-puente.err.log') -PassThru
    $listo = $false
    for ($i = 0; $i -lt 20; $i++) {
        Start-Sleep -Seconds 1
        $procesoImou = Get-ListenerProcess 28766
        if ($procesoImou -and $procesoImou.CommandLine -match 'imou_local\.py') { $listo = $true; break }
    }
    if (-not $listo) { throw 'No se pudo comprobar el puente local de Imou.' }
}
Write-Output 'Servicios locales de Imou preparados.'
