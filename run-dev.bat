@echo off
cd /d "C:\Users\ragha\OneDrive\Desktop\web projects\inventory"

echo Starting Vite dev server...
start cmd /k npm run dev

:: wait a bit for server to start
timeout /t 3 >nul

echo Opening browser...
start http://localhost:5173/

exit
