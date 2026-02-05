/**
 * ==========================================
 * EXPLORE PAGE - استكشف رادار المستثمر
 * ==========================================
 *
 * صفحة عامة قبل التسجيل لعرض عينات من المحتوى
 * Public pre-auth page showing content samples to encourage registration
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Eye,
  Zap,
  Clock,
  Tag,
  Filter,
  Lock,
  ArrowUpRight,
  Loader2,
  Sparkles,
  FileText,
  BarChart3,
  Lightbulb,
  BookOpen,
  ChevronLeft,
  Globe,
  Building2,
  Layers,
  UserPlus,
  X,
  Hash,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ============================================
// TYPES
// ============================================

interface ContentItem {
  id: string;
  title: string;
  titleAr: string;
  type: 'ARTICLE' | 'REPORT' | 'ANALYSIS' | 'INSIGHT';
  excerpt?: string;
  excerptAr?: string;
  body?: string;
  bodyAr?: string;
  tags: string[];
  sector?: string;
  country?: string;
  status: string;
  createdAt: string;
  author?: {
    name: string;
    avatar?: string;
  };
}

interface SignalItem {
  id: string;
  type: 'OPPORTUNITY' | 'RISK' | 'TREND' | 'ALERT';
  title: string;
  titleAr: string;
  summary: string;
  summaryAr: string;
  impactScore: number;
  confidence: number;
  sector?: string;
  region?: string;
  createdAt: string;
}

function safeParseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    try { return JSON.parse(tags); } catch { return []; }
  }
  return [];
}

interface TagItem {
  tag: string;
  count: number;
}

type ContentTypeFilter = 'ALL' | 'ARTICLE' | 'REPORT' | 'ANALYSIS' | 'INSIGHT';

// ============================================
// CONSTANTS
// ============================================

const CONTENT_TYPE_LABELS: Record<string, string> = {
  ARTICLE: 'مقال',
  REPORT: 'تقرير',
  ANALYSIS: 'تحليل',
  INSIGHT: 'رؤية',
};

const CONTENT_TYPE_STYLES: Record<string, string> = {
  ARTICLE: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  REPORT: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  ANALYSIS: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  INSIGHT: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

const CONTENT_TYPE_ICONS: Record<string, typeof FileText> = {
  ARTICLE: FileText,
  REPORT: BarChart3,
  ANALYSIS: Lightbulb,
  INSIGHT: BookOpen,
};

const SIGNAL_TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: typeof TrendingUp }> = {
  OPPORTUNITY: {
    label: 'فرصة',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    icon: TrendingUp,
  },
  RISK: {
    label: 'مخاطر',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    icon: AlertTriangle,
  },
  TREND: {
    label: 'اتجاه',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    icon: TrendingUp,
  },
  ALERT: {
    label: 'تنبيه',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    icon: Zap,
  },
};

const SECTOR_FILTERS = [
  { key: 'ALL', label: 'الكل' },
  { key: 'FINANCE', label: 'المالية' },
  { key: 'ENERGY', label: 'الطاقة' },
  { key: 'TECHNOLOGY', label: 'التقنية' },
  { key: 'REAL_ESTATE', label: 'العقارات' },
  { key: 'HEALTHCARE', label: 'الصحة' },
];

const COUNTRY_FILTERS = [
  { key: 'ALL', label: 'الكل' },
  { key: 'SA', label: 'السعودية' },
  { key: 'AE', label: 'الإمارات' },
  { key: 'KW', label: 'الكويت' },
  { key: 'QA', label: 'قطر' },
  { key: 'BH', label: 'البحرين' },
];

// ============================================
// HELPERS
// ============================================

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

function formatRelativeDate(dateStr: string): string {
  try {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'الآن';
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return formatDate(dateStr);
  } catch {
    return '';
  }
}

// ============================================
// SUB-COMPONENTS
// ============================================

/** Lock Overlay - طبقة القفل */
const LockOverlay: React.FC = () => (
  <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
    <div className="w-12 h-12 bg-slate-800/90 border border-slate-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
      <Lock size={22} className="text-slate-300" />
    </div>
    <span className="text-sm font-bold text-slate-200">سجل للمتابعة</span>
    <a
      href="#/register"
      className="mt-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      تسجيل مجاني
    </a>
  </div>
);

/** Content Preview Card - بطاقة معاينة المحتوى */
const ContentPreviewCard: React.FC<{ item: ContentItem }> = ({ item }) => {
  const typeBadgeStyle = CONTENT_TYPE_STYLES[item.type] || CONTENT_TYPE_STYLES.ARTICLE;
  const typeLabel = CONTENT_TYPE_LABELS[item.type] || item.type;
  const TypeIcon = CONTENT_TYPE_ICONS[item.type] || FileText;
  const title = item.titleAr || item.title;
  const excerpt = item.excerptAr || item.excerpt || item.bodyAr || item.body || '';
  const truncatedExcerpt = excerpt.length > 120 ? excerpt.substring(0, 120) + '...' : excerpt;

  return (
    <div className="relative group bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-600 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300">
      <LockOverlay />

      <div className="p-5">
        {/* Top: Type Badge + Date */}
        <div className="flex items-center justify-between mb-4">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${typeBadgeStyle}`}>
            <TypeIcon size={12} />
            {typeLabel}
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <Clock size={12} />
            <span>{formatRelativeDate(item.createdAt)}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-100 leading-tight mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {title}
        </h3>

        {/* Excerpt */}
        {truncatedExcerpt && (
          <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-3">
            {truncatedExcerpt}
          </p>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {item.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded-md text-xs font-medium border border-slate-700"
              >
                #{tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="text-slate-500 text-xs font-medium">+{item.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer: Sector + Author */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
          {item.sector && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Building2 size={12} />
              {item.sector}
            </span>
          )}
          {item.author && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <span className="w-5 h-5 bg-slate-700 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                {(item.author.name || '?')[0]}
              </span>
              {item.author.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/** Signal Preview Card - بطاقة معاينة الإشارة */
const SignalPreviewCard: React.FC<{ signal: SignalItem }> = ({ signal }) => {
  const config = SIGNAL_TYPE_CONFIG[signal.type] || SIGNAL_TYPE_CONFIG.TREND;
  const SignalIcon = config.icon;
  const title = signal.titleAr || signal.title;
  const summary = signal.summaryAr || signal.summary;
  const truncatedSummary = summary.length > 100 ? summary.substring(0, 100) + '...' : summary;

  return (
    <div className="relative group bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-600 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300">
      <LockOverlay />

      {/* Signal type accent bar */}
      <div className={`h-1 ${config.bgColor}`} />

      <div className="p-5">
        {/* Top: Signal Type + Impact Score */}
        <div className="flex items-center justify-between mb-4">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${config.bgColor} ${config.color} ${config.borderColor}`}>
            <SignalIcon size={12} />
            {config.label}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded-lg border border-slate-700">
              <Zap size={12} className="text-amber-400" />
              <span className="text-xs font-bold text-slate-300">{signal.impactScore}%</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className={`text-base font-bold text-slate-100 leading-tight mb-2 line-clamp-2 transition-colors group-hover:${config.color}`}>
          {title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-2">
          {truncatedSummary}
        </p>

        {/* Footer: Sector + Region + Date */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-3">
            {signal.sector && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Building2 size={12} />
                {signal.sector}
              </span>
            )}
            {signal.region && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Globe size={12} />
                {signal.region}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <Clock size={12} />
            <span>{formatRelativeDate(signal.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const ExplorePage: React.FC = () => {
  // Data states
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [signals, setSignals] = useState<SignalItem[]>([]);
  const [popularTags, setPopularTags] = useState<TagItem[]>([]);

  // Loading states
  const [contentLoading, setContentLoading] = useState(true);
  const [signalsLoading, setSignalsLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(true);

  // Filter states
  const [typeFilter, setTypeFilter] = useState<ContentTypeFilter>('ALL');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  // ---- DATA FETCHING ----

  const fetchContent = useCallback(async () => {
    setContentLoading(true);
    try {
      const response = await fetch(`${API_BASE}/content/feed?limit=6`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const items = Array.isArray(data.data) ? data.data : (data.data.items || []);
          setContentItems(items.map((item: any) => ({ ...item, tags: safeParseTags(item.tags) })));
        }
      }
    } catch (err) {
      console.error('[ExplorePage] Error fetching content:', err);
    } finally {
      setContentLoading(false);
    }
  }, []);

  const fetchSignals = useCallback(async () => {
    setSignalsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/signals/latest?limit=4`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const items = Array.isArray(data.data) ? data.data : (data.data.signals || []);
          setSignals(items);
        }
      }
    } catch (err) {
      console.error('[ExplorePage] Error fetching signals:', err);
    } finally {
      setSignalsLoading(false);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    setTagsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/content/tags`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const tags = Array.isArray(data.data) ? data.data : (data.data.tags || []);
          setPopularTags(tags);
        }
      }
    } catch (err) {
      console.error('[ExplorePage] Error fetching tags:', err);
    } finally {
      setTagsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
    fetchSignals();
    fetchTags();
  }, [fetchContent, fetchSignals, fetchTags]);

  // ---- FILTERING ----

  const filteredContent = contentItems.filter((item) => {
    if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;
    if (sectorFilter !== 'ALL' && item.sector !== sectorFilter) return false;
    if (countryFilter !== 'ALL' && item.country !== countryFilter) return false;
    return true;
  });

  const activeFilterCount = [
    typeFilter !== 'ALL' ? 1 : 0,
    sectorFilter !== 'ALL' ? 1 : 0,
    countryFilter !== 'ALL' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearFilters = () => {
    setTypeFilter('ALL');
    setSectorFilter('ALL');
    setCountryFilter('ALL');
  };

  const isLoading = contentLoading && signalsLoading;

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans" dir="rtl">

      {/* ======== HERO SECTION ======== */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800/50 via-slate-900 to-slate-900" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-purple-600/5 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-16 pb-12 lg:pt-24 lg:pb-16 text-center">
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
            <Sparkles size={16} className="text-blue-400" />
            <span className="text-sm font-bold text-slate-300">رادار المستثمر</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-5">
            استكشف رادار المستثمر
          </h1>

          {/* Hero Subtitle */}
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            اكتشف البيانات والتحليلات الاقتصادية قبل أن تبدأ
          </p>

          {/* Hero CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/30 text-base"
            >
              <UserPlus size={20} />
              ابدأ مجاناً
            </a>
            <a
              href="#content-preview"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold rounded-xl border border-slate-700 hover:border-slate-600 transition-all text-base"
            >
              <Eye size={20} />
              تصفح العينات
            </a>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-12">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-white mb-1">
                {contentItems.length > 0 ? `${contentItems.length}+` : '--'}
              </div>
              <div className="text-xs text-slate-500 font-medium">محتوى منشور</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-white mb-1">
                {signals.length > 0 ? `${signals.length}+` : '--'}
              </div>
              <div className="text-xs text-slate-500 font-medium">إشارة ذكية</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-white mb-1">
                {popularTags.length > 0 ? `${popularTags.length}+` : '--'}
              </div>
              <div className="text-xs text-slate-500 font-medium">موضوع رائج</div>
            </div>
          </div>
        </div>
      </section>

      {/* ======== FILTERS BAR ======== */}
      <section className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Content Type Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {([
                { key: 'ALL' as ContentTypeFilter, label: 'الكل', icon: Layers },
                { key: 'ARTICLE' as ContentTypeFilter, label: 'مقالات', icon: FileText },
                { key: 'REPORT' as ContentTypeFilter, label: 'تقارير', icon: BarChart3 },
                { key: 'ANALYSIS' as ContentTypeFilter, label: 'تحليلات', icon: Lightbulb },
                { key: 'INSIGHT' as ContentTypeFilter, label: 'رؤى', icon: BookOpen },
              ]).map((tab) => {
                const active = typeFilter === tab.key;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setTypeFilter(tab.key)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-slate-300 border border-slate-700'
                    }`}
                  >
                    <TabIcon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Sector/Country Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all shrink-0 ${
                showFilters || activeFilterCount > 0
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-750 border border-slate-700'
              }`}
            >
              <Filter size={14} />
              <span className="hidden sm:inline">تصفية</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-3 animate-fadeIn">
              {/* Sector Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 w-16 shrink-0">القطاع:</span>
                {SECTOR_FILTERS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSectorFilter(s.key)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      sectorFilter === s.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-750 border border-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Country Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 w-16 shrink-0">الدولة:</span>
                {COUNTRY_FILTERS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setCountryFilter(c.key)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      countryFilter === c.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-750 border border-slate-700'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                >
                  <X size={12} />
                  مسح الفلاتر
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ======== CONTENT PREVIEW GRID ======== */}
      <section id="content-preview" className="max-w-7xl mx-auto px-4 py-10 lg:py-14">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/20">
              <FileText size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-black text-white">أحدث المحتوى</h2>
              <p className="text-sm text-slate-500 font-medium">مقالات وتحليلات وتقارير اقتصادية</p>
            </div>
          </div>
          {filteredContent.length > 0 && (
            <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              {filteredContent.length} نتيجة
            </span>
          )}
        </div>

        {/* Content Grid */}
        {contentLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium text-sm">جاري تحميل المحتوى...</p>
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
              <Search size={28} className="text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-400 mb-2">لا توجد نتائج</h3>
            <p className="text-sm text-slate-500 mb-4">جرب تغيير الفلاتر أو تصفح الكل</p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-bold border border-slate-700 hover:bg-slate-750 transition-colors"
              >
                مسح الفلاتر
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredContent.map((item) => (
              <ContentPreviewCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* ======== SIGNALS PREVIEW ======== */}
      <section className="bg-slate-800/30 border-t border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-10 lg:py-14">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
                <Zap size={20} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-black text-white">أحدث الإشارات الذكية</h2>
                <p className="text-sm text-slate-500 font-medium">إشارات مولدة بالذكاء الاصطناعي من بيانات موثوقة</p>
              </div>
            </div>
          </div>

          {/* Signals Grid */}
          {signalsLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 size={36} className="text-emerald-500 animate-spin mb-4" />
              <p className="text-slate-500 font-medium text-sm">جاري تحميل الإشارات...</p>
            </div>
          ) : signals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
                <Zap size={24} className="text-slate-600" />
              </div>
              <p className="text-sm text-slate-500">لا توجد إشارات متاحة حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {signals.map((signal) => (
                <SignalPreviewCard key={signal.id} signal={signal} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======== POPULAR TAGS ======== */}
      <section className="max-w-7xl mx-auto px-4 py-10 lg:py-14">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center border border-purple-500/20">
            <Hash size={20} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-black text-white">المواضيع الرائجة</h2>
            <p className="text-sm text-slate-500 font-medium">أكثر المواضيع تداولاً في المنصة</p>
          </div>
        </div>

        {/* Tags Cloud */}
        {tagsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={28} className="text-purple-500 animate-spin" />
          </div>
        ) : popularTags.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">لا توجد مواضيع رائجة حالياً</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tagItem, idx) => (
              <div
                key={idx}
                className="group relative bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 rounded-xl px-4 py-2.5 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                    {tagItem.tag}
                  </span>
                  {tagItem.count > 0 && (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
                      {tagItem.count}
                    </span>
                  )}
                </div>
                {/* Mini lock indicator */}
                <Lock size={10} className="absolute top-1.5 left-1.5 text-slate-600" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ======== BOTTOM CTA ======== */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-950/30 to-slate-900" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 lg:py-24 text-center">
          {/* Lock Icon */}
          <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Lock size={28} className="text-blue-400" />
          </div>

          {/* CTA Title */}
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-5">
            سجل الآن واحصل على وصول كامل
          </h2>

          {/* CTA Subtitle */}
          <p className="text-base md:text-lg text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
            احصل على تحليلات متقدمة، إشارات ذكية فورية، ولوحات تحكم تفاعلية مع بيانات محدثة من مصادر موثوقة
          </p>

          {/* Features List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3">
              <Zap size={20} className="text-emerald-400 mx-auto mb-2" />
              <span className="text-sm font-bold text-slate-300">إشارات ذكية</span>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3">
              <BarChart3 size={20} className="text-blue-400 mx-auto mb-2" />
              <span className="text-sm font-bold text-slate-300">لوحات تفاعلية</span>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3">
              <FileText size={20} className="text-purple-400 mx-auto mb-2" />
              <span className="text-sm font-bold text-slate-300">تحليلات وتقارير</span>
            </div>
          </div>

          {/* CTA Button */}
          <a
            href="#/register"
            className="inline-flex items-center gap-3 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-2xl shadow-blue-600/30 hover:shadow-blue-500/40 text-lg group"
          >
            <UserPlus size={22} />
            سجل الآن واحصل على وصول كامل
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </a>

          <p className="mt-4 text-xs text-slate-500">
            تسجيل مجاني بالكامل - لا يتطلب بطاقة ائتمان
          </p>
        </div>
      </section>

      {/* ======== FOOTER NOTE ======== */}
      <div className="max-w-7xl mx-auto px-4 py-6 border-t border-slate-800">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
          <Sparkles size={12} />
          <span>رادار المستثمر - منصة تحليلات اقتصادية ذكية</span>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
