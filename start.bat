@echo off
echo Starting AI Study Partner...
echo.

echo Starting Flask Backend...
start "Backend" cmd /k "cd backend && python app.py"

echo.
echo Starting React Frontend...
timeout /t 3 /nobreak >nul
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
pause
