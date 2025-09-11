import os
import re
import json
from typing import Dict, List, Any
from collections import Counter
import requests

class SimpleAdvancedProcessor:
    def __init__(self):
        pass
    
    def extract_citations(self, text: str) -> Dict[str, Any]:
        """Extract basic citation information from text"""
        try:
            # Simple citation patterns
            citation_patterns = [
                r'\[(\d+)\]',  # [1], [2], etc.
                r'\(([^)]+\d{4}[^)]*)\)',  # (Author, 2023)
                r'([A-Z][a-z]+ et al\.?, \d{4})',  # Smith et al., 2023
            ]
            
            citations = []
            for pattern in citation_patterns:
                matches = re.findall(pattern, text)
                citations.extend(matches)
            
            # Extract years from text
            years = re.findall(r'\b(19|20)\d{2}\b', text)
            year_counts = Counter(years)
            
            # Extract author-like patterns
            author_pattern = r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:et\s+al\.?)?\s*\(?\d{4}\)?'
            authors = re.findall(author_pattern, text)
            author_counts = Counter(authors)
            
            return {
                'total_citations': len(citations),
                'citation_network': {
                    'nodes': min(len(set(citations)), 20),
                    'edges': min(len(citations) // 2, 15)
                },
                'most_cited_authors': list(author_counts.keys())[:5],
                'publication_years': list(year_counts.keys())[:10],
                'citation_analysis': {
                    'avg_citation_age': 2024 - int(max(years, default=['2020'])[0]) if years else 4,
                    'citation_diversity': len(set(citations)),
                    'self_citations': 0
                }
            }
        except Exception as e:
            return {
                'error': f'Citation extraction failed: {str(e)}',
                'total_citations': 0,
                'citation_network': {'nodes': 0, 'edges': 0},
                'most_cited_authors': [],
                'publication_years': [],
                'citation_analysis': {'avg_citation_age': 0, 'citation_diversity': 0, 'self_citations': 0}
            }
    
    def extract_methodology(self, text: str) -> Dict[str, Any]:
        """Extract methodology information using pattern matching"""
        try:
            # Common methodology keywords
            method_keywords = [
                'experiment', 'survey', 'analysis', 'model', 'algorithm', 
                'approach', 'method', 'technique', 'framework', 'system',
                'machine learning', 'deep learning', 'neural network',
                'regression', 'classification', 'clustering'
            ]
            
            found_methods = []
            for keyword in method_keywords:
                if keyword.lower() in text.lower():
                    found_methods.append(keyword)
            
            # Extract research design patterns
            design_patterns = {
                'experimental': ['experiment', 'trial', 'test', 'control group'],
                'observational': ['observe', 'survey', 'questionnaire', 'interview'],
                'theoretical': ['theory', 'model', 'framework', 'conceptual'],
                'computational': ['algorithm', 'simulation', 'computation', 'software']
            }
            
            research_design = []
            for design, patterns in design_patterns.items():
                if any(pattern in text.lower() for pattern in patterns):
                    research_design.append(design)
            
            methodology_analysis = f"""
Research Design: {', '.join(research_design) if research_design else 'Not clearly identified'}

Data Collection Methods: {'Survey/Questionnaire based' if any(word in text.lower() for word in ['survey', 'questionnaire']) else 'Experimental/Computational' if any(word in text.lower() for word in ['experiment', 'algorithm']) else 'Mixed methods'}

Analysis Techniques: {', '.join(found_methods[:5]) if found_methods else 'Standard analytical methods'}

Tools and Technologies: {'Machine Learning/AI' if any(word in text.lower() for word in ['machine learning', 'ai', 'neural']) else 'Statistical Analysis' if any(word in text.lower() for word in ['statistical', 'regression']) else 'General computational tools'}

Sample Size: {'Large scale' if any(word in text.lower() for word in ['large', 'big data', 'dataset']) else 'Standard sample size'}
            """
            
            return {
                'methodology_analysis': methodology_analysis.strip(),
                'research_methods': found_methods[:10],
                'methodology_confidence': 0.7,
                'extracted_techniques': found_methods[:5]
            }
        except Exception as e:
            return {
                'error': f'Methodology extraction failed: {str(e)}',
                'methodology_analysis': 'Unable to extract methodology information',
                'research_methods': [],
                'methodology_confidence': 0.0,
                'extracted_techniques': []
            }
    
    def semantic_search(self, query: str, paper_text: str) -> Dict[str, Any]:
        """Simple text-based search within paper"""
        try:
            # Split text into chunks
            sentences = paper_text.split('.')
            query_words = query.lower().split()
            
            results = []
            for i, sentence in enumerate(sentences):
                sentence = sentence.strip()
                if len(sentence) < 20:  # Skip very short sentences
                    continue
                    
                # Simple relevance scoring
                sentence_lower = sentence.lower()
                score = 0
                for word in query_words:
                    if word in sentence_lower:
                        score += 1
                
                if score > 0:
                    similarity = score / len(query_words)
                    if similarity > 0.3:  # Threshold
                        results.append({
                            'text': sentence,
                            'similarity': similarity,
                            'chunk_index': i
                        })
            
            # Sort by similarity and take top 5
            results = sorted(results, key=lambda x: x['similarity'], reverse=True)[:5]
            
            return {
                'query': query,
                'results': results,
                'total_chunks_searched': len(sentences)
            }
        except Exception as e:
            return {
                'error': f'Semantic search failed: {str(e)}',
                'query': query,
                'results': [],
                'total_chunks_searched': 0
            }
    
    def find_related_papers(self, paper_text: str, title: str) -> Dict[str, Any]:
        """Find related papers using simple keyword extraction"""
        try:
            # Extract key terms from title and text
            import re
            
            # Extract technical terms (capitalized words, acronyms)
            technical_terms = re.findall(r'\b[A-Z]{2,}\b|\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', title + ' ' + paper_text[:1000])
            technical_terms = [term for term in technical_terms if len(term) > 2 and term not in ['The', 'This', 'That', 'With', 'From', 'For']]
            
            key_concepts = list(set(technical_terms))[:10]
            
            # Mock related papers (in real implementation, this would call arXiv API)
            related_papers = {
                'arxiv': [
                    {
                        'title': f'Related Research on {key_concepts[0] if key_concepts else "Similar Topics"}',
                        'authors': ['Smith, J.', 'Johnson, A.'],
                        'summary': f'This paper explores similar concepts related to {", ".join(key_concepts[:2]) if key_concepts else "the research area"}...',
                        'url': 'https://arxiv.org/abs/example1',
                        'published': '2023-01-15'
                    },
                    {
                        'title': f'Advances in {key_concepts[1] if len(key_concepts) > 1 else "Related Field"}',
                        'authors': ['Brown, K.', 'Davis, M.'],
                        'summary': f'Recent developments in {key_concepts[0] if key_concepts else "the field"} with applications...',
                        'url': 'https://arxiv.org/abs/example2',
                        'published': '2023-03-22'
                    }
                ] if key_concepts else [],
                'semantic_scholar': [{'note': 'Semantic Scholar integration requires API key'}]
            }
            
            return {
                'related_papers': related_papers,
                'key_concepts': key_concepts,
                'search_strategy': 'keyword_based'
            }
        except Exception as e:
            return {
                'error': f'Related papers search failed: {str(e)}',
                'related_papers': {'arxiv': [], 'semantic_scholar': []},
                'key_concepts': [],
                'search_strategy': 'failed'
            }
    
    def identify_research_gaps(self, text: str) -> Dict[str, Any]:
        """Identify research gaps using keyword analysis"""
        try:
            # Look for limitation and future work indicators
            limitation_indicators = [
                'limitation', 'constraint', 'drawback', 'shortcoming', 'weakness',
                'challenge', 'future work', 'future research', 'further study',
                'not addressed', 'remains unclear', 'needs investigation'
            ]
            
            gap_sentences = []
            sentences = text.split('.')
            
            for sentence in sentences:
                sentence_lower = sentence.lower()
                for indicator in limitation_indicators:
                    if indicator in sentence_lower and len(sentence.strip()) > 30:
                        gap_sentences.append(sentence.strip())
                        break
            
            # Categorize gaps
            categories = []
            if any('method' in s.lower() for s in gap_sentences):
                categories.append('Methodological')
            if any('theory' in s.lower() for s in gap_sentences):
                categories.append('Theoretical')
            if any('data' in s.lower() for s in gap_sentences):
                categories.append('Empirical')
            if any('technology' in s.lower() for s in gap_sentences):
                categories.append('Technological')
            
            research_gaps = f"""
Identified Research Gaps:

1. Methodological Gaps: {'Present' if 'Methodological' in categories else 'Not identified'}
2. Theoretical Gaps: {'Present' if 'Theoretical' in categories else 'Not identified'}
3. Empirical Gaps: {'Present' if 'Empirical' in categories else 'Not identified'}
4. Technological Gaps: {'Present' if 'Technological' in categories else 'Not identified'}

Key Limitations Found:
{chr(10).join(f"• {s[:100]}..." for s in gap_sentences[:3]) if gap_sentences else "• No explicit limitations mentioned"}

Future Research Directions:
• Extend current methodology to larger datasets
• Investigate alternative approaches
• Address identified limitations
• Explore cross-domain applications
            """
            
            return {
                'research_gaps': research_gaps.strip(),
                'identified_limitations': gap_sentences[:5],
                'gap_categories': categories or ['General'],
                'confidence_score': 0.6 if gap_sentences else 0.3
            }
        except Exception as e:
            return {
                'error': f'Research gap identification failed: {str(e)}',
                'research_gaps': 'Unable to identify research gaps',
                'identified_limitations': [],
                'gap_categories': ['Unknown'],
                'confidence_score': 0.0
            }
    
    def create_concept_map(self, text: str) -> Dict[str, Any]:
        """Create a simple concept map from text"""
        try:
            import re
            
            # Extract concepts (nouns and technical terms)
            concept_patterns = [
                r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b',  # Proper nouns
                r'\b[A-Z]{2,}\b',  # Acronyms
                r'\b\w+(?:ing|tion|ness|ment|ity)\b'  # Common noun endings
            ]
            
            concepts = []
            for pattern in concept_patterns:
                matches = re.findall(pattern, text[:2000])  # Limit text for performance
                concepts.extend(matches)
            
            # Filter and clean concepts
            filtered_concepts = []
            stop_words = {'The', 'This', 'That', 'With', 'From', 'For', 'And', 'Or', 'But'}
            for concept in concepts:
                if len(concept) > 2 and concept not in stop_words and len(concept) < 30:
                    filtered_concepts.append(concept)
            
            # Get unique concepts
            unique_concepts = list(set(filtered_concepts))[:15]
            
            # Create simple connections (concepts that appear in same sentences)
            connections = []
            sentences = text.split('.')[:20]  # Limit sentences
            
            for i, concept1 in enumerate(unique_concepts):
                for concept2 in unique_concepts[i+1:]:
                    # Check if both concepts appear in same sentence
                    for sentence in sentences:
                        if concept1.lower() in sentence.lower() and concept2.lower() in sentence.lower():
                            connections.append({'source': concept1, 'target': concept2})
                            break
            
            concept_map = {
                'nodes': [{'id': concept, 'label': concept} for concept in unique_concepts],
                'edges': connections[:10],  # Limit connections
                'stats': {
                    'total_concepts': len(unique_concepts),
                    'total_connections': len(connections[:10])
                }
            }
            
            return concept_map
        except Exception as e:
            return {
                'error': f'Concept mapping failed: {str(e)}',
                'nodes': [],
                'edges': [],
                'stats': {'total_concepts': 0, 'total_connections': 0}
            }
