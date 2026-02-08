/**
 * ExploreDashboardPage - مركز الاكتشاف
 * الصفحة الرئيسية للمستخدم بعد تسجيل الدخول
 * تجمع نظرة عامة على كل أقسام المنصة
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../src/services/api';
import {
  Search,
  Database,
  Zap,
  LayoutDashboard,
  Clock,
  UserSearch,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Eye,
  ArrowUpLeft,
  Loader2,
  RefreshCw,
  Tag,
  Building2,
  Users,
  BarChart3,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Activity,
  Globe,
  Shield,
  Minus,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface OverviewStats {
  totalDatasets: number;
  totalCategories: number;
  totalSignals: number;
  activeSignals: number;
  totalUsers: number;
  totalContent: number;
  totalViews: number;
  newThisWeek: number;
  weeklyGrowth: number;
}

interface TrendingTopic {
  tag: string;
  count: number;
  countFormatted: string;
  type: string;
  color: string;
}

interface SignalItem {
  id: string;
  title: string;
  titleAr: string;
  type: string;
  trend: string;
  impactScore: number;
  summary?: string;
  summaryAr?: string;
  sector?: string;
  region?: string;
  createdAt: string;
}

interface DatasetItem {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  source: string;
  recordCount?: number;
  createdAt?: string;
}

interface ContentItem {
  id: string;
  title: string;
  titleAr: string;
  type: string;
  excerpt?: string;
  excerptAr?: string;
  coverImage?: string;
  viewCount: number;
  likeCount?: number;
  publishedAt: string;
  tags?: string | string[];
}

interface SourceItem {
  name: string;
  count: number;
}

interface QuickAccessItem {
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  color: string;
  bgColor: string;
}

// ============================================
// HELPERS
// ============================================

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'صباح الخير';
  if (hour < 18) return 'مساء الخير';
  return 'مساء النور';
}

function formatNumber(num: number): string {
  if (!num) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString('ar-SA');
}

function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  return date.toLocaleDateString('ar-SA');
}

function safeParseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    try { return JSON.parse(tags); } catch { return []; }
  }
  return [];
}

// ============================================
// CONSTANTS
// ============================================

const SIGNAL_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  OPPORTUNITY: { label: 'فرصة', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: TrendingUp },
  RISK: { label: 'خطر', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: TrendingDown },
  TREND: { label: 'اتجاه', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Activity },
  ALERT: { label: 'تنبيه', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: AlertTriangle },
};

const CONTENT_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ARTICLE: { label: 'مقال', color: 'text-blue-700', bg: 'bg-blue-50' },
  REPORT: { label: 'تقرير', color: 'text-purple-700', bg: 'bg-purple-50' },
  ANALYSIS: { label: 'تحليل', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  INSIGHT: { label: 'رؤية', color: 'text-amber-700', bg: 'bg-amber-50' },
  NEWS: { label: 'خبر', color: 'text-red-700', bg: 'bg-red-50' },
};

const QUICK_ACCESS_ITEMS: QuickAccessItem[] = [
  {
    title: 'مجموعات البيانات',
    description: 'استعرض أكثر من 17,000 مجموعة بيانات حكومية',
    icon: Database,
    route: '/datasets',
    color: 'text-blue-600',
    bgColor: 'from-blue-500 to-blue-600',
  },
  {
    title: 'إشارات السوق',
    description: 'إشارات ذكية للفرص والمخاطر الاستثمارية',
    icon: Zap,
    route: '/signals',
    color: 'text-amber-600',
    bgColor: 'from-amber-500 to-amber-600',
  },
  {
    title: 'اللوحات الرسمية',
    description: 'لوحات بيانات تفاعلية من مصادر موثوقة',
    icon: LayoutDashboard,
    route: '/dashboards',
    color: 'text-purple-600',
    bgColor: 'from-purple-500 to-purple-600',
  },
  {
    title: 'سجل التغييرات',
    description: 'تابع آخر التحديثات والتطورات',
    icon: Clock,
    route: '/timeline',
    color: 'text-emerald-600',
    bgColor: 'from-emerald-500 to-emerald-600',
  },
  {
    title: 'اكتشاف الخبراء',
    description: 'تواصل مع خبراء البيانات والتحليل',
    icon: UserSearch,
    route: '/experts',
    color: 'text-indigo-600',
    bgColor: 'from-indigo-500 to-indigo-600',
  },
  {
    title: 'آخر المحتوى',
    description: 'مقالات وتقارير وتحليلات المنصة',
    icon: FileText,
    route: '/feed',
    color: 'text-rose-600',
    bgColor: 'from-rose-500 to-rose-600',
  },
];

// ============================================
// MAIN COMPONENT
// ============================================

interface ExploreDashboardPageProps {
  user?: { id: string; name?: string; nameAr?: string; role: string };
  onOpenWizard?: () => void;
}

const ExploreDashboardPage: React.FC<ExploreDashboardPageProps> = ({ user, onOpenWizard }) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const currentUser = user || authUser;

  // State
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [signals, setSignals] = useState<SignalItem[]>([]);
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs for horizontal scroll
  const datasetsScrollRef = useRef<HTMLDivElement>(null);

  // Fetch all data in parallel
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsRes, trendingRes, signalsRes, datasetsRes, contentRes, sourcesRes] = await Promise.all([
        api.getOverviewStats().catch(() => null),
        api.getTrendingTopics().catch(() => null),
        api.getLatestSignals(4).catch(() => null),
        api.getDatasets({ limit: 8 }).catch(() => null),
        api.getFeed({ limit: 6 }).catch(() => null),
        api.getSourceStats().catch(() => null),
      ]);

      if (statsRes?.success && statsRes.data) setStats(statsRes.data as any);
      if (trendingRes?.success && trendingRes.data) {
        const d = trendingRes.data as any;
        setTrending([...(d.topics || []), ...(d.tags || []), ...(d.categories || [])].slice(0, 15));
      }
      if (signalsRes?.success && signalsRes.data) {
        const arr = Array.isArray(signalsRes.data) ? signalsRes.data : [];
        setSignals(arr.slice(0, 4) as any);
      }
      if (datasetsRes?.success && datasetsRes.data) {
        const arr = Array.isArray(datasetsRes.data) ? datasetsRes.data : [];
        setDatasets(arr.slice(0, 8) as any);
      }
      if (contentRes?.success && contentRes.data) {
        const arr = Array.isArray(contentRes.data) ? contentRes.data : [];
        setContent(arr.slice(0, 6) as any);
      }
      if (sourcesRes?.success && sourcesRes.data) {
        const d = sourcesRes.data as any;
        const srcArr = d.sources || d;
        if (Array.isArray(srcArr)) setSources(srcArr.slice(0, 12));
      }
    } catch (err) {
      console.error('[ExploreDashboard] Error:', err);
      setError('فشل تحميل البيانات. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Horizontal scroll for datasets
  const scrollDatasets = (direction: 'left' | 'right') => {
    if (datasetsScrollRef.current) {
      const amount = 300;
      datasetsScrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  const greeting = getTimeBasedGreeting();
  const userName = (currentUser as any)?.nameAr || (currentUser as any)?.name || 'مستخدم';

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 animate-pulse">
          <Sparkles size={32} className="text-white" />
        </div>
        <Loader2 size={32} className="text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">جاري تحميل مركز الاكتشاف...</p>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen pb-8">
      {/* ==================== HERO SECTION ==================== */}
      <div className="bg-gradient-to-bl from-blue-700 via-blue-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Greeting + AI Button */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                {greeting}، {userName}
              </h1>
              <p className="text-blue-200 text-sm lg:text-base">
                اكتشف أحدث البيانات والإشارات الذكية من المصادر الحكومية السعودية
              </p>
            </div>
            {onOpenWizard && (
              <button
                onClick={onOpenWizard}
                className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              >
                <Sparkles size={18} />
                المستشار الذكي
              </button>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative max-w-2xl">
              <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في البيانات، الإشارات، المحتوى، الخبراء..."
                className="w-full pr-12 pl-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all text-sm"
              />
            </div>
          </form>

          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
              <StatBadge icon={Database} label="مجموعة بيانات" value={stats.totalDatasets} />
              <StatBadge icon={Zap} label="إشارة ذكية" value={stats.totalSignals} />
              <StatBadge icon={Users} label="مستخدم" value={stats.totalUsers} />
              <StatBadge icon={FileText} label="محتوى منشور" value={stats.totalContent} />
            </div>
          )}
        </div>
      </div>

      {/* ==================== ERROR STATE ==================== */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-600 shrink-0" />
            <p className="text-red-700 text-sm flex-1">{error}</p>
            <button
              onClick={fetchData}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw size={14} />
              إعادة
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ==================== QUICK ACCESS ==================== */}
        <section className="mt-8">
          <SectionHeader title="الوصول السريع" subtitle="انتقل مباشرة إلى أقسام المنصة" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUICK_ACCESS_ITEMS.map((item) => (
              <div
                key={item.route}
                onClick={() => navigate(item.route)}
                className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.bgColor} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    <item.icon size={22} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                  </div>
                  <ArrowUpLeft size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================== TRENDING TOPICS ==================== */}
        {trending.length > 0 && (
          <section className="mt-10">
            <SectionHeader title="المواضيع الرائجة" subtitle="أكثر المواضيع تداولاً هذا الأسبوع" />
            <div className="flex flex-wrap gap-2">
              {trending.map((topic, i) => (
                <button
                  key={`${topic.tag}-${i}`}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(topic.tag)}`)}
                  className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all"
                >
                  <Tag size={14} className="text-gray-400" />
                  <span>{topic.tag}</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">
                    {topic.countFormatted || topic.count}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ==================== LATEST SIGNALS ==================== */}
        {signals.length > 0 && (
          <section className="mt-10">
            <SectionHeader
              title="آخر إشارات السوق"
              subtitle="إشارات ذكية مبنية على تحليل البيانات"
              action={{ label: 'عرض الكل', route: '/signals' }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {signals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} onClick={() => navigate(`/signals`)} />
              ))}
            </div>
          </section>
        )}

        {/* ==================== RECENT DATASETS ==================== */}
        {datasets.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <SectionHeader
                title="أحدث مجموعات البيانات"
                subtitle="آخر البيانات المضافة والمحدّثة"
                action={{ label: 'استعرض الكل', route: '/datasets' }}
              />
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => scrollDatasets('right')}
                  className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight size={16} className="text-gray-600" />
                </button>
                <button
                  onClick={() => scrollDatasets('left')}
                  className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
            <div
              ref={datasetsScrollRef}
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {datasets.map((ds) => (
                <DatasetCard key={ds.id} dataset={ds} onClick={() => navigate(`/dataset/${ds.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* ==================== LATEST CONTENT ==================== */}
        {content.length > 0 && (
          <section className="mt-10">
            <SectionHeader
              title="آخر المحتوى"
              subtitle="مقالات وتقارير وتحليلات المنصة"
              action={{ label: 'عرض الكل', route: '/feed' }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.map((item) => (
                <ContentCard key={item.id} content={item} onClick={() => navigate(`/content/${item.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* ==================== GOVERNMENT SOURCES ==================== */}
        {sources.length > 0 && (
          <section className="mt-10 mb-8">
            <SectionHeader
              title="المصادر الحكومية"
              subtitle="الجهات التي تزوّد المنصة بالبيانات"
              action={{ label: 'عرض الكل', route: '/sources' }}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {sources.map((source, i) => (
                <div
                  key={`${source.name}-${i}`}
                  onClick={() => navigate(`/datasets?category=${encodeURIComponent(source.name)}`)}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group text-center"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:from-blue-50 group-hover:to-blue-100 transition-colors">
                    <Building2 size={20} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1 line-clamp-2 leading-snug">{source.name}</h4>
                  <p className="text-xs text-gray-500">
                    {formatNumber(source.count)} مجموعة بيانات
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

// ============================================
// SUB-COMPONENTS
// ============================================

/** Stats badge in hero */
const StatBadge = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 p-3 lg:p-4 text-center">
    <Icon size={20} className="text-blue-300 mx-auto mb-1.5" />
    <p className="text-xl lg:text-2xl font-bold text-white">{formatNumber(value)}</p>
    <p className="text-blue-200/70 text-xs mt-0.5">{label}</p>
  </div>
);

/** Section header with optional action */
const SectionHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: { label: string; route: string };
}) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      {action && (
        <button
          onClick={() => navigate(action.route)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 shrink-0"
        >
          {action.label}
          <ChevronLeft size={16} />
        </button>
      )}
    </div>
  );
};

/** Signal card */
const SignalCard = React.memo(({ signal, onClick }: { signal: SignalItem; onClick: () => void }) => {
  const config = SIGNAL_TYPE_CONFIG[signal.type] || SIGNAL_TYPE_CONFIG.TREND;
  const SignalIcon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all cursor-pointer group ${config.bg}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${config.color}`}>
          <SignalIcon size={14} />
          {config.label}
        </span>
        <span className="text-xs text-gray-400">{formatRelativeDate(signal.createdAt)}</span>
      </div>
      <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 leading-snug">
        {signal.titleAr || signal.title}
      </h3>
      {(signal.summaryAr || signal.summary) && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {signal.summaryAr || signal.summary}
        </p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {signal.sector && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{signal.sector}</span>
          )}
        </div>
        {signal.impactScore > 0 && (
          <div className="flex items-center gap-1">
            <Minus size={12} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-700">{signal.impactScore}%</span>
          </div>
        )}
      </div>
    </div>
  );
});

/** Dataset card (horizontal scroll) */
const DatasetCard = React.memo(({ dataset, onClick }: { dataset: DatasetItem; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group shrink-0 w-[260px] sm:w-[280px]"
  >
    <div className="flex items-start gap-3 mb-3">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shrink-0">
        <Database size={18} className="text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
          {dataset.nameAr || dataset.name}
        </h3>
      </div>
    </div>
    <div className="flex flex-wrap gap-1.5 mb-2">
      {dataset.category && (
        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
          {dataset.category}
        </span>
      )}
      {dataset.source && (
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full truncate max-w-[140px]">
          {dataset.source}
        </span>
      )}
    </div>
    {dataset.recordCount != null && dataset.recordCount > 0 && (
      <p className="text-xs text-gray-400">
        <BarChart3 size={12} className="inline ml-1" />
        {formatNumber(dataset.recordCount)} سجل
      </p>
    )}
  </div>
));

/** Content card */
const ContentCard = React.memo(({ content, onClick }: { content: ContentItem; onClick: () => void }) => {
  const typeConfig = CONTENT_TYPE_CONFIG[content.type] || CONTENT_TYPE_CONFIG.ARTICLE;
  const tags = safeParseTags(content.tags).slice(0, 3);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
    >
      {/* Cover or gradient placeholder */}
      {content.coverImage ? (
        <img
          src={content.coverImage}
          alt={content.titleAr || content.title}
          loading="lazy"
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-32 bg-gradient-to-bl from-slate-100 to-slate-200 flex items-center justify-center">
          <FileText size={32} className="text-slate-300" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeConfig.bg} ${typeConfig.color}`}>
            {typeConfig.label}
          </span>
          <span className="text-xs text-gray-400">{formatRelativeDate(content.publishedAt)}</span>
        </div>
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-blue-700 transition-colors">
          {content.titleAr || content.title}
        </h3>
        {(content.excerptAr || content.excerpt) && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {content.excerptAr || content.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, i) => (
              <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
          {content.viewCount > 0 && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Eye size={12} />
              {formatNumber(content.viewCount)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

export default ExploreDashboardPage;
