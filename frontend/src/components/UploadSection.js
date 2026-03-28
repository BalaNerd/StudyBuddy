import React, { useState, useRef } from 'react';
import { useDocumentStore } from '../stores/documentStore';
import { Upload, FileText, Loader2, CheckCircle, Sparkles, X } from 'lucide-react';
import axios from 'axios';

const UploadSection = () => {
  const {
    currentDocument,
    documentStatus,
    setDocument,
    setDocumentStatus,
    setDocumentChunks,
    setDocumentText,
    setError,
    clearDocument,
    isDocumentReady,
    settings
  } = useDocumentStore();

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (file && file.type === 'application/pdf') {
      // Clear previous document
      clearDocument();
      
      // Set new document
      const documentData = {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      };
      
      setDocument(documentData);
      setDocumentStatus('uploading');
      
      // Upload to backend
      await uploadDocument(file);
    } else {
      setError('Please select a valid PDF file.');
    }
  };

  const uploadDocument = async (file) => {
    const formData = new FormData();
    formData.append('pdf', file);
    
    // Add settings to upload
    Object.keys(settings).forEach(key => {
      formData.append(key, settings[key]);
    });

    try {
      setDocumentStatus('processing');
      
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update store with processed data
      setDocumentChunks(response.data.chunks || []);
      setDocumentText(response.data.text || '');
      setDocumentStatus('ready');
      
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to process PDF');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const replaceDocument = () => {
    clearDocument();
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // If we have a document, show the document view
  if (currentDocument) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Document Uploaded
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Your document has been processed and is ready for questions and summarization.
          </p>
        </div>

        {/* Document Card */}
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-2xl flex items-center justify-center">
                {documentStatus === 'processing' ? (
                  <Loader2 className="w-8 h-8 spinner text-primary" />
                ) : documentStatus === 'ready' ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <FileText className="w-8 h-8 text-primary" />
                )}
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {currentDocument.name}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-text-muted">
                  <span>{formatFileSize(currentDocument.size)}</span>
                  <span>•</span>
                  <span>PDF Document</span>
                  <span>•</span>
                  <span className="capitalize">{documentStatus}</span>
                </div>
              </div>
            </div>

            <button
              onClick={replaceDocument}
              className="btn-secondary flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Replace Document</span>
            </button>
          </div>

          {documentStatus === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 spinner text-primary mx-auto mb-4" />
              <p className="text-text-primary font-medium mb-2">
                Processing your document...
              </p>
              <p className="text-text-muted text-sm">
                Extracting text and creating embeddings for intelligent search
              </p>
            </div>
          )}

          {documentStatus === 'ready' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500 bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-text-primary font-medium mb-2">
                Document Ready!
              </p>
              <p className="text-text-muted text-sm mb-6">
                You can now ask questions and generate summaries from this document.
              </p>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => window.location.hash = '#ask'}
                  className="btn-primary"
                >
                  Ask Questions
                </button>
                <button
                  onClick={() => window.location.hash = '#summarize'}
                  className="btn-secondary"
                >
                  Generate Summary
                </button>
              </div>
            </div>
          )}

          {documentStatus === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-500 bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-text-primary font-medium mb-2">
                Processing Failed
              </p>
              <p className="text-text-muted text-sm mb-6">
                There was an error processing your document. Please try again.
              </p>
              
              <div className="flex justify-center">
                <button
                  onClick={replaceDocument}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-text-primary font-semibold mb-2">Smart Processing</h3>
            <p className="text-text-muted text-sm">
              Advanced AI extracts and understands your document content
            </p>
          </div>
          
          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-text-primary font-semibold mb-2">PDF Support</h3>
            <p className="text-text-muted text-sm">
              Works with all standard PDF documents and formats
            </p>
          </div>
          
          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-text-primary font-semibold mb-2">Instant Indexing</h3>
            <p className="text-text-muted text-sm">
              Your content is immediately ready for questions and summaries
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show upload interface when no document
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-text-primary mb-4">
          Upload Documents
        </h2>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Upload your PDF documents to start asking questions and generating summaries. 
          Our AI will process and index your content for intelligent retrieval.
        </p>
      </div>

      {/* Upload Area */}
      <div className="glass-card p-8">
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            isDragging
              ? 'border-primary bg-primary bg-opacity-5 scale-[1.02]'
              : 'border-border hover:border-primary hover:bg-surface'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center space-y-6">
            <div className="w-20 h-20 bg-surface rounded-2xl flex items-center justify-center">
              <Upload className="w-10 h-10 text-text-muted" />
            </div>
            
            <div>
              <p className="text-text-primary font-semibold text-lg mb-2">
                Drag and drop your PDF here
              </p>
              <p className="text-text-muted">
                or click to browse from your computer
              </p>
            </div>
          </div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-8 btn-secondary"
          >
            Select PDF
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 text-center">
          <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-text-primary font-semibold mb-2">Smart Processing</h3>
          <p className="text-text-muted text-sm">
            Advanced AI extracts and understands your document content
          </p>
        </div>
        
        <div className="glass-card p-6 text-center">
          <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-text-primary font-semibold mb-2">PDF Support</h3>
          <p className="text-text-muted text-sm">
            Works with all standard PDF documents and formats
          </p>
        </div>
        
        <div className="glass-card p-6 text-center">
          <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-text-primary font-semibold mb-2">Instant Indexing</h3>
          <p className="text-text-muted text-sm">
            Your content is immediately ready for questions and summaries
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;
