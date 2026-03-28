import React, { useState } from 'react';
import { useDocumentStore } from '../stores/documentStore';
import { FileText, Loader2, Sparkles, Download, Copy, Check } from 'lucide-react';
import axios from 'axios';

const SummarizeSection = () => {
  const { isDocumentReady, currentDocument } = useDocumentStore();
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!isDocumentReady()) {
      setSummary('Please upload and process a document first.');
      return;
    }

    setIsLoading(true);
    setSummary('');

    try {
      const response = await axios.post('/api/summarize');
      setSummary(response.data.summary);
    } catch (error) {
      if (error.response?.status === 400) {
        setSummary(error.response.data.error || 'Please upload a document first.');
      } else {
        setSummary(`Error: ${error.response?.data?.error || 'Failed to generate summary'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([summary], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'summary.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Show disabled state if no document
  if (!isDocumentReady()) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Document Summarizer
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Generate comprehensive summaries of your documents using advanced AI. 
            Extract key insights and main points in seconds.
          </p>
        </div>

        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            No Document Available
          </h3>
          <p className="text-text-secondary mb-6">
            Upload and process a PDF document in the Upload tab to generate a summary.
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
          Document Summarizer
        </h2>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Generate comprehensive summaries of your documents using advanced AI. 
          Extract key insights and main points in seconds.
        </p>
      </div>

      {/* Generate Button */}
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-4">
          Ready to Generate Summary
        </h3>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          Our AI will analyze your document and create a comprehensive summary 
          highlighting the main points and key insights.
        </p>
        
        <button
          onClick={handleSummarize}
          disabled={isLoading}
          className="btn-primary text-lg px-8 flex items-center space-x-3 mx-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 spinner" />
              <span>Generating Summary...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              <span>Generate Summary</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Display */}
      {summary && (
        <div className="glass-card p-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary">
                Document Summary
              </h3>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="btn-ghost p-2 rounded-lg"
                title="Copy summary"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleDownload}
                className="btn-ghost p-2 rounded-lg"
                title="Download summary"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <div className="bg-surface rounded-xl p-6 border border-border">
              <p className="text-text-primary leading-relaxed text-lg whitespace-pre-line">
                {summary}
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-surface rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary mb-1">
                {summary.split(' ').length}
              </p>
              <p className="text-text-muted text-sm">Words</p>
            </div>
            <div className="bg-surface rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary mb-1">
                {summary.length}
              </p>
              <p className="text-text-muted text-sm">Characters</p>
            </div>
            <div className="bg-surface rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary mb-1">
                {summary.split('\n').filter(line => line.trim()).length}
              </p>
              <p className="text-text-muted text-sm">Paragraphs</p>
            </div>
            <div className="bg-surface rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary mb-1">
                ~2 min
              </p>
              <p className="text-text-muted text-sm">Read Time</p>
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 text-center">
          <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-text-primary font-semibold mb-2">AI-Powered</h3>
          <p className="text-text-muted text-sm">
            Advanced natural language processing for accurate summaries
          </p>
        </div>
        
        <div className="glass-card p-6 text-center">
          <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-text-primary font-semibold mb-2">Comprehensive</h3>
          <p className="text-text-muted text-sm">
            Captures main points, key insights, and important details
          </p>
        </div>
        
        <div className="glass-card p-6 text-center">
          <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Download className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-text-primary font-semibold mb-2">Export Ready</h3>
          <p className="text-text-muted text-sm">
            Download or copy summaries for easy sharing and reference
          </p>
        </div>
      </div>
    </div>
  );
};

export default SummarizeSection;
