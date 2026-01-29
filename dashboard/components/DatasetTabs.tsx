import React from 'react';

interface DatasetTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'dataset', label: 'مجموعة البيانات' },
  { id: 'dashboard', label: 'لوحة القيادة' },
  { id: 'comments', label: 'التعليقات' },
  { id: 'reviews', label: 'التقييم والمراجعة' },
];

const DatasetTabs: React.FC<DatasetTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200 bg-white sticky top-[60px] lg:top-[72px] z-40 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex gap-1 lg:gap-8 overflow-x-auto no-scrollbar scroll-smooth">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-2 lg:px-0 text-xs lg:text-sm font-bold border-b-2 transition-all whitespace-nowrap outline-none ${
                activeTab === tab.id
                  ? 'border-gov-blue text-gov-blue'
                  : 'border-transparent text-gray-400 hover:text-gov-blue hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DatasetTabs;