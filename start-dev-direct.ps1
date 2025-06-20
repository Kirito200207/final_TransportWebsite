# Set environment variables
$env:ENV = "dev"

# Stop and remove previous containers
docker-compose down

# Pull images directly from Docker Hub
Write-Host "Pulling images directly from Docker Hub..."
Write-Host "This may take some time depending on your internet connection."

# Build and start containers
Write-Host "Starting containers..."
docker-compose up -d

# Display container status
docker-compose ps

Write-Host "Development environment started!"
Write-Host "Access http://localhost:3000 to view the frontend application."
Write-Host "Access http://localhost:8000/api/ to view the backend API." 