@echo off
echo Starting AI Fitness Trainer...

echo Starting Python backend server...
cd server
start cmd /k "python back.py"

echo Starting Next.js frontend server...
cd ..
start cmd /k "npm run dev"

echo Servers are starting up...
echo Frontend will be available at: http://localhost:3000
echo Backend will be available at: http://localhost:5000 