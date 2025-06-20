@echo off
REM Frontend test script
REM This script runs frontend unit tests and end-to-end tests

echo Starting frontend test process...

REM Run unit tests
echo Running React unit tests...
call npm test -- --watchAll=false

if %ERRORLEVEL% neq 0 (
  echo Unit tests failed!
  exit /b 1
)

echo Unit tests passed!
echo.

REM Check if development server is running
echo Checking development server...
curl -s http://localhost:3000 > nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo Development server not running, starting now...
  echo (Keep this terminal open, run Cypress tests in a new terminal)
  call npm start
  exit /b 0
)

REM Run Cypress tests
echo Running Cypress end-to-end tests...
call npx cypress run

if %ERRORLEVEL% neq 0 (
  echo Cypress tests failed!
  exit /b 1
)

echo All frontend tests passed!
exit /b 0 