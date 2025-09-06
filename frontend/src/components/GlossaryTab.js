import React, { useState } from 'react';
import { BookOpen, Search, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';

const GlossaryTab = ({ data, loading, error, onGenerate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedTerm, setCopiedTerm] = useState(null);

  const filteredGlossary = data?.glossary?.filter(item =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const copyToClipboard = async (text, term) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTerm(term);
      setTimeout(() => setCopiedTerm(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <BookOpen className="w-8 h-8 text-purple-600" />
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search terms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
          />
        </div>
      </div>

      {/* Glossary Grid */}
      {filteredGlossary.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {filteredGlossary.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-semibold text-purple-700 break-words">
                  {item.term}
                </h4>
                <button
                  onClick={() => copyToClipboard(`${item.term}: ${item.definition}`, item.term)}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy definition"
                >
                  {copiedTerm === item.term ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {item.definition}
              </p>
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
          Glossary generated for: <span className="font-medium">{data.filename}</span>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={onGenerate}
            className="btn-secondary text-sm"
          >
            Regenerate
          </button>
          <button className="btn-primary text-sm">
            Export Glossary
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlossaryTab;
