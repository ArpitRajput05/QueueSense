# 🚀 QueueSense - Smart Wait-Time Predictor

QueueSense is a full-stack, data-driven application designed to eliminate the frustration of waiting in physical lines at hospitals, banks, or canteens. By leveraging historical data, it provides users with highly accurate AI-predicted wait times and smart recommendations (e.g., "Safe to grab a coffee") directly on their mobile phones.

## 🌟 The Problem
People waste hours standing in physical lines because they have no idea how long a service will take. They are afraid to step away, leading to crowded waiting rooms and a poor user experience.

## 💡 The Solution
Instead of standing in line, users scan a QR code at the entrance to receive a digital ticket on their phone. Behind the scenes, the system analyzes historical queue data to predict exactly when their turn will arrive.

## 🛠️ Tech Stack
This project is built using a modern, 3-tier architecture:

1. **Data Analysis (Python, Pandas, NumPy):** 
   - Acts as the "Brain" of the application.
   - Parses historical `.csv` datasets of hospital queues.
   - Calculates moving averages and accounts for peak-hour variances to output accurate wait-time predictions.
2. **Backend (Java Spring Boot):** 
   - Acts as the "Bridge".
   - A lightweight REST API that securely reads the data analysis output and serves it to the frontend.
3. **Frontend (React, Vite, Tailwind CSS):** 
   - Acts as the "Face".
   - A mobile-first, Glassmorphism-styled dashboard that gives the user real-time updates and smart recommendations.

## 🚀 How to Run Locally

For ease of use, a single startup script is provided.

1. Clone this repository.
2. Ensure you have **Python**, **Java 17+ / Maven**, and **Node.js** installed.
3. Double-click the `start_project.bat` file in the root directory.

This script will automatically:
- Run the Python Pandas analysis to generate fresh data.
- Start the Java Spring Boot backend on port 8080.
- Start the React frontend on port 5173 and open it in your browser.

## 📊 Future Improvements
- Connect the Python script to a live PostgreSQL database instead of a static CSV.
- Add Admin UI for doctors/tellers to click "Next Patient" which automatically recalculates wait times.
