from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from pdf_processor import PDFProcessor

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

pdf_processor = PDFProcessor()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'PaperMind API is running (Simple Mode)',
        'version': '1.0.0'
    })

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only PDF files are allowed'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Extract text from PDF
        extracted_text = pdf_processor.extract_text(filepath)
        
        if not extracted_text or len(extracted_text.strip()) < 100:
            return jsonify({'error': 'Could not extract sufficient text from PDF'}), 400
        
        # Store extracted text
        text_file_path = os.path.join(UPLOAD_FOLDER, f"{filename}_text.txt")
        with open(text_file_path, 'w', encoding='utf-8') as f:
            f.write(extracted_text)
        
        return jsonify({
            'message': 'File uploaded and processed successfully',
            'filename': filename,
            'text_length': len(extracted_text),
            'preview': extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to process file: {str(e)}'}), 500

@app.route('/summarize', methods=['POST'])
def summarize_paper():
    return jsonify({'error': 'AI models still loading. Please wait and try again.'}), 503

@app.route('/glossary', methods=['POST'])
def generate_glossary():
    return jsonify({'error': 'AI models still loading. Please wait and try again.'}), 503

@app.route('/flashcards', methods=['POST'])
def generate_flashcards():
    return jsonify({'error': 'AI models still loading. Please wait and try again.'}), 503

if __name__ == '__main__':
    print("🧠 Starting PaperMind Simple Backend (PDF Upload Only)...")
    print("📍 Backend running on: http://localhost:5001")
    app.run(debug=True, host='0.0.0.0', port=5001)
