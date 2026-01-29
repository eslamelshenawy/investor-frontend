
import React, { useState } from 'react';
import { Star, ThumbsUp, ChevronDown } from 'lucide-react';

interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
}

const ReviewsSection = () => {
  const [reviews] = useState<Review[]>([
    {
      id: 'r1',
      userName: 'م. فهد السبيعي',
      rating: 5,
      date: '2025-05-12',
      comment: 'بيانات دقيقة جداً ومحدثة بشكل مستمر. ساعدتني كثيراً في دراسة الجدوى لمشروعي الجديد.',
      helpful: 12
    },
    {
      id: 'r2',
      userName: 'ليلى الأحمد',
      rating: 4,
      date: '2025-05-10',
      comment: 'واجهة العرض ممتازة، ولكن أتمنى إضافة المزيد من التفاصيل حول قطاع التجزئة.',
      helpful: 5
    }
  ]);

  const averageRating = 4.8;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">مراجعات المستخدمين</h3>
          <p className="text-sm text-gray-500">ماذا يقول الخبراء والمستثمرون عن هذه البيانات</p>
        </div>
        <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
          <div className="text-center border-l border-gray-200 pl-4">
            <p className="text-2xl font-black text-blue-600 leading-none">{averageRating}</p>
            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">متوسط التقييم</p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} strokeWidth={2} />
              ))}
            </div>
            <p className="text-[10px] text-gray-500 font-medium">بناءً على {reviews.length} مراجعة</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                  {review.userName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{review.userName}</h4>
                  <div className="flex text-amber-400 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">{review.date}</span>
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              {review.comment}
            </p>

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 px-2 py-1 rounded-md">
                <ThumbsUp size={12} />
                مفيد ({review.helpful})
              </button>
              <button className="text-[10px] font-bold text-gray-400 hover:text-gray-900 transition-colors">إبلاغ</button>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-3 border border-dashed border-gray-300 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
        عرض المزيد من المراجعات
        <ChevronDown size={16} />
      </button>
    </div>
  );
};

export default ReviewsSection;
