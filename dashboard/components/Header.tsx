import React from 'react';
import { Search, Globe, User, LogIn, Menu, ArrowRight } from 'lucide-react';
import { NAV_ITEMS } from '../constants';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      {/* Main Navbar */}
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gov-blue p-2">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.location.href = '/'}>
              {/* Placeholder for Saudi Emblem/Logo */}
              <div className="w-10 h-10 rounded-full bg-gov-blue flex items-center justify-center text-white font-bold text-xs group-hover:bg-blue-800 transition-colors">
                KSA
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gov-blue text-lg leading-tight">رادار المستثمر</span>
                    <ArrowRight size={14} className="text-gov-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-xs text-gray-500">العودة للوحة التحكم الرئيسية</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <a 
                key={item.label} 
                href={item.href}
                className="text-gray-600 hover:text-gov-blue font-medium text-sm transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions & Search */}
          <div className="flex items-center gap-3 mr-auto">
            {/* Search */}
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="بحث في مجموعات البيانات..." 
                className="pl-8 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gov-blue/20 w-64 bg-gray-50 text-right"
                dir="rtl"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
            </div>

            <button className="flex items-center gap-1 text-gray-600 hover:text-gov-blue px-2 py-1 rounded">
              <Globe size={18} />
              <span className="text-sm font-medium">English</span>
            </button>

            <button className="flex items-center gap-1 text-gov-blue hover:bg-gov-blue/5 px-3 py-2 rounded-lg transition-colors">
              <LogIn size={18} />
              <span className="text-sm font-bold">تسجيل الدخول</span>
            </button>
            
            <button className="bg-gov-blue text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-900 transition-colors hidden sm:block">
              طلب مجموعة بيانات
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;