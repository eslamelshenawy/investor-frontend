import React, { useState, useEffect } from 'react';
import TimelineCard from './TimelineCard';
import { TimelineEvent, TimelineEventType } from '../types';
import { Loader2, AlertCircle, RefreshCw, Clock } from 'lucide-react';

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
  itemType: 'content' | 'signal';
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

// Map content/signal types to TimelineEventType
const mapTypeToEventType = (apiType: string, itemType: 'content' | 'signal'): TimelineEventType => {
  if (itemType === 'signal') {
    // Signal types mapping
    const signalTypeMap: Record<string, TimelineEventType> = {
      'GROWTH': TimelineEventType.SIGNAL,
      'DECLINE': TimelineEventType.SIGNAL,
      'ANOMALY': TimelineEventType.REVISION,
      'TREND': TimelineEventType.INSIGHT,
      'ALERT': TimelineEventType.REVISION,
      'OPPORTUNITY': TimelineEventType.SIGNAL,
    };
    return signalTypeMap[apiType?.toUpperCase()] || TimelineEventType.SIGNAL;
  }

  // Content types mapping
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
const getArabicSourceName = (apiType: string, itemType: 'content' | 'signal'): string => {
  if (itemType === 'signal') {
    const signalLabels: Record<string, string> = {
      'GROWTH': 'اشارة نمو',
      'DECLINE': 'اشارة تراجع',
      'ANOMALY': 'اشارة شذوذ',
      'TREND': 'اتجاه السوق',
      'ALERT': 'تنبيه',
      'OPPORTUNITY': 'فرصة استثمارية',
    };
    return signalLabels[apiType?.toUpperCase()] || 'اشارة السوق';
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

// Parse tags safely (handles both string and array)
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

// Demo/Fallback data
const DEMO_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'demo_1',
    type: TimelineEventType.NEW_DATA,
    title: 'تحديث بيانات التضخم الشهري',
    summary: 'أصدرت الهيئة العامة للإحصاء بيانات التضخم لشهر ديسمبر 2024، مسجلة ارتفاعاً بنسبة 1.6% على أساس سنوي.',
    timestamp: new Date().toISOString(),
    impactScore: 75,
    sourceName: 'الهيئة العامة للإحصاء',
    delta: { value: '+1.6%', isPositive: false, label: 'معدل التضخم' },
    tags: ['التضخم', 'الإحصاء', 'الاقتصاد'],
  },
  {
    id: 'demo_2',
    type: TimelineEventType.SIGNAL,
    title: 'إشارة نمو في قطاع التجزئة',
    summary: 'رصد نمو ملحوظ في مبيعات التجزئة بنسبة 8% مقارنة بالربع السابق، مدفوعاً بموسم الأعياد.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    impactScore: 68,
    sourceName: 'تحليل الذكاء الاصطناعي',
    delta: { value: '+8%', isPositive: true, label: 'نمو المبيعات' },
    tags: ['التجزئة', 'النمو', 'المبيعات'],
  },
  {
    id: 'demo_3',
    type: TimelineEventType.INSIGHT,
    title: 'تحليل: توقعات سوق العمل 2025',
    summary: 'تشير المؤشرات إلى استمرار تحسن سوق العمل مع توقع خلق 200 ألف وظيفة جديدة في القطاع الخاص.',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    impactScore: 82,
    sourceName: 'رادار المستثمر',
    tags: ['سوق العمل', 'التوظيف', 'القطاع الخاص'],
  },
  {
    id: 'demo_4',
    type: TimelineEventType.UPDATE,
    title: 'تحديث مؤشر أسعار العقارات',
    summary: 'سجل مؤشر أسعار العقارات السكنية ارتفاعاً بنسبة 2.3% في الربع الرابع من 2024.',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    impactScore: 65,
    sourceName: 'الهيئة العامة للعقار',
    delta: { value: '+2.3%', isPositive: true, label: 'ارتفاع الأسعار' },
    tags: ['العقارات', 'الأسعار', 'السكني'],
  },
  {
    id: 'demo_5',
    type: TimelineEventType.REVISION,
    title: 'تعديل توقعات نمو الناتج المحلي',
    summary: 'عدّل صندوق النقد الدولي توقعاته لنمو الناتج المحلي السعودي لعام 2025 إلى 4.6%.',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    impactScore: 88,
    sourceName: 'صندوق النقد الدولي',
    delta: { value: '4.6%', isPositive: true, label: 'معدل النمو' },
    tags: ['الناتج المحلي', 'النمو', 'IMF'],
  },
  {
    id: 'demo_6',
    type: TimelineEventType.NEW_DATA,
    title: 'إصدار بيانات الميزان التجاري',
    summary: 'حقق الميزان التجاري فائضاً بقيمة 45 مليار ريال في نوفمبر 2024، مدعوماً بارتفاع صادرات النفط.',
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    impactScore: 71,
    sourceName: 'الهيئة العامة للإحصاء',
    delta: { value: '+45B', isPositive: true, label: 'فائض تجاري' },
    tags: ['الميزان التجاري', 'الصادرات', 'النفط'],
  },
  {
    id: 'demo_7',
    type: TimelineEventType.SIGNAL,
    title: 'تنبيه: ارتفاع أسعار مواد البناء',
    summary: 'رصد ارتفاع في أسعار الحديد والأسمنت بنسبة 5% خلال الشهر الماضي.',
    timestamp: new Date(Date.now() - 21600000).toISOString(),
    impactScore: 62,
    sourceName: 'مؤشر أسعار المنتجين',
    delta: { value: '+5%', isPositive: false, label: 'ارتفاع التكاليف' },
    tags: ['البناء', 'الأسعار', 'المواد'],
  },
  {
    id: 'demo_8',
    type: TimelineEventType.INSIGHT,
    title: 'رؤية: مستقبل التجارة الإلكترونية',
    summary: 'من المتوقع أن يصل حجم سوق التجارة الإلكترونية إلى 80 مليار ريال بحلول 2026.',
    timestamp: new Date(Date.now() - 25200000).toISOString(),
    impactScore: 76,
    sourceName: 'تقرير السوق',
    tags: ['التجارة الإلكترونية', 'النمو', 'التقنية'],
  },
];

// Transform API item to TimelineEvent
const transformToTimelineEvent = (item: ApiTimelineItem): TimelineEvent => {
  const eventType = mapTypeToEventType(item.type, item.itemType);
  const tags = parseTags(item.tags);

  // Determine delta from trend (for signals)
  let delta: TimelineEvent['delta'] | undefined;
  if (item.itemType === 'signal' && item.trend) {
    const isPositive = ['UP', 'GROWTH', 'POSITIVE'].includes(item.trend.toUpperCase());
    delta = {
      value: isPositive ? '+' : '-',
      isPositive,
      label: isPositive ? 'ارتفاع' : 'انخفاض',
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
  };
};

const TimelineWrapper: React.FC<TimelineWrapperProps> = ({
  apiBaseUrl = '/api/content',
  limit = 30,
  onItemClick,
  className = '',
}) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTimeline = async (pageNum: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/timeline?page=${pageNum}&limit=${limit}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (!data.success || !data.data || data.data.length === 0) {
        // Use demo data when API returns empty
        console.log('Using demo timeline data');
        setEvents(DEMO_TIMELINE_EVENTS);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      const transformedEvents = data.data.map(transformToTimelineEvent);

      if (pageNum === 1) {
        setEvents(transformedEvents);
      } else {
        setEvents(prev => [...prev, ...transformedEvents]);
      }

      if (data.meta) {
        setTotalPages(data.meta.totalPages);
      }
    } catch (err) {
      console.error('Timeline fetch error, using demo data:', err);
      // Use demo data on error
      setEvents(DEMO_TIMELINE_EVENTS);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline(1);
  }, [apiBaseUrl, limit]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTimeline(nextPage);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    fetchTimeline(1);
  };

  // Loading State
  if (loading && events.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 text-sm">جاري تحميل الجدول الزمني...</p>
      </div>
    );
  }

  // Error State
  if (error && events.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <div className="bg-red-50 rounded-full p-4 mb-4">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">خطأ في التحميل</h3>
        <p className="text-gray-500 text-sm text-center mb-4 max-w-md">{error}</p>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          اعادة المحاولة
        </button>
      </div>
    );
  }

  // Empty State
  if (!loading && events.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <div className="bg-gray-100 rounded-full p-4 mb-4">
          <Clock className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد أحداث</h3>
        <p className="text-gray-500 text-sm text-center">
          لم يتم العثور على أي أحداث في الجدول الزمني
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with Refresh */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">الجدول الزمني</h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </button>
      </div>

      {/* Timeline Events */}
      <div className="space-y-4">
        {events.map((event) => (
          <TimelineCard
            key={event.id}
            event={event}
            onClick={() => onItemClick?.(event)}
          />
        ))}
      </div>

      {/* Load More / Loading Indicator */}
      {page < totalPages && (
        <div className="mt-6 flex justify-center">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">جاري تحميل المزيد...</span>
            </div>
          ) : (
            <button
              onClick={handleLoadMore}
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium"
            >
              تحميل المزيد
            </button>
          )}
        </div>
      )}

      {/* Error Toast (when loading more fails) */}
      {error && events.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={handleLoadMore}
            className="mr-auto text-sm text-red-600 hover:underline"
          >
            اعادة المحاولة
          </button>
        </div>
      )}
    </div>
  );
};

export default TimelineWrapper;
