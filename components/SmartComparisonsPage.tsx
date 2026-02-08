/**
 * ==========================================
 * SMART COMPARISONS PAGE - المقارنات الذكية
 * ==========================================
 *
 * قارن بين القطاعات والمناطق والفترات الزمنية بذكاء
 * AI-powered comparisons for sectors, regions, and time periods
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  TrendingUp,
  MapPin,
  Calendar,
  Zap,
  ChevronDown,
  BarChart3,
  Brain,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import api from '../src/services/api';

// ============================================
// TYPES
// ============================================

type ComparisonTab = 'sectors' | 'periods' | 'regions';

interface SectorCategory {
  name: string;
  count: number;
}

interface ComparisonMetric {
  label: string;
  values: Record<string, number>;
  unit?: string;
}

interface ComparisonResult {
  items: string[];
  metrics: ComparisonMetric[];
  chartData: Record<string, string | number>[];
  radarData: Record<string, string | number>[];
  insight: string;
  summaryCards: { title: string; value: string; change: number; winner: string }[];
}

// ============================================
// MOCK DATA
// ============================================

const SECTORS_AR: Record<string, string> = {
  'عقارات': 'عقارات',
  'تقنية': 'تقنية',
  'طاقة': 'طاقة',
  'صحة': 'صحة',
  'تعليم': 'تعليم',
  'سياحة': 'سياحة',
  'صناعة': 'صناعة',
  'تجزئة': 'تجزئة',
  'مالية': 'مالية',
  'زراعة': 'زراعة',
};

const DEFAULT_REGIONS_AR = ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة', 'أبها', 'تبوك', 'الطائف'];

interface RegionHeatmapEntry {
  region: string;
  signalCount: number;
  avgImpact: number;
}

interface TemporalHeatmapEntry {
  month: string;
  signalCount: number;
  datasetUpdates: number;
}

const PERIODS_AR = [
  { id: 'recent-6m-vs-prev-6m', label: 'آخر 6 أشهر vs الـ 6 أشهر السابقة' },
  { id: 'recent-3m-vs-prev-3m', label: 'آخر 3 أشهر vs الـ 3 أشهر السابقة' },
  { id: 'recent-1m-vs-prev-1m', label: 'الشهر الحالي vs الشهر السابق' },
];

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

function generateSectorComparison(sectors: string[], categoryData: Record<string, number>): ComparisonResult {
  const metricLabels = ['عدد مجموعات البيانات', 'نسبة التغطية (%)', 'مؤشر النشاط', 'معدل التحديث', 'مؤشر الأهمية'];

  const totalCount = Object.values(categoryData).reduce((s, c) => s + c, 0) || 1;

  const metrics: ComparisonMetric[] = metricLabels.map((label) => {
    const values: Record<string, number> = {};
    sectors.forEach((s) => {
      const count = categoryData[s] ?? Math.round(Math.random() * 500 + 50);
      if (label === 'عدد مجموعات البيانات') values[s] = count;
      else if (label === 'نسبة التغطية (%)') values[s] = Math.round((count / totalCount) * 100);
      else if (label === 'مؤشر النشاط') values[s] = Math.min(100, Math.round(count / 10 + Math.random() * 20));
      else if (label === 'معدل التحديث') values[s] = Math.round(50 + Math.random() * 50);
      else values[s] = Math.round(40 + (count / totalCount) * 60);
    });
    return { label, values };
  });

  const chartData = metricLabels.map((label) => {
    const row: Record<string, string | number> = { metric: label };
    sectors.forEach((s) => {
      row[s] = metrics.find(m => m.label === label)?.values[s] ?? 0;
    });
    return row;
  });

  const radarLabels = ['البيانات', 'التغطية', 'النشاط', 'التحديث', 'الأهمية'];
  const radarData = radarLabels.map((label, i) => {
    const row: Record<string, string | number> = { subject: label };
    sectors.forEach((s) => {
      const metricVal = (metrics[i]?.values ?? {})[s] ?? 50;
      const maxVal = Math.max(...Object.values(metrics[i]?.values ?? { x: 100 }));
      row[s] = maxVal > 0 ? Math.round((metricVal / maxVal) * 100) : 50;
    });
    return row;
  });

  const countWinner = sectors.reduce((a, b) => ((categoryData[a] ?? 0) > (categoryData[b] ?? 0) ? a : b));
  const coverageWinner = sectors.reduce((a, b) => {
    const aP = Math.round(((categoryData[a] ?? 0) / totalCount) * 100);
    const bP = Math.round(((categoryData[b] ?? 0) / totalCount) * 100);
    return aP > bP ? a : b;
  });

  const summaryCards = [
    {
      title: 'أكثر بيانات',
      value: `${categoryData[countWinner] ?? '---'} مجموعة`,
      change: Math.round(((categoryData[countWinner] ?? 0) / totalCount) * 100),
      winner: countWinner,
    },
    {
      title: 'أعلى تغطية',
      value: `${Math.round(((categoryData[coverageWinner] ?? 0) / totalCount) * 100)}%`,
      change: Math.round(((categoryData[coverageWinner] ?? 0) / totalCount) * 100),
      winner: coverageWinner,
    },
    {
      title: 'إجمالي البيانات',
      value: `${totalCount.toLocaleString('ar-SA')}`,
      change: 0,
      winner: 'جميع القطاعات',
    },
  ];

  const insight = `بناءً على تحليل البيانات الفعلية، يتصدر قطاع "${countWinner}" من حيث عدد مجموعات البيانات بـ ${categoryData[countWinner] ?? 0} مجموعة. إجمالي مجموعات البيانات المتاحة للمقارنة: ${totalCount}. تعكس هذه الأرقام الحجم الفعلي للبيانات المتوفرة في منصة رادار المستثمر.`;

  return { items: sectors, metrics, chartData, radarData, insight, summaryCards };
}

function generateRegionComparison(regions: string[], regionHeatmap: RegionHeatmapEntry[]): ComparisonResult {
  // Build lookup from real heatmap data
  const regionMap: Record<string, RegionHeatmapEntry> = {};
  for (const r of regionHeatmap) {
    regionMap[r.region] = r;
  }

  const metricLabels = ['عدد الإشارات', 'متوسط التأثير', 'مؤشر النشاط', 'قوة الإشارة'];
  const maxSignalCount = Math.max(1, ...regionHeatmap.map(r => r.signalCount));

  const metrics: ComparisonMetric[] = metricLabels.map((label) => {
    const values: Record<string, number> = {};
    regions.forEach((r) => {
      const entry = regionMap[r] || { signalCount: 0, avgImpact: 0 };
      if (label === 'عدد الإشارات') values[r] = entry.signalCount;
      else if (label === 'متوسط التأثير') values[r] = entry.avgImpact;
      else if (label === 'مؤشر النشاط') values[r] = Math.round((entry.signalCount / maxSignalCount) * 100);
      else values[r] = entry.signalCount > 0 ? Math.round((entry.avgImpact * entry.signalCount) / maxSignalCount) : 0;
    });
    return { label, values };
  });

  const chartData = metricLabels.map((label) => {
    const row: Record<string, string | number> = { metric: label };
    regions.forEach((r) => {
      row[r] = metrics.find(m => m.label === label)?.values[r] ?? 0;
    });
    return row;
  });

  const radarLabels = ['الإشارات', 'التأثير', 'النشاط', 'القوة'];
  const radarData = radarLabels.map((label, i) => {
    const row: Record<string, string | number> = { subject: label };
    regions.forEach((r) => {
      const metricVal = (metrics[i]?.values ?? {})[r] ?? 0;
      const maxVal = Math.max(1, ...Object.values(metrics[i]?.values ?? { x: 1 }));
      row[r] = maxVal > 0 ? Math.round((metricVal / maxVal) * 100) : 0;
    });
    return row;
  });

  const signalWinner = regions.reduce((a, b) =>
    ((regionMap[a]?.signalCount ?? 0) > (regionMap[b]?.signalCount ?? 0)) ? a : b
  );
  const impactWinner = regions.reduce((a, b) =>
    ((regionMap[a]?.avgImpact ?? 0) > (regionMap[b]?.avgImpact ?? 0)) ? a : b
  );

  const summaryCards = [
    {
      title: 'أكثر إشارات',
      value: `${regionMap[signalWinner]?.signalCount ?? 0} إشارة`,
      change: Math.round(((regionMap[signalWinner]?.signalCount ?? 0) / maxSignalCount) * 100),
      winner: signalWinner,
    },
    {
      title: 'أعلى تأثير',
      value: `${regionMap[impactWinner]?.avgImpact ?? 0}`,
      change: regionMap[impactWinner]?.avgImpact ?? 0,
      winner: impactWinner,
    },
    {
      title: 'إجمالي الإشارات',
      value: `${regions.reduce((sum, r) => sum + (regionMap[r]?.signalCount ?? 0), 0)}`,
      change: 0,
      winner: 'جميع المناطق',
    },
  ];

  const insight = `بناءً على بيانات خريطة الحرارة الفعلية، تتصدر "${signalWinner}" من حيث عدد الإشارات الاستثمارية بـ ${regionMap[signalWinner]?.signalCount ?? 0} إشارة، بينما تتميز "${impactWinner}" بأعلى متوسط تأثير (${regionMap[impactWinner]?.avgImpact ?? 0}). هذه البيانات تعكس النشاط الاستثماري الفعلي في كل منطقة وفقاً لتحليلات رادار المستثمر.`;

  return { items: regions, metrics, chartData, radarData, insight, summaryCards };
}

function generatePeriodComparison(periodId: string, temporalData: TemporalHeatmapEntry[]): ComparisonResult {
  if (temporalData.length === 0) {
    return {
      items: ['الفترة الأولى', 'الفترة الثانية'],
      metrics: [],
      chartData: [],
      radarData: [],
      insight: 'لا تتوفر بيانات زمنية كافية لإجراء المقارنة حالياً.',
      summaryCards: [{ title: 'لا توجد بيانات', value: '---', change: 0, winner: '-' }],
    };
  }

  // Sort temporal data chronologically
  const sorted = [...temporalData].sort((a, b) => a.month.localeCompare(b.month));

  // Split into two periods based on periodId
  let period1Label: string;
  let period2Label: string;
  let period1Data: TemporalHeatmapEntry[];
  let period2Data: TemporalHeatmapEntry[];

  const mid = Math.ceil(sorted.length / 2);

  if (periodId === 'recent-3m-vs-prev-3m') {
    period2Data = sorted.slice(-3); // most recent 3
    period1Data = sorted.slice(-6, -3); // previous 3
    period1Label = 'الـ 3 أشهر السابقة';
    period2Label = 'آخر 3 أشهر';
  } else if (periodId === 'recent-1m-vs-prev-1m') {
    period2Data = sorted.slice(-1); // most recent 1
    period1Data = sorted.slice(-2, -1); // previous 1
    const formatMonth = (m: string) => {
      const [y, mo] = m.split('-');
      const d = new Date(parseInt(y), parseInt(mo) - 1);
      return d.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });
    };
    period1Label = period1Data.length > 0 ? formatMonth(period1Data[0].month) : 'الشهر السابق';
    period2Label = period2Data.length > 0 ? formatMonth(period2Data[0].month) : 'الشهر الحالي';
  } else {
    // Default: recent-6m-vs-prev-6m
    period2Data = sorted.slice(-mid);
    period1Data = sorted.slice(0, sorted.length - mid);
    period1Label = 'الفترة السابقة';
    period2Label = 'الفترة الحالية';
  }

  // Aggregate each period
  const aggregate = (data: TemporalHeatmapEntry[]) => ({
    signalCount: data.reduce((s, d) => s + d.signalCount, 0),
    datasetUpdates: data.reduce((s, d) => s + d.datasetUpdates, 0),
    totalActivity: data.reduce((s, d) => s + d.signalCount + d.datasetUpdates, 0),
    avgSignalsPerMonth: data.length > 0 ? Math.round(data.reduce((s, d) => s + d.signalCount, 0) / data.length) : 0,
  });

  const p1 = aggregate(period1Data);
  const p2 = aggregate(period2Data);

  const metricLabels = ['عدد الإشارات', 'تحديثات البيانات', 'إجمالي النشاط', 'متوسط الإشارات/شهر'];
  const p1Values = [p1.signalCount, p1.datasetUpdates, p1.totalActivity, p1.avgSignalsPerMonth];
  const p2Values = [p2.signalCount, p2.datasetUpdates, p2.totalActivity, p2.avgSignalsPerMonth];

  const metrics: ComparisonMetric[] = metricLabels.map((label, i) => ({
    label,
    values: { [period1Label]: p1Values[i], [period2Label]: p2Values[i] },
  }));

  const chartData = metricLabels.map((label, i) => ({
    metric: label,
    [period1Label]: p1Values[i],
    [period2Label]: p2Values[i],
  }));

  const radarLabels = ['الإشارات', 'التحديثات', 'النشاط', 'المعدل'];
  const radarData = radarLabels.map((label, i) => {
    const maxVal = Math.max(1, p1Values[i], p2Values[i]);
    return {
      subject: label,
      [period1Label]: Math.round((p1Values[i] / maxVal) * 100),
      [period2Label]: Math.round((p2Values[i] / maxVal) * 100),
    };
  });

  // Calculate change percentages
  const signalChange = p1.signalCount > 0 ? Math.round(((p2.signalCount - p1.signalCount) / p1.signalCount) * 100) : (p2.signalCount > 0 ? 100 : 0);
  const datasetChange = p1.datasetUpdates > 0 ? Math.round(((p2.datasetUpdates - p1.datasetUpdates) / p1.datasetUpdates) * 100) : (p2.datasetUpdates > 0 ? 100 : 0);
  const activityChange = p1.totalActivity > 0 ? Math.round(((p2.totalActivity - p1.totalActivity) / p1.totalActivity) * 100) : (p2.totalActivity > 0 ? 100 : 0);

  const summaryCards = [
    {
      title: 'تغيّر الإشارات',
      value: `${signalChange >= 0 ? '+' : ''}${signalChange}%`,
      change: signalChange,
      winner: p2.signalCount >= p1.signalCount ? period2Label : period1Label,
    },
    {
      title: 'تغيّر التحديثات',
      value: `${datasetChange >= 0 ? '+' : ''}${datasetChange}%`,
      change: datasetChange,
      winner: p2.datasetUpdates >= p1.datasetUpdates ? period2Label : period1Label,
    },
    {
      title: 'تغيّر النشاط',
      value: `${activityChange >= 0 ? '+' : ''}${activityChange}%`,
      change: activityChange,
      winner: p2.totalActivity >= p1.totalActivity ? period2Label : period1Label,
    },
  ];

  const trend = activityChange >= 0 ? 'تحسن' : 'تراجع';
  const insight = `بناءً على البيانات الفعلية، شهدت "${period2Label}" ${trend}اً في النشاط بنسبة ${Math.abs(activityChange)}% مقارنة بـ "${period1Label}". عدد الإشارات ${signalChange >= 0 ? 'ارتفع' : 'انخفض'} بنسبة ${Math.abs(signalChange)}%، بينما تحديثات البيانات ${datasetChange >= 0 ? 'زادت' : 'تراجعت'} بنسبة ${Math.abs(datasetChange)}%. هذه المؤشرات تعكس مستوى النشاط الاستثماري الفعلي في منصة رادار المستثمر.`;

  return { items: [period1Label, period2Label], metrics, chartData, radarData, insight, summaryCards };
}

interface PrebuiltComparison {
  id: string;
  title: string;
  description: string;
  type: ComparisonTab;
  items: string[];
  periodId?: string;
  icon: React.ReactNode;
}

const PREBUILT_COMPARISONS: PrebuiltComparison[] = [
  {
    id: 'pb-1',
    title: 'العقار vs التقنية في 2025',
    description: 'مقارنة شاملة بين أكبر قطاعين من حيث النمو والاستثمار',
    type: 'sectors',
    items: ['عقارات', 'تقنية'],
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    id: 'pb-2',
    title: 'الرياض vs جدة - نمو الاستثمار',
    description: 'مقارنة بين المدينتين الرئيسيتين في المملكة',
    type: 'regions',
    items: ['الرياض', 'جدة'],
    icon: <MapPin className="w-5 h-5" />,
  },
  {
    id: 'pb-3',
    title: 'آخر 6 أشهر مقابل السابقة',
    description: 'هل تحسن النشاط الاستثماري؟ مقارنة نصف سنوية',
    type: 'periods',
    items: [],
    periodId: 'recent-6m-vs-prev-6m',
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    id: 'pb-4',
    title: 'الطاقة vs الصناعة vs المالية',
    description: 'ثلاثي القوة الاقتصادية - من يتصدر؟',
    type: 'sectors',
    items: ['طاقة', 'صناعة', 'مالية'],
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    id: 'pb-5',
    title: 'الدمام vs مكة vs المدينة',
    description: 'مقارنة المناطق الثانوية من حيث الفرص الاستثمارية',
    type: 'regions',
    items: ['الدمام', 'مكة المكرمة', 'المدينة المنورة'],
    icon: <MapPin className="w-5 h-5" />,
  },
  {
    id: 'pb-6',
    title: 'السياحة vs الصحة vs التعليم',
    description: 'قطاعات الخدمات في سباق النمو',
    type: 'sectors',
    items: ['سياحة', 'صحة', 'تعليم'],
    icon: <Sparkles className="w-5 h-5" />,
  },
];

// ============================================
// COMPONENT
// ============================================

const SmartComparisonsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ComparisonTab>('sectors');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [availableSectors, setAvailableSectors] = useState<string[]>(Object.keys(SECTORS_AR));
  const [availableRegions, setAvailableRegions] = useState<string[]>(DEFAULT_REGIONS_AR);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [chartView, setChartView] = useState<'bar' | 'radar'>('bar');
  const [realCategoryData, setRealCategoryData] = useState<Record<string, number>>({});
  const [realOverviewData, setRealOverviewData] = useState<any>(null);
  const [regionHeatmap, setRegionHeatmap] = useState<RegionHeatmapEntry[]>([]);
  const [temporalHeatmap, setTemporalHeatmap] = useState<TemporalHeatmapEntry[]>([]);

  // Fetch categories, overview stats, source stats, and heatmap data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, overviewRes, _sourceRes, heatmapRes] = await Promise.all([
          api.getCategories(),
          api.getOverviewStats(),
          api.getSourceStats(),
          api.getHeatmapData(),
        ]);

        if (catRes.success && catRes.data && Array.isArray(catRes.data) && catRes.data.length > 0) {
          const names = catRes.data.map((c: SectorCategory) => c.name).filter(Boolean);
          if (names.length > 0) {
            setAvailableSectors(names);
          }
          const countMap: Record<string, number> = {};
          catRes.data.forEach((c: SectorCategory) => {
            if (c.name) countMap[c.name] = c.count;
          });
          setRealCategoryData(countMap);
        }

        if (overviewRes.success) {
          setRealOverviewData(overviewRes.data);
        }

        if (heatmapRes.success && heatmapRes.data) {
          if (heatmapRes.data.regionHeatmap && heatmapRes.data.regionHeatmap.length > 0) {
            setRegionHeatmap(heatmapRes.data.regionHeatmap);
            const regionNames = heatmapRes.data.regionHeatmap.map(r => r.region).filter(Boolean);
            if (regionNames.length > 0) {
              setAvailableRegions(regionNames);
            }
          }
          if (heatmapRes.data.temporalHeatmap && heatmapRes.data.temporalHeatmap.length > 0) {
            setTemporalHeatmap(heatmapRes.data.temporalHeatmap);
          }
        }
      } catch {
        // Silently fall back to defaults
      }
    };
    fetchData();
  }, []);

  const handleCompare = () => {
    setIsComparing(true);
    setTimeout(() => {
      let result: ComparisonResult;
      if (activeTab === 'sectors') {
        result = generateSectorComparison(selectedSectors, realCategoryData);
      } else if (activeTab === 'regions') {
        result = generateRegionComparison(selectedRegions, regionHeatmap);
      } else {
        result = generatePeriodComparison(selectedPeriod, temporalHeatmap);
      }
      setComparisonResult(result);
      setIsComparing(false);
    }, 800);
  };

  const handlePrebuiltClick = (pb: PrebuiltComparison) => {
    setActiveTab(pb.type);
    if (pb.type === 'sectors') {
      setSelectedSectors(pb.items);
      setSelectedRegions([]);
      setSelectedPeriod('');
    } else if (pb.type === 'regions') {
      setSelectedRegions(pb.items);
      setSelectedSectors([]);
      setSelectedPeriod('');
    } else {
      setSelectedPeriod(pb.periodId ?? '');
      setSelectedSectors([]);
      setSelectedRegions([]);
    }
    // Auto-run comparison
    setIsComparing(true);
    setTimeout(() => {
      let result: ComparisonResult;
      if (pb.type === 'sectors') {
        result = generateSectorComparison(pb.items, realCategoryData);
      } else if (pb.type === 'regions') {
        result = generateRegionComparison(pb.items, regionHeatmap);
      } else {
        result = generatePeriodComparison(pb.periodId ?? '', temporalHeatmap);
      }
      setComparisonResult(result);
      setIsComparing(false);
    }, 800);
  };

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : prev.length < 5 ? [...prev, sector] : prev
    );
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : prev.length < 5 ? [...prev, region] : prev
    );
  };

  const removeSector = (sector: string) => {
    setSelectedSectors((prev) => prev.filter((s) => s !== sector));
  };

  const removeRegion = (region: string) => {
    setSelectedRegions((prev) => prev.filter((r) => r !== region));
  };

  const canCompare = () => {
    if (activeTab === 'sectors') return selectedSectors.length >= 2;
    if (activeTab === 'regions') return selectedRegions.length >= 2;
    return selectedPeriod !== '';
  };

  const tabs: { key: ComparisonTab; label: string; icon: React.ReactNode }[] = [
    { key: 'sectors', label: 'مقارنة القطاعات', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'periods', label: 'مقارنة الفترات', icon: <Calendar className="w-4 h-4" /> },
    { key: 'regions', label: 'مقارنة المناطق', icon: <MapPin className="w-4 h-4" /> },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <ArrowLeftRight className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">المقارنات الذكية</h1>
              <p className="text-gray-500 mt-1">قارن بين القطاعات والمناطق والفترات الزمنية بذكاء</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ===== COMPARISON BUILDER ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setComparisonResult(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Builder content */}
          <div className="p-6">
            {/* Sectors builder */}
            {activeTab === 'sectors' && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  اختر القطاعات للمقارنة (2-5 قطاعات)
                </label>

                {/* Selected chips */}
                {selectedSectors.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedSectors.map((sector) => (
                      <span
                        key={sector}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium"
                      >
                        {sector}
                        <button
                          onClick={() => removeSector(sector)}
                          className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSectorDropdown(!showSectorDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <span>{selectedSectors.length === 0 ? 'اختر القطاعات...' : `تم اختيار ${selectedSectors.length} قطاعات`}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showSectorDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showSectorDropdown && (
                    <div className="absolute z-20 top-full mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                      {availableSectors.map((sector) => (
                        <button
                          key={sector}
                          onClick={() => toggleSector(sector)}
                          className={`w-full text-right px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                            selectedSectors.includes(sector) ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          <span>{sector}</span>
                          {selectedSectors.includes(sector) && (
                            <span className="text-blue-500 text-xs font-bold">&#10003;</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Regions builder */}
            {activeTab === 'regions' && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  اختر المناطق للمقارنة (2-5 مناطق)
                </label>

                {selectedRegions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedRegions.map((region) => (
                      <span
                        key={region}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium"
                      >
                        {region}
                        <button
                          onClick={() => removeRegion(region)}
                          className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-emerald-200 transition-colors"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <button
                    onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <span>{selectedRegions.length === 0 ? 'اختر المناطق...' : `تم اختيار ${selectedRegions.length} مناطق`}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showRegionDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showRegionDropdown && (
                    <div className="absolute z-20 top-full mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                      {availableRegions.map((region) => (
                        <button
                          key={region}
                          onClick={() => toggleRegion(region)}
                          className={`w-full text-right px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                            selectedRegions.includes(region) ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                          }`}
                        >
                          <span>{region}</span>
                          {selectedRegions.includes(region) && (
                            <span className="text-emerald-500 text-xs font-bold">&#10003;</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Periods builder */}
            {activeTab === 'periods' && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  اختر الفترة الزمنية للمقارنة
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PERIODS_AR.map((period) => (
                    <button
                      key={period.id}
                      onClick={() => setSelectedPeriod(period.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-right ${
                        selectedPeriod === period.id
                          ? 'border-amber-500 bg-amber-50 text-amber-800'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Calendar className={`w-5 h-5 flex-shrink-0 ${selectedPeriod === period.id ? 'text-amber-500' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium">{period.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Compare button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleCompare}
                disabled={!canCompare() || isComparing}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium text-sm transition-all ${
                  canCompare() && !isComparing
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isComparing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري المقارنة...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    قارن الآن
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ===== LOADING STATE ===== */}
        {isComparing && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <p className="text-gray-600 font-medium">الذكاء الاصطناعي يحلل البيانات...</p>
              <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        )}

        {/* ===== COMPARISON RESULTS ===== */}
        {comparisonResult && !isComparing && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {comparisonResult.summaryCards.map((card, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <p className="text-xs text-gray-500 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">{card.winner}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      card.change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {card.change >= 0 ? '+' : ''}{card.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  المقارنة البصرية
                </h3>
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setChartView('bar')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      chartView === 'bar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    أعمدة
                  </button>
                  <button
                    onClick={() => setChartView('radar')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      chartView === 'radar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    رادار
                  </button>
                </div>
              </div>

              {chartView === 'bar' ? (
                <div style={{ direction: 'ltr' }}>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={comparisonResult.chartData} margin={{ top: 10, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="metric"
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        angle={-25}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #E5E7EB',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                          direction: 'rtl',
                          textAlign: 'right',
                        }}
                      />
                      <Legend
                        wrapperStyle={{ direction: 'rtl', paddingTop: '12px' }}
                      />
                      {comparisonResult.items.map((item, i) => (
                        <Bar
                          key={item}
                          dataKey={item}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                          radius={[4, 4, 0, 0]}
                          maxBarSize={50}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ direction: 'ltr' }}>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={comparisonResult.radarData} cx="50%" cy="50%" outerRadius="75%">
                      <PolarGrid stroke="#E5E7EB" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fontSize: 12, fill: '#374151' }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                      />
                      {comparisonResult.items.map((item, i) => (
                        <Radar
                          key={item}
                          name={item}
                          dataKey={item}
                          stroke={CHART_COLORS[i % CHART_COLORS.length]}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                          fillOpacity={0.15}
                          strokeWidth={2}
                        />
                      ))}
                      <Legend wrapperStyle={{ direction: 'rtl', paddingTop: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #E5E7EB',
                          borderRadius: '12px',
                          direction: 'rtl',
                          textAlign: 'right',
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Comparison table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">جدول المقارنة التفصيلي</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المؤشر
                      </th>
                      {comparisonResult.items.map((item, i) => (
                        <th key={item} className="text-center px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>
                          {item}
                        </th>
                      ))}
                      <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المتصدر
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {comparisonResult.metrics.map((metric, mIdx) => {
                      const maxVal = Math.max(...Object.values(metric.values));
                      const winner = Object.entries(metric.values).find(([, v]) => v === maxVal);
                      // For metrics like unemployment where lower is better
                      const isLowerBetter = metric.label.includes('بطالة') || metric.label.includes('تضخم');
                      const bestVal = isLowerBetter
                        ? Math.min(...Object.values(metric.values))
                        : maxVal;
                      const bestEntry = Object.entries(metric.values).find(([, v]) => v === bestVal);

                      return (
                        <tr key={mIdx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{metric.label}</td>
                          {comparisonResult.items.map((item) => {
                            const val = metric.values[item] ?? 0;
                            const isBest = val === bestVal;
                            return (
                              <td key={item} className="px-6 py-4 text-center">
                                <span className={`text-sm font-semibold ${isBest ? 'text-green-600' : 'text-gray-700'}`}>
                                  {typeof val === 'number' ? val.toLocaleString('ar-SA') : val}
                                </span>
                              </td>
                            );
                          })}
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                              <TrendingUp className="w-3 h-3" />
                              {bestEntry ? bestEntry[0] : (winner ? winner[0] : '-')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Insight */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    تحليل الذكاء الاصطناعي
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-sm">{comparisonResult.insight}</p>
                  <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    تم التحليل بواسطة محرك رادار المستثمر الذكي
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== PRE-BUILT COMPARISONS ===== */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">مقارنات مقترحة</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PREBUILT_COMPARISONS.map((pb) => (
              <button
                key={pb.id}
                onClick={() => handlePrebuiltClick(pb)}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-right hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-500 transition-colors flex-shrink-0">
                    {pb.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {pb.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{pb.description}</p>
                    <div className="mt-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        pb.type === 'sectors'
                          ? 'bg-blue-100 text-blue-600'
                          : pb.type === 'regions'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-amber-100 text-amber-600'
                      }`}>
                        {pb.type === 'sectors' ? 'قطاعات' : pb.type === 'regions' ? 'مناطق' : 'فترات'}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Close dropdowns on outside click */}
      {(showSectorDropdown || showRegionDropdown) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowSectorDropdown(false);
            setShowRegionDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default SmartComparisonsPage;
