$iniciador = Join-Path $PSScriptRoot 'iniciar-vision-ngrok.ps1'
$registro = Join-Path $PSScriptRoot 'recursos\vision-supervisor.log'
while ($true) {
    try {
        $salida = (& powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File $iniciador 2>&1 | Out-String)
        if ($LASTEXITCODE -ne 0) {
            $motivo = if ($salida -match 'IA local no está disponible') { 'IA no disponible' }
                      elseif ($salida -match 'puerto de control de ngrok está ocupado') { 'Puerto ngrok ocupado' }
                      elseif ($salida -match 'No se confirmó el inicio de ngrok') { 'No se confirmó ngrok' }
                      else { 'Error al iniciar visión o túnel' }
            Add-Content -LiteralPath $registro -Value ((Get-Date -Format s) + ': ' + $motivo)
        }
    } catch {
        Add-Content -LiteralPath $registro -Value ((Get-Date -Format s) + ': Error al ejecutar supervisor')
    }
    Start-Sleep -Seconds 30
}
