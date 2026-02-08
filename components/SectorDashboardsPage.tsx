/**
 * ============================================
 * SECTOR DASHBOARDS PAGE
 * ============================================
 *
 * لوحات حسب القطاع - استعرض المؤشرات والبيانات مصنفة حسب القطاع الاقتصادي
 * Fetches widgets from API and groups them by economic sector/category.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Building2,
  Landmark,
  Briefcase,
  Zap,
  Globe,
  TrendingUp,
  Cpu,
  Search,
  Filter,
  BarChart2,
  PieChart,
  LineChart,
  Activity,
  ArrowUpRight,
  Eye,
  RefreshCw,
  LayoutDashboard,
  ChevronLeft,
  X
} from 'lucide-react';
import { api } from '../src/services/api';
import { Widget, ChartType } from '../types';
import { WIDGETS } from '../constants';

// ============================================
// SECTOR DEFINITIONS
// ============================================

interface SectorDef {
  id: string;
  labelAr: string;
  labelEn: string;
  color: string;       // tailwind color name
  icon: React.ElementType;
  keywords: string[];   // used to match widget.category
}

const SECTORS: SectorDef[] = [
  {
    id: 'finance',
    labelAr: 'المالية',
    labelEn: 'Finance',
    color: 'blue',
    icon: Landmark,
    keywords: ['finance', 'financial', 'المالية', 'مالي', 'banking', 'مصرفي']
  },
  {
    id: 'economy',
    labelAr: 'الاقتصاد',
    labelEn: 'Economy',
    color: 'green',
    icon: TrendingUp,
    keywords: ['economy', 'economic', 'الاقتصاد', 'اقتصاد', 'gdp', 'macro']
  },
  {
    id: 'real_estate',
    labelAr: 'العقار',
    labelEn: 'Real Estate',
    color: 'amber',
    icon: Building2,
    keywords: ['real estate', 'real_estate', 'العقار', 'عقار', 'housing', 'إسكان']
  },
  {
    id: 'energy',
    labelAr: 'الطاقة',
    labelEn: 'Energy',
    color: 'orange',
    icon: Zap,
    keywords: ['energy', 'الطاقة', 'طاقة', 'oil', 'نفط', 'mining', 'تعدين']
  },
  {
    id: 'labor',
    labelAr: 'سوق العمل',
    labelEn: 'Labor Market',
    color: 'purple',
    icon: Briefcase,
    keywords: ['labor', 'سوق العمل', 'عمل', 'employment', 'unemployment', 'بطالة', 'توظيف']
  },
  {
    id: 'trade',
    labelAr: 'التجارة',
    labelEn: 'Trade',
    color: 'cyan',
    icon: Globe,
    keywords: ['trade', 'التجارة', 'تجارة', 'commerce', 'export', 'import', 'تصدير', 'استيراد']
  },
  {
    id: 'investment',
    labelAr: 'الاستثمار',
    labelEn: 'Investment',
    color: 'rose',
    icon: Activity,
    keywords: ['investment', 'الاستثمار', 'استثمار', 'fdi', 'licenses', 'رخص']
  },
  {
    id: 'technology',
    labelAr: 'التقنية',
    labelEn: 'Technology',
    color: 'slate',
    icon: Cpu,
    keywords: ['technology', 'التقنية', 'تقنية', 'digital', 'رقمي', 'tech', 'it']
  }
];

// ============================================
// HELPER: match widget category to sector
// ============================================

function matchWidgetToSector(widget: { category: string; tags?: string[] }): string | null {
  const cat = (widget.category || '').toLowerCase();
  const tags = (widget.tags || []).map(t => t.toLowerCase());

  for (const sector of SECTORS) {
    for (const kw of sector.keywords) {
      if (cat.includes(kw) || tags.some(t => t.includes(kw))) {
        return sector.id;
      }
    }
  }
  return null;
}

// ============================================
// CHART TYPE ICON HELPER
// ============================================

function getChartIcon(type: string) {
  switch (type) {
    case ChartType.LINE:
    case 'line':
      return <LineChart size={16} />;
    case ChartType.BAR:
    case 'bar':
      return <BarChart2 size={16} />;
    case ChartType.PIE:
    case 'pie':
      return <PieChart size={16} />;
    case ChartType.AREA:
    case 'area':
      return <TrendingUp size={16} />;
    case ChartType.KPI:
    case 'kpi':
      return <Activity size={16} />;
    default:
      return <LayoutDashboard size={16} />;
  }
}

// ============================================
// COLOR UTILITY MAPS (Tailwind safe)
// ============================================

const colorMap: Record<string, {
  bg: string; bgLight: string; text: string; border: string;
  ring: string; badge: string; gradient: string; hoverBorder: string;
  pillActive: string; pillInactive: string; dot: string;
}> = {
  blue: {
    bg: 'bg-blue-500', bgLight: 'bg-blue-500/10', text: 'text-blue-400',
    border: 'border-blue-500/20', ring: 'ring-blue-500/20',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    gradient: 'from-blue-600/20 to-blue-900/10',
    hoverBorder: 'hover:border-blue-500/40',
    pillActive: 'bg-blue-600 text-white shadow-lg shadow-blue-600/30',
    pillInactive: 'text-blue-400 hover:bg-blue-500/10',
    dot: 'bg-blue-400'
  },
  green: {
    bg: 'bg-emerald-500', bgLight: 'bg-emerald-500/10', text: 'text-emerald-400',
    border: 'border-emerald-500/20', ring: 'ring-emerald-500/20',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    gradient: 'from-emerald-600/20 to-emerald-900/10',
    hoverBorder: 'hover:border-emerald-500/40',
    pillActive: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30',
    pillInactive: 'text-emerald-400 hover:bg-emerald-500/10',
    dot: 'bg-emerald-400'
  },
  amber: {
    bg: 'bg-amber-500', bgLight: 'bg-amber-500/10', text: 'text-amber-400',
    border: 'border-amber-500/20', ring: 'ring-amber-500/20',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    gradient: 'from-amber-600/20 to-amber-900/10',
    hoverBorder: 'hover:border-amber-500/40',
    pillActive: 'bg-amber-600 text-white shadow-lg shadow-amber-600/30',
    pillInactive: 'text-amber-400 hover:bg-amber-500/10',
    dot: 'bg-amber-400'
  },
  orange: {
    bg: 'bg-orange-500', bgLight: 'bg-orange-500/10', text: 'text-orange-400',
    border: 'border-orange-500/20', ring: 'ring-orange-500/20',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    gradient: 'from-orange-600/20 to-orange-900/10',
    hoverBorder: 'hover:border-orange-500/40',
    pillActive: 'bg-orange-600 text-white shadow-lg shadow-orange-600/30',
    pillInactive: 'text-orange-400 hover:bg-orange-500/10',
    dot: 'bg-orange-400'
  },
  purple: {
    bg: 'bg-purple-500', bgLight: 'bg-purple-500/10', text: 'text-purple-400',
    border: 'border-purple-500/20', ring: 'ring-purple-500/20',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    gradient: 'from-purple-600/20 to-purple-900/10',
    hoverBorder: 'hover:border-purple-500/40',
    pillActive: 'bg-purple-600 text-white shadow-lg shadow-purple-600/30',
    pillInactive: 'text-purple-400 hover:bg-purple-500/10',
    dot: 'bg-purple-400'
  },
  cyan: {
    bg: 'bg-cyan-500', bgLight: 'bg-cyan-500/10', text: 'text-cyan-400',
    border: 'border-cyan-500/20', ring: 'ring-cyan-500/20',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    gradient: 'from-cyan-600/20 to-cyan-900/10',
    hoverBorder: 'hover:border-cyan-500/40',
    pillActive: 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30',
    pillInactive: 'text-cyan-400 hover:bg-cyan-500/10',
    dot: 'bg-cyan-400'
  },
  rose: {
    bg: 'bg-rose-500', bgLight: 'bg-rose-500/10', text: 'text-rose-400',
    border: 'border-rose-500/20', ring: 'ring-rose-500/20',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    gradient: 'from-rose-600/20 to-rose-900/10',
    hoverBorder: 'hover:border-rose-500/40',
    pillActive: 'bg-rose-600 text-white shadow-lg shadow-rose-600/30',
    pillInactive: 'text-rose-400 hover:bg-rose-500/10',
    dot: 'bg-rose-400'
  },
  slate: {
    bg: 'bg-slate-500', bgLight: 'bg-slate-500/10', text: 'text-slate-400',
    border: 'border-slate-500/20', ring: 'ring-slate-500/20',
    badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    gradient: 'from-slate-600/20 to-slate-900/10',
    hoverBorder: 'hover:border-slate-500/40',
    pillActive: 'bg-slate-600 text-white shadow-lg shadow-slate-600/30',
    pillInactive: 'text-slate-400 hover:bg-slate-400/10',
    dot: 'bg-slate-400'
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

const SectorDashboardsPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSector, setActiveSector] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchWidgets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getWidgets({ limit: 200 });
      if (res.success && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setWidgets(res.data as Widget[]);
      } else {
        // Fallback to constants
        setWidgets(WIDGETS);
      }
    } catch {
      // Fallback to local constants
      setWidgets(WIDGETS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  // ============================================
  // GROUPING: widgets by sector
  // ============================================

  const widgetsBySector = useMemo(() => {
    const map: Record<string, Widget[]> = {};
    SECTORS.forEach(s => { map[s.id] = []; });
    map['other'] = [];

    widgets.forEach(w => {
      if (w.type === ChartType.EXTERNAL) return; // skip external
      const sectorId = matchWidgetToSector(w);
      if (sectorId && map[sectorId]) {
        map[sectorId].push(w);
      } else {
        map['other'].push(w);
      }
    });

    return map;
  }, [widgets]);

  // Sector counts
  const sectorCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    SECTORS.forEach(s => {
      counts[s.id] = widgetsBySector[s.id]?.length || 0;
      counts.all += counts[s.id];
    });
    counts.all += widgetsBySector['other']?.length || 0;
    return counts;
  }, [widgetsBySector]);

  // Filtered widgets for current sector + search
  const filteredWidgets = useMemo(() => {
    let pool: Widget[] = [];
    if (activeSector === 'all') {
      SECTORS.forEach(s => { pool = pool.concat(widgetsBySector[s.id] || []); });
      pool = pool.concat(widgetsBySector['other'] || []);
    } else {
      pool = widgetsBySector[activeSector] || [];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pool = pool.filter(w =>
        w.title.toLowerCase().includes(q) ||
        (w.description || '').toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q) ||
        (w.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    return pool;
  }, [activeSector, searchQuery, widgetsBySector]);

  // Get sector def for a widget (for badge coloring)
  const getSectorForWidget = useCallback((w: Widget) => {
    const sid = matchWidgetToSector(w);
    return SECTORS.find(s => s.id === sid) || null;
  }, []);

  // ============================================
  // VALUE PREVIEW HELPER
  // ============================================

  function getValuePreview(w: Widget): string {
    if (!w.data || w.data.length === 0) return '--';
    const last = w.data[w.data.length - 1];
    if (last.value === undefined || last.value === null) return '--';
    const v = last.value;
    if (Math.abs(v) >= 1000) {
      return (v / 1000).toFixed(1) + 'K';
    }
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(1);
  }

  function getValueTrend(w: Widget): { label: string; positive: boolean } | null {
    if (!w.data || w.data.length < 2) return null;
    const curr = w.data[w.data.length - 1].value;
    const prev = w.data[w.data.length - 2].value;
    if (prev === 0) return null;
    const pct = ((curr - prev) / Math.abs(prev)) * 100;
    return {
      label: (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%',
      positive: pct >= 0
    };
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-slate-900" dir="rtl">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">

        {/* ===== PAGE HEADER ===== */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl p-8 lg:p-12 mb-8 border border-slate-700/50">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center">
                <Layers size={24} className="text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                  لوحات حسب القطاع
                </h1>
                <p className="text-slate-400 text-sm lg:text-base mt-1">
                  استعرض المؤشرات والبيانات مصنفة حسب القطاع الاقتصادي
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-3 mt-6">
              <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl px-4 py-2 text-center">
                <p className="text-xl font-black text-white">{sectorCounts.all}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">مؤشر</p>
              </div>
              <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl px-4 py-2 text-center">
                <p className="text-xl font-black text-white">{SECTORS.length}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">قطاع</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SECTOR FILTER PILLS ===== */}
        <div className="sticky top-[70px] z-30 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-3 mb-6 transition-all">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">

            {/* Pills row */}
            <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto no-scrollbar pb-1">
              {/* "All" pill */}
              <button
                onClick={() => setActiveSector('all')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  activeSector === 'all'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                }`}
              >
                <Filter size={14} />
                الكل
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  activeSector === 'all' ? 'bg-white/20' : 'bg-slate-700 text-slate-400'
                }`}>
                  {sectorCounts.all}
                </span>
              </button>

              {/* Sector pills */}
              {SECTORS.map(sector => {
                const colors = colorMap[sector.color];
                const Icon = sector.icon;
                const count = sectorCounts[sector.id] || 0;
                const isActive = activeSector === sector.id;

                return (
                  <button
                    key={sector.id}
                    onClick={() => setActiveSector(sector.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 border ${
                      isActive
                        ? `${colors.pillActive} border-transparent`
                        : `${colors.pillInactive} border-slate-700/50 hover:border-slate-600`
                    }`}
                  >
                    <Icon size={14} />
                    {sector.labelAr}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-white/20' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-72 shrink-0">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في المؤشرات..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ===== SECTOR OVERVIEW CARDS (when "all" is selected) ===== */}
        {activeSector === 'all' && !searchQuery && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {SECTORS.map(sector => {
              const colors = colorMap[sector.color];
              const Icon = sector.icon;
              const count = sectorCounts[sector.id] || 0;

              return (
                <button
                  key={sector.id}
                  onClick={() => setActiveSector(sector.id)}
                  className={`group relative overflow-hidden bg-slate-800 rounded-2xl p-5 border border-slate-700/50 ${colors.hoverBorder} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl text-right`}
                >
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                  <div className="relative z-10">
                    <div className={`w-10 h-10 ${colors.bgLight} rounded-xl flex items-center justify-center ${colors.text} mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon size={20} />
                    </div>
                    <h3 className="font-bold text-white text-base mb-1">{sector.labelAr}</h3>
                    <p className="text-xs text-slate-500 mb-2">{sector.labelEn}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-black ${colors.text}`}>{count}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest">مؤشر</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ===== LOADING STATE ===== */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw size={32} className="text-blue-400 animate-spin mb-4" />
            <p className="text-slate-400 text-sm font-medium">جاري تحميل المؤشرات...</p>
          </div>
        )}

        {/* ===== WIDGET CARDS GRID ===== */}
        {!loading && filteredWidgets.length > 0 && (
          <>
            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-400">
                {activeSector !== 'all' && (
                  <span className="inline-flex items-center gap-1.5">
                    {(() => {
                      const s = SECTORS.find(s => s.id === activeSector);
                      if (!s) return null;
                      const Icon = s.icon;
                      const c = colorMap[s.color];
                      return (
                        <>
                          <Icon size={14} className={c.text} />
                          <span className={`font-bold ${c.text}`}>{s.labelAr}</span>
                          <span className="mx-1 text-slate-600">|</span>
                        </>
                      );
                    })()}
                  </span>
                )}
                <span className="font-bold text-white">{filteredWidgets.length}</span> مؤشر
                {searchQuery && <span className="text-slate-500"> - نتائج البحث عن "{searchQuery}"</span>}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pb-8">
              {filteredWidgets.map(widget => {
                const sector = getSectorForWidget(widget);
                const colors = sector ? colorMap[sector.color] : colorMap['slate'];
                const SectorIcon = sector ? sector.icon : Layers;
                const valuePreview = getValuePreview(widget);
                const trend = getValueTrend(widget);
                const isExpanded = expandedWidget === widget.id;

                return (
                  <div
                    key={widget.id}
                    onClick={() => setExpandedWidget(isExpanded ? null : widget.id)}
                    className={`group relative bg-slate-800 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                      isExpanded
                        ? `${colors.border} shadow-xl ring-1 ${colors.ring}`
                        : `border-slate-700/50 ${colors.hoverBorder} hover:shadow-lg`
                    }`}
                  >
                    {/* Card Header */}
                    <div className="p-5 pb-3">
                      <div className="flex items-start justify-between mb-3">
                        {/* Chart type icon */}
                        <div className={`w-9 h-9 ${colors.bgLight} rounded-xl flex items-center justify-center ${colors.text}`}>
                          {getChartIcon(widget.type)}
                        </div>

                        {/* Sector badge */}
                        {sector && (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border ${colors.badge}`}>
                            <SectorIcon size={10} />
                            {sector.labelAr}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-white text-base leading-snug mb-1.5 group-hover:text-blue-300 transition-colors line-clamp-2">
                        {widget.title}
                      </h3>

                      {/* Description */}
                      {widget.description && (
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
                          {widget.description}
                        </p>
                      )}

                      {/* Value preview row */}
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">آخر قيمة</p>
                          <p className={`text-2xl font-black ${colors.text}`}>{valuePreview}</p>
                        </div>

                        {trend && (
                          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                            trend.positive
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}>
                            <TrendingUp size={12} className={!trend.positive ? 'rotate-180' : ''} />
                            {trend.label}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-5 py-3 border-t border-slate-700/50 flex items-center justify-between bg-slate-800/50">
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          {getChartIcon(widget.type)}
                          {widget.type}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                        <span>{widget.category}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {widget.tags?.slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-[9px] font-medium bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Expanded detail area */}
                    {isExpanded && (
                      <div className="px-5 py-4 border-t border-slate-700/30 bg-slate-900/50 animate-fadeIn">
                        {/* Data points preview */}
                        {widget.data && widget.data.length > 0 && (
                          <div className="mb-3">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">البيانات</p>
                            <div className="flex flex-wrap gap-2">
                              {widget.data.slice(-5).map((dp, i) => (
                                <div key={i} className="bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-1.5 text-center">
                                  <p className="text-[10px] text-slate-500">{dp.name}</p>
                                  <p className="text-sm font-bold text-white">{dp.value}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {widget.tags && widget.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {widget.tags.map((tag, i) => (
                              <span key={i} className="text-[10px] font-medium bg-slate-800 text-slate-400 px-2 py-1 rounded-md border border-slate-700/50">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Meta info */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-700/30">
                          <span>آخر تحديث: {widget.lastRefresh}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboards`);
                            }}
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold transition-colors"
                          >
                            عرض في اللوحات
                            <ArrowUpRight size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ===== EMPTY STATE ===== */}
        {!loading && filteredWidgets.length === 0 && (
          <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-slate-700/30">
            <div className="inline-block p-6 bg-slate-800 rounded-full border border-slate-700/50 mb-4">
              <Search size={40} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">لا توجد نتائج مطابقة</h3>
            <p className="text-slate-400 max-w-sm mx-auto text-sm">
              {searchQuery
                ? `لم نعثر على مؤشرات تطابق "${searchQuery}" في هذا القطاع.`
                : 'لا توجد مؤشرات متاحة لهذا القطاع حالياً.'
              }
            </p>
            {(searchQuery || activeSector !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setActiveSector('all'); }}
                className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-xl transition-colors"
              >
                عرض جميع المؤشرات
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default SectorDashboardsPage;
