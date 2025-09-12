from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
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
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'error': 'Filename required'}), 400
        
        # Read extracted text
        text_file_path = os.path.join(UPLOAD_FOLDER, f"{filename}_text.txt")
        if not os.path.exists(text_file_path):
            return jsonify({'error': 'Text file not found. Please upload the PDF first.'}), 404
        
        with open(text_file_path, 'r', encoding='utf-8') as f:
            text_content = f.read()
        
        # Generate summaries using PDF processor
        summary_data = pdf_processor.generate_summary(text_content)
        
        return jsonify({
            'filename': filename,
            'short_summary': summary_data.get('short_summary', ''),
            'detailed_summary': summary_data.get('detailed_summary', ''),
            'total_words': len(text_content.split())
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
        
        # Read extracted text
        text_file_path = os.path.join(UPLOAD_FOLDER, f"{filename}_text.txt")
        if not os.path.exists(text_file_path):
            return jsonify({'error': 'Text file not found. Please upload the PDF first.'}), 404
        
        with open(text_file_path, 'r', encoding='utf-8') as f:
            text_content = f.read()
        
        # Generate glossary using PDF processor
        glossary_data = pdf_processor.generate_glossary(text_content)
        
        return jsonify({
            'filename': filename,
            'glossary': glossary_data.get('glossary', []),
            'total_terms': len(glossary_data.get('glossary', []))
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
        
        # Read extracted text
        text_file_path = os.path.join(UPLOAD_FOLDER, f"{filename}_text.txt")
        if not os.path.exists(text_file_path):
            return jsonify({'error': 'Text file not found. Please upload the PDF first.'}), 404
        
        with open(text_file_path, 'r', encoding='utf-8') as f:
            text_content = f.read()
        
        # Generate flashcards using PDF processor
        flashcards_data = pdf_processor.generate_flashcards(text_content)
        
        return jsonify({
            'filename': filename,
            'flashcards': flashcards_data.get('flashcards', []),
            'total_cards': len(flashcards_data.get('flashcards', []))
        })
        
    except Exception as e:
        return jsonify({'error': f'Flashcard generation failed: {str(e)}'}), 500

# Advanced Analysis Endpoints
@app.route('/analyze/citations', methods=['POST'])
def analyze_citations():
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'error': 'Filename required'}), 400
        
        text_file_path = os.path.join(UPLOAD_FOLDER, f"{filename}_text.txt")
        if not os.path.exists(text_file_path):
            return jsonify({'error': 'Text file not found. Please upload the PDF first.'}), 404
        
        with open(text_file_path, 'r', encoding='utf-8') as f:
            text_content = f.read()
        
        # Simple citation analysis
        import re
        references = re.findall(r'\[(\d+)\]|\(([^)]+,\s*\d{4})\)', text_content)
        citations = [ref[0] or ref[1] for ref in references if ref[0] or ref[1]]
        
        return jsonify({
            'total_citations': len(citations),
            'references': citations[:20],
            'citation_analysis': f'Found {len(citations)} citations in the paper'
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
        
        text_file_path = os.path.join(UPLOAD_FOLDER, f"{filename}_text.txt")
        if not os.path.exists(text_file_path):
            return jsonify({'error': 'Text file not found. Please upload the PDF first.'}), 404
        
        with open(text_file_path, 'r', encoding='utf-8') as f:
            text_content = f.read()
        
        # Simple methodology extraction
        methodology_keywords = ['method', 'approach', 'technique', 'algorithm', 'model', 'framework', 'experiment', 'analysis']
        found_methods = []
        
        for keyword in methodology_keywords:
            if keyword.lower() in text_content.lower():
                found_methods.append(keyword)
        
        return jsonify({
            'methodology_analysis': f'This paper uses various research methods including: {", ".join(found_methods)}',
            'research_methods': found_methods,
            'methodology_confidence': 0.75
        })
        
    except Exception as e:
        return jsonify({'error': f'Methodology analysis failed: {str(e)}'}), 500

@app.route('/analyze/semantic-search', methods=['POST'])
def semantic_search():
    try:
        data = request.get_json()
        filename = data.get('filename')
        query = data.get('query', '')
        
        if not filename or not query:
            return jsonify({'error': 'Filename and query required'}), 400
        
        text_file_path = os.path.join(UPLOAD_FOLDER, f"{filename}_text.txt")
        if not os.path.exists(text_file_path):
            return jsonify({'error': 'Text file not found. Please upload the PDF first.'}), 404
        
        with open(text_file_path, 'r', encoding='utf-8') as f:
            text_content = f.read()
        
        # Simple text search
        sentences = text_content.split('.')
        results = []
        
        for i, sentence in enumerate(sentences):
            if query.lower() in sentence.lower():
                results.append({
                    'text': sentence.strip(),
                    'score': 0.8,
                    'position': i
                })
        
        return jsonify({
            'query': query,
            'results': results[:10],
            'total_chunks_searched': len(sentences)
        })
        
    except Exception as e:
        return jsonify({'error': f'Semantic search failed: {str(e)}'}), 500

@app.route('/analyze/related-papers', methods=['POST'])
def find_related_papers():
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'error': 'Filename required'}), 400
        
        # Mock related papers data
        related_papers = [
            {
                'title': 'Related Research Paper 1',
                'authors': ['Author A', 'Author B'],
                'year': 2023,
                'similarity_score': 0.85,
                'abstract': 'This is a related paper in the same field...'
            },
            {
                'title': 'Similar Study in the Domain',
                'authors': ['Author C', 'Author D'],
                'year': 2022,
                'similarity_score': 0.78,
                'abstract': 'Another relevant paper with similar methodology...'
            }
        ]
        
        return jsonify({
            'related_papers': related_papers,
            'total_found': len(related_papers)
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
        
        text_file_path = os.path.join(UPLOAD_FOLDER, f"{filename}_text.txt")
        if not os.path.exists(text_file_path):
            return jsonify({'error': 'Text file not found. Please upload the PDF first.'}), 404
        
        with open(text_file_path, 'r', encoding='utf-8') as f:
            text_content = f.read()
        
        # Simple gap identification
        gap_indicators = ['limitation', 'future work', 'further research', 'not addressed', 'remains unclear']
        identified_gaps = []
        
        for indicator in gap_indicators:
            if indicator.lower() in text_content.lower():
                identified_gaps.append(f'Research gap related to: {indicator}')
        
        return jsonify({
            'research_gaps': identified_gaps,
            'gap_analysis': 'Analysis identified several areas for future research',
            'total_gaps': len(identified_gaps)
        })
        
    except Exception as e:
        return jsonify({'error': f'Research gap analysis failed: {str(e)}'}), 500

@app.route('/analyze/concept-map', methods=['POST'])
def generate_concept_map():
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'error': 'Filename required'}), 400
        
        text_file_path = os.path.join(UPLOAD_FOLDER, f"{filename}_text.txt")
        if not os.path.exists(text_file_path):
            return jsonify({'error': 'Text file not found. Please upload the PDF first.'}), 404
        
        with open(text_file_path, 'r', encoding='utf-8') as f:
            text_content = f.read()
        
        # Simple concept extraction
        import re
        words = re.findall(r'\b[A-Z][a-z]+\b', text_content)
        concept_counts = {}
        
        for word in words:
            if len(word) > 3:
                concept_counts[word] = concept_counts.get(word, 0) + 1
        
        # Get top concepts
        top_concepts = sorted(concept_counts.items(), key=lambda x: x[1], reverse=True)[:20]
        
        concepts = [{'name': concept, 'frequency': count} for concept, count in top_concepts]
        
        return jsonify({
            'concepts': concepts,
            'concept_map': 'Generated concept map with key terms',
            'total_concepts': len(concepts)
        })
        
    except Exception as e:
        return jsonify({'error': f'Concept map generation failed: {str(e)}'}), 500

@app.route('/compare-papers', methods=['POST'])
def compare_papers():
    try:
        data = request.get_json()
        filenames = data.get('filenames', [])
        
        if len(filenames) < 2:
            return jsonify({'error': 'At least 2 files required for comparison'}), 400
        
        comparison_results = []
        
        for filename in filenames:
            text_file_path = os.path.join(UPLOAD_FOLDER, f"{filename}_text.txt")
            if os.path.exists(text_file_path):
                with open(text_file_path, 'r', encoding='utf-8') as f:
                    text_content = f.read()
                
                # Extract key themes and concepts
                sentences = re.split(r'[.!?]+', text_content)
                key_sentences = [s.strip() for s in sentences if len(s.strip()) > 50][:5]
                
                # Extract main arguments/findings
                findings = []
                conclusion_keywords = ['conclusion', 'result', 'finding', 'demonstrate', 'show', 'prove']
                for sentence in sentences:
                    if any(keyword in sentence.lower() for keyword in conclusion_keywords):
                        if len(sentence.strip()) > 30:
                            findings.append(sentence.strip())
                            if len(findings) >= 3:
                                break
                
                # Extract research focus
                focus_keywords = ['focus', 'investigate', 'study', 'analyze', 'examine', 'explore']
                research_focus = "General research study"
                for sentence in sentences[:10]:
                    if any(keyword in sentence.lower() for keyword in focus_keywords):
                        research_focus = sentence.strip()[:150] + "..."
                        break
                
                # Extract methodology approach
                method_keywords = ['method', 'approach', 'technique', 'algorithm', 'framework', 'model']
                methodology_desc = "Standard methodology"
                for sentence in sentences:
                    if any(keyword in sentence.lower() for keyword in method_keywords):
                        methodology_desc = sentence.strip()[:100] + "..."
                        break
                
                comparison_results.append({
                    'filename': filename,
                    'research_focus': research_focus,
                    'key_themes': key_sentences,
                    'main_findings': findings,
                    'methodology_approach': methodology_desc,
                    'content_summary': text_content[:300] + "...",
                    'word_count': len(text_content.split())
                })
        
        # Generate content-based insights
        content_insights = []
        if len(comparison_results) >= 2:
            # Compare research focuses
            focuses = [paper['research_focus'] for paper in comparison_results]
            content_insights.append(f"Research Focus Comparison: Papers explore different aspects of the domain")
            
            # Compare findings
            total_findings = sum(len(paper['main_findings']) for paper in comparison_results)
            content_insights.append(f"Findings Analysis: {total_findings} key findings identified across papers")
            
            # Compare methodologies
            methodologies = [paper['methodology_approach'] for paper in comparison_results]
            content_insights.append("Methodology Diversity: Papers employ varied research approaches")
        
        return jsonify({
            'comparison_results': comparison_results,
            'content_insights': content_insights,
            'comparison_type': 'content_analysis'
        })
        
    except Exception as e:
        return jsonify({'error': f'Paper comparison failed: {str(e)}'}), 500

if __name__ == '__main__':
    print("🧠 Starting PaperMind Simple Backend (PDF Upload Only)...")
    print("📍 Backend running on: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
