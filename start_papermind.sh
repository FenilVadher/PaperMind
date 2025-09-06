#!/bin/bash

# PaperMind Startup Script
# This script starts both backend and frontend servers

echo "🧠 Starting PaperMind - AI Research Paper Explainer"
echo "=================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Function to start backend
start_backend() {
    echo "🔧 Starting Flask Backend..."
    cd backend
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        echo "📦 Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    echo "📥 Installing Python dependencies..."
    pip install -r ../requirements.txt
    
    # Start Flask server
    echo "🚀 Starting Flask server on http://localhost:5000"
    python app.py &
    BACKEND_PID=$!
    echo $BACKEND_PID > backend.pid
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting React Frontend..."
    cd frontend
    
    # Install dependencies
    echo "📥 Installing Node.js dependencies..."
    npm install
    
    # Start React development server
    echo "🚀 Starting React server on http://localhost:3000"
    npm start &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > frontend.pid
    cd ..
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down PaperMind..."
    
    if [ -f "backend/backend.pid" ]; then
        kill $(cat backend/backend.pid) 2>/dev/null
        rm backend/backend.pid
    fi
    
    if [ -f "frontend/frontend.pid" ]; then
        kill $(cat frontend/frontend.pid) 2>/dev/null
        rm frontend/frontend.pid
    fi
    
    echo "✅ PaperMind stopped successfully"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start services
start_backend
sleep 3
start_frontend

echo ""
echo "✅ PaperMind is now running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "📚 Upload a PDF and start exploring!"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
wait
