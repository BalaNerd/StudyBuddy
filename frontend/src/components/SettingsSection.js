import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useDocumentStore } from '../stores/documentStore';
import { Moon, Sun, Monitor, Info, ExternalLink, Sparkles, Zap, Shield, Palette, Settings, Save, RotateCcw } from 'lucide-react';
import axios from 'axios';

const SettingsSection = () => {
  const { isDark, toggleTheme } = useTheme();
  const { settings, updateSettings } = useDocumentStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Sync local settings with store
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setSaveMessage('');
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      // Update backend
      const response = await axios.post('/api/settings', localSettings);
      
      // Update local store
      updateSettings(localSettings);
      
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage(`Error: ${error.response?.data?.error || 'Failed to save settings'}`);
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    const defaultSettings = {
      top_k: 5,
      threshold: 0.7,
      chunk_size: 1000,
      debug: false
    };
    setLocalSettings(defaultSettings);
    setSaveMessage('Settings reset to defaults');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const SettingSlider = ({ label, description, value, min, max, step, onChange, unit = '' }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-text-primary font-semibold">{label}</h4>
          <p className="text-text-muted text-sm">{description}</p>
        </div>
        <div className="text-primary font-semibold">
          {value}{unit}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );

  const SettingToggle = ({ label, description, value, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border">
      <div>
        <h4 className="text-text-primary font-semibold">{label}</h4>
        <p className="text-text-muted text-sm">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 ${
          value ? 'bg-primary' : 'bg-gray-400'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-text-primary mb-4">
          Settings
        </h2>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Customize your experience and manage your preferences. 
          Control themes, AI parameters, and system behavior.
        </p>
      </div>

      {/* AI Settings */}
      <div className="glass-card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary">
            AI Parameters
          </h3>
        </div>
        
        <div className="space-y-6">
          <SettingSlider
            label="Top-K Results"
            description="Number of document chunks to retrieve for answering questions"
            value={localSettings.top_k}
            min={1}
            max={10}
            step={1}
            onChange={(value) => handleSettingChange('top_k', value)}
          />

          <SettingSlider
            label="Similarity Threshold"
            description="Minimum similarity score for retrieved chunks (0.0-1.0)"
            value={localSettings.threshold}
            min={0.1}
            max={1.0}
            step={0.1}
            onChange={(value) => handleSettingChange('threshold', value)}
          />

          <SettingSlider
            label="Chunk Size"
            description="Size of text chunks for document processing"
            value={localSettings.chunk_size}
            min={500}
            max={2000}
            step={100}
            onChange={(value) => handleSettingChange('chunk_size', value)}
            unit=" chars"
          />

          <SettingToggle
            label="Debug Mode"
            description="Show detailed information about AI processing and retrieval"
            value={localSettings.debug}
            onChange={(value) => handleSettingChange('debug', value)}
          />
        </div>

        {/* Settings Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <div className="flex items-center space-x-4">
            <button
              onClick={resetSettings}
              className="btn-secondary flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Defaults</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {saveMessage && (
              <span className={`text-sm ${
                saveMessage.includes('Error') ? 'text-red-500' : 'text-green-500'
              }`}>
                {saveMessage}
              </span>
            )}
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="glass-card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-xl flex items-center justify-center">
            <Palette className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary">
            Appearance
          </h3>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-surface rounded-xl border border-border hover:border-primary transition-all duration-200 group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-xl flex items-center justify-center">
                {isDark ? (
                  <Moon className="w-6 h-6 text-primary" />
                ) : (
                  <Sun className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <p className="text-text-primary font-semibold text-lg">
                  Theme Mode
                </p>
                <p className="text-text-secondary">
                  {isDark ? 'Dark mode is active' : 'Light mode is active'}
                </p>
              </div>
            </div>
            
            <button
              onClick={toggleTheme}
              className="relative inline-flex h-7 w-13 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 group-hover:scale-105 transform"
              style={{
                backgroundColor: isDark ? '#6366f1' : '#4b5563'
              }}
            >
              <span
                className="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300"
                style={{
                  transform: isDark ? 'translateX(1.5rem)' : 'translateX(0.25rem)'
                }}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-surface rounded-xl border border-border text-center hover:border-primary transition-all duration-200">
              <Moon className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-text-primary font-medium mb-1">Dark Mode</p>
              <p className="text-text-muted text-sm">Easy on the eyes</p>
            </div>
            <div className="p-4 bg-surface rounded-xl border border-border text-center hover:border-primary transition-all duration-200">
              <Sun className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-text-primary font-medium mb-1">Light Mode</p>
              <p className="text-text-muted text-sm">Clean and bright</p>
            </div>
            <div className="p-4 bg-surface rounded-xl border border-border text-center hover:border-primary transition-all duration-200">
              <Monitor className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-text-primary font-medium mb-1">Auto Switch</p>
              <p className="text-text-muted text-sm">Follows system</p>
            </div>
          </div>
        </div>
      </div>

      {/* App Information */}
      <div className="glass-card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-xl flex items-center justify-center">
            <Info className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary">
            About AI Study Partner
          </h3>
        </div>
        
        <div className="space-y-6">
          <p className="text-text-secondary leading-relaxed">
            A modern RAG-powered application for intelligent document Q&A and summarization. 
            Built with cutting-edge technology to provide accurate, context-aware responses 
            and comprehensive summaries from your PDF documents.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface rounded-xl p-4 text-center">
              <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-text-primary font-semibold">AI-Powered</p>
              <p className="text-text-muted text-xs">Advanced NLP</p>
            </div>
            <div className="bg-surface rounded-xl p-4 text-center">
              <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-text-primary font-semibold">Fast</p>
              <p className="text-text-muted text-xs">Lightning quick</p>
            </div>
            <div className="bg-surface rounded-xl p-4 text-center">
              <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-text-primary font-semibold">Secure</p>
              <p className="text-text-muted text-xs">Privacy first</p>
            </div>
            <div className="bg-surface rounded-xl p-4 text-center">
              <Palette className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-text-primary font-semibold">Modern</p>
              <p className="text-text-muted text-xs">Beautiful UI</p>
            </div>
          </div>

          <div className="bg-surface rounded-xl p-6 border border-border">
            <h4 className="text-text-primary font-semibold mb-4">Technical Stack</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-text-secondary text-sm mb-2">Frontend</p>
                <p className="text-text-primary font-medium">React + Tailwind CSS</p>
              </div>
              <div>
                <p className="text-text-secondary text-sm mb-2">Backend</p>
                <p className="text-text-primary font-medium">Flask + PyTorch</p>
              </div>
              <div>
                <p className="text-text-secondary text-sm mb-2">AI Models</p>
                <p className="text-text-primary font-medium">T5 + BART Transformers</p>
              </div>
              <div>
                <p className="text-text-secondary text-sm mb-2">Vector Database</p>
                <p className="text-text-primary font-medium">FAISS</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="glass-card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-xl flex items-center justify-center">
            <ExternalLink className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary">
            Resources & Links
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border hover:border-primary hover:shadow-glass-sm transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-4 h-4 text-primary" />
              </div>
              <span className="text-text-primary font-medium">Source Code</span>
            </div>
            <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
          </a>
          
          <a
            href="https://huggingface.co"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border hover:border-primary hover:shadow-glass-sm transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-4 h-4 text-primary" />
              </div>
              <span className="text-text-primary font-medium">AI Models</span>
            </div>
            <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
          </a>
          
          <a
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border hover:border-primary hover:shadow-glass-sm transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-4 h-4 text-primary" />
              </div>
              <span className="text-text-primary font-medium">React Documentation</span>
            </div>
            <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
          </a>
          
          <a
            href="https://tailwindcss.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border hover:border-primary hover:shadow-glass-sm transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-4 h-4 text-primary" />
              </div>
              <span className="text-text-primary font-medium">Tailwind CSS</span>
            </div>
            <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;
