@echo off
title Cantika Beauty Store POS - Native Desktop App
echo ========================================================
echo   Launching Cantika Beauty Store Enterprise Desktop POS...
echo ========================================================
echo.

:: Detect desktop script location safely
set "SCRIPT_DIR=%~dp0"
if exist "%SCRIPT_DIR%desktop\main.js" (
    cd /d "%SCRIPT_DIR%desktop"
) else if exist "C:\Users\admin\.gemini\antigravity-ide\scratch\indonesian-beauty-angular\desktop\main.js" (
    cd /d "C:\Users\admin\.gemini\antigravity-ide\scratch\indonesian-beauty-angular\desktop"
) else (
    echo Desktop files not found in standalone location.
    echo Opening Cantika POS Cloud Web Application...
    start https://cantika-pos.vercel.app
    exit /b 0
)

if not exist "node_modules\electron" (
    echo Installing Desktop App dependencies...
    call npm install electron@^31.0.0 --save-dev
    node node_modules/electron/install.js
)

echo Starting Desktop Application Window...
call npx electron .
