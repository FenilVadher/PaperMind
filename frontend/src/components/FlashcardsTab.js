import React, { useState } from 'react';
import { Target, ChevronLeft, ChevronRight, RotateCcw, Shuffle, AlertCircle, RefreshCw, Download, Share2 } from 'lucide-react';
import { exportFlashcards, shareContent } from '../utils/exportUtils';

const FlashcardsTab = ({ data, loading, error, onGenerate }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [shareSuccess, setShareSuccess] = useState('');

  const handleExport = () => {
    exportFlashcards(data);
  };

  const handleShare = async () => {
    const shareText = `Study Flashcards from PaperMind:\n\nQ: ${data.flashcards[currentCard]?.question}\nA: ${data.flashcards[currentCard]?.answer}`;
    const success = await shareContent('PaperMind Study Flashcards', shareText);
    if (success) {
      setShareSuccess('Shared successfully!');
      setTimeout(() => setShareSuccess(''), 3000);
    }
  };

  const [flashcards, setFlashcards] = useState([]);

  React.useEffect(() => {
    if (data?.flashcards) {
      setFlashcards(data.flashcards);
      setCurrentCard(0);
      setShowAnswer(false);
    }
  }, [data]);

  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentCard(0);
    setShowAnswer(false);
  };

  const goToCard = (index) => {
    setCurrentCard(index);
    setShowAnswer(false);
  };

  const nextCard = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setShowAnswer(false);
    }
  };

  const resetCards = () => {
    setCurrentCard(0);
    setShowAnswer(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Generating Flashcards...
        </h3>
        <p className="text-gray-600 mb-4">
          Creating Q&A flashcards to help you study and understand the paper better
        </p>
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Processing with Flan-T5 model</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
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
          Failed to Generate Flashcards
        </h3>
        <p className="text-red-600 mb-6">{error}</p>
        <button onClick={onGenerate} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!data || !flashcards.length) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <Target className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Generate Study Flashcards
        </h3>
        <p className="text-gray-600 mb-6">
          Create interactive Q&A flashcards to test your understanding of the research paper
        </p>
        <button onClick={onGenerate} className="btn-primary">
          Generate Flashcards
        </button>
      </div>
    );
  }

  const currentFlashcard = flashcards[currentCard];

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Study Flashcards</h3>
          <p className="text-gray-600 mt-1">
            {data.total_cards} flashcards • Card {currentCard + 1} of {flashcards.length}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={shuffleCards}
            className="btn-secondary text-sm flex items-center space-x-2"
          >
            <Shuffle className="w-4 h-4" />
            <span>Shuffle</span>
          </button>
          <button
            onClick={resetCards}
            className="btn-secondary text-sm flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Flashcard */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 min-h-[300px] flex flex-col">
          {/* Card Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">
                Card {currentCard + 1} of {flashcards.length}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {showAnswer ? 'Answer' : 'Question'}
            </div>
          </div>

          {/* Card Content */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-lg text-gray-800 leading-relaxed mb-6">
                {showAnswer ? currentFlashcard.answer : currentFlashcard.question}
              </p>
              <button
                onClick={() => setShowAnswer(!showAnswer)}
                className="btn-primary"
              >
                {showAnswer ? 'Show Question' : 'Show Answer'}
              </button>
            </div>
          </div>

          {/* Card Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={prevCard}
                disabled={currentCard === 0}
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex space-x-2">
                {flashcards.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToCard(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentCard ? 'bg-purple-600' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextCard}
                disabled={currentCard === flashcards.length - 1}
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(((currentCard + 1) / flashcards.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentCard + 1) / flashcards.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          {flashcards.length} flashcards generated for: <span className="font-medium">{data.filename}</span>
        </div>
        <div className="flex space-x-3">
          {shareSuccess && (
            <span className="text-green-600 text-sm">{shareSuccess}</span>
          )}
          <button onClick={shuffleCards} className="btn-secondary text-sm flex items-center space-x-2">
            <Shuffle className="w-4 h-4" />
            <span>Shuffle</span>
          </button>
          <button onClick={resetCards} className="btn-secondary text-sm flex items-center space-x-2">
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button onClick={onGenerate} className="btn-secondary text-sm">
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

export default FlashcardsTab;
