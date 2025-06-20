# Set environment variables
$env:ENV = "dev"

# Create virtual environment and install backend dependencies
Write-Host "Setting up backend..."
cd transit_backend
if (-not (Test-Path -Path "venv")) {
    Write-Host "Creating Python virtual environment..."
    python -m venv venv
}
Write-Host "Activating virtual environment..."
.\venv\Scripts\Activate.ps1
Write-Host "Installing backend dependencies..."
pip install -r requirements.txt
Write-Host "Running backend server..."
Start-Process -NoNewWindow powershell -ArgumentList "-Command", "cd $PWD; .\venv\Scripts\Activate.ps1; python manage.py runserver"

# Install frontend dependencies and start service
Write-Host "Setting up frontend..."
cd ..\my-transport-app
Write-Host "Installing frontend dependencies..."
npm install
Write-Host "Running frontend server..."
Start-Process -NoNewWindow powershell -ArgumentList "-Command", "cd $PWD; npm start"

Write-Host "Development environment started!"
Write-Host "Access http://localhost:3000 to view the frontend application."
Write-Host "Access http://localhost:8000/api/ to view the backend API."
Write-Host "Press Ctrl+C to stop the servers." 