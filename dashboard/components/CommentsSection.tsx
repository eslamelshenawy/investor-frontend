import React, { useState } from 'react';
import { MessageSquare, Send, User, MoreHorizontal, Reply } from 'lucide-react';

interface Comment {
  id: number;
  user: string;
  role?: string; // e.g., 'مستخدم', 'مدير النظام'
  date: string;
  content: string;
  replies?: number;
}

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 1,
    user: "عبدالله العتيبي",
    role: "باحث بيانات",
    date: "منذ ساعتين",
    content: "هل هذه البيانات تشمل العمليات التجارية للمناطق الحرة؟ أبحث عن تفاصيل التصدير وإعادة التصدير تحديداً.",
    replies: 1
  },
  {
    id: 2,
    user: "سارة محمد",
    date: "منذ يوم واحد",
    content: "شكراً على توفير البيانات. نلاحظ تحسناً كبيراً في جودة البيانات الوصفية مقارنة بالشهر الماضي.",
    replies: 0
  },
  {
    id: 3,
    user: "فريق البيانات المفتوحة",
    role: "مسؤول",
    date: "منذ يومين",
    content: "مرحباً بالجميع، تم تحديث ملف البيانات ليشمل الأعمدة الناقصة التي تم الإبلاغ عنها سابقاً.",
    replies: 5
  }
];

const CommentsSection: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now(),
      user: "مستخدم جديد", // Placeholder for authenticated user
      date: "الآن",
      content: newComment,
      replies: 0
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="text-gov-blue" size={24} />
          التعليقات والمناقشات
          <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{comments.length}</span>
        </h3>
      </div>

      {/* Comment Form */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
             <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">إضافة تعليق جديد</label>
             <textarea
                id="comment"
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue outline-none resize-none text-sm"
                placeholder="شاركنا رأيك أو استفسارك حول هذه البيانات..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
             />
          </div>
          <div className="flex justify-end">
            <button 
                type="submit" 
                disabled={!newComment.trim()}
                className="bg-gov-blue text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                <Send size={16} />
                نشر التعليق
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
            <div key={comment.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                    {/* Avatar Placeholder */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${comment.role === 'مسؤول' ? 'bg-gov-blue' : 'bg-gray-300'}`}>
                        {comment.role === 'مسؤول' ? <User size={18} /> : comment.user.charAt(0)}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-800">{comment.user}</span>
                                {comment.role && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${comment.role === 'مسؤول' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {comment.role}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-400">{comment.date}</span>
                        </div>
                        
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">
                            {comment.content}
                        </p>

                        <div className="flex items-center gap-4 border-t border-gray-50 pt-3">
                            <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gov-blue transition-colors">
                                <Reply size={14} />
                                رد
                            </button>
                            {comment.replies ? (
                                <button className="text-xs text-gov-blue font-medium hover:underline">
                                    عرض {comment.replies} ردود
                                </button>
                            ) : null}
                            <button className="mr-auto text-gray-400 hover:text-gray-600">
                                <MoreHorizontal size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

    </div>
  );
};

export default CommentsSection;