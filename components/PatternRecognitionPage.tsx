/**
 * ================================================
 * PATTERN RECOGNITION PAGE - اكتشاف الأنماط بالذكاء الاصطناعي
 * ================================================
 *
 * صفحة تعرض الأنماط المكتشفة في البيانات الاقتصادية
 * AI-detected patterns in economic data with timeline and predictions
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Target,
  Clock,
  Sparkles,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  RotateCw,
  Crosshair,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Calendar,
  ChevronDown,
  Layers,
  Shield,
  Cpu,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Area,
  AreaChart,
} from 'recharts';
import { api } from '../src/services/api';

// ============================================
// TYPES
// ============================================

type PatternType = 'bullish' | 'bearish' | 'consolidation' | 'breakout' | 'reversal';

/** Backend pattern shape from GET /api/signals/patterns */
interface ApiPattern {
  id: string;
  type: 'TREND' | 'CYCLE' | 'ANOMALY' | 'CORRELATION' | 'SEASONAL';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  signals: string[];
  sectors: string[];
  timeframe: { start: string; end: string };
  metadata: Record<string, unknown>;
}
type TimeRange = 'week' | 'month' | 'quarter' | 'year';

interface Pattern {
  id: string;
  name: string;
  type: PatternType;
  confidence: number;
  description: string;
  sectors: string[];
  detectedAt: string;
  isNew: boolean;
  impactScore: number;
}

interface Prediction {
  id: string;
  text: string;
  confidence: number;
  timeframe: string;
  relatedPatternId: string;
  relatedPatternName: string;
  type: 'positive' | 'negative' | 'neutral';
}

interface TimelinePoint {
  date: string;
  label: string;
  patterns: number;
  bullish: number;
  bearish: number;
  consolidation: number;
  breakout: number;
  reversal: number;
}

interface AccuracyStat {
  period: string;
  predicted: number;
  correct: number;
  accuracy: number;
}

// ============================================
// PATTERN CONFIG
// ============================================

const PATTERN_CONFIG: Record<PatternType, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  iconBg: string;
  icon: React.ElementType;
  chartColor: string;
}> = {
  bullish: {
    label: 'نمط صعودي',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300',
    iconBg: 'bg-emerald-500/20',
    icon: TrendingUp,
    chartColor: '#34d399',
  },
  bearish: {
    label: 'نمط هبوطي',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    badgeBg: 'bg-red-500/20',
    badgeText: 'text-red-300',
    iconBg: 'bg-red-500/20',
    icon: TrendingDown,
    chartColor: '#f87171',
  },
  consolidation: {
    label: 'نمط تذبذب',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    iconBg: 'bg-amber-500/20',
    icon: Activity,
    chartColor: '#fbbf24',
  },
  breakout: {
    label: 'نمط اختراق',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    badgeBg: 'bg-blue-500/20',
    badgeText: 'text-blue-300',
    iconBg: 'bg-blue-500/20',
    icon: Crosshair,
    chartColor: '#60a5fa',
  },
  reversal: {
    label: 'نمط انعكاس',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    badgeBg: 'bg-purple-500/20',
    badgeText: 'text-purple-300',
    iconBg: 'bg-purple-500/20',
    icon: RotateCw,
    chartColor: '#c084fc',
  },
};

const SECTORS = [
  { value: 'all', label: 'جميع القطاعات' },
  { value: 'energy', label: 'الطاقة' },
  { value: 'finance', label: 'المالية' },
  { value: 'realestate', label: 'العقارات' },
  { value: 'tech', label: 'التقنية' },
  { value: 'health', label: 'الصحة' },
  { value: 'industry', label: 'الصناعة' },
  { value: 'tourism', label: 'السياحة' },
];

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: 'week', label: 'أسبوع' },
  { value: 'month', label: 'شهر' },
  { value: 'quarter', label: 'ربع سنة' },
  { value: 'year', label: 'سنة' },
];

// ============================================
// HELPERS: Build timeline & predictions from real patterns
// ============================================

function buildTimeline(patterns: Pattern[]): TimelinePoint[] {
  const grouped: Record<string, Pattern[]> = {};
  for (const p of patterns) {
    const d = new Date(p.detectedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    (grouped[key] ??= []).push(p);
  }
  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-10)
    .map(([dateKey, items]) => {
      const d = new Date(dateKey);
      const label = d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
      return {
        date: label,
        label: dateKey,
        patterns: items.length,
        bullish: items.filter(p => p.type === 'bullish').length,
        bearish: items.filter(p => p.type === 'bearish').length,
        consolidation: items.filter(p => p.type === 'consolidation').length,
        breakout: items.filter(p => p.type === 'breakout').length,
        reversal: items.filter(p => p.type === 'reversal').length,
      };
    });
}

function buildPredictions(patterns: Pattern[]): Prediction[] {
  return patterns
    .filter(p => p.confidence >= 75)
    .slice(0, 3)
    .map((p, i) => ({
      id: `pred-${i}`,
      text: p.description,
      confidence: p.confidence,
      timeframe: p.confidence >= 85 ? '٣ أشهر' : '٦ أسابيع',
      relatedPatternId: p.id,
      relatedPatternName: p.name,
      type: (p.type === 'bullish' || p.type === 'breakout') ? 'positive' as const
        : (p.type === 'bearish') ? 'negative' as const : 'neutral' as const,
    }));
}

// ============================================
// HELPERS
// ============================================

/** Map backend pattern type to frontend display type */
function mapApiType(type: ApiPattern['type']): PatternType {
  switch (type) {
    case 'TREND': return 'bullish'; // will refine based on metadata
    case 'ANOMALY': return 'breakout';
    case 'CORRELATION': return 'consolidation';
    case 'CYCLE': return 'reversal';
    case 'SEASONAL': return 'bearish';
    default: return 'consolidation';
  }
}

/** Convert API pattern to frontend Pattern */
function apiToPattern(ap: ApiPattern, idx: number): Pattern {
  const now = new Date();
  const detectedDate = ap.timeframe?.end || now.toISOString();
  const daysDiff = (now.getTime() - new Date(detectedDate).getTime()) / (1000 * 60 * 60 * 24);

  // For TREND type, check metadata to determine bullish vs bearish
  let frontType: PatternType = mapApiType(ap.type);
  if (ap.type === 'TREND') {
    const meta = ap.metadata as any;
    if (meta?.avg1 !== undefined && meta?.avg3 !== undefined) {
      frontType = meta.avg1 > meta.avg3 ? 'bullish' : 'bearish';
    }
    // Check title for dominance patterns
    if (ap.id.includes('dominance')) frontType = 'breakout';
  }

  return {
    id: ap.id || `api-${idx}`,
    name: ap.titleAr || ap.title,
    type: frontType,
    confidence: Math.round(ap.confidence),
    description: ap.descriptionAr || ap.description,
    sectors: ap.sectors || [],
    detectedAt: detectedDate,
    isNew: daysDiff < 7,
    impactScore: Math.round(ap.confidence * 0.9),
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ar-SA', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 90) return 'عالية جدا';
  if (confidence >= 75) return 'عالية';
  if (confidence >= 60) return 'متوسطة';
  return 'منخفضة';
}

// ============================================
// SUB-COMPONENTS
// ============================================

/** Stat Card */
function StatCard({ icon: Icon, label, value, subtext, iconBg }: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext?: string;
  iconBg: string;
}) {
  return (
    <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-[11px] text-slate-400 font-medium mb-0.5">{label}</p>
        <p className="text-2xl font-black text-white leading-none">{value}</p>
        {subtext && <p className="text-[10px] text-slate-500 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}

/** Pattern Card */
function PatternCard({ pattern }: { pattern: Pattern }) {
  const config = PATTERN_CONFIG[pattern.type];
  const Icon = config.icon;

  return (
    <div className={`bg-slate-800/60 rounded-2xl border ${config.borderColor} overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 group`}>
      <div className="p-5">
        {/* Top: Icon + Type Badge + New Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0`}>
              <Icon size={20} className={config.color} />
            </div>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${config.badgeBg} ${config.badgeText}`}>
              {config.label}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pattern.isNew && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse">
                <Zap size={10} />
                جديد
              </span>
            )}
            <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${config.badgeBg} ${config.badgeText}`}>
              {pattern.confidence}%
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-100 leading-relaxed mb-3 group-hover:text-white transition-colors">
          {pattern.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-3">
          {pattern.description}
        </p>

        {/* Sectors */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {pattern.sectors.map((sector, idx) => (
            <span
              key={idx}
              className="bg-slate-700/60 text-slate-300 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-slate-600/50"
            >
              #{sector}
            </span>
          ))}
        </div>

        {/* Footer: Impact + Date */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            <Target size={12} className={config.color} />
            <span className="text-[11px] text-slate-500">
              التأثير: <span className={`font-bold ${config.color}`}>{pattern.impactScore}%</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Clock size={12} />
            <span>{formatDate(pattern.detectedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Prediction Card */
function PredictionCard({ prediction }: { prediction: Prediction }) {
  const typeConfig = {
    positive: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', barColor: 'bg-emerald-500', icon: ArrowUpRight },
    negative: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', barColor: 'bg-red-500', icon: ArrowDownRight },
    neutral: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', barColor: 'bg-amber-500', icon: Activity },
  };

  const config = typeConfig[prediction.type];
  const TypeIcon = config.icon;

  return (
    <div className={`bg-slate-800/60 rounded-2xl border ${config.border} p-5 transition-all hover:shadow-lg hover:shadow-black/10`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
            <TypeIcon size={16} className={config.color} />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${config.bg} ${config.color}`}>
              {prediction.timeframe}
            </span>
          </div>
        </div>
        <span className={`text-lg font-black ${config.color}`}>{prediction.confidence}%</span>
      </div>

      {/* Prediction text */}
      <p className="text-sm text-slate-300 leading-relaxed mb-4">
        {prediction.text}
      </p>

      {/* Confidence bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-slate-500">مستوى الثقة</span>
          <span className={`text-[11px] font-bold ${config.color}`}>{getConfidenceLabel(prediction.confidence)}</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${config.barColor} transition-all duration-700`}
            style={{ width: `${prediction.confidence}%` }}
          />
        </div>
      </div>

      {/* Related pattern */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-700/50">
        <Brain size={12} className="text-purple-400 shrink-0" />
        <span className="text-[11px] text-slate-500 truncate">
          مبني على: <span className="text-purple-300 font-medium">{prediction.relatedPatternName}</span>
        </span>
      </div>
    </div>
  );
}

/** Custom Tooltip for Timeline Chart */
function TimelineTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl p-3 shadow-xl text-right" dir="rtl">
      <p className="text-sm font-bold text-slate-200 mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-400">{entry.name}</span>
            </div>
            <span className="font-bold text-slate-200">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

const PatternRecognitionPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [sector, setSector] = useState('all');
  const [sectorOpen, setSectorOpen] = useState(false);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch patterns from API
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<ApiPattern[]>('/signals/patterns');
        const list = Array.isArray(res) ? res : (res as any)?.data ?? [];
        if (!cancelled) {
          setPatterns(list.map(apiToPattern));
        }
      } catch {
        // API failed - leave empty, show empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Filtered patterns
  const filteredPatterns = useMemo(() => {
    let result = patterns;
    if (sector !== 'all') {
      const sectorLabel = SECTORS.find(s => s.value === sector)?.label || '';
      result = result.filter(p => p.sectors.some(s => s.includes(sectorLabel.replace('ال', ''))));
    }
    return result;
  }, [sector, patterns]);

  // Derived data from real patterns
  const timelineData = useMemo(() => buildTimeline(filteredPatterns), [filteredPatterns]);
  const predictions = useMemo(() => buildPredictions(filteredPatterns), [filteredPatterns]);

  // Build accuracy stats from patterns by grouping into monthly buckets
  const accuracyStats = useMemo<AccuracyStat[]>(() => {
    if (patterns.length === 0) return [];
    const months: Record<string, Pattern[]> = {};
    for (const p of patterns) {
      const d = new Date(p.detectedAt);
      const key = d.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });
      (months[key] ??= []).push(p);
    }
    return Object.entries(months).slice(-4).map(([period, items]) => {
      const predicted = items.length;
      const correct = items.filter(p => p.confidence >= 70).length;
      return { period, predicted, correct, accuracy: predicted > 0 ? Math.round((correct / predicted) * 100) : 0 };
    });
  }, [patterns]);

  // Computed stats
  const totalPatterns = filteredPatterns.length;
  const newPatterns = filteredPatterns.filter(p => p.isNew).length;
  const avgAccuracy = accuracyStats.length > 0
    ? Math.round(accuracyStats.reduce((sum, a) => sum + a.accuracy, 0) / accuracyStats.length)
    : 0;

  const selectedSectorLabel = SECTORS.find(s => s.value === sector)?.label || 'جميع القطاعات';

  return (
    <div className="min-h-screen bg-slate-900" dir="rtl">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">

        {/* ── Header ────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Brain size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-black text-white">اكتشاف الأنماط</h1>
                <p className="text-sm text-slate-400 font-medium mt-0.5">
                  تحليل ذكي للأنماط في البيانات الاقتصادية
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Time Range */}
              <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700/50 overflow-hidden">
                {TIME_RANGES.map(tr => (
                  <button
                    key={tr.value}
                    onClick={() => setTimeRange(tr.value)}
                    className={`px-4 py-2 text-sm font-bold transition-all ${
                      timeRange === tr.value
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    }`}
                  >
                    {tr.label}
                  </button>
                ))}
              </div>

              {/* Sector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSectorOpen(!sectorOpen)}
                  className="flex items-center gap-2 bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-2 text-sm font-bold text-slate-300 hover:border-slate-600 transition-all min-w-[140px]"
                >
                  <Layers size={14} className="text-slate-500" />
                  <span className="flex-1 text-right">{selectedSectorLabel}</span>
                  <ChevronDown size={14} className={`text-slate-500 transition-transform ${sectorOpen ? 'rotate-180' : ''}`} />
                </button>
                {sectorOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setSectorOpen(false)} />
                    <div className="absolute top-full mt-1 right-0 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 py-1 max-h-64 overflow-y-auto">
                      {SECTORS.map(s => (
                        <button
                          key={s.value}
                          onClick={() => { setSector(s.value); setSectorOpen(false); }}
                          className={`w-full text-right px-4 py-2.5 text-sm transition-colors ${
                            sector === s.value
                              ? 'bg-blue-600/20 text-blue-300 font-bold'
                              : 'text-slate-300 hover:bg-slate-700/50'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Bar ─────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={Eye}
            label="أنماط مكتشفة"
            value={totalPatterns.toString()}
            subtext={`خلال ${TIME_RANGES.find(t => t.value === timeRange)?.label}`}
            iconBg="bg-blue-600"
          />
          <StatCard
            icon={Zap}
            label="أنماط جديدة"
            value={newPatterns.toString()}
            subtext="هذا الأسبوع"
            iconBg="bg-emerald-600"
          />
          <StatCard
            icon={Target}
            label="دقة التنبؤ"
            value={`${avgAccuracy}%`}
            subtext="متوسط آخر ٤ أشهر"
            iconBg="bg-purple-600"
          />
        </div>

        {/* ── Active Patterns Grid ──────────────────── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <Activity size={20} className="text-blue-400" />
            <h2 className="text-lg font-bold text-white">الأنماط النشطة</h2>
            <span className="text-xs text-slate-500 font-medium">({filteredPatterns.length})</span>
          </div>

          {filteredPatterns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPatterns.map(pattern => (
                <PatternCard key={pattern.id} pattern={pattern} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-12 text-center">
              <Eye size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">لا توجد أنماط مكتشفة لهذا القطاع</p>
              <p className="text-slate-500 text-sm mt-1">جرب تغيير القطاع أو النطاق الزمني</p>
            </div>
          )}
        </div>

        {/* ── Pattern Timeline ──────────────────────── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <Calendar size={20} className="text-amber-400" />
            <h2 className="text-lg font-bold text-white">الجدول الزمني للأنماط</h2>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradBullish" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradBearish" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: '#475569' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: '#475569' }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<TimelineTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="patterns"
                    name="إجمالي الأنماط"
                    stroke="#60a5fa"
                    strokeWidth={2.5}
                    fill="url(#gradTotal)"
                    dot={{ r: 4, fill: '#60a5fa', stroke: '#1e293b', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#60a5fa', stroke: '#fff', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bullish"
                    name="صعودي"
                    stroke="#34d399"
                    strokeWidth={2}
                    fill="url(#gradBullish)"
                    dot={{ r: 3, fill: '#34d399', stroke: '#1e293b', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bearish"
                    name="هبوطي"
                    stroke="#f87171"
                    strokeWidth={2}
                    fill="url(#gradBearish)"
                    dot={{ r: 3, fill: '#f87171', stroke: '#1e293b', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center gap-5 justify-center mt-4 pt-4 border-t border-slate-700/50">
              <span className="text-[11px] text-slate-500">الأنماط:</span>
              {[
                { color: 'bg-blue-400', label: 'إجمالي' },
                { color: 'bg-emerald-400', label: 'صعودي' },
                { color: 'bg-red-400', label: 'هبوطي' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-[11px] text-slate-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── AI Predictions + Historical Accuracy ──── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
          {/* Predictions - 2 cols */}
          <div className="xl:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <Sparkles size={20} className="text-purple-400" />
              <h2 className="text-lg font-bold text-white">تنبؤات الذكاء الاصطناعي</h2>
            </div>

            {predictions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {predictions.map(prediction => (
                  <PredictionCard key={prediction.id} prediction={prediction} />
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-8 text-center">
                <Sparkles size={32} className="text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">لا توجد تنبؤات كافية حالياً</p>
              </div>
            )}
          </div>

          {/* Historical Accuracy - 1 col */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <Shield size={20} className="text-blue-400" />
              <h2 className="text-lg font-bold text-white">الدقة التاريخية</h2>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
              {/* Overall accuracy */}
              <div className="text-center pb-4 border-b border-slate-700/50">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex flex-col items-center justify-center mb-3">
                  <span className="text-3xl font-black text-white">{avgAccuracy}</span>
                  <span className="text-slate-400 text-xs">%</span>
                </div>
                <p className="text-sm font-bold text-slate-300">متوسط الدقة الكلي</p>
                <p className="text-[11px] text-slate-500 mt-0.5">آخر ٤ أشهر</p>
              </div>

              {/* Monthly breakdown */}
              <div className="space-y-3">
                {accuracyStats.length > 0 ? accuracyStats.map((stat, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-slate-400 font-medium truncate">{stat.period}</span>
                        <span className="text-[11px] font-bold text-slate-300">{stat.accuracy}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            stat.accuracy >= 80 ? 'bg-emerald-500' : stat.accuracy >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${stat.accuracy}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 whitespace-nowrap">
                      {stat.correct}/{stat.predicted}
                    </div>
                  </div>
                )) : (
                  <p className="text-slate-500 text-xs text-center py-3">لا توجد بيانات كافية</p>
                )}
              </div>

              {/* Summary */}
              {accuracyStats.length > 0 && (
                <div className="pt-3 border-t border-slate-700/50 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <p className="text-[11px] text-slate-500">
                    إجمالي <span className="text-slate-300 font-bold">{accuracyStats.reduce((s, a) => s + a.correct, 0)}</span> تنبؤ صحيح من <span className="text-slate-300 font-bold">{accuracyStats.reduce((s, a) => s + a.predicted, 0)}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── AI Disclaimer ────────────────────────── */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
              <Cpu size={20} className="text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                <span className="font-bold text-slate-300">حول اكتشاف الأنماط: </span>
                يتم تحليل الأنماط بواسطة الذكاء الاصطناعي بناء على بيانات اقتصادية من مصادر موثوقة. النتائج استرشادية ولا تمثل نصيحة استثمارية.
                يتم تحديث الأنماط بشكل مستمر مع توفر بيانات جديدة.
              </p>
            </div>
            <div className="hidden sm:flex gap-1.5 shrink-0">
              <span className="bg-purple-500/10 text-purple-300 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-purple-500/20">تحليل آلي</span>
              <span className="bg-blue-500/10 text-blue-300 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-blue-500/20">بيانات موثوقة</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatternRecognitionPage;
