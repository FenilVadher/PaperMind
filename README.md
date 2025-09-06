# PaperMind 🧠

**Understand research the smart way.**

PaperMind is a comprehensive AI-powered research paper explainer that transforms complex academic papers into accessible summaries, glossaries, and interactive flashcards. Built with Flask (Python) backend and React frontend, it leverages state-of-the-art Hugging Face Transformers including T5, BART, and Flan-T5.

## ✨ Features

- **📄 Smart Summaries**: Generate both short and detailed summaries using T5 and BART models
- **📚 Technical Glossary**: Extract and explain complex terms with simple definitions using Flan-T5
- **🎯 Study Flashcards**: Create interactive Q&A flashcards for better understanding
- **🚀 Modern UI**: Clean, responsive interface built with React and TailwindCSS
- **⚡ Fast Processing**: Efficient PDF text extraction with PyMuPDF and pdfplumber
- **🔄 Real-time Updates**: Live progress tracking and error handling

## 🏗️ Architecture

### Backend (Flask + AI Models)
- **Flask API**: RESTful endpoints for file upload and AI processing
- **PDF Processing**: Dual extraction methods (PyMuPDF + pdfplumber) for robustness
- **AI Models**: 
  - T5-small for short summaries
  - BART-large-CNN for detailed summaries
  - Flan-T5-base for glossary and Q&A generation
- **CORS Support**: Seamless frontend-backend communication

### Frontend (React + TailwindCSS)
- **React Router**: Single-page application with smooth navigation
- **Modern UI**: TailwindCSS with custom animations and responsive design
- **File Upload**: Drag-and-drop interface with progress tracking
- **Tabbed Dashboard**: Organized content display with Summary, Glossary, and Flashcards tabs
- **Interactive Components**: Flashcard navigation, search functionality, copy-to-clipboard

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
python app.py
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
│   ├── app.py              # Flask application and API endpoints
│   ├── pdf_processor.py    # PDF text extraction utilities
│   ├── ai_models.py        # AI model integration and processing
│   └── uploads/            # Uploaded PDF files storage
├── frontend/
│   ├── public/
│   │   ├── index.html      # Main HTML template
│   │   └── manifest.json   # PWA configuration
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.js    # File upload interface
│   │   │   ├── Dashboard.js      # Main dashboard component
│   │   │   ├── SummaryTab.js     # Summary display component
│   │   │   ├── GlossaryTab.js    # Glossary display component
│   │   │   └── FlashcardsTab.js  # Interactive flashcards
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

## 🤖 AI Models Used

### Summarization Models
- **T5-small**: Fast, efficient short summaries
- **BART-large-CNN**: Detailed, comprehensive summaries

### Language Understanding
- **Flan-T5-base**: Technical term explanation and Q&A generation

### Model Performance
- **GPU Support**: Automatic CUDA detection for faster processing
- **Memory Optimization**: Efficient model loading and inference
- **Error Handling**: Robust fallback mechanisms

## 🎨 UI Features

### Landing Page
- Hero section with feature highlights
- Drag-and-drop PDF upload
- Real-time upload progress
- Responsive design for all devices

### Dashboard
- Tabbed interface (Summary 📄, Glossary 📚, Flashcards 🎯)
- File information display
- Quick action cards
- Export and sharing options

### Interactive Components
- **Flashcards**: Navigation, shuffle, progress tracking
- **Glossary**: Search functionality, copy-to-clipboard
- **Summaries**: Model attribution, regeneration options

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
- **transformers 4.35.2**: Hugging Face models
- **torch 2.1.1**: PyTorch for model inference
- **PyMuPDF 1.23.8**: PDF text extraction
- **pdfplumber 0.10.3**: Alternative PDF processing
- **Flask-CORS 4.0.0**: Cross-origin resource sharing

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

## 📞 Support

For support, email support@papermind.ai or create an issue in the repository.

---

**PaperMind** - Making research accessible to everyone! 🚀
