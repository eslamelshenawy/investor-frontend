/**
 * ================================================
 * PATTERN RECOGNITION PAGE - اكتشاف الأنماط بالذكاء الاصطناعي
 * ================================================
 *
 * صفحة تعرض الأنماط المكتشفة في البيانات الاقتصادية
 * AI-detected patterns in economic data with timeline and predictions
 */

import React, { useState, useMemo } from 'react';
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

// ============================================
// TYPES
// ============================================

type PatternType = 'bullish' | 'bearish' | 'consolidation' | 'breakout' | 'reversal';
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
// MOCK DATA
// ============================================

const MOCK_PATTERNS: Pattern[] = [
  {
    id: 'p1',
    name: 'صعود متسارع في قطاع الطاقة المتجددة',
    type: 'bullish',
    confidence: 92,
    description: 'رصد الذكاء الاصطناعي نمطا صعوديا قويا في مؤشرات قطاع الطاقة المتجددة، مدفوعا بزيادة الاستثمارات الحكومية وارتفاع الطلب العالمي. يتوقع استمرار هذا الاتجاه خلال الربع القادم.',
    sectors: ['الطاقة', 'الصناعة'],
    detectedAt: '2026-02-05T14:30:00',
    isNew: true,
    impactScore: 88,
  },
  {
    id: 'p2',
    name: 'تراجع في مؤشرات التجزئة التقليدية',
    type: 'bearish',
    confidence: 78,
    description: 'تشير البيانات إلى تراجع ملحوظ في أداء قطاع التجزئة التقليدي مع تحول المستهلكين نحو التجارة الإلكترونية. النمط يتسق مع اتجاهات عالمية مماثلة.',
    sectors: ['التجزئة', 'التقنية'],
    detectedAt: '2026-02-04T09:15:00',
    isNew: true,
    impactScore: 72,
  },
  {
    id: 'p3',
    name: 'تذبذب في سوق العقارات السكنية',
    type: 'consolidation',
    confidence: 85,
    description: 'يمر سوق العقارات السكنية بمرحلة تذبذب بين مستويات دعم ومقاومة واضحة. الأسعار تتحرك في نطاق ضيق مع ترقب لقرارات التمويل العقاري.',
    sectors: ['العقارات', 'المالية'],
    detectedAt: '2026-02-03T16:45:00',
    isNew: false,
    impactScore: 65,
  },
  {
    id: 'p4',
    name: 'اختراق صعودي في التقنية المالية',
    type: 'breakout',
    confidence: 88,
    description: 'تجاوز قطاع التقنية المالية مستوى مقاومة رئيسيا مع تزايد عمليات الدفع الرقمي وإطلاق منتجات جديدة من البنوك الرقمية. حجم التداول يدعم هذا الاختراق.',
    sectors: ['التقنية', 'المالية'],
    detectedAt: '2026-02-02T11:20:00',
    isNew: false,
    impactScore: 81,
  },
  {
    id: 'p5',
    name: 'انعكاس إيجابي في السياحة والضيافة',
    type: 'reversal',
    confidence: 74,
    description: 'بعد فترة من التراجع، يظهر قطاع السياحة والضيافة علامات انعكاس إيجابي مع ارتفاع أعداد الزوار وزيادة الحجوزات الفندقية بشكل ملحوظ.',
    sectors: ['السياحة', 'العقارات'],
    detectedAt: '2026-02-01T08:00:00',
    isNew: false,
    impactScore: 69,
  },
  {
    id: 'p6',
    name: 'نمو مستمر في قطاع الصحة الرقمية',
    type: 'bullish',
    confidence: 83,
    description: 'يستمر قطاع الصحة الرقمية في تحقيق معدلات نمو مرتفعة مع التوسع في خدمات الطب عن بعد وتبني تقنيات الذكاء الاصطناعي في التشخيص.',
    sectors: ['الصحة', 'التقنية'],
    detectedAt: '2026-01-30T13:10:00',
    isNew: false,
    impactScore: 76,
  },
  {
    id: 'p7',
    name: 'ضغط على أسهم شركات الاتصالات',
    type: 'bearish',
    confidence: 71,
    description: 'تتعرض شركات الاتصالات لضغوط تنافسية متزايدة مع انخفاض هوامش الربح وارتفاع تكاليف البنية التحتية لشبكات الجيل الخامس.',
    sectors: ['التقنية'],
    detectedAt: '2026-01-28T10:45:00',
    isNew: false,
    impactScore: 58,
  },
  {
    id: 'p8',
    name: 'اختراق في قطاع التعدين والمعادن',
    type: 'breakout',
    confidence: 79,
    description: 'يشهد قطاع التعدين والمعادن اختراقا مدعوما بارتفاع أسعار المعادن النادرة وزيادة الطلب على مواد تصنيع البطاريات.',
    sectors: ['الصناعة', 'الطاقة'],
    detectedAt: '2026-01-25T15:30:00',
    isNew: false,
    impactScore: 73,
  },
];

const MOCK_TIMELINE: TimelinePoint[] = [
  { date: '٢٥ يناير', label: '25 Jan', patterns: 2, bullish: 0, bearish: 1, consolidation: 0, breakout: 1, reversal: 0 },
  { date: '٢٧ يناير', label: '27 Jan', patterns: 1, bullish: 0, bearish: 0, consolidation: 1, breakout: 0, reversal: 0 },
  { date: '٢٨ يناير', label: '28 Jan', patterns: 2, bullish: 1, bearish: 1, consolidation: 0, breakout: 0, reversal: 0 },
  { date: '٣٠ يناير', label: '30 Jan', patterns: 3, bullish: 1, bearish: 0, consolidation: 1, breakout: 0, reversal: 1 },
  { date: '١ فبراير', label: '1 Feb', patterns: 2, bullish: 0, bearish: 0, consolidation: 0, breakout: 1, reversal: 1 },
  { date: '٢ فبراير', label: '2 Feb', patterns: 3, bullish: 1, bearish: 1, consolidation: 0, breakout: 1, reversal: 0 },
  { date: '٣ فبراير', label: '3 Feb', patterns: 2, bullish: 0, bearish: 0, consolidation: 1, breakout: 0, reversal: 1 },
  { date: '٤ فبراير', label: '4 Feb', patterns: 4, bullish: 2, bearish: 1, consolidation: 0, breakout: 1, reversal: 0 },
  { date: '٥ فبراير', label: '5 Feb', patterns: 3, bullish: 1, bearish: 0, consolidation: 1, breakout: 1, reversal: 0 },
  { date: '٦ فبراير', label: '6 Feb', patterns: 5, bullish: 2, bearish: 1, consolidation: 1, breakout: 0, reversal: 1 },
];

const MOCK_PREDICTIONS: Prediction[] = [
  {
    id: 'pred1',
    text: 'من المتوقع أن يستمر قطاع الطاقة المتجددة في تحقيق مكاسب بنسبة ١٥-٢٠٪ خلال الربع القادم، مدعوما بسياسات رؤية ٢٠٣٠ وزيادة الاستثمارات الخضراء.',
    confidence: 87,
    timeframe: '٣ أشهر',
    relatedPatternId: 'p1',
    relatedPatternName: 'صعود متسارع في قطاع الطاقة المتجددة',
    type: 'positive',
  },
  {
    id: 'pred2',
    text: 'يتوقع الذكاء الاصطناعي انتهاء مرحلة التذبذب في سوق العقارات السكنية خلال ٤-٦ أسابيع مع اتجاه صعودي محتمل بعد قرارات التمويل المنتظرة.',
    confidence: 72,
    timeframe: '٦ أسابيع',
    relatedPatternId: 'p3',
    relatedPatternName: 'تذبذب في سوق العقارات السكنية',
    type: 'neutral',
  },
  {
    id: 'pred3',
    text: 'قطاع التقنية المالية مرشح لاستمرار الصعود مع احتمال تصحيح طفيف بنسبة ٥-٧٪ قبل استئناف الاتجاه الصاعد. الأهداف السعرية تبقى إيجابية.',
    confidence: 81,
    timeframe: 'شهرين',
    relatedPatternId: 'p4',
    relatedPatternName: 'اختراق صعودي في التقنية المالية',
    type: 'positive',
  },
];

const MOCK_ACCURACY: AccuracyStat[] = [
  { period: 'يناير ٢٠٢٦', predicted: 24, correct: 19, accuracy: 79 },
  { period: 'ديسمبر ٢٠٢٥', predicted: 31, correct: 26, accuracy: 84 },
  { period: 'نوفمبر ٢٠٢٥', predicted: 28, correct: 22, accuracy: 79 },
  { period: 'أكتوبر ٢٠٢٥', predicted: 22, correct: 17, accuracy: 77 },
];

// ============================================
// HELPERS
// ============================================

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

  // Filtered patterns
  const filteredPatterns = useMemo(() => {
    let result = MOCK_PATTERNS;
    if (sector !== 'all') {
      const sectorLabel = SECTORS.find(s => s.value === sector)?.label || '';
      result = result.filter(p => p.sectors.some(s => s.includes(sectorLabel.replace('ال', ''))));
    }
    return result;
  }, [sector]);

  // Computed stats
  const totalPatterns = filteredPatterns.length;
  const newPatterns = filteredPatterns.filter(p => p.isNew).length;
  const avgAccuracy = Math.round(MOCK_ACCURACY.reduce((sum, a) => sum + a.accuracy, 0) / MOCK_ACCURACY.length);

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
                <AreaChart data={MOCK_TIMELINE} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {MOCK_PREDICTIONS.map(prediction => (
                <PredictionCard key={prediction.id} prediction={prediction} />
              ))}
            </div>
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
                {MOCK_ACCURACY.map((stat, idx) => (
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
                ))}
              </div>

              {/* Summary */}
              <div className="pt-3 border-t border-slate-700/50 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <p className="text-[11px] text-slate-500">
                  إجمالي <span className="text-slate-300 font-bold">{MOCK_ACCURACY.reduce((s, a) => s + a.correct, 0)}</span> تنبؤ صحيح من <span className="text-slate-300 font-bold">{MOCK_ACCURACY.reduce((s, a) => s + a.predicted, 0)}</span>
                </p>
              </div>
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
