# Stop all containers
docker-compose down

# Clean Docker cache
docker system prune -f

# Configure Docker to use official image registry
$dockerConfigPath = "$env:USERPROFILE\.docker\config.json"
$dockerConfigDir = [System.IO.Path]::GetDirectoryName($dockerConfigPath)

# Create Docker config directory (if it doesn't exist)
if (-not (Test-Path $dockerConfigDir)) {
    New-Item -ItemType Directory -Path $dockerConfigDir -Force | Out-Null
}

# Check if Docker config file exists
if (Test-Path $dockerConfigPath) {
    # Backup existing configuration
    Copy-Item -Path $dockerConfigPath -Destination "$dockerConfigPath.bak" -Force
    
    # Read existing configuration
    $dockerConfig = Get-Content -Path $dockerConfigPath -Raw | ConvertFrom-Json
    
    # Remove registry-mirrors configuration (if exists)
    if ($dockerConfig.PSObject.Properties.Name -contains "registry-mirrors") {
        $dockerConfig.PSObject.Properties.Remove("registry-mirrors")
    }
    
    # Save modified configuration
    $dockerConfig | ConvertTo-Json -Depth 10 | Set-Content -Path $dockerConfigPath -Force
} else {
    # Create new configuration file
    @{} | ConvertTo-Json | Set-Content -Path $dockerConfigPath -Force
}

Write-Host "Docker configuration updated, please restart Docker Desktop application"
Write-Host "After restarting Docker Desktop, run .\start-dev.ps1 to start the project" 