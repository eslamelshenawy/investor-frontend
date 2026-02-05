/**
 * ================================================
 * RECOMMENDATIONS PAGE - التوصيات الذكية
 * ================================================
 *
 * صفحة توصيات مدعومة بالذكاء الاصطناعي
 * AI-powered recommendations based on user activity
 *
 * Endpoint: GET /api/recommendations (authenticated)
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
  ArrowLeft,
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

function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'الآن';
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'منذ يوم';
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسبوع`;

  return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString('ar-SA');
}

function getContentTypeBadge(type: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    article: { label: 'مقال', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    analysis: { label: 'تحليل', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    report: { label: 'تقرير', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    news: { label: 'خبر', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    opinion: { label: 'رأي', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  };
  return map[type?.toLowerCase()] || { label: type || 'محتوى', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
}

function getSignalTypeColor(type: string): { bg: string; border: string; text: string; gradient: string } {
  switch (type?.toUpperCase()) {
    case 'OPPORTUNITY':
      return {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        gradient: 'from-emerald-500/20 to-emerald-600/5',
      };
    case 'RISK':
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        gradient: 'from-red-500/20 to-red-600/5',
      };
    case 'TREND':
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        gradient: 'from-amber-500/20 to-amber-600/5',
      };
    default:
      return {
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/30',
        text: 'text-slate-400',
        gradient: 'from-slate-500/20 to-slate-600/5',
      };
  }
}

function getSignalTypeLabel(type: string): string {
  switch (type?.toUpperCase()) {
    case 'OPPORTUNITY': return 'فرصة';
    case 'RISK': return 'مخاطرة';
    case 'TREND': return 'اتجاه';
    default: return type || 'إشارة';
  }
}

function getTrendIcon(trend: string) {
  switch (trend?.toLowerCase()) {
    case 'up':
    case 'bullish':
      return <TrendingUp size={16} className="text-emerald-400" />;
    case 'down':
    case 'bearish':
      return <TrendingDown size={16} className="text-red-400" />;
    default:
      return <Minus size={16} className="text-slate-400" />;
  }
}

// ============================================
// SUB-COMPONENTS
// ============================================

/** Content Recommendation Card */
const ContentCard: React.FC<{ item: RecommendedContent }> = ({ item }) => {
  const badge = getContentTypeBadge(item.type);

  const handleClick = () => {
    window.location.hash = `#/content/${item.id}`;
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-slate-800 border border-slate-700/50 rounded-2xl p-5 hover:border-blue-500/40 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Top: Type badge + Reason */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${badge.color}`}>
          <FileText size={12} />
          {badge.label}
        </span>
        <span className="text-[10px] font-medium text-slate-500 bg-slate-700/50 px-2 py-1 rounded-md truncate max-w-[140px]">
          {item._reason}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-slate-100 leading-tight mb-2 group-hover:text-blue-300 transition-colors line-clamp-2">
        {item.titleAr || item.title}
      </h3>

      {/* Excerpt */}
      {item.excerptAr && (
        <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-2">
          {item.excerptAr}
        </p>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {item.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 bg-slate-700/60 text-slate-400 px-2 py-0.5 rounded-md text-[10px] font-medium"
            >
              <Tag size={10} />
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-[10px] text-slate-500 px-1">+{item.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer: Author + Stats */}
      <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between">
        {/* Author */}
        <div className="flex items-center gap-2 min-w-0">
          {item.author?.avatar ? (
            <img
              src={item.author.avatar}
              alt=""
              className="w-6 h-6 rounded-full object-cover border border-slate-600"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">
              {(item.author?.nameAr || item.author?.name || '?')[0]}
            </div>
          )}
          <span className="text-xs text-slate-400 truncate">
            {item.author?.nameAr || item.author?.name || 'كاتب'}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Eye size={12} />
            {formatNumber(item.viewCount)}
          </span>
          <span className="flex items-center gap-1">
            <Heart size={12} />
            {formatNumber(item.likeCount)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatRelativeDate(item.publishedAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

/** Signal Recommendation Card */
const SignalCard: React.FC<{ item: RecommendedSignal; onExpand: (signal: RecommendedSignal) => void; isExpanded: boolean }> = ({ item, onExpand, isExpanded }) => {
  const colors = getSignalTypeColor(item.type);

  return (
    <div
      onClick={() => onExpand(item)}
      className={`flex-shrink-0 w-80 bg-gradient-to-br ${colors.gradient} border ${colors.border} rounded-2xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group ${
        isExpanded ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-blue-500/50' : ''
      }`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${colors.border} ${colors.text} bg-slate-900/40`}>
          <Zap size={12} />
          {getSignalTypeLabel(item.type)}
        </span>
        <span className="text-[10px] font-medium text-slate-500 bg-slate-900/30 px-2 py-1 rounded-md truncate max-w-[120px]">
          {item._reason}
        </span>
      </div>

      {/* Title */}
      <h3 className={`text-sm font-bold ${colors.text} leading-tight mb-2 group-hover:brightness-125 transition-all line-clamp-2`}>
        {item.titleAr || item.title}
      </h3>

      {/* Summary */}
      <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
        {item.summaryAr}
      </p>

      {/* Metrics row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Impact Score */}
          <div className="flex items-center gap-1.5">
            <div className={`w-8 h-8 rounded-lg bg-slate-900/40 border ${colors.border} flex items-center justify-center`}>
              <span className={`text-sm font-black ${colors.text}`}>{item.impactScore}</span>
            </div>
            <span className="text-[10px] text-slate-500">تأثير</span>
          </div>

          {/* Confidence */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500">ثقة</span>
            <span className="text-xs font-bold text-slate-300">{item.confidence}%</span>
          </div>
        </div>

        {/* Trend */}
        <div className="flex items-center gap-1">
          {getTrendIcon(item.trend)}
        </div>
      </div>

      {/* Expanded detail (inline) */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">درجة التأثير</span>
            <span className={`font-bold ${colors.text}`}>{item.impactScore}%</span>
          </div>
          <div className="w-full bg-slate-900/40 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                item.type?.toUpperCase() === 'OPPORTUNITY'
                  ? 'bg-emerald-500'
                  : item.type?.toUpperCase() === 'RISK'
                  ? 'bg-red-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${item.impactScore}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">مستوى الثقة</span>
            <span className="font-bold text-slate-300">{item.confidence}%</span>
          </div>
          <div className="w-full bg-slate-900/40 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${item.confidence}%` }}
            />
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2">
            <Clock size={10} />
            <span>{formatRelativeDate(item.createdAt)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

/** Dataset Recommendation Card */
const DatasetCard: React.FC<{ item: RecommendedDataset }> = ({ item }) => {
  const handleClick = () => {
    window.location.hash = `#/data/${item.id}`;
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-slate-800 border border-slate-700/50 rounded-2xl p-5 hover:border-cyan-500/40 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Top: icon + reason */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Database size={20} className="text-cyan-400" />
        </div>
        <span className="text-[10px] font-medium text-slate-500 bg-slate-700/50 px-2 py-1 rounded-md truncate max-w-[140px]">
          {item._reason}
        </span>
      </div>

      {/* Name */}
      <h3 className="text-base font-bold text-slate-100 leading-tight mb-2 group-hover:text-cyan-300 transition-colors line-clamp-2">
        {item.nameAr || item.name}
      </h3>

      {/* Category + Source */}
      <div className="flex flex-wrap gap-2 mb-4">
        {item.category && (
          <span className="inline-flex items-center gap-1 bg-slate-700/60 text-slate-400 px-2 py-0.5 rounded-md text-[10px] font-medium">
            <Tag size={10} />
            {item.category}
          </span>
        )}
        {item.source && (
          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
            {item.source}
          </span>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Database size={14} className="text-cyan-500" />
          <span className="font-bold">{formatNumber(item.recordCount)}</span>
          <span className="text-slate-500">سجل</span>
        </div>
        {item.lastSyncAt && (
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <Clock size={10} />
            {formatRelativeDate(item.lastSyncAt)}
          </span>
        )}
      </div>
    </div>
  );
};

/** Section Header */
const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  count: number;
  accentColor: string;
}> = ({ icon, title, count, accentColor }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className={`w-10 h-10 rounded-xl ${accentColor} flex items-center justify-center`}>
      {icon}
    </div>
    <div>
      <h2 className="text-lg font-black text-slate-100">{title}</h2>
    </div>
    <span className="bg-slate-700/60 text-slate-400 px-2.5 py-1 rounded-lg text-xs font-bold">
      {count}
    </span>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

const RecommendationsPage: React.FC = () => {
  const [data, setData] = useState<RecommendationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSignalId, setExpandedSignalId] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await api.getRecommendations();

      if (response.success && response.data) {
        setData(response.data as unknown as RecommendationsData);
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

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleRefresh = () => {
    fetchRecommendations(true);
  };

  const handleExpandSignal = (signal: RecommendedSignal) => {
    setExpandedSignalId(prev => (prev === signal.id ? null : signal.id));
  };

  const hasAnyData = data && (data.content.length > 0 || data.signals.length > 0 || data.datasets.length > 0);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform rotate-180" />
          <span>العودة</span>
        </button>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-slate-100">
                التوصيات الذكية
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                محتوى مقترح بناءً على اهتماماتك ونشاطك
              </p>
            </div>
          </div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 border border-slate-700/50 hover:border-violet-500/40 text-slate-300 hover:text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            تحديث التوصيات
          </button>
        </div>

        {/* Meta bar */}
        {data?.meta && !loading && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-5 py-3 mb-8 flex items-center gap-3">
            <Sparkles size={16} className="text-violet-400" />
            <span className="text-sm text-slate-300">
              بناءً على{' '}
              <span className="font-bold text-violet-300">{data.meta.basedOn.favorites}</span>{' '}
              مفضلة و{' '}
              <span className="font-bold text-violet-300">{data.meta.basedOn.following}</span>{' '}
              متابعة
            </span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center animate-pulse">
                <Sparkles size={36} className="text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                <RefreshCw size={14} className="text-violet-400 animate-spin" />
              </div>
            </div>
            <p className="text-slate-400 font-medium text-lg mb-1">جاري تحليل اهتماماتك...</p>
            <p className="text-slate-500 text-sm">نحن نبحث عن أفضل التوصيات لك</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Zap size={32} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-red-300 mb-2">تعذر تحميل التوصيات</h3>
            <p className="text-red-400/80 text-sm mb-6">{error}</p>
            <button
              onClick={() => fetchRecommendations()}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw size={16} />
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !hasAnyData && (
          <div className="bg-slate-800/40 border-2 border-dashed border-slate-700/50 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
              <Sparkles size={36} className="text-violet-400" />
            </div>
            <h3 className="text-xl font-black text-slate-200 mb-3">لا توجد توصيات حالياً</h3>
            <p className="text-slate-400 mb-2 max-w-lg mx-auto">
              ابدأ بتصفح المحتوى وإضافة عناصر إلى المفضلة ومتابعة الجهات التي تهمك لنتمكن من تقديم توصيات مخصصة لك.
            </p>
            <p className="text-slate-500 text-sm mb-8">
              كلما زاد تفاعلك مع المنصة، كلما أصبحت التوصيات أدق وأكثر صلة.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="#/feed"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors inline-flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <FileText size={18} />
                تصفح المحتوى
              </a>
              <a
                href="#/signals"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-colors inline-flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Zap size={18} />
                استعرض الإشارات
              </a>
              <a
                href="#/datasets"
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-colors inline-flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Database size={18} />
                تصفح البيانات
              </a>
            </div>
          </div>
        )}

        {/* Main Content: Three Sections */}
        {!loading && !error && hasAnyData && (
          <div className="space-y-10">

            {/* Section 1: Recommended Content */}
            {data!.content.length > 0 && (
              <section>
                <SectionHeader
                  icon={<FileText size={20} className="text-blue-400" />}
                  title="محتوى مقترح"
                  count={data!.content.length}
                  accentColor="bg-blue-500/10 border border-blue-500/20"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data!.content.map((item) => (
                    <ContentCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* Section 2: Strong Signals */}
            {data!.signals.length > 0 && (
              <section>
                <SectionHeader
                  icon={<Zap size={20} className="text-amber-400" />}
                  title="إشارات قوية"
                  count={data!.signals.length}
                  accentColor="bg-amber-500/10 border border-amber-500/20"
                />
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-700">
                  {data!.signals.map((item) => (
                    <SignalCard
                      key={item.id}
                      item={item}
                      onExpand={handleExpandSignal}
                      isExpanded={expandedSignalId === item.id}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Section 3: Rich Datasets */}
            {data!.datasets.length > 0 && (
              <section>
                <SectionHeader
                  icon={<Database size={20} className="text-cyan-400" />}
                  title="بيانات غنية"
                  count={data!.datasets.length}
                  accentColor="bg-cyan-500/10 border border-cyan-500/20"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data!.datasets.map((item) => (
                    <DatasetCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Refreshing overlay indicator */}
        {refreshing && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-slate-800 border border-violet-500/30 rounded-full px-5 py-2.5 shadow-2xl shadow-violet-500/10 flex items-center gap-3">
              <RefreshCw size={16} className="text-violet-400 animate-spin" />
              <span className="text-sm font-bold text-slate-200">جاري تحديث التوصيات...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;
