import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Send,
  Pin,
  PinOff,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  User,
  MessageSquare,
  Wifi,
} from 'lucide-react';
import { api } from '../src/services/api';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type WorkflowStatus = 'PENDING_REVIEW' | 'APPROVED' | 'SCHEDULED' | 'REJECTED';

interface ContentItem {
  id: string;
  title: string;
  titleAr: string;
  type: string;
  status: WorkflowStatus;
  createdAt: string;
  submittedAt: string;
  scheduledAt?: string;
  pinned?: boolean;
  author?: {
    id: string;
    name: string;
    nameAr?: string;
    avatar?: string;
  };
  reviewNote?: string;
}

const STATUS_CONFIG: Record<WorkflowStatus, { label: string; bg: string; text: string; border: string }> = {
  PENDING_REVIEW: {
    label: 'قيد المراجعة',
    bg: 'bg-yellow-600/20',
    text: 'text-yellow-400',
    border: 'border-yellow-700',
  },
  APPROVED: {
    label: 'موافق عليه',
    bg: 'bg-blue-600/20',
    text: 'text-blue-400',
    border: 'border-blue-700',
  },
  SCHEDULED: {
    label: 'مجدول',
    bg: 'bg-purple-600/20',
    text: 'text-purple-400',
    border: 'border-purple-700',
  },
  REJECTED: {
    label: 'مرفوض',
    bg: 'bg-red-600/20',
    text: 'text-red-400',
    border: 'border-red-700',
  },
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

const TABS: { key: WorkflowStatus; label: string }[] = [
  { key: 'PENDING_REVIEW', label: 'قيد المراجعة' },
  { key: 'APPROVED', label: 'موافق عليه' },
  { key: 'SCHEDULED', label: 'مجدول' },
  { key: 'REJECTED', label: 'مرفوض' },
];

const PAGE_LIMIT = 12;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ContentWorkflowPage: React.FC = () => {
  const { user } = useAuth();

  // Tab & list state
  const [activeTab, setActiveTab] = useState<WorkflowStatus>('PENDING_REVIEW');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [streaming, setStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Review modal state
  const [reviewTarget, setReviewTarget] = useState<ContentItem | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNote, setReviewNote] = useState('');

  // Schedule modal state
  const [scheduleTarget, setScheduleTarget] = useState<ContentItem | null>(null);
  const [scheduleDatetime, setScheduleDatetime] = useState('');

  // ---- SSE Stream data (WebFlux) ----

  const streamContent = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setLoading(true);
    setStreaming(true);
    setErrorMsg('');
    setItems([]);

    const token = localStorage.getItem('investor_radar_auth_token');
    const params = new URLSearchParams();
    params.append('status', activeTab);
    if (token) params.append('token', token);

    const url = `${API_BASE_URL}/content/pending/stream?${params.toString()}`;
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
        setItems(prev => {
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
      fetchContentRest();
    };
  }, [activeTab]);

  // REST fallback
  const fetchContentRest = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res: any = await api.getPendingContent({
        status: activeTab,
        page,
        limit: PAGE_LIMIT,
      });
      setItems(res.data ?? res.items ?? res ?? []);
      setTotalPages(res.totalPages ?? (Math.ceil((res.total ?? 0) / PAGE_LIMIT) || 1));
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'حدث خطأ أثناء جلب المحتوى');
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  const fetchContent = fetchContentRest;

  useEffect(() => {
    streamContent();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [streamContent]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // ---- Helpers ----

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  // ---- Review actions ----

  const openReviewModal = (item: ContentItem, action: 'approve' | 'reject') => {
    clearMessages();
    setReviewTarget(item);
    setReviewAction(action);
    setReviewNote('');
  };

  const closeReviewModal = () => {
    setReviewTarget(null);
    setReviewNote('');
  };

  const submitReview = async () => {
    if (!reviewTarget) return;
    setActionLoading(reviewTarget.id);
    clearMessages();
    try {
      await api.reviewContent(reviewTarget.id, reviewAction, reviewNote || undefined);
      setSuccessMsg(
        reviewAction === 'approve'
          ? 'تمت الموافقة على المحتوى بنجاح'
          : 'تم رفض المحتوى'
      );
      closeReviewModal();
      fetchContent();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'حدث خطأ أثناء المراجعة');
    } finally {
      setActionLoading(null);
    }
  };

  // ---- Schedule actions ----

  const openScheduleModal = (item: ContentItem) => {
    clearMessages();
    setScheduleTarget(item);
    setScheduleDatetime('');
  };

  const closeScheduleModal = () => {
    setScheduleTarget(null);
    setScheduleDatetime('');
  };

  const submitSchedule = async () => {
    if (!scheduleTarget || !scheduleDatetime) return;
    setActionLoading(scheduleTarget.id);
    clearMessages();
    try {
      await api.scheduleContent(scheduleTarget.id, new Date(scheduleDatetime).toISOString());
      setSuccessMsg('تمت جدولة المحتوى بنجاح');
      closeScheduleModal();
      fetchContent();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'حدث خطأ أثناء الجدولة');
    } finally {
      setActionLoading(null);
    }
  };

  // ---- Publish action ----

  const handlePublish = async (id: string) => {
    setActionLoading(id);
    clearMessages();
    try {
      await api.publishContent(id);
      setSuccessMsg('تم نشر المحتوى بنجاح');
      fetchContent();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'حدث خطأ أثناء النشر');
    } finally {
      setActionLoading(null);
    }
  };

  // ---- Pin toggle ----

  const handleTogglePin = async (item: ContentItem) => {
    setActionLoading(item.id);
    clearMessages();
    try {
      await api.pinContent(item.id);
      setSuccessMsg(item.pinned ? 'تم إلغاء التثبيت' : 'تم تثبيت المحتوى');
      fetchContent();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  // ---- UI helpers ----

  const inputClass =
    'w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition';

  // ---- Render ----

  return (
    <div dir="rtl" className="min-h-screen bg-slate-900 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20">
            <FileText className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">إدارة سير المحتوى</h1>
            <p className="text-sm text-slate-400">مراجعة وإدارة المحتوى المقدّم من الكتّاب والمحللين</p>
          </div>
        </div>

        {/* Messages */}
        {successMsg && (
          <div className="mb-4 rounded-lg border border-green-700 bg-green-900/30 px-4 py-3 text-sm text-green-400">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-700 bg-red-900/30 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-slate-700 bg-slate-800/60 p-1">
          {TABS.map((tab) => {
            const cfg = STATUS_CONFIG[tab.key];
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <FileText className="mb-3 h-12 w-12" />
            <p className="text-lg font-medium">لا يوجد محتوى</p>
            <p className="text-sm">لا يوجد محتوى في هذا التصنيف حاليًا</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const statusCfg = STATUS_CONFIG[item.status];
              const isActionLoading = actionLoading === item.id;
              const isPending = item.status === 'PENDING_REVIEW';
              const isApproved = item.status === 'APPROVED';
              const isScheduled = item.status === 'SCHEDULED';

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border bg-slate-800/60 p-5 transition hover:bg-slate-800 ${
                    item.pinned ? 'border-blue-600/50' : 'border-slate-700'
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    {/* Left section: Info */}
                    <div className="flex-1 space-y-2">
                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300">
                          {TYPE_LABELS[item.type] ?? item.type}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}
                        >
                          {statusCfg.label}
                        </span>
                        {item.pinned && (
                          <span className="flex items-center gap-1 rounded-full bg-blue-600/20 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                            <Pin className="h-3 w-3" />
                            مثبّت
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-slate-100">
                        {item.titleAr || item.title || '(بدون عنوان)'}
                      </h3>

                      {/* Author & date */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        {item.author && (
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            {item.author.nameAr ?? item.author.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(item.submittedAt ?? item.createdAt)}
                        </span>
                        {item.scheduledAt && (
                          <span className="flex items-center gap-1.5 text-purple-400">
                            <Calendar className="h-3.5 w-3.5" />
                            مجدول: {formatDate(item.scheduledAt)}
                          </span>
                        )}
                      </div>

                      {/* Review note */}
                      {item.reviewNote && (
                        <div className="mt-2 flex items-start gap-2 rounded-lg bg-slate-700/50 px-3 py-2 text-xs text-slate-400">
                          <MessageSquare className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                          <span>{item.reviewNote}</span>
                        </div>
                      )}
                    </div>

                    {/* Right section: Actions */}
                    <div className="flex flex-wrap items-center gap-2 lg:flex-shrink-0">
                      {/* Review buttons for PENDING_REVIEW */}
                      {isPending && (
                        <>
                          <button
                            onClick={() => openReviewModal(item, 'approve')}
                            disabled={isActionLoading}
                            className="flex items-center gap-1.5 rounded-lg bg-green-600/20 px-3.5 py-2 text-xs font-medium text-green-400 transition hover:bg-green-600/30 disabled:opacity-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                            موافقة
                          </button>
                          <button
                            onClick={() => openReviewModal(item, 'reject')}
                            disabled={isActionLoading}
                            className="flex items-center gap-1.5 rounded-lg bg-red-600/20 px-3.5 py-2 text-xs font-medium text-red-400 transition hover:bg-red-600/30 disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4" />
                            رفض
                          </button>
                        </>
                      )}

                      {/* Schedule / Publish for APPROVED */}
                      {isApproved && (
                        <>
                          <button
                            onClick={() => openScheduleModal(item)}
                            disabled={isActionLoading}
                            className="flex items-center gap-1.5 rounded-lg bg-purple-600/20 px-3.5 py-2 text-xs font-medium text-purple-400 transition hover:bg-purple-600/30 disabled:opacity-50"
                          >
                            <Calendar className="h-4 w-4" />
                            جدولة
                          </button>
                          <button
                            onClick={() => handlePublish(item.id)}
                            disabled={isActionLoading}
                            className="flex items-center gap-1.5 rounded-lg bg-green-600/20 px-3.5 py-2 text-xs font-medium text-green-400 transition hover:bg-green-600/30 disabled:opacity-50"
                          >
                            <Send className="h-4 w-4" />
                            نشر الآن
                          </button>
                        </>
                      )}

                      {/* Publish for SCHEDULED */}
                      {isScheduled && (
                        <button
                          onClick={() => handlePublish(item.id)}
                          disabled={isActionLoading}
                          className="flex items-center gap-1.5 rounded-lg bg-green-600/20 px-3.5 py-2 text-xs font-medium text-green-400 transition hover:bg-green-600/30 disabled:opacity-50"
                        >
                          <Send className="h-4 w-4" />
                          نشر الآن
                        </button>
                      )}

                      {/* Pin / Unpin (available for all statuses) */}
                      <button
                        onClick={() => handleTogglePin(item)}
                        disabled={isActionLoading}
                        className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition disabled:opacity-50 ${
                          item.pinned
                            ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                        }`}
                      >
                        {item.pinned ? (
                          <>
                            <PinOff className="h-4 w-4" />
                            إلغاء التثبيت
                          </>
                        ) : (
                          <>
                            <Pin className="h-4 w-4" />
                            تثبيت
                          </>
                        )}
                      </button>

                      {/* Preview */}
                      <button
                        onClick={() => window.open(`/content/preview/${item.id}`, '_blank')}
                        className="flex items-center gap-1.5 rounded-lg bg-slate-700 px-3.5 py-2 text-xs font-medium text-slate-400 transition hover:bg-slate-600"
                      >
                        <Eye className="h-4 w-4" />
                        معاينة
                      </button>

                      {isActionLoading && (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
                      )}
                    </div>
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
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="px-3 text-sm text-slate-400">
              صفحة {page.toLocaleString('ar-SA')} من {totalPages.toLocaleString('ar-SA')}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* Review Modal (Approve / Reject)                                     */}
      {/* ================================================================== */}
      {reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            dir="rtl"
            className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-2xl"
          >
            <h2 className="mb-1 text-lg font-bold text-slate-100">
              {reviewAction === 'approve' ? 'الموافقة على المحتوى' : 'رفض المحتوى'}
            </h2>
            <p className="mb-4 text-sm text-slate-400">
              {reviewTarget.titleAr || reviewTarget.title}
            </p>

            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              ملاحظة {reviewAction === 'reject' ? '(مطلوبة)' : '(اختيارية)'}
            </label>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              rows={4}
              placeholder="اكتب ملاحظتك هنا..."
              className={inputClass + ' resize-y'}
            />

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={closeReviewModal}
                className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-600"
              >
                إلغاء
              </button>
              <button
                onClick={submitReview}
                disabled={
                  actionLoading === reviewTarget.id ||
                  (reviewAction === 'reject' && !reviewNote.trim())
                }
                className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  reviewAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {reviewAction === 'approve' ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    موافقة
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    رفض
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* Schedule Modal                                                      */}
      {/* ================================================================== */}
      {scheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            dir="rtl"
            className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-2xl"
          >
            <h2 className="mb-1 text-lg font-bold text-slate-100">جدولة النشر</h2>
            <p className="mb-4 text-sm text-slate-400">
              {scheduleTarget.titleAr || scheduleTarget.title}
            </p>

            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              تاريخ ووقت النشر
            </label>
            <input
              type="datetime-local"
              value={scheduleDatetime}
              onChange={(e) => setScheduleDatetime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className={inputClass}
            />

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={closeScheduleModal}
                className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-600"
              >
                إلغاء
              </button>
              <button
                onClick={submitSchedule}
                disabled={actionLoading === scheduleTarget.id || !scheduleDatetime}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Calendar className="h-4 w-4" />
                جدولة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentWorkflowPage;
