import os
import re
import json
import numpy as np
from typing import Dict, List, Any, Optional
import openai
from sentence_transformers import SentenceTransformer
import spacy
import networkx as nx
from transformers import pipeline
import requests
from scholarly import scholarly
import arxiv
from refextract import extract_references_from_text
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from collections import defaultdict, Counter
import chromadb
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.llms import OpenAI
from langchain.chains import RetrievalQA

class AdvancedPaperProcessor:
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.nlp = spacy.load('en_core_web_sm')
        self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
        self.qa_model = pipeline("question-answering", model="deepset/roberta-base-squad2")
        
        # Initialize vector database
        self.chroma_client = chromadb.Client()
        self.collection = None
        
        # Initialize text splitter for chunking
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        
    def extract_citations(self, text: str) -> Dict[str, Any]:
        """Extract and analyze citations from paper text"""
        try:
            # Extract references using refextract
            references = extract_references_from_text(text)
            
            # Parse citations with regex patterns
            citation_patterns = [
                r'\[(\d+)\]',  # [1], [2], etc.
                r'\(([^)]+\d{4}[^)]*)\)',  # (Author, 2023)
                r'([A-Z][a-z]+ et al\.?, \d{4})',  # Smith et al., 2023
            ]
            
            citations = []
            for pattern in citation_patterns:
                matches = re.findall(pattern, text)
                citations.extend(matches)
            
            # Create citation network
            citation_network = self._build_citation_network(references)
            
            return {
                'total_citations': len(references),
                'references': references[:20],  # Limit for display
                'citation_network': citation_network,
                'most_cited_authors': self._extract_top_authors(references),
                'publication_years': self._extract_years(references),
                'citation_analysis': self._analyze_citations(references)
            }
        except Exception as e:
            return {'error': f'Citation extraction failed: {str(e)}'}
    
    def extract_methodology(self, text: str) -> Dict[str, Any]:
        """Extract and explain research methodology"""
        try:
            # Use GPT to identify methodology sections
            methodology_prompt = f"""
            Analyze the following research paper text and extract the methodology:
            
            1. Research Design (experimental, observational, theoretical, etc.)
            2. Data Collection Methods
            3. Analysis Techniques
            4. Tools and Technologies Used
            5. Sample Size and Population
            6. Variables and Measurements
            
            Text: {text[:4000]}
            
            Provide a structured analysis in JSON format.
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": methodology_prompt}],
                max_tokens=1000
            )
            
            methodology_text = response.choices[0].message.content
            
            # Extract methodology keywords using NLP
            doc = self.nlp(text)
            methodology_keywords = self._extract_methodology_keywords(doc)
            
            return {
                'methodology_analysis': methodology_text,
                'research_methods': methodology_keywords,
                'methodology_confidence': 0.85,
                'extracted_techniques': self._identify_techniques(text)
            }
        except Exception as e:
            return {'error': f'Methodology extraction failed: {str(e)}'}
    
    def semantic_search(self, query: str, paper_text: str) -> Dict[str, Any]:
        """Perform semantic search within the paper"""
        try:
            # Split text into chunks
            chunks = self.text_splitter.split_text(paper_text)
            
            # Create embeddings for chunks
            chunk_embeddings = self.sentence_model.encode(chunks)
            query_embedding = self.sentence_model.encode([query])
            
            # Calculate similarities
            similarities = np.dot(chunk_embeddings, query_embedding.T).flatten()
            
            # Get top matches
            top_indices = np.argsort(similarities)[::-1][:5]
            
            results = []
            for idx in top_indices:
                if similarities[idx] > 0.3:  # Threshold for relevance
                    results.append({
                        'text': chunks[idx],
                        'similarity': float(similarities[idx]),
                        'chunk_index': int(idx)
                    })
            
            return {
                'query': query,
                'results': results,
                'total_chunks_searched': len(chunks)
            }
        except Exception as e:
            return {'error': f'Semantic search failed: {str(e)}'}
    
    def find_related_papers(self, paper_text: str, title: str) -> Dict[str, Any]:
        """Find related papers using arXiv and Semantic Scholar APIs"""
        try:
            # Extract key concepts for search
            key_concepts = self._extract_key_concepts(paper_text)
            
            # Search arXiv
            arxiv_papers = self._search_arxiv(key_concepts[:3])
            
            # Search Semantic Scholar (if API key available)
            semantic_papers = self._search_semantic_scholar(title, key_concepts)
            
            return {
                'related_papers': {
                    'arxiv': arxiv_papers,
                    'semantic_scholar': semantic_papers
                },
                'key_concepts': key_concepts,
                'search_strategy': 'concept_based'
            }
        except Exception as e:
            return {'error': f'Related papers search failed: {str(e)}'}
    
    def identify_research_gaps(self, text: str) -> Dict[str, Any]:
        """Identify potential research gaps and future work"""
        try:
            gap_prompt = f"""
            Analyze this research paper and identify:
            
            1. Limitations mentioned by authors
            2. Potential research gaps
            3. Future work suggestions
            4. Unexplored areas
            5. Methodological improvements needed
            
            Text: {text[:4000]}
            
            Provide specific, actionable research gap identification.
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": gap_prompt}],
                max_tokens=800
            )
            
            gaps_analysis = response.choices[0].message.content
            
            # Extract limitation keywords
            limitation_keywords = self._extract_limitations(text)
            
            return {
                'research_gaps': gaps_analysis,
                'identified_limitations': limitation_keywords,
                'gap_categories': self._categorize_gaps(gaps_analysis),
                'confidence_score': 0.8
            }
        except Exception as e:
            return {'error': f'Research gap identification failed: {str(e)}'}
    
    def create_concept_map(self, text: str) -> Dict[str, Any]:
        """Create a concept map of the paper"""
        try:
            # Extract entities and relationships
            doc = self.nlp(text)
            entities = [(ent.text, ent.label_) for ent in doc.ents]
            
            # Build concept network
            G = nx.Graph()
            
            # Add nodes (concepts)
            concepts = [ent[0] for ent in entities if ent[1] in ['PERSON', 'ORG', 'PRODUCT', 'EVENT']]
            G.add_nodes_from(concepts[:20])  # Limit nodes
            
            # Add edges based on co-occurrence
            for i, concept1 in enumerate(concepts[:20]):
                for concept2 in concepts[i+1:20]:
                    if self._concepts_related(concept1, concept2, text):
                        G.add_edge(concept1, concept2)
            
            # Convert to JSON for frontend
            concept_map = {
                'nodes': [{'id': node, 'label': node} for node in G.nodes()],
                'edges': [{'source': edge[0], 'target': edge[1]} for edge in G.edges()],
                'stats': {
                    'total_concepts': len(G.nodes()),
                    'total_connections': len(G.edges())
                }
            }
            
            return concept_map
        except Exception as e:
            return {'error': f'Concept mapping failed: {str(e)}'}
    
    def _build_citation_network(self, references: List) -> Dict:
        """Build citation network graph"""
        G = nx.DiGraph()
        for ref in references[:10]:  # Limit for performance
            if 'author' in ref and 'title' in ref:
                author = ref.get('author', ['Unknown'])[0] if ref.get('author') else 'Unknown'
                title = ref.get('title', 'Unknown Title')
                G.add_node(author, title=title)
        
        return {
            'nodes': len(G.nodes()),
            'edges': len(G.edges()),
            'network_data': list(G.nodes(data=True))[:10]
        }
    
    def _extract_top_authors(self, references: List) -> List[str]:
        """Extract most cited authors"""
        authors = []
        for ref in references:
            if 'author' in ref and ref['author']:
                authors.extend(ref['author'])
        return [author for author, count in Counter(authors).most_common(5)]
    
    def _extract_years(self, references: List) -> List[int]:
        """Extract publication years from references"""
        years = []
        for ref in references:
            if 'year' in ref and ref['year']:
                try:
                    years.append(int(ref['year']))
                except:
                    pass
        return sorted(years)
    
    def _analyze_citations(self, references: List) -> Dict:
        """Analyze citation patterns"""
        return {
            'avg_citation_age': np.mean([2024 - year for year in self._extract_years(references)]) if references else 0,
            'citation_diversity': len(set([ref.get('journal', 'Unknown') for ref in references])),
            'self_citations': 0  # Would need author matching logic
        }
    
    def _extract_methodology_keywords(self, doc) -> List[str]:
        """Extract methodology-related keywords"""
        method_keywords = []
        method_terms = ['experiment', 'survey', 'analysis', 'model', 'algorithm', 'approach', 'method', 'technique']
        
        for token in doc:
            if token.text.lower() in method_terms and token.pos_ in ['NOUN', 'VERB']:
                method_keywords.append(token.text)
        
        return list(set(method_keywords))
    
    def _identify_techniques(self, text: str) -> List[str]:
        """Identify specific research techniques mentioned"""
        techniques = []
        technique_patterns = [
            r'machine learning', r'deep learning', r'neural network', r'regression',
            r'classification', r'clustering', r'statistical analysis', r'correlation',
            r'ANOVA', r't-test', r'chi-square', r'factor analysis'
        ]
        
        for pattern in technique_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                techniques.append(pattern)
        
        return techniques
    
    def _extract_key_concepts(self, text: str) -> List[str]:
        """Extract key concepts for related paper search"""
        doc = self.nlp(text)
        concepts = []
        
        for chunk in doc.noun_chunks:
            if len(chunk.text.split()) <= 3 and len(chunk.text) > 3:
                concepts.append(chunk.text)
        
        return list(set(concepts))[:10]
    
    def _search_arxiv(self, concepts: List[str]) -> List[Dict]:
        """Search arXiv for related papers"""
        try:
            query = ' AND '.join(concepts[:2])  # Limit query complexity
            search = arxiv.Search(
                query=query,
                max_results=5,
                sort_by=arxiv.SortCriterion.Relevance
            )
            
            papers = []
            for result in search.results():
                papers.append({
                    'title': result.title,
                    'authors': [author.name for author in result.authors],
                    'summary': result.summary[:200] + '...',
                    'url': result.entry_id,
                    'published': result.published.strftime('%Y-%m-%d')
                })
            
            return papers
        except Exception as e:
            return [{'error': f'arXiv search failed: {str(e)}'}]
    
    def _search_semantic_scholar(self, title: str, concepts: List[str]) -> List[Dict]:
        """Search Semantic Scholar for related papers"""
        # Placeholder - would need Semantic Scholar API key
        return [{'note': 'Semantic Scholar integration requires API key'}]
    
    def _extract_limitations(self, text: str) -> List[str]:
        """Extract limitation keywords and phrases"""
        limitation_patterns = [
            r'limitation[s]?', r'constraint[s]?', r'drawback[s]?',
            r'shortcoming[s]?', r'weakness[es]?', r'challenge[s]?'
        ]
        
        limitations = []
        for pattern in limitation_patterns:
            matches = re.findall(f'.{{0,50}}{pattern}.{{0,50}}', text, re.IGNORECASE)
            limitations.extend(matches)
        
        return limitations[:5]
    
    def _categorize_gaps(self, gaps_text: str) -> List[str]:
        """Categorize identified research gaps"""
        categories = []
        if 'methodological' in gaps_text.lower():
            categories.append('Methodological')
        if 'theoretical' in gaps_text.lower():
            categories.append('Theoretical')
        if 'empirical' in gaps_text.lower():
            categories.append('Empirical')
        if 'technological' in gaps_text.lower():
            categories.append('Technological')
        
        return categories or ['General']
    
    def _concepts_related(self, concept1: str, concept2: str, text: str) -> bool:
        """Check if two concepts are related in the text"""
        # Simple co-occurrence check within sentences
        sentences = text.split('.')
        for sentence in sentences:
            if concept1.lower() in sentence.lower() and concept2.lower() in sentence.lower():
                return True
        return False
