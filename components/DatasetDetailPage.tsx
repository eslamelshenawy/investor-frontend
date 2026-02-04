/**
 * Dataset Detail Page - صفحة تفاصيل مجموعة البيانات
 * Based on Saudi Open Data Platform design - Exact Match
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

// Navigation items - matching the screenshot exactly
const NAV_ITEMS = [
  { label: 'الرئيسية', href: '/' },
  { label: 'مجموعات البيانات', href: '/datasets' },
  { label: 'الجهات', href: '/followers' },
  { label: 'واجهات برمجة التطبيقات', href: '#' },
  { label: 'المجتمع', href: '#' },
  { label: 'البيانات المرجعية', href: '#' },
  { label: 'إمكانية الوصول', href: '#' },
];

// Tabs matching the screenshot
const TABS = [
  { id: 'dataset', label: 'مجموعة البيانات' },
  { id: 'dashboard', label: 'لوحة القيادة' },
  { id: 'sources', label: 'المصادر' },
  { id: 'classifications', label: 'التصنيفات' },
  { id: 'api', label: 'واجهات برمجة التطبيقات' },
  { id: 'comments', label: 'التعليقات' },
  { id: 'reviews', label: 'التقييم والمراجعة' },
];

// Accordion Component
const AccordionItem: React.FC<{
  title: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ title, isOpen, onClick, children }) => (
  <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden bg-white">
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
    >
      <span className="font-bold text-gray-700">{title}</span>
      {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
    </button>
    {isOpen && (
      <div className="p-4 bg-white border-t border-gray-100 text-sm text-gray-600">
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
          <Bar dataKey="downloads" fill="#002B5C" radius={[4, 4, 0, 0]} barSize={24} name="التنزيلات" />
          <Bar dataKey="views" fill="#00A3E0" radius={[4, 4, 0, 0]} barSize={24} name="المشاهدات" />
        </BarChart>
      </ResponsiveContainer>
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
    meta: false,
  });

  // Activity data
  const activityData = [
    { date: '2025-01', views: 50, downloads: 80 },
    { date: '2025-02', views: 70, downloads: 90 },
    { date: '2025-03', views: 120, downloads: 150 },
    { date: '2025-04', views: 150, downloads: 180 },
    { date: '2025-05', views: 180, downloads: 220 },
    { date: '2025-06', views: 240, downloads: 200 },
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
          // Use fallback data
          setDataset({
            id: id,
            name: 'التجارة الدولية لشهر سبتمبر 2025',
            nameAr: 'التجارة الدولية لشهر سبتمبر 2025',
            category: 'البيانات الإحصائية والاقتصادية',
            source: 'الهيئة العامة للإحصاء',
            recordCount: 1204,
            syncStatus: 'synced',
            description: 'تعتمد هذه المجموعة من البيانات على السجلات الإدارية من الجهات الحكومية ذات العلاقة (هيئة الزكاة والضريبة والجمارك، وزارة الطاقة، وزارة الصناعة والثروة المعدنية)، وتوفر إحصاءات دقيقة وشاملة حول حركة التجارة الدولية للمملكة لشهر سبتمبر 2025. تشمل البيانات حجم الصادرات والواردات حسب الدول، والمنافذ الجمركية، والسلع المصنفة حسب النظام المنسق. تهدف هذه البيانات إلى دعم صناع القرار والباحثين والمحللين الاقتصاديين في فهم اتجاهات التجارة الخارجية.',
          });
        }
      } catch (err) {
        console.error('Error fetching dataset:', err);
        // Use fallback data
        setDataset({
          id: id,
          name: 'التجارة الدولية لشهر سبتمبر 2025',
          nameAr: 'التجارة الدولية لشهر سبتمبر 2025',
          category: 'البيانات الإحصائية والاقتصادية',
          source: 'الهيئة العامة للإحصاء',
          recordCount: 1204,
          syncStatus: 'synced',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDataset();
  }, [id]);

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

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

  const rating = 4;
  const downloads = dataset?.recordCount || 1204;

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">

      {/* Header - Top Bar with Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Right Side - Logo */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#002B5C] flex items-center justify-center text-white font-bold text-xs">
                  KSA
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[#002B5C] text-base leading-tight">رادار المستثمر</span>
                  <span className="text-[10px] text-gray-500">راقب السوق بطريقة المحترفين</span>
                </div>
              </Link>
            </div>

            {/* Center - Navigation */}
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

            {/* Left Side - Search & Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="بحث في مجموعات البيانات..."
                  className="w-56 pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002B5C]/20 bg-gray-50"
                />
                <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
              </div>

              <button className="flex items-center gap-1 text-gray-600 hover:text-[#002B5C] px-2 py-1">
                <Globe size={16} />
                <span className="text-sm">English</span>
              </button>

              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1 bg-[#002B5C] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-900 transition-colors"
                >
                  <LayoutDashboard size={16} />
                  لوحة التحكم
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-1 text-[#002B5C] hover:bg-[#002B5C]/5 px-3 py-2 rounded-lg transition-colors border border-[#002B5C]"
                  >
                    <LogIn size={16} />
                    <span className="text-sm font-bold">تسجيل الدخول</span>
                  </Link>

                  <Link
                    to="/register"
                    className="bg-[#00A3E0] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#0090c7] transition-colors"
                  >
                    طلب مجموعة بيانات
                  </Link>
                </>
              )}

              <button
                className="lg:hidden text-[#002B5C] p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="lg:hidden py-4 border-t border-gray-100">
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
        {/* Hero Section - Blue Background */}
        <div className="bg-[#002B5C] text-white py-10 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-blue-200 mb-6">
              <Link to="/" className="hover:text-white transition-colors">الرئيسية</Link>
              <ChevronLeft size={14} />
              <Link to="/datasets" className="hover:text-white transition-colors">مجموعات البيانات</Link>
              <ChevronLeft size={14} />
              <span className="text-white">{dataset?.nameAr || dataset?.name}</span>
            </nav>

            {/* Title Area - Icon on Right */}
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {dataset?.nameAr || dataset?.name || 'التجارة الدولية لشهر سبتمبر 2025'}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="bg-[#00A3E0] text-white px-4 py-1 rounded-full font-medium">
                    محدثة
                  </span>
                  <span className="text-blue-200">
                    • {dataset?.category || 'البيانات الإحصائية والاقتصادية'}
                  </span>
                </div>
              </div>
              <div className="hidden md:flex bg-white/10 p-5 rounded-2xl backdrop-blur-sm">
                <Database size={56} className="text-white/80" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Sticky */}
        <div className="border-b border-gray-200 bg-white sticky top-16 z-40">
          <div className="container mx-auto px-4">
            <div className="flex gap-0 overflow-x-auto no-scrollbar">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#002B5C] text-[#002B5C]'
                      : 'border-transparent text-gray-500 hover:text-[#002B5C]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar - LEFT Side */}
            <aside className="w-full lg:w-80 order-2 lg:order-1 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-36">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 font-bold text-gray-800 text-center">
                  خصائص البيانات
                </div>

                {/* Properties */}
                <div className="divide-y divide-gray-100">
                  {/* Rating */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-yellow-50 rounded-lg flex items-center justify-center">
                        <Star size={18} className="text-yellow-500" />
                      </div>
                      <span className="text-sm text-gray-600">التقييم</span>
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
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Download size={18} className="text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-600">عدد التحميلات</span>
                    </div>
                    <span className="font-bold text-gray-800">{downloads.toLocaleString()}</span>
                  </div>

                  {/* Language */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Globe size={18} className="text-purple-600" />
                      </div>
                      <span className="text-sm text-gray-600">لغة البيانات</span>
                    </div>
                    <span className="font-bold text-gray-800">العربية</span>
                  </div>

                  {/* License */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                        <ShieldCheck size={18} className="text-green-600" />
                      </div>
                      <span className="text-sm text-gray-600">الرخصة</span>
                    </div>
                    <a href="#" className="text-sm text-[#00A3E0] hover:underline mr-11 block">
                      رخصة البيانات المفتوحة
                    </a>
                  </div>

                  {/* Update Frequency */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                        <RefreshCw size={18} className="text-orange-600" />
                      </div>
                      <span className="text-sm text-gray-600">التحديث الدوري</span>
                    </div>
                    <span className="font-bold text-gray-800">شهري</span>
                  </div>
                </div>

                {/* Tags Section */}
                <div className="border-t border-gray-200">
                  <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                    <Tag size={16} className="text-gray-500" />
                    <span className="font-bold text-gray-800">الوسوم</span>
                  </div>
                  <div className="p-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">الدولية</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">التجارة</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">September 2025</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">International</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">Trade</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content - RIGHT Side */}
            <div className="flex-1 order-1 lg:order-2">

              {activeTab === 'dataset' && (
                <div className="space-y-8">
                  {/* About Section */}
                  <section>
                    <h2 className="text-xl font-bold text-[#002B5C] mb-4">
                      عن مجموعة البيانات
                    </h2>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {dataset?.description || dataset?.descriptionAr ||
                        'تعتمد هذه المجموعة من البيانات على السجلات الإدارية من الجهات الحكومية ذات العلاقة (هيئة الزكاة والضريبة والجمارك، وزارة الطاقة، وزارة الصناعة والثروة المعدنية)، وتوفر إحصاءات دقيقة وشاملة حول حركة التجارة الدولية للمملكة لشهر سبتمبر 2025. تشمل البيانات حجم الصادرات والواردات حسب الدول، والمنافذ الجمركية، والسلع المصنفة حسب النظام المنسق. تهدف هذه البيانات إلى دعم صناع القرار والباحثين والمحللين الاقتصاديين في فهم اتجاهات التجارة الخارجية.'
                      }
                    </p>
                  </section>

                  {/* Metadata Section */}
                  <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">البيانات الوصفية</h2>

                    <AccordionItem
                      title="الناشر"
                      isOpen={openAccordions.publisher}
                      onClick={() => toggleAccordion('publisher')}
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-500">الناشر الأساسي</span>
                          <span className="font-medium text-gray-800">{dataset?.source || 'الهيئة العامة للإحصاء'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-500">الجهات المشاركة</span>
                          <span className="font-medium text-gray-800 text-left">هيئة الزكاة والضريبة والجمارك، وزارة الطاقة</span>
                        </div>
                      </div>
                    </AccordionItem>

                    <AccordionItem
                      title="تفاصيل إضافية"
                      isOpen={openAccordions.meta}
                      onClick={() => toggleAccordion('meta')}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-500">تاريخ الإنشاء</span>
                          <span className="font-medium" dir="ltr">2025-09-01</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-500">تاريخ التحديث</span>
                          <span className="font-medium" dir="ltr">2025-10-15</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-500">التغطية المكانية</span>
                          <span className="font-medium text-gray-400">غير متوفر</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-500">رابط المصدر</span>
                          <a href="#" className="flex items-center gap-1 text-[#00A3E0] hover:underline">
                            زيارة الموقع
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </AccordionItem>
                  </section>

                  {/* Activity Section */}
                  <section className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 pb-3 border-b border-gray-100">نظرة عامة على النشاط</h2>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Eye size={20} className="text-blue-600" />
                          <span className="text-2xl font-bold text-gray-800">17</span>
                        </div>
                        <div className="text-xs text-gray-500">المشاهدات</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Download size={20} className="text-[#002B5C]" />
                          <span className="text-2xl font-bold text-gray-800">3</span>
                        </div>
                        <div className="text-xs text-gray-500">التنزيلات</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Star size={20} className="text-yellow-500" />
                          <span className="text-2xl font-bold text-gray-800">0</span>
                        </div>
                        <div className="text-xs text-gray-500">التقييم</div>
                      </div>
                    </div>

                    <ActivityChart data={activityData} />
                  </section>

                  {/* Rating Section */}
                  <section className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
                            <Star size={32} fill="currentColor" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab !== 'dataset' && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <Database size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">المحتوى قيد التطوير لهذا التبويب</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16 pt-12 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
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
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-[#002B5C] hover:text-white transition-colors">
                  <Instagram size={18} />
                </a>
                <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-[#002B5C] hover:text-white transition-colors">
                  <Twitter size={18} />
                </a>
                <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-[#002B5C] hover:text-white transition-colors">
                  <Youtube size={18} />
                </a>
                <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-[#002B5C] hover:text-white transition-colors">
                  <Linkedin size={18} />
                </a>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="h-10 w-16 border border-gray-200 rounded flex items-center justify-center text-[9px] text-gray-400 font-bold">
                  SDAIA
                </div>
                <div className="h-10 w-16 border border-gray-200 rounded flex items-center justify-center text-[9px] text-gray-400 font-bold">
                  VISION 2030
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>© 2025 المنصة الوطنية للبيانات المفتوحة. جميع الحقوق محفوظة.</p>
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
