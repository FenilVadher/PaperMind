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
