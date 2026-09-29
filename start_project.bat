@echo off
echo Starting QueueSense Backend...
start cmd /k "cd backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload"

echo Starting QueueSense Frontend...
start cmd /k "cd frontend && npm run dev"

echo Both services started!
