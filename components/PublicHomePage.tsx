import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Activity,
  Search,
  ChevronLeft,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  Shield,
  Zap,
  Globe,
  ArrowLeft,
  Star,
  Download,
  Eye,
  Database,
  LineChart,
  Sparkles,
  CheckCircle,
  Play,
  Building2,
  Briefcase,
  Target,
  Layers
} from 'lucide-react';

// Sample featured datasets
const FEATURED_DATASETS = [
  {
    id: 'trade-sept-2025',
    title: 'التجارة الدولية لشهر سبتمبر 2025',
    description: 'إحصاءات شاملة حول حركة التجارة الدولية للمملكة',
    category: 'البيانات الاقتصادية',
    views: 17420,
    downloads: 3204,
    rating: 4.5,
    isNew: true,
    tags: ['تجارة', 'صادرات', 'واردات']
  },
  {
    id: 'labor-market-q3',
    title: 'سوق العمل - الربع الثالث 2025',
    description: 'تحليل شامل لمؤشرات سوق العمل والتوظيف',
    category: 'البيانات الاجتماعية',
    views: 12350,
    downloads: 2180,
    rating: 4.8,
    isNew: false,
    tags: ['توظيف', 'بطالة', 'عمالة']
  },
  {
    id: 'real-estate-index',
    title: 'مؤشر العقارات السعودي',
    description: 'تتبع أسعار العقارات والإيجارات في المدن الرئيسية',
    category: 'البيانات العقارية',
    views: 9870,
    downloads: 1540,
    rating: 4.2,
    isNew: true,
    tags: ['عقارات', 'أسعار', 'إيجارات']
  },
  {
    id: 'energy-production',
    title: 'إنتاج الطاقة والتعدين',
    description: 'بيانات الإنتاج النفطي والتعديني الشهرية',
    category: 'البيانات الصناعية',
    views: 15200,
    downloads: 2890,
    rating: 4.6,
    isNew: false,
    tags: ['نفط', 'طاقة', 'تعدين']
  }
];

// Sample statistics
const PLATFORM_STATS = [
  { label: 'مجموعة بيانات', value: '1,250+', icon: Database },
  { label: 'مستخدم نشط', value: '45,000+', icon: Users },
  { label: 'جهة حكومية', value: '85+', icon: Building2 },
  { label: 'تحميل شهري', value: '120,000+', icon: Download }
];

// Features list
const FEATURES = [
  {
    icon: BarChart3,
    title: 'لوحات تحكم تفاعلية',
    description: 'استعرض البيانات من خلال لوحات تحكم تفاعلية وقابلة للتخصيص'
  },
  {
    icon: Zap,
    title: 'إشارات ذكية',
    description: 'تنبيهات فورية عند تغير المؤشرات الاقتصادية المهمة'
  },
  {
    icon: Target,
    title: 'تحليل متقدم',
    description: 'أدوات تحليل قوية لاستخلاص الرؤى من البيانات'
  },
  {
    icon: Shield,
    title: 'بيانات موثوقة',
    description: 'مصادر رسمية من الجهات الحكومية المعتمدة'
  }
];

const PublicHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(isAuthenticated ? `/datasets?q=${encodeURIComponent(searchQuery)}` : `/login?redirect=/datasets&q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/80 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="h-16 lg:h-20 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Activity size={24} className="text-white" />
              </div>
              <div>
                <h1 className="font-black text-lg lg:text-xl text-gray-900 leading-tight">رادار المستثمر</h1>
                <p className="text-[10px] lg:text-xs text-blue-600 font-bold uppercase tracking-wider">Investor Radar</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">المميزات</a>
              <a href="#datasets" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">البيانات</a>
              <a href="#stats" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">الإحصائيات</a>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 lg:px-6 py-2 lg:py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  الذهاب للوحة التحكم
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors hidden sm:block"
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-4 lg:px-6 py-2 lg:py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
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
      <section className="relative bg-gradient-to-br from-[#002B5C] via-[#003d7a] to-[#002B5C] text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-8 border border-white/20">
              <Sparkles size={16} className="text-yellow-400" />
              <span>المنصة الرائدة للبيانات المفتوحة في المملكة</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-6 leading-tight">
              راقب السوق
              <span className="block text-transparent bg-clip-text bg-gradient-to-l from-cyan-400 to-blue-400">
                بطريقة المحترفين
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              اكتشف وحلل البيانات الاقتصادية والاجتماعية من مصادر رسمية موثوقة.
              أدوات متقدمة لاتخاذ قرارات استثمارية مدروسة.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن مؤشر، تقرير، أو مجموعة بيانات..."
                  className="w-full py-4 lg:py-5 px-6 pr-14 text-gray-900 bg-white rounded-2xl shadow-2xl shadow-black/20 text-base lg:text-lg focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors"
                >
                  <Search size={22} />
                </button>
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
              </div>
            </form>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 bg-white text-blue-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg"
                >
                  <Play size={20} />
                  الذهاب للوحة التحكم
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/register')}
                    className="flex items-center gap-2 bg-white text-blue-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg"
                  >
                    <Play size={20} />
                    ابدأ الآن مجاناً
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20"
                  >
                    تصفح البيانات
                    <ArrowLeft size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-12 lg:py-16 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {PLATFORM_STATS.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 lg:p-8 text-center shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all group"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon size={28} />
                </div>
                <div className="text-2xl lg:text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <span className="inline-block bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
              لماذا رادار المستثمر؟
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
              أدوات متكاملة لتحليل البيانات
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              نوفر لك مجموعة شاملة من الأدوات والمميزات لمساعدتك في اتخاذ قرارات مبنية على البيانات
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-50 rounded-2xl p-6 lg:p-8 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 border border-transparent hover:border-blue-100 transition-all group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Datasets Section */}
      <section id="datasets" className="py-16 lg:py-24 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
            <div>
              <span className="inline-block bg-green-50 text-green-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
                مجموعات البيانات
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-2">
                أحدث البيانات المتاحة
              </h2>
              <p className="text-lg text-gray-600">
                تصفح أحدث مجموعات البيانات من الجهات الحكومية
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 lg:mt-0 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold transition-colors group"
            >
              عرض جميع البيانات
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURED_DATASETS.map((dataset) => (
              <div
                key={dataset.id}
                onClick={() => navigate('/login')}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Database size={24} />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {dataset.category}
                      </span>
                      {dataset.isNew && (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded mr-2">
                          جديد
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star size={16} fill="currentColor" />
                    <span className="text-sm font-bold text-gray-700">{dataset.rating}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {dataset.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {dataset.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {dataset.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye size={16} />
                      {dataset.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download size={16} />
                      {dataset.downloads.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-blue-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    استعراض
                    <ArrowLeft size={16} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[#002B5C] to-[#003d7a] text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-black mb-6">
              ابدأ رحلتك في عالم البيانات اليوم
            </h2>
            <p className="text-lg lg:text-xl text-blue-100 mb-10 leading-relaxed">
              انضم إلى آلاف المستثمرين والمحللين الذين يعتمدون على رادار المستثمر لاتخاذ قراراتهم
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center justify-center gap-2 bg-white text-blue-900 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg text-lg"
                >
                  <CheckCircle size={22} />
                  الذهاب للوحة التحكم
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/register')}
                    className="flex items-center justify-center gap-2 bg-white text-blue-900 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg text-lg"
                  >
                    <CheckCircle size={22} />
                    إنشاء حساب مجاني
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20 text-lg"
                  >
                    تسجيل الدخول
                  </button>
                </>
              )}
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="flex items-center gap-2 text-sm">
                <Shield size={20} />
                <span>بيانات آمنة</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe size={20} />
                <span>مصادر رسمية</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap size={20} />
                <span>تحديث فوري</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <Activity size={20} className="text-white" />
                </div>
                <div>
                  <span className="font-bold text-gray-900">رادار المستثمر</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                المنصة الرائدة للبيانات المفتوحة والتحليلات الاقتصادية في المملكة العربية السعودية
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">نظرة عامة</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">عن المنصة</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">سياسة البيانات</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">اتفاقية الاستخدام</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">الموارد</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">مركز المساعدة</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">دليل المطورين</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">الأسئلة الشائعة</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">تواصل معنا</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">الدعم الفني</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">اقتراحات</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">الشراكات</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© 2025 رادار المستثمر. جميع الحقوق محفوظة.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-900 transition-colors">سياسة الخصوصية</a>
              <a href="#" className="hover:text-gray-900 transition-colors">الشروط والأحكام</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom,20px)] bg-white/95 backdrop-blur-lg border-t border-gray-200 z-50 lg:hidden flex justify-around items-center pt-3 px-4 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        <button
          onClick={() => navigate('/')}
          className="flex flex-col items-center justify-center space-y-1 text-blue-600"
        >
          <Activity size={24} strokeWidth={2.5} />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>

        {isAuthenticated ? (
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30"
          >
            لوحة التحكم
          </button>
        ) : (
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30"
          >
            إنشاء حساب
          </button>
        )}

        {!isAuthenticated && (
            <span className="text-[10px] font-bold">دخول</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PublicHomePage;
