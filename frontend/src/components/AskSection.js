import React, { useState } from 'react';
import { useDocumentStore } from '../stores/documentStore';
import { Loader2, ChevronDown, ChevronUp, FileText, Send, Sparkles, MessageCircle } from 'lucide-react';
import axios from 'axios';

const AskSection = () => {
  const { 
    isDocumentReady,
    currentDocument,
    documentStatus,
    settings 
  } = useDocumentStore();
  
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [retrievedContext, setRetrievedContext] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showContext, setShowContext] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    if (!isDocumentReady()) {
      setAnswer('Please upload and process a document first.');
      return;
    }

    setIsLoading(true);
    setAnswer('');
    setRetrievedContext([]);

    try {
      const response = await axios.post('/api/ask', {
        question: question.trim(),
      });

      setAnswer(response.data.answer);
      setRetrievedContext(response.data.context || []);
    } catch (error) {
      if (error.response?.status === 400) {
        setAnswer(error.response.data.error || 'Please upload a document first.');
      } else {
        setAnswer(`Error: ${error.response?.data?.error || 'Failed to get answer'}`);
      }
      setRetrievedContext([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  // Show disabled state if no document
  if (!isDocumentReady()) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Ask Questions
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Get intelligent answers from your uploaded documents. Our AI understands context 
            and provides accurate, source-grounded responses.
          </p>
        </div>

        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            No Document Available
          </h3>
          <p className="text-text-secondary mb-6">
            Upload and process a PDF document in the Upload tab to start asking questions.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => window.location.hash = '#upload'}
              className="btn-primary"
            >
              Go to Upload
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-text-primary mb-4">
          Ask Questions
        </h2>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Get intelligent answers from your uploaded documents. Our AI understands context 
          and provides accurate, source-grounded responses.
        </p>
      </div>

      {/* Question Input */}
      <div className="glass-card p-8">
        <div className="space-y-6">
          <label className="block">
            <span className="text-text-primary font-semibold text-lg mb-4 block">
              What would you like to know?
            </span>
            <div className="relative">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything about your document... (e.g., What are the main topics covered?)"
                className="input-field w-full resize-none scrollbar-thin pr-14"
                rows={4}
                disabled={isLoading}
              />
              <button
                onClick={handleAskQuestion}
                disabled={!question.trim() || isLoading}
                className="absolute bottom-4 right-4 p-2 bg-primary text-white rounded-xl hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 spinner" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between text-sm text-text-muted">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>{question.length}/500 characters</span>
          </div>
        </div>
      </div>

      {/* Answer Display */}
      {answer && (
        <div className="glass-card p-8 animate-fade-in">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary">
              Answer
            </h3>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-text-primary leading-relaxed text-lg whitespace-pre-line">
              {answer}
            </p>
          </div>
        </div>
      )}

      {/* Retrieved Context */}
      {retrievedContext.length > 0 && (
        <div className="glass-card p-8 animate-slide-up">
          <button
            onClick={() => setShowContext(!showContext)}
            className="flex items-center justify-between w-full text-left mb-6 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-text-muted" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary">
                Retrieved Context
              </h3>
              <span className="text-sm text-text-muted bg-surface px-3 py-1 rounded-full">
                {retrievedContext.length} chunks
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-muted">
                {showContext ? 'Hide' : 'Show'}
              </span>
              {showContext ? (
                <ChevronUp className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors" />
              ) : (
                <ChevronDown className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors" />
              )}
            </div>
          </button>

          <div className={`collapsible-content ${showContext ? 'max-h-96' : 'max-h-0'}`}>
            <div className="space-y-4 scrollbar-thin pr-2">
              {retrievedContext.map((chunk, index) => (
                <div
                  key={index}
                  className="p-6 bg-surface rounded-xl border border-border hover:border-primary transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-semibold text-primary bg-primary bg-opacity-10 px-3 py-1 rounded-full">
                        Chunk {index + 1}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span className="text-xs text-text-muted">
                          Relevance: {(chunk.similarity * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-text-secondary leading-relaxed text-sm">
                    {chunk.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="glass-card p-6 bg-surface bg-opacity-50">
        <h4 className="text-text-primary font-semibold mb-4 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span>Tips for Better Answers</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-text-primary font-medium text-sm mb-1">
                Be Specific
              </p>
              <p className="text-text-muted text-xs">
                Ask detailed questions for more precise answers
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-text-primary font-medium text-sm mb-1">
                Use Context
              </p>
              <p className="text-text-muted text-xs">
                Reference specific sections or topics from your document
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-text-primary font-medium text-sm mb-1">
                Check Sources
              </p>
              <p className="text-text-muted text-xs">
                Review retrieved context to verify answer accuracy
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-text-primary font-medium text-sm mb-1">
                Follow Up
              </p>
              <p className="text-text-muted text-xs">
                Ask follow-up questions to dive deeper into topics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Info */}
      <div className="glass-card p-4 bg-surface bg-opacity-30">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-text-muted">
            <span>Current Settings:</span>
            <span>Top-K: {settings.top_k}</span>
            <span>Threshold: {settings.threshold}</span>
            <span>Chunk Size: {settings.chunk_size}</span>
          </div>
          <button
            onClick={() => window.location.hash = '#settings'}
            className="text-primary hover:text-primary-light transition-colors"
          >
            Adjust Settings →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AskSection;
