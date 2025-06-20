@echo off
REM Main test script that runs all tests

echo ===================================
echo Running all tests for the project
echo ===================================
echo.

echo Running backend tests...
cd transit_backend
call scripts\run_basic_tests.bat
if %ERRORLEVEL% neq 0 (
  echo Backend tests failed!
  exit /b 1
)
echo.

echo Running frontend tests...
cd ..\my-transport-app
call scripts\run_basic_tests.bat
if %ERRORLEVEL% neq 0 (
  echo Frontend tests failed!
  exit /b 1
)
echo.

echo ===================================
echo All tests passed successfully!
echo ===================================
exit /b 0 