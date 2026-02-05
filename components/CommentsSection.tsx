import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MessageCircle, Send, Edit3, Trash2, CornerDownRight, User as UserIcon, Loader2, Wifi } from 'lucide-react';
import { api } from '../src/services/api';
import { useAuth } from '../contexts/AuthContext';
import type { CommentItem } from '../src/services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ─── Props ───────────────────────────────────────────────────────────────────

interface CommentsSectionProps {
  contentId: string;
  isOpen?: boolean;
}

// ─── Relative-time helper (Arabic) ──────────────────────────────────────────

function relativeTimeAr(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 0) return 'الآن';
  if (diffSec < 60) return 'الآن';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 2) return 'منذ دقيقة';
  if (diffMin < 11) return `منذ ${diffMin} دقائق`;
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 2) return 'منذ ساعة';
  if (diffHour < 11) return `منذ ${diffHour} ساعات`;
  if (diffHour < 24) return `منذ ${diffHour} ساعة`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 2) return 'منذ يوم';
  if (diffDay < 11) return `منذ ${diffDay} أيام`;
  if (diffDay < 30) return `منذ ${diffDay} يوماً`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 2) return 'منذ شهر';
  if (diffMonth < 11) return `منذ ${diffMonth} أشهر`;
  if (diffMonth < 12) return `منذ ${diffMonth} شهراً`;
  const diffYear = Math.floor(diffMonth / 12);
  if (diffYear < 2) return 'منذ سنة';
  if (diffYear < 11) return `منذ ${diffYear} سنوات`;
  return `منذ ${diffYear} سنة`;
}

// ─── Role badge label mapping ───────────────────────────────────────────────

function roleBadge(role: string): { label: string; bg: string; text: string } {
  switch (role) {
    case 'admin':
      return { label: 'مدير', bg: 'bg-red-50', text: 'text-red-700' };
    case 'editor':
      return { label: 'محرر', bg: 'bg-amber-50', text: 'text-amber-700' };
    case 'analyst':
      return { label: 'محلل', bg: 'bg-emerald-50', text: 'text-emerald-700' };
    case 'expert':
      return { label: 'خبير', bg: 'bg-purple-50', text: 'text-purple-700' };
    default:
      return { label: 'مستثمر', bg: 'bg-blue-50', text: 'text-blue-700' };
  }
}

// ─── Flatten total count (comments + replies) ───────────────────────────────

function totalCommentCount(comments: CommentItem[]): number {
  return comments.reduce((sum, c) => sum + 1 + (c.replies?.length ?? 0), 0);
}

// ─── Avatar component ───────────────────────────────────────────────────────

const Avatar: React.FC<{ user: CommentItem['user']; size?: 'sm' | 'md' }> = ({ user, size = 'md' }) => {
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 14 : 18;

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.nameAr || user.name}
        className={`${dim} rounded-full object-cover border-2 border-gray-200 flex-shrink-0`}
      />
    );
  }

  return (
    <div className={`${dim} rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 border-2 border-gray-300`}>
      <UserIcon size={iconSize} className="text-gray-500" />
    </div>
  );
};

// ─── Single Comment component ───────────────────────────────────────────────

interface SingleCommentProps {
  comment: CommentItem;
  contentId: string;
  currentUserId: string | undefined;
  isReply?: boolean;
  onReplyCreated: () => void;
  onCommentUpdated: () => void;
  onCommentDeleted: () => void;
}

const SingleComment: React.FC<SingleCommentProps> = ({
  comment,
  contentId,
  currentUserId,
  isReply = false,
  onReplyCreated,
  onCommentUpdated,
  onCommentDeleted,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [isReplying, setIsReplying] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const editRef = useRef<HTMLTextAreaElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const isOwner = currentUserId === comment.userId;
  const badge = roleBadge(comment.user.role);
  const displayName = comment.user.nameAr || comment.user.name;

  // Focus textarea when toggling
  useEffect(() => {
    if (isEditing && editRef.current) editRef.current.focus();
  }, [isEditing]);
  useEffect(() => {
    if (isReplying && replyRef.current) replyRef.current.focus();
  }, [isReplying]);

  // ── Edit handlers ─────────────────────────────────────────────────────────

  const handleSaveEdit = async () => {
    const trimmed = editBody.trim();
    if (!trimmed || trimmed === comment.body) {
      setIsEditing(false);
      setEditBody(comment.body);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.updateComment(contentId, comment.id, trimmed);
      if (res.success) {
        onCommentUpdated();
      }
    } catch {
      // silent
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditBody(comment.body);
    setIsEditing(false);
  };

  // ── Delete handler ────────────────────────────────────────────────────────

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.deleteComment(contentId, comment.id);
      if (res.success) {
        onCommentDeleted();
      }
    } catch {
      // silent
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  // ── Reply handler ─────────────────────────────────────────────────────────

  const handleSubmitReply = async () => {
    const trimmed = replyBody.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    try {
      const res = await api.createComment(contentId, trimmed, comment.id);
      if (res.success) {
        setReplyBody('');
        setIsReplying(false);
        onReplyCreated();
      }
    } catch {
      // silent
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Keyboard shortcut for textarea submit ─────────────────────────────────

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    action: () => void
  ) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      action();
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="group">
      <div className="flex gap-3">
        <Avatar user={comment.user} size={isReply ? 'sm' : 'md'} />

        <div className="flex-1 min-w-0">
          {/* Comment bubble */}
          <div
            className={`rounded-2xl p-4 transition-colors ${
              isReply
                ? 'bg-gray-50 group-hover:bg-gray-100'
                : 'bg-gray-50 group-hover:bg-gray-100'
            }`}
          >
            {/* Header: name, role badge, time, edited */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-gray-900 text-sm leading-none">
                  {displayName}
                </span>
                <span
                  className={`text-[10px] ${badge.bg} ${badge.text} px-1.5 py-0.5 rounded font-bold leading-none`}
                >
                  {badge.label}
                </span>
                {comment.isEdited && (
                  <span className="text-[10px] text-gray-400 italic leading-none">
                    (تم التعديل)
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap flex-shrink-0">
                {relativeTimeAr(comment.createdAt)}
              </span>
            </div>

            {/* Body or edit field */}
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  ref={editRef}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleSaveEdit)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all resize-none min-h-[60px]"
                  disabled={isSubmitting}
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSubmitting}
                    className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSubmitting || !editBody.trim()}
                    className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-400 text-white px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                    حفظ
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                {comment.body}
              </p>
            )}
          </div>

          {/* Action buttons */}
          {!isEditing && (
            <div className="flex items-center gap-1 mt-1.5 mr-1">
              {/* Reply button (only on top-level comments) */}
              {!isReply && (
                <button
                  onClick={() => {
                    setIsReplying(!isReplying);
                    setShowDeleteConfirm(false);
                  }}
                  className="text-[11px] font-semibold text-gray-500 hover:text-blue-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <CornerDownRight size={12} />
                  رد
                </button>
              )}

              {/* Edit button (own comments) */}
              {isOwner && (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditBody(comment.body);
                    setShowDeleteConfirm(false);
                    setIsReplying(false);
                  }}
                  className="text-[11px] font-semibold text-gray-500 hover:text-amber-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Edit3 size={12} />
                  تعديل
                </button>
              )}

              {/* Delete button (own comments) */}
              {isOwner && !showDeleteConfirm && (
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setIsReplying(false);
                  }}
                  className="text-[11px] font-semibold text-gray-500 hover:text-red-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Trash2 size={12} />
                  حذف
                </button>
              )}

              {/* Delete confirmation */}
              {isOwner && showDeleteConfirm && (
                <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                  <span className="text-[11px] text-red-600 font-semibold ml-1">
                    هل أنت متأكد؟
                  </span>
                  <button
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-100 hover:bg-red-200 px-2 py-0.5 rounded transition-colors flex items-center gap-1"
                  >
                    {isSubmitting && <Loader2 size={10} className="animate-spin" />}
                    نعم، احذف
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-[11px] font-semibold text-gray-500 hover:text-gray-700 px-2 py-0.5 rounded transition-colors"
                  >
                    لا
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Reply input */}
          {isReplying && (
            <div className="mt-3 flex gap-2 items-start">
              <CornerDownRight size={16} className="text-gray-400 mt-2.5 flex-shrink-0" />
              <div className="flex-1 relative">
                <textarea
                  ref={replyRef}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleSubmitReply)}
                  placeholder="اكتب رداً..."
                  className="w-full bg-white border border-gray-300 rounded-xl p-3 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all resize-none min-h-[48px]"
                  disabled={isSubmitting}
                />
                <button
                  onClick={handleSubmitReply}
                  disabled={isSubmitting || !replyBody.trim()}
                  className="absolute left-2 bottom-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-1.5 rounded-lg transition-colors"
                >
                  {isSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Nested replies (1 level only) */}
          {!isReply && comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-3 border-r-2 border-gray-200 pr-4 mr-2">
              {comment.replies.map((reply) => (
                <SingleComment
                  key={reply.id}
                  comment={reply}
                  contentId={contentId}
                  currentUserId={currentUserId}
                  isReply
                  onReplyCreated={onReplyCreated}
                  onCommentUpdated={onCommentUpdated}
                  onCommentDeleted={onCommentDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main CommentsSection component ─────────────────────────────────────────

const CommentsSection: React.FC<CommentsSectionProps> = ({ contentId, isOpen = true }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const [streaming, setStreaming] = useState(false);

  // ── SSE Stream comments (WebFlux) ─────────────────────────────────────

  const streamComments = useCallback(() => {
    if (!contentId) return;
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setIsLoading(true);
    setStreaming(true);
    setError(null);
    setComments([]);

    const url = `${API_BASE_URL}/content/${contentId}/comments/stream`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('comment', (e) => {
      try {
        const comment = JSON.parse(e.data);
        setComments(prev => {
          if (prev.some(c => c.id === comment.id)) return prev;
          return [...prev, comment];
        });
      } catch {}
      setIsLoading(false);
    });

    eventSource.addEventListener('complete', () => {
      setStreaming(false);
      setIsLoading(false);
      eventSource.close();
    });

    eventSource.addEventListener('start', () => {
      setIsLoading(false);
    });

    eventSource.onerror = () => {
      eventSource.close();
      setStreaming(false);
      fetchCommentsRest();
    };
  }, [contentId]);

  // REST fallback
  const fetchCommentsRest = useCallback(async () => {
    if (!contentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getComments(contentId, { page: 1, limit: 50 });
      if (res.success && res.data) {
        setComments(res.data);
      } else {
        setError(res.errorAr || res.error || 'حدث خطأ في تحميل التعليقات');
      }
    } catch {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  }, [contentId]);

  const fetchComments = fetchCommentsRest;

  useEffect(() => {
    if (isOpen) {
      streamComments();
    }
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [isOpen, streamComments]);

  // ── Create new comment ────────────────────────────────────────────────────

  const handlePostComment = async () => {
    const trimmed = newComment.trim();
    if (!trimmed || !isAuthenticated) return;

    setIsPosting(true);
    try {
      const res = await api.createComment(contentId, trimmed);
      if (res.success) {
        setNewComment('');
        // Refetch all comments to keep state in sync
        await fetchComments();
      }
    } catch {
      // silent
    } finally {
      setIsPosting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handlePostComment();
    }
  };

  // ── Guard: not open ───────────────────────────────────────────────────────

  if (!isOpen) return null;

  // ── Render ────────────────────────────────────────────────────────────────

  const count = totalCommentCount(comments);

  return (
    <div dir="rtl" className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-sm mt-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="bg-blue-50 p-2 rounded-xl">
          <MessageCircle size={20} className="text-blue-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900">التعليقات والمناقشات</h3>
        <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full font-semibold">
          {isLoading ? '...' : `${count} تعليق`}
        </span>
      </div>

      {/* ── New comment input (only for authenticated users) ─────────────── */}
      {isAuthenticated ? (
        <div className="flex gap-3 mb-6">
          <div className="flex-shrink-0 mt-1">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.nameAr || user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-gray-200 flex items-center justify-center">
                <UserIcon size={18} className="text-blue-600" />
              </div>
            )}
          </div>
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="أضف تعليقاً أو استفساراً..."
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all resize-none min-h-[56px]"
              disabled={isPosting}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-gray-400 font-medium">
                Ctrl+Enter للإرسال
              </span>
              <button
                onClick={handlePostComment}
                disabled={isPosting || !newComment.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
              >
                {isPosting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                إرسال
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-gray-500">
            قم بتسجيل الدخول لإضافة تعليق
          </p>
        </div>
      )}

      {/* ── Divider ──────────────────────────────────────────────────────── */}
      <div className="border-t border-gray-200 mb-6" />

      {/* ── Loading state ────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 size={28} className="animate-spin text-blue-500" />
          <p className="text-sm text-gray-500 font-medium">جاري تحميل التعليقات...</p>
        </div>
      )}

      {/* ── Error state ──────────────────────────────────────────────────── */}
      {!isLoading && error && (
        <div className="text-center py-8">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button
            onClick={fetchComments}
            className="text-sm text-blue-600 hover:text-blue-700 underline transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {!isLoading && !error && comments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="bg-gray-100 p-4 rounded-full">
            <MessageCircle size={28} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 font-medium">لا توجد تعليقات بعد</p>
          <p className="text-xs text-gray-400">كن أول من يعلق على هذا المحتوى</p>
        </div>
      )}

      {/* ── Comments list ────────────────────────────────────────────────── */}
      {!isLoading && !error && comments.length > 0 && (
        <div className="space-y-5">
          {comments.map((comment) => (
            <SingleComment
              key={comment.id}
              comment={comment}
              contentId={contentId}
              currentUserId={user?.id}
              onReplyCreated={fetchComments}
              onCommentUpdated={fetchComments}
              onCommentDeleted={fetchComments}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
