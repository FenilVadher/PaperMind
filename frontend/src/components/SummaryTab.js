import React, { useState } from 'react';
import { FileText, Sparkles, AlertCircle, RefreshCw, Download, Share2, Copy, Check } from 'lucide-react';
import { exportSummaries, shareContent, copyToClipboard } from '../utils/exportUtils';

const SummaryTab = ({ data, loading, error, onGenerate }) => {
  const [copySuccess, setCopySuccess] = useState('');
  const [shareSuccess, setShareSuccess] = useState('');

  const handleExport = () => {
    exportSummaries(data);
  };

  const handleShare = async () => {
    const shareText = `Check out these AI-generated summaries from PaperMind!\n\nShort Summary: ${data.short_summary.substring(0, 100)}...\n\nDetailed Summary: ${data.detailed_summary.substring(0, 100)}...`;
    const success = await shareContent('PaperMind AI Summaries', shareText);
    if (success) {
      setShareSuccess('Shared successfully!');
      setTimeout(() => setShareSuccess(''), 3000);
    }
  };

  const handleCopy = async (text, type) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Generating Summaries...
        </h3>
        <p className="text-gray-600 mb-4">
          Our AI models are analyzing your paper to create comprehensive summaries
        </p>
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Processing with T5 and BART models</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
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
          Failed to Generate Summaries
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Generate AI Summaries
        </h3>
        <p className="text-gray-600 mb-6">
          Create both short and detailed summaries of your research paper using advanced AI models
        </p>
        <button onClick={onGenerate} className="btn-primary">
          Generate Summaries
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Short Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">Short Summary</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              T5 Model
            </span>
          </div>
          <button
            onClick={() => handleCopy(data.short_summary, 'short')}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            title="Copy short summary"
          >
            {copySuccess === 'short' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="prose prose-blue max-w-none">
          <p className="text-gray-700 leading-relaxed text-lg">
            {data.short_summary}
          </p>
        </div>
      </div>

      {/* Detailed Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">Detailed Summary</h3>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              BART Model
            </span>
          </div>
          <button
            onClick={() => handleCopy(data.detailed_summary, 'detailed')}
            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
            title="Copy detailed summary"
          >
            {copySuccess === 'detailed' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="prose prose-green max-w-none">
          <p className="text-gray-700 leading-relaxed">
            {data.detailed_summary}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Summaries generated for: <span className="font-medium">{data.filename}</span>
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

export default SummaryTab;
