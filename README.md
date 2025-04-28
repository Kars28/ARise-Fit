# AI Fitness Trainer with AR Workout

A Next.js application that provides personalized fitness training with AR-powered workout tracking and form correction.

## Features

- AR-powered workout tracking and form correction
- Real-time pose detection
- Exercise library with detailed instructions
- Personalized workout plans
- Progress tracking

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- npm or yarn
- Windows PowerShell

## Installation

1. Clone the repository:
```powershell
git clone https://github.com/your-username/ai-fitness-trainer.git
cd ai-fitness-trainer
```

2. Install Node.js dependencies:
```powershell
npm install
```

3. Install Python dependencies:
```powershell
pip install -r requirements.txt
```

## Running the Application

1. Open PowerShell in the project directory

2. Run the start script:
```powershell
.\start.ps1
```

Or run manually:
```powershell
# Terminal 1 - Start Python backend
cd server
python back.py

# Terminal 2 - Start Next.js frontend
cd ..
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

- `/app` - Next.js application pages and components
- `/components` - Reusable React components
- `/public` - Static files and AR workout scripts
- `/server` - Python backend server
- `/models` - Data models and schemas
- `/lib` - Utility functions and shared code

## Environment Variables

Create a `.env.local` file in the root directory with:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Troubleshooting

If you encounter any issues:

1. Make sure Python and Node.js are installed and in your PATH
2. Check if ports 3000 and 5000 are available
3. Ensure all dependencies are installed correctly
4. Try running the servers manually in separate terminals

## License

MIT License

## Support

For any questions or issues, please open an issue in the repository.
