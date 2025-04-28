Write-Host "Starting AI Fitness Trainer..."

# Start Python backend server
Write-Host "Starting Python backend server..."
Set-Location -Path "server"
Start-Process -FilePath "python" -ArgumentList "back.py" -NoNewWindow

# Start Next.js frontend server
Write-Host "Starting Next.js frontend server..."
Set-Location -Path ".."
Start-Process -FilePath "npm" -ArgumentList "run dev" -NoNewWindow

Write-Host "Servers are starting up..."
Write-Host "Frontend will be available at: http://localhost:3000"
Write-Host "Backend will be available at: http://localhost:5000" 