/**
 * RECOMMENDATIONS PAGE - التوصيات الذكية
 * AI-powered recommendations - White theme
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
  Layers,
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
    article: { label: 'مقال', color: 'bg-blue-100 text-blue-700' },
    analysis: { label: 'تحليل', color: 'bg-purple-100 text-purple-700' },
    report: { label: 'تقرير', color: 'bg-emerald-100 text-emerald-700' },
    news: { label: 'خبر', color: 'bg-amber-100 text-amber-700' },
    opinion: { label: 'رأي', color: 'bg-rose-100 text-rose-700' },
  };
  return map[type?.toLowerCase()] || { label: type || 'محتوى', color: 'bg-gray-100 text-gray-700' };
}

function getSignalStyle(type: string): { bg: string; border: string; text: string; icon: string } {
  switch (type?.toUpperCase()) {
    case 'OPPORTUNITY':
      return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'bg-emerald-100 text-emerald-600' };
    case 'RISK':
      return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'bg-red-100 text-red-600' };
    case 'TREND':
      return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'bg-amber-100 text-amber-600' };
    default:
      return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: 'bg-gray-100 text-gray-600' };
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
      return <TrendingUp size={16} className="text-emerald-500" />;
    case 'down':
    case 'bearish':
      return <TrendingDown size={16} className="text-red-500" />;
    default:
      return <Minus size={16} className="text-gray-400" />;
  }
}

// ============================================
// SUB-COMPONENTS
// ============================================

const ContentCard: React.FC<{ item: RecommendedContent }> = ({ item }) => {
  const badge = getContentTypeBadge(item.type);
  return (
    <div
      onClick={() => { window.location.hash = `#/content/${item.id}`; }}
      className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer flex flex-col"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${badge.color}`}>
          <FileText size={12} />
          {badge.label}
        </span>
        <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md truncate max-w-[140px]">
          {item._reason}
        </span>
      </div>

      <h3 className="text-base font-bold text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
        {item.titleAr || item.title}
      </h3>

      {item.excerptAr && (
        <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2">{item.excerptAr}</p>
      )}

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md text-[10px] font-medium">
              <Tag size={10} />{tag}
            </span>
          ))}
          {item.tags.length > 3 && <span className="text-[10px] text-gray-400 px-1">+{item.tags.length - 3}</span>}
        </div>
      )}

      <div className="flex-1" />

      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {item.author?.avatar ? (
            <img src={item.author.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-gray-200" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
              {(item.author?.nameAr || item.author?.name || '?')[0]}
            </div>
          )}
          <span className="text-xs text-gray-500 truncate">{item.author?.nameAr || item.author?.name || 'كاتب'}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          <span className="flex items-center gap-1"><Eye size={12} />{formatNumber(item.viewCount)}</span>
          <span className="flex items-center gap-1"><Heart size={12} />{formatNumber(item.likeCount)}</span>
          <span className="flex items-center gap-1"><Clock size={12} />{formatRelativeDate(item.publishedAt)}</span>
        </div>
      </div>
    </div>
  );
};

const SignalCard: React.FC<{ item: RecommendedSignal; onExpand: (s: RecommendedSignal) => void; isExpanded: boolean }> = ({ item, onExpand, isExpanded }) => {
  const style = getSignalStyle(item.type);
  const barColor = item.type?.toUpperCase() === 'OPPORTUNITY' ? 'bg-emerald-500' : item.type?.toUpperCase() === 'RISK' ? 'bg-red-500' : 'bg-amber-500';

  return (
    <div
      onClick={() => onExpand(item)}
      className={`flex-shrink-0 w-80 ${style.bg} border ${style.border} rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer group ${
        isExpanded ? 'ring-2 ring-blue-300' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${style.icon}`}>
          <Zap size={12} />
          {getSignalTypeLabel(item.type)}
        </span>
        <span className="text-[10px] font-medium text-gray-400 bg-white/60 px-2 py-1 rounded-md truncate max-w-[120px]">
          {item._reason}
        </span>
      </div>

      <h3 className={`text-sm font-bold ${style.text} leading-tight mb-2 line-clamp-2`}>
        {item.titleAr || item.title}
      </h3>

      <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{item.summaryAr}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${style.icon} flex items-center justify-center`}>
            <span className={`text-sm font-black`}>{item.impactScore}</span>
          </div>
          <div className="text-[10px] text-gray-500">
            <span className="block font-bold text-gray-700">ثقة {item.confidence}%</span>
            <span>تأثير</span>
          </div>
        </div>
        {getTrendIcon(item.trend)}
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200/60 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">درجة التأثير</span>
            <span className={`font-bold ${style.text}`}>{item.impactScore}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${item.impactScore}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">مستوى الثقة</span>
            <span className="font-bold text-gray-700">{item.confidence}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div className="h-full rounded-full bg-blue-500" style={{ width: `${item.confidence}%` }} />
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2">
            <Clock size={10} />
            <span>{formatRelativeDate(item.createdAt)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const DatasetCard: React.FC<{ item: RecommendedDataset }> = ({ item }) => {
  return (
    <div
      onClick={() => { window.location.hash = `#/data/${item.id}`; }}
      className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-cyan-200 hover:shadow-lg transition-all cursor-pointer flex flex-col"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
          <Database size={20} className="text-cyan-600" />
        </div>
        <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md truncate max-w-[140px]">
          {item._reason}
        </span>
      </div>

      <h3 className="text-base font-bold text-gray-900 leading-tight mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">
        {item.nameAr || item.name}
      </h3>

      <div className="flex flex-wrap gap-2 mb-3">
        {item.category && (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md text-[10px] font-medium">
            <Tag size={10} />{item.category}
          </span>
        )}
        {item.source && (
          <span className="bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
            {item.source}
          </span>
        )}
      </div>

      <div className="flex-1" />

      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Database size={14} className="text-cyan-500" />
          <span className="font-bold text-gray-700">{formatNumber(item.recordCount)}</span>
          <span>سجل</span>
        </div>
        {item.lastSyncAt && (
          <span className="flex items-center gap-1 text-[10px] text-gray-400">
            <Clock size={10} />{formatRelativeDate(item.lastSyncAt)}
          </span>
        )}
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{
  icon: React.ReactNode; title: string; count: number; accentColor: string;
}> = ({ icon, title, count, accentColor }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className={`w-10 h-10 rounded-xl ${accentColor} flex items-center justify-center`}>{icon}</div>
    <h2 className="text-lg font-black text-gray-900">{title}</h2>
    <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg text-xs font-bold">{count}</span>
  </div>
);

// ============================================
// MAIN
// ============================================

const RecommendationsPage: React.FC = () => {
  const [data, setData] = useState<RecommendationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSignalId, setExpandedSignalId] = useState<string | null>(null);

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

  return (
    <div dir="rtl" className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-bl from-purple-50 via-white to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">التوصيات الذكية</h1>
                <p className="text-sm text-gray-500 mt-0.5">محتوى مقترح بناءً على اهتماماتك ونشاطك</p>
              </div>
            </div>
            <button
              onClick={() => fetchRecommendations(true)}
              disabled={refreshing || loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-sm"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              تحديث التوصيات
            </button>
          </div>

          {/* Meta */}
          {data?.meta && !loading && (
            <div className="bg-purple-50 border border-purple-100 rounded-xl px-5 py-3 mt-6 flex items-center gap-3">
              <Sparkles size={16} className="text-purple-500" />
              <span className="text-sm text-gray-600">
                بناءً على <span className="font-bold text-purple-600">{data.meta.basedOn.favorites}</span> مفضلة و <span className="font-bold text-purple-600">{data.meta.basedOn.following}</span> متابعة
              </span>
            </div>
          )}

          {/* Stats */}
          {data && !loading && hasAnyData && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {data.content.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center"><FileText size={16} className="text-blue-600" /></div>
                  <div><p className="text-lg font-black text-gray-900">{data.content.length}</p><p className="text-[11px] text-gray-500">محتوى مقترح</p></div>
                </div>
              )}
              {data.signals.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center"><Zap size={16} className="text-amber-600" /></div>
                  <div><p className="text-lg font-black text-gray-900">{data.signals.length}</p><p className="text-[11px] text-gray-500">إشارات قوية</p></div>
                </div>
              )}
              {data.datasets.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center"><Database size={16} className="text-cyan-600" /></div>
                  <div><p className="text-lg font-black text-gray-900">{data.datasets.length}</p><p className="text-[11px] text-gray-500">بيانات غنية</p></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center animate-pulse mb-4 shadow-lg shadow-violet-200">
              <Sparkles size={28} className="text-white" />
            </div>
            <p className="text-gray-700 font-bold text-lg mb-1">جاري تحليل اهتماماتك...</p>
            <p className="text-gray-400 text-sm">نحن نبحث عن أفضل التوصيات لك</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center mb-8">
            <Zap size={32} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-700 mb-2">تعذر تحميل التوصيات</h3>
            <p className="text-red-500 text-sm mb-6">{error}</p>
            <button
              onClick={() => fetchRecommendations()}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw size={16} />إعادة المحاولة
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && !hasAnyData && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-6">
              <Sparkles size={28} className="text-purple-500" />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-3">لا توجد توصيات حالياً</h3>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto">
              ابدأ بتصفح المحتوى وإضافة عناصر إلى المفضلة ومتابعة الجهات التي تهمك لنتمكن من تقديم توصيات مخصصة لك.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="#/feed" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors inline-flex items-center gap-2">
                <FileText size={18} />تصفح المحتوى
              </a>
              <a href="#/signals" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-colors inline-flex items-center gap-2">
                <Zap size={18} />استعرض الإشارات
              </a>
              <a href="#/datasets" className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-colors inline-flex items-center gap-2">
                <Database size={18} />تصفح البيانات
              </a>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && hasAnyData && (
          <div className="space-y-10">
            {data!.content.length > 0 && (
              <section>
                <SectionHeader icon={<FileText size={20} className="text-blue-600" />} title="محتوى مقترح" count={data!.content.length} accentColor="bg-blue-100" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data!.content.map((item) => <ContentCard key={item.id} item={item} />)}
                </div>
              </section>
            )}

            {data!.signals.length > 0 && (
              <section>
                <SectionHeader icon={<Zap size={20} className="text-amber-600" />} title="إشارات قوية" count={data!.signals.length} accentColor="bg-amber-100" />
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
                  {data!.signals.map((item) => (
                    <SignalCard key={item.id} item={item} onExpand={(s) => setExpandedSignalId(prev => prev === s.id ? null : s.id)} isExpanded={expandedSignalId === item.id} />
                  ))}
                </div>
              </section>
            )}

            {data!.datasets.length > 0 && (
              <section>
                <SectionHeader icon={<Database size={20} className="text-cyan-600" />} title="بيانات غنية" count={data!.datasets.length} accentColor="bg-cyan-100" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data!.datasets.map((item) => <DatasetCard key={item.id} item={item} />)}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Refreshing */}
        {refreshing && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-white border border-purple-200 rounded-full px-5 py-2.5 shadow-xl flex items-center gap-3">
              <RefreshCw size={16} className="text-purple-500 animate-spin" />
              <span className="text-sm font-bold text-gray-700">جاري تحديث التوصيات...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;
