import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DocumentHeader from './components/DocumentHeader';
import UploadSection from './components/UploadSection';
import AskSection from './components/AskSection';
import SummarizeSection from './components/SummarizeSection';
import SettingsSection from './components/SettingsSection';
import { ThemeProvider } from './contexts/ThemeContext';
import { useDocumentStore } from './stores/documentStore';
import axios from 'axios';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const { 
    setDocumentStatus, 
    setDocumentChunks, 
    setDocumentText, 
    setDocument,
    settings,
    updateSettings 
  } = useDocumentStore();

  // Check document status on mount and tab changes
  useEffect(() => {
    checkDocumentStatus();
  }, [activeTab]);

  const checkDocumentStatus = async () => {
    try {
      const response = await axios.get('/api/document/status');
      
      if (response.data.has_document) {
        // Document exists on backend, sync with frontend
        setDocumentStatus('ready');
        setDocument(response.data.document_info);
        
        // Update settings if different
        if (JSON.stringify(response.data.settings) !== JSON.stringify(settings)) {
          updateSettings(response.data.settings);
        }
      }
    } catch (error) {
      console.log('No document on backend or backend not available');
    }
  };

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'upload':
        return <UploadSection />;
      case 'ask':
        return <AskSection />;
      case 'summarize':
        return <SummarizeSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <UploadSection />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-8">
            <DocumentHeader />
            <div className="fade-in">
              {renderActiveSection()}
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
