import React, { useState } from 'react';
import { BookOpen, Search, Copy, AlertCircle, RefreshCw, Download, Share2, Check } from 'lucide-react';
import { exportGlossary, shareContent, copyToClipboard } from '../utils/exportUtils';

const GlossaryTab = ({ data, loading, error, onGenerate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [shareSuccess, setShareSuccess] = useState('');

  const handleExport = () => {
    exportGlossary(data);
  };

  const handleShare = async () => {
    const shareText = `Technical Glossary from PaperMind:\n\n${data.glossary.slice(0, 3).map(item => `${item.term}: ${item.definition}`).join('\n\n')}`;
    const success = await shareContent('PaperMind Technical Glossary', shareText);
    if (success) {
      setShareSuccess('Shared successfully!');
      setTimeout(() => setShareSuccess(''), 3000);
    }
  };

  const filteredGlossary = data?.glossary?.filter(item =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCopyTerm = async (text, index) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <RefreshCw className="w-8 h-8 text-green-600 animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Generating Glossary...
        </h3>
        <p className="text-gray-600 mb-4">
          Extracting technical terms and generating simple explanations using Flan-T5
        </p>
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Processing with Flan-T5 model</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '45%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to Generate Glossary
        </h3>
        <p className="text-red-600 mb-6">{error}</p>
        <button onClick={onGenerate} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <BookOpen className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Generate Technical Glossary
        </h3>
        <p className="text-gray-600 mb-6">
          Extract technical terms from your paper and get simple explanations for better understanding
        </p>
        <button onClick={onGenerate} className="btn-primary">
          Generate Glossary
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Technical Glossary</h3>
          <p className="text-gray-600 mt-1">
            {data.total_terms} terms found and explained
          </p>
        </div>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
      </div>

      {/* Glossary Grid */}
      {filteredGlossary.length > 0 ? (
        <div className="space-y-4">
          {filteredGlossary.map((item, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.term}
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {item.definition}
                  </p>
                </div>
                <button
                  onClick={() => handleCopyTerm(`${item.term}: ${item.definition}`, index)}
                  className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedIndex === index ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm ? 'No terms found matching your search.' : 'No glossary terms available.'}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          {filteredGlossary.length} terms found for: <span className="font-medium">{data.filename}</span>
        </div>
        <div className="flex space-x-3">
          {shareSuccess && (
            <span className="text-green-600 text-sm">{shareSuccess}</span>
          )}
          <button 
            onClick={onGenerate}
            className="btn-secondary text-sm"
          >
            Regenerate
          </button>
          <button 
            onClick={handleShare}
            className="btn-secondary text-sm flex items-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button 
            onClick={handleExport}
            className="btn-primary text-sm flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlossaryTab;
