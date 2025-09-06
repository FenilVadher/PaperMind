#!/usr/bin/env python3
"""
PaperMind Setup Script
Installs all required dependencies and sets up the development environment
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, cwd=None, check=True):
    """Run a command and return the result"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            cwd=cwd, 
            check=check,
            capture_output=True,
            text=True
        )
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.CalledProcessError as e:
        return False, e.stdout, e.stderr

def setup_backend():
    """Set up the Python backend environment"""
    print("🐍 Setting up Python backend...")
    
    # Create virtual environment
    print("📦 Creating virtual environment...")
    success, stdout, stderr = run_command("python3 -m venv venv")
    if not success:
        print(f"❌ Failed to create virtual environment: {stderr}")
        return False
    
    # Activate virtual environment and install dependencies
    print("📥 Installing Python dependencies...")
    venv_python = "./venv/bin/python" if os.name != 'nt' else ".\\venv\\Scripts\\python.exe"
    venv_pip = "./venv/bin/pip" if os.name != 'nt' else ".\\venv\\Scripts\\pip.exe"
    
    success, stdout, stderr = run_command(f"{venv_pip} install --upgrade pip")
    if not success:
        print(f"❌ Failed to upgrade pip: {stderr}")
        return False
    
    success, stdout, stderr = run_command(f"{venv_pip} install -r requirements.txt")
    if not success:
        print(f"❌ Failed to install Python dependencies: {stderr}")
        return False
    
    print("✅ Backend setup complete!")
    return True

def setup_frontend():
    """Set up the Node.js frontend environment"""
    print("🎨 Setting up React frontend...")
    
    # Check if npm is available
    success, stdout, stderr = run_command("npm --version", check=False)
    if not success:
        print("❌ npm not found. Please install Node.js first.")
        return False
    
    # Install frontend dependencies
    print("📥 Installing Node.js dependencies...")
    frontend_dir = Path("frontend")
    success, stdout, stderr = run_command("npm install", cwd=frontend_dir)
    if not success:
        print(f"❌ Failed to install Node.js dependencies: {stderr}")
        return False
    
    print("✅ Frontend setup complete!")
    return True

def create_directories():
    """Create necessary directories"""
    print("📁 Creating directories...")
    
    directories = [
        "backend/uploads",
        "backend/models_cache"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"   Created: {directory}")
    
    return True

def main():
    """Main setup function"""
    print("🧠 PaperMind Setup")
    print("=" * 30)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required")
        return False
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Create directories
    if not create_directories():
        return False
    
    # Setup backend
    if not setup_backend():
        return False
    
    # Setup frontend (optional if Node.js not available)
    if not setup_frontend():
        print("⚠️  Frontend setup failed. You can still run the backend.")
    
    print("\n🎉 Setup complete!")
    print("\n📋 Next steps:")
    print("1. Start backend: python3 run_backend.py")
    print("2. Start frontend: cd frontend && npm start")
    print("3. Or use: ./start_papermind.sh")
    print("\n🌐 Access PaperMind at: http://localhost:3000")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
