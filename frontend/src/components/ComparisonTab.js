import React, { useState } from 'react';
import { Plus, X, BarChart3, RefreshCw, AlertCircle, Download } from 'lucide-react';
import { apiService } from '../services/api';

const ComparisonTab = ({ availableFiles = [], uploadedFiles = [] }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addFile = (filename) => {
    if (!selectedFiles.includes(filename) && selectedFiles.length < 3) {
      setSelectedFiles([...selectedFiles, filename]);
    }
  };

  const removeFile = (filename) => {
    setSelectedFiles(selectedFiles.filter(f => f !== filename));
  };

  const runComparison = async () => {
    if (selectedFiles.length < 2) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.post('/compare-papers', {
        filenames: selectedFiles
      });
      setComparisonData(response.data);
    } catch (err) {
      setError(`Comparison failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderComparisonMatrix = () => {
    if (!comparisonData?.comparison_results) return null;

    const papers = comparisonData.comparison_results;

    return (
      <div className="space-y-6">
        {/* Content Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {papers.map((paper, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 truncate">{paper.filename}</h4>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600 font-medium">Research Focus:</span>
                  <p className="text-gray-800 mt-1 text-xs leading-relaxed">{paper.research_focus}</p>
                </div>
                
                <div>
                  <span className="text-gray-600 font-medium">Methodology:</span>
                  <p className="text-gray-800 mt-1 text-xs">{paper.methodology_approach}</p>
                </div>
                
                {paper.main_findings && paper.main_findings.length > 0 && (
                  <div>
                    <span className="text-gray-600 font-medium">Key Findings:</span>
                    <div className="mt-1 space-y-1">
                      {paper.main_findings.slice(0, 2).map((finding, fidx) => (
                        <p key={fidx} className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                          {finding.length > 100 ? finding.substring(0, 100) + '...' : finding}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Content Comparison Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-semibold">Content Analysis Comparison</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Aspect</th>
                  {papers.map((paper, idx) => (
                    <th key={idx} className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      {paper.filename.replace('.pdf', '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Research Focus</td>
                  {papers.map((paper, idx) => (
                    <td key={idx} className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                      <p className="text-xs leading-relaxed">{paper.research_focus}</p>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Methodology</td>
                  {papers.map((paper, idx) => (
                    <td key={idx} className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                      <p className="text-xs">{paper.methodology_approach}</p>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Key Themes</td>
                  {papers.map((paper, idx) => (
                    <td key={idx} className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                      <div className="space-y-1">
                        {paper.key_themes?.slice(0, 2).map((theme, tidx) => (
                          <p key={tidx} className="text-xs bg-blue-50 p-1 rounded">
                            {theme.length > 80 ? theme.substring(0, 80) + '...' : theme}
                          </p>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Main Findings</td>
                  {papers.map((paper, idx) => (
                    <td key={idx} className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                      <div className="space-y-1">
                        {paper.main_findings?.slice(0, 2).map((finding, fidx) => (
                          <p key={fidx} className="text-xs bg-green-50 p-1 rounded">
                            {finding.length > 80 ? finding.substring(0, 80) + '...' : finding}
                          </p>
                        )) || <span className="text-gray-400 text-xs">No specific findings extracted</span>}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Content Insights */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Content Analysis Insights</h4>
          <div className="space-y-2 text-sm text-blue-800">
            {comparisonData.content_insights?.map((insight, idx) => (
              <p key={idx}>• {insight}</p>
            )) || (
              <>
                <p>• Papers compared: {papers.length}</p>
                <p>• Content analysis focuses on research themes, methodologies, and findings</p>
                <p>• Each paper contributes unique perspectives to the research domain</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* File Selection */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Select Papers to Compare</h3>
        
        {/* Selected Files */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Papers ({selectedFiles.length}/3)</h4>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((filename) => (
              <div key={filename} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                <span className="text-sm truncate max-w-xs">{filename}</span>
                <button
                  onClick={() => removeFile(filename)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Available Files */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Available Papers</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {availableFiles.filter(f => !selectedFiles.includes(f)).map((filename) => (
              <button
                key={filename}
                onClick={() => addFile(filename)}
                disabled={selectedFiles.length >= 3}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-sm truncate">{filename}</span>
                <Plus className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Compare Button */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Select 2-3 papers to compare their content, methodology, and insights
          </p>
          <button
            onClick={runComparison}
            disabled={selectedFiles.length < 2 || loading}
            className="btn-primary flex items-center space-x-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <BarChart3 className="w-4 h-4" />
            )}
            <span>{loading ? 'Comparing...' : 'Compare Papers'}</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Comparing Papers...</h3>
          <p className="text-gray-600">Analyzing content, methodology, and generating insights</p>
        </div>
      )}

      {/* Comparison Results */}
      {!loading && comparisonData && renderComparisonMatrix()}

      {/* Empty State */}
      {!loading && !comparisonData && !error && availableFiles.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Paper Comparison</h3>
          <p className="text-gray-600">Upload multiple papers to compare their content and methodology</p>
        </div>
      )}
    </div>
  );
};

export default ComparisonTab;
