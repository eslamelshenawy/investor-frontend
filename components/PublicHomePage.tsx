import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../src/services/api';
import {
  Search,
  Globe,
  LogIn,
  Menu,
  Database,
  ChevronLeft,
  Star,
  Download,
  RefreshCw,
  Tag,
  ShieldCheck,
  Linkedin,
  Youtube,
  Instagram,
  Twitter,
  Eye,
  Users,
  Building2,
  Zap,
  Loader2,
  LayoutDashboard,
} from 'lucide-react';

// Types
interface StatsData {
  totalDatasets: number;
  totalCategories: number;
  totalUsers: number;
  totalSignals: number;
  totalViews: number;
  totalSources?: number;
}

interface DatasetItem {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  category: string;
  source: string;
  recordCount?: number;
  createdAt?: string;
}

interface SourceItem {
  name: string;
  count: number;
}

// Navigation items
const NAV_ITEMS = [
  { label: 'الرئيسية', href: '#' },
  { label: 'مجموعات البيانات', href: '#datasets' },
  { label: 'الجهات', href: '#sources' },
  { label: 'الإحصائيات', href: '#stats' },
];

const PublicHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic data states
  const [stats, setStats] = useState<StatsData | null>(null);
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [sources, setSources] = useState<SourceItem[]>([]);

  // Loading states
  const [statsLoading, setStatsLoading] = useState(true);
  const [datasetsLoading, setDatasetsLoading] = useState(true);
  const [sourcesLoading, setSourcesLoading] = useState(true);

  // Combined loading state
  const loading = statsLoading || datasetsLoading || sourcesLoading;

  // Fetch stats from REST API
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.getOverviewStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('[API] Error fetching stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch datasets from REST API
  const fetchDatasets = useCallback(async () => {
    try {
      const res = await api.getDatasets({ limit: 6 });
      if (res.success && res.data && Array.isArray(res.data)) {
        setDatasets(res.data.slice(0, 6));
      }
    } catch (err) {
      console.error('[API] Error fetching datasets:', err);
    } finally {
      setDatasetsLoading(false);
    }
  }, []);

  // Fetch sources from REST API
  const fetchSources = useCallback(async () => {
    try {
      const res = await api.getSourceStats();
      if (res.success && res.data) {
        const srcData = res.data.sources || res.data;
        if (Array.isArray(srcData)) {
          setSources(srcData);
        }
      }
    } catch (err) {
      console.error('[API] Error fetching sources:', err);
    } finally {
      setSourcesLoading(false);
    }
  }, []);

  // Initialize all fetches on mount
  useEffect(() => {
    fetchStats();
    fetchDatasets();
    fetchSources();
  }, [fetchStats, fetchDatasets, fetchSources]);

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
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#002B5C] flex items-center justify-center text-white font-bold text-xs">
                  IR
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[#002B5C] text-lg leading-tight">رادار المستثمر</span>
                  <span className="text-xs text-gray-500">راقب السوق بطريقة المحترفين</span>
                </div>
              </div>
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

      {/* Hero Section */}
      <section className="bg-[#002B5C] text-white pt-12 pb-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              المنصة الوطنية للبيانات المفتوحة
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              اكتشف وحلل البيانات الاقتصادية والاجتماعية من مصادر رسمية موثوقة
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن مجموعة بيانات..."
                  className="w-full py-4 px-6 pr-14 text-gray-900 bg-white rounded-xl shadow-lg text-base focus:outline-none focus:ring-4 focus:ring-white/30"
                />
                <button
                  type="submit"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#002B5C] hover:bg-blue-900 text-white p-3 rounded-lg transition-colors"
                >
                  <Search size={20} />
                </button>
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-12 -mt-8 relative z-20">
        <div className="container mx-auto px-4">
          {statsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#002B5C]" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                <div className="w-12 h-12 bg-blue-50 text-[#002B5C] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Database size={24} />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                  {stats?.totalDatasets?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-500">مجموعة بيانات</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users size={24} />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                  {stats?.totalUsers?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-500">مستخدم مسجل</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Building2 size={24} />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                  {sources.length || '0'}
                </div>
                <div className="text-sm text-gray-500">جهة حكومية</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Zap size={24} />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                  {stats?.totalSignals?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-500">إشارة ذكية</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Datasets Section */}
      <section id="datasets" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#002B5C] mb-2">أحدث مجموعات البيانات</h2>
              <p className="text-gray-600">تصفح أحدث البيانات المتاحة من الجهات الحكومية</p>
            </div>
            <button
              onClick={() => navigate(isAuthenticated ? '/datasets' : '/login')}
              className="text-[#002B5C] hover:text-blue-900 font-bold text-sm flex items-center gap-1"
            >
              عرض الكل
              <ChevronLeft size={18} />
            </button>
          </div>

          {datasetsLoading && datasets.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#002B5C]" />
                <span className="text-sm text-gray-500">جاري تحميل مجموعات البيانات...</span>
              </div>
            </div>
          ) : !datasetsLoading && datasets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">لا توجد بيانات متاحة حالياً</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Show streaming indicator if still loading more */}
              {datasetsLoading && (
                <div className="text-center text-sm text-[#002B5C] col-span-full mb-2">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري تحميل المزيد...
                  </span>
                </div>
              )}
              {datasets.map((dataset) => (
                <div
                  key={dataset.id}
                  onClick={() => navigate(isAuthenticated ? `/dataset/${dataset.id}` : '/login')}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-[#002B5C]/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#002B5C]/10 text-[#002B5C] rounded-xl flex items-center justify-center group-hover:bg-[#002B5C] group-hover:text-white transition-colors">
                      <Database size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#002B5C]">
                        {dataset.nameAr || dataset.name}
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {dataset.category || 'غير مصنف'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {dataset.descriptionAr || dataset.description || 'لا يوجد وصف متاح'}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {dataset.source && (
                        <span className="flex items-center gap-1">
                          <Building2 size={14} />
                          {dataset.source}
                        </span>
                      )}
                    </div>
                    {dataset.recordCount && (
                      <span className="text-xs text-[#002B5C] font-medium">
                        {dataset.recordCount.toLocaleString()} سجل
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sources Section */}
      <section id="sources" className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#002B5C] mb-2">الجهات الحكومية</h2>
            <p className="text-gray-600">مصادر البيانات الرسمية والموثوقة</p>
          </div>

          {sourcesLoading && sources.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#002B5C]" />
                <span className="text-sm text-gray-500">جاري تحميل الجهات الحكومية...</span>
              </div>
            </div>
          ) : !sourcesLoading && sources.length === 0 ? (
            <div className="text-center py-8 text-gray-500">لا توجد جهات متاحة</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Show streaming indicator if still loading more */}
              {sourcesLoading && (
                <div className="text-center text-sm text-[#002B5C] col-span-full mb-2">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري تحميل المزيد من الجهات...
                  </span>
                </div>
              )}
              {sources.slice(0, 12).map((source, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-4 text-center border border-gray-200 hover:border-[#002B5C]/30 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-[#002B5C]/10 text-[#002B5C] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Building2 size={20} />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{source.name}</h4>
                  <span className="text-xs text-gray-500">{source.count} مجموعة</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16 bg-[#002B5C] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              انضم إلى منصة رادار المستثمر
            </h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              سجل الآن للوصول إلى جميع البيانات والتحليلات والإشارات الذكية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="bg-white text-[#002B5C] px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
              >
                إنشاء حساب مجاني
              </button>
              <button
                onClick={() => navigate('/login')}
                className="border-2 border-white text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors"
              >
                تسجيل الدخول
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 pt-12 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Section 1 */}
            <div>
              <h3 className="font-bold text-[#002B5C] mb-4">نظرة عامة</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-[#002B5C]">عن المنصة</a></li>
                <li><a href="#" className="hover:text-[#002B5C]">سياسة البيانات</a></li>
                <li><a href="#" className="hover:text-[#002B5C]">اتفاقية الاستخدام</a></li>
              </ul>
            </div>

            {/* Section 2 */}
            <div>
              <h3 className="font-bold text-[#002B5C] mb-4">روابط سريعة</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#datasets" className="hover:text-[#002B5C]">مجموعات البيانات</a></li>
                <li><a href="#sources" className="hover:text-[#002B5C]">الجهات الحكومية</a></li>
                <li><a href="#stats" className="hover:text-[#002B5C]">الإحصائيات</a></li>
              </ul>
            </div>

            {/* Section 3 */}
            <div>
              <h3 className="font-bold text-[#002B5C] mb-4">الدعم والمساعدة</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-[#002B5C]">الأسئلة الشائعة</a></li>
                <li><a href="#" className="hover:text-[#002B5C]">تواصل معنا</a></li>
                <li><a href="#" className="hover:text-[#002B5C]">دليل الاستخدام</a></li>
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
              <a href="#" className="hover:text-gray-800">سياسة الخصوصية</a>
              <span className="text-gray-300">|</span>
              <a href="#" className="hover:text-gray-800">الشروط والأحكام</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden py-2 px-4">
        <div className="flex justify-around items-center">
          <button onClick={() => window.scrollTo(0, 0)} className="flex flex-col items-center text-[#002B5C]">
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

export default PublicHomePage;
