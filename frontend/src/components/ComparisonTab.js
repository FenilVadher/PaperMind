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
      const response = await apiService.post('/compare/papers', {
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
    if (!comparisonData?.comparison_results?.comparison_matrix) return null;

    const papers = comparisonData.comparison_results.comparison_matrix;

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {papers.map((paper, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2 truncate">{paper.filename}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Word Count:</span>
                  <span className="font-medium">{paper.word_count?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Summary Length:</span>
                  <span className="font-medium">{paper.summary?.short_summary?.length || 0} chars</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Comparison */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-semibold">Detailed Comparison</h4>
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
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Word Count</td>
                  {papers.map((paper, idx) => (
                    <td key={idx} className="px-4 py-3 text-sm text-gray-600">
                      {paper.word_count?.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Research Methods</td>
                  {papers.map((paper, idx) => (
                    <td key={idx} className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1">
                        {paper.methodology?.methodology_analysis?.research_methods?.slice(0, 3).map((method, midx) => (
                          <span key={midx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {method}
                          </span>
                        )) || <span className="text-gray-400">Not analyzed</span>}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Summary</td>
                  {papers.map((paper, idx) => (
                    <td key={idx} className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                      <p className="truncate">{paper.summary?.short_summary || 'No summary available'}</p>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Comparison Insights</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• Papers compared: {papers.length}</p>
            <p>• Average word count: {Math.round(papers.reduce((sum, p) => sum + (p.word_count || 0), 0) / papers.length).toLocaleString()}</p>
            <p>• Most comprehensive: {papers.reduce((max, p) => (p.word_count || 0) > (max.word_count || 0) ? p : max).filename}</p>
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
