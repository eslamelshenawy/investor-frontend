import React, { useState } from 'react';
import { Star, ThumbsUp, User } from 'lucide-react';

interface Review {
  id: number;
  user: string;
  rating: number;
  date: string;
  content: string;
  helpfulCount: number;
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: 1,
    user: "محمد السالم",
    rating: 5,
    date: "2025-09-15",
    content: "بيانات دقيقة وشاملة للغاية، ساعدتني كثيراً في البحث الاقتصادي.",
    helpfulCount: 12
  },
  {
    id: 2,
    user: "خالد العنزي",
    rating: 4,
    date: "2025-09-10",
    content: "المحتوى ممتاز ولكن التنسيق يحتاج إلى بعض التحسين لتسهيل المعالجة الآلية.",
    helpfulCount: 5
  },
  {
    id: 3,
    user: "User_882",
    rating: 5,
    date: "2025-09-02",
    content: "تحديث سريع وممتاز.",
    helpfulCount: 2
  }
];

const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [newRating, setNewRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [newReviewText, setNewReviewText] = useState('');

  // Calculate Stats
  const totalReviews = reviews.length;
  const averageRating = (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1);
  
  const distribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    const percentage = (count / totalReviews) * 100;
    return { stars, count, percentage };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRating === 0) return;

    const review: Review = {
      id: Date.now(),
      user: "مستخدم",
      rating: newRating,
      date: new Date().toISOString().split('T')[0],
      content: newReviewText,
      helpfulCount: 0
    };

    setReviews([review, ...reviews]);
    setNewRating(0);
    setNewReviewText('');
  };

  return (
    <div className="space-y-8">
      
      {/* Summary Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-8 items-center">
         
         {/* Big Score */}
         <div className="flex flex-col items-center justify-center min-w-[150px]">
             <div className="text-5xl font-bold text-gray-800 mb-2">{averageRating}</div>
             <div className="flex text-yellow-400 mb-2">
                 {[1, 2, 3, 4, 5].map((s) => (
                     <Star key={s} size={20} fill={s <= Math.round(Number(averageRating)) ? "currentColor" : "none"} className={s > Math.round(Number(averageRating)) ? "text-gray-300" : ""} />
                 ))}
             </div>
             <div className="text-sm text-gray-500">{totalReviews} تقييم</div>
         </div>

         {/* Distribution Bars */}
         <div className="flex-1 w-full space-y-2">
             {distribution.map((item) => (
                 <div key={item.stars} className="flex items-center gap-3 text-sm">
                     <div className="flex items-center gap-1 w-12 text-gray-600 font-medium">
                         {item.stars} <Star size={12} className="text-gray-400" />
                     </div>
                     <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                         <div 
                            className="h-full bg-yellow-400 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                         />
                     </div>
                     <div className="w-8 text-left text-gray-400 text-xs">
                         {item.percentage > 0 ? `${Math.round(item.percentage)}%` : '0%'}
                     </div>
                 </div>
             ))}
         </div>
      </div>

      {/* Add Review Form */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
         <h3 className="font-bold text-gray-800 mb-4">أضف تقييمك</h3>
         <form onSubmit={handleSubmit}>
             <div className="flex flex-col gap-4">
                 <div className="flex items-center gap-2">
                     <span className="text-sm text-gray-600 ml-2">التقييم العام:</span>
                     <div className="flex gap-1" onMouseLeave={() => setHoveredRating(0)}>
                         {[1, 2, 3, 4, 5].map((star) => (
                             <button
                                key={star}
                                type="button"
                                onClick={() => setNewRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                className="focus:outline-none transition-colors"
                             >
                                 <Star 
                                    size={28} 
                                    className={(hoveredRating || newRating) >= star ? "text-yellow-400" : "text-gray-300"} 
                                    fill={(hoveredRating || newRating) >= star ? "currentColor" : "none"}
                                 />
                             </button>
                         ))}
                     </div>
                     <span className="text-sm font-medium text-yellow-600 mr-2">
                         {newRating > 0 ? (newRating === 5 ? "ممتاز" : newRating === 4 ? "جيد جداً" : newRating === 3 ? "جيد" : newRating === 2 ? "مقبول" : "ضعيف") : ""}
                     </span>
                 </div>

                 <textarea
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue outline-none resize-none text-sm bg-white"
                    placeholder="اكتب تجربتك مع هذه المجموعة من البيانات..."
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                 />

                 <div className="flex justify-end">
                     <button 
                        type="submit" 
                        disabled={newRating === 0}
                        className="bg-gov-blue text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                         إرسال التقييم
                     </button>
                 </div>
             </div>
         </form>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
          <h3 className="font-bold text-gray-800 text-lg border-b border-gray-100 pb-2">جميع المراجعات ({totalReviews})</h3>
          
          {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                              <User size={16} />
                          </div>
                          <div>
                              <div className="font-bold text-gray-800 text-sm">{review.user}</div>
                              <div className="flex text-yellow-400 text-xs mt-0.5">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                      <Star key={s} size={12} fill={s <= review.rating ? "currentColor" : "none"} className={s > review.rating ? "text-gray-300" : ""} />
                                  ))}
                              </div>
                          </div>
                      </div>
                      <span className="text-xs text-gray-400">{review.date}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mt-3 mb-4 leading-relaxed">
                      {review.content || <span className="text-gray-400 italic">بدون تعليق نصي</span>}
                  </p>
                  
                  <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gov-blue transition-colors group">
                          <ThumbsUp size={14} className="group-hover:scale-110 transition-transform" />
                          مفيد ({review.helpfulCount})
                      </button>
                      <button className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                          إبلاغ
                      </button>
                  </div>
              </div>
          ))}
      </div>

    </div>
  );
};

export default ReviewsSection;