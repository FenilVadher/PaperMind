#!/usr/bin/env python3
"""
PaperMind Backend Runner
Simple script to start the Flask backend server
"""

import os
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_dir))

# Change to backend directory
os.chdir(backend_dir)

# Import and run the Flask app
from app import app

if __name__ == '__main__':
    print("🧠 Starting PaperMind Backend Server...")
    print("📍 Backend running on: http://localhost:5000")
    print("📄 API Documentation: http://localhost:5000/")
    print("🔄 CORS enabled for: http://localhost:3000")
    print("=" * 50)
    
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000,
        threaded=True
    )
