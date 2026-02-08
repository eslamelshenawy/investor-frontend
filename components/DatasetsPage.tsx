/**
 * Datasets Page - صفحة مجموعات البيانات
 * UI/UX محسّن
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Database,
    Filter,
    Grid3X3,
    List,
    Calendar,
    Building2,
    FileSpreadsheet,
    Loader2,
    RefreshCw,
    X,
    TrendingUp,
    BarChart3,
    Layers,
    Tag,
    Globe,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Zap,
    SlidersHorizontal,
    LayoutGrid,
    TableProperties,
    Sparkles,
    Activity,
    Eye,
    Wifi
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface Dataset {
    id: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    category: string;
    organization: string;
    recordCount: number;
    updatedAt: string;
}

interface CategoryCount {
    name: string;
    count: number;
}

// ============================================
// CONSTANTS
// ============================================

const API_URL = import.meta.env.VITE_API_URL || '/api';
const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE = 300;

// ============================================
// MAIN COMPONENT
// ============================================

const DatasetsPage: React.FC = () => {
    // Data State
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [categories, setCategories] = useState<CategoryCount[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Loading State
    const [loading, setLoading] = useState(true);
    const [streaming, setStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filters & Pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // View
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);

    // Refs for EventSource cleanup
    const datasetsEventSourceRef = useRef<EventSource | null>(null);
    const categoriesEventSourceRef = useRef<EventSource | null>(null);

    // ============================================
    // DEBOUNCE SEARCH
    // ============================================

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, SEARCH_DEBOUNCE);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // ============================================
    // FETCH DATA with WebFlux SSE Streaming
    // ============================================

    // WebFlux SSE Stream for Datasets
    const streamDatasets = useCallback((page: number, search: string, category: string | null) => {
        // Close existing connection
        if (datasetsEventSourceRef.current) {
            datasetsEventSourceRef.current.close();
        }

        setLoading(true);
        setStreaming(true);
        setError(null);
        setDatasets([]);

        const params = new URLSearchParams({
            page: String(page),
            limit: String(PAGE_SIZE),
        });
        if (search) params.append('search', search);
        if (category) params.append('category', category);

        const url = `${API_URL}/datasets/stream?${params}`;
        console.log('[WebFlux] Connecting to datasets stream:', url);

        const eventSource = new EventSource(url);
        datasetsEventSourceRef.current = eventSource;

        eventSource.addEventListener('meta', (e) => {
            try {
                const meta = JSON.parse(e.data);
                console.log('[WebFlux] Received meta:', meta);
                setTotalCount(meta.total || 0);
                setTotalPages(meta.totalPages || Math.ceil((meta.total || 0) / PAGE_SIZE));
                setLoading(false);
            } catch (err) {
                console.error('[WebFlux] Error parsing meta:', err);
            }
        });

        eventSource.addEventListener('dataset', (e) => {
            try {
                const dataset = JSON.parse(e.data);
                console.log('[WebFlux] Received dataset:', dataset.titleAr || dataset.titleEn);
                setDatasets(prev => {
                    if (prev.some(d => d.id === dataset.id)) return prev;
                    return [...prev, dataset];
                });
            } catch (err) {
                console.error('[WebFlux] Error parsing dataset:', err);
            }
        });

        eventSource.addEventListener('complete', () => {
            console.log('[WebFlux] Datasets stream complete');
            setStreaming(false);
            setLoading(false);
            eventSource.close();
        });

        eventSource.onerror = (err) => {
            console.error('[WebFlux] Datasets stream error:', err);
            eventSource.close();
            // Fallback to regular API
            fetchDatasetsRegular(page, search, category);
        };
    }, []);

    // Regular API fallback for datasets
    const fetchDatasetsRegular = useCallback(async (page: number, search: string, category: string | null) => {
        try {
            console.log('[API] Fetching datasets via regular API...');
            const params = new URLSearchParams({
                page: String(page),
                limit: String(PAGE_SIZE),
            });
            if (search) params.append('search', search);
            if (category) params.append('category', category);

            const response = await fetch(`${API_URL}/datasets/saudi?${params}`, {
                headers: { 'Accept': 'application/json' },
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            if (data.success && data.data) {
                setDatasets(data.data.datasets || []);
                setTotalCount(data.data.meta?.total || 0);
                setTotalPages(data.data.meta?.totalPages || Math.ceil((data.data.meta?.total || 0) / PAGE_SIZE));
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setStreaming(false);
        }
    }, []);

    // WebFlux SSE Stream for Categories
    const streamCategories = useCallback(() => {
        // Close existing connection
        if (categoriesEventSourceRef.current) {
            categoriesEventSourceRef.current.close();
        }

        const url = `${API_URL}/datasets/categories/stream`;
        console.log('[WebFlux] Connecting to categories stream:', url);

        const eventSource = new EventSource(url);
        categoriesEventSourceRef.current = eventSource;

        eventSource.addEventListener('category', (e) => {
            try {
                const category = JSON.parse(e.data);
                console.log('[WebFlux] Received category:', category.name);
                setCategories(prev => {
                    if (prev.some(c => c.name === category.name)) return prev;
                    return [...prev, category];
                });
            } catch (err) {
                console.error('[WebFlux] Error parsing category:', err);
            }
        });

        eventSource.addEventListener('complete', () => {
            console.log('[WebFlux] Categories stream complete');
            eventSource.close();
        });

        eventSource.onerror = () => {
            eventSource.close();
            // Fallback to regular API
            fetchCategoriesRegular();
        };
    }, []);

    // Regular API fallback for categories
    const fetchCategoriesRegular = useCallback(async () => {
        try {
            console.log('[API] Fetching categories via regular API...');
            const response = await fetch(`${API_URL}/datasets/categories`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    setCategories(data.data);
                }
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    }, []);

    // ============================================
    // EFFECTS
    // ============================================

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, selectedCategory]);

    useEffect(() => {
        streamDatasets(currentPage, debouncedSearch, selectedCategory);
    }, [currentPage, debouncedSearch, selectedCategory, streamDatasets]);

    useEffect(() => {
        streamCategories();

        // Cleanup on unmount
        return () => {
            if (datasetsEventSourceRef.current) {
                datasetsEventSourceRef.current.close();
            }
            if (categoriesEventSourceRef.current) {
                categoriesEventSourceRef.current.close();
            }
        };
    }, [streamCategories]);

    // ============================================
    // HANDLERS
    // ============================================

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setSearchQuery('');
        setDebouncedSearch('');
        setSelectedCategory(null);
        setCurrentPage(1);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const hasFilters = searchQuery || selectedCategory;

    // ============================================
    // RENDER
    // ============================================

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
            {/* ========== HEADER ========== */}
            <header className="relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                    </div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                    {/* Title Section */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                                <Database className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                                    مجموعات البيانات
                                </h1>
                                <p className="text-blue-200 mt-1 flex items-center gap-2 text-sm lg:text-base">
                                    <Activity className="w-4 h-4" />
                                    بيانات حية من البوابة الوطنية للبيانات المفتوحة
                                </p>
                            </div>
                        </div>

                        {/* Live Badge */}
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                </span>
                                <span className="text-white text-sm font-medium">متصل بقاعدة البيانات</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
                        <StatCard
                            icon={<Database className="w-5 h-5" />}
                            label="إجمالي المجموعات"
                            value={totalCount}
                            color="blue"
                        />
                        <StatCard
                            icon={<Layers className="w-5 h-5" />}
                            label="التصنيفات"
                            value={categories.length}
                            color="purple"
                        />
                        <StatCard
                            icon={<FileSpreadsheet className="w-5 h-5" />}
                            label="الصفحة الحالية"
                            value={currentPage}
                            suffix={`/ ${totalPages}`}
                            color="emerald"
                        />
                        <StatCard
                            icon={<Eye className="w-5 h-5" />}
                            label="يُعرض الآن"
                            value={datasets.length}
                            color="amber"
                        />
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث في مجموعات البيانات..."
                                className="w-full bg-white/95 backdrop-blur-sm text-slate-900 rounded-2xl py-4 px-12 text-lg shadow-xl border-0 focus:ring-4 focus:ring-white/30 outline-none placeholder:text-slate-400 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        {searchQuery && (
                            <p className="text-blue-200 text-sm mt-3 text-center">
                                جاري البحث عن "{searchQuery}"...
                            </p>
                        )}
                    </div>
                </div>
            </header>

            {/* ========== MAIN CONTENT ========== */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* ========== SIDEBAR ========== */}
                    <aside className="lg:w-80 shrink-0">
                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden w-full bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between mb-4 shadow-sm"
                        >
                            <span className="flex items-center gap-2 font-semibold text-slate-700">
                                <SlidersHorizontal className="w-5 h-5" />
                                التصنيفات والفلاتر
                            </span>
                            <ChevronLeft className={`w-5 h-5 text-slate-400 transition-transform ${showFilters ? 'rotate-90' : '-rotate-90'}`} />
                        </button>

                        {/* Categories Panel */}
                        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${showFilters ? 'block' : 'hidden lg:block'}`}>
                            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-blue-600" />
                                    التصنيفات
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">اختر تصنيفاً لتصفية النتائج</p>
                            </div>

                            <div className="p-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                                {/* All Categories Button */}
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all mb-2 ${
                                        !selectedCategory
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                                            : 'hover:bg-slate-50 text-slate-700'
                                    }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                            !selectedCategory ? 'bg-white/20' : 'bg-blue-100'
                                        }`}>
                                            <LayoutGrid className={`w-4 h-4 ${!selectedCategory ? 'text-white' : 'text-blue-600'}`} />
                                        </div>
                                        <span className="font-semibold">الكل</span>
                                    </span>
                                    <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
                                        !selectedCategory ? 'bg-white/20' : 'bg-slate-100'
                                    }`}>
                                        {totalCount.toLocaleString('ar-SA')}
                                    </span>
                                </button>

                                {/* Category List */}
                                {categories.map(cat => {
                                    const isSelected = selectedCategory === cat.name;
                                    return (
                                        <button
                                            key={cat.name}
                                            onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all mb-1 ${
                                                isSelected
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                                                    : 'hover:bg-slate-50 text-slate-700'
                                            }`}
                                        >
                                            <span className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                                    isSelected ? 'bg-white/20' : 'bg-slate-100'
                                                }`}>
                                                    <Tag className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                                                </div>
                                                <span className="font-medium text-sm truncate max-w-[140px]">{cat.name}</span>
                                            </span>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                                isSelected ? 'bg-white/20' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {cat.count.toLocaleString('ar-SA')}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    {/* ========== CONTENT AREA ========== */}
                    <div className="flex-1 min-w-0">
                        {/* Toolbar */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <p className="text-slate-600">
                                        <span className="font-bold text-slate-900 text-lg">{totalCount.toLocaleString('ar-SA')}</span>
                                        <span className="text-slate-500 mr-1">مجموعة بيانات</span>
                                    </p>
                                    {hasFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="flex items-center gap-1.5 text-red-600 hover:text-red-700 text-sm font-medium bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                            مسح الفلاتر
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => streamDatasets(currentPage, debouncedSearch, selectedCategory)}
                                        disabled={loading || streaming}
                                        className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 disabled:opacity-50 transition-colors"
                                        title="تحديث"
                                    >
                                        <RefreshCw className={`w-5 h-5 ${loading || streaming ? 'animate-spin' : ''}`} />
                                    </button>

                                    <div className="flex bg-slate-100 rounded-xl p-1">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2.5 rounded-lg transition-all ${
                                                viewMode === 'grid'
                                                    ? 'bg-white shadow-sm text-blue-600'
                                                    : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                            title="عرض شبكي"
                                        >
                                            <Grid3X3 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2.5 rounded-lg transition-all ${
                                                viewMode === 'list'
                                                    ? 'bg-white shadow-sm text-blue-600'
                                                    : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                            title="عرض قائمة"
                                        >
                                            <TableProperties className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Active Filters */}
                            {hasFilters && (
                                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                                    {selectedCategory && (
                                        <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                                            <Tag className="w-3.5 h-3.5" />
                                            {selectedCategory}
                                            <button onClick={() => setSelectedCategory(null)} className="hover:bg-blue-200 rounded p-0.5 transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </span>
                                    )}
                                    {searchQuery && (
                                        <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                                            <Search className="w-3.5 h-3.5" />
                                            {searchQuery}
                                            <button onClick={() => setSearchQuery('')} className="hover:bg-purple-200 rounded p-0.5 transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* WebFlux Streaming Indicator */}
                        {streaming && datasets.length > 0 && (
                            <div className="flex items-center justify-center gap-2 mb-6">
                                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-sm text-blue-600">
                                    <Wifi className="w-4 h-4 animate-pulse" />
                                    <span>جاري تحميل المزيد من البيانات عبر WebFlux...</span>
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        {loading && datasets.length === 0 ? (
                            <LoadingState />
                        ) : error ? (
                            <ErrorState error={error} onRetry={() => streamDatasets(currentPage, debouncedSearch, selectedCategory)} />
                        ) : datasets.length === 0 ? (
                            <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
                        ) : (
                            <>
                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {datasets.map(dataset => (
                                            <DatasetCard key={dataset.id} dataset={dataset} formatDate={formatDate} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {datasets.map(dataset => (
                                            <DatasetListItem key={dataset.id} dataset={dataset} formatDate={formatDate} />
                                        ))}
                                    </div>
                                )}

                                {/* Pagination */}
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

// ============================================
// STAT CARD COMPONENT
// ============================================

const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: number;
    suffix?: string;
    color: 'blue' | 'purple' | 'emerald' | 'amber';
}> = ({ icon, label, value, suffix, color }) => {
    const colors = {
        blue: 'from-blue-500/20 to-blue-600/20 border-blue-400/30',
        purple: 'from-purple-500/20 to-purple-600/20 border-purple-400/30',
        emerald: 'from-emerald-500/20 to-emerald-600/20 border-emerald-400/30',
        amber: 'from-amber-500/20 to-amber-600/20 border-amber-400/30',
    };

    const iconColors = {
        blue: 'text-blue-300',
        purple: 'text-purple-300',
        emerald: 'text-emerald-300',
        amber: 'text-amber-300',
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color]} backdrop-blur-sm rounded-2xl p-4 border`}>
            <div className="flex items-center gap-2 mb-2">
                <span className={iconColors[color]}>{icon}</span>
                <span className="text-blue-100 text-xs lg:text-sm">{label}</span>
            </div>
            <p className="text-2xl lg:text-3xl font-black text-white">
                {value.toLocaleString('ar-SA')}
                {suffix && <span className="text-base lg:text-lg font-medium text-blue-200 mr-1">{suffix}</span>}
            </p>
        </div>
    );
};

// ============================================
// LOADING STATE
// ============================================

const LoadingState: React.FC = () => (
    <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-4 mx-auto w-fit">
                <Wifi className="w-5 h-5 animate-pulse text-blue-600" />
                <span className="text-blue-600 font-medium">WebFlux Stream</span>
            </div>
            <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-100 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-slate-600 font-medium mt-6">جاري تحميل البيانات...</p>
            <p className="text-slate-400 text-sm mt-1">يتم جلب البيانات عبر WebFlux streaming</p>
        </div>
    </div>
);

// ============================================
// ERROR STATE
// ============================================

const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
    <div className="text-center py-16">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">حدث خطأ</h3>
        <p className="text-slate-600 mb-6">{error}</p>
        <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-600/25"
        >
            <RefreshCw className="w-5 h-5" />
            إعادة المحاولة
        </button>
    </div>
);

// ============================================
// EMPTY STATE
// ============================================

const EmptyState: React.FC<{ hasFilters: boolean; onClear: () => void }> = ({ hasFilters, onClear }) => (
    <div className="text-center py-16">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Database className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد نتائج</h3>
        <p className="text-slate-600 mb-6">
            {hasFilters ? 'جرب تغيير معايير البحث أو إزالة الفلاتر' : 'لا توجد بيانات متاحة حالياً'}
        </p>
        {hasFilters && (
            <button
                onClick={onClear}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
                <X className="w-5 h-5" />
                إزالة الفلاتر
            </button>
        )}
    </div>
);

// ============================================
// PAGINATION COMPONENT
// ============================================

const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="mt-10 mb-4">
            <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    title="الصفحة الأولى"
                >
                    <ChevronsRight className="w-5 h-5 text-slate-600" />
                </button>

                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    title="السابق"
                >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>

                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, idx) =>
                        page === '...' ? (
                            <span key={`dots-${idx}`} className="px-3 text-slate-400">•••</span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => onPageChange(page as number)}
                                className={`min-w-[44px] h-11 rounded-xl font-semibold transition-all ${
                                    currentPage === page
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                                }`}
                            >
                                {(page as number).toLocaleString('ar-SA')}
                            </button>
                        )
                    )}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    title="التالي"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>

                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    title="الصفحة الأخيرة"
                >
                    <ChevronsLeft className="w-5 h-5 text-slate-600" />
                </button>
            </div>

            <p className="text-center text-slate-500 text-sm mt-4">
                صفحة <span className="font-bold text-slate-700">{currentPage.toLocaleString('ar-SA')}</span> من <span className="font-bold text-slate-700">{totalPages.toLocaleString('ar-SA')}</span>
            </p>
        </div>
    );
};

// ============================================
// DATASET CARD COMPONENT
// ============================================

const DatasetCard: React.FC<{ dataset: Dataset; formatDate: (d: string) => string }> = ({ dataset, formatDate }) => {
    const navigate = useNavigate();
    return (
    <div onClick={() => navigate(`/data/${dataset.id}`)} className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-300 overflow-hidden cursor-pointer">
        {/* Header */}
        <div className="p-5 border-b border-slate-100">
            <div className="flex items-start justify-between gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    متاح
                </span>
                <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg truncate max-w-[120px]">
                    {dataset.category || 'عام'}
                </span>
            </div>
            <h3 className="font-bold text-slate-900 leading-relaxed line-clamp-2 group-hover:text-blue-600 transition-colors">
                {dataset.titleAr || dataset.titleEn}
            </h3>
        </div>

        {/* Body */}
        <div className="p-5">
            <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-5">
                {dataset.descriptionAr || dataset.descriptionEn || 'لا يوجد وصف متاح لهذه المجموعة'}
            </p>

            <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm text-slate-500">
                    <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="truncate">{dataset.organization || 'البوابة الوطنية'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-500">
                    <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{formatDate(dataset.updatedAt)}</span>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">{dataset.id?.slice(0, 8)}...</span>
            <span className="flex items-center gap-1.5 text-blue-600 text-sm font-semibold group-hover:gap-2.5 transition-all">
                استعراض
                <ArrowUpRight className="w-4 h-4" />
            </span>
        </div>
    </div>
    );
};

// ============================================
// DATASET LIST ITEM COMPONENT
// ============================================

const DatasetListItem: React.FC<{ dataset: Dataset; formatDate: (d: string) => string }> = ({ dataset, formatDate }) => {
    const navigate = useNavigate();
    return (
    <div onClick={() => navigate(`/data/${dataset.id}`)} className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all p-5 flex gap-5 cursor-pointer">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
            <Database className="w-7 h-7 text-white" />
        </div>

        <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {dataset.titleAr || dataset.titleEn}
                </h3>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    متاح
                </span>
            </div>

            <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                {dataset.descriptionAr || dataset.descriptionEn || 'لا يوجد وصف'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg">{dataset.category || 'عام'}</span>
                <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    {dataset.organization || 'البوابة الوطنية'}
                </span>
                <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(dataset.updatedAt)}
                </span>
            </div>
        </div>

        <span className="self-center p-3 hover:bg-blue-50 rounded-xl text-blue-600 transition-colors">
            <ArrowUpRight className="w-5 h-5" />
        </span>
    </div>
    );
};

export default DatasetsPage;
