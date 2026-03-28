import React from 'react';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'upload', label: 'Upload' },
    { id: 'ask', label: 'QA Chat' },
    { id: 'summarize', label: 'Summarizer' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <nav className="border-b border-border">
      <div className="flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 px-1 font-medium transition-colors duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? 'tab-active'
                : 'tab-inactive'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default TabNavigation;
