import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useDocumentStore = create(
  persist(
    (set, get) => ({
      // Document state
      currentDocument: null,
      documentStatus: 'idle', // idle, uploading, processing, ready, error
      documentChunks: [],
      documentText: '',
      errorMessage: '',
      
      // Settings
      settings: {
        top_k: 5,
        threshold: 0.7,
        chunk_size: 1000,
        debug: false,
      },

      // Actions
      setDocument: (document) => {
        set({
          currentDocument: document,
          documentStatus: document ? 'ready' : 'idle',
          errorMessage: '',
        });
      },

      setDocumentStatus: (status) => {
        set({ documentStatus: status });
      },

      setDocumentChunks: (chunks) => {
        set({ documentChunks: chunks });
      },

      setDocumentText: (text) => {
        set({ documentText: text });
      },

      setError: (error) => {
        set({ 
          errorMessage: error,
          documentStatus: 'error' 
        });
      },

      clearDocument: () => {
        set({
          currentDocument: null,
          documentStatus: 'idle',
          documentChunks: [],
          documentText: '',
          errorMessage: '',
        });
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      // Check if document is ready for operations
      isDocumentReady: () => {
        const { documentStatus, currentDocument } = get();
        return documentStatus === 'ready' && currentDocument !== null;
      },

      // Get document info
      getDocumentInfo: () => {
        const { currentDocument, documentChunks, documentText } = get();
        if (!currentDocument) return null;
        
        return {
          name: currentDocument.name,
          size: currentDocument.size,
          type: currentDocument.type,
          chunks: documentChunks.length,
          characters: documentText.length,
          uploadedAt: currentDocument.uploadedAt || new Date().toISOString(),
        };
      },
    }),
    {
      name: 'document-storage',
      partialize: (state) => ({
        settings: state.settings,
        // Don't persist document data - will be fetched from backend
      }),
    }
  )
);
