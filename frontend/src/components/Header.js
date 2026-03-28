import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const Header = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="py-8 text-center">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1" />
        
        <h1 className="text-4xl font-bold text-text-primary flex-1 text-center">
          AI Study Partner
        </h1>
        
        <div className="flex-1 flex justify-end">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-card border border-border hover:bg-opacity-80 transition-all duration-200 transform hover:scale-105 active:scale-95"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-text-primary" />
            ) : (
              <Moon className="w-5 h-5 text-text-primary" />
            )}
          </button>
        </div>
      </div>
      
      <p className="text-text-secondary text-lg">
        Context-aware question answering from your PDFs
      </p>
    </header>
  );
};

export default Header;
