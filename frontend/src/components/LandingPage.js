import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, ScrollText, BookOpen, Target, Search, BarChart3, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

const LandingPage = ({ onFileUploaded }) => {
  const navigate = useNavigate();
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }

    if (file.size > 16 * 1024 * 1024) {
      setError('File size must be less than 16MB.');
      return;
    }

    setError('');
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      const result = await apiService.uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      setUploadedFileInfo(result);
      setUploadStatus('success');
      onFileUploaded(result);

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error) {
      setError(error.message);
      setUploadStatus('error');
    }
  }, [navigate, onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: uploadStatus === 'uploading'
  });

  const features = [
    {
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      title: "Smart Summaries",
      description: "Get both short and detailed summaries using advanced AI models like T5 and BART"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-green-600" />,
      title: "Technical Glossary",
      description: "Understand complex terms with AI-generated simple explanations"
    },
    {
      icon: <Target className="w-8 h-8 text-purple-600" />,
      title: "Study Flashcards",
      description: "Generate Q&A flashcards to test your understanding of the paper"
    },
    {
      icon: <Search className="w-8 h-8 text-orange-600" />,
      title: "Advanced Analysis",
      description: "Deep analysis including citations, methodology, research gaps, and concept mapping"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-indigo-600" />,
      title: "Paper Comparison",
      description: "Compare multiple papers side-by-side analyzing content, themes, and findings"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ScrollText className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PaperMind</h1>
                <p className="text-sm text-gray-600">Understand research the smart way</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Your companion for understanding <span className="text-blue-600">paper</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Upload any research paper and get instant summaries, glossaries, flashcards, advanced analysis, 
            and paper comparisons powered by state-of-the-art AI models. Make complex research accessible.
          </p>
        </div>

        {/* Upload Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="card card-hover">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : uploadStatus === 'success'
                  ? 'border-green-500 bg-green-50'
                  : uploadStatus === 'error'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }
                ${uploadStatus === 'uploading' ? 'pointer-events-none opacity-75' : ''}
              `}
            >
              <input {...getInputProps()} />
              
              {uploadStatus === 'idle' && (
                <>
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {isDragActive ? 'Drop your PDF here' : 'Upload Research Paper'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your PDF file here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF files up to 16MB
                  </p>
                </>
              )}

              {uploadStatus === 'uploading' && (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Processing your paper...
                  </h3>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-600">
                    {uploadProgress}% complete
                  </p>
                </>
              )}

              {uploadStatus === 'success' && uploadedFileInfo && (
                <>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Upload Successful!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {uploadedFileInfo.filename} has been processed
                  </p>
                  <div className="flex items-center justify-center text-blue-600">
                    <span className="mr-2">Redirecting to dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </>
              )}

              {uploadStatus === 'error' && (
                <>
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Upload Failed
                  </h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <button 
                    onClick={() => {
                      setUploadStatus('idle');
                      setError('');
                    }}
                    className="btn-primary"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What PaperMind Can Do
          </h3>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card card-hover text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How it Works */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h3>
          <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
            Follow four simple steps to transform any paper into clear, actionable insights.
          </p>

          {/* Stepper */}
          <div className="relative">
            {/* connecting line for md+ */}
            <div className="hidden md:block absolute top-10 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="card card-hover text-left md:text-center relative">
                <div className="flex md:block items-center md:items-stretch">
                  <div className="shrink-0 md:mx-auto md:mb-4 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="ml-4 md:ml-0">
                    <div className="text-xs font-medium text-blue-600 tracking-wide">STEP 1</div>
                    <h4 className="text-lg font-semibold text-gray-900">Upload PDF</h4>
                    <p className="text-gray-600 text-sm mt-1">Drag & drop or browse your research paper.</p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="card card-hover text-left md:text-center relative">
                <div className="flex md:block items-center md:items-stretch">
                  <div className="shrink-0 md:mx-auto md:mb-4 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="ml-4 md:ml-0">
                    <div className="text-xs font-medium text-indigo-600 tracking-wide">STEP 2</div>
                    <h4 className="text-lg font-semibold text-gray-900">AI Processing</h4>
                    <p className="text-gray-600 text-sm mt-1">Content is extracted and analyzed with multiple models.</p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="card card-hover text-left md:text-center relative">
                <div className="flex md:block items-center md:items-stretch">
                  <div className="shrink-0 md:mx-auto md:mb-4 w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-200">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div className="ml-4 md:ml-0">
                    <div className="text-xs font-medium text-purple-600 tracking-wide">STEP 3</div>
                    <h4 className="text-lg font-semibold text-gray-900">Generate Insights</h4>
                    <p className="text-gray-600 text-sm mt-1">Summaries, glossary, flashcards, and analysis are prepared.</p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="card card-hover text-left md:text-center relative">
                <div className="flex md:block items-center md:items-stretch">
                  <div className="shrink-0 md:mx-auto md:mb-4 w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-200">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="ml-4 md:ml-0">
                    <div className="text-xs font-medium text-green-600 tracking-wide">STEP 4</div>
                    <h4 className="text-lg font-semibold text-gray-900">Study & Learn</h4>
                    <p className="text-gray-600 text-sm mt-1">Use the dashboard to explore and export what you need.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-blue-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 PaperMind. Powered by advanced AI models including T5, BART, and Flan-T5.</p>
            <p className="mt-2">Developed by Fenil Vadher, Ritesh Sanchala, Aryan Langhnoja</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
