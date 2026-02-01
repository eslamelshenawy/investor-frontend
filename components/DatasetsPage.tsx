/**
 * Datasets Page - صفحة مجموعات البيانات
 * Client-side filtering - الفلترة تتم محلياً بدون إعادة تحميل
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    Database,
    Filter,
    Grid3X3,
    List,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Building2,
    FileSpreadsheet,
    Download,
    ExternalLink,
    Loader2,
    RefreshCw,
    X,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    BarChart3,
    Layers,
    Tag,
    Clock,
    Globe,
    ArrowUpRight
} from 'lucide-react';
import { fetchDatasetsList, DatasetInfo } from '../src/services/dataFetcher';

// ============================================
// TYPES
// ============================================

interface Dataset {
    id: string;
    externalId: string;
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    category: string;
    source: string;
    sourceUrl: string | null;
    recordCount: number;
    columns: string[];
    lastSyncAt: string;
    syncStatus: string;
    updatedAt: string;
}

interface CategoryCount {
    name: string;
    count: number;
}

// ============================================
// CONSTANTS
// ============================================

const ITEMS_PER_PAGE = 24;

const CATEGORY_ICONS: Record<string, React.ElementType> = {
    'العدل': Building2,
    'السكان والإسكان': Building2,
    'اقتصاد وطني': TrendingUp,
    'التعليم والتدريب': Building2,
    'الصحة': Building2,
    'المالية': BarChart3,
    'الاستثمار': TrendingUp,
    'الصناعة': Building2,
    'النقل والمواصلات': Building2,
    'default': Database
};

// ============================================
// COMPONENTS
// ============================================

const DatasetsPage: React.FC = () => {
    // All datasets (loaded once)
    const [allDatasets, setAllDatasets] = useState<Dataset[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filters (client-side)
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    // Pagination (client-side)
    const [currentPage, setCurrentPage] = useState(1);

    // View
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // ============================================
    // LOAD ALL DATASETS ONCE
    // ============================================

    const loadAllDatasets = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('🌐 جلب جميع مجموعات البيانات...');

            // Try to get all datasets (use large limit)
            const result = await fetchDatasetsList({
                page: 1,
                limit: 10000, // Get all
                forceRefresh: false,
            });

            if (result.datasets.length > 0) {
                const data: Dataset[] = result.datasets.map((d: DatasetInfo) => ({
                    id: d.id,
                    externalId: d.id,
                    name: d.titleEn || d.titleAr,
                    nameAr: d.titleAr,
                    description: d.descriptionEn || '',
                    descriptionAr: d.descriptionAr || '',
                    category: d.category || 'أخرى',
                    source: d.organization || 'open.data.gov.sa',
                    sourceUrl: null,
                    recordCount: d.recordCount || 0,
                    columns: [],
                    lastSyncAt: d.updatedAt || '',
                    syncStatus: 'SUCCESS',
                    updatedAt: d.updatedAt || new Date().toISOString(),
                }));

                setAllDatasets(data);
                console.log(`✅ تم تحميل ${data.length} مجموعة بيانات`);
            } else {
                console.log('⚠️ لم يتم العثور على بيانات');
                setError('لم يتم العثور على بيانات');
            }
        } catch (err: any) {
            console.error('Error loading datasets:', err);
            setError(`فشل في تحميل البيانات: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Load on mount
    useEffect(() => {
        loadAllDatasets();
    }, []);

    // ============================================
    // CLIENT-SIDE FILTERING (NO API CALLS)
    // ============================================

    const filteredDatasets = useMemo(() => {
        let result = [...allDatasets];

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter(d =>
                d.nameAr?.toLowerCase().includes(query) ||
                d.name?.toLowerCase().includes(query) ||
                d.descriptionAr?.toLowerCase().includes(query) ||
                d.description?.toLowerCase().includes(query) ||
                d.category?.toLowerCase().includes(query)
            );
        }

        // Filter by category
        if (selectedCategory) {
            result = result.filter(d => d.category === selectedCategory);
        }

        // Filter by status
        if (selectedStatus) {
            result = result.filter(d => d.syncStatus === selectedStatus);
        }

        return result;
    }, [allDatasets, searchQuery, selectedCategory, selectedStatus]);

    // ============================================
    // CLIENT-SIDE PAGINATION
    // ============================================

    const totalPages = Math.ceil(filteredDatasets.length / ITEMS_PER_PAGE);

    const paginatedDatasets = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return filteredDatasets.slice(start, end);
    }, [filteredDatasets, currentPage]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory, selectedStatus]);

    // ============================================
    // DYNAMIC CATEGORIES FROM DATA
    // ============================================

    const categories = useMemo(() => {
        const counts: Record<string, number> = {};
        allDatasets.forEach(d => {
            const cat = d.category || 'أخرى';
            counts[cat] = (counts[cat] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [allDatasets]);

    // ============================================
    // HANDLERS
    // ============================================

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory(null);
        setSelectedStatus(null);
    };

    const hasFilters = searchQuery || selectedCategory || selectedStatus;

    // Format date
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get category icon
    const getCategoryIcon = (category: string) => {
        return CATEGORY_ICONS[category] || CATEGORY_ICONS['default'];
    };

    // ============================================
    // RENDER
    // ============================================

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">جاري تحميل مجموعات البيانات...</p>
                    <p className="text-gray-400 text-sm mt-2">يتم تحميل جميع البيانات مرة واحدة للفلترة السريعة</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-[#002B5C] via-[#003d7a] to-[#00A3E0] text-white">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                            <Database size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-black">مجموعات البيانات</h1>
                            <p className="text-blue-100 mt-1">استكشف البيانات المفتوحة من المصادر الحكومية السعودية</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <p className="text-blue-100 text-sm">إجمالي المجموعات</p>
                            <p className="text-3xl font-black mt-1">{allDatasets.length.toLocaleString('ar-SA')}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <p className="text-blue-100 text-sm">نتائج البحث</p>
                            <p className="text-3xl font-black mt-1">{filteredDatasets.length.toLocaleString('ar-SA')}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <p className="text-blue-100 text-sm">التصنيفات</p>
                            <p className="text-3xl font-black mt-1">{categories.length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <p className="text-blue-100 text-sm">المصدر</p>
                            <p className="text-lg font-bold mt-1 flex items-center gap-2">
                                البيانات المفتوحة
                                <Globe size={16} />
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-8 relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ابحث في مجموعات البيانات... (الفلترة فورية)"
                            className="w-full bg-white text-gray-900 rounded-xl py-4 pr-12 pl-4 text-lg shadow-lg focus:ring-4 focus:ring-white/30 outline-none"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar - Categories */}
                    <aside className="lg:w-72 shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-4">
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100 bg-gray-50">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Filter size={18} className="text-blue-600" />
                                    التصنيفات
                                    <span className="text-xs text-gray-500 font-normal">(فلترة فورية)</span>
                                </h3>
                            </div>

                            {/* Categories List */}
                            <div className="p-2 max-h-[60vh] overflow-y-auto">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                                        !selectedCategory
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <Layers size={16} />
                                        <span className="font-medium">جميع التصنيفات</span>
                                    </span>
                                    <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full">
                                        {allDatasets.length}
                                    </span>
                                </button>

                                {categories.map(cat => {
                                    const Icon = getCategoryIcon(cat.name);
                                    const isSelected = selectedCategory === cat.name;
                                    return (
                                        <button
                                            key={cat.name}
                                            onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all mt-1 ${
                                                isSelected
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                    : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Icon size={16} />
                                                <span className="font-medium text-sm truncate">{cat.name}</span>
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                isSelected
                                                    ? 'bg-blue-200 text-blue-800'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {cat.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {/* Toolbar */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <p className="text-gray-600">
                                    <span className="font-bold text-gray-900">{filteredDatasets.length}</span> مجموعة بيانات
                                    {totalPages > 1 && <span className="text-gray-400"> (صفحة {currentPage} من {totalPages})</span>}
                                    {hasFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="mr-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                        >
                                            مسح الفلاتر
                                        </button>
                                    )}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => loadAllDatasets()}
                                    disabled={loading}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 disabled:opacity-50"
                                    title="إعادة تحميل البيانات"
                                >
                                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                                </button>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-md transition-all ${
                                            viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                                        }`}
                                    >
                                        <Grid3X3 size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-md transition-all ${
                                            viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                                        }`}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters */}
                        {hasFilters && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {selectedCategory && (
                                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
                                        <Tag size={14} />
                                        {selectedCategory}
                                        <button onClick={() => setSelectedCategory(null)} className="hover:bg-blue-200 rounded-full p-0.5">
                                            <X size={14} />
                                        </button>
                                    </span>
                                )}
                                {selectedStatus && (
                                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
                                        <CheckCircle2 size={14} />
                                        {selectedStatus === 'SUCCESS' ? 'متزامن' : selectedStatus === 'PENDING' ? 'قيد الانتظار' : 'فشل'}
                                        <button onClick={() => setSelectedStatus(null)} className="hover:bg-green-200 rounded-full p-0.5">
                                            <X size={14} />
                                        </button>
                                    </span>
                                )}
                                {searchQuery && (
                                    <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium">
                                        <Search size={14} />
                                        "{searchQuery}"
                                        <button onClick={() => setSearchQuery('')} className="hover:bg-purple-200 rounded-full p-0.5">
                                            <X size={14} />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Dataset Grid/List */}
                        {paginatedDatasets.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Database size={40} className="text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {hasFilters ? 'لا توجد نتائج للبحث' : 'لا توجد بيانات'}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {hasFilters
                                        ? 'جرب تغيير معايير البحث أو إزالة الفلاتر'
                                        : 'جرب إعادة المحاولة لتحميل البيانات'}
                                </p>
                                {hasFilters ? (
                                    <button
                                        onClick={clearFilters}
                                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                                    >
                                        <X size={18} />
                                        إزالة الفلاتر
                                    </button>
                                ) : (
                                    <button
                                        onClick={loadAllDatasets}
                                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                                    >
                                        <RefreshCw size={18} />
                                        إعادة المحاولة
                                    </button>
                                )}
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {paginatedDatasets.map(dataset => (
                                    <DatasetCard key={dataset.id} dataset={dataset} formatDate={formatDate} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {paginatedDatasets.map(dataset => (
                                    <DatasetListItem key={dataset.id} dataset={dataset} formatDate={formatDate} />
                                ))}
                            </div>
                        )}

                        {/* Pagination - Client-side */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    الأولى
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={18} />
                                    <span>السابق</span>
                                </button>

                                <div className="flex items-center gap-1">
                                    {/* Page numbers */}
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                                                    currentPage === pageNum
                                                        ? 'bg-blue-600 text-white'
                                                        : 'border border-gray-200 hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= totalPages}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>التالي</span>
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    الأخيرة
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

// Dataset Card Component
const DatasetCard: React.FC<{ dataset: Dataset; formatDate: (d: string) => string }> = ({ dataset, formatDate }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer">
            {/* Header */}
            <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-green-100 text-green-700">
                        متزامن
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded truncate max-w-[120px]">
                        {dataset.category}
                    </span>
                </div>

                <h3 className="font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {dataset.nameAr || dataset.name}
                </h3>
            </div>

            {/* Body */}
            <div className="p-5">
                <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                    {dataset.descriptionAr || dataset.description || 'لا يوجد وصف'}
                </p>

                {/* Meta */}
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Globe size={14} className="text-blue-500" />
                        <span className="truncate">{dataset.source}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                        <Calendar size={14} className="text-green-500" />
                        <span>{formatDate(dataset.lastSyncAt)}</span>
                    </div>
                    {dataset.recordCount > 0 && (
                        <div className="flex items-center gap-2 text-gray-500">
                            <FileSpreadsheet size={14} className="text-purple-500" />
                            <span>{dataset.recordCount.toLocaleString('ar-SA')} سجل</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">ID: {dataset.externalId?.slice(0, 8)}...</span>
                <button className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:gap-2 transition-all">
                    <span>استعراض</span>
                    <ArrowUpRight size={14} />
                </button>
            </div>
        </div>
    );
};

// Dataset List Item Component
const DatasetListItem: React.FC<{ dataset: Dataset; formatDate: (d: string) => string }> = ({ dataset, formatDate }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-5 flex gap-5 group cursor-pointer">
            {/* Icon */}
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <Database size={24} className="text-blue-600" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {dataset.nameAr || dataset.name}
                    </h3>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 bg-green-100 text-green-700">
                        متزامن
                    </span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {dataset.descriptionAr || dataset.description || 'لا يوجد وصف'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded truncate max-w-[150px]">{dataset.category}</span>
                    <span className="flex items-center gap-1">
                        <Globe size={12} />
                        {dataset.source}
                    </span>
                    <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(dataset.lastSyncAt)}
                    </span>
                    {dataset.recordCount > 0 && (
                        <span className="flex items-center gap-1">
                            <FileSpreadsheet size={12} />
                            {dataset.recordCount.toLocaleString('ar-SA')} سجل
                        </span>
                    )}
                </div>
            </div>

            {/* Action */}
            <button className="self-center p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                <ArrowUpRight size={20} />
            </button>
        </div>
    );
};

export default DatasetsPage;
