/**
 * Official Dashboards Wrapper - مغلف اللوحات الرسمية
 * Fetches dashboards from API and displays them
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    LayoutGrid,
    List,
    Star,
    Search,
    Filter,
    BarChart2,
    ArrowUpRight,
    Eye,
    TrendingUp,
    TrendingDown,
    Loader2,
    RefreshCw,
    Calendar,
    Database,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { api } from '../src/services/api';
import { UserRole } from '../types';

interface APIDashboard {
    id: string;
    name: string;
    nameEn?: string;
    description: string;
    category: string;
    source: string;
    views: number;
    lastUpdated: string;
    isFavorite: boolean;
    color: string;
    trend: number;
    keyMetrics: string[];
    dataFreq: string;
    recordCount: number;
    syncStatus: string;
}

interface OfficialDashboardsWrapperProps {
    userRole: UserRole;
}

const CATEGORIES = [
    { id: 'all', label: 'الكل' },
    { id: 'economy', label: 'الاقتصاد' },
    { id: 'real_estate', label: 'العقار' },
    { id: 'investment', label: 'الاستثمار' },
    { id: 'energy', label: 'الطاقة' },
    { id: 'labor', label: 'سوق العمل' },
];

const OfficialDashboardsWrapper: React.FC<OfficialDashboardsWrapperProps> = ({ userRole }) => {
    const [dashboards, setDashboards] = useState<APIDashboard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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
                        {loading ? 'جاري التحميل...' : `${filteredDashboards.length} لوحة بيانات متاحة`}
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

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            setSelectedCategory(cat.id);
                            setPage(1);
                        }}
                        className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                            selectedCategory === cat.id
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
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

                                        {/* Metrics */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {dashboard.keyMetrics.slice(0, 2).map((metric, i) => (
                                                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                                                    {metric}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-1">
                                                <Eye size={14} />
                                                <span>{dashboard.views.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {dashboard.trend > 0 ? (
                                                    <TrendingUp size={14} className="text-green-500" />
                                                ) : (
                                                    <TrendingDown size={14} className="text-red-500" />
                                                )}
                                                <span className={dashboard.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {dashboard.trend > 0 ? '+' : ''}{dashboard.trend}%
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                <span>{dashboard.lastUpdated}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // List Card
                                <div
                                    key={dashboard.id}
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
                                            <Eye size={14} />
                                            {dashboard.views.toLocaleString()}
                                        </span>
                                        <span className={`flex items-center gap-1 ${dashboard.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {dashboard.trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                            {dashboard.trend}%
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
