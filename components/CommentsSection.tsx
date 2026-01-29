
import React, { useState } from 'react';
import { User, MessageSquare, Send, Reply } from 'lucide-react';

interface Comment {
  id: string;
  userName: string;
  userRole: string;
  avatar: string;
  text: string;
  timestamp: string;
  replies?: Comment[];
}

const CommentsSection = () => {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      userName: 'د. خالد العمري',
      userRole: 'محلل مالي',
      avatar: 'https://i.pravatar.cc/150?u=khalid',
      text: 'هذه البيانات توضح نمو القوة الشرائية في قطاع غزة والمنطقة الوسطى بشكل ملحوظ.',
      timestamp: 'منذ ساعتين',
      replies: [
        {
          id: '1-1',
          userName: 'سارة محمد',
          userRole: 'مستثمر',
          avatar: 'https://i.pravatar.cc/150?u=sara',
          text: 'شكراً دكتور، هل تتوقع استمرار هذا النمو في الربع القادم؟',
          timestamp: 'منذ ساعة',
        }
      ]
    }
  ]);

  const [newComment, setNewComment] = useState('');

  const handlePostComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      userName: 'أحمد محمد', // Current User
      userRole: 'Admin',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
      text: newComment,
      timestamp: 'الآن'
    };
    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="text-blue-600" size={24} />
        <h3 className="text-lg font-bold text-gray-900">التعليقات والمناقشات</h3>
        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full font-medium">
          {comments.length} تعليق
        </span>
      </div>

      {/* Input Area */}
      <div className="flex gap-4 mb-8">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
          <User className="text-blue-600" size={20} />
        </div>
        <div className="flex-1 relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none min-h-[50px]"
            placeholder="أضف تعليقاً أو استفساراً..."
          />
          <button 
            onClick={handlePostComment}
            className="absolute left-2 bottom-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="group">
            <div className="flex gap-4">
              <img src={comment.avatar} alt={comment.userName} className="w-10 h-10 rounded-full border border-gray-100" />
              <div className="flex-1">
                <div className="bg-gray-50/50 p-4 rounded-2xl group-hover:bg-gray-50 transition-colors border border-transparent group-hover:border-gray-100">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{comment.userName}</span>
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase">{comment.userRole}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{comment.text}</p>
                </div>
                
                <div className="flex items-center gap-4 mt-2 mr-2">
                  <button className="text-[10px] font-bold text-gray-500 hover:text-blue-600 flex items-center gap-1">
                    <Reply size={12} /> رد
                  </button>
                  <button className="text-[10px] font-bold text-gray-500 hover:text-red-500">إعجاب</button>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 space-y-4 border-r-2 border-gray-100 pr-4 mr-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <img src={reply.avatar} alt={reply.userName} className="w-8 h-8 rounded-full" />
                        <div className="flex-1 bg-blue-50/30 p-3 rounded-xl">
                          <div className="flex justify-between mb-1">
                            <span className="font-bold text-gray-900 text-xs">{reply.userName}</span>
                            <span className="text-[10px] text-gray-400">{reply.timestamp}</span>
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed">{reply.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentsSection;
