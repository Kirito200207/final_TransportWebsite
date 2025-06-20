@echo off
REM Run tests batch script
REM This script sets up the test database and runs all tests

echo Starting test process...

REM Check virtual environment
if "%VIRTUAL_ENV%"=="" (
  echo Note: No virtual environment detected. If you use a virtual environment, please activate it first.
  echo Example: .\venv\Scripts\activate
  echo.
)

REM Setup test database
echo Setting up test database...
python scripts/setup_test_db.py

if %ERRORLEVEL% neq 0 (
  echo Test database setup failed!
  exit /b 1
)

echo.

REM Run Django tests
echo Running backend unit tests...
python manage.py test

if %ERRORLEVEL% neq 0 (
  echo Backend unit tests failed!
  exit /b 1
)

echo All tests passed!
exit /b 0 