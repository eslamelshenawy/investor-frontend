import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Heart, Bookmark, Share2, MessageCircle, Eye, Clock, Tag, User as UserIcon, Database, Sparkles, LogIn, UserPlus, Lock, ExternalLink, FileText } from 'lucide-react';
import { api } from '../src/services/api';
import { useAuth } from '../contexts/AuthContext';
import CommentsSection from './CommentsSection';

// Roles that can access comments (higher than STANDARD)
const COMMENT_ALLOWED_ROLES = ['ANALYST', 'EXPERT', 'WRITER', 'DESIGNER', 'CONTENT_MANAGER', 'EDITOR', 'ADMIN', 'SUPER_ADMIN', 'CURBTRON'];

const ContentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [engagement, setEngagement] = useState({ likeCount: 0, saveCount: 0, commentCount: 0, shareCount: 0, viewCount: 0 });
  const [showComments, setShowComments] = useState(true);
  const [relatedContent, setRelatedContent] = useState<any[]>([]);

  const canComment = isAuthenticated && COMMENT_ALLOWED_ROLES.includes(user?.role?.toUpperCase() || '');

  useEffect(() => {
    if (!id) return;
    loadContent();
    loadEngagement();
    loadRelatedContent();
  }, [id]);

  const loadContent = async () => {
    setLoading(true);
    const res = await api.getContent(id!);
    if (res.success && res.data) {
      setContent(res.data);
    }
    setLoading(false);
  };

  const loadEngagement = async () => {
    const res = await api.getEngagement(id!);
    if (res.success && res.data) {
      setEngagement(res.data);
      setLiked(res.data.hasLiked);
      setSaved(res.data.hasSaved);
    }
  };

  const loadRelatedContent = async () => {
    try {
      const res = await api.getFeed({ limit: 20 });
      if (res.success && res.data) {
        const items = res.data as any[];
        const currentTags = (() => {
          try {
            return typeof content?.tags === 'string' ? JSON.parse(content.tags) : (content?.tags || []);
          } catch {
            return [];
          }
        })();
        const filtered = items
          .filter((item: any) => item?.id !== id)
          .filter((item: any) => {
            const itemTags = (() => {
              try {
                return typeof item?.tags === 'string' ? JSON.parse(item.tags) : (item?.tags || []);
              } catch {
                return [];
              }
            })();
            return currentTags.some((t: string) => itemTags.includes(t));
          })
          .slice(0, 4);
        setRelatedContent(filtered);
      }
    } catch {
      // silently fail
    }
  };

  const handleLike = async () => {
    const res = await api.likeContent(id!);
    if (res.success && res.data) {
      setLiked(res.data.liked);
      setEngagement(prev => ({ ...prev, likeCount: res.data!.likeCount }));
    }
  };

  const handleSave = async () => {
    const res = await api.saveContent(id!);
    if (res.success && res.data) {
      setSaved(res.data.saved);
      setEngagement(prev => ({ ...prev, saveCount: res.data!.saveCount }));
    }
  };

  const handleShare = async () => {
    await api.shareContent(id!);
    setEngagement(prev => ({ ...prev, shareCount: prev.shareCount + 1 }));
    if (navigator.share) {
      navigator.share({ title: content?.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">المحتوى غير موجود</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-500 hover:underline">العودة</button>
      </div>
    );
  }

  const tags = (() => {
    try { return typeof content.tags === 'string' ? JSON.parse(content.tags) : content.tags; } catch { return []; }
  })();

  return (
    <div dir="rtl" className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm">
        <ArrowRight size={16} />
        <span>العودة</span>
      </button>

      {/* Content Header */}
      <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">{content.type}</span>
          {content.publishedAt && (
            <span className="flex items-center gap-1 text-gray-500 text-xs">
              <Clock size={12} />
              {formatDate(content.publishedAt)}
            </span>
          )}
        </div>

        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{content.titleAr || content.title}</h1>
        {content.titleAr && content.title && (
          <h2 className="text-lg text-gray-500 mb-4">{content.title}</h2>
        )}

        {content.author && (
          <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {content.author.avatar ? (
                <img src={content.author.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <UserIcon size={20} className="text-white" />
              )}
            </div>
            <div>
              <p className="text-gray-900 font-medium text-sm">{content.author.nameAr || content.author.name}</p>
              <p className="text-gray-500 text-xs">{content.author.role}</p>
            </div>
          </div>
        )}

        {/* Data Sources */}
        {content?.metadata && (content.metadata?.sources || content.metadata?.dataSources) && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Database size={16} className="text-emerald-600" />
              <h3 className="text-sm font-bold text-emerald-800">مصادر البيانات</h3>
            </div>
            <ul className="space-y-2">
              {(content.metadata?.sources || content.metadata?.dataSources || []).map((source: any, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
                  <FileText size={14} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                  {typeof source === 'string' ? (
                    <span>{source}</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span>{source?.name || source?.title || 'مصدر غير معروف'}</span>
                      {source?.url && (
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-800 transition-colors">
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag: string, i: number) => (
              <span key={i} className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Engagement Bar */}
        <div className="flex items-center gap-1 pt-4 border-t border-gray-200">
          <button onClick={handleLike} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${liked ? 'bg-red-50 text-red-600' : 'hover:bg-gray-100 text-gray-500'}`}>
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            <span>{engagement.likeCount}</span>
          </button>
          {/* Save button - only for authenticated users */}
          {isAuthenticated && (
            <button onClick={handleSave} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${saved ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`}>
              <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
              <span>{engagement.saveCount}</span>
            </button>
          )}
          <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 text-gray-500 transition-all">
            <Share2 size={18} />
            <span>{engagement.shareCount}</span>
          </button>
          {/* Comment toggle - only for users with comment permission */}
          {canComment && (
            <button onClick={() => setShowComments(!showComments)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${showComments ? 'bg-gray-200 text-gray-900' : 'hover:bg-gray-100 text-gray-500'}`}>
              <MessageCircle size={18} />
              <span>{engagement.commentCount}</span>
            </button>
          )}
          <div className="mr-auto flex items-center gap-1.5 text-gray-400 text-xs">
            <Eye size={14} />
            <span>{engagement.viewCount}</span>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 shadow-sm">
        {content?.excerptAr && (
          <p className="text-gray-600 text-lg leading-relaxed mb-6 pb-6 border-b border-gray-200 italic">
            {content.excerptAr}
          </p>
        )}
        <div className="prose prose-gray max-w-none">
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base">
            {content?.bodyAr || content?.body}
          </div>
        </div>
      </div>

      {/* Related Content Section */}
      {relatedContent.length > 0 && (
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles size={18} className="text-amber-500" />
            <h3 className="text-lg font-bold text-gray-900">محتوى ذو صلة</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedContent.map((item: any) => (
              <Link
                key={item?.id}
                to={`/content/${item?.id}`}
                className="group block p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full">
                    {item?.type || item?.contentType || 'محتوى'}
                  </span>
                  {item?.publishedAt && (
                    <span className="text-gray-400 text-[10px]">
                      {formatDate(item.publishedAt)}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors line-clamp-2">
                  {item?.titleAr || item?.title || 'بدون عنوان'}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Comments Section - only for users with comment permission */}
      {canComment && showComments && id && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <CommentsSection contentId={id} isOpen={showComments} />
        </div>
      )}

      {/* CTA Banner for non-authenticated users */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-l from-blue-600 to-purple-700 rounded-2xl p-6 lg:p-8 border border-blue-500 shadow-lg text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Lock size={28} className="text-white" />
            </div>
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">سجل الآن للوصول الكامل</h3>
          <p className="text-blue-100 text-sm mb-6 max-w-md mx-auto">
            احصل على إمكانية حفظ المحتوى والتعليق والوصول إلى التحليلات المتقدمة والمزيد
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/login"
              className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors"
            >
              <LogIn size={16} />
              تسجيل الدخول
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors"
            >
              <UserPlus size={16} />
              إنشاء حساب
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentDetailPage;
