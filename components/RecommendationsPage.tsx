/**
 * RECOMMENDATIONS PAGE - التوصيات الذكية
 * AI-powered recommendations - Premium white theme
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  FileText,
  Zap,
  Database,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Eye,
  Heart,
  Tag,
  Clock,
  ArrowUpRight,
  BarChart3,
  Layers,
  BookOpen,
  Activity,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react';
import { api } from '../src/services/api';

// ============================================
// TYPES
// ============================================

interface ContentAuthor {
  id: string;
  name: string;
  nameAr?: string;
  avatar?: string;
}

interface RecommendedContent {
  id: string;
  type: string;
  title: string;
  titleAr: string;
  excerptAr?: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  tags: string[];
  author?: ContentAuthor;
  _type: 'content';
  _reason: string;
}

interface RecommendedSignal {
  id: string;
  type: string;
  title: string;
  titleAr: string;
  summaryAr: string;
  impactScore: number;
  confidence: number;
  trend: string;
  createdAt: string;
  _type: 'signal';
  _reason: string;
}

interface RecommendedDataset {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  source: string;
  recordCount: number;
  lastSyncAt?: string;
  _type: 'dataset';
  _reason: string;
}

interface RecommendationsMeta {
  basedOn: {
    favorites: number;
    following: number;
  };
}

interface RecommendationsData {
  content: RecommendedContent[];
  signals: RecommendedSignal[];
  datasets: RecommendedDataset[];
  meta: RecommendationsMeta;
}

// ============================================
// HELPERS
// ============================================

function safeParseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    try { return JSON.parse(tags); } catch { return []; }
  }
  return [];
}

function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'الآن';
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'أمس';
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسبوع`;
  return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString('ar-SA');
}

type TabKey = 'all' | 'content' | 'signals' | 'datasets';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'الكل', icon: <Layers size={15} /> },
  { key: 'content', label: 'المحتوى', icon: <FileText size={15} /> },
  { key: 'signals', label: 'الإشارات', icon: <Zap size={15} /> },
  { key: 'datasets', label: 'البيانات', icon: <Database size={15} /> },
];

function getContentIcon(type: string) {
  switch (type?.toLowerCase()) {
    case 'article': return { label: 'مقال', color: 'text-blue-600', bg: 'bg-blue-50' };
    case 'analysis': return { label: 'تحليل', color: 'text-violet-600', bg: 'bg-violet-50' };
    case 'report': return { label: 'تقرير', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    case 'news': return { label: 'خبر', color: 'text-orange-600', bg: 'bg-orange-50' };
    case 'opinion': return { label: 'رأي', color: 'text-rose-600', bg: 'bg-rose-50' };
    default: return { label: type || 'محتوى', color: 'text-gray-600', bg: 'bg-gray-50' };
  }
}

function getSignalColors(type: string) {
  switch (type?.toUpperCase()) {
    case 'OPPORTUNITY':
      return { gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', label: 'فرصة', barColor: 'bg-emerald-500' };
    case 'RISK':
      return { gradient: 'from-red-500 to-rose-600', bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-700', label: 'مخاطرة', barColor: 'bg-red-500' };
    case 'TREND':
      return { gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', label: 'اتجاه', barColor: 'bg-amber-500' };
    default:
      return { gradient: 'from-gray-500 to-gray-600', bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-700', label: 'إشارة', barColor: 'bg-gray-500' };
  }
}

// ============================================
// SUB-COMPONENTS
// ============================================

const ContentCard: React.FC<{ item: RecommendedContent; featured?: boolean }> = ({ item, featured }) => {
  const ci = getContentIcon(item.type);
  const tags = safeParseTags(item.tags);

  if (featured) {
    return (
      <div
        onClick={() => { window.location.hash = `#/content/${item.id}`; }}
        className="group bg-gradient-to-bl from-blue-600 to-indigo-700 rounded-2xl p-6 cursor-pointer hover:shadow-xl hover:shadow-blue-200/50 transition-all col-span-full"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-white/20 text-white px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-sm flex items-center gap-1.5">
            <Star size={12} /> توصية مميزة
          </span>
          <span className="bg-white/10 text-white/70 px-2.5 py-1 rounded-lg text-[10px] font-medium">{ci.label}</span>
        </div>
        <h3 className="text-xl font-black text-white leading-snug mb-2 group-hover:text-blue-100 transition-colors">
          {item.titleAr || item.title}
        </h3>
        {item.excerptAr && (
          <p className="text-sm text-blue-100/80 leading-relaxed mb-4 line-clamp-2">{item.excerptAr}</p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            {item.author?.avatar ? (
              <img src={item.author.avatar} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-white/30" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                {(item.author?.nameAr || item.author?.name || '?')[0]}
              </div>
            )}
            <span className="text-sm text-white/80">{item.author?.nameAr || item.author?.name || 'كاتب'}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/60">
            <span className="flex items-center gap-1"><Eye size={13} />{formatNumber(item.viewCount)}</span>
            <span className="flex items-center gap-1"><Heart size={13} />{formatNumber(item.likeCount)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => { window.location.hash = `#/content/${item.id}`; }}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all cursor-pointer flex flex-col"
    >
      {/* Top accent bar */}
      <div className={`h-1 rounded-t-2xl ${ci.bg === 'bg-blue-50' ? 'bg-blue-400' : ci.bg === 'bg-violet-50' ? 'bg-violet-400' : ci.bg === 'bg-emerald-50' ? 'bg-emerald-400' : ci.bg === 'bg-orange-50' ? 'bg-orange-400' : ci.bg === 'bg-rose-50' ? 'bg-rose-400' : 'bg-gray-300'}`} />

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${ci.bg} ${ci.color}`}>
            <BookOpen size={12} />
            {ci.label}
          </span>
          <span className="text-[10px] text-gray-400">{formatRelativeDate(item.publishedAt)}</span>
        </div>

        <h3 className="text-[15px] font-bold text-gray-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {item.titleAr || item.title}
        </h3>

        {item.excerptAr && (
          <p className="text-[13px] text-gray-500 leading-relaxed mb-3 line-clamp-2">{item.excerptAr}</p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="bg-gray-50 text-gray-500 px-2 py-0.5 rounded text-[10px] font-medium">
                {tag}
              </span>
            ))}
            {tags.length > 3 && <span className="text-[10px] text-gray-400 self-center">+{tags.length - 3}</span>}
          </div>
        )}

        <div className="flex-1" />

        <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {item.author?.avatar ? (
              <img src={item.author.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                {(item.author?.nameAr || item.author?.name || '?')[0]}
              </div>
            )}
            <span className="text-xs text-gray-500 truncate">{item.author?.nameAr || item.author?.name}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[11px] text-gray-400">
            <span className="flex items-center gap-1"><Eye size={12} />{formatNumber(item.viewCount)}</span>
            <span className="flex items-center gap-1"><Heart size={12} />{formatNumber(item.likeCount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SignalCard: React.FC<{ item: RecommendedSignal }> = ({ item }) => {
  const sc = getSignalColors(item.type);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:shadow-gray-100 transition-all overflow-hidden">
      {/* Gradient accent */}
      <div className={`h-1.5 bg-gradient-to-l ${sc.gradient}`} />

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${sc.badge}`}>
            <Zap size={12} />
            {sc.label}
          </span>
          <div className="flex items-center gap-1.5">
            {item.trend?.toLowerCase() === 'up' || item.trend?.toLowerCase() === 'bullish' ? (
              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] font-bold"><TrendingUp size={13} />صاعد</span>
            ) : item.trend?.toLowerCase() === 'down' || item.trend?.toLowerCase() === 'bearish' ? (
              <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-md text-[11px] font-bold"><TrendingDown size={13} />هابط</span>
            ) : (
              <span className="flex items-center gap-1 text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md text-[11px] font-bold"><Minus size={13} />مستقر</span>
            )}
          </div>
        </div>

        <h3 className="text-[15px] font-bold text-gray-900 leading-snug mb-2 line-clamp-2">
          {item.titleAr || item.title}
        </h3>

        <p className="text-[13px] text-gray-500 leading-relaxed mb-4 line-clamp-2">{item.summaryAr}</p>

        {/* Metrics */}
        <div className="space-y-2.5">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">درجة التأثير</span>
              <span className={`font-bold ${sc.text}`}>{item.impactScore}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className={`h-full rounded-full ${sc.barColor} transition-all`} style={{ width: `${item.impactScore}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">مستوى الثقة</span>
              <span className="font-bold text-gray-700">{item.confidence}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${item.confidence}%` }} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-3 pt-3 border-t border-gray-50">
          <Clock size={11} />
          <span>{formatRelativeDate(item.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

const DatasetCard: React.FC<{ item: RecommendedDataset }> = ({ item }) => {
  return (
    <div
      onClick={() => { window.location.hash = `#/data/${item.id}`; }}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-50 transition-all cursor-pointer"
    >
      <div className="h-1 rounded-t-2xl bg-gradient-to-l from-cyan-400 to-teal-500" />

      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-100 flex items-center justify-center">
            <Database size={18} className="text-cyan-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-gray-900 leading-snug group-hover:text-cyan-600 transition-colors line-clamp-1">
              {item.nameAr || item.name}
            </h3>
            {item.source && (
              <span className="text-[11px] text-gray-400">{item.source}</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {item.category && (
            <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-600 px-2.5 py-1 rounded-lg text-[11px] font-medium">
              <Tag size={10} />{item.category}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            <BarChart3 size={14} className="text-cyan-500" />
            <span className="text-sm font-bold text-gray-800">{formatNumber(item.recordCount)}</span>
            <span className="text-xs text-gray-400">سجل</span>
          </div>
          {item.lastSyncAt && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Clock size={10} />{formatRelativeDate(item.lastSyncAt)}
            </span>
          )}
          <ArrowUpRight size={16} className="text-gray-300 group-hover:text-cyan-500 transition-colors" />
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN
// ============================================

const RecommendationsPage: React.FC = () => {
  const [data, setData] = useState<RecommendationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const fetchRecommendations = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const response = await api.getRecommendations();
      if (response.success && response.data) {
        const raw = response.data as unknown as RecommendationsData;
        if (raw.content) {
          raw.content = raw.content.map((c: any) => ({ ...c, tags: safeParseTags(c.tags) }));
        }
        setData(raw);
      } else {
        setError(response.errorAr || response.error || 'تعذر تحميل التوصيات');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchRecommendations(); }, [fetchRecommendations]);

  const hasAnyData = data && (data.content.length > 0 || data.signals.length > 0 || data.datasets.length > 0);
  const totalCount = data ? data.content.length + data.signals.length + data.datasets.length : 0;

  return (
    <div dir="rtl" className="min-h-[80vh]">
      {/* ─── Header ─── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200/60">
                <Sparkles size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900">التوصيات الذكية</h1>
                <p className="text-[13px] text-gray-400 mt-0.5">
                  {hasAnyData ? `${totalCount} توصية مخصصة لك` : 'محتوى مقترح بناءً على اهتماماتك'}
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchRecommendations(true)}
              disabled={refreshing || loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              تحديث
            </button>
          </div>

          {/* Meta bar */}
          {data?.meta && !loading && (
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2 text-[13px] text-gray-500">
                <Heart size={14} className="text-rose-400" />
                <span><span className="font-bold text-gray-700">{data.meta.basedOn.favorites}</span> مفضلة</span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-gray-500">
                <Activity size={14} className="text-blue-400" />
                <span><span className="font-bold text-gray-700">{data.meta.basedOn.following}</span> متابعة</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Tabs ─── */}
      {hasAnyData && !loading && (
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex gap-1 overflow-x-auto no-scrollbar py-2">
              {TABS.map((tab) => {
                const count = tab.key === 'all' ? totalCount
                  : tab.key === 'content' ? data!.content.length
                  : tab.key === 'signals' ? data!.signals.length
                  : data!.datasets.length;
                if (tab.key !== 'all' && count === 0) return null;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      activeTab === tab.key
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Content ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200/60">
                <Sparkles size={24} className="text-white" />
              </div>
              <div className="absolute -inset-3 rounded-3xl border-2 border-violet-200 animate-ping opacity-30" />
            </div>
            <p className="text-gray-800 font-bold mb-1">جاري تحليل اهتماماتك...</p>
            <p className="text-gray-400 text-sm">نحن نبحث عن أفضل التوصيات لك</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-white rounded-2xl border border-red-100 p-10 text-center max-w-md mx-auto mt-12">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Zap size={24} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">تعذر تحميل التوصيات</h3>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => fetchRecommendations()}
              className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-bold transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw size={15} />إعادة المحاولة
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && !hasAnyData && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-lg mx-auto mt-12">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 flex items-center justify-center mx-auto mb-5">
              <Sparkles size={24} className="text-violet-500" />
            </div>
            <h3 className="text-lg font-black text-gray-800 mb-2">لا توجد توصيات حالياً</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              ابدأ بتصفح المحتوى وإضافة عناصر إلى المفضلة لنتمكن من تقديم توصيات مخصصة لك.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="#/feed" className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-1.5">
                <FileText size={15} />تصفح المحتوى
              </a>
              <a href="#/signals" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors inline-flex items-center gap-1.5">
                <Zap size={15} />الإشارات
              </a>
            </div>
          </div>
        )}

        {/* ─── Sections ─── */}
        {!loading && !error && hasAnyData && (
          <div className="space-y-8">
            {/* Content Section */}
            {(activeTab === 'all' || activeTab === 'content') && data!.content.length > 0 && (
              <section>
                {activeTab === 'all' && (
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FileText size={16} className="text-blue-600" />
                    </div>
                    <h2 className="text-base font-bold text-gray-800">محتوى مقترح</h2>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md font-medium">{data!.content.length}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data!.content.map((item, idx) => (
                    <ContentCard key={item.id} item={item} featured={idx === 0 && activeTab !== 'content'} />
                  ))}
                </div>
              </section>
            )}

            {/* Signals Section */}
            {(activeTab === 'all' || activeTab === 'signals') && data!.signals.length > 0 && (
              <section>
                {activeTab === 'all' && (
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Zap size={16} className="text-amber-600" />
                    </div>
                    <h2 className="text-base font-bold text-gray-800">إشارات قوية</h2>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md font-medium">{data!.signals.length}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data!.signals.map((item) => (
                    <SignalCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* Datasets Section */}
            {(activeTab === 'all' || activeTab === 'datasets') && data!.datasets.length > 0 && (
              <section>
                {activeTab === 'all' && (
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                      <Database size={16} className="text-cyan-600" />
                    </div>
                    <h2 className="text-base font-bold text-gray-800">بيانات مقترحة</h2>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md font-medium">{data!.datasets.length}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data!.datasets.map((item) => (
                    <DatasetCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Refreshing toast */}
        {refreshing && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-gray-900 text-white rounded-full px-5 py-2.5 shadow-2xl flex items-center gap-2.5 text-sm font-medium">
              <RefreshCw size={14} className="animate-spin" />
              جاري التحديث...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;
