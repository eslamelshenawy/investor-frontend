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

const REGIONS_AR = ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة', 'أبها', 'تبوك', 'الطائف'];

const PERIODS_AR = [
  { id: 'q1-2025-vs-q2-2025', label: 'الربع الأول 2025 vs الربع الثاني 2025' },
  { id: 'q3-2024-vs-q3-2025', label: 'الربع الثالث 2024 vs الربع الثالث 2025' },
  { id: '2024-vs-2025', label: 'سنة 2024 vs سنة 2025' },
  { id: 'h1-2025-vs-h2-2025', label: 'النصف الأول 2025 vs النصف الثاني 2025' },
];

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

function generateSectorComparison(sectors: string[]): ComparisonResult {
  const metricLabels = ['حجم الاستثمار (مليار ريال)', 'عدد الشركات', 'معدل النمو (%)', 'نسبة التوظيف (%)', 'مؤشر الثقة'];
  const sectorData: Record<string, Record<string, number>> = {
    'عقارات': { 'حجم الاستثمار (مليار ريال)': 185, 'عدد الشركات': 1240, 'معدل النمو (%)': 12.5, 'نسبة التوظيف (%)': 8.3, 'مؤشر الثقة': 78 },
    'تقنية': { 'حجم الاستثمار (مليار ريال)': 142, 'عدد الشركات': 2100, 'معدل النمو (%)': 28.7, 'نسبة التوظيف (%)': 15.2, 'مؤشر الثقة': 92 },
    'طاقة': { 'حجم الاستثمار (مليار ريال)': 320, 'عدد الشركات': 580, 'معدل النمو (%)': 8.1, 'نسبة التوظيف (%)': 6.7, 'مؤشر الثقة': 85 },
    'صحة': { 'حجم الاستثمار (مليار ريال)': 95, 'عدد الشركات': 890, 'معدل النمو (%)': 18.3, 'نسبة التوظيف (%)': 12.1, 'مؤشر الثقة': 88 },
    'تعليم': { 'حجم الاستثمار (مليار ريال)': 62, 'عدد الشركات': 650, 'معدل النمو (%)': 14.2, 'نسبة التوظيف (%)': 9.8, 'مؤشر الثقة': 75 },
    'سياحة': { 'حجم الاستثمار (مليار ريال)': 78, 'عدد الشركات': 1450, 'معدل النمو (%)': 35.4, 'نسبة التوظيف (%)': 11.5, 'مؤشر الثقة': 90 },
    'صناعة': { 'حجم الاستثمار (مليار ريال)': 210, 'عدد الشركات': 980, 'معدل النمو (%)': 9.6, 'نسبة التوظيف (%)': 7.4, 'مؤشر الثقة': 72 },
    'تجزئة': { 'حجم الاستثمار (مليار ريال)': 115, 'عدد الشركات': 3200, 'معدل النمو (%)': 6.8, 'نسبة التوظيف (%)': 18.5, 'مؤشر الثقة': 68 },
    'مالية': { 'حجم الاستثمار (مليار ريال)': 250, 'عدد الشركات': 420, 'معدل النمو (%)': 11.3, 'نسبة التوظيف (%)': 5.2, 'مؤشر الثقة': 82 },
    'زراعة': { 'حجم الاستثمار (مليار ريال)': 45, 'عدد الشركات': 380, 'معدل النمو (%)': 7.5, 'نسبة التوظيف (%)': 4.1, 'مؤشر الثقة': 65 },
  };

  const metrics: ComparisonMetric[] = metricLabels.map((label) => {
    const values: Record<string, number> = {};
    sectors.forEach((s) => {
      values[s] = (sectorData[s] ?? sectorData['عقارات'])[label] ?? Math.round(Math.random() * 100);
    });
    return { label, values };
  });

  const chartData = metricLabels.map((label) => {
    const row: Record<string, string | number> = { metric: label };
    sectors.forEach((s) => {
      row[s] = (sectorData[s] ?? sectorData['عقارات'])[label] ?? 0;
    });
    return row;
  });

  const radarLabels = ['النمو', 'الاستثمار', 'التوظيف', 'الشركات', 'الثقة'];
  const radarKeys = ['معدل النمو (%)', 'حجم الاستثمار (مليار ريال)', 'نسبة التوظيف (%)', 'عدد الشركات', 'مؤشر الثقة'];
  const maxVals = [40, 350, 20, 3500, 100];
  const radarData = radarLabels.map((label, i) => {
    const row: Record<string, string | number> = { subject: label };
    sectors.forEach((s) => {
      const raw = (sectorData[s] ?? sectorData['عقارات'])[radarKeys[i]] ?? 50;
      row[s] = Math.round((raw / maxVals[i]) * 100);
    });
    return row;
  });

  const growthWinner = sectors.reduce((a, b) => {
    const aGrowth = (sectorData[a] ?? sectorData['عقارات'])['معدل النمو (%)'] ?? 0;
    const bGrowth = (sectorData[b] ?? sectorData['عقارات'])['معدل النمو (%)'] ?? 0;
    return aGrowth > bGrowth ? a : b;
  });

  const investmentWinner = sectors.reduce((a, b) => {
    const aInv = (sectorData[a] ?? sectorData['عقارات'])['حجم الاستثمار (مليار ريال)'] ?? 0;
    const bInv = (sectorData[b] ?? sectorData['عقارات'])['حجم الاستثمار (مليار ريال)'] ?? 0;
    return aInv > bInv ? a : b;
  });

  const summaryCards = [
    {
      title: 'أعلى نمو',
      value: `${(sectorData[growthWinner] ?? sectorData['عقارات'])['معدل النمو (%)']}%`,
      change: (sectorData[growthWinner] ?? sectorData['عقارات'])['معدل النمو (%)'] ?? 0,
      winner: growthWinner,
    },
    {
      title: 'أكبر استثمار',
      value: `${(sectorData[investmentWinner] ?? sectorData['عقارات'])['حجم الاستثمار (مليار ريال)']} مليار`,
      change: 5.2,
      winner: investmentWinner,
    },
    {
      title: 'أعلى ثقة',
      value: `${Math.max(...sectors.map((s) => (sectorData[s] ?? sectorData['عقارات'])['مؤشر الثقة'] ?? 0))}`,
      change: 3.1,
      winner: sectors.reduce((a, b) =>
        ((sectorData[a] ?? sectorData['عقارات'])['مؤشر الثقة'] ?? 0) >
        ((sectorData[b] ?? sectorData['عقارات'])['مؤشر الثقة'] ?? 0) ? a : b
      ),
    },
  ];

  const insight = `بناءً على تحليل البيانات، يتفوق قطاع "${growthWinner}" في معدل النمو بنسبة ${(sectorData[growthWinner] ?? sectorData['عقارات'])['معدل النمو (%)']}%، بينما يحتل قطاع "${investmentWinner}" المركز الأول في حجم الاستثمارات بقيمة ${(sectorData[investmentWinner] ?? sectorData['عقارات'])['حجم الاستثمار (مليار ريال)']} مليار ريال. يُظهر التحليل أن القطاعات ذات النمو المرتفع تتركز في المجالات المدعومة برؤية 2030، مع تزايد ملحوظ في الاستثمارات الأجنبية المباشرة. ننصح المستثمرين بالتنويع بين القطاعات لتقليل المخاطر مع التركيز على القطاعات ذات مؤشرات الثقة العالية.`;

  return { items: sectors, metrics, chartData, radarData, insight, summaryCards };
}

function generateRegionComparison(regions: string[]): ComparisonResult {
  const regionData: Record<string, Record<string, number>> = {
    'الرياض': { 'الناتج المحلي (مليار)': 450, 'عدد المشاريع': 3200, 'معدل النمو (%)': 15.8, 'نسبة البطالة (%)': 5.2, 'مؤشر جودة الحياة': 88 },
    'جدة': { 'الناتج المحلي (مليار)': 280, 'عدد المشاريع': 2100, 'معدل النمو (%)': 12.3, 'نسبة البطالة (%)': 6.8, 'مؤشر جودة الحياة': 82 },
    'الدمام': { 'الناتج المحلي (مليار)': 195, 'عدد المشاريع': 1400, 'معدل النمو (%)': 10.5, 'نسبة البطالة (%)': 7.1, 'مؤشر جودة الحياة': 79 },
    'مكة المكرمة': { 'الناتج المحلي (مليار)': 165, 'عدد المشاريع': 980, 'معدل النمو (%)': 18.2, 'نسبة البطالة (%)': 8.4, 'مؤشر جودة الحياة': 76 },
    'المدينة المنورة': { 'الناتج المحلي (مليار)': 95, 'عدد المشاريع': 620, 'معدل النمو (%)': 14.7, 'نسبة البطالة (%)': 9.1, 'مؤشر جودة الحياة': 74 },
    'أبها': { 'الناتج المحلي (مليار)': 42, 'عدد المشاريع': 310, 'معدل النمو (%)': 22.1, 'نسبة البطالة (%)': 10.5, 'مؤشر جودة الحياة': 71 },
    'تبوك': { 'الناتج المحلي (مليار)': 38, 'عدد المشاريع': 280, 'معدل النمو (%)': 25.3, 'نسبة البطالة (%)': 11.2, 'مؤشر جودة الحياة': 68 },
    'الطائف': { 'الناتج المحلي (مليار)': 55, 'عدد المشاريع': 420, 'معدل النمو (%)': 13.6, 'نسبة البطالة (%)': 9.8, 'مؤشر جودة الحياة': 72 },
  };

  const metricLabels = ['الناتج المحلي (مليار)', 'عدد المشاريع', 'معدل النمو (%)', 'نسبة البطالة (%)', 'مؤشر جودة الحياة'];

  const metrics: ComparisonMetric[] = metricLabels.map((label) => {
    const values: Record<string, number> = {};
    regions.forEach((r) => {
      values[r] = (regionData[r] ?? regionData['الرياض'])[label] ?? 0;
    });
    return { label, values };
  });

  const chartData = metricLabels.map((label) => {
    const row: Record<string, string | number> = { metric: label };
    regions.forEach((r) => {
      row[r] = (regionData[r] ?? regionData['الرياض'])[label] ?? 0;
    });
    return row;
  });

  const radarLabels = ['النمو', 'الناتج', 'المشاريع', 'التوظيف', 'جودة الحياة'];
  const radarKeys = ['معدل النمو (%)', 'الناتج المحلي (مليار)', 'عدد المشاريع', 'نسبة البطالة (%)', 'مؤشر جودة الحياة'];
  const maxVals = [30, 500, 3500, 15, 100];
  const radarData = radarLabels.map((label, i) => {
    const row: Record<string, string | number> = { subject: label };
    regions.forEach((r) => {
      let raw = (regionData[r] ?? regionData['الرياض'])[radarKeys[i]] ?? 50;
      if (radarKeys[i] === 'نسبة البطالة (%)') raw = maxVals[i] - raw;
      row[r] = Math.round((raw / maxVals[i]) * 100);
    });
    return row;
  });

  const gdpWinner = regions.reduce((a, b) =>
    ((regionData[a] ?? regionData['الرياض'])['الناتج المحلي (مليار)'] ?? 0) >
    ((regionData[b] ?? regionData['الرياض'])['الناتج المحلي (مليار)'] ?? 0) ? a : b
  );

  const growthWinner = regions.reduce((a, b) =>
    ((regionData[a] ?? regionData['الرياض'])['معدل النمو (%)'] ?? 0) >
    ((regionData[b] ?? regionData['الرياض'])['معدل النمو (%)'] ?? 0) ? a : b
  );

  const summaryCards = [
    {
      title: 'أعلى ناتج محلي',
      value: `${(regionData[gdpWinner] ?? regionData['الرياض'])['الناتج المحلي (مليار)']} مليار`,
      change: 8.4,
      winner: gdpWinner,
    },
    {
      title: 'أسرع نمو',
      value: `${(regionData[growthWinner] ?? regionData['الرياض'])['معدل النمو (%)']}%`,
      change: (regionData[growthWinner] ?? regionData['الرياض'])['معدل النمو (%)'] ?? 0,
      winner: growthWinner,
    },
    {
      title: 'أعلى جودة حياة',
      value: `${Math.max(...regions.map((r) => (regionData[r] ?? regionData['الرياض'])['مؤشر جودة الحياة'] ?? 0))}`,
      change: 2.5,
      winner: regions.reduce((a, b) =>
        ((regionData[a] ?? regionData['الرياض'])['مؤشر جودة الحياة'] ?? 0) >
        ((regionData[b] ?? regionData['الرياض'])['مؤشر جودة الحياة'] ?? 0) ? a : b
      ),
    },
  ];

  const insight = `تُظهر المقارنة أن "${gdpWinner}" تتصدر من حيث الناتج المحلي الإجمالي، في حين تشهد "${growthWinner}" أسرع معدلات النمو بنسبة ${(regionData[growthWinner] ?? regionData['الرياض'])['معدل النمو (%)']}%. تستفيد المناطق الناشئة من مشاريع رؤية 2030 الضخمة مثل نيوم وذا لاين. يُنصح بمتابعة المناطق ذات النمو المتسارع كفرص استثمارية واعدة مع الأخذ بعين الاعتبار مؤشرات جودة الحياة والبنية التحتية.`;

  return { items: regions, metrics, chartData, radarData, insight, summaryCards };
}

function generatePeriodComparison(periodId: string): ComparisonResult {
  const periodResults: Record<string, ComparisonResult> = {
    'q1-2025-vs-q2-2025': {
      items: ['الربع الأول 2025', 'الربع الثاني 2025'],
      metrics: [
        { label: 'الناتج المحلي (مليار ريال)', values: { 'الربع الأول 2025': 920, 'الربع الثاني 2025': 985 } },
        { label: 'حجم التداول (مليار ريال)', values: { 'الربع الأول 2025': 145, 'الربع الثاني 2025': 168 } },
        { label: 'الاستثمار الأجنبي (مليار ريال)', values: { 'الربع الأول 2025': 32, 'الربع الثاني 2025': 41 } },
        { label: 'معدل التضخم (%)', values: { 'الربع الأول 2025': 2.1, 'الربع الثاني 2025': 1.8 } },
        { label: 'مؤشر ثقة المستثمر', values: { 'الربع الأول 2025': 74, 'الربع الثاني 2025': 81 } },
      ],
      chartData: [
        { metric: 'الناتج المحلي', 'الربع الأول 2025': 920, 'الربع الثاني 2025': 985 },
        { metric: 'حجم التداول', 'الربع الأول 2025': 145, 'الربع الثاني 2025': 168 },
        { metric: 'الاستثمار الأجنبي', 'الربع الأول 2025': 32, 'الربع الثاني 2025': 41 },
        { metric: 'مؤشر الثقة', 'الربع الأول 2025': 74, 'الربع الثاني 2025': 81 },
      ],
      radarData: [
        { subject: 'النمو', 'الربع الأول 2025': 68, 'الربع الثاني 2025': 78 },
        { subject: 'التداول', 'الربع الأول 2025': 72, 'الربع الثاني 2025': 84 },
        { subject: 'الاستثمار', 'الربع الأول 2025': 55, 'الربع الثاني 2025': 70 },
        { subject: 'الاستقرار', 'الربع الأول 2025': 82, 'الربع الثاني 2025': 85 },
        { subject: 'الثقة', 'الربع الأول 2025': 74, 'الربع الثاني 2025': 81 },
      ],
      insight: 'شهد الربع الثاني من 2025 تحسناً ملحوظاً مقارنة بالربع الأول، حيث ارتفع الناتج المحلي بنسبة 7.1% والاستثمار الأجنبي بنسبة 28.1%. انخفض معدل التضخم من 2.1% إلى 1.8% مما يعكس استقراراً اقتصادياً. ارتفع مؤشر ثقة المستثمر 7 نقاط ليصل إلى 81، مدعوماً بالإصلاحات الهيكلية ومشاريع رؤية 2030.',
      summaryCards: [
        { title: 'نمو الناتج المحلي', value: '+7.1%', change: 7.1, winner: 'الربع الثاني 2025' },
        { title: 'نمو الاستثمار الأجنبي', value: '+28.1%', change: 28.1, winner: 'الربع الثاني 2025' },
        { title: 'تحسن مؤشر الثقة', value: '+7 نقاط', change: 9.5, winner: 'الربع الثاني 2025' },
      ],
    },
    '2024-vs-2025': {
      items: ['سنة 2024', 'سنة 2025'],
      metrics: [
        { label: 'الناتج المحلي (مليار ريال)', values: { 'سنة 2024': 3450, 'سنة 2025': 3820 } },
        { label: 'حجم التداول (مليار ريال)', values: { 'سنة 2024': 520, 'سنة 2025': 625 } },
        { label: 'الاستثمار الأجنبي (مليار ريال)', values: { 'سنة 2024': 110, 'سنة 2025': 148 } },
        { label: 'معدل التضخم (%)', values: { 'سنة 2024': 2.4, 'سنة 2025': 1.9 } },
        { label: 'مؤشر ثقة المستثمر', values: { 'سنة 2024': 72, 'سنة 2025': 83 } },
      ],
      chartData: [
        { metric: 'الناتج المحلي', 'سنة 2024': 3450, 'سنة 2025': 3820 },
        { metric: 'حجم التداول', 'سنة 2024': 520, 'سنة 2025': 625 },
        { metric: 'الاستثمار الأجنبي', 'سنة 2024': 110, 'سنة 2025': 148 },
        { metric: 'مؤشر الثقة', 'سنة 2024': 72, 'سنة 2025': 83 },
      ],
      radarData: [
        { subject: 'النمو', 'سنة 2024': 65, 'سنة 2025': 80 },
        { subject: 'التداول', 'سنة 2024': 70, 'سنة 2025': 85 },
        { subject: 'الاستثمار', 'سنة 2024': 58, 'سنة 2025': 75 },
        { subject: 'الاستقرار', 'سنة 2024': 78, 'سنة 2025': 88 },
        { subject: 'الثقة', 'سنة 2024': 72, 'سنة 2025': 83 },
      ],
      insight: 'حقق الاقتصاد السعودي في 2025 قفزة نوعية مقارنة بـ 2024، بارتفاع الناتج المحلي 10.7% وزيادة الاستثمار الأجنبي 34.5%. تراجع التضخم إلى 1.9% مع ارتفاع مؤشر الثقة 11 نقطة. تعكس هذه الأرقام نجاح الإصلاحات الاقتصادية وتنويع مصادر الدخل بعيداً عن النفط.',
      summaryCards: [
        { title: 'نمو الناتج المحلي', value: '+10.7%', change: 10.7, winner: 'سنة 2025' },
        { title: 'نمو الاستثمار الأجنبي', value: '+34.5%', change: 34.5, winner: 'سنة 2025' },
        { title: 'تحسن مؤشر الثقة', value: '+11 نقطة', change: 15.3, winner: 'سنة 2025' },
      ],
    },
  };

  // Fallback for period IDs not explicitly defined
  return periodResults[periodId] ?? periodResults['q1-2025-vs-q2-2025'];
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
    title: 'أداء 2024 مقابل 2025',
    description: 'هل تحسن الاقتصاد السعودي؟ مقارنة سنوية شاملة',
    type: 'periods',
    items: [],
    periodId: '2024-vs-2025',
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
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [chartView, setChartView] = useState<'bar' | 'radar'>('bar');

  // Fetch categories from API on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.getCategories();
        if (res.success && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const names = res.data.map((c: SectorCategory) => c.name).filter(Boolean);
          if (names.length > 0) {
            setAvailableSectors(names);
          }
        }
      } catch {
        // Silently fall back to hardcoded sectors
      }
    };
    fetchCategories();
  }, []);

  const handleCompare = () => {
    setIsComparing(true);
    // Simulate API delay
    setTimeout(() => {
      let result: ComparisonResult;
      if (activeTab === 'sectors') {
        result = generateSectorComparison(selectedSectors);
      } else if (activeTab === 'regions') {
        result = generateRegionComparison(selectedRegions);
      } else {
        result = generatePeriodComparison(selectedPeriod);
      }
      setComparisonResult(result);
      setIsComparing(false);
    }, 1200);
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
        result = generateSectorComparison(pb.items);
      } else if (pb.type === 'regions') {
        result = generateRegionComparison(pb.items);
      } else {
        result = generatePeriodComparison(pb.periodId ?? '');
      }
      setComparisonResult(result);
      setIsComparing(false);
    }, 1200);
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
                      {REGIONS_AR.map((region) => (
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
