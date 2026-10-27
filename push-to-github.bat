@echo off
title Push AI Creative Studio to GitHub
cd /d "%~dp0"
echo ========================================================
echo   PUSHING TO https://github.com/engineerpk38-rgb/AI_CREATIVE_STUDIO_HUB
echo ========================================================
echo.
git push -u origin main --force
echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo   SUCCESS! AI_CREATIVE_STUDIO_HUB IS NOW LIVE ON GITHUB!
    echo ========================================================
) else (
    echo Failed to push. Please check your internet or GitHub login.
)
pause
