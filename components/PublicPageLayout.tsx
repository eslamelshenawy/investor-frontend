/**
 * PublicPageLayout - Shared layout for all public/landing pages
 * Provides the same header and footer as PublicHomePage
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Search,
  Globe,
  LogIn,
  Menu,
  Database,
  LayoutDashboard,
  Linkedin,
  Youtube,
  Instagram,
  Twitter,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'الرئيسية', href: '#/' },
  { label: 'مجموعات البيانات', href: '#/explore' },
  { label: 'الجهات', href: '#/sources' },
  { label: 'الإحصائيات', href: '#/stats' },
];

const PublicPageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(isAuthenticated ? `/datasets?q=${encodeURIComponent(searchQuery)}` : `/login?redirect=/datasets&q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-right" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Logo Section */}
            <div className="flex items-center gap-4">
              <button className="lg:hidden text-[#002B5C] p-2">
                <Menu size={24} />
              </button>
              <a href="#/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#002B5C] flex items-center justify-center text-white font-bold text-xs">
                  IR
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[#002B5C] text-lg leading-tight">رادار المستثمر</span>
                  <span className="text-xs text-gray-500">راقب السوق بطريقة المحترفين</span>
                </div>
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-gray-600 hover:text-[#002B5C] font-medium text-sm transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Actions & Search */}
            <div className="flex items-center gap-3 mr-auto">
              <form onSubmit={handleSearch} className="relative hidden md:block">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث في مجموعات البيانات..."
                  className="pl-8 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002B5C]/20 w-64 bg-gray-50"
                />
                <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
              </form>

              <button className="flex items-center gap-1 text-gray-600 hover:text-[#002B5C] px-2 py-1 rounded">
                <Globe size={18} />
                <span className="text-sm font-medium hidden sm:inline">English</span>
              </button>

              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-[#002B5C] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-900 transition-colors flex items-center gap-2"
                >
                  <LayoutDashboard size={18} />
                  <span className="hidden sm:inline">لوحة التحكم</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-1 text-[#002B5C] hover:bg-[#002B5C]/5 px-3 py-2 rounded-lg transition-colors"
                  >
                    <LogIn size={18} />
                    <span className="text-sm font-bold">تسجيل الدخول</span>
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="bg-[#002B5C] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-900 transition-colors hidden sm:block"
                  >
                    إنشاء حساب
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 pt-12 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Section 1 */}
            <div>
              <h3 className="font-bold text-[#002B5C] mb-4">نظرة عامة</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/about" className="hover:text-[#002B5C]">عن المنصة</Link></li>
                <li><Link to="/how-it-works" className="hover:text-[#002B5C]">كيف يعمل</Link></li>
                <li><Link to="/pricing" className="hover:text-[#002B5C]">الأسعار</Link></li>
                <li><Link to="/use-cases" className="hover:text-[#002B5C]">حالات الاستخدام</Link></li>
              </ul>
            </div>

            {/* Section 2 */}
            <div>
              <h3 className="font-bold text-[#002B5C] mb-4">روابط سريعة</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/explore" className="hover:text-[#002B5C]">مجموعات البيانات</Link></li>
                <li><Link to="/sources" className="hover:text-[#002B5C]">الجهات الحكومية</Link></li>
                <li><Link to="/stats" className="hover:text-[#002B5C]">الإحصائيات</Link></li>
              </ul>
            </div>

            {/* Section 3 */}
            <div>
              <h3 className="font-bold text-[#002B5C] mb-4">الدعم والمساعدة</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/faq" className="hover:text-[#002B5C]">الأسئلة الشائعة</Link></li>
                <li><Link to="/contact" className="hover:text-[#002B5C]">تواصل معنا</Link></li>
                <li><Link to="/data-trust" className="hover:text-[#002B5C]">لماذا نثق بالبيانات</Link></li>
                <li><Link to="/sources" className="hover:text-[#002B5C]">مصادر البيانات</Link></li>
              </ul>
            </div>

            {/* Social */}
            <div className="flex flex-col gap-6">
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-[#002B5C] hover:text-white transition-colors">
                  <Linkedin size={20} />
                </a>
                <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-[#002B5C] hover:text-white transition-colors">
                  <Youtube size={20} />
                </a>
                <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-[#002B5C] hover:text-white transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-[#002B5C] hover:text-white transition-colors">
                  <Instagram size={20} />
                </a>
              </div>

              <div className="flex items-center gap-4 mt-auto">
                <div className="h-12 w-20 border-2 border-gray-200 rounded flex items-center justify-center text-[10px] text-gray-400 font-bold">
                  VISION 2030
                </div>
                <div className="h-12 w-20 border-2 border-gray-200 rounded flex items-center justify-center text-[10px] text-gray-400 font-bold">
                  INVESTOR RADAR
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>© 2025 رادار المستثمر. جميع الحقوق محفوظة.</p>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-gray-800">سياسة الخصوصية</Link>
              <span className="text-gray-300">|</span>
              <Link to="/terms" className="hover:text-gray-800">الشروط والأحكام</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden py-2 px-4">
        <div className="flex justify-around items-center">
          <button onClick={() => navigate('/')} className="flex flex-col items-center text-[#002B5C]">
            <Database size={22} />
            <span className="text-[10px] mt-1">الرئيسية</span>
          </button>

          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-[#002B5C] text-white px-6 py-2 rounded-lg font-bold text-sm"
            >
              لوحة التحكم
            </button>
          ) : (
            <button
              onClick={() => navigate('/register')}
              className="bg-[#002B5C] text-white px-6 py-2 rounded-lg font-bold text-sm"
            >
              إنشاء حساب
            </button>
          )}

          {!isAuthenticated && (
            <button onClick={() => navigate('/login')} className="flex flex-col items-center text-gray-500">
              <LogIn size={22} />
              <span className="text-[10px] mt-1">دخول</span>
            </button>
          )}
        </div>
      </div>

      {/* Spacer for mobile nav */}
      <div className="h-16 lg:hidden"></div>
    </div>
  );
};

export default PublicPageLayout;
