$ErrorActionPreference = "Stop"

$root = $PSScriptRoot

$services = @(
    @{ Name = "usuario-service";      Port = "8081" },
    @{ Name = "sucursal-service";     Port = "8082" },
    @{ Name = "seguimiento-service";  Port = "8083" },
    @{ Name = "solicitud-service";    Port = "8084" },
    @{ Name = "incidencia-service";   Port = "8085" },
    @{ Name = "resena-service";       Port = "8086" },
    @{ Name = "notificacion-service"; Port = "8087" },
    @{ Name = "dashboard-service";    Port = "8088" },
    @{ Name = "auth-service";         Port = "8089" },
    @{ Name = "api-gateway";          Port = "8080" }
)

if ([string]::IsNullOrWhiteSpace($env:DB_URL)) {
    throw "Falta configurar la variable DB_URL."
}

if ([string]::IsNullOrWhiteSpace($env:DB_USERNAME)) {
    throw "Falta configurar la variable DB_USERNAME."
}

if ([string]::IsNullOrWhiteSpace($env:DB_PASSWORD)) {
    throw "Falta configurar la variable DB_PASSWORD."
}

# El identificador de la API no es secreto.
if ([string]::IsNullOrWhiteSpace($env:AZURE_API_AUDIENCE)) {
    $env:AZURE_API_AUDIENCE = "b82da08a-15ea-4bd6-902e-236d2d2e523a"
}

# Claves públicas comunes para cuentas de cualquier tenant y cuentas Microsoft personales.
if ([string]::IsNullOrWhiteSpace($env:AZURE_JWK_SET_URI)) {
    $env:AZURE_JWK_SET_URI = "https://login.microsoftonline.com/common/discovery/v2.0/keys"
}

$env:CORS_ALLOWED_ORIGIN = "http://localhost:4200"

$env:USUARIO_SERVICE_URL = "http://localhost:8081"
$env:SUCURSAL_SERVICE_URL = "http://localhost:8082"
$env:SEGUIMIENTO_SERVICE_URL = "http://localhost:8083"
$env:SOLICITUD_SERVICE_URL = "http://localhost:8084"
$env:INCIDENCIA_SERVICE_URL = "http://localhost:8085"
$env:RESENA_SERVICE_URL = "http://localhost:8086"
$env:NOTIFICACION_SERVICE_URL = "http://localhost:8087"
$env:DASHBOARD_SERVICE_URL = "http://localhost:8088"
$env:AUTH_SERVICE_URL = "http://localhost:8089"

Write-Host "Modo Entra ID:  multitenant + cuentas Microsoft personales"
Write-Host "Audience API:   $($env:AZURE_API_AUDIENCE)"
Write-Host "JWK Set URI:    $($env:AZURE_JWK_SET_URI)"
Write-Host ""

foreach ($service in $services) {
    $serviceName = $service.Name
    $servicePort = $service.Port
    $servicePath = Join-Path $root $serviceName

    if (-not (Test-Path $servicePath)) {
        Write-Warning "No se encontró: $servicePath"
        continue
    }

    $command = @"
`$Host.UI.RawUI.WindowTitle = '$serviceName'
`$env:SERVER_PORT = '$servicePort'
Set-Location '$servicePath'
Write-Host 'Iniciando $serviceName en el puerto $servicePort...'
.\mvnw.cmd spring-boot:run
"@

    Start-Process powershell.exe `
        -ArgumentList @(
            "-NoExit",
            "-ExecutionPolicy",
            "Bypass",
            "-Command",
            $command
        )

    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "Se enviaron las órdenes de inicio."
Write-Host "Gateway:  http://localhost:8080"
Write-Host "Frontend: http://localhost:4200"
