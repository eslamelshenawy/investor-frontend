/**
 * Widget Library Page - مكتبة المؤشرات والعناصر التحليلية
 * Browse, search, filter, and add widgets to user dashboards.
 * Designed for ANALYST role users.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Plus,
  Eye,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  ChevronDown,
  X,
  Bookmark,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  RefreshCw,
  Layers,
  ExternalLink,
  BookmarkCheck
} from 'lucide-react';
import { api } from '../src/services/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WidgetItem {
  id: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  category: string;
  type: string; // KPI | Chart | Distribution | Metric
  chartType?: string;
  source?: string;
  sourceAr?: string;
  updateFrequency?: string;
  dataFormat?: string;
  tags?: string[];
  lastUpdated?: string;
  usageCount?: number;
  rating?: number;
  previewColor?: string;
  relatedWidgetIds?: string[];
  config?: any;
  data?: any;
}

interface CategoryItem {
  id: string;
  name: string;
  nameAr: string;
  count?: number;
}

interface DashboardOption {
  id: string;
  name: string;
  nameAr?: string;
}

type SortOption = 'newest' | 'most_used' | 'top_rated';
type ViewMode = 'grid' | 'list';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_CHIPS: { key: string; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'finance', label: 'المالية' },
  { key: 'economy', label: 'الاقتصاد' },
  { key: 'realestate', label: 'العقار' },
  { key: 'energy', label: 'الطاقة' },
  { key: 'tech', label: 'التقنية' },
  { key: 'industry', label: 'الصناعة' },
  { key: 'trade', label: 'التجارة' },
];

const TYPE_OPTIONS: { key: string; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'KPI', label: 'KPI' },
  { key: 'Chart', label: 'Chart' },
  { key: 'Distribution', label: 'Distribution' },
  { key: 'Metric', label: 'Metric' },
];

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'newest', label: 'الأحدث' },
  { key: 'most_used', label: 'الأكثر استخداماً' },
  { key: 'top_rated', label: 'الأعلى تقييماً' },
];

const TYPE_ICON_MAP: Record<string, React.ReactNode> = {
  KPI: <TrendingUp size={16} />,
  Chart: <BarChart3 size={16} />,
  Distribution: <PieChart size={16} />,
  Metric: <Activity size={16} />,
};

const TYPE_COLOR_MAP: Record<string, string> = {
  KPI: 'bg-emerald-100 text-emerald-700',
  Chart: 'bg-blue-100 text-blue-700',
  Distribution: 'bg-purple-100 text-purple-700',
  Metric: 'bg-amber-100 text-amber-700',
};

const PREVIEW_COLORS: Record<string, { bg: string; accent: string }> = {
  KPI: { bg: 'from-emerald-500/10 to-emerald-600/20', accent: 'bg-emerald-500' },
  Chart: { bg: 'from-blue-500/10 to-blue-600/20', accent: 'bg-blue-500' },
  Distribution: { bg: 'from-purple-500/10 to-purple-600/20', accent: 'bg-purple-500' },
  Metric: { bg: 'from-amber-500/10 to-amber-600/20', accent: 'bg-amber-500' },
};

const CATEGORY_COLOR_MAP: Record<string, string> = {
  finance: 'bg-green-100 text-green-700',
  economy: 'bg-sky-100 text-sky-700',
  realestate: 'bg-orange-100 text-orange-700',
  energy: 'bg-yellow-100 text-yellow-700',
  tech: 'bg-indigo-100 text-indigo-700',
  industry: 'bg-slate-100 text-slate-700',
  trade: 'bg-rose-100 text-rose-700',
};

const CATEGORY_LABEL_MAP: Record<string, string> = {
  finance: 'المالية',
  economy: 'الاقتصاد',
  realestate: 'العقار',
  energy: 'الطاقة',
  tech: 'التقنية',
  industry: 'الصناعة',
  trade: 'التجارة',
};

// ---------------------------------------------------------------------------
// Mini Preview Component
// ---------------------------------------------------------------------------

const MiniPreview: React.FC<{ type: string }> = ({ type }) => {
  const colors = PREVIEW_COLORS[type] || PREVIEW_COLORS.Chart;

  if (type === 'KPI') {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${colors.bg} flex items-center justify-center rounded-lg`}>
        <div className="text-center">
          <div className={`text-2xl font-bold text-emerald-600`}>٢٤.٧٪</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <TrendingUp size={12} className="text-emerald-500" />
            <span className="text-xs text-emerald-500 font-medium">+٣.٢٪</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'Distribution') {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${colors.bg} flex items-center justify-center rounded-lg`}>
        <div className="relative w-16 h-16">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="4" />
            <circle cx="18" cy="18" r="14" fill="none" stroke="#8b5cf6" strokeWidth="4" strokeDasharray="35 65" strokeLinecap="round" />
            <circle cx="18" cy="18" r="14" fill="none" stroke="#a78bfa" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="-35" strokeLinecap="round" />
            <circle cx="18" cy="18" r="14" fill="none" stroke="#c4b5fd" strokeWidth="4" strokeDasharray="20 80" strokeDashoffset="-60" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    );
  }

  if (type === 'Metric') {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${colors.bg} flex items-end justify-center gap-1 rounded-lg p-3 pb-4`}>
        {[40, 65, 50, 80, 55, 72, 60].map((h, i) => (
          <div
            key={i}
            className="bg-amber-400/70 rounded-t-sm"
            style={{ width: '10%', height: `${h}%` }}
          />
        ))}
      </div>
    );
  }

  // Default: Chart (line chart)
  return (
    <div className={`w-full h-full bg-gradient-to-br ${colors.bg} flex items-end rounded-lg p-3 pb-4 overflow-hidden`}>
      <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
        <polyline
          points="0,35 15,28 30,32 45,18 55,22 70,10 85,15 100,5"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="0,35 15,28 30,32 45,18 55,22 70,10 85,15 100,5 100,40 0,40"
          fill="url(#chartGrad)"
          opacity="0.3"
        />
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const WidgetLibraryPage: React.FC = () => {
  // Data state
  const [widgets, setWidgets] = useState<WidgetItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [dashboards, setDashboards] = useState<DashboardOption[]>([]);

  // Loading / error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeType, setActiveType] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // UI state
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [previewWidget, setPreviewWidget] = useState<WidgetItem | null>(null);
  const [addToDashboardWidget, setAddToDashboardWidget] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [addingToDashboard, setAddingToDashboard] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Data Fetching
  // -------------------------------------------------------------------------

  const fetchWidgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/widgets');
      const data = (res as any).data || res;
      setWidgets(Array.isArray(data) ? data : (data?.data || []));
    } catch (err: any) {
      console.error('[WidgetLibrary] Failed to fetch widgets:', err);
      setError('حدث خطأ أثناء تحميل المؤشرات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/widgets/categories');
      const data = (res as any).data || res;
      setCategories(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      console.error('[WidgetLibrary] Failed to fetch categories:', err);
    }
  }, []);

  const fetchDashboards = useCallback(async () => {
    try {
      const res = await api.get('/users/dashboards');
      const data = (res as any).data || res;
      const list = Array.isArray(data) ? data : (data?.data || []);
      setDashboards(list.map((d: any) => ({
        id: d.id,
        name: d.nameAr || d.name,
        nameAr: d.nameAr,
      })));
    } catch (err) {
      console.error('[WidgetLibrary] Failed to fetch dashboards:', err);
    }
  }, []);

  useEffect(() => {
    fetchWidgets();
    fetchCategories();
    fetchDashboards();
  }, [fetchWidgets, fetchCategories, fetchDashboards]);

  // -------------------------------------------------------------------------
  // Filtering & Sorting
  // -------------------------------------------------------------------------

  const filteredWidgets = useMemo(() => {
    let result = [...widgets];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(w =>
        (w.title || '').toLowerCase().includes(q) ||
        (w.titleAr || '').toLowerCase().includes(q) ||
        (w.description || '').toLowerCase().includes(q) ||
        (w.descriptionAr || '').toLowerCase().includes(q) ||
        (w.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    // Category
    if (activeCategory !== 'all') {
      result = result.filter(w =>
        (w.category || '').toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Type
    if (activeType !== 'all') {
      result = result.filter(w =>
        (w.type || '').toLowerCase() === activeType.toLowerCase()
      );
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) =>
        new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime()
      );
    } else if (sortBy === 'most_used') {
      result.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    } else if (sortBy === 'top_rated') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [widgets, searchQuery, activeCategory, activeType, sortBy]);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  const handleToggleFavorite = useCallback((widgetId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(widgetId)) {
        next.delete(widgetId);
      } else {
        next.add(widgetId);
      }
      return next;
    });
    // Persist to backend (fire-and-forget)
    api.post('/users/favorites', { itemType: 'widget', itemId: widgetId }).catch(() => {});
  }, []);

  const handleAddToDashboard = useCallback(async (widgetId: string, dashboardId: string) => {
    try {
      setAddingToDashboard(widgetId);
      await api.post(`/users/dashboards/${dashboardId}/widgets`, { widgetId });
      setAddSuccess(widgetId);
      setAddToDashboardWidget(null);
      setTimeout(() => setAddSuccess(null), 2500);
    } catch (err) {
      console.error('[WidgetLibrary] Failed to add widget to dashboard:', err);
    } finally {
      setAddingToDashboard(null);
    }
  }, []);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = () => setShowSortDropdown(false);
    if (showSortDropdown) {
      document.addEventListener('click', handler);
      return () => document.removeEventListener('click', handler);
    }
  }, [showSortDropdown]);

  // Close dashboard dropdown on outside click
  useEffect(() => {
    const handler = () => setAddToDashboardWidget(null);
    if (addToDashboardWidget) {
      document.addEventListener('click', handler);
      return () => document.removeEventListener('click', handler);
    }
  }, [addToDashboardWidget]);

  // -------------------------------------------------------------------------
  // Related widgets for detail modal
  // -------------------------------------------------------------------------

  const relatedWidgets = useMemo(() => {
    if (!previewWidget) return [];
    // Try explicit related IDs first, then fallback to same category
    if (previewWidget.relatedWidgetIds && previewWidget.relatedWidgetIds.length > 0) {
      return widgets.filter(w => previewWidget.relatedWidgetIds!.includes(w.id)).slice(0, 4);
    }
    return widgets
      .filter(w => w.id !== previewWidget.id && w.category === previewWidget.category)
      .slice(0, 4);
  }, [previewWidget, widgets]);

  // -------------------------------------------------------------------------
  // Format helpers
  // -------------------------------------------------------------------------

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '---';
    try {
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const getCategoryLabel = (cat: string) => {
    return CATEGORY_LABEL_MAP[cat.toLowerCase()] || cat;
  };

  const getCategoryColor = (cat: string) => {
    return CATEGORY_COLOR_MAP[cat.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const getTypeColor = (type: string) => {
    return TYPE_COLOR_MAP[type] || 'bg-gray-100 text-gray-700';
  };

  const getTypeIcon = (type: string) => {
    return TYPE_ICON_MAP[type] || <BarChart3 size={16} />;
  };

  // -------------------------------------------------------------------------
  // Render: Loading
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-800 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 size={40} className="text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-sm">جاري تحميل مكتبة المؤشرات...</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render: Error
  // -------------------------------------------------------------------------

  if (error && widgets.length === 0) {
    return (
      <div className="min-h-screen bg-slate-800 flex items-center justify-center" dir="rtl">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <p className="text-gray-200 mb-2 font-semibold">خطأ في التحميل</p>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={fetchWidgets}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} />
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render: Main
  // -------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-800" dir="rtl">
      {/* ================================================================= */}
      {/* HEADER */}
      {/* ================================================================= */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                مكتبة المؤشرات والعناصر التحليلية
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">
                استعرض وأضف المؤشرات إلى لوحاتك الخاصة
              </p>
            </div>
            <div className="flex items-center gap-3 text-gray-400 text-sm">
              <Database size={16} />
              <span>{widgets.length} مؤشر متاح</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* SEARCH & FILTER BAR */}
      {/* ================================================================= */}
      <div className="sticky top-0 z-30 bg-slate-800/95 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">

          {/* Row 1: Search + View + Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن مؤشر بالاسم أو الوصف أو الوسم..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* View Mode */}
            <div className="flex items-center bg-slate-700/50 border border-slate-600 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="عرض شبكي"
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="عرض قائمة"
              >
                <List size={18} />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={e => {
                  e.stopPropagation();
                  setShowSortDropdown(prev => !prev);
                }}
                className="flex items-center gap-2 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-gray-300 hover:text-white transition-colors whitespace-nowrap"
              >
                <ArrowUpDown size={16} />
                {SORT_OPTIONS.find(s => s.key === sortBy)?.label}
                <ChevronDown size={14} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showSortDropdown && (
                <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1 w-48 bg-slate-700 border border-slate-600 rounded-xl shadow-xl overflow-hidden z-40">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      onClick={e => {
                        e.stopPropagation();
                        setSortBy(opt.key);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-right px-4 py-2.5 text-sm transition-colors ${
                        sortBy === opt.key
                          ? 'bg-blue-600/20 text-blue-400'
                          : 'text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Filter size={16} className="text-gray-400 shrink-0" />
            {CATEGORY_CHIPS.map(chip => (
              <button
                key={chip.key}
                onClick={() => setActiveCategory(chip.key)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                  activeCategory === chip.key
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-700/60 text-gray-300 hover:bg-slate-600 border border-slate-600/50'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Row 3: Type Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Layers size={16} className="text-gray-400 shrink-0" />
            <span className="text-xs text-gray-500 shrink-0">النوع:</span>
            {TYPE_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setActiveType(opt.key)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                  activeType === opt.key
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-700/60 text-gray-300 hover:bg-slate-600 border border-slate-600/50'
                }`}
              >
                {opt.key !== 'all' && TYPE_ICON_MAP[opt.key]}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* CONTENT AREA */}
      {/* ================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Results Count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-400">
            {filteredWidgets.length === 0
              ? 'لا توجد نتائج'
              : `عرض ${filteredWidgets.length} من ${widgets.length} مؤشر`}
          </p>
          {(activeCategory !== 'all' || activeType !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setActiveType('all');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <X size={14} />
              مسح الفلاتر
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredWidgets.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-500" />
            </div>
            <p className="text-gray-300 font-semibold mb-1">لم يتم العثور على مؤشرات</p>
            <p className="text-gray-500 text-sm">جرّب تعديل معايير البحث أو الفلترة</p>
          </div>
        )}

        {/* =============================================================== */}
        {/* GRID VIEW */}
        {/* =============================================================== */}
        {viewMode === 'grid' && filteredWidgets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredWidgets.map(widget => (
              <div
                key={widget.id}
                className="group bg-slate-700/40 border border-slate-600/50 rounded-2xl overflow-hidden hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300"
              >
                {/* Mini Preview */}
                <div className="h-36 relative overflow-hidden">
                  <MiniPreview type={widget.type} />
                  {/* Overlay Badges */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getCategoryColor(widget.category)}`}>
                      {getCategoryLabel(widget.category)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${getTypeColor(widget.type)}`}>
                      {getTypeIcon(widget.type)}
                      {widget.type}
                    </span>
                  </div>
                  {/* Favorite Button */}
                  <button
                    onClick={() => handleToggleFavorite(widget.id)}
                    className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      favorites.has(widget.id)
                        ? 'bg-yellow-500 text-white'
                        : 'bg-black/30 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/50'
                    }`}
                  >
                    {favorites.has(widget.id) ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">
                    {widget.titleAr || widget.title}
                  </h3>
                  {widget.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                      {widget.descriptionAr || widget.description}
                    </p>
                  )}

                  {/* Meta Row */}
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-4">
                    {widget.source && (
                      <span className="flex items-center gap-1">
                        <Database size={11} />
                        {widget.sourceAr || widget.source}
                      </span>
                    )}
                    {widget.lastUpdated && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {formatDate(widget.lastUpdated)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Add to Dashboard */}
                    <div className="relative flex-1">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setAddToDashboardWidget(
                            addToDashboardWidget === widget.id ? null : widget.id
                          );
                        }}
                        className={`w-full flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg transition-all ${
                          addSuccess === widget.id
                            ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                            : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30'
                        }`}
                      >
                        {addingToDashboard === widget.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : addSuccess === widget.id ? (
                          <>
                            <CheckCircle2 size={14} />
                            تمت الإضافة
                          </>
                        ) : (
                          <>
                            <Plus size={14} />
                            إضافة للوحة
                          </>
                        )}
                      </button>

                      {/* Dashboard Dropdown */}
                      {addToDashboardWidget === widget.id && (
                        <div
                          className="absolute right-0 top-full mt-1 w-56 bg-slate-700 border border-slate-600 rounded-xl shadow-2xl overflow-hidden z-40"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="px-3 py-2 border-b border-slate-600">
                            <p className="text-xs text-gray-400 font-medium">اختر اللوحة</p>
                          </div>
                          {dashboards.length === 0 ? (
                            <div className="px-3 py-4 text-center">
                              <p className="text-xs text-gray-500">لا توجد لوحات بعد</p>
                            </div>
                          ) : (
                            <div className="max-h-48 overflow-y-auto">
                              {dashboards.map(d => (
                                <button
                                  key={d.id}
                                  onClick={() => handleAddToDashboard(widget.id, d.id)}
                                  className="w-full text-right px-3 py-2.5 text-sm text-gray-300 hover:bg-slate-600 transition-colors flex items-center gap-2"
                                >
                                  <Layers size={14} className="text-gray-500 shrink-0" />
                                  <span className="truncate">{d.nameAr || d.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Preview Button */}
                    <button
                      onClick={() => setPreviewWidget(widget)}
                      className="flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg bg-slate-600/50 text-gray-300 hover:bg-slate-600 hover:text-white border border-slate-500/30 transition-all"
                    >
                      <Eye size={14} />
                      معاينة
                    </button>

                    {/* Save / Favorite */}
                    <button
                      onClick={() => handleToggleFavorite(widget.id)}
                      className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-all ${
                        favorites.has(widget.id)
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          : 'bg-slate-600/50 text-gray-400 hover:text-yellow-400 border-slate-500/30 hover:border-yellow-500/30'
                      }`}
                      title="حفظ"
                    >
                      <Star size={14} fill={favorites.has(widget.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =============================================================== */}
        {/* LIST VIEW */}
        {/* =============================================================== */}
        {viewMode === 'list' && filteredWidgets.length > 0 && (
          <div className="space-y-3">
            {filteredWidgets.map(widget => (
              <div
                key={widget.id}
                className="group flex items-center gap-4 bg-slate-700/40 border border-slate-600/50 rounded-xl p-4 hover:border-blue-500/40 hover:shadow-lg transition-all duration-300"
              >
                {/* Mini Preview (Thumbnail) */}
                <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0">
                  <MiniPreview type={widget.type} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-white truncate">
                      {widget.titleAr || widget.title}
                    </h3>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${getCategoryColor(widget.category)}`}>
                      {getCategoryLabel(widget.category)}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 flex items-center gap-0.5 ${getTypeColor(widget.type)}`}>
                      {widget.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-500">
                    {widget.source && (
                      <span className="flex items-center gap-1">
                        <Database size={11} />
                        {widget.sourceAr || widget.source}
                      </span>
                    )}
                    {widget.lastUpdated && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {formatDate(widget.lastUpdated)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setAddToDashboardWidget(
                          addToDashboardWidget === widget.id ? null : widget.id
                        );
                      }}
                      className={`flex items-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg transition-all ${
                        addSuccess === widget.id
                          ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                          : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30'
                      }`}
                    >
                      {addingToDashboard === widget.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : addSuccess === widget.id ? (
                        <>
                          <CheckCircle2 size={14} />
                          تمت الإضافة
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          إضافة للوحة
                        </>
                      )}
                    </button>

                    {addToDashboardWidget === widget.id && (
                      <div
                        className="absolute left-0 top-full mt-1 w-56 bg-slate-700 border border-slate-600 rounded-xl shadow-2xl overflow-hidden z-40"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="px-3 py-2 border-b border-slate-600">
                          <p className="text-xs text-gray-400 font-medium">اختر اللوحة</p>
                        </div>
                        {dashboards.length === 0 ? (
                          <div className="px-3 py-4 text-center">
                            <p className="text-xs text-gray-500">لا توجد لوحات بعد</p>
                          </div>
                        ) : (
                          <div className="max-h-48 overflow-y-auto">
                            {dashboards.map(d => (
                              <button
                                key={d.id}
                                onClick={() => handleAddToDashboard(widget.id, d.id)}
                                className="w-full text-right px-3 py-2.5 text-sm text-gray-300 hover:bg-slate-600 transition-colors flex items-center gap-2"
                              >
                                <Layers size={14} className="text-gray-500 shrink-0" />
                                <span className="truncate">{d.nameAr || d.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setPreviewWidget(widget)}
                    className="flex items-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg bg-slate-600/50 text-gray-300 hover:bg-slate-600 hover:text-white border border-slate-500/30 transition-all"
                  >
                    <Eye size={14} />
                    معاينة
                  </button>

                  <button
                    onClick={() => handleToggleFavorite(widget.id)}
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
                      favorites.has(widget.id)
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        : 'bg-slate-600/50 text-gray-400 hover:text-yellow-400 border-slate-500/30 hover:border-yellow-500/30'
                    }`}
                    title="حفظ"
                  >
                    <Star size={14} fill={favorites.has(widget.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* WIDGET DETAIL MODAL */}
      {/* ================================================================= */}
      {previewWidget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setPreviewWidget(null)}
        >
          <div
            className="bg-slate-800 border border-slate-600/70 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTypeColor(previewWidget.type)}`}>
                  {getTypeIcon(previewWidget.type)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {previewWidget.titleAr || previewWidget.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getCategoryColor(previewWidget.category)}`}>
                      {getCategoryLabel(previewWidget.category)}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getTypeColor(previewWidget.type)}`}>
                      {previewWidget.type}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPreviewWidget(null)}
                className="w-9 h-9 rounded-lg bg-slate-700/50 text-gray-400 hover:text-white hover:bg-slate-600 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {/* Description */}
              {(previewWidget.descriptionAr || previewWidget.description) && (
                <div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {previewWidget.descriptionAr || previewWidget.description}
                  </p>
                </div>
              )}

              {/* Preview Area */}
              <div className="h-56 rounded-xl overflow-hidden border border-slate-600/50">
                <MiniPreview type={previewWidget.type} />
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {previewWidget.source && (
                  <div className="bg-slate-700/40 rounded-xl p-3 border border-slate-600/30">
                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">المصدر</p>
                    <p className="text-sm text-gray-200 font-medium flex items-center gap-1.5">
                      <Database size={13} className="text-blue-400" />
                      {previewWidget.sourceAr || previewWidget.source}
                    </p>
                  </div>
                )}
                {previewWidget.updateFrequency && (
                  <div className="bg-slate-700/40 rounded-xl p-3 border border-slate-600/30">
                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">دورة التحديث</p>
                    <p className="text-sm text-gray-200 font-medium flex items-center gap-1.5">
                      <RefreshCw size={13} className="text-green-400" />
                      {previewWidget.updateFrequency}
                    </p>
                  </div>
                )}
                {previewWidget.dataFormat && (
                  <div className="bg-slate-700/40 rounded-xl p-3 border border-slate-600/30">
                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">صيغة البيانات</p>
                    <p className="text-sm text-gray-200 font-medium flex items-center gap-1.5">
                      <Layers size={13} className="text-purple-400" />
                      {previewWidget.dataFormat}
                    </p>
                  </div>
                )}
                {previewWidget.lastUpdated && (
                  <div className="bg-slate-700/40 rounded-xl p-3 border border-slate-600/30">
                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">آخر تحديث</p>
                    <p className="text-sm text-gray-200 font-medium flex items-center gap-1.5">
                      <Clock size={13} className="text-amber-400" />
                      {formatDate(previewWidget.lastUpdated)}
                    </p>
                  </div>
                )}
                {previewWidget.usageCount != null && (
                  <div className="bg-slate-700/40 rounded-xl p-3 border border-slate-600/30">
                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">عدد الاستخدامات</p>
                    <p className="text-sm text-gray-200 font-medium flex items-center gap-1.5">
                      <Activity size={13} className="text-sky-400" />
                      {previewWidget.usageCount.toLocaleString('ar-SA')}
                    </p>
                  </div>
                )}
                {previewWidget.rating != null && (
                  <div className="bg-slate-700/40 rounded-xl p-3 border border-slate-600/30">
                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">التقييم</p>
                    <p className="text-sm text-gray-200 font-medium flex items-center gap-1.5">
                      <Star size={13} className="text-yellow-400" fill="currentColor" />
                      {previewWidget.rating.toFixed(1)}
                    </p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {previewWidget.tags && previewWidget.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {previewWidget.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[11px] bg-slate-700/60 text-gray-400 px-2.5 py-1 rounded-lg border border-slate-600/30"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Related Widgets */}
              {relatedWidgets.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-300 mb-3">مؤشرات ذات صلة</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {relatedWidgets.map(rw => (
                      <button
                        key={rw.id}
                        onClick={() => setPreviewWidget(rw)}
                        className="flex items-center gap-2.5 bg-slate-700/40 border border-slate-600/30 rounded-xl p-2.5 hover:border-blue-500/30 transition-all text-right"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                          <MiniPreview type={rw.type} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-gray-200 truncate">
                            {rw.titleAr || rw.title}
                          </p>
                          <p className="text-[10px] text-gray-500">{rw.type}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-3 p-5 border-t border-slate-700">
              <div className="relative flex-1">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setAddToDashboardWidget(
                      addToDashboardWidget === previewWidget.id ? null : previewWidget.id
                    );
                  }}
                  className={`w-full flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-xl transition-all ${
                    addSuccess === previewWidget.id
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {addingToDashboard === previewWidget.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : addSuccess === previewWidget.id ? (
                    <>
                      <CheckCircle2 size={16} />
                      تمت الإضافة بنجاح
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      إضافة إلى لوحة التحكم
                    </>
                  )}
                </button>

                {addToDashboardWidget === previewWidget.id && (
                  <div
                    className="absolute right-0 bottom-full mb-1 w-full bg-slate-700 border border-slate-600 rounded-xl shadow-2xl overflow-hidden z-50"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="px-3 py-2 border-b border-slate-600">
                      <p className="text-xs text-gray-400 font-medium">اختر اللوحة</p>
                    </div>
                    {dashboards.length === 0 ? (
                      <div className="px-3 py-4 text-center">
                        <p className="text-xs text-gray-500">لا توجد لوحات بعد</p>
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto">
                        {dashboards.map(d => (
                          <button
                            key={d.id}
                            onClick={() => handleAddToDashboard(previewWidget.id, d.id)}
                            className="w-full text-right px-3 py-2.5 text-sm text-gray-300 hover:bg-slate-600 transition-colors flex items-center gap-2"
                          >
                            <Layers size={14} className="text-gray-500 shrink-0" />
                            <span className="truncate">{d.nameAr || d.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleToggleFavorite(previewWidget.id)}
                className={`flex items-center gap-2 text-sm font-medium py-2.5 px-4 rounded-xl border transition-all ${
                  favorites.has(previewWidget.id)
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                    : 'bg-slate-700 text-gray-300 border-slate-600 hover:border-yellow-500/40 hover:text-yellow-400'
                }`}
              >
                <Bookmark size={16} fill={favorites.has(previewWidget.id) ? 'currentColor' : 'none'} />
                حفظ
              </button>

              <button
                onClick={() => setPreviewWidget(null)}
                className="text-sm font-medium py-2.5 px-4 rounded-xl bg-slate-700 text-gray-400 hover:text-white border border-slate-600 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetLibraryPage;
