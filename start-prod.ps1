# Set environment variables
$env:ENV = "prod"

# Stop and remove previous containers
docker-compose -f docker-compose.prod.yml down

# Build and start containers
docker-compose -f docker-compose.prod.yml up --build -d

# Display container status
docker-compose -f docker-compose.prod.yml ps

Write-Host "Production environment started! Access https://your-domain.com to view the application." 