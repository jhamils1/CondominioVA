param(
    [string]$ClaveProtegida = (Join-Path $PSScriptRoot 'recursos\vision-pc-clave.dat')
)

$ErrorActionPreference = 'Stop'
$python = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
$programa = Join-Path $PSScriptRoot 'camara_remota.py'
$recursos = Join-Path $PSScriptRoot 'recursos'
if (-not (Test-Path -LiteralPath $ClaveProtegida)) { throw 'Falta la clave protegida de la IA local.' }
if (-not (Test-Path -LiteralPath $python)) { throw 'No se encuentra el entorno de la IA local.' }
if (-not (Test-Path -LiteralPath (Join-Path $recursos 'cache_roboflow\rf-detr-nano.pth'))) { throw 'Faltan los pesos de la IA local.' }

$clave = (Get-Content -LiteralPath $ClaveProtegida -Raw).Trim() | ConvertTo-SecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($clave)
try {
    $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    function Test-Procesador {
        try {
            $respuesta = Invoke-RestMethod -Uri 'http://127.0.0.1:28767/estado' -Headers @{ Authorization = "Bearer $token" } -TimeoutSec 2
            return ($respuesta.disponible -eq $true -and $respuesta.contrato -eq 'condominio-vision-v1' -and $respuesta.modelo -eq 'RF-DETR Nano')
        } catch { return $false }
    }
    if (Test-Procesador) { Write-Output 'La IA local ya está lista.'; exit 0 }
    if (Get-NetTCPConnection -LocalPort 28767 -State Listen -ErrorAction SilentlyContinue) {
        throw 'El puerto de la IA ya está ocupado por otro proceso o no acepta la clave.'
    }
    $env:VISION_REMOTA_TOKEN = $token
    try {
        $proceso = Start-Process -FilePath $python -ArgumentList ('"' + $programa + '"') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $recursos 'vision-pc.out.log') -RedirectStandardError (Join-Path $recursos 'vision-pc.err.log') -PassThru
    } finally { Remove-Item Env:VISION_REMOTA_TOKEN -ErrorAction SilentlyContinue }
    for ($i = 0; $i -lt 60; $i++) {
        Start-Sleep -Seconds 1
        if (Test-Procesador) { Write-Output 'IA local iniciada correctamente.'; exit 0 }
        if ($proceso.HasExited) { break }
    }
    throw 'No se confirmó el inicio de la IA local; revisa el registro en recursos.'
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    $token = $null
}
