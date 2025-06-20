# Set environment variables
$env:ENV = "dev"

# Stop and remove previous containers
docker-compose down

# Build and start containers
docker-compose up --build -d

# Display container status
docker-compose ps

Write-Host "Development environment started!"
Write-Host "Access http://localhost:3000 to view the frontend application."
Write-Host "Access http://localhost:8000/api/ to view the backend API."