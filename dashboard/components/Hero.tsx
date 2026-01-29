import React from 'react';
import { ChevronLeft, Database } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="bg-gov-blue text-white pt-8 pb-12 relative overflow-hidden">
      {/* Background Decorative Pattern */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-blue-200 mb-6">
          <a href="#" className="hover:text-white transition-colors">الرئيسية</a>
          <ChevronLeft size={14} />
          <a href="#" className="hover:text-white transition-colors">مجموعات البيانات</a>
          <ChevronLeft size={14} />
          <span className="text-white font-medium">التجارة الدولية لشهر سبتمبر 2025</span>
        </nav>

        {/* Title Area */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <Database size={48} className="text-blue-300" />
            </div>
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                التجارة الدولية لشهر سبتمبر 2025
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-blue-100">
                    <span className="bg-green-500/20 text-green-200 px-3 py-1 rounded-full border border-green-500/30">
                        محدثة
                    </span>
                    <span className="flex items-center gap-2">
                         • البيانات الإحصائية والاقتصادية
                    </span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;