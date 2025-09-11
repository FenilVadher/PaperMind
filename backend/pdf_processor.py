import fitz  # PyMuPDF
import pdfplumber
import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class PDFProcessor:
    """Handles PDF text extraction using multiple methods for robustness"""
    
    def __init__(self):
        self.min_text_length = 100
    
    def extract_text(self, pdf_path: str) -> Optional[str]:
        """
        Extract text from PDF using multiple methods for best results
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Extracted text or None if extraction fails
        """
        try:
            # Try PyMuPDF first (faster and handles most PDFs well)
            text = self._extract_with_pymupdf(pdf_path)
            
            if text and len(text.strip()) >= self.min_text_length:
                logger.info(f"Successfully extracted text using PyMuPDF: {len(text)} characters")
                return self._clean_text(text)
            
            # Fallback to pdfplumber (better for complex layouts)
            logger.info("PyMuPDF extraction insufficient, trying pdfplumber...")
            text = self._extract_with_pdfplumber(pdf_path)
            
            if text and len(text.strip()) >= self.min_text_length:
                logger.info(f"Successfully extracted text using pdfplumber: {len(text)} characters")
                return self._clean_text(text)
            
            logger.warning("Both extraction methods failed to get sufficient text")
            return None
            
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            return None
    
    def _extract_with_pymupdf(self, pdf_path: str) -> Optional[str]:
        """Extract text using PyMuPDF"""
        try:
            doc = fitz.open(pdf_path)
            text = ""
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                page_text = page.get_text()
                text += page_text + "\n\n"
            
            doc.close()
            return text
            
        except Exception as e:
            logger.error(f"PyMuPDF extraction failed: {str(e)}")
            return None
    
    def _extract_with_pdfplumber(self, pdf_path: str) -> Optional[str]:
        """Extract text using pdfplumber"""
        try:
            text = ""
            
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n\n"
            
            return text
            
        except Exception as e:
            logger.error(f"pdfplumber extraction failed: {str(e)}")
            return None
    
    def _clean_text(self, text: str) -> str:
        """
        Clean and normalize extracted text
        
        Args:
            text: Raw extracted text
            
        Returns:
            Cleaned text
        """
        if not text:
            return ""
        
        # Remove excessive whitespace
        text = re.sub(r'\n\s*\n', '\n\n', text)
        text = re.sub(r' +', ' ', text)
        
        # Remove page numbers and headers/footers (common patterns)
        text = re.sub(r'\n\d+\n', '\n', text)
        text = re.sub(r'\nPage \d+\n', '\n', text)
        
        # Remove URLs and email addresses for cleaner processing
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        text = re.sub(r'\S+@\S+\.\S+', '', text)
        
        # Remove excessive punctuation
        text = re.sub(r'[.]{3,}', '...', text)
        text = re.sub(r'[-]{3,}', '---', text)
        
        # Normalize quotes
        text = re.sub(r'["""]', '"', text)
        text = re.sub(r"[''']", "'", text)
        
        # Remove control characters
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x84\x86-\x9f]', '', text)
        
        return text.strip()
    
    def extract_metadata(self, pdf_path: str) -> dict:
        """
        Extract PDF metadata
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Dictionary containing metadata
        """
        try:
            doc = fitz.open(pdf_path)
            metadata = doc.metadata
            
            result = {
                'title': metadata.get('title', ''),
                'author': metadata.get('author', ''),
                'subject': metadata.get('subject', ''),
                'creator': metadata.get('creator', ''),
                'producer': metadata.get('producer', ''),
                'creation_date': metadata.get('creationDate', ''),
                'modification_date': metadata.get('modDate', ''),
                'page_count': len(doc),
                'encrypted': doc.needs_pass
            }
            
            doc.close()
            return result
            
        except Exception as e:
            logger.error(f"Error extracting metadata: {str(e)}")
            return {}
    
    def get_page_count(self, pdf_path: str) -> int:
        """Get number of pages in PDF"""
        try:
            doc = fitz.open(pdf_path)
            page_count = len(doc)
            doc.close()
            return page_count
        except Exception as e:
            logger.error(f"Error getting page count: {str(e)}")
            return 0
    
    def generate_summary(self, text: str) -> dict:
        """
        Generate summary from text using simple extraction methods
        
        Args:
            text: Input text to summarize
            
        Returns:
            Dictionary containing short and detailed summaries
        """
        try:
            # Split text into sentences
            sentences = re.split(r'[.!?]+', text)
            sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
            
            # Extract first few sentences as short summary
            short_summary = '. '.join(sentences[:3]) + '.' if len(sentences) >= 3 else text[:300]
            
            # Extract more sentences for detailed summary
            detailed_summary = '. '.join(sentences[:8]) + '.' if len(sentences) >= 8 else text[:800]
            
            return {
                'short_summary': short_summary,
                'detailed_summary': detailed_summary,
                'total_sentences': len(sentences)
            }
            
        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            return {
                'short_summary': 'Unable to generate summary',
                'detailed_summary': 'Unable to generate detailed summary',
                'total_sentences': 0
            }
    
    def generate_glossary(self, text: str) -> dict:
        """
        Generate glossary from text using keyword extraction
        
        Args:
            text: Input text to extract terms from
            
        Returns:
            Dictionary containing glossary terms
        """
        try:
            # Extract potential technical terms (capitalized words, acronyms)
            terms = re.findall(r'\b[A-Z][A-Za-z]{2,}\b|\b[A-Z]{2,}\b', text)
            
            # Count frequency and filter
            term_counts = {}
            for term in terms:
                if len(term) > 2 and term not in ['The', 'This', 'That', 'And', 'But', 'For']:
                    term_counts[term] = term_counts.get(term, 0) + 1
            
            # Get top terms and create glossary
            top_terms = sorted(term_counts.items(), key=lambda x: x[1], reverse=True)[:20]
            
            glossary = []
            for term, count in top_terms:
                # Find context sentence for definition
                pattern = rf'\b{re.escape(term)}\b[^.]*\.'
                match = re.search(pattern, text, re.IGNORECASE)
                definition = match.group(0) if match else f"Technical term appearing {count} times in the document"
                
                glossary.append({
                    'term': term,
                    'definition': definition[:200] + '...' if len(definition) > 200 else definition,
                    'frequency': count
                })
            
            return {
                'glossary': glossary,
                'total_terms': len(glossary)
            }
            
        except Exception as e:
            logger.error(f"Error generating glossary: {str(e)}")
            return {
                'glossary': [],
                'total_terms': 0
            }
    
    def generate_flashcards(self, text: str) -> dict:
        """
        Generate flashcards from text using question-answer extraction
        
        Args:
            text: Input text to create flashcards from
            
        Returns:
            Dictionary containing flashcards
        """
        try:
            # Extract sentences that could be questions/answers
            sentences = re.split(r'[.!?]+', text)
            sentences = [s.strip() for s in sentences if len(s.strip()) > 30]
            
            flashcards = []
            
            # Create flashcards from key sentences
            for i, sentence in enumerate(sentences[:15]):  # Limit to 15 cards
                if any(keyword in sentence.lower() for keyword in ['define', 'method', 'approach', 'result', 'conclusion']):
                    # Create question from sentence
                    question = f"What is mentioned about: {sentence[:50]}...?"
                    answer = sentence
                    
                    flashcards.append({
                        'id': i + 1,
                        'question': question,
                        'answer': answer
                    })
            
            # If no keyword-based cards, create from first sentences
            if len(flashcards) < 5:
                for i, sentence in enumerate(sentences[:10]):
                    words = sentence.split()
                    if len(words) > 5:
                        # Create fill-in-the-blank style question
                        key_word = words[len(words)//2]  # Take middle word
                        question_text = sentence.replace(key_word, '____', 1)
                        
                        flashcards.append({
                            'id': len(flashcards) + 1,
                            'question': f"Fill in the blank: {question_text}",
                            'answer': key_word
                        })
            
            return {
                'flashcards': flashcards[:10],  # Limit to 10 cards
                'total_cards': len(flashcards[:10])
            }
            
        except Exception as e:
            logger.error(f"Error generating flashcards: {str(e)}")
            return {
                'flashcards': [],
                'total_cards': 0
            }
