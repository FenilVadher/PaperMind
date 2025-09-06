import torch
from transformers import (
    T5ForConditionalGeneration, T5Tokenizer,
    BartForConditionalGeneration, BartTokenizer,
    pipeline
)
import re
import logging
from typing import List, Dict, Any
import json

logger = logging.getLogger(__name__)

class AIModels:
    """Handles all AI model operations for summarization, glossary, and Q&A generation"""
    
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {self.device}")
        
        # Initialize models
        self._load_models()
    
    def _load_models(self):
        """Load and initialize all required models"""
        try:
            # Load T5 for summarization
            logger.info("Loading T5 model for summarization...")
            self.t5_tokenizer = T5Tokenizer.from_pretrained("t5-small")
            self.t5_model = T5ForConditionalGeneration.from_pretrained("t5-small")
            self.t5_model.to(self.device)
            
            # Load BART for detailed summarization
            logger.info("Loading BART model for detailed summarization...")
            self.bart_tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")
            self.bart_model = BartForConditionalGeneration.from_pretrained("facebook/bart-large-cnn")
            self.bart_model.to(self.device)
            
            # Load Flan-T5 for glossary generation
            logger.info("Loading Flan-T5 model for glossary...")
            self.flan_t5_pipeline = pipeline(
                "text2text-generation",
                model="google/flan-t5-base",
                device=0 if torch.cuda.is_available() else -1
            )
            
            logger.info("All models loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            raise
    
    def generate_short_summary(self, text: str, max_length: int = 150) -> str:
        """
        Generate a short summary using T5
        
        Args:
            text: Input text to summarize
            max_length: Maximum length of summary
            
        Returns:
            Short summary string
        """
        try:
            # Truncate text if too long
            max_input_length = 512
            if len(text.split()) > max_input_length:
                text = ' '.join(text.split()[:max_input_length])
            
            # Prepare input
            input_text = f"summarize: {text}"
            inputs = self.t5_tokenizer.encode(input_text, return_tensors="pt", max_length=512, truncation=True)
            inputs = inputs.to(self.device)
            
            # Generate summary
            with torch.no_grad():
                outputs = self.t5_model.generate(
                    inputs,
                    max_length=max_length,
                    min_length=50,
                    length_penalty=2.0,
                    num_beams=4,
                    early_stopping=True
                )
            
            summary = self.t5_tokenizer.decode(outputs[0], skip_special_tokens=True)
            return summary.strip()
            
        except Exception as e:
            logger.error(f"Error generating short summary: {str(e)}")
            return "Error generating summary. Please try again."
    
    def generate_detailed_summary(self, text: str, max_length: int = 400) -> str:
        """
        Generate a detailed summary using BART
        
        Args:
            text: Input text to summarize
            max_length: Maximum length of summary
            
        Returns:
            Detailed summary string
        """
        try:
            # Truncate text if too long
            max_input_length = 1024
            if len(text.split()) > max_input_length:
                text = ' '.join(text.split()[:max_input_length])
            
            # Prepare input
            inputs = self.bart_tokenizer.encode(text, return_tensors="pt", max_length=1024, truncation=True)
            inputs = inputs.to(self.device)
            
            # Generate summary
            with torch.no_grad():
                outputs = self.bart_model.generate(
                    inputs,
                    max_length=max_length,
                    min_length=150,
                    length_penalty=2.0,
                    num_beams=4,
                    early_stopping=True
                )
            
            summary = self.bart_tokenizer.decode(outputs[0], skip_special_tokens=True)
            return summary.strip()
            
        except Exception as e:
            logger.error(f"Error generating detailed summary: {str(e)}")
            return "Error generating detailed summary. Please try again."
    
    def generate_glossary(self, text: str, max_terms: int = 15) -> List[Dict[str, str]]:
        """
        Generate glossary of technical terms using Flan-T5
        
        Args:
            text: Input text to extract terms from
            max_terms: Maximum number of terms to extract
            
        Returns:
            List of dictionaries with term and definition
        """
        try:
            # Extract potential technical terms using regex
            technical_terms = self._extract_technical_terms(text)
            
            glossary = []
            for term in technical_terms[:max_terms]:
                try:
                    # Generate definition using Flan-T5
                    prompt = f"Define the technical term '{term}' in simple language for a general audience:"
                    
                    response = self.flan_t5_pipeline(
                        prompt,
                        max_length=100,
                        min_length=20,
                        do_sample=True,
                        temperature=0.7
                    )
                    
                    definition = response[0]['generated_text'].strip()
                    
                    # Clean up the definition
                    definition = self._clean_definition(definition, term)
                    
                    if definition and len(definition) > 10:
                        glossary.append({
                            'term': term,
                            'definition': definition
                        })
                        
                except Exception as e:
                    logger.warning(f"Error generating definition for term '{term}': {str(e)}")
                    continue
            
            return glossary
            
        except Exception as e:
            logger.error(f"Error generating glossary: {str(e)}")
            return []
    
    def generate_flashcards(self, text: str, num_cards: int = 8) -> List[Dict[str, Any]]:
        """
        Generate Q&A flashcards using Flan-T5
        
        Args:
            text: Input text to generate questions from
            num_cards: Number of flashcards to generate
            
        Returns:
            List of flashcard dictionaries
        """
        try:
            # Split text into chunks for better question generation
            chunks = self._split_text_into_chunks(text, chunk_size=300)
            
            flashcards = []
            questions_generated = 0
            
            for chunk in chunks:
                if questions_generated >= num_cards:
                    break
                
                try:
                    # Generate question
                    question_prompt = f"Generate a clear question about this text: {chunk}"
                    question_response = self.flan_t5_pipeline(
                        question_prompt,
                        max_length=80,
                        min_length=10,
                        do_sample=True,
                        temperature=0.8
                    )
                    
                    question = question_response[0]['generated_text'].strip()
                    
                    # Generate answer
                    answer_prompt = f"Answer this question based on the text: {question}\n\nText: {chunk}"
                    answer_response = self.flan_t5_pipeline(
                        answer_prompt,
                        max_length=150,
                        min_length=20,
                        do_sample=True,
                        temperature=0.7
                    )
                    
                    answer = answer_response[0]['generated_text'].strip()
                    
                    # Clean up question and answer
                    question = self._clean_question(question)
                    answer = self._clean_answer(answer)
                    
                    if question and answer and len(question) > 5 and len(answer) > 10:
                        flashcards.append({
                            'id': questions_generated + 1,
                            'question': question,
                            'answer': answer,
                            'type': 'short_answer'
                        })
                        questions_generated += 1
                        
                except Exception as e:
                    logger.warning(f"Error generating flashcard: {str(e)}")
                    continue
            
            return flashcards
            
        except Exception as e:
            logger.error(f"Error generating flashcards: {str(e)}")
            return []
    
    def _extract_technical_terms(self, text: str) -> List[str]:
        """Extract potential technical terms from text"""
        # Pattern for technical terms (capitalized words, acronyms, etc.)
        patterns = [
            r'\b[A-Z]{2,}\b',  # Acronyms
            r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b',  # Capitalized phrases
            r'\b\w*[Aa]lgorithm\w*\b',  # Algorithm-related terms
            r'\b\w*[Mm]odel\w*\b',  # Model-related terms
            r'\b\w*[Nn]etwork\w*\b',  # Network-related terms
            r'\b\w*[Ll]earning\w*\b',  # Learning-related terms
        ]
        
        terms = set()
        for pattern in patterns:
            matches = re.findall(pattern, text)
            terms.update(matches)
        
        # Filter out common words and short terms
        filtered_terms = []
        common_words = {'The', 'This', 'That', 'And', 'Or', 'But', 'In', 'On', 'At', 'To', 'For', 'Of', 'With', 'By'}
        
        for term in terms:
            if (len(term) > 2 and 
                term not in common_words and 
                not term.isdigit() and
                len(term) < 30):
                filtered_terms.append(term)
        
        return list(set(filtered_terms))[:20]  # Return unique terms, max 20
    
    def _clean_definition(self, definition: str, term: str) -> str:
        """Clean up generated definition"""
        # Remove the term from the beginning if it's repeated
        if definition.lower().startswith(term.lower()):
            definition = definition[len(term):].strip()
            if definition.startswith(':') or definition.startswith('is'):
                definition = definition[1:].strip()
        
        # Ensure it starts with a capital letter
        if definition and definition[0].islower():
            definition = definition[0].upper() + definition[1:]
        
        # Remove incomplete sentences at the end
        sentences = definition.split('.')
        if len(sentences) > 1 and len(sentences[-1].strip()) < 10:
            definition = '.'.join(sentences[:-1]) + '.'
        
        return definition.strip()
    
    def _clean_question(self, question: str) -> str:
        """Clean up generated question"""
        question = question.strip()
        
        # Ensure it ends with a question mark
        if not question.endswith('?'):
            question += '?'
        
        # Ensure it starts with a capital letter
        if question and question[0].islower():
            question = question[0].upper() + question[1:]
        
        return question
    
    def _clean_answer(self, answer: str) -> str:
        """Clean up generated answer"""
        answer = answer.strip()
        
        # Ensure it starts with a capital letter
        if answer and answer[0].islower():
            answer = answer[0].upper() + answer[1:]
        
        # Ensure it ends with proper punctuation
        if answer and not answer[-1] in '.!?':
            answer += '.'
        
        return answer
    
    def _split_text_into_chunks(self, text: str, chunk_size: int = 300) -> List[str]:
        """Split text into smaller chunks for processing"""
        words = text.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size):
            chunk = ' '.join(words[i:i + chunk_size])
            if len(chunk.strip()) > 50:  # Only include substantial chunks
                chunks.append(chunk)
        
        return chunks[:10]  # Limit to 10 chunks for performance
