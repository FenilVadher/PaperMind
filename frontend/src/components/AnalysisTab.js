import React, { useState } from 'react';
import { Search, Network, GitBranch, Lightbulb, BookOpen, Target, RefreshCw, AlertCircle, Download, Share2 } from 'lucide-react';
import { apiService } from '../services/api';

const AnalysisTab = ({ filename }) => {
  const [activeAnalysis, setActiveAnalysis] = useState('citations');
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState('');

  const analysisTypes = [
    { id: 'citations', label: 'Citation Analysis', icon: <BookOpen className="w-5 h-5" />, color: 'blue' },
    { id: 'methodology', label: 'Methodology', icon: <Target className="w-5 h-5" />, color: 'green' },
    { id: 'gaps', label: 'Research Gaps', icon: <Lightbulb className="w-5 h-5" />, color: 'yellow' },
    { id: 'related', label: 'Related Papers', icon: <Network className="w-5 h-5" />, color: 'purple' },
    { id: 'concepts', label: 'Concept Map', icon: <GitBranch className="w-5 h-5" />, color: 'indigo' }
  ];

  const runAnalysis = async (type) => {
    if (!filename) return;
    
    setLoading(true);
    setError('');
    
    try {
      let endpoint = '';
      let payload = { filename };
      
      switch (type) {
        case 'citations':
          endpoint = '/analyze/citations';
          break;
        case 'methodology':
          endpoint = '/analyze/methodology';
          break;
        case 'gaps':
          endpoint = '/analyze/research-gaps';
          break;
        case 'related':
          endpoint = '/analyze/related-papers';
          payload.title = filename.replace('.pdf', '');
          break;
        case 'concepts':
          endpoint = '/analyze/concept-map';
          break;
        default:
          throw new Error('Unknown analysis type');
      }
      
      const response = await apiService.post(endpoint, payload);
      setAnalysisData(prev => ({ ...prev, [type]: response.data }));
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const performSemanticSearch = async () => {
    if (!filename || !searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await apiService.post('/search/semantic', {
        filename,
        query: searchQuery
      });
      setSearchResults(response.data.search_results);
    } catch (err) {
      setError(`Search failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderCitationAnalysis = (data) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900">Total Citations</h4>
          <p className="text-2xl font-bold text-blue-600">{data.citation_analysis?.total_citations || 0}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-900">Unique Authors</h4>
          <p className="text-2xl font-bold text-green-600">{data.citation_analysis?.most_cited_authors?.length || 0}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-900">Citation Network</h4>
          <p className="text-2xl font-bold text-purple-600">{data.citation_analysis?.citation_network?.nodes || 0}</p>
        </div>
      </div>
      
      {data.citation_analysis?.most_cited_authors && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold mb-3">Most Cited Authors</h4>
          <div className="flex flex-wrap gap-2">
            {data.citation_analysis.most_cited_authors.map((author, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {author}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMethodologyAnalysis = (data) => (
    <div className="space-y-4">
      {data.methodology_analysis?.methodology_analysis && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold mb-3">Methodology Analysis</h4>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {data.methodology_analysis.methodology_analysis}
            </pre>
          </div>
        </div>
      )}
      
      {data.methodology_analysis?.research_methods && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold mb-3">Research Methods Identified</h4>
          <div className="flex flex-wrap gap-2">
            {data.methodology_analysis.research_methods.map((method, idx) => (
              <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {method}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderResearchGaps = (data) => (
    <div className="space-y-4">
      {data.research_gaps?.research_gaps && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-semibold mb-3">Identified Research Gaps</h4>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {data.research_gaps.research_gaps}
            </pre>
          </div>
        </div>
      )}
      
      {data.research_gaps?.gap_categories && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold mb-3">Gap Categories</h4>
          <div className="flex flex-wrap gap-2">
            {data.research_gaps.gap_categories.map((category, idx) => (
              <span key={idx} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                {category}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderRelatedPapers = (data) => (
    <div className="space-y-4">
      {data.related_papers?.related_papers?.arxiv && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold mb-3">Related Papers from arXiv</h4>
          <div className="space-y-3">
            {data.related_papers.related_papers.arxiv.map((paper, idx) => (
              <div key={idx} className="border-l-4 border-purple-400 pl-4">
                <h5 className="font-medium text-gray-900">{paper.title}</h5>
                <p className="text-sm text-gray-600">{paper.authors?.join(', ')}</p>
                <p className="text-sm text-gray-500 mt-1">{paper.summary}</p>
                {paper.url && (
                  <a href={paper.url} target="_blank" rel="noopener noreferrer" 
                     className="text-purple-600 hover:text-purple-800 text-sm">
                    View Paper →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderConceptMap = (data) => (
    <div className="space-y-4">
      {data.concept_map && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold mb-3">Concept Network</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{data.concept_map.stats?.total_concepts || 0}</p>
              <p className="text-sm text-gray-600">Concepts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{data.concept_map.stats?.total_connections || 0}</p>
              <p className="text-sm text-gray-600">Connections</p>
            </div>
          </div>
          
          {data.concept_map.nodes && (
            <div className="bg-indigo-50 p-3 rounded">
              <h5 className="font-medium mb-2">Key Concepts</h5>
              <div className="flex flex-wrap gap-2">
                {data.concept_map.nodes.slice(0, 10).map((node, idx) => (
                  <span key={idx} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm">
                    {node.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSearchResults = () => (
    <div className="mt-6 space-y-4">
      <h4 className="font-semibold">Search Results</h4>
      {searchResults?.results?.map((result, idx) => (
        <div key={idx} className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-600">
              Similarity: {(result.similarity * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500">Chunk {result.chunk_index}</span>
          </div>
          <p className="text-sm text-gray-800">{result.text}</p>
        </div>
      ))}
    </div>
  );

  if (!filename) {
    return (
      <div className="text-center py-12">
        <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Advanced Analysis
        </h3>
        <p className="text-gray-600">Upload a paper to access advanced analysis features</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Type Selector */}
      <div className="flex flex-wrap gap-2">
        {analysisTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveAnalysis(type.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              activeAnalysis === type.id
                ? `bg-${type.color}-100 border-${type.color}-300 text-${type.color}-800`
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {type.icon}
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Semantic Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-semibold mb-3">Semantic Search</h4>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search within the paper using natural language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && performSemanticSearch()}
          />
          <button
            onClick={performSemanticSearch}
            disabled={loading || !searchQuery.trim()}
            className="btn-primary flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>
        {searchResults && renderSearchResults()}
      </div>

      {/* Analysis Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {analysisTypes.find(t => t.id === activeAnalysis)?.label}
            </h3>
            <button
              onClick={() => runAnalysis(activeAnalysis)}
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                analysisTypes.find(t => t.id === activeAnalysis)?.icon
              )}
              <span>{loading ? 'Analyzing...' : 'Run Analysis'}</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Running advanced analysis...</p>
            </div>
          )}

          {!loading && analysisData[activeAnalysis] && (
            <div>
              {activeAnalysis === 'citations' && renderCitationAnalysis(analysisData[activeAnalysis])}
              {activeAnalysis === 'methodology' && renderMethodologyAnalysis(analysisData[activeAnalysis])}
              {activeAnalysis === 'gaps' && renderResearchGaps(analysisData[activeAnalysis])}
              {activeAnalysis === 'related' && renderRelatedPapers(analysisData[activeAnalysis])}
              {activeAnalysis === 'concepts' && renderConceptMap(analysisData[activeAnalysis])}
            </div>
          )}

          {!loading && !analysisData[activeAnalysis] && !error && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                {analysisTypes.find(t => t.id === activeAnalysis)?.icon}
              </div>
              <p className="text-gray-600">
                Click "Run Analysis" to start {analysisTypes.find(t => t.id === activeAnalysis)?.label.toLowerCase()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisTab;
