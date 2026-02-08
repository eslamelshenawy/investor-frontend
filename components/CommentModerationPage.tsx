import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageCircle,
  Trash2,
  Search,
  Filter,
  Shield,
  Eye,
  Clock,
  User,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  Calendar,
  BarChart3,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { api } from '../src/services/api';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CommentUser {
  id: string;
  name: string;
  nameAr?: string;
  avatar?: string;
  role: string;
}

interface Comment {
  id: string;
  contentId: string;
  userId: string;
  parentId?: string;
  body: string;
  bodyAr?: string;
  isEdited: boolean;
  user: CommentUser;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

interface ContentItem {
  id: string;
  type: string;
  title: string;
  titleAr: string;
  excerpt?: string;
  excerptAr?: string;
  tags: string[];
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  publishedAt: string;
  author?: {
    id: string;
    name: string;
    nameAr?: string;
    avatar?: string;
  };
}

interface ContentWithComments {
  content: ContentItem;
  comments: Comment[];
  totalComments: number;
}

// ---------------------------------------------------------------------------
// Role badge config
// ---------------------------------------------------------------------------

const ROLE_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  STANDARD: { label: 'مستخدم', bg: 'bg-slate-600', text: 'text-slate-200' },
  ANALYST: { label: 'محلل', bg: 'bg-blue-600', text: 'text-blue-100' },
  EXPERT: { label: 'خبير', bg: 'bg-purple-600', text: 'text-purple-100' },
  WRITER: { label: 'كاتب', bg: 'bg-emerald-600', text: 'text-emerald-100' },
  DESIGNER: { label: 'مصمم', bg: 'bg-pink-600', text: 'text-pink-100' },
  CONTENT_MANAGER: { label: 'مدير محتوى', bg: 'bg-amber-600', text: 'text-amber-100' },
  EDITOR: { label: 'محرر', bg: 'bg-indigo-600', text: 'text-indigo-100' },
  ADMIN: { label: 'مسؤول', bg: 'bg-red-600', text: 'text-red-100' },
  SUPER_ADMIN: { label: 'مسؤول أعلى', bg: 'bg-red-700', text: 'text-red-100' },
  CURBTRON: { label: 'CurbTron', bg: 'bg-cyan-600', text: 'text-cyan-100' },
};

type FilterMode = 'all' | 'recent' | 'flagged';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function isWithinDays(iso: string, days: number): boolean {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  return diff <= days * 24 * 60 * 60 * 1000;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function flattenComments(comments: Comment[]): Comment[] {
  const flat: Comment[] = [];
  for (const c of comments) {
    flat.push(c);
    if (c.replies && c.replies.length > 0) {
      flat.push(...c.replies);
    }
  }
  return flat;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CommentModerationPage: React.FC = () => {
  const { user } = useAuth();

  // State
  const [contentWithComments, setContentWithComments] = useState<ContentWithComments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ commentId: string; contentId: string } | null>(null);
  const [useSSE, setUseSSE] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Stats
  const [statsToday, setStatsToday] = useState(0);
  const [statsWeek, setStatsWeek] = useState(0);
  const [totalComments, setTotalComments] = useState(0);

  // SSE ref for cleanup
  const eventSourceRefs = useRef<EventSource[]>([]);

  // -----------------------------------------------------------------------
  // Fetch content feed, then load comments per content item
  // -----------------------------------------------------------------------

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Cleanup previous SSE connections
    eventSourceRefs.current.forEach((es) => es.close());
    eventSourceRefs.current = [];

    try {
      // Get recent published content (limit 20)
      const feedRes = await api.getFeed({ page: 1, limit: 20 });

      if (!feedRes.success || !feedRes.data) {
        setError('فشل في تحميل المحتوى');
        setLoading(false);
        return;
      }

      const feedItems: ContentItem[] = Array.isArray(feedRes.data)
        ? feedRes.data
        : [];

      if (feedItems.length === 0) {
        setContentWithComments([]);
        setLoading(false);
        return;
      }

      // For each content item, fetch comments
      if (useSSE) {
        // Use SSE streams for comments
        const results: ContentWithComments[] = [];
        const token = localStorage.getItem('investor_radar_auth_token');

        await Promise.all(
          feedItems.map(
            (item) =>
              new Promise<void>((resolve) => {
                const allComments: Comment[] = [];
                const url = `${API_BASE_URL}/content/${item.id}/comments/stream`;

                const eventSource = new EventSource(url);
                eventSourceRefs.current.push(eventSource);

                eventSource.addEventListener('comment', (event) => {
                  try {
                    const comment = JSON.parse(event.data) as Comment;
                    allComments.push(comment);
                  } catch {}
                });

                eventSource.addEventListener('complete', () => {
                  if (allComments.length > 0) {
                    results.push({
                      content: item,
                      comments: allComments,
                      totalComments: flattenComments(allComments).length,
                    });
                  }
                  eventSource.close();
                  resolve();
                });

                eventSource.addEventListener('error', () => {
                  // Fallback - still resolve even on error
                  if (allComments.length > 0) {
                    results.push({
                      content: item,
                      comments: allComments,
                      totalComments: flattenComments(allComments).length,
                    });
                  }
                  eventSource.close();
                  resolve();
                });

                // Timeout after 10s
                setTimeout(() => {
                  eventSource.close();
                  if (allComments.length > 0) {
                    results.push({
                      content: item,
                      comments: allComments,
                      totalComments: flattenComments(allComments).length,
                    });
                  }
                  resolve();
                }, 10000);
              })
          )
        );

        // Sort by most comments
        results.sort((a, b) => b.totalComments - a.totalComments);
        setContentWithComments(results);
        computeStats(results);
      } else {
        // Use REST API for comments
        const results: ContentWithComments[] = [];

        await Promise.all(
          feedItems.map(async (item) => {
            try {
              const commentsRes = await api.getComments(item.id, { page: 1, limit: 50 });
              if (commentsRes.success && commentsRes.data) {
                const comments = Array.isArray(commentsRes.data) ? commentsRes.data : [];
                if (comments.length > 0) {
                  results.push({
                    content: item,
                    comments,
                    totalComments: flattenComments(comments).length,
                  });
                }
              }
            } catch {}
          })
        );

        results.sort((a, b) => b.totalComments - a.totalComments);
        setContentWithComments(results);
        computeStats(results);
      }
    } catch (err) {
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [useSSE]);

  const computeStats = (data: ContentWithComments[]) => {
    let today = 0;
    let week = 0;
    let total = 0;

    for (const item of data) {
      const flat = flattenComments(item.comments);
      total += flat.length;
      for (const c of flat) {
        if (isToday(c.createdAt)) today++;
        if (isWithinDays(c.createdAt, 7)) week++;
      }
    }

    setStatsToday(today);
    setStatsWeek(week);
    setTotalComments(total);
  };

  useEffect(() => {
    fetchData();

    return () => {
      eventSourceRefs.current.forEach((es) => es.close());
    };
  }, [fetchData]);

  // -----------------------------------------------------------------------
  // Delete comment handler
  // -----------------------------------------------------------------------

  const handleDeleteComment = async (contentId: string, commentId: string) => {
    setDeletingId(commentId);
    try {
      const res = await api.deleteComment(contentId, commentId);
      if (res.success) {
        // Remove from local state
        setContentWithComments((prev) =>
          prev
            .map((item) => {
              if (item.content.id !== contentId) return item;

              const removeComment = (comments: Comment[]): Comment[] =>
                comments
                  .filter((c) => c.id !== commentId)
                  .map((c) => ({
                    ...c,
                    replies: c.replies ? removeComment(c.replies) : [],
                  }));

              const updatedComments = removeComment(item.comments);
              return {
                ...item,
                comments: updatedComments,
                totalComments: flattenComments(updatedComments).length,
              };
            })
            .filter((item) => item.comments.length > 0)
        );

        // Recompute stats
        setContentWithComments((prev) => {
          computeStats(prev);
          return prev;
        });
      }
    } catch {
      // Silently handle
    } finally {
      setDeletingId(null);
      setDeleteConfirm(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // -----------------------------------------------------------------------
  // Filter & search
  // -----------------------------------------------------------------------

  const getFilteredData = (): ContentWithComments[] => {
    return contentWithComments
      .map((item) => {
        let filteredComments = flattenComments(item.comments);

        // Filter by time
        if (filterMode === 'recent') {
          filteredComments = filteredComments.filter((c) => isWithinDays(c.createdAt, 7));
        }

        // Search by text
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          filteredComments = filteredComments.filter(
            (c) =>
              c.body.toLowerCase().includes(q) ||
              (c.bodyAr && c.bodyAr.toLowerCase().includes(q)) ||
              c.user.name.toLowerCase().includes(q) ||
              (c.user.nameAr && c.user.nameAr.toLowerCase().includes(q))
          );
        }

        if (filteredComments.length === 0) return null;

        return {
          ...item,
          comments: filteredComments.map((c) => ({ ...c, replies: [] })),
          totalComments: filteredComments.length,
        };
      })
      .filter(Boolean) as ContentWithComments[];
  };

  const filteredData = getFilteredData();

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-900 text-white" dir="rtl">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <MessageCircle size={22} className="text-white" />
              </div>
              <span className="bg-gradient-to-l from-white to-slate-300 bg-clip-text text-transparent">
                إشراف التعليقات
              </span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm lg:text-base">
              إدارة ومراجعة تعليقات المستخدمين
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            تحديث
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <MessageSquare size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{totalComments}</p>
              <p className="text-xs text-slate-400 font-medium">إجمالي التعليقات</p>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Calendar size={24} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{statsToday}</p>
              <p className="text-xs text-slate-400 font-medium">تعليقات اليوم</p>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <BarChart3 size={24} className="text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{statsWeek}</p>
              <p className="text-xs text-slate-400 font-medium">تعليقات هذا الأسبوع</p>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          {/* Filter buttons */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400 shrink-0" />
            {([
              { key: 'all', label: 'جميع التعليقات' },
              { key: 'recent', label: 'آخر 7 أيام' },
            ] as { key: FilterMode; label: string }[]).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterMode(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  filterMode === f.key
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في التعليقات بالنص أو اسم المؤلف..."
              className="w-full bg-slate-700 border border-slate-600 rounded-lg pr-10 pl-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* SSE toggle */}
          <button
            onClick={() => setUseSSE(!useSSE)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
              useSSE
                ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-700 border-slate-600 text-slate-400'
            }`}
            title={useSSE ? 'وضع البث (SSE) مفعل' : 'وضع REST'}
          >
            <div className={`w-2 h-2 rounded-full ${useSSE ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            {useSSE ? 'بث مباشر' : 'REST'}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
            <p className="text-slate-400 text-sm">جاري تحميل التعليقات...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <AlertTriangle size={40} className="text-red-400 mx-auto mb-3" />
            <p className="text-red-300 font-medium">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-all"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredData.length === 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
            <MessageCircle size={48} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-300 mb-2">
              {searchQuery || filterMode !== 'all' ? 'لا توجد نتائج' : 'لا توجد تعليقات'}
            </h3>
            <p className="text-slate-500 text-sm">
              {searchQuery || filterMode !== 'all'
                ? 'حاول تغيير معايير البحث أو الفلتر'
                : 'لم يتم العثور على تعليقات في المحتوى الأخير'}
            </p>
          </div>
        )}

        {/* Content with Comments */}
        {!loading && !error && filteredData.length > 0 && (
          <div className="space-y-6">
            {filteredData.map((item) => (
              <div
                key={item.content.id}
                className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden"
              >
                {/* Content Header */}
                <div className="p-4 lg:p-5 border-b border-slate-700 bg-slate-800/80">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base lg:text-lg font-bold text-white truncate">
                        {item.content.titleAr || item.content.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        {item.content.author && (
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {item.content.author.nameAr || item.content.author.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(item.content.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={12} />
                          {item.totalComments} تعليق
                        </span>
                        {item.content.type && (
                          <span className="bg-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-slate-300">
                            {item.content.type}
                          </span>
                        )}
                      </div>
                    </div>
                    <a
                      href={`#/content/${item.content.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-600 hover:text-white transition-all shrink-0"
                    >
                      <Eye size={14} />
                      عرض المحتوى
                    </a>
                  </div>
                </div>

                {/* Comments List */}
                <div className="divide-y divide-slate-700/60">
                  {item.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-4 lg:px-5 hover:bg-slate-750 transition-colors ${
                        comment.parentId ? 'pr-8 lg:pr-12 bg-slate-800/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg">
                          {comment.user.avatar ? (
                            <img
                              src={comment.user.avatar}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            (comment.user.nameAr || comment.user.name || 'U').charAt(0)
                          )}
                        </div>

                        {/* Comment content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-sm text-white">
                              {comment.user.nameAr || comment.user.name}
                            </span>
                            {/* Role badge */}
                            {(() => {
                              const badge = ROLE_BADGES[comment.user.role] || ROLE_BADGES.STANDARD;
                              return (
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badge.bg} ${badge.text}`}
                                >
                                  {badge.label}
                                </span>
                              );
                            })()}
                            {comment.isEdited && (
                              <span className="text-[10px] text-slate-500">(معدّل)</span>
                            )}
                            {comment.parentId && (
                              <span className="text-[10px] text-blue-400 flex items-center gap-0.5">
                                <ExternalLink size={10} />
                                رد
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-slate-300 leading-relaxed mb-2 break-words">
                            {comment.bodyAr || comment.body}
                          </p>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Clock size={11} />
                              {formatDate(comment.createdAt)}
                            </span>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2">
                              <a
                                href={`#/content/${comment.contentId}`}
                                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                              >
                                <Eye size={12} />
                                عرض المحتوى
                              </a>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    commentId: comment.id,
                                    contentId: comment.contentId,
                                  })
                                }
                                disabled={deletingId === comment.id}
                                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                              >
                                {deletingId === comment.id ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Trash2 size={12} />
                                )}
                                حذف
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={22} className="text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white">تأكيد الحذف</h3>
              </div>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                هل أنت متأكد من حذف هذا التعليق؟ سيتم حذف جميع الردود المرتبطة به أيضاً. لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-600 transition-all"
                >
                  إلغاء
                </button>
                <button
                  onClick={() =>
                    handleDeleteComment(deleteConfirm.contentId, deleteConfirm.commentId)
                  }
                  disabled={deletingId === deleteConfirm.commentId}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {deletingId === deleteConfirm.commentId ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  حذف التعليق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentModerationPage;
