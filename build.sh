#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================================"
echo "         Building RN Tailor Management System           "
echo "========================================================"

# 1. Build Frontend
echo ""
echo "▶ [1/4] Building Angular frontend..."
cd taui
npm run build
cd "$SCRIPT_DIR"

# 2. Copy Static Assets to Backend
echo ""
echo "▶ [2/4] Copying UI assets to Spring Boot static resources..."
rm -rf tailor-service/src/main/resources/static/*
mkdir -p tailor-service/src/main/resources/static
cp -r taui/dist/taui/browser/* tailor-service/src/main/resources/static/

# 3. Build Backend JAR
echo ""
echo "▶ [3/4] Packaging Spring Boot JAR..."
cd tailor-service
if [ -f "./mvnw" ]; then
  ./mvnw clean package -DskipTests
elif [ -f "./mvnw.cmd" ]; then
  ./mvnw.cmd clean package -DskipTests
else
  mvn clean package -DskipTests
fi
cd "$SCRIPT_DIR"

# 4. Assemble tailor-app Distribution Folder
echo ""
echo "▶ [4/4] Assembling tailor-app distribution package..."
mkdir -p tailor-app
cp tailor-service/target/tailor.service-1.0.0.jar tailor-app/tailor-app.jar

# Generate run.bat with smart browser launch (opens once service is up)
cat > tailor-app/run.bat << 'EOF'
@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title RN Tailor - Management System
echo ========================================================
echo        Starting RN Tailor Management System...
echo ========================================================
echo.

:: 1. Verify Java Installation
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java is not detected on your Windows system!
    echo Please download and install Java 17 or Java 21 from:
    echo https://adoptium.net/
    echo.
    pause
    exit /b 1
)

:: 2. Configure Dynamic Client Secret Token
if "%JWT_SECRET%"=="" (
    set "JWT_SECRET=TailorAppClientSecret2026_94f8a3d1c2e7b5"
)

echo Initializing application...
echo Waiting for server to start, then opening browser...
echo.
echo NOTE: Keep this terminal window open while using the application.
echo To shut down the application, close this window.
echo ========================================================
echo.

:: 3. Open browser once the server is actually responding
start "" powershell -NoProfile -WindowStyle Hidden -Command "$u='http://localhost:8080'; for ($i=0; $i -lt 45; $i++) { try { $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 1; if ($r.StatusCode -eq 200) { Start-Process $u; break } } catch {} Start-Sleep -Seconds 1 }"

:: 4. Start application with external secret token
java -jar "%~dp0tailor-app.jar" --jwt.secret=%JWT_SECRET%

if %errorlevel% neq 0 (
    echo.
    echo Application stopped with code %errorlevel%.
    pause
)
EOF

echo ""
echo "========================================================"
echo " ✔ Build succeeded! Package is ready in tailor-app/"
echo "   - tailor-app/tailor-app.jar"
echo "   - tailor-app/run.bat"
echo "========================================================"
