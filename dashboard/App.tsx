import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import DatasetTabs from './components/DatasetTabs';
import Sidebar from './components/Sidebar';
import DatasetContent from './components/DatasetContent';
import DashboardEmbed from './components/DashboardEmbed';
import CommentsSection from './components/CommentsSection';
import ReviewsSection from './components/ReviewsSection';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dataset');

  // Check if the current tab requires full width (no sidebar)
  const isFullWidthTab = activeTab === 'dashboard';

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-right" dir="rtl">
      <Header />
      
      <main>
        <Hero />
        
        <DatasetTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        <div className="container mx-auto px-4 py-8">
          <div className={`flex flex-col ${isFullWidthTab ? '' : 'lg:flex-row'} gap-8`}>
            
            {/* Main Content Area */}
            <div className={`w-full ${isFullWidthTab ? '' : 'lg:w-2/3'} order-2 lg:order-1`}>
               {activeTab === 'dataset' ? (
                 <DatasetContent />
               ) : activeTab === 'dashboard' ? (
                 <DashboardEmbed />
               ) : activeTab === 'comments' ? (
                 <CommentsSection />
               ) : activeTab === 'reviews' ? (
                 <ReviewsSection />
               ) : (
                 <div className="p-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200">
                    <p className="text-lg">المحتوى قيد التطوير لهذا التبويب</p>
                 </div>
               )}
            </div>

            {/* Sidebar (Only shown if NOT full width tab) */}
            {!isFullWidthTab && (
              <aside className="w-full lg:w-1/3 order-1 lg:order-2">
                <Sidebar />
              </aside>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;