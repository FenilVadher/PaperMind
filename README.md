# PaperMind 🧠

**Understand research the smart way.**

PaperMind is a comprehensive AI-powered research paper analysis platform that transforms complex academic papers into accessible summaries, glossaries, flashcards, advanced analysis insights, and comparative studies. Built with Flask (Python) backend and React frontend, it provides intelligent document processing with both AI-powered and heuristic-based analysis methods.

## ✨ Features

### Core AI Features
- **📄 Smart Summaries**: Generate both short and detailed summaries with intelligent text processing
- **📚 Technical Glossary**: Extract and explain complex terms with contextual definitions
- **🎯 Study Flashcards**: Create interactive Q&A flashcards for better understanding

### Advanced Analysis
- **🔍 Citation Analysis**: Extract and analyze paper citations and references
- **🧪 Methodology Extraction**: Identify research methods and experimental approaches
- **🔎 Semantic Search**: Search through paper content with intelligent matching
- **📊 Research Gap Identification**: Discover gaps and future research opportunities
- **🗺️ Concept Mapping**: Visualize key concepts and their relationships
- **📋 Related Papers**: Find and suggest related research (mock implementation)

### Paper Comparison
- **⚖️ Multi-Paper Analysis**: Compare 2-3 papers side-by-side
- **🎯 Content-Based Comparison**: Analyze research focus, themes, and findings
- **📈 Methodology Comparison**: Compare experimental approaches and methods
- **💡 Insight Generation**: Generate meaningful comparative insights

### User Experience
- **🚀 Modern UI**: Clean, responsive interface built with React and TailwindCSS
- **⚡ Fast Processing**: Efficient PDF text extraction with PyMuPDF and pdfplumber
- **🔄 Real-time Updates**: Live progress tracking and error handling
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

### Backend (Flask + Analysis Engine)
- **Flask API**: RESTful endpoints for file upload, AI processing, analysis, and comparison
- **PDF Processing**: Dual extraction methods (PyMuPDF + pdfplumber) for robustness
- **Analysis Engine**: 
  - Heuristic-based text processing for summaries, glossaries, and flashcards
  - Citation extraction using regex patterns
  - Methodology identification through keyword analysis
  - Semantic search with text matching algorithms
  - Content-based paper comparison with intelligent insights
- **CORS Support**: Seamless frontend-backend communication

### Frontend (React + TailwindCSS)
- **React Router**: Single-page application with smooth navigation
- **Modern UI**: TailwindCSS with custom animations and responsive design
- **File Upload**: Drag-and-drop interface with progress tracking
- **Multi-Tab Dashboard**: Organized content display with Summary, Glossary, Flashcards, Analysis, and Comparison tabs
- **Interactive Components**: Flashcard navigation, search functionality, copy-to-clipboard
- **Advanced Features**: Multi-paper selection, content-based comparison, analysis visualization

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ 
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Clone and navigate to the project**
```bash
git clone <repository-url>
cd PaperMind
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

4. **Start the Flask server**
```bash
cd backend
python simple_app.py
```
The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install Node.js dependencies**
```bash
npm install
```

3. **Start the React development server**
```bash
npm start
```
The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
PaperMind/
├── backend/
│   ├── simple_app.py       # Main Flask application with all endpoints
│   ├── pdf_processor.py    # PDF text extraction and analysis utilities
│   ├── uploads/            # Uploaded PDF files storage
│   └── static/             # Static files and assets
├── frontend/
│   ├── public/
│   │   ├── index.html      # Main HTML template
│   │   └── manifest.json   # PWA configuration
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.js    # File upload interface with features showcase
│   │   │   ├── Dashboard.js      # Main dashboard with 5-tab navigation
│   │   │   ├── SummaryTab.js     # Summary display component
│   │   │   ├── GlossaryTab.js    # Glossary display component
│   │   │   ├── FlashcardsTab.js  # Interactive flashcards
│   │   │   ├── AnalysisTab.js    # Advanced analysis features
│   │   │   └── ComparisonTab.js  # Multi-paper comparison
│   │   ├── services/
│   │   │   └── api.js            # API service layer
│   │   ├── App.js                # Main React application
│   │   ├── index.js              # React entry point
│   │   └── index.css             # TailwindCSS styles
│   ├── package.json              # Node.js dependencies
│   ├── tailwind.config.js        # TailwindCSS configuration
│   └── postcss.config.js         # PostCSS configuration
├── paper/
│   └── Attention All You Need.pdf  # Sample research paper
├── requirements.txt               # Python dependencies
├── .gitignore                    # Git ignore rules
└── README.md                     # This file
```

## 🔧 API Endpoints

### Backend API (`http://localhost:5000`)

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/` | GET | Health check | None |
| `/upload` | POST | Upload and process PDF | `file` (multipart/form-data) |
| `/summarize` | POST | Generate summaries | `filename` (JSON) |
| `/glossary` | POST | Generate glossary | `filename` (JSON) |
| `/flashcards` | POST | Generate flashcards | `filename`, `num_cards` (JSON) |
| `/files` | GET | List uploaded files | None |

### Advanced Analysis Endpoints

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/analyze/citations` | POST | Extract citations | `filename` (JSON) |
| `/analyze/methodology` | POST | Extract methodology | `filename` (JSON) |
| `/analyze/semantic-search` | POST | Semantic search | `filename`, `query` (JSON) |
| `/analyze/research-gaps` | POST | Identify research gaps | `filename` (JSON) |
| `/analyze/concept-map` | POST | Generate concept map | `filename` (JSON) |
| `/analyze/related-papers` | POST | Find related papers | `filename` (JSON) |
| `/compare-papers` | POST | Compare multiple papers | `filenames` (JSON array) |

### Example API Usage

```javascript
// Upload PDF
const formData = new FormData();
formData.append('file', pdfFile);
const response = await fetch('/upload', {
  method: 'POST',
  body: formData
});

// Generate summaries
const summaries = await fetch('/summarize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ filename: 'paper.pdf' })
});
```

## 🧠 Analysis Methods

### Text Processing Engine
- **Heuristic Analysis**: Intelligent text processing using regex patterns and keyword matching
- **Content Extraction**: Advanced algorithms for citations, methodology, and concept identification
- **Semantic Matching**: Text similarity and search algorithms

### Analysis Capabilities
- **Summary Generation**: Sentence-based extraction and intelligent truncation
- **Glossary Creation**: Term frequency analysis with contextual definitions
- **Flashcard Generation**: Question-answer pair creation with multiple formats
- **Citation Analysis**: Reference extraction and formatting
- **Research Gap Detection**: Pattern-based identification of future work opportunities

### Performance Features
- **Fast Processing**: No external API dependencies for instant results
- **Memory Efficient**: Lightweight text processing algorithms
- **Error Handling**: Robust fallback mechanisms and graceful degradation

## 🎨 UI Features

### Landing Page
- Hero section with feature highlights
- Drag-and-drop PDF upload
- Real-time upload progress
- Responsive design for all devices

### Dashboard
- 5-Tab interface (Summary 📄, Glossary 📚, Flashcards 🎯, Analysis 🔍, Comparison ⚖️)
- File information display with upload status
- Quick action cards with Lucide icons
- Multi-paper selection for comparison
- Real-time analysis results

### Interactive Components
- **Flashcards**: Navigation, shuffle, progress tracking
- **Glossary**: Search functionality, copy-to-clipboard, frequency indicators
- **Analysis**: Citation extraction, methodology identification, research gaps
- **Comparison**: Side-by-side paper analysis, content insights, methodology comparison
- **Semantic Search**: Query-based content discovery within papers

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```env
FLASK_ENV=development
FLASK_DEBUG=True
MAX_CONTENT_LENGTH=16777216  # 16MB
```

### Frontend Configuration
Update `frontend/src/services/api.js` for production:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

## 📦 Dependencies

### Backend Dependencies
- **Flask 2.3.3**: Web framework
- **PyMuPDF 1.23.8**: PDF text extraction
- **pdfplumber 0.10.3**: Alternative PDF processing
- **Flask-CORS 4.0.0**: Cross-origin resource sharing
- **re (built-in)**: Regular expressions for text analysis

### Frontend Dependencies
- **React 18.2.0**: UI framework
- **react-router-dom 6.8.1**: Client-side routing
- **axios 1.6.2**: HTTP client
- **react-dropzone 14.2.3**: File upload component
- **lucide-react 0.294.0**: Icon library
- **tailwindcss 3.3.6**: CSS framework

## 🚀 Deployment

### Backend Deployment
```bash
# Install production dependencies
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Serve static files
npx serve -s build -l 3000
```

### Docker Support (Optional)
Create `Dockerfile` for containerized deployment:
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

## 🧪 Testing

### Backend Testing
```bash
# Test API endpoints
curl -X GET http://localhost:5000/
curl -X POST -F "file=@paper.pdf" http://localhost:5000/upload
```

### Frontend Testing
```bash
# Run React tests
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Hugging Face**: For providing state-of-the-art transformer models
- **OpenAI**: For inspiration in AI-powered document processing
- **React Community**: For excellent frontend development tools
- **TailwindCSS**: For beautiful, responsive design system

## 👥 Team

This project was built by:
- **Fenil Vadher**
- **Ritesh Sanchala** 
- **Aryan Langhonja**

---

**PaperMind** - Making research accessible to everyone! 🚀
