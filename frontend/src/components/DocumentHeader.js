import React from 'react';
import { useDocumentStore } from '../stores/documentStore';
import { FileText, X, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

const DocumentHeader = () => {
  const { 
    currentDocument, 
    documentStatus, 
    clearDocument, 
    getDocumentInfo,
    isDocumentReady 
  } = useDocumentStore();

  const documentInfo = getDocumentInfo();

  if (!currentDocument) {
    return null;
  }

  const getStatusIcon = () => {
    switch (documentStatus) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 spinner text-primary" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 spinner text-primary" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-text-muted" />;
    }
  };

  const getStatusText = () => {
    switch (documentStatus) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing...';
      case 'ready':
        return 'Ready';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Document Icon */}
          <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          
          {/* Document Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-1">
              <h3 className="text-text-primary font-semibold">
                {documentInfo?.name}
              </h3>
              <div className="flex items-center space-x-1">
                {getStatusIcon()}
                <span className="text-sm text-text-muted">
                  {getStatusText()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-text-muted">
              <span>{formatFileSize(documentInfo?.size || 0)}</span>
              <span>•</span>
              <span>{documentInfo?.chunks || 0} chunks</span>
              <span>•</span>
              <span>{documentInfo?.characters?.toLocaleString() || 0} characters</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {isDocumentReady() && (
            <div className="text-sm text-green-500 font-medium mr-3">
              Ready for QA & Summarizer
            </div>
          )}
          
          <button
            onClick={clearDocument}
            className="btn-ghost p-2 rounded-lg hover:bg-surface"
            title="Replace Document"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentHeader;
