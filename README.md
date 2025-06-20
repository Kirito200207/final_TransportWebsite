# Public Transit System

A comprehensive public transit application built with Django and React, deployed using Docker containers.

## Project Description

The Public Transit System is a modern web application designed to enhance the commuter experience by providing real-time transit information, personalized features, and intuitive navigation. The application helps users plan trips, track vehicles in real-time, receive service alerts, and manage their travel preferences.

### Key Features

- **Real-time transit information**: Live updates on bus and tram locations and schedules
- **Interactive map**: Visual representation of routes, stops, and vehicles
- **Trip planning**: Route suggestions based on origin, destination, and preferences
- **User accounts**: Personalized experience with saved routes and favorites
- **Service alerts**: Notifications about delays or service changes
- **Travel history**: Review of past trips and travel patterns
- **Responsive design**: Optimized for both desktop and mobile devices

## Technology Stack

- **Backend**: Django + Django REST Framework
- **Frontend**: React + React Router + Axios
- **Database**: PostgreSQL
- **Cache**: Redis
- **Web Server**: Nginx
- **Containerization**: Docker + Docker Compose

## Project Structure

```
project/
├── transit_backend/   # Django backend
├── my-transport-app/  # React frontend
├── nginx/             # Nginx configuration
├── docker-compose.yml       # Development environment config
├── docker-compose.prod.yml  # Production environment config
├── start-dev.sh      # Development startup script (Linux/Mac)
├── start-dev.ps1     # Development startup script (Windows)
├── start-prod.sh     # Production startup script (Linux/Mac)
└── start-prod.ps1    # Production startup script (Windows)
```

## Quick Start Guide

### System Requirements

#### Option 1: Local Development Environment (Recommended)

- [Python](https://www.python.org/downloads/) (version 3.9 or higher)
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Git](https://git-scm.com/downloads)

#### Option 2: Docker Environment

- [Docker](https://docs.docker.com/get-docker/) (version 20.10.0 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0.0 or higher)
- [Git](https://git-scm.com/downloads)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Kirito200207/final_TransportWebsite
cd final_TransportWebsite
```

### Step 2: Start the Application

You can choose one of the following two methods to start the application:

#### Option 1: Local Development Environment (Recommended)

This method uses local Python and Node.js environments, without Docker:

```powershell
# Make sure Python 3.9+ and Node.js 18+ are installed
.\run-local.ps1
```

#### Option 2: Docker Environment (May fail if network issues occur)

```powershell
# Make sure Docker Desktop is running
.\start-dev.ps1
```

If you encounter Docker image pulling issues, you can try:

```powershell
# Fix Docker configuration
.\fix-docker.ps1
# Run after restarting Docker Desktop
.\start-dev.ps1
```

Or use alternative image registry:

```powershell
.\start-dev-cn.ps1
```

#### For Linux/Mac:

```bash
# Make sure Docker service is running
chmod +x start-dev.sh
./start-dev.sh
```

### Step 3: Access the Application

Once the services are successfully started (may take a few minutes on first startup):

- Frontend application: http://localhost:3000
- Backend API: http://localhost:8000/api/
- Admin interface: http://localhost:8000/admin/

#### Troubleshooting Common Issues

If you encounter the following errors when using Docker:
- "failed to do request: TLS handshake timeout"
- Errors related to "registry.docker-cn.com"

Please try using the local development environment (run-local.ps1) or fix Docker configuration (fix-docker.ps1).

### Step 4: Verify Containers are Running

```bash
docker ps
```

You should see containers for backend, frontend, database, Redis, and Nginx.

### Troubleshooting Common Issues

#### Port Conflicts

If you see errors about ports being in use:

```bash
# Stop any services using port 80
# For Windows:
netstat -ano | findstr :80
taskkill /PID <PID> /F

# For Linux/Mac:
sudo lsof -i :80
sudo kill <PID>
```

#### Docker Issues

If containers fail to start:

```bash
# View container logs
docker-compose logs

# View logs for a specific container
docker-compose logs backend
docker-compose logs frontend
```

#### Database Connection Issues

If the application can't connect to the database:

```bash
# Restart the database container
docker-compose restart db

# Check database logs
docker-compose logs db
```

## Detailed Setup Instructions

### Development Environment Setup

1. Ensure Docker and Docker Compose are properly installed:

```bash
docker --version
docker-compose --version
```

2. Start the development environment:

Windows:
```powershell
.\start-dev.ps1
```

Linux/Mac:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

3. The startup script will:
   - Set the environment to development mode
   - Stop and remove any existing containers
   - Build and start new containers
   - Display container status

4. Wait for all services to initialize (check logs if needed):

```bash
docker-compose logs -f
```

5. Access the application at http://localhost

### Running Frontend Separately (for Development)

If you want to run only the frontend during development:

1. Navigate to the frontend directory:

```bash
cd my-transport-app
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. The frontend will be available at http://localhost:3000

### Running Backend Separately (for Development)

If you want to run only the backend during development:

1. Navigate to the backend directory:

```bash
cd transit_backend
```

2. Create a virtual environment:

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Apply migrations:

```bash
python manage.py migrate
```

5. Start the development server:

```bash
python manage.py runserver
```

6. The backend API will be available at http://localhost:8000/api/

### Production Environment Setup

1. Start production environment:

Windows:
```powershell
.\start-prod.ps1
```

Linux/Mac:
```bash
chmod +x start-prod.sh
./start-prod.sh
```

2. Access the production application at http://localhost

## Development Environment Reference

### Local Development Commands

```bash
# Start local development environment
.\run-local.ps1

# Start backend service only
cd transit_backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py runserver

# Start frontend service only
cd my-transport-app
npm install
npm start
```

### Docker Command Reference

```bash
# Start containers in the background
docker-compose up -d

# Rebuild containers after code changes
docker-compose up --build -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# View logs for a specific service
docker-compose logs -f backend
```

### Container Management

```bash
# List running containers
docker ps

# Access container shell
docker exec -it transit_backend bash
docker exec -it transit_frontend sh

# View container logs
docker logs transit_backend
docker logs transit_frontend
```

### Data Management

```bash
# Access PostgreSQL
docker exec -it transit_db psql -U postgres -d transit_dev

# Access Redis CLI
docker exec -it transit_redis redis-cli
```

### Docker Registry Configuration

If you encounter Docker image pulling issues, you can try the following methods:

1. Run `.\fix-docker.ps1` script to fix Docker configuration
2. Run `.\start-dev-cn.ps1` to use alternative image registry
3. Modify Docker Desktop settings to remove registry-mirrors configuration

## Testing Instructions

### Backend Tests

```bash
# Run all tests
docker exec -it transit_backend python manage.py test

# Run tests for specific app
docker exec -it transit_backend python manage.py test api

# Run tests using pytest
docker exec -it transit_backend pytest
```

### Frontend Tests

```bash
# Run unit tests
cd my-transport-app
npm test

# Run test coverage report
npm run test:coverage

# Run Cypress end-to-end tests
npm run test:e2e
```

## Environment Configuration

The application uses the following environment variables:

### Docker Environment Variables (docker-compose.yml)

- `DEBUG`: Debug mode (True/False)
- `SECRET_KEY`: Django secret key
- `ALLOWED_HOSTS`: Allowed hostnames
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Database configuration
- `REDIS_HOST`, `REDIS_PORT`: Redis configuration
- `REACT_APP_API_URL`: Frontend API URL

### Local Development Environment Variables

#### Backend (transit_backend/.env)

You can create an .env file in the transit_backend directory with the following content:

```
DEBUG=True
SECRET_KEY=django-insecure-dev-key-change-this-in-production
ALLOWED_HOSTS=localhost,127.0.0.1
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

#### Frontend (my-transport-app/.env)

You can create an .env file in the my-transport-app directory with the following content:

```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_DEBUG=true
```

## Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Docker Documentation](https://docs.docker.com/)

## License

[MIT License](LICENSE)
