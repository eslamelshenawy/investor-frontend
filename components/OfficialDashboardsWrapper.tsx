/**
 * Official Dashboards Wrapper - مغلف اللوحات الرسمية
 * Fetches dashboards from API and displays them
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutGrid,
    List,
    Star,
    Search,
    BarChart2,
    ArrowUpRight,
    Loader2,
    RefreshCw,
    Calendar,
    Database,
    ChevronLeft,
    ChevronRight,
    ChevronDown
} from 'lucide-react';
import { api } from '../src/services/api';
import { UserRole } from '../types';

interface APIDashboard {
    id: string;
    name: string;
    nameEn?: string;
    description: string;
    category: string;
    categoryLabel?: string;
    source: string;
    sourceUrl?: string;
    color: string;
    // Real data from database
    recordCount: number;
    columns: string[];
    syncStatus: string;
    lastSyncAt: string | null;
    lastUpdated: string | null;
    createdAt: string;
    updatedAt: string;
    datasetId: string;
    externalId?: string;
}

interface OfficialDashboardsWrapperProps {
    userRole: UserRole;
}

interface APICategory {
    id: string;
    label: string;
    labelEn: string;
    count: number;
    filterValue: string;
}

const OfficialDashboardsWrapper: React.FC<OfficialDashboardsWrapperProps> = ({ userRole }) => {
    const navigate = useNavigate();
    const [dashboards, setDashboards] = useState<APIDashboard[]>([]);
    const [categories, setCategories] = useState<APICategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [showMoreCategories, setShowMoreCategories] = useState(false);

    // Sort categories by count (most important first)
    const sortedCategories = useMemo(() => {
        if (!categories.length) return [];
        const all = categories.find(c => c.id === 'all');
        const rest = categories
            .filter(c => c.id !== 'all')
            .sort((a, b) => (b.count || 0) - (a.count || 0));
        return all ? [all, ...rest] : rest;
    }, [categories]);

    // Top 10 categories for initial view
    const displayedCategories = useMemo(() => {
        return showMoreCategories ? sortedCategories : sortedCategories.slice(0, 10);
    }, [sortedCategories, showMoreCategories]);

    // Get selected category label
    const selectedCategoryLabel = useMemo(() => {
        const cat = sortedCategories.find(c => (c.filterValue || c.label) === selectedCategory);
        return cat?.label || 'الكل';
    }, [sortedCategories, selectedCategory]);

    const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
            const response = await api.getDashboardCategories();
            if (response.success && response.data) {
                setCategories(response.data as APICategory[]);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        } finally {
            setCategoriesLoading(false);
        }
    };

    const fetchDashboards = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.getOfficialDashboards({
                category: selectedCategory !== 'all' ? selectedCategory : undefined,
                search: searchQuery || undefined,
                page,
                limit: 12,
            });

            if (response.success && response.data) {
                setDashboards(response.data as APIDashboard[]);
                if (response.meta) {
                    setTotalPages(response.meta.totalPages || 1);
                    setTotalCount(response.meta.total || 0);
                }
            } else {
                setError('تعذر جلب اللوحات');
            }
        } catch (err) {
            console.error('Error fetching dashboards:', err);
            setError('تعذر الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchDashboards();
    }, [selectedCategory, page]);

    // Filter by search locally for instant feedback
    const filteredDashboards = useMemo(() => {
        if (!searchQuery) return dashboards;
        const query = searchQuery.toLowerCase();
        return dashboards.filter(d =>
            d.name.toLowerCase().includes(query) ||
            d.description.toLowerCase().includes(query)
        );
    }, [dashboards, searchQuery]);

    const toggleFavorite = (id: string) => {
        setFavorites(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; border: string }> = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
            green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
            amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
            rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
            cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
            indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
            teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' },
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                            <BarChart2 size={24} className="text-blue-600" />
                        </div>
                        اللوحات الرسمية
                    </h1>
                    <p className="text-gray-500">
                        {loading ? 'جاري التحميل...' : `${totalCount.toLocaleString()} لوحة بيانات متاحة`}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="بحث..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-48"
                        />
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-gray-100 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                        >
                            <List size={18} />
                        </button>
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={fetchDashboards}
                        disabled={loading}
                        className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Categories - Simple Flex Wrap */}
            <div className="mb-6">
                {categoriesLoading ? (
                    <div className="flex flex-wrap gap-2">
                        {[1,2,3,4,5,6,7,8].map(i => (
                            <div key={i} className="h-10 w-24 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {displayedCategories.map(cat => (
                            <button
                                key={`${cat.id}-${cat.label}`}
                                onClick={() => {
                                    setSelectedCategory(cat.filterValue || cat.label);
                                    setPage(1);
                                }}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                                    selectedCategory === (cat.filterValue || cat.label)
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {cat.label}
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                    selectedCategory === (cat.filterValue || cat.label)
                                        ? 'bg-white/20'
                                        : 'bg-gray-200'
                                }`}>
                                    {cat.count?.toLocaleString()}
                                </span>
                            </button>
                        ))}

                        {/* Show More / Show Less Button */}
                        {sortedCategories.length > 10 && (
                            <button
                                onClick={() => setShowMoreCategories(!showMoreCategories)}
                                className="px-4 py-2 rounded-xl font-bold text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center gap-1"
                            >
                                {showMoreCategories ? (
                                    <>عرض أقل</>
                                ) : (
                                    <>
                                        المزيد ({sortedCategories.length - 10})
                                        <ChevronDown size={16} />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={48} className="animate-spin text-blue-600" />
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchDashboards}
                        className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            )}

            {/* Dashboards Grid */}
            {!loading && !error && (
                <>
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-4'
                    }>
                        {filteredDashboards.map(dashboard => {
                            const colorClasses = getColorClasses(dashboard.color);

                            return viewMode === 'grid' ? (
                                // Grid Card
                                <div
                                    key={dashboard.id}
                                    onClick={() => navigate(`/dashboards/${dashboard.id}`)}
                                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                                >
                                    {/* Header */}
                                    <div className={`p-4 ${colorClasses.bg}`}>
                                        <div className="flex items-start justify-between">
                                            <div className={`w-12 h-12 rounded-xl ${colorClasses.bg} border ${colorClasses.border} flex items-center justify-center`}>
                                                <Database size={24} className={colorClasses.text} />
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(dashboard.id);
                                                }}
                                                className="p-2 rounded-lg hover:bg-white/50"
                                            >
                                                <Star
                                                    size={20}
                                                    className={favorites.has(dashboard.id) ? 'fill-amber-400 text-amber-400' : 'text-gray-400'}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600">
                                            {dashboard.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                            {dashboard.description}
                                        </p>

                                        {/* Columns/Metrics from real data */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {(dashboard.columns || []).slice(0, 3).map((col, i) => (
                                                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                                                    {col}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Footer - Real data only */}
                                        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-1">
                                                <Database size={14} />
                                                <span>{(dashboard.recordCount || 0).toLocaleString()} سجل</span>
                                            </div>
                                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                                                dashboard.syncStatus === 'SYNCED' ? 'bg-green-100 text-green-600' :
                                                dashboard.syncStatus === 'FAILED' ? 'bg-red-100 text-red-600' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                                <span>{dashboard.syncStatus === 'SYNCED' ? 'متزامن' : dashboard.syncStatus === 'FAILED' ? 'فشل' : 'معلق'}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                <span>{dashboard.lastUpdated || 'غير محدث'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // List Card
                                <div
                                    key={dashboard.id}
                                    onClick={() => navigate(`/dashboards/${dashboard.id}`)}
                                    className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-lg transition-all cursor-pointer"
                                >
                                    <div className={`w-14 h-14 rounded-xl ${colorClasses.bg} flex items-center justify-center shrink-0`}>
                                        <Database size={24} className={colorClasses.text} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 truncate">{dashboard.name}</h3>
                                        <p className="text-sm text-gray-500 truncate">{dashboard.description}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 shrink-0">
                                        <span className="flex items-center gap-1">
                                            <Database size={14} />
                                            {(dashboard.recordCount || 0).toLocaleString()} سجل
                                        </span>
                                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                                            dashboard.syncStatus === 'SYNCED' ? 'bg-green-100 text-green-600' :
                                            dashboard.syncStatus === 'FAILED' ? 'bg-red-100 text-red-600' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            {dashboard.syncStatus === 'SYNCED' ? 'متزامن' : dashboard.syncStatus === 'FAILED' ? 'فشل' : 'معلق'}
                                        </span>
                                        <ArrowUpRight size={18} className="text-gray-400" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Empty State */}
                    {filteredDashboards.length === 0 && (
                        <div className="text-center py-20 text-gray-400">
                            <Database size={48} className="mx-auto mb-4 opacity-30" />
                            <p>لا توجد لوحات بيانات متاحة</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronRight size={20} />
                            </button>
                            <span className="px-4 py-2 bg-gray-100 rounded-lg font-bold">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default OfficialDashboardsWrapper;
