@echo off
title Cantika Beauty Store POS - Native Desktop App
echo ========================================================
echo   Launching Cantika Beauty Store Enterprise Desktop POS...
echo ========================================================
echo.

cd /d "%~dp0desktop"

if not exist "node_modules\electron" (
    echo Installing Desktop App dependencies...
    call npm install electron@^31.0.0 --save-dev
)

echo Starting Desktop Application Window...
call npm start
pause
