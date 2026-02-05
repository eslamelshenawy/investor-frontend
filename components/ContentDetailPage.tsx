import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Heart, Bookmark, Share2, MessageCircle, Eye, Clock, Tag, User as UserIcon } from 'lucide-react';
import { api } from '../src/services/api';
import { useAuth } from '../contexts/AuthContext';
import CommentsSection from './CommentsSection';

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

  useEffect(() => {
    if (!id) return;
    loadContent();
    loadEngagement();
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
          <button onClick={handleSave} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${saved ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`}>
            <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
            <span>{engagement.saveCount}</span>
          </button>
          <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 text-gray-500 transition-all">
            <Share2 size={18} />
            <span>{engagement.shareCount}</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${showComments ? 'bg-gray-200 text-gray-900' : 'hover:bg-gray-100 text-gray-500'}`}>
            <MessageCircle size={18} />
            <span>{engagement.commentCount}</span>
          </button>
          <div className="mr-auto flex items-center gap-1.5 text-gray-400 text-xs">
            <Eye size={14} />
            <span>{engagement.viewCount}</span>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 shadow-sm">
        {content.excerptAr && (
          <p className="text-gray-600 text-lg leading-relaxed mb-6 pb-6 border-b border-gray-200 italic">
            {content.excerptAr}
          </p>
        )}
        <div className="prose prose-gray max-w-none">
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base">
            {content.bodyAr || content.body}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && id && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <CommentsSection contentId={id} isOpen={showComments} />
        </div>
      )}
    </div>
  );
};

export default ContentDetailPage;
