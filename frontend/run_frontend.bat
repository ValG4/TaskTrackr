@echo off
REM Navigate to frontend folder
cd /d "C:\Users\valen\PycharmProjects\TaskTrackr\frontend"

REM Check if we're in the right directory
echo Current directory: %CD%

REM Check if package.json exists
if not exist "package.json" (
    echo Error: package.json not found in current directory!
    echo Please check the path: C:\Users\valen\PycharmProjects\TaskTrackr\frontend
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo node_modules folder not found. Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Error: npm install failed!
        pause
        exit /b 1
    )
)

echo Starting React development server...
npm start

pause