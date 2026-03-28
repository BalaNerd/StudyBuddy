import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Upload, 
  MessageCircle, 
  FileText, 
  Settings, 
  Moon, 
  Sun,
  Sparkles,
  BookOpen
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { isDark, toggleTheme } = useTheme();

  const navigation = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'ask', label: 'QA Chat', icon: MessageCircle },
    { id: 'summarize', label: 'Summarizer', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Study Partner</h1>
            <p className="text-xs text-text-muted">AI-Powered Learning</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item w-full flex items-center space-x-3 ${
                activeTab === item.id ? 'active' : ''
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-border">
        <button
          onClick={toggleTheme}
          className="nav-item w-full justify-between group"
        >
          <div className="flex items-center space-x-3">
            {isDark ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
            <span className="font-medium">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          
          {/* Toggle Switch */}
          <div
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isDark ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDark ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-2 text-text-muted text-xs">
          <BookOpen className="w-4 h-4" />
          <span>Powered by Advanced AI</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
