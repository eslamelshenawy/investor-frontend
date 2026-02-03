/**
 * ============================================
 * DASHBOARD DETAIL PAGE
 * ============================================
 *
 * صفحة تفاصيل اللوحة - تجلب البيانات من الـ API
 * تتضمن: Hero، تبويبات، Sidebar، محتوى تفاعلي
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  BarChart,
  Bar as RechartsBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Database,
  Star,
  Download,
  Globe,
  ShieldCheck,
  RefreshCw,
  Tag,
  Eye,
  ExternalLink,
  MessageSquare,
  Send,
  User,
  MoreHorizontal,
  Reply,
  ThumbsUp,
  BarChart3,
  TrendingUp,
  PieChart,
  MapPin,
  ArrowUpRight,
  Building2,
  Wallet,
  Landmark,
  Zap,
  Briefcase,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { api } from '../src/services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ============================================
// TYPES
// ============================================

interface ActivityItem {
  date: string;
  views: number;
  downloads: number;
}

interface Comment {
  id: number | string;
  user: string;
  role?: string;
  date: string;
  content: string;
  replies?: number;
}

interface Review {
  id: number | string;
  user: string;
  rating: number;
  date: string;
  content: string;
  helpfulCount: number;
}

interface ChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  tension?: number;
  fill?: boolean;
}

interface ChartConfig {
  labels: string[];
  datasets: ChartDataset[];
}

interface DashboardData {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  category: string;
  source: string;
  views: number;
  lastUpdated: string;
  isFavorite: boolean;
  color: string;
  trend: number;
  keyMetrics: string[];
  dataFreq: string;
  recordCount: number;
  syncStatus: string;
  publisher?: string;
  contributors?: string[];
  createdDate?: string;
  updatedDate?: string;
  license?: string;
  language?: string;
  downloads?: number;
  rating?: number;
  // Data from API
  activity?: ActivityItem[];
  comments?: Comment[];
  reviews?: Review[];
  chartData?: {
    line?: ChartConfig;
    doughnut?: { labels: string[]; data: number[]; colors?: string[] };
    bar?: ChartConfig;
  };
}

const DASHBOARD_CATEGORIES = [
  { id: 'all', label: 'الكل' },
  { id: 'economy', label: 'الاقتصاد الكلي' },
  { id: 'energy', label: 'الطاقة والتعدين' },
  { id: 'real_estate', label: 'العقار والإسكان' },
  { id: 'investment', label: 'الاستثمار' },
  { id: 'labor', label: 'سوق العمل' }
];


// ============================================
// SUB-COMPONENTS
// ============================================

// --- Accordion Item ---
const AccordionItem: React.FC<{
  title: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ title, isOpen, onClick, children }) => (
  <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
    >
      <span className="font-bold text-gray-700">{title}</span>
      {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
    </button>
    {isOpen && (
      <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        {children}
      </div>
    )}
  </div>
);

// --- Activity Chart ---
const ActivityChart: React.FC<{ data?: ActivityItem[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 w-full mt-4 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-400">لا تتوفر بيانات النشاط حالياً</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full mt-4" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <RechartsTooltip
            cursor={{ fill: '#F3F4F6' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <RechartsBar dataKey="downloads" fill="#003F70" radius={[4, 4, 0, 0]} barSize={20} name="التنزيلات" />
          <RechartsBar dataKey="views" fill="#00A3E0" radius={[4, 4, 0, 0]} barSize={20} name="المشاهدات" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- Metric Card ---
const MetricCard: React.FC<{
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, change, isPositive, icon, color }) => {
  const bgColors: Record<string, string> = {
    blue: 'bg-blue-50',
    emerald: 'bg-emerald-50',
    amber: 'bg-amber-50',
    indigo: 'bg-indigo-50',
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${bgColors[color] || 'bg-gray-50'}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-gray-500 text-sm mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );
};

// --- Comments Section ---
const CommentsSection: React.FC<{ initialComments?: Comment[] }> = ({ initialComments }) => {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now(),
      user: "مستخدم جديد",
      date: "الآن",
      content: newComment,
      replies: 0
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="text-blue-700" size={24} />
          التعليقات والمناقشات
          <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{comments.length}</span>
        </h3>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">إضافة تعليق جديد</label>
            <textarea
              id="comment"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none resize-none text-sm"
              placeholder="شاركنا رأيك أو استفسارك حول هذه البيانات..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={16} />
              نشر التعليق
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
            <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد تعليقات بعد. كن أول من يعلق!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${comment.role === 'مسؤول' ? 'bg-blue-700' : 'bg-gray-300'}`}>
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
                    <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-700 transition-colors">
                      <Reply size={14} />
                      رد
                    </button>
                    {comment.replies ? (
                      <button className="text-xs text-blue-700 font-medium hover:underline">
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
          ))
        )}
      </div>
    </div>
  );
};

// --- Reviews Section ---
const ReviewsSection: React.FC<{ initialReviews?: Review[] }> = ({ initialReviews }) => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [newRating, setNewRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [newReviewText, setNewReviewText] = useState('');

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  const distribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
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
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-8 items-center">
        <div className="flex flex-col items-center justify-center min-w-[150px]">
          <div className="text-5xl font-bold text-gray-800 mb-2">{averageRating}</div>
          <div className="flex text-yellow-400 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={20} fill={s <= Math.round(Number(averageRating)) ? "currentColor" : "none"} className={s > Math.round(Number(averageRating)) ? "text-gray-300" : ""} />
            ))}
          </div>
          <div className="text-sm text-gray-500">{totalReviews} تقييم</div>
        </div>

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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none resize-none text-sm bg-white"
              placeholder="اكتب تجربتك مع هذه المجموعة من البيانات..."
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={newRating === 0}
                className="bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إرسال التقييم
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <h3 className="font-bold text-gray-800 text-lg border-b border-gray-100 pb-2">جميع المراجعات ({totalReviews})</h3>

        {reviews.length === 0 ? (
          <div className="p-8 text-center">
            <Star size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد مراجعات بعد. كن أول من يقيم!</p>
          </div>
        ) : (
          reviews.map((review) => (
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
                <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-700 transition-colors group">
                  <ThumbsUp size={14} className="group-hover:scale-110 transition-transform" />
                  مفيد ({review.helpfulCount})
                </button>
                <button className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                  إبلاغ
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Dashboard Embed (Charts) ---
const DashboardEmbed: React.FC<{ dashboard: DashboardData }> = ({ dashboard }) => {
  const chartData = dashboard.chartData;

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: { font: { family: 'inherit' }, boxWidth: 10, usePointStyle: true },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: { grid: { color: '#f3f4f6' }, border: { display: false }, beginAtZero: false },
      x: { grid: { display: false }, border: { display: false } },
    },
    interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false },
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { position: 'right' as const, labels: { font: { family: 'inherit', size: 12 }, usePointStyle: true, padding: 20 } },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        callbacks: { label: (context: any) => ` ${context.label}: ${context.raw}%` }
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, align: 'end' as const, labels: { font: { family: 'inherit' }, usePointStyle: true, boxWidth: 8 } },
      tooltip: { backgroundColor: 'rgba(255, 255, 255, 0.9)', titleColor: '#1f2937', bodyColor: '#4b5563', borderColor: '#e5e7eb', borderWidth: 1, cornerRadius: 8 },
    },
    scales: {
      y: { grid: { color: '#f3f4f6' }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } },
    },
  };

  // Build chart data from API response
  const lineChartData = chartData?.line ? {
    labels: chartData.line.labels,
    datasets: chartData.line.datasets.map(ds => ({
      ...ds,
      borderColor: ds.borderColor || '#003F70',
      backgroundColor: ds.backgroundColor || 'rgba(0, 63, 112, 0.1)',
      tension: ds.tension ?? 0.4,
      fill: ds.fill ?? true,
      pointBackgroundColor: '#fff',
      pointBorderColor: ds.borderColor || '#003F70',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  } : null;

  const doughnutChartData = chartData?.doughnut ? {
    labels: chartData.doughnut.labels,
    datasets: [{
      data: chartData.doughnut.data,
      backgroundColor: chartData.doughnut.colors || ['#003F70', '#3B82F6', '#10B981', '#F59E0B', '#94A3B8'],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  } : null;

  const barChartData = chartData?.bar ? {
    labels: chartData.bar.labels,
    datasets: chartData.bar.datasets.map((ds, idx) => ({
      ...ds,
      backgroundColor: ds.backgroundColor || (idx === 0 ? '#3B82F6' : '#003F70'),
      borderRadius: 4,
      barThickness: 24,
    })),
  } : null;

  const hasAnyChartData = lineChartData || doughnutChartData || barChartData;

  return (
    <div className="bg-gray-50 min-h-[600px] p-6 rounded-xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="text-blue-700" />
            تحليل {dashboard.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">نظرة شاملة على مؤشرات الأداء والتحليلات التفصيلية</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-gray-600 border border-gray-200">
            آخر تحديث: {dashboard.lastUpdated}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="إجمالي السجلات" value={dashboard.recordCount?.toLocaleString() || '0'} change={`${dashboard.trend > 0 ? '+' : ''}${dashboard.trend}%`} isPositive={dashboard.trend > 0} icon={<Wallet className="text-blue-600" size={20} />} color="blue" />
        <MetricCard title="المشاهدات" value={dashboard.views?.toLocaleString() || '0'} change={`${dashboard.trend > 0 ? '+' : ''}${Math.abs(dashboard.trend)}%`} isPositive={dashboard.trend > 0} icon={<Eye className="text-emerald-600" size={20} />} color="emerald" />
        <MetricCard title="التنزيلات" value={dashboard.downloads?.toLocaleString() || '0'} change={`${dashboard.trend > 0 ? '+' : ''}${Math.abs(dashboard.trend)}%`} isPositive={dashboard.trend > 0} icon={<Download className="text-amber-600" size={20} />} color="amber" />
        <MetricCard title="التقييم" value={`${dashboard.rating || 0}/5`} change={`${dashboard.trend > 0 ? '+' : ''}${Math.abs(dashboard.trend)}%`} isPositive={dashboard.trend > 0} icon={<Star className="text-indigo-600" size={20} />} color="indigo" />
      </div>

      {!hasAnyChartData ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <BarChart3 size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-600 mb-2">لا تتوفر بيانات الرسوم البيانية</h3>
          <p className="text-gray-400">لم يتم تحميل بيانات الرسوم البيانية من الخادم بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {lineChartData && (
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">نمو البيانات</h3>
                <button className="text-gray-400 hover:text-blue-700 transition-colors"><ArrowUpRight size={18} /></button>
              </div>
              <div className="h-[300px]">
                <Line data={lineChartData} options={lineChartOptions as any} />
              </div>
            </div>
          )}

          {doughnutChartData && (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">توزيع القطاعات</h3>
                <PieChart className="text-gray-400" size={18} />
              </div>
              <div className="h-[300px] flex items-center justify-center relative">
                <Doughnut data={doughnutChartData} options={doughnutChartOptions as any} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-gray-800">100%</span>
                  <span className="text-xs text-gray-400">الإجمالي</span>
                </div>
              </div>
            </div>
          )}

          {barChartData && (
            <div className={`${lineChartData || doughnutChartData ? 'lg:col-span-3' : ''} bg-white p-6 rounded-xl border border-gray-100 shadow-sm`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">توزيع حسب المناطق</h3>
                <div className="flex gap-2">
                  {barChartData.datasets.map((ds: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-1 text-xs text-gray-500">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ds.backgroundColor }}></span>
                      {ds.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-[300px]">
                <Bar data={barChartData} options={barChartOptions as any} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Dataset Content ---
const DatasetContent: React.FC<{ dashboard: DashboardData }> = ({ dashboard }) => {
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    publisher: true,
    meta: true,
    sources: false,
    classifications: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
          عن مجموعة البيانات
        </h2>
        <div className="prose prose-lg text-gray-600 leading-relaxed max-w-none">
          <p>{dashboard.description}</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">البيانات الوصفية</h2>

        <AccordionItem title="الناشر" isOpen={openAccordions.publisher} onClick={() => toggleAccordion('publisher')}>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between py-2 border-b border-gray-200 last:border-0">
              <span className="text-gray-500">الناشر الأساسي</span>
              <span className="font-semibold text-gray-800">{dashboard.source || 'غير محدد'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 last:border-0">
              <span className="text-gray-500">عدد السجلات</span>
              <span className="font-semibold text-gray-800">{dashboard.recordCount?.toLocaleString() || 0}</span>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem title="تفاصيل إضافية" isOpen={openAccordions.meta} onClick={() => toggleAccordion('meta')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-500">التصنيف</span>
              <span className="font-medium">{DASHBOARD_CATEGORIES.find(c => c.id === dashboard.category)?.label || dashboard.category}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-500">آخر تحديث</span>
              <span className="font-medium">{dashboard.lastUpdated}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-500">تكرار البيانات</span>
              <span className="font-medium">{dashboard.dataFreq === 'daily' ? 'يومي' : dashboard.dataFreq === 'monthly' ? 'شهري' : dashboard.dataFreq === 'quarterly' ? 'ربع سنوي' : 'سنوي'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-500">حالة المزامنة</span>
              <span className={`font-medium ${dashboard.syncStatus === 'synced' ? 'text-green-600' : 'text-amber-600'}`}>
                {dashboard.syncStatus === 'synced' ? 'متزامن' : 'قيد المزامنة'}
              </span>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem title="التصنيفات والوسوم" isOpen={openAccordions.classifications} onClick={() => toggleAccordion('classifications')}>
          <div className="flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">المؤشرات الرئيسية</h4>
              <div className="flex flex-wrap gap-2">
                {dashboard.keyMetrics?.map((metric, idx) => (
                  <span key={idx} className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded">{metric}</span>
                ))}
              </div>
            </div>
          </div>
        </AccordionItem>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">نظرة عامة على النشاط</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-lg">
            <div className="bg-white p-3 rounded-full shadow-sm text-blue-600"><Eye size={24} /></div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{dashboard.views?.toLocaleString() || 0}</div>
              <div className="text-sm text-gray-500">المشاهدات</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-lg">
            <div className="bg-white p-3 rounded-full shadow-sm text-blue-700"><Download size={24} /></div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{dashboard.downloads?.toLocaleString() || 0}</div>
              <div className="text-sm text-gray-500">التنزيلات</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-lg">
            <div className="bg-white p-3 rounded-full shadow-sm text-yellow-500"><Star size={24} /></div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{dashboard.rating || 0}</div>
              <div className="text-sm text-gray-500">التقييم</div>
            </div>
          </div>
        </div>

        <ActivityChart data={dashboard.activity} />
      </section>

      <section className="bg-gray-50 rounded-xl p-6 border border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-800 mb-1">تقييم محتوى الصفحة</h3>
          <p className="text-sm text-gray-500">ساعدنا في تحسين جودة البيانات المفتوحة</p>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} className="text-gray-300 hover:text-yellow-400 transition-colors">
              <Star size={28} fill="currentColor" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================

const TABS = [
  { id: 'dataset', label: 'معلومات البيانات' },
  { id: 'dashboard', label: 'بيانات الرادار' },
  { id: 'comments', label: 'التعليقات' },
  { id: 'reviews', label: 'التقييم والمراجعة' },
];

const DashboardDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dataset');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await api.getOfficialDashboard(id);

        if (response.success && response.data) {
          setDashboard(response.data as DashboardData);
        } else {
          setError(response.errorAr || response.error || 'تعذر جلب بيانات اللوحة');
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError('تعذر الاتصال بالخادم');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">جاري تحميل بيانات اللوحة...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !dashboard) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Database size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">اللوحة غير موجودة</h2>
          <p className="text-gray-500 mb-6">{error || 'لم نتمكن من العثور على اللوحة المطلوبة'}</p>
          <button
            onClick={() => navigate('/dashboards')}
            className="bg-blue-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors"
          >
            العودة إلى اللوحات
          </button>
        </div>
      </div>
    );
  }

  const isFullWidthTab = activeTab === 'dashboard';

  const getCategoryIcon = () => {
    switch (dashboard.category) {
      case 'economy': return <Landmark size={48} className="text-blue-300" />;
      case 'energy': return <Zap size={48} className="text-blue-300" />;
      case 'investment': return <TrendingUp size={48} className="text-blue-300" />;
      case 'real_estate': return <Building2 size={48} className="text-blue-300" />;
      case 'labor': return <Briefcase size={48} className="text-blue-300" />;
      default: return <Database size={48} className="text-blue-300" />;
    }
  };

  return (
    <div className="bg-gray-50 font-sans text-right pb-8" dir="rtl">

      {/* Hero Section */}
      <div className="bg-blue-700 text-white pt-8 pb-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-blue-200 mb-6">
            <a href="#/" className="hover:text-white transition-colors">الرئيسية</a>
            <ChevronLeft size={14} />
            <a href="#/dashboards" className="hover:text-white transition-colors">اللوحات الرسمية</a>
            <ChevronLeft size={14} />
            <span className="text-white font-medium">{dashboard.name}</span>
          </nav>

          {/* Title Area */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              {getCategoryIcon()}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                {dashboard.name}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-blue-100">
                <span className={`px-3 py-1 rounded-full border ${dashboard.syncStatus === 'synced' ? 'bg-green-500/20 text-green-200 border-green-500/30' : 'bg-amber-500/20 text-amber-200 border-amber-500/30'}`}>
                  {dashboard.syncStatus === 'synced' ? 'متزامن' : 'قيد المزامنة'}
                </span>
                <span className="flex items-center gap-2">
                  • {DASHBOARD_CATEGORIES.find(c => c.id === dashboard.category)?.label || dashboard.category}
                </span>
                <span className="flex items-center gap-2">
                  • {dashboard.recordCount?.toLocaleString()} سجل
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex gap-8 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-blue-700 hover:border-gray-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className={`flex flex-col ${isFullWidthTab ? '' : 'lg:flex-row'} gap-8`}>

          {/* Main Content Area */}
          <div className={`w-full ${isFullWidthTab ? '' : 'lg:w-2/3'} order-2 lg:order-1`}>
            {activeTab === 'dataset' ? (
              <DatasetContent dashboard={dashboard} />
            ) : activeTab === 'dashboard' ? (
              <DashboardEmbed dashboard={dashboard} />
            ) : activeTab === 'comments' ? (
              <CommentsSection initialComments={dashboard.comments} />
            ) : activeTab === 'reviews' ? (
              <ReviewsSection initialReviews={dashboard.reviews} />
            ) : (
              <div className="p-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200">
                <p className="text-lg">المحتوى قيد التطوير لهذا التبويب</p>
              </div>
            )}
          </div>

          {/* Sidebar (Only shown if NOT full width tab) */}
          {!isFullWidthTab && (
            <aside className="w-full lg:w-1/3 order-1 lg:order-2">
              <div className="flex flex-col gap-6">
                {/* Main Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700">
                    خصائص البيانات
                  </div>

                  <div className="divide-y divide-gray-50">
                    <div className="p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg"><Star size={18} /></div>
                        <span className="text-sm font-medium text-gray-600">التقييم</span>
                      </div>
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={16} fill={s <= (dashboard.rating || 0) ? "currentColor" : "none"} className={s > (dashboard.rating || 0) ? "text-gray-300" : ""} />
                        ))}
                      </div>
                    </div>

                    <div className="p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Download size={18} /></div>
                        <span className="text-sm font-medium text-gray-600">عدد التحميلات</span>
                      </div>
                      <span className="font-bold text-gray-800">{dashboard.downloads?.toLocaleString() || 0}</span>
                    </div>

                    <div className="p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Eye size={18} /></div>
                        <span className="text-sm font-medium text-gray-600">المشاهدات</span>
                      </div>
                      <span className="font-bold text-gray-800">{dashboard.views?.toLocaleString() || 0}</span>
                    </div>

                    <div className="p-4 flex flex-col gap-3 group hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Database size={18} /></div>
                        <span className="text-sm font-medium text-gray-600">عدد السجلات</span>
                      </div>
                      <span className="font-bold text-gray-800 mr-11">{dashboard.recordCount?.toLocaleString() || 0}</span>
                    </div>

                    <div className="p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><RefreshCw size={18} /></div>
                        <span className="text-sm font-medium text-gray-600">التحديث الدوري</span>
                      </div>
                      <span className="font-bold text-gray-800">
                        {dashboard.dataFreq === 'daily' ? 'يومي' : dashboard.dataFreq === 'monthly' ? 'شهري' : dashboard.dataFreq === 'quarterly' ? 'ربع سنوي' : 'سنوي'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700 flex items-center gap-2">
                    <Tag size={18} />
                    المؤشرات الرئيسية
                  </div>
                  <div className="p-4 flex flex-wrap gap-2">
                    {dashboard.keyMetrics?.map((metric, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-100"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Back Button */}
                <button
                  onClick={() => navigate('/dashboards')}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                >
                  <ArrowRight size={18} />
                  العودة إلى اللوحات
                </button>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardDetailPage;
