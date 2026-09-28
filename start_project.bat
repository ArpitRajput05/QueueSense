@echo off
echo ===================================================
echo      QueueSense - Smart Wait-Time Predictor
echo ===================================================
echo.

echo [1/3] Running AI Data Analysis (Pandas)...
cd data_analysis
python analyzer.py
cd ..
echo Data Analysis Complete!
echo.

echo [2/3] Starting Spring Boot Backend (Port 8080)...
cd backend
start cmd /k "title QueueSense Backend && mvn spring-boot:run"
cd ..
echo Backend starting in a new window...
echo.

echo [3/3] Starting React Frontend (Port 5173)...
cd frontend
start cmd /k "title QueueSense Frontend && npm run dev"
cd ..
echo Frontend starting in a new window...
echo.

echo Waiting for servers to initialize...
timeout /t 5 > nul

echo Opening QueueSense in your browser...
start http://localhost:5173
