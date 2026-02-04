/**
 * Dataset Detail Page - صفحة تفاصيل مجموعة البيانات
 * Based on Saudi Open Data Platform design
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Globe,
  LogIn,
  Menu,
  ChevronLeft,
  Database,
  Star,
  Download,
  ShieldCheck,
  RefreshCw,
  Tag,
  Eye,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Linkedin,
  Youtube,
  Instagram,
  Twitter,
  Loader2,
  Calendar,
  Building2,
  FileText,
  BarChart3,
  MessageSquare,
  X,
  LayoutDashboard
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../src/services/api';
import { useAuth } from '../contexts/AuthContext';

// Navigation items
const NAV_ITEMS = [
  { label: 'الرئيسية', href: '/' },
  { label: 'مجموعات البيانات', href: '/datasets' },
  { label: 'الجهات', href: '/followers' },
  { label: 'الإشارات', href: '/signals' },
  { label: 'لوحات التحكم', href: '/dashboards' },
];

// Accordion Component
const AccordionItem: React.FC<{
  title: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ title, isOpen, onClick, children }) => (
  <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
    >
      <span className="font-bold text-gray-700">{title}</span>
      {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
    </button>
    {isOpen && (
      <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        {children}
      </div>
    )}
  </div>
);

// Activity Chart Component
const ActivityChart: React.FC<{ data: { date: string; views: number; downloads: number }[] }> = ({ data }) => {
  return (
    <div className="h-64 w-full mt-4" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis
            dataKey="date"
            tick={{fontSize: 12, fill: '#6B7280'}}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{fontSize: 12, fill: '#6B7280'}}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{fill: '#F3F4F6'}}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Bar dataKey="downloads" fill="#002B5C" radius={[4, 4, 0, 0]} barSize={20} name="التنزيلات" />
          <Bar dataKey="views" fill="#00A3E0" radius={[4, 4, 0, 0]} barSize={20} name="المشاهدات" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Sidebar Component
const Sidebar: React.FC<{ dataset: any }> = ({ dataset }) => {
  const rating = dataset?.rating || 4;
  const downloads = dataset?.downloads || dataset?.recordCount || 0;
  const language = dataset?.language || 'العربية';
  const updateFrequency = dataset?.updateFrequency || 'شهري';
  const tags = dataset?.tags || ['بيانات', 'إحصائيات', dataset?.category || 'عام'];

  return (
    <div className="flex flex-col gap-6">
      {/* Main Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700">
          خصائص البيانات
        </div>

        <div className="divide-y divide-gray-50">
          {/* Rating */}
          <div className="p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                <Star size={18} />
              </div>
              <span className="text-sm font-medium text-gray-600">التقييم</span>
            </div>
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  fill={star <= rating ? 'currentColor' : 'none'}
                  className={star <= rating ? '' : 'text-gray-300'}
                />
              ))}
            </div>
          </div>

          {/* Downloads */}
          <div className="p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Download size={18} />
              </div>
              <span className="text-sm font-medium text-gray-600">عدد السجلات</span>
            </div>
            <span className="font-bold text-gray-800">{downloads.toLocaleString()}</span>
          </div>

          {/* Language */}
          <div className="p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Globe size={18} />
              </div>
              <span className="text-sm font-medium text-gray-600">لغة البيانات</span>
            </div>
            <span className="font-bold text-gray-800">{language}</span>
          </div>

          {/* License */}
          <div className="p-4 flex flex-col gap-3 group hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <ShieldCheck size={18} />
              </div>
              <span className="text-sm font-medium text-gray-600">الرخصة</span>
            </div>
            <a href="#" className="text-xs text-[#002B5C] hover:underline mr-11">
              رخصة البيانات المفتوحة
            </a>
          </div>

          {/* Update Frequency */}
          <div className="p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <RefreshCw size={18} />
              </div>
              <span className="text-sm font-medium text-gray-600">التحديث الدوري</span>
            </div>
            <span className="font-bold text-gray-800">{updateFrequency}</span>
          </div>
        </div>
      </div>

      {/* Tags Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700 flex items-center gap-2">
          <Tag size={18} />
          الوسوم
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {tags.map((tag: string, idx: number) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-100"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Dataset Detail Page
const DatasetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [dataset, setDataset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dataset');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    publisher: true,
    meta: true,
    sources: false,
    classifications: false,
  });

  // Activity data (would come from API in real app)
  const activityData = [
    { date: '2025-01', views: 120, downloads: 45 },
    { date: '2025-02', views: 132, downloads: 55 },
    { date: '2025-03', views: 101, downloads: 40 },
    { date: '2025-04', views: 154, downloads: 60 },
    { date: '2025-05', views: 190, downloads: 85 },
    { date: '2025-06', views: 230, downloads: 100 },
  ];

  useEffect(() => {
    const fetchDataset = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await api.getDataset(id);

        if (response.success && response.data) {
          setDataset(response.data);
        } else {
          setError('تعذر تحميل بيانات المجموعة');
        }
      } catch (err) {
        console.error('Error fetching dataset:', err);
        setError('حدث خطأ في الاتصال');
      } finally {
        setLoading(false);
      }
    };

    fetchDataset();
  }, [id]);

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const TABS = [
    { id: 'dataset', label: 'معلومات البيانات', icon: Database },
    { id: 'dashboard', label: 'بيانات الرادار', icon: BarChart3 },
    { id: 'comments', label: 'التعليقات', icon: MessageSquare },
    { id: 'reviews', label: 'التقييم والمراجعة', icon: Star },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#002B5C] animate-spin" />
          <p className="text-gray-600 font-medium">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#002B5C] text-white px-6 py-2 rounded-lg"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  const isFullWidthTab = activeTab === 'dashboard';

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-right" dir="rtl">

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">

            {/* Logo Section */}
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden text-[#002B5C] p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#002B5C] flex items-center justify-center text-white font-bold text-xs">
                  KSA
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[#002B5C] text-lg leading-tight">رادار المستثمر</span>
                  <span className="text-xs text-gray-500">راقب السوق بطريقة المحترفين</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-gray-600 hover:text-[#002B5C] font-medium text-sm transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions & Search */}
            <div className="flex items-center gap-3 mr-auto">
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="بحث في مجموعات البيانات..."
                  className="pl-8 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002B5C]/20 w-64 bg-gray-50"
                />
                <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
              </div>

              <button className="flex items-center gap-1 text-gray-600 hover:text-[#002B5C] px-2 py-1 rounded">
                <Globe size={18} />
                <span className="text-sm font-medium hidden sm:inline">English</span>
              </button>

              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1 bg-[#002B5C] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-900 transition-colors"
                >
                  <LayoutDashboard size={18} />
                  <span className="hidden sm:inline">لوحة التحكم</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-1 text-[#002B5C] hover:bg-[#002B5C]/5 px-3 py-2 rounded-lg transition-colors"
                  >
                    <LogIn size={18} />
                    <span className="text-sm font-bold hidden sm:inline">تسجيل الدخول</span>
                  </Link>

                  <Link
                    to="/register"
                    className="bg-[#002B5C] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-900 transition-colors hidden sm:block"
                  >
                    إنشاء حساب
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="lg:hidden py-4 border-t border-gray-100 mt-4">
              <div className="flex flex-col gap-2">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="text-gray-600 hover:text-[#002B5C] font-medium py-2 px-4 rounded-lg hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <div className="bg-[#002B5C] text-white pt-8 pb-12 relative overflow-hidden">
          {/* Background Pattern */}
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
              <Link to="/" className="hover:text-white transition-colors">الرئيسية</Link>
              <ChevronLeft size={14} />
              <Link to="/datasets" className="hover:text-white transition-colors">مجموعات البيانات</Link>
              <ChevronLeft size={14} />
              <span className="text-white font-medium">{dataset?.nameAr || dataset?.name}</span>
            </nav>

            {/* Title Area */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <Database size={48} className="text-blue-300" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  {dataset?.nameAr || dataset?.name}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-blue-100">
                  <span className="bg-green-500/20 text-green-200 px-3 py-1 rounded-full border border-green-500/30">
                    {dataset?.syncStatus === 'synced' ? 'محدثة' : 'قيد التحديث'}
                  </span>
                  <span className="flex items-center gap-2">
                    • {dataset?.category || 'البيانات الإحصائية والاقتصادية'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white sticky top-[73px] z-40">
          <div className="container mx-auto px-4">
            <div className="flex gap-8 overflow-x-auto no-scrollbar">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-[#002B5C] text-[#002B5C]'
                      : 'border-transparent text-gray-500 hover:text-[#002B5C] hover:border-gray-300'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className={`flex flex-col ${isFullWidthTab ? '' : 'lg:flex-row'} gap-8`}>

            {/* Main Content Area */}
            <div className={`w-full ${isFullWidthTab ? '' : 'lg:w-2/3'} order-2 lg:order-1`}>

              {activeTab === 'dataset' && (
                <div className="space-y-8">
                  {/* About Section */}
                  <section>
                    <h2 className="text-2xl font-bold text-[#002B5C] mb-4 flex items-center gap-2">
                      عن مجموعة البيانات
                    </h2>
                    <div className="prose prose-lg text-gray-600 leading-relaxed max-w-none">
                      <p>
                        {dataset?.descriptionAr || dataset?.description ||
                          `تعتمد هذه المجموعة من البيانات على السجلات الإدارية من الجهات الحكومية ذات العلاقة، وتوفر إحصاءات دقيقة وشاملة. تهدف هذه البيانات إلى دعم صناع القرار والباحثين والمحللين الاقتصاديين.`
                        }
                      </p>
                    </div>
                  </section>

                  {/* Metadata Section */}
                  <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">البيانات الوصفية</h2>

                    <AccordionItem
                      title="الناشر"
                      isOpen={openAccordions.publisher}
                      onClick={() => toggleAccordion('publisher')}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                          <span className="text-gray-500">الناشر الأساسي</span>
                          <span className="font-semibold text-gray-800">{dataset?.source || 'الهيئة العامة للإحصاء'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                          <span className="text-gray-500">الجهات المشاركة</span>
                          <span className="font-semibold text-gray-800 text-left">هيئة الزكاة والضريبة والجمارك، وزارة الطاقة</span>
                        </div>
                      </div>
                    </AccordionItem>

                    <AccordionItem
                      title="تفاصيل إضافية"
                      isOpen={openAccordions.meta}
                      onClick={() => toggleAccordion('meta')}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-500">تاريخ الإنشاء</span>
                          <span className="font-medium" dir="ltr">
                            {dataset?.createdAt ? new Date(dataset.createdAt).toLocaleDateString('en-CA') : '2025-09-01'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-500">تاريخ التحديث</span>
                          <span className="font-medium" dir="ltr">
                            {dataset?.lastSyncAt ? new Date(dataset.lastSyncAt).toLocaleDateString('en-CA') : '2025-10-15'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-500">التغطية المكانية</span>
                          <span className="font-medium text-gray-400">المملكة العربية السعودية</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-500">رابط المصدر</span>
                          <a href="#" className="flex items-center gap-1 text-[#002B5C] hover:underline">
                            زيارة الموقع
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </AccordionItem>

                    <AccordionItem
                      title="المصادر"
                      isOpen={openAccordions.sources}
                      onClick={() => toggleAccordion('sources')}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                          <span className="text-gray-500">اسم المصدر</span>
                          <span className="font-semibold text-gray-800">بوابة البيانات الوطنية</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                          <span className="text-gray-500">رابط الوصول</span>
                          <a href="#" className="flex items-center gap-1 text-[#002B5C] hover:underline">
                            عرض المصدر
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </AccordionItem>

                    <AccordionItem
                      title="التصنيفات"
                      isOpen={openAccordions.classifications}
                      onClick={() => toggleAccordion('classifications')}
                    >
                      <div className="flex flex-col gap-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">المواضيع</h4>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-blue-50 text-[#002B5C] rounded-full text-sm border border-blue-100">
                              {dataset?.category || 'الاقتصاد والإستثمار'}
                            </span>
                            <span className="px-3 py-1 bg-blue-50 text-[#002B5C] rounded-full text-sm border border-blue-100">المالية</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">الكلمات المفتاحية</h4>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded">بيانات</span>
                            <span className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded">إحصائيات</span>
                            <span className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded">تقرير</span>
                          </div>
                        </div>
                      </div>
                    </AccordionItem>
                  </section>

                  {/* Activity Section */}
                  <section className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">نظرة عامة على النشاط</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-lg">
                        <div className="bg-white p-3 rounded-full shadow-sm text-blue-600">
                          <Eye size={24} />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-800">{dataset?.viewCount || 17}</div>
                          <div className="text-sm text-gray-500">المشاهدات</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-lg">
                        <div className="bg-white p-3 rounded-full shadow-sm text-[#002B5C]">
                          <Download size={24} />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-800">{dataset?.downloadCount || 3}</div>
                          <div className="text-sm text-gray-500">التنزيلات</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-lg">
                        <div className="bg-white p-3 rounded-full shadow-sm text-yellow-500">
                          <Star size={24} />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-800">{dataset?.ratingCount || 0}</div>
                          <div className="text-sm text-gray-500">التقييم</div>
                        </div>
                      </div>
                    </div>

                    <ActivityChart data={activityData} />
                  </section>

                  {/* Rating Section */}
                  <section className="bg-gray-50 rounded-xl p-6 border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">تقييم محتوى الصفحة</h3>
                      <p className="text-sm text-gray-500">ساعدنا في تحسين جودة البيانات المفتوحة</p>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          className={`transition-colors ${star <= userRating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
                          onClick={() => setUserRating(star)}
                        >
                          <Star size={28} fill="currentColor" />
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'dashboard' && (
                <div className="bg-white rounded-xl border border-gray-200 p-8">
                  <div className="text-center py-12">
                    <BarChart3 size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">لوحة بيانات الرادار</h3>
                    <p className="text-gray-500 mb-6">استعرض البيانات بطريقة تفاعلية ومرئية</p>
                    <Link
                      to={`/dataset/${id}`}
                      className="bg-[#002B5C] text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-900 transition-colors inline-flex items-center gap-2"
                    >
                      <Eye size={20} />
                      عرض البيانات التفصيلية
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="bg-white rounded-xl border border-gray-200 p-8">
                  <div className="text-center py-12">
                    <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">التعليقات</h3>
                    <p className="text-gray-500">لا توجد تعليقات حتى الآن. كن أول من يعلق!</p>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="bg-white rounded-xl border border-gray-200 p-8">
                  <div className="text-center py-12">
                    <Star size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">التقييمات والمراجعات</h3>
                    <p className="text-gray-500">لا توجد مراجعات حتى الآن. شاركنا رأيك!</p>
                  </div>
                </div>
              )}

            </div>

            {/* Sidebar */}
            {!isFullWidthTab && (
              <aside className="w-full lg:w-1/3 order-1 lg:order-2">
                <Sidebar dataset={dataset} />
              </aside>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20 pt-12 pb-6">
        <div className="container mx-auto px-4">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

            <div>
              <h3 className="font-bold text-[#002B5C] mb-4">نظرة عامة</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/" className="hover:text-[#002B5C]">عن البوابة</Link></li>
                <li><a href="#" className="hover:text-[#002B5C]">سياسة البيانات المفتوحة</a></li>
                <li><a href="#" className="hover:text-[#002B5C]">اتفاقية الاستخدام</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-[#002B5C] mb-4">روابط عامة</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-[#002B5C]">الفعاليات</a></li>
                <li><a href="#" className="hover:text-[#002B5C]">الأخبار</a></li>
                <li><a href="#" className="hover:text-[#002B5C]">المشاركة الإلكترونية</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-[#002B5C] mb-4">الدعم الفني والمساعدة</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-[#002B5C]">الأسئلة الشائعة</a></li>
                <li><a href="#" className="hover:text-[#002B5C]">تواصل معنا</a></li>
                <li><a href="#" className="hover:text-[#002B5C]">خريطة الموقع</a></li>
              </ul>
            </div>

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
                  SDAIA
                </div>
              </div>
            </div>

          </div>

          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>© 2025 رادار المستثمر. جميع الحقوق محفوظة.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gray-800">إمكانية الوصول</a>
              <span className="text-gray-300">|</span>
              <a href="#" className="hover:text-gray-800">سياسة الخصوصية</a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default DatasetDetailPage;
