/**
 * Datasets Page - صفحة مجموعات البيانات
 *
 * ✅ Real-time من Database مباشرة
 * ✅ Pagination - تنقل بين الصفحات
 * ✅ تحديث أوتوماتيكي
 */

import React, { useState, useEffect, useCallback } from 'react';
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
    Zap
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

const API_URL = import.meta.env.VITE_API_URL || 'https://investor-backend-3p3m.onrender.com/api';
const PAGE_SIZE = 24; // عدد العناصر في الصفحة
const SEARCH_DEBOUNCE = 300;

const CATEGORY_ICONS: Record<string, React.ElementType> = {
    'العدل': Building2,
    'السكان والإسكان': Building2,
    'اقتصاد وطني': TrendingUp,
    'التعليم والتدريب': Building2,
    'الصحة': Building2,
    'المالية': BarChart3,
    'الاستثمار': TrendingUp,
    'default': Database
};

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
    const [error, setError] = useState<string | null>(null);

    // Filters & Pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // View
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
    // FETCH DATASETS FROM DATABASE
    // ============================================

    const fetchDatasets = useCallback(async (
        page: number,
        search: string,
        category: string | null
    ) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: String(page),
                limit: String(PAGE_SIZE),
            });

            if (search) params.append('search', search);
            if (category) params.append('category', category);

            console.log(`📡 Fetching page ${page} from Database...`);

            const response = await fetch(`${API_URL}/datasets/saudi?${params}`, {
                headers: { 'Accept': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.data) {
                const newDatasets = data.data.datasets || [];
                const total = data.data.meta?.total || 0;
                const pages = data.data.meta?.totalPages || Math.ceil(total / PAGE_SIZE);

                console.log(`✅ Got ${newDatasets.length} datasets (total: ${total}, pages: ${pages})`);

                setDatasets(newDatasets);
                setTotalCount(total);
                setTotalPages(pages);
            }
        } catch (err: any) {
            console.error('Error fetching datasets:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // ============================================
    // FETCH CATEGORIES
    // ============================================

    const fetchCategories = useCallback(async () => {
        try {
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

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, selectedCategory]);

    // Fetch data when page or filters change
    useEffect(() => {
        fetchDatasets(currentPage, debouncedSearch, selectedCategory);
    }, [currentPage, debouncedSearch, selectedCategory, fetchDatasets]);

    // Load categories once
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // ============================================
    // HANDLERS
    // ============================================

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRefresh = () => {
        fetchDatasets(currentPage, debouncedSearch, selectedCategory);
        fetchCategories();
    };

    const clearFilters = () => {
        setSearchQuery('');
        setDebouncedSearch('');
        setSelectedCategory(null);
        setCurrentPage(1);
    };

    const hasFilters = searchQuery || selectedCategory;

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getCategoryIcon = (category: string) => {
        return CATEGORY_ICONS[category] || CATEGORY_ICONS['default'];
    };

    // ============================================
    // PAGINATION COMPONENT
    // ============================================

    const Pagination = () => {
        if (totalPages <= 1) return null;

        const getPageNumbers = () => {
            const pages: (number | string)[] = [];
            const showPages = 5; // عدد الصفحات المعروضة

            if (totalPages <= showPages + 2) {
                // عرض كل الصفحات
                for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // دائماً أظهر الصفحة الأولى
                pages.push(1);

                if (currentPage > 3) {
                    pages.push('...');
                }

                // الصفحات حول الصفحة الحالية
                const start = Math.max(2, currentPage - 1);
                const end = Math.min(totalPages - 1, currentPage + 1);

                for (let i = start; i <= end; i++) {
                    pages.push(i);
                }

                if (currentPage < totalPages - 2) {
                    pages.push('...');
                }

                // دائماً أظهر الصفحة الأخيرة
                pages.push(totalPages);
            }

            return pages;
        };

        return (
            <div className="flex items-center justify-center gap-1 mt-8 flex-wrap">
                {/* First Page */}
                <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="الصفحة الأولى"
                >
                    <ChevronsRight size={18} />
                </button>

                {/* Previous Page */}
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="السابق"
                >
                    <ChevronRight size={18} />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                            <span key={`dots-${index}`} className="px-2 text-gray-400">...</span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page as number)}
                                className={`min-w-[40px] h-10 rounded-lg font-medium transition-all ${
                                    currentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        )
                    ))}
                </div>

                {/* Next Page */}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="التالي"
                >
                    <ChevronLeft size={18} />
                </button>

                {/* Last Page */}
                <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="الصفحة الأخيرة"
                >
                    <ChevronsLeft size={18} />
                </button>

                {/* Page Info */}
                <span className="text-sm text-gray-500 mr-4">
                    صفحة {currentPage.toLocaleString('ar-SA')} من {totalPages.toLocaleString('ar-SA')}
                </span>
            </div>
        );
    };

    // ============================================
    // RENDER
    // ============================================

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
                            <p className="text-blue-100 mt-1 flex items-center gap-2">
                                <Zap size={16} className="text-yellow-300" />
                                بيانات حية من قاعدة البيانات
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <p className="text-blue-100 text-sm">إجمالي المجموعات</p>
                            <p className="text-3xl font-black mt-1">{totalCount.toLocaleString('ar-SA')}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <p className="text-blue-100 text-sm">الصفحة الحالية</p>
                            <p className="text-3xl font-black mt-1">{currentPage.toLocaleString('ar-SA')}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <p className="text-blue-100 text-sm">عدد الصفحات</p>
                            <p className="text-3xl font-black mt-1">{totalPages.toLocaleString('ar-SA')}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <p className="text-blue-100 text-sm">المصدر</p>
                            <p className="text-lg font-bold mt-1 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                Database حي
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
                            placeholder="ابحث في مجموعات البيانات..."
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
                            <div className="p-4 border-b border-gray-100 bg-gray-50">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Filter size={18} className="text-blue-600" />
                                    التصنيفات
                                </h3>
                            </div>

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
                                    <span className="font-bold text-gray-900">{totalCount.toLocaleString('ar-SA')}</span>
                                    <span className="text-gray-400"> مجموعة بيانات</span>
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
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 disabled:opacity-50"
                                    title="تحديث البيانات"
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

                        {/* Loading */}
                        {loading ? (
                            <div className="flex items-center justify-center min-h-[40vh]">
                                <div className="text-center">
                                    <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
                                    <p className="text-gray-600 font-medium">جاري التحميل من Database...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <X size={40} className="text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">حدث خطأ</h3>
                                <p className="text-gray-600 mb-6">{error}</p>
                                <button
                                    onClick={handleRefresh}
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700"
                                >
                                    <RefreshCw size={18} />
                                    إعادة المحاولة
                                </button>
                            </div>
                        ) : datasets.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Database size={40} className="text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد نتائج</h3>
                                <p className="text-gray-600 mb-6">جرب تغيير معايير البحث</p>
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700"
                                >
                                    <X size={18} />
                                    إزالة الفلاتر
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Dataset Grid/List */}
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
                                <Pagination />
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

// ============================================
// Dataset Card Component
// ============================================

const DatasetCard: React.FC<{ dataset: Dataset; formatDate: (d: string) => string }> = ({ dataset, formatDate }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer">
            <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-green-100 text-green-700">
                        متاح
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded truncate max-w-[120px]">
                        {dataset.category || 'عام'}
                    </span>
                </div>

                <h3 className="font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {dataset.titleAr || dataset.titleEn}
                </h3>
            </div>

            <div className="p-5">
                <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                    {dataset.descriptionAr || dataset.descriptionEn || 'لا يوجد وصف'}
                </p>

                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Globe size={14} className="text-blue-500" />
                        <span className="truncate">{dataset.organization || 'البوابة الوطنية'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                        <Calendar size={14} className="text-green-500" />
                        <span>{formatDate(dataset.updatedAt)}</span>
                    </div>
                    {dataset.recordCount > 0 && (
                        <div className="flex items-center gap-2 text-gray-500">
                            <FileSpreadsheet size={14} className="text-purple-500" />
                            <span>{dataset.recordCount.toLocaleString('ar-SA')} سجل</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">ID: {dataset.id?.slice(0, 8)}...</span>
                <button className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:gap-2 transition-all">
                    <span>استعراض</span>
                    <ArrowUpRight size={14} />
                </button>
            </div>
        </div>
    );
};

// ============================================
// Dataset List Item Component
// ============================================

const DatasetListItem: React.FC<{ dataset: Dataset; formatDate: (d: string) => string }> = ({ dataset, formatDate }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-5 flex gap-5 group cursor-pointer">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <Database size={24} className="text-blue-600" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {dataset.titleAr || dataset.titleEn}
                    </h3>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 bg-green-100 text-green-700">
                        متاح
                    </span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {dataset.descriptionAr || dataset.descriptionEn || 'لا يوجد وصف'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded truncate max-w-[150px]">{dataset.category || 'عام'}</span>
                    <span className="flex items-center gap-1">
                        <Globe size={12} />
                        {dataset.organization || 'البوابة الوطنية'}
                    </span>
                    <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(dataset.updatedAt)}
                    </span>
                </div>
            </div>

            <button className="self-center p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                <ArrowUpRight size={20} />
            </button>
        </div>
    );
};

export default DatasetsPage;
