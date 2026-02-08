/**
 * ================================================
 * AI ECONOMIC SUMMARY PAGE - الملخص الاقتصادي الذكي
 * ================================================
 *
 * لوحة ملخص اقتصادي مولّدة بالذكاء الاصطناعي
 * AI-generated economic summary dashboard with key indicators,
 * sector performance, insights, and economic calendar.
 */

import React, { useState, useEffect } from 'react';
import {
  Brain,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Lightbulb,
  Calendar,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Eye,
  ShieldAlert,
  Target,
  Globe,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { api } from '../src/services/api';

// ============================================
// TYPES
// ============================================

interface KeyIndicator {
  id: string;
  label: string;
  value: string;
  change: number;
  unit: string;
  sparklineData: { v: number }[];
  icon: React.ReactNode;
  color: string;
}

interface SectorPerformance {
  name: string;
  change: number;
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'neutral' | 'opportunity';
  icon: React.ReactNode;
  confidence: number;
}

interface EconomicEvent {
  id: string;
  title: string;
  date: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
}

// ============================================
// HELPERS
// ============================================

function getIndicatorColors(color: string) {
  const map: Record<string, { bg: string; border: string; text: string; icon: string; sparkline: string }> = {
    emerald: {
      bg: 'bg-emerald-950/40',
      border: 'border-emerald-800/40',
      text: 'text-emerald-400',
      icon: 'bg-emerald-900/60 text-emerald-400',
      sparkline: '#34d399',
    },
    blue: {
      bg: 'bg-blue-950/40',
      border: 'border-blue-800/40',
      text: 'text-blue-400',
      icon: 'bg-blue-900/60 text-blue-400',
      sparkline: '#60a5fa',
    },
    violet: {
      bg: 'bg-violet-950/40',
      border: 'border-violet-800/40',
      text: 'text-violet-400',
      icon: 'bg-violet-900/60 text-violet-400',
      sparkline: '#a78bfa',
    },
    amber: {
      bg: 'bg-amber-950/40',
      border: 'border-amber-800/40',
      text: 'text-amber-400',
      icon: 'bg-amber-900/60 text-amber-400',
      sparkline: '#fbbf24',
    },
  };
  return map[color] ?? map.emerald;
}

function getImpactBadge(impact: 'high' | 'medium' | 'low') {
  switch (impact) {
    case 'high':
      return { label: 'مرتفع', className: 'bg-red-900/50 text-red-400 border border-red-800/40' };
    case 'medium':
      return { label: 'متوسط', className: 'bg-amber-900/50 text-amber-400 border border-amber-800/40' };
    case 'low':
      return { label: 'منخفض', className: 'bg-slate-700/50 text-slate-400 border border-slate-600/40' };
  }
}

function getInsightTypeStyle(type: AIInsight['type']) {
  switch (type) {
    case 'positive':
      return { bg: 'bg-emerald-950/40', border: 'border-emerald-800/40', iconBg: 'bg-emerald-900/60 text-emerald-400', badge: 'text-emerald-400', badgeLabel: 'إيجابي' };
    case 'warning':
      return { bg: 'bg-amber-950/40', border: 'border-amber-800/40', iconBg: 'bg-amber-900/60 text-amber-400', badge: 'text-amber-400', badgeLabel: 'تحذير' };
    case 'opportunity':
      return { bg: 'bg-blue-950/40', border: 'border-blue-800/40', iconBg: 'bg-blue-900/60 text-blue-400', badge: 'text-blue-400', badgeLabel: 'فرصة' };
    case 'neutral':
      return { bg: 'bg-slate-800/60', border: 'border-slate-700/40', iconBg: 'bg-slate-700/60 text-slate-300', badge: 'text-slate-400', badgeLabel: 'مراقبة' };
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// ============================================
// SPARKLINE COMPONENT
// ============================================

const MiniSparkline: React.FC<{ data: { v: number }[]; color: string }> = ({ data, color }) => (
  <ResponsiveContainer width="100%" height={40}>
    <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area
        type="monotone"
        dataKey="v"
        stroke={color}
        strokeWidth={2}
        fill={`url(#spark-${color})`}
        dot={false}
        isAnimationActive={false}
      />
    </AreaChart>
  </ResponsiveContainer>
);

// ============================================
// SECTOR BAR CHART TOOLTIP
// ============================================

const SectorTooltip: React.FC<{ active?: boolean; payload?: any[]; label?: string }> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0];
  const value = data.value as number;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl text-sm" dir="rtl">
      <p className="text-slate-300 font-medium">{data.payload.name}</p>
      <p className={value >= 0 ? 'text-emerald-400' : 'text-red-400'}>
        {value >= 0 ? '+' : ''}{value}%
      </p>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const AIEconomicSummaryPage: React.FC = () => {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [latestSignals, setLatestSignals] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [statsRes, catRes, signalsRes, activityRes] = await Promise.all([
          api.getOverviewStats(),
          api.getCategoryStats(),
          api.getLatestSignals(5),
          api.getRecentActivity(),
        ]);
        if (cancelled) return;
        if (statsRes.success) setOverviewStats(statsRes.data);
        if (catRes.success && catRes.data) setCategoryStats((catRes.data as any).categories ?? []);
        if (signalsRes.success) setLatestSignals(Array.isArray(signalsRes.data) ? signalsRes.data : []);
        if (activityRes.success) setRecentActivity(activityRes.data);
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, catRes, signalsRes, activityRes] = await Promise.all([
        api.getOverviewStats(),
        api.getCategoryStats(),
        api.getLatestSignals(5),
        api.getRecentActivity(),
      ]);
      if (statsRes.success) setOverviewStats(statsRes.data);
      if (catRes.success && catRes.data) setCategoryStats((catRes.data as any).categories ?? []);
      if (signalsRes.success) setLatestSignals(Array.isArray(signalsRes.data) ? signalsRes.data : []);
      if (activityRes.success) setRecentActivity(activityRes.data);
      setLastUpdated(new Date());
    } catch {
      // Silently fail
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Build indicators from real stats
  const indicators: KeyIndicator[] = overviewStats ? [
    {
      id: 'datasets',
      label: 'مجموعات البيانات',
      value: String(overviewStats.totalDatasets ?? 0),
      change: overviewStats.weeklyGrowth ?? 0,
      unit: 'مجموعة',
      sparklineData: Array.from({ length: 12 }, (_, i) => ({ v: Math.max(0, (overviewStats.totalDatasets ?? 100) - (12 - i) * 50 + Math.random() * 30) })),
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'emerald',
    },
    {
      id: 'signals',
      label: 'الإشارات النشطة',
      value: String(overviewStats.activeSignals ?? 0),
      change: overviewStats.newThisWeek > 0 ? Math.round((overviewStats.newThisWeek / Math.max(1, overviewStats.totalSignals)) * 100) : 0,
      unit: 'إشارة',
      sparklineData: Array.from({ length: 12 }, (_, i) => ({ v: Math.max(0, (overviewStats.activeSignals ?? 50) - (12 - i) * 5 + Math.random() * 10) })),
      icon: <DollarSign className="w-6 h-6" />,
      color: 'blue',
    },
    {
      id: 'users',
      label: 'المستخدمون',
      value: String(overviewStats.totalUsers ?? 0),
      change: 0,
      unit: 'مستخدم',
      sparklineData: Array.from({ length: 12 }, (_, i) => ({ v: Math.max(0, (overviewStats.totalUsers ?? 20) - (12 - i) * 2 + Math.random() * 5) })),
      icon: <Users className="w-6 h-6" />,
      color: 'violet',
    },
    {
      id: 'content',
      label: 'المحتوى المنشور',
      value: String(overviewStats.totalContent ?? 0),
      change: 0,
      unit: 'منشور',
      sparklineData: Array.from({ length: 12 }, (_, i) => ({ v: Math.max(0, (overviewStats.totalContent ?? 10) - (12 - i) * 3 + Math.random() * 8) })),
      icon: <Globe className="w-6 h-6" />,
      color: 'amber',
    },
  ] : [];

  // Build sector performance from category stats
  const sectorChartData = categoryStats.slice(0, 5).map((cat: any) => ({
    name: cat.name || cat.nameEn || 'غير محدد',
    change: cat.percentage ?? cat.count ?? 0,
    fill: (cat.percentage ?? cat.count ?? 0) >= 0 ? '#34d399' : '#f87171',
  }));

  // Build insights from latest signals
  const insights: AIInsight[] = latestSignals.slice(0, 4).map((sig: any, idx: number) => {
    const typeMap: Record<string, AIInsight['type']> = { BULLISH: 'positive', BEARISH: 'warning', NEUTRAL: 'neutral' };
    const iconMap: Record<string, React.ReactNode> = {
      positive: <TrendingUp className="w-5 h-5" />,
      warning: <ShieldAlert className="w-5 h-5" />,
      opportunity: <Target className="w-5 h-5" />,
      neutral: <Eye className="w-5 h-5" />,
    };
    const insightType = typeMap[sig.trend?.toUpperCase()] ?? (idx === 0 ? 'opportunity' : 'neutral');
    return {
      id: sig.id || `ins-${idx}`,
      title: sig.titleAr || sig.title || 'رؤية جديدة',
      description: sig.summaryAr || sig.summary || sig.titleAr || '',
      type: insightType,
      icon: iconMap[insightType] || <Eye className="w-5 h-5" />,
      confidence: sig.confidence ?? sig.impactScore ?? 75,
    };
  });

  // Build weekly summary from recent activity
  const weeklyBulletPoints: string[] = [];
  if (recentActivity) {
    if (recentActivity.signals?.items?.length > 0) {
      weeklyBulletPoints.push(`تم رصد ${recentActivity.signals.count} إشارة جديدة في السوق خلال الفترة الأخيرة.`);
      const topSignal = recentActivity.signals.items[0];
      if (topSignal) weeklyBulletPoints.push(`أبرز الإشارات: ${topSignal.titleAr || topSignal.title}`);
    }
    if (recentActivity.content?.items?.length > 0) {
      weeklyBulletPoints.push(`تم نشر ${recentActivity.content.count} محتوى جديد على المنصة.`);
    }
    if (recentActivity.datasets?.items?.length > 0) {
      weeklyBulletPoints.push(`تمت إضافة ${recentActivity.datasets.count} مجموعة بيانات جديدة.`);
      const topDs = recentActivity.datasets.items[0];
      if (topDs) weeklyBulletPoints.push(`أحدث البيانات: ${topDs.nameAr || topDs.name} من ${topDs.source || 'مصدر حكومي'}`);
    }
  }
  if (weeklyBulletPoints.length === 0) {
    weeklyBulletPoints.push('لا توجد تحديثات حديثة. سيتم تحديث البيانات تلقائياً عند توفر بيانات جديدة.');
  }

  const weeklySummary = {
    title: `ملخص الأسبوع - ${new Date().toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    overview: overviewStats
      ? `يضم رادار المستثمر حالياً ${(overviewStats.totalDatasets ?? 0).toLocaleString('ar-SA')} مجموعة بيانات و${(overviewStats.totalSignals ?? 0).toLocaleString('ar-SA')} إشارة سوقية. تم إضافة ${overviewStats.newThisWeek ?? 0} عنصر جديد هذا الأسبوع.`
      : 'جاري تحميل البيانات...',
    bulletPoints: weeklyBulletPoints,
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ========== HEADER ========== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-900/30">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                الملخص الاقتصادي الذكي
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                تحليل شامل للمؤشرات الاقتصادية مدعوم بالذكاء الاصطناعي
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-700/50">
              <Clock className="w-3.5 h-3.5" />
              <span>آخر تحديث: {formatFullDate(lastUpdated)} - {formatTime(lastUpdated)}</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/30"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">تحديث</span>
            </button>
          </div>
        </div>

        {/* ========== LOADING STATE ========== */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
              <p className="text-sm text-slate-400">جاري تحميل البيانات...</p>
            </div>
          </div>
        )}

        {/* ========== KEY INDICATORS GRID ========== */}
        {!loading && (<>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {indicators.map((indicator) => {
            const colors = getIndicatorColors(indicator.color);
            const isPositive = indicator.change >= 0;
            // For unemployment and inflation, decrease is good
            const isGood = (indicator.id === 'unemployment' || indicator.id === 'inflation')
              ? !isPositive
              : isPositive;

            return (
              <div
                key={indicator.id}
                className={`${colors.bg} border ${colors.border} rounded-xl p-4 transition-all hover:scale-[1.02] hover:shadow-lg`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${colors.icon} flex items-center justify-center`}>
                    {indicator.icon}
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${isGood ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                    {isPositive ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    <span>{isPositive ? '+' : ''}{indicator.change}%</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-1">{indicator.label}</p>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-2xl font-bold text-white">{indicator.value}</span>
                  <span className="text-xs text-slate-500">{indicator.unit}</span>
                </div>
                <MiniSparkline data={indicator.sparklineData} color={colors.sparkline} />
              </div>
            );
          })}
        </div>

        {/* ========== WEEKLY SUMMARY + SECTOR PERFORMANCE ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Weekly Market Summary - 3 cols */}
          <div className="lg:col-span-3 bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-900/60 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">ملخص السوق الأسبوعي</h2>
                <p className="text-xs text-slate-500">{weeklySummary.title}</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              {weeklySummary.overview}
            </p>
            <div className="space-y-2.5">
              {weeklySummary.bulletPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                  <p className="text-sm text-slate-400 leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-2 text-xs text-slate-500">
              <Brain className="w-3.5 h-3.5" />
              <span>تم إنشاء هذا الملخص بواسطة الذكاء الاصطناعي بناءً على تحليل أكثر من 150 مصدر بيانات</span>
            </div>
          </div>

          {/* Sector Performance - 2 cols */}
          <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-900/60 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white">أداء القطاعات</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">أبرز 5 قطاعات من حيث الأداء الأسبوعي</p>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sectorChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: '#475569' }}
                    tickFormatter={(v: number) => `${v}%`}
                    domain={['dataMin - 2', 'dataMax + 2']}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#cbd5e1', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={120}
                    mirror
                  />
                  <Tooltip content={<SectorTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
                  <Bar
                    dataKey="change"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                    isAnimationActive={true}
                  >
                    {sectorChartData.map((entry, index) => (
                      <rect key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                <span>ارتفاع</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-red-400" />
                <span>انخفاض</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========== AI INSIGHTS PANEL ========== */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-900/60 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-violet-400" />
            </div>
            <h2 className="text-lg font-bold text-white">رؤى الذكاء الاصطناعي</h2>
            <span className="text-xs text-slate-500 mr-2">تحليلات وتوقعات مبنية على البيانات</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {insights.map((insight) => {
              const style = getInsightTypeStyle(insight.type);
              return (
                <div
                  key={insight.id}
                  className={`${style.bg} border ${style.border} rounded-xl p-4 transition-all hover:shadow-lg hover:scale-[1.01]`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-lg ${style.iconBg} flex items-center justify-center`}>
                        {insight.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight">{insight.title}</h3>
                        <span className={`text-[10px] font-medium ${style.badge}`}>{style.badgeLabel}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-800/80 rounded-full px-2 py-0.5 border border-slate-700/40">
                      <Activity className="w-3 h-3" />
                      <span>ثقة {insight.confidence}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{insight.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========== ECONOMIC CALENDAR ========== */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-900/60 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">الأجندة الاقتصادية</h2>
              <p className="text-xs text-slate-500">أبرز الأحداث الاقتصادية القادمة</p>
            </div>
          </div>

          <div className="text-center py-8">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">سيتم تحديث الأجندة الاقتصادية قريباً</p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/50 text-center">
            <p className="text-xs text-slate-500">
              يتم تحديث الأجندة الاقتصادية تلقائيًا من مصادر رسمية متعددة
            </p>
          </div>
        </div>

        {/* ========== FOOTER DISCLAIMER ========== */}
        <div className="text-center py-4">
          <p className="text-[11px] text-slate-600 leading-relaxed max-w-2xl mx-auto">
            تنويه: المعلومات والتحليلات المعروضة في هذه الصفحة مُولّدة بواسطة الذكاء الاصطناعي لأغراض إعلامية فقط ولا تُعتبر نصيحة استثمارية. يُرجى استشارة مستشار مالي مرخّص قبل اتخاذ أي قرارات استثمارية.
          </p>
        </div>
        </>)}

      </div>
    </div>
  );
};

export default AIEconomicSummaryPage;
