from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from pdf_processor import PDFProcessor
from simple_advanced_processor import SimpleAdvancedProcessor
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

pdf_processor = PDFProcessor()
advanced_processor = SimpleAdvancedProcessor()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'PaperMind Enhanced API is running',
        'version': '2.0.0',
        'features': [
            'Citation Analysis',
            'Methodology Extraction', 
            'Semantic Search',
            'Related Papers',
            'Research Gaps',
            'Concept Mapping'
        ]
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
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Extract text
        text_content = pdf_processor.extract_text(filepath)
        
        return jsonify({
            'message': 'File uploaded successfully',
            'filename': filename,
            'filepath': filepath,
            'text_length': len(text_content),
            'upload_time': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/analyze/citations', methods=['POST'])
def analyze_citations():
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'error': 'Filename required'}), 400
        
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        text_content = pdf_processor.extract_text(filepath)
        
        citation_analysis = advanced_processor.extract_citations(text_content)
        
        return jsonify({
            'filename': filename,
            'citation_analysis': citation_analysis,
            'analysis_time': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': f'Citation analysis failed: {str(e)}'}), 500

@app.route('/analyze/methodology', methods=['POST'])
def analyze_methodology():
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'error': 'Filename required'}), 400
        
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        text_content = pdf_processor.extract_text(filepath)
        
        methodology_analysis = advanced_processor.extract_methodology(text_content)
        
        return jsonify({
            'filename': filename,
            'methodology_analysis': methodology_analysis,
            'analysis_time': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': f'Methodology analysis failed: {str(e)}'}), 500

@app.route('/search/semantic', methods=['POST'])
def semantic_search():
    try:
        data = request.get_json()
        filename = data.get('filename')
        query = data.get('query')
        
        if not filename or not query:
            return jsonify({'error': 'Filename and query required'}), 400
        
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        text_content = pdf_processor.extract_text(filepath)
        
        search_results = advanced_processor.semantic_search(query, text_content)
        
        return jsonify({
            'filename': filename,
            'query': query,
            'search_results': search_results,
            'search_time': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': f'Semantic search failed: {str(e)}'}), 500

@app.route('/analyze/related-papers', methods=['POST'])
def find_related_papers():
    try:
        data = request.get_json()
        filename = data.get('filename')
        title = data.get('title', filename)
        
        if not filename:
            return jsonify({'error': 'Filename required'}), 400
        
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        text_content = pdf_processor.extract_text(filepath)
        
        related_papers = advanced_processor.find_related_papers(text_content, title)
        
        return jsonify({
            'filename': filename,
            'related_papers': related_papers,
            'analysis_time': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': f'Related papers search failed: {str(e)}'}), 500

@app.route('/analyze/research-gaps', methods=['POST'])
def identify_research_gaps():
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'error': 'Filename required'}), 400
        
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        text_content = pdf_processor.extract_text(filepath)
        
        research_gaps = advanced_processor.identify_research_gaps(text_content)
        
        return jsonify({
            'filename': filename,
            'research_gaps': research_gaps,
            'analysis_time': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': f'Research gap analysis failed: {str(e)}'}), 500

@app.route('/analyze/concept-map', methods=['POST'])
def create_concept_map():
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'error': 'Filename required'}), 400
        
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        text_content = pdf_processor.extract_text(filepath)
        
        concept_map = advanced_processor.create_concept_map(text_content)
        
        return jsonify({
            'filename': filename,
            'concept_map': concept_map,
            'analysis_time': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': f'Concept mapping failed: {str(e)}'}), 500

@app.route('/compare/papers', methods=['POST'])
def compare_papers():
    try:
        data = request.get_json()
        filenames = data.get('filenames', [])
        
        if len(filenames) < 2:
            return jsonify({'error': 'At least 2 files required for comparison'}), 400
        
        comparison_results = []
        
        for filename in filenames[:3]:  # Limit to 3 papers
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            text_content = pdf_processor.extract_text(filepath)
            
            # Get basic analysis for each paper
            summary = pdf_processor.generate_summary(text_content)
            methodology = advanced_processor.extract_methodology(text_content)
            
            comparison_results.append({
                'filename': filename,
                'summary': summary,
                'methodology': methodology,
                'word_count': len(text_content.split())
            })
        
        # Generate comparison insights
        comparison_insights = {
            'papers_compared': len(comparison_results),
            'comparison_matrix': comparison_results,
            'similarities': 'Advanced similarity analysis would go here',
            'differences': 'Key differences analysis would go here'
        }
        
        return jsonify({
            'comparison_results': comparison_insights,
            'analysis_time': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': f'Paper comparison failed: {str(e)}'}), 500

# Keep existing endpoints for backward compatibility
@app.route('/summarize', methods=['POST'])
def summarize():
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'error': 'Filename required'}), 400
        
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        text_content = pdf_processor.extract_text(filepath)
        
        summary_data = pdf_processor.generate_summary(text_content)
        
        return jsonify({
            'filename': filename,
            'short_summary': summary_data.get('short_summary', ''),
            'detailed_summary': summary_data.get('detailed_summary', ''),
            'total_words': len(text_content.split()),
            'summary_time': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': f'Summarization failed: {str(e)}'}), 500

@app.route('/glossary', methods=['POST'])
def generate_glossary():
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'error': 'Filename required'}), 400
        
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        text_content = pdf_processor.extract_text(filepath)
        
        glossary_data = pdf_processor.generate_glossary(text_content)
        
        return jsonify({
            'filename': filename,
            'glossary': glossary_data.get('glossary', []),
            'total_terms': len(glossary_data.get('glossary', [])),
            'generation_time': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': f'Glossary generation failed: {str(e)}'}), 500

@app.route('/flashcards', methods=['POST'])
def generate_flashcards():
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'error': 'Filename required'}), 400
        
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        text_content = pdf_processor.extract_text(filepath)
        
        flashcards_data = pdf_processor.generate_flashcards(text_content)
        
        return jsonify({
            'filename': filename,
            'flashcards': flashcards_data.get('flashcards', []),
            'total_cards': len(flashcards_data.get('flashcards', [])),
            'generation_time': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': f'Flashcard generation failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
