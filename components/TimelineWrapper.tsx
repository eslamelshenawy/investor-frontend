import React, { useState, useEffect } from 'react';
import TimelineCard from './TimelineCard';
import { TimelineEvent, TimelineEventType } from '../types';
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
  Database,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  Filter,
  LayoutGrid,
  List,
  Sparkles,
  BarChart3,
  Calendar
} from 'lucide-react';

// API Base URL from environment
const API_BASE = import.meta.env.VITE_API_URL || 'https://investor-backend-production-e254.up.railway.app/api';

// API response types
interface ApiTimelineItem {
  id: string;
  type: string;
  title: string;
  titleAr: string;
  excerpt?: string;
  excerptAr?: string;
  summary?: string;
  summaryAr?: string;
  impactScore?: number;
  trend?: string;
  tags?: string | string[];
  date: string;
  itemType: 'content' | 'signal' | 'dataset' | 'sync';
  category?: string;
  recordCount?: number;
  externalId?: string;
  recordsCount?: number;
  newRecords?: number;
  updatedRecords?: number;
}

interface ApiResponse {
  success: boolean;
  data: ApiTimelineItem[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
  errorAr?: string;
}

interface TimelineWrapperProps {
  apiBaseUrl?: string;
  limit?: number;
  onItemClick?: (item: TimelineEvent) => void;
  className?: string;
}

// Filter options
const FILTER_OPTIONS = [
  { id: 'all', label: 'الكل', icon: LayoutGrid, color: 'bg-gray-100 text-gray-700' },
  { id: 'dataset', label: 'البيانات', icon: Database, color: 'bg-blue-100 text-blue-700' },
  { id: 'signal', label: 'الإشارات', icon: TrendingUp, color: 'bg-emerald-100 text-emerald-700' },
  { id: 'content', label: 'المحتوى', icon: Lightbulb, color: 'bg-purple-100 text-purple-700' },
  { id: 'sync', label: 'المزامنة', icon: RefreshCw, color: 'bg-indigo-100 text-indigo-700' },
];

// Map content/signal types to TimelineEventType
const mapTypeToEventType = (apiType: string, itemType: 'content' | 'signal' | 'dataset' | 'sync'): TimelineEventType => {
  if (itemType === 'dataset') {
    const datasetTypeMap: Record<string, TimelineEventType> = {
      'NEW_DATA': TimelineEventType.NEW_DATA,
      'UPDATE': TimelineEventType.UPDATE,
    };
    return datasetTypeMap[apiType?.toUpperCase()] || TimelineEventType.NEW_DATA;
  }

  if (itemType === 'sync') {
    return TimelineEventType.UPDATE;
  }

  if (itemType === 'signal') {
    const signalTypeMap: Record<string, TimelineEventType> = {
      'GROWTH': TimelineEventType.SIGNAL,
      'DECLINE': TimelineEventType.SIGNAL,
      'ANOMALY': TimelineEventType.REVISION,
      'TREND': TimelineEventType.INSIGHT,
      'ALERT': TimelineEventType.REVISION,
      'OPPORTUNITY': TimelineEventType.SIGNAL,
      'RISK': TimelineEventType.REVISION,
    };
    return signalTypeMap[apiType?.toUpperCase()] || TimelineEventType.SIGNAL;
  }

  const contentTypeMap: Record<string, TimelineEventType> = {
    'ARTICLE': TimelineEventType.INSIGHT,
    'REPORT': TimelineEventType.NEW_DATA,
    'ANALYSIS': TimelineEventType.INSIGHT,
    'NEWS': TimelineEventType.UPDATE,
    'UPDATE': TimelineEventType.UPDATE,
    'ALERT': TimelineEventType.REVISION,
    'DATA': TimelineEventType.NEW_DATA,
  };
  return contentTypeMap[apiType?.toUpperCase()] || TimelineEventType.NEW_DATA;
};

// Arabic type labels
const getArabicSourceName = (apiType: string, itemType: 'content' | 'signal' | 'dataset' | 'sync'): string => {
  if (itemType === 'dataset') {
    return 'البوابة الوطنية للبيانات';
  }

  if (itemType === 'sync') {
    return 'نظام المزامنة';
  }

  if (itemType === 'signal') {
    const signalLabels: Record<string, string> = {
      'GROWTH': 'إشارة نمو',
      'DECLINE': 'إشارة تراجع',
      'ANOMALY': 'إشارة شذوذ',
      'TREND': 'اتجاه السوق',
      'ALERT': 'تنبيه',
      'OPPORTUNITY': 'فرصة استثمارية',
      'RISK': 'تنبيه مخاطر',
    };
    return signalLabels[apiType?.toUpperCase()] || 'إشارة السوق';
  }

  const contentLabels: Record<string, string> = {
    'ARTICLE': 'مقال تحليلي',
    'REPORT': 'تقرير',
    'ANALYSIS': 'تحليل',
    'NEWS': 'خبر',
    'UPDATE': 'تحديث',
    'ALERT': 'تنبيه',
    'DATA': 'بيانات',
  };
  return contentLabels[apiType?.toUpperCase()] || 'رادار المستثمر';
};

// Parse tags safely
const parseTags = (tags: string | string[] | undefined): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return tags.split(',').map(t => t.trim()).filter(Boolean);
  }
};

// Transform API item to TimelineEvent
const transformToTimelineEvent = (item: ApiTimelineItem): TimelineEvent & { itemType: string } => {
  const eventType = mapTypeToEventType(item.type, item.itemType);
  const tags = parseTags(item.tags);

  let delta: TimelineEvent['delta'] | undefined;

  if (item.itemType === 'signal' && item.trend) {
    const isPositive = ['UP', 'GROWTH', 'POSITIVE'].includes(item.trend.toUpperCase());
    delta = {
      value: isPositive ? '↑' : '↓',
      isPositive,
      label: isPositive ? 'ارتفاع' : 'انخفاض',
    };
  } else if (item.itemType === 'dataset' && item.recordCount) {
    delta = {
      value: `${item.recordCount.toLocaleString()}`,
      isPositive: true,
      label: 'سجل',
    };
  } else if (item.itemType === 'sync') {
    const total = (item.newRecords || 0) + (item.updatedRecords || 0);
    delta = {
      value: `+${total}`,
      isPositive: total > 0,
      label: 'تحديث',
    };
  }

  return {
    id: item.id,
    type: eventType,
    title: item.titleAr || item.title,
    summary: item.summaryAr || item.summary || item.excerptAr || item.excerpt || '',
    timestamp: item.date,
    impactScore: item.impactScore || 50,
    sourceName: getArabicSourceName(item.type, item.itemType),
    delta,
    tags,
    itemType: item.itemType,
  };
};

const TimelineWrapper: React.FC<TimelineWrapperProps> = ({
  apiBaseUrl = `${API_BASE}/content`,
  limit = 50,
  onItemClick,
  className = '',
}) => {
  const [events, setEvents] = useState<(TimelineEvent & { itemType: string })[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<(TimelineEvent & { itemType: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [streamProgress, setStreamProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [useStreaming, setUseStreaming] = useState(true);

  // WebFlux-style streaming fetch using Server-Sent Events
  const fetchTimelineStream = () => {
    setStreaming(true);
    setLoading(true);
    setError(null);
    setEvents([]);
    setStreamProgress('جاري الاتصال...');

    const eventSource = new EventSource(`${apiBaseUrl}/timeline/stream?limit=${limit}`);
    const newEvents: (TimelineEvent & { itemType: string })[] = [];

    eventSource.addEventListener('start', (e) => {
      const data = JSON.parse(e.data);
      setStreamProgress(data.message);
    });

    eventSource.addEventListener('item', (e) => {
      const item = JSON.parse(e.data) as ApiTimelineItem;
      const transformedEvent = transformToTimelineEvent(item);
      newEvents.push(transformedEvent);
      // Update events progressively for real-time feel
      setEvents([...newEvents].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    });

    eventSource.addEventListener('progress', (e) => {
      const data = JSON.parse(e.data);
      const sourceLabels: Record<string, string> = {
        content: 'المحتوى',
        signals: 'الإشارات',
        datasets: 'البيانات',
        syncLogs: 'المزامنة',
      };
      setStreamProgress(`تم تحميل ${sourceLabels[data.source] || data.source}: ${data.count}`);
    });

    eventSource.addEventListener('complete', (e) => {
      const data = JSON.parse(e.data);
      setTotal(data.total);
      setStreamProgress('');
      setStreaming(false);
      setLoading(false);
      eventSource.close();
    });

    eventSource.addEventListener('error', (e) => {
      console.error('Stream error:', e);
      eventSource.close();
      setStreaming(false);
      // Fallback to regular fetch on stream error
      fetchTimelineFallback(1);
    });

    eventSource.onerror = () => {
      eventSource.close();
      setStreaming(false);
      // Fallback to regular fetch
      fetchTimelineFallback(1);
    };
  };

  // Fallback to regular fetch
  const fetchTimelineFallback = async (pageNum: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/timeline?page=${pageNum}&limit=${limit}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (!data.success) {
        setError(data.errorAr || data.error || 'فشل في تحميل البيانات');
        setLoading(false);
        return;
      }

      const transformedEvents = data.data ? data.data.map(transformToTimelineEvent) : [];

      if (pageNum === 1) {
        setEvents(transformedEvents);
      } else {
        setEvents(prev => [...prev, ...transformedEvents]);
      }

      if (data.meta) {
        setTotalPages(data.meta.totalPages);
        setTotal(data.meta.total);
      }
    } catch (err) {
      console.error('Timeline fetch error:', err);
      setError('فشل في الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = (pageNum: number = 1) => {
    if (useStreaming && pageNum === 1) {
      fetchTimelineStream();
    } else {
      fetchTimelineFallback(pageNum);
    }
  };

  useEffect(() => {
    fetchTimeline(1);
  }, [apiBaseUrl, limit]);

  // Filter events when filter changes
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(e => e.itemType === activeFilter));
    }
  }, [activeFilter, events]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTimeline(nextPage);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    setActiveFilter('all');
    fetchTimeline(1);
  };

  // Stats calculation
  const stats = {
    datasets: events.filter(e => e.itemType === 'dataset').length,
    signals: events.filter(e => e.itemType === 'signal').length,
    content: events.filter(e => e.itemType === 'content').length,
    sync: events.filter(e => e.itemType === 'sync').length,
  };

  // Loading State with streaming progress
  if (loading && events.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 ${className}`}>
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Sparkles size={12} className="text-white" />
          </div>
        </div>
        <p className="text-gray-600 mt-6 font-medium">
          {streaming ? 'WebFlux Streaming...' : 'جاري تحميل الجدول الزمني...'}
        </p>
        <p className="text-gray-400 text-sm mt-1">
          {streamProgress || 'يتم جلب أحدث البيانات'}
        </p>
        {streaming && (
          <div className="mt-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-600 font-medium">بث مباشر</span>
          </div>
        )}
      </div>
    );
  }

  // Error State
  if (error && events.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 ${className}`}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg mb-4">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">خطأ في التحميل</h3>
        <p className="text-gray-500 text-sm text-center mb-6 max-w-md">{error}</p>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
        >
          <RefreshCw className="w-4 h-4" />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // Empty State
  if (!loading && events.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 ${className}`}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد أحداث</h3>
        <p className="text-gray-500 text-sm text-center">
          لم يتم العثور على أي أحداث في الجدول الزمني
        </p>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header Section */}
      <div className="mb-6">
        {/* Title Row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              سجل التغييرات
              {streaming && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  WebFlux
                </span>
              )}
            </h1>
            <p className="text-gray-500 text-sm flex items-center gap-2">
              <Calendar size={14} />
              {streamProgress || 'آخر التحديثات والأحداث في الوقت الفعلي'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseStreaming(!useStreaming)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                useStreaming
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={useStreaming ? 'وضع البث المباشر' : 'وضع التحميل العادي'}
            >
              <Sparkles size={12} />
              {useStreaming ? 'بث' : 'عادي'}
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading || streaming}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading || streaming ? 'animate-spin' : ''}`} />
              تحديث
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <Database size={16} className="text-blue-600" />
              <span className="text-xs font-medium text-blue-600">البيانات</span>
            </div>
            <p className="text-xl font-bold text-blue-700">{stats.datasets}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-3 border border-emerald-100">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-emerald-600" />
              <span className="text-xs font-medium text-emerald-600">الإشارات</span>
            </div>
            <p className="text-xl font-bold text-emerald-700">{stats.signals}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-3 border border-purple-100">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb size={16} className="text-purple-600" />
              <span className="text-xs font-medium text-purple-600">المحتوى</span>
            </div>
            <p className="text-xl font-bold text-purple-700">{stats.content}</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-3 border border-indigo-100">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={16} className="text-indigo-600" />
              <span className="text-xs font-medium text-indigo-600">الإجمالي</span>
            </div>
            <p className="text-xl font-bold text-indigo-700">{total.toLocaleString()}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {FILTER_OPTIONS.map(filter => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? `${filter.color} shadow-sm`
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon size={16} />
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline Events */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Filter size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">لا توجد نتائج لهذا الفلتر</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <TimelineCard
              key={event.id}
              event={event}
              onClick={() => onItemClick?.(event)}
            />
          ))
        )}
      </div>

      {/* Load More */}
      {page < totalPages && activeFilter === 'all' && (
        <div className="mt-8 flex justify-center">
          {loading ? (
            <div className="flex items-center gap-3 text-gray-500 bg-gray-50 px-6 py-3 rounded-xl">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">جاري تحميل المزيد...</span>
            </div>
          ) : (
            <button
              onClick={handleLoadMore}
              className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium shadow-sm"
            >
              تحميل المزيد ({total.toLocaleString()} حدث)
            </button>
          )}
        </div>
      )}

      {/* Error Toast */}
      {error && events.length > 0 && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button
            onClick={handleLoadMore}
            className="text-sm text-red-600 font-medium hover:underline whitespace-nowrap"
          >
            إعادة المحاولة
          </button>
        </div>
      )}
    </div>
  );
};

export default TimelineWrapper;
