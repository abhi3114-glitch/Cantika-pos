@echo off
title Cantika Beauty Store POS - Build Executable Installer (.exe)
echo ========================================================
echo   Compiling Cantika POS Standalone Windows .exe Installer...
echo ========================================================
echo.

cd /d "%~dp0desktop"

if not exist "node_modules\electron-builder" (
    echo Installing Packaging Tools...
    call npm install electron-builder@^24.13.3 --save-dev
)

echo Building Windows Installer (.exe)...
call npm run build:win

echo.
echo ========================================================
echo   SUCCESS! Windows Installer generated in: desktop\dist-desktop\
echo ========================================================
pause
