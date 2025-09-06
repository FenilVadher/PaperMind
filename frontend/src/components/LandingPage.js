import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Brain, BookOpen, Target, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
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
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PaperMind</h1>
                <p className="text-sm text-gray-600">Understand research the smart way</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Research
            <span className="text-blue-600 block">Paper Explainer</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Upload any research paper and get instant summaries, glossaries, and flashcards 
            powered by state-of-the-art AI models. Make complex research accessible.
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
          <div className="grid md:grid-cols-3 gap-8">
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
          <h3 className="text-3xl font-bold text-gray-900 mb-8">
            How It Works
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Upload PDF", desc: "Upload your research paper" },
              { step: "2", title: "AI Processing", desc: "Our AI models analyze the content" },
              { step: "3", title: "Generate Insights", desc: "Get summaries, glossary & flashcards" },
              { step: "4", title: "Study & Learn", desc: "Use the generated content to understand better" }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-blue-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 PaperMind. Powered by advanced AI models including T5, BART, and Flan-T5.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
