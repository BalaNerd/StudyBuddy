import React, { createContext, useContext, useState, useCallback } from 'react';

const UploadContext = createContext();

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
};

export const UploadProvider = ({ children }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  const [isProcessed, setIsProcessed] = useState(false);

  const uploadFile = useCallback((file) => {
    setUploadedFile(file);
    setIsProcessed(false);
    setProcessStatus('');
  }, []);

  const clearUpload = useCallback(() => {
    setUploadedFile(null);
    setIsProcessed(false);
    setProcessStatus('');
  }, []);

  const setProcessing = useCallback((processing) => {
    setIsProcessing(processing);
  }, []);

  const updateStatus = useCallback((status) => {
    setProcessStatus(status);
  }, []);

  const markAsProcessed = useCallback(() => {
    setIsProcessed(true);
  }, []);

  const value = {
    uploadedFile,
    isProcessing,
    processStatus,
    isProcessed,
    uploadFile,
    clearUpload,
    setProcessing,
    updateStatus,
    markAsProcessed,
  };

  return (
    <UploadContext.Provider value={value}>
      {children}
    </UploadContext.Provider>
  );
};
