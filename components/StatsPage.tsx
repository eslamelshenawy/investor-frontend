/**
 * Stats Page - صفحة الإحصائيات
 * Real-time platform statistics with SSE streaming and REST API calls
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Database,
  BarChart3,
  TrendingUp,
  Users,
  Layers,
  Wifi,
  Loader2,
  RefreshCw,
  Tag,
  Hash,
  Activity,
} from 'lucide-react';
import { API_CONFIG } from '../src/core/config/app.config';
import { api } from '../src/services/api';

// ============================================
// TYPES
// ============================================

interface OverviewData {
  totalDatasets: number;
  totalCategories: number;
  totalSignals: number;
  totalUsers: number;
}

interface SourceItem {
  name: string;
  count: number;
  percentage: number;
}

interface CategoryItem {
  name: string;
  count: number;
  percentage: number;
}

interface TrendingItem {
  name: string;
  count: number;
  type: 'tag' | 'category';
}

type StreamStatus = 'idle' | 'connecting' | 'streaming' | 'complete' | 'error';

// ============================================
// HELPERS
// ============================================

const formatNumber = (n: number): string => n.toLocaleString('ar-SA');

// ============================================
// MAIN COMPONENT
// ============================================

const StatsPage: React.FC = () => {
  // Overview state
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState('');

  // Sources SSE state
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>('idle');
  const [sourcesError, setSourcesError] = useState('');
  const eventSourceRef = useRef<EventSource | null>(null);

  // Categories state
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  // Trending state
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState('');

  // ============================================
  // SSE: Sources Stream
  // ============================================

  const connectSourcesStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setSources([]);
    setSourcesError('');
    setStreamStatus('connecting');

    const url = `${API_CONFIG.baseUrl}/stats/sources/stream`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener('meta', (e) => {
      setStreamStatus('streaming');
      // meta event consumed but we don't need extra fields here
      try {
        JSON.parse(e.data);
      } catch {
        // ignore parse errors on meta
      }
    });

    es.addEventListener('source', (e) => {
      try {
        const data = JSON.parse(e.data);
        setSources((prev) => [
          ...prev,
          {
            name: data.name,
            count: data.count,
            percentage: data.percentage,
          },
        ]);
        setStreamStatus('streaming');
      } catch {
        // ignore malformed events
      }
    });

    es.addEventListener('complete', () => {
      setStreamStatus('complete');
      es.close();
    });

    es.addEventListener('error', (e) => {
      if ((e as MessageEvent).data) {
        try {
          const data = JSON.parse((e as MessageEvent).data);
          setSourcesError(data.message || 'فشل في تحميل بيانات المصادر');
        } catch {
          setSourcesError('فشل في تحميل بيانات المصادر');
        }
      }
      setStreamStatus('error');
      es.close();
    });

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) return;
      setSourcesError('فشل الاتصال بخادم البث المباشر');
      setStreamStatus('error');
      es.close();
    };
  }, []);

  // ============================================
  // REST API: Overview
  // ============================================

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    setOverviewError('');
    try {
      const res = await api.getOverviewStats();
      if (res.success && res.data) {
        setOverview({
          totalDatasets: res.data.totalDatasets,
          totalCategories: res.data.totalCategories,
          totalSignals: res.data.totalSignals || res.data.activeSignals,
          totalUsers: res.data.totalUsers,
        });
      } else {
        setOverviewError('فشل في تحميل الإحصائيات العامة');
      }
    } catch {
      setOverviewError('فشل في الاتصال بالخادم');
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  // ============================================
  // REST API: Categories
  // ============================================

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError('');
    try {
      const res = await api.getCategoryStats();
      if (res.success && res.data) {
        const cats = (res.data.categories || []).slice(0, 15).map((c: any) => ({
          name: c.name || 'غير مصنف',
          count: c.count,
          percentage: c.percentage,
        }));
        setCategories(cats);
      } else {
        setCategoriesError('فشل في تحميل التصنيفات');
      }
    } catch {
      setCategoriesError('فشل في الاتصال بالخادم');
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // ============================================
  // REST API: Trending
  // ============================================

  const loadTrending = useCallback(async () => {
    setTrendingLoading(true);
    setTrendingError('');
    try {
      const res = await api.getTrendingTopics();
      if (res.success && res.data) {
        const items: TrendingItem[] = [];
        // Add categories
        for (const c of (res.data.categories || []).slice(0, 8)) {
          items.push({ name: c.tag, count: c.count, type: 'category' });
        }
        // Add tags
        for (const t of (res.data.tags || [])) {
          items.push({ name: t.tag, count: t.count, type: 'tag' });
        }
        setTrending(items);
      } else {
        setTrendingError('فشل في تحميل المواضيع الرائجة');
      }
    } catch {
      setTrendingError('فشل في الاتصال بالخادم');
    } finally {
      setTrendingLoading(false);
    }
  }, []);

  // ============================================
  // Mount: Load all data
  // ============================================

  useEffect(() => {
    connectSourcesStream();
    loadOverview();
    loadCategories();
    loadTrending();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connectSourcesStream, loadOverview, loadCategories, loadTrending]);

  // ============================================
  // Reload all data
  // ============================================

  const reloadAll = () => {
    connectSourcesStream();
    loadOverview();
    loadCategories();
    loadTrending();
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8" dir="rtl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <BarChart3 size={22} className="text-blue-600" />
              </div>
              إحصائيات المنصة
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              نظرة شاملة على بيانات رادار المستثمر
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Stream status badge */}
            {streamStatus === 'connecting' && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                <Loader2 size={12} className="animate-spin" />
                جاري الاتصال...
              </span>
            )}
            {streamStatus === 'streaming' && (
              <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
                <Wifi size={12} className="animate-pulse" />
                بث مباشر
              </span>
            )}
            {streamStatus === 'complete' && (
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-100 px-3 py-1.5 rounded-full">
                <Activity size={12} />
                مكتمل
              </span>
            )}

            <button
              onClick={reloadAll}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition"
            >
              <RefreshCw size={16} />
              تحديث
            </button>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* Section 1: Overview Cards */}
      {/* ============================================ */}
      <section className="mb-8">
        {overviewLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-xl mb-3" />
                <div className="h-7 w-20 bg-gray-100 rounded mb-2" />
                <div className="h-4 w-24 bg-gray-50 rounded" />
              </div>
            ))}
          </div>
        )}

        {overviewError && !overviewLoading && (
          <div className="bg-white rounded-2xl p-8 border border-red-100 text-center">
            <Database size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 text-sm mb-4">{overviewError}</p>
            <button
              onClick={loadOverview}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition"
            >
              <RefreshCw size={16} />
              إعادة المحاولة
            </button>
          </div>
        )}

        {overview && !overviewLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'مجموعات البيانات',
                value: overview.totalDatasets,
                icon: Database,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                label: 'التصنيفات',
                value: overview.totalCategories,
                icon: Layers,
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                label: 'الإشارات النشطة',
                value: overview.totalSignals,
                icon: TrendingUp,
                color: 'text-amber-600',
                bg: 'bg-amber-50',
              },
              {
                label: 'المستخدمين',
                value: overview.totalUsers,
                icon: Users,
                color: 'text-green-600',
                bg: 'bg-green-50',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 group"
              >
                <div
                  className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                >
                  <stat.icon size={20} className={stat.color} />
                </div>
                <div className="text-2xl font-black text-gray-900">
                  {formatNumber(stat.value)}
                </div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============================================ */}
      {/* Section 2: Sources (SSE Stream) */}
      {/* ============================================ */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Database size={18} className="text-blue-600" />
            مصادر البيانات
            {streamStatus === 'streaming' && (
              <Loader2 size={14} className="animate-spin text-blue-500" />
            )}
          </h2>
          {streamStatus === 'complete' && sources.length > 0 && (
            <span className="text-xs text-gray-400">
              {formatNumber(sources.length)} مصدر
            </span>
          )}
        </div>

        {/* Initial loading */}
        {(streamStatus === 'connecting' || streamStatus === 'idle') &&
          sources.length === 0 &&
          !sourcesError && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <Loader2
                size={32}
                className="animate-spin text-blue-600 mx-auto mb-3"
              />
              <p className="text-gray-500 text-sm">
                جاري تحميل مصادر البيانات عبر البث المباشر...
              </p>
            </div>
          )}

        {/* Error */}
        {sourcesError && sources.length === 0 && (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-12 text-center">
            <Database size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 text-sm mb-4">{sourcesError}</p>
            <button
              onClick={connectSourcesStream}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition"
            >
              <RefreshCw size={16} />
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Sources list - streams in progressively */}
        {sources.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50">
              {sources.map((source, i) => (
                <div
                  key={source.name}
                  className="px-6 py-4 hover:bg-gray-50/50 transition-colors animate-fadeIn"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <Database size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="font-bold text-gray-900 text-sm truncate">
                          {source.name}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0 mr-4">
                          <span className="text-sm font-black text-blue-600">
                            {formatNumber(source.count)}
                          </span>
                          <span className="text-xs text-gray-400">
                            ({source.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      {/* Percentage bar */}
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-l from-blue-500 to-blue-400 transition-all duration-1000 ease-out"
                          style={{
                            width: `${Math.max(source.percentage, 2)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Streaming footer indicator */}
            {streamStatus === 'streaming' && (
              <div className="px-6 py-3 bg-blue-50/50 border-t border-blue-100/50 flex items-center justify-center gap-2">
                <Wifi size={14} className="text-blue-500 animate-pulse" />
                <span className="text-xs text-blue-600 font-medium">
                  جاري استقبال البيانات...
                </span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ============================================ */}
      {/* Two-column layout for Categories + Trending */}
      {/* ============================================ */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Section 3: Categories Distribution */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Layers size={18} className="text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">توزيع التصنيفات</h2>
          </div>

          {categoriesLoading && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <Loader2
                size={28}
                className="animate-spin text-purple-600 mx-auto mb-3"
              />
              <p className="text-gray-400 text-sm">جاري تحميل التصنيفات...</p>
            </div>
          )}

          {categoriesError && !categoriesLoading && (
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
              <Layers size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 text-sm mb-4">{categoriesError}</p>
              <button
                onClick={loadCategories}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition"
              >
                <RefreshCw size={16} />
                إعادة المحاولة
              </button>
            </div>
          )}

          {!categoriesLoading && !categoriesError && categories.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-50">
                {categories.map((cat) => (
                  <div
                    key={cat.name}
                    className="px-5 py-3.5 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-gray-900 truncate">
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0 mr-3">
                        <span className="text-sm font-black text-purple-600">
                          {formatNumber(cat.count)}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({cat.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-purple-500 to-purple-400 transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.max(cat.percentage, 2)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!categoriesLoading && !categoriesError && categories.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <Layers size={32} className="mx-auto mb-3 text-gray-200" />
              <p className="text-gray-400 text-sm">لا توجد تصنيفات متاحة</p>
            </div>
          )}
        </section>

        {/* Section 4: Trending Topics */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-amber-600" />
            <h2 className="text-lg font-bold text-gray-900">المواضيع الرائجة</h2>
          </div>

          {trendingLoading && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <Loader2
                size={28}
                className="animate-spin text-amber-600 mx-auto mb-3"
              />
              <p className="text-gray-400 text-sm">جاري تحميل المواضيع الرائجة...</p>
            </div>
          )}

          {trendingError && !trendingLoading && (
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
              <TrendingUp size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 text-sm mb-4">{trendingError}</p>
              <button
                onClick={loadTrending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition"
              >
                <RefreshCw size={16} />
                إعادة المحاولة
              </button>
            </div>
          )}

          {!trendingLoading && !trendingError && trending.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-wrap gap-2">
                {trending.map((item) => (
                  <span
                    key={item.name}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      item.type === 'tag'
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    {item.type === 'tag' ? (
                      <Hash size={13} />
                    ) : (
                      <Tag size={13} />
                    )}
                    {item.name}
                    <span
                      className={`text-xs font-bold mr-0.5 ${
                        item.type === 'tag'
                          ? 'text-amber-500'
                          : 'text-blue-500'
                      }`}
                    >
                      {formatNumber(item.count)}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {!trendingLoading && !trendingError && trending.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <TrendingUp size={32} className="mx-auto mb-3 text-gray-200" />
              <p className="text-gray-400 text-sm">لا توجد مواضيع رائجة حاليا</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default StatsPage;
