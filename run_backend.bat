@echo off
REM Activate the virtual environment
call "%~dp0.venv\Scripts\activate.bat"

REM Run the backend with uvicorn
uvicorn Backend.main:app --reload

REM Pause so you can see errors if the server stops
pause
