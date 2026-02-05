import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText,
  Edit3,
  Trash2,
  Send,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  ThumbsUp,
  MessageSquare,
  BarChart3,
  AlertCircle,
  Wifi,
} from 'lucide-react';
import { api } from '../src/services/api';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type ContentStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'REJECTED';

interface ContentPost {
  id: string;
  title: string;
  titleAr: string;
  type: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  views?: number;
  likes?: number;
  comments?: number;
}

const STATUS_CONFIG: Record<ContentStatus, { label: string; bg: string; text: string }> = {
  DRAFT: { label: 'مسودة', bg: 'bg-gray-100', text: 'text-gray-600' },
  PENDING_REVIEW: { label: 'قيد المراجعة', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  APPROVED: { label: 'موافق عليه', bg: 'bg-blue-50', text: 'text-blue-700' },
  SCHEDULED: { label: 'مجدول', bg: 'bg-purple-50', text: 'text-purple-700' },
  PUBLISHED: { label: 'منشور', bg: 'bg-green-50', text: 'text-green-700' },
  REJECTED: { label: 'مرفوض', bg: 'bg-red-50', text: 'text-red-700' },
};

const TYPE_LABELS: Record<string, string> = {
  ARTICLE: 'مقال',
  REPORT: 'تقرير',
  ANALYSIS: 'تحليل',
  INSIGHT: 'رؤية',
  DEEP_INSIGHT: 'تحليل معمّق',
  CHART: 'رسم بياني',
  COMPARISON: 'مقارنة',
  DATA_HIGHLIGHT: 'إبراز بيانات',
  VISUAL: 'محتوى بصري',
  INFOGRAPHIC: 'إنفوجرافيك',
};

type TabKey = 'ALL' | ContentStatus;

const TABS: { key: TabKey; label: string }[] = [
  { key: 'ALL', label: 'الكل' },
  { key: 'DRAFT', label: 'مسودة' },
  { key: 'PENDING_REVIEW', label: 'قيد المراجعة' },
  { key: 'APPROVED', label: 'موافق عليه' },
  { key: 'PUBLISHED', label: 'منشور' },
  { key: 'REJECTED', label: 'مرفوض' },
];

const PAGE_LIMIT = 12;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const MyContentPage: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [streaming, setStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // ---- SSE Stream data (WebFlux) ----

  const streamContent = useCallback(() => {
    // Close previous stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setLoading(true);
    setStreaming(true);
    setErrorMsg('');
    setPosts([]);

    const token = localStorage.getItem('investor_radar_auth_token');
    const status = activeTab === 'ALL' ? '' : activeTab;
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (token) params.append('token', token);

    const url = `${API_BASE_URL}/content/my/stream${params.toString() ? '?' + params.toString() : ''}`;

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('start', (e) => {
      try {
        const data = JSON.parse(e.data);
        setTotalPages(Math.ceil((data.total ?? 0) / PAGE_LIMIT) || 1);
      } catch {}
      setLoading(false);
    });

    eventSource.addEventListener('content', (e) => {
      try {
        const item = JSON.parse(e.data);
        setPosts(prev => {
          if (prev.some(p => p.id === item.id)) return prev;
          return [...prev, item];
        });
      } catch {}
    });

    eventSource.addEventListener('complete', () => {
      setStreaming(false);
      setLoading(false);
      eventSource.close();
    });

    eventSource.onerror = () => {
      eventSource.close();
      setStreaming(false);
      // Fallback to regular REST API
      fetchContentRest();
    };
  }, [activeTab]);

  // REST fallback
  const fetchContentRest = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const status = activeTab === 'ALL' ? undefined : activeTab;
      const res: any = await api.getMyContent({ status, page, limit: PAGE_LIMIT });
      setPosts(res.data ?? res.items ?? res ?? []);
      setTotalPages(res.totalPages ?? (Math.ceil((res.total ?? 0) / PAGE_LIMIT) || 1));
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'حدث خطأ أثناء جلب المحتوى');
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  // Alias for actions that need to refetch
  const fetchContent = fetchContentRest;

  useEffect(() => {
    streamContent();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [streamContent]);

  // Reset page when switching tabs
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // ---- Actions ----

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المحتوى؟')) return;
    setActionLoading(id);
    setErrorMsg('');
    try {
      await api.deleteContentPost(id);
      setSuccessMsg('تم حذف المحتوى بنجاح');
      fetchContent();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'حدث خطأ أثناء الحذف');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitForReview = async (id: string) => {
    setActionLoading(id);
    setErrorMsg('');
    try {
      await api.submitForReview(id);
      setSuccessMsg('تم إرسال المحتوى للمراجعة');
      fetchContent();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'حدث خطأ أثناء الإرسال');
    } finally {
      setActionLoading(null);
    }
  };

  const handleNavigateToEdit = (id: string) => {
    // Navigate to edit page – integration depends on router used in the app
    window.location.href = `/#/content/${id}`;
  };

  // ---- Helpers ----

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  // ---- Render ----

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">محتوياتي</h1>
              <p className="text-sm text-gray-500">إدارة المحتوى الخاص بك</p>
            </div>
          </div>
          <a
            href="/#/create-post"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <FileText className="h-4 w-4" />
            إنشاء محتوى جديد
          </a>
        </div>

        {/* Messages */}
        {successMsg && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Streaming indicator */}
        {streaming && posts.length > 0 && (
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full text-sm text-blue-600">
              <Wifi className="w-4 h-4 animate-pulse" />
              <span>جاري تحميل المزيد عبر WebFlux...</span>
            </div>
          </div>
        )}

        {/* Content list */}
        {loading && posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Wifi className="w-6 h-6 animate-pulse text-blue-500 mb-3" />
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
            <p className="mt-3 text-sm text-gray-500">جاري تحميل المحتوى عبر WebFlux...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FileText className="mb-3 h-12 w-12" />
            <p className="text-lg font-medium">لا يوجد محتوى</p>
            <p className="text-sm">لم يتم العثور على أي محتوى في هذا التصنيف</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const statusCfg = STATUS_CONFIG[post.status] ?? STATUS_CONFIG.DRAFT;
              const isDraft = post.status === 'DRAFT';
              const isRejected = post.status === 'REJECTED';
              const canEdit = isDraft || isRejected;
              const isActionLoading = actionLoading === post.id;

              return (
                <div
                  key={post.id}
                  className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
                >
                  {/* Top row: type + status */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {TYPE_LABELS[post.type] ?? post.type}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}
                    >
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className="mb-2 line-clamp-2 cursor-pointer text-base font-semibold text-gray-900 transition group-hover:text-blue-600"
                    onClick={() => canEdit && handleNavigateToEdit(post.id)}
                  >
                    {post.titleAr || post.title || '(بدون عنوان)'}
                  </h3>

                  {/* Date */}
                  <div className="mb-4 flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(post.updatedAt ?? post.createdAt)}
                  </div>

                  {/* Engagement stats */}
                  {post.status === 'PUBLISHED' && (
                    <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
                      {post.views !== undefined && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {post.views.toLocaleString('ar-SA')}
                        </span>
                      )}
                      {post.likes !== undefined && (
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {post.likes.toLocaleString('ar-SA')}
                        </span>
                      )}
                      {post.comments !== undefined && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {post.comments.toLocaleString('ar-SA')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-t border-gray-200 pt-3">
                    {canEdit && (
                      <button
                        onClick={() => handleNavigateToEdit(post.id)}
                        disabled={isActionLoading}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        تعديل
                      </button>
                    )}

                    {isDraft && (
                      <>
                        <button
                          onClick={() => handleSubmitForReview(post.id)}
                          disabled={isActionLoading}
                          className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                        >
                          <Send className="h-3.5 w-3.5" />
                          إرسال للمراجعة
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={isActionLoading}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          حذف
                        </button>
                      </>
                    )}

                    {isActionLoading && (
                      <div className="mr-auto h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <span className="px-3 text-sm text-gray-500">
              صفحة {page.toLocaleString('ar-SA')} من {totalPages.toLocaleString('ar-SA')}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyContentPage;
