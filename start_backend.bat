@echo off
cd backend
call uv venv
call uv pip install -r requirements.txt
call uv pip install "fastapi[standard]"
call uv pip install uvicorn
call uv run uvicorn app.main:app --reload
