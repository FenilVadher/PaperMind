import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollText, FileText, BookOpen, Target, Search, BarChart3, ArrowLeft, Download, Share2, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';
import SummaryTab from './SummaryTab';
import GlossaryTab from './GlossaryTab';
import FlashcardsTab from './FlashcardsTab';
import AnalysisTab from './AnalysisTab';
import ComparisonTab from './ComparisonTab';

const Dashboard = ({ uploadedFile }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');
  const [summaryData, setSummaryData] = useState(null);
  const [glossaryData, setGlossaryData] = useState(null);
  const [flashcardsData, setFlashcardsData] = useState(null);
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!uploadedFile) {
      navigate('/');
    }
  }, [uploadedFile, navigate]);

  const handleGenerateContent = async (type) => {
    if (!uploadedFile?.filename) return;

    setLoading(prev => ({ ...prev, [type]: true }));
    setErrors(prev => ({ ...prev, [type]: null }));

    try {
      let result;
      switch (type) {
        case 'summary':
          result = await apiService.generateSummaries(uploadedFile.filename);
          setSummaryData(result);
          break;
        case 'glossary':
          result = await apiService.generateGlossary(uploadedFile.filename);
          setGlossaryData(result);
          break;
        case 'flashcards':
          result = await apiService.generateFlashcards(uploadedFile.filename, 8);
          setFlashcardsData(result);
          break;
        default:
          break;
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, [type]: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const tabs = [
    {
      id: 'summary',
      label: 'Summary',
      icon: <FileText className="w-5 h-5" />,
      emoji: '📄'
    },
    {
      id: 'glossary',
      label: 'Glossary',
      icon: <BookOpen className="w-5 h-5" />,
      emoji: '📚'
    },
    {
      id: 'flashcards',
      label: 'Flashcards',
      icon: <Target className="w-5 h-5" />,
      emoji: '🎯'
    },
    {
      id: 'analysis',
      label: 'Analysis',
      icon: <Search className="w-5 h-5" />,
      emoji: '🔍'
    },
    {
      id: 'comparison',
      label: 'Compare',
      icon: <BarChart3 className="w-5 h-5" />,
      emoji: '📊'
    }
  ];

  if (!uploadedFile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div className="flex items-center space-x-3">
                <ScrollText className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">PaperMind</h1>
                  <p className="text-sm text-gray-600">Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="btn-secondary flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="btn-secondary flex items-center space-x-2">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* File Info */}
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {uploadedFile.filename}
              </h2>
              <p className="text-gray-600">
                {uploadedFile.text_length ? `${uploadedFile.text_length.toLocaleString()} characters extracted` : 'Processing complete'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Uploaded successfully
              </div>
            </div>
          </div>
          {uploadedFile.preview && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Preview:</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {uploadedFile.preview}
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="card mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="text-lg">{tab.emoji}</span>
                  {tab.icon}
                  <span>{tab.label}</span>
                  {loading[tab.id] && (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-6">
            {activeTab === 'summary' && (
              <SummaryTab
                data={summaryData}
                loading={loading.summary}
                error={errors.summary}
                onGenerate={() => handleGenerateContent('summary')}
              />
            )}
            {activeTab === 'glossary' && (
              <GlossaryTab
                data={glossaryData}
                loading={loading.glossary}
                error={errors.glossary}
                onGenerate={() => handleGenerateContent('glossary')}
              />
            )}
            {activeTab === 'flashcards' && (
              <FlashcardsTab
                data={flashcardsData}
                loading={loading.flashcards}
                error={errors.flashcards}
                onGenerate={() => handleGenerateContent('flashcards')}
              />
            )}
            {activeTab === 'analysis' && (
              <AnalysisTab
                filename={uploadedFile?.filename}
              />
            )}
            {activeTab === 'comparison' && (
              <ComparisonTab
                availableFiles={uploadedFile ? [uploadedFile.filename] : []}
                uploadedFiles={uploadedFile ? [uploadedFile.filename] : []}
              />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          {tabs.map((tab) => {
            const hasData = 
              (tab.id === 'summary' && summaryData) ||
              (tab.id === 'glossary' && glossaryData) ||
              (tab.id === 'flashcards' && flashcardsData);

            return (
              <div key={tab.id} className="card card-hover">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">{tab.emoji}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{tab.label}</h3>
                </div>
                <p className="text-gray-600 mb-4 text-sm">
                  {tab.id === 'summary' && 'Generate AI-powered summaries of your research paper'}
                  {tab.id === 'glossary' && 'Get simple explanations of technical terms'}
                  {tab.id === 'flashcards' && 'Create study flashcards for better understanding'}
                  {tab.id === 'analysis' && 'Advanced analysis: citations, methodology, research gaps'}
                  {tab.id === 'comparison' && 'Compare multiple papers side-by-side'}
                </p>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className="btn-secondary text-sm"
                  >
                    View {tab.label}
                  </button>
                  {hasData ? (
                    <div className="text-green-600 text-sm font-medium">
                      ✓ Generated
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGenerateContent(tab.id)}
                      disabled={loading[tab.id]}
                      className="btn-primary text-sm disabled:opacity-50"
                    >
                      {loading[tab.id] ? 'Generating...' : 'Generate'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
