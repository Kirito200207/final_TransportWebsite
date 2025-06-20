@echo off
REM Simple test script that skips database setup
REM This script directly runs Django tests

echo Starting simple test process...

REM Check virtual environment
if "%VIRTUAL_ENV%"=="" (
  echo Note: No virtual environment detected. If you use a virtual environment, please activate it first.
  echo Example: .\venv\Scripts\activate
  echo.
)

REM Run Django tests with SQLite
echo Running backend tests with SQLite...
set "DJANGO_SETTINGS_MODULE=transit_backend.settings"
set "TEST_DATABASE_ENGINE=django.db.backends.sqlite3"
set "TEST_DATABASE_NAME=:memory:"

python manage.py test

if %ERRORLEVEL% neq 0 (
  echo Backend tests failed!
  exit /b 1
)

echo All tests passed!
exit /b 0 