#!/bin/bash

echo "🚀 Setting up PaperMind Enhanced with Advanced Features..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install Python dependencies
echo "📚 Installing Python dependencies..."
pip install -r requirements.txt

# Download spaCy model
echo "🧠 Downloading spaCy English model..."
python -m spacy download en_core_web_sm

# Install frontend dependencies
echo "🎨 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/uploads
mkdir -p backend/models_cache
mkdir -p backend/chroma_db

# Copy environment file
if [ ! -f "backend/.env" ]; then
    echo "⚙️ Creating environment configuration..."
    cp backend/.env.example backend/.env
    echo "📝 Please edit backend/.env and add your API keys:"
    echo "   - OPENAI_API_KEY (required for advanced features)"
    echo "   - SEMANTIC_SCHOLAR_API_KEY (optional)"
fi

# Make scripts executable
chmod +x start_papermind.sh
chmod +x setup_enhanced.sh

echo ""
echo "✅ PaperMind Enhanced setup complete!"
echo ""
echo "🔑 Next steps:"
echo "1. Edit backend/.env and add your OpenAI API key"
echo "2. Run: ./start_papermind.sh"
echo ""
echo "🌟 New Features Available:"
echo "   • Citation Analysis & Networks"
echo "   • Methodology Extraction"
echo "   • Semantic Search within papers"
echo "   • Related Papers Discovery"
echo "   • Research Gap Identification"
echo "   • Concept Mapping"
echo "   • Paper Comparison"
echo ""
echo "📖 For more information, see README.md"
