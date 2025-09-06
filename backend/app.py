from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import logging
from werkzeug.utils import secure_filename
from pdf_processor import PDFProcessor
from ai_models import AIModels
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize AI models and PDF processor
pdf_processor = PDFProcessor()
ai_models = AIModels()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'PaperMind API is running',
        'version': '1.0.0'
    })

@app.route('/upload', methods=['POST'])
def upload_file():
    """Upload and process PDF file"""
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
        
        # Store extracted text for processing
        text_file_path = os.path.join(UPLOAD_FOLDER, f"{filename}_text.txt")
        with open(text_file_path, 'w', encoding='utf-8') as f:
            f.write(extracted_text)
        
        logger.info(f"Successfully processed PDF: {filename}")
        
        return jsonify({
            'message': 'File uploaded and processed successfully',
            'filename': filename,
            'text_length': len(extracted_text),
            'preview': extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text
        })
        
    except Exception as e:
        logger.error(f"Error in upload_file: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': f'Failed to process file: {str(e)}'}), 500

@app.route('/summarize', methods=['POST'])
def summarize_paper():
    """Generate short and detailed summaries"""
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'error': 'Filename is required'}), 400
        
        # Read extracted text
        text_file_path = os.path.join(UPLOAD_FOLDER, f"{filename}_text.txt")
        if not os.path.exists(text_file_path):
            return jsonify({'error': 'Text file not found. Please upload the PDF first.'}), 404
        
        with open(text_file_path, 'r', encoding='utf-8') as f:
            text = f.read()
        
        # Generate summaries
        short_summary = ai_models.generate_short_summary(text)
        detailed_summary = ai_models.generate_detailed_summary(text)
        
        logger.info(f"Generated summaries for: {filename}")
        
        return jsonify({
            'short_summary': short_summary,
            'detailed_summary': detailed_summary,
            'filename': filename
        })
        
    except Exception as e:
        logger.error(f"Error in summarize_paper: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': f'Failed to generate summaries: {str(e)}'}), 500

@app.route('/glossary', methods=['POST'])
def generate_glossary():
    """Generate glossary of technical terms"""
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'error': 'Filename is required'}), 400
        
        # Read extracted text
        text_file_path = os.path.join(UPLOAD_FOLDER, f"{filename}_text.txt")
        if not os.path.exists(text_file_path):
            return jsonify({'error': 'Text file not found. Please upload the PDF first.'}), 404
        
        with open(text_file_path, 'r', encoding='utf-8') as f:
            text = f.read()
        
        # Generate glossary
        glossary = ai_models.generate_glossary(text)
        
        logger.info(f"Generated glossary for: {filename}")
        
        return jsonify({
            'glossary': glossary,
            'filename': filename,
            'total_terms': len(glossary)
        })
        
    except Exception as e:
        logger.error(f"Error in generate_glossary: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': f'Failed to generate glossary: {str(e)}'}), 500

@app.route('/flashcards', methods=['POST'])
def generate_flashcards():
    """Generate Q&A flashcards"""
    try:
        data = request.get_json()
        filename = data.get('filename')
        num_cards = data.get('num_cards', 8)  # Default to 8 cards
        
        if not filename:
            return jsonify({'error': 'Filename is required'}), 400
        
        # Read extracted text
        text_file_path = os.path.join(UPLOAD_FOLDER, f"{filename}_text.txt")
        if not os.path.exists(text_file_path):
            return jsonify({'error': 'Text file not found. Please upload the PDF first.'}), 404
        
        with open(text_file_path, 'r', encoding='utf-8') as f:
            text = f.read()
        
        # Generate flashcards
        flashcards = ai_models.generate_flashcards(text, num_cards)
        
        logger.info(f"Generated {len(flashcards)} flashcards for: {filename}")
        
        return jsonify({
            'flashcards': flashcards,
            'filename': filename,
            'total_cards': len(flashcards)
        })
        
    except Exception as e:
        logger.error(f"Error in generate_flashcards: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': f'Failed to generate flashcards: {str(e)}'}), 500

@app.route('/files', methods=['GET'])
def list_files():
    """List uploaded files"""
    try:
        files = []
        for filename in os.listdir(UPLOAD_FOLDER):
            if filename.endswith('.pdf'):
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file_size = os.path.getsize(filepath)
                files.append({
                    'filename': filename,
                    'size': file_size,
                    'size_mb': round(file_size / (1024 * 1024), 2)
                })
        
        return jsonify({'files': files})
        
    except Exception as e:
        logger.error(f"Error in list_files: {str(e)}")
        return jsonify({'error': f'Failed to list files: {str(e)}'}), 500

@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large. Maximum size is 16MB.'}), 413

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)
