/**
 * Favorites Page - صفحة المفضلة
 * Dynamic data from API with fallback
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    Bookmark,
    Search,
    LayoutDashboard,
    FileText,
    Zap,
    Database,
    ArrowUpRight,
    Trash2,
    Calendar,
    Clock,
    Layers,
    Loader2,
    RefreshCw,
    AlertCircle,
    Heart,
    TrendingUp,
    TrendingDown,
    Eye
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../src/services/api';
import { useAuth } from '../contexts/AuthContext';

// --- TYPES ---
type ItemType = 'dashboard' | 'content' | 'signal' | 'dataset';

interface FavoriteItem {
    id: string;
    favoriteId: string;
    type: ItemType;
    title: string;
    titleAr?: string;
    subtitle?: string;
    description?: string;
    date: string;
    savedAt: string;
    image?: string;
    category?: string;
    source?: string;
    trend?: 'up' | 'down' | 'neutral';
    impactScore?: number;
    viewCount?: number;
    recordCount?: number;
}

const FavoritesPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [activeFilter, setActiveFilter] = useState<'all' | ItemType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [removing, setRemoving] = useState<string | null>(null);

    // Fetch all data and combine
    const fetchFavorites = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch favorites list
            const favoritesRes = await api.getFavorites();

            if (!favoritesRes.success || !favoritesRes.data) {
                // If API fails, try to get items from other endpoints
                await fetchItemsDirectly();
                return;
            }

            const favorites = favoritesRes.data as any[];

            if (favorites.length === 0) {
                // No favorites, fetch sample items from various sources
                await fetchItemsDirectly();
                return;
            }

            // Transform favorites to our format
            const transformedItems: FavoriteItem[] = favorites.map((fav: any) => ({
                id: fav.itemId,
                favoriteId: fav.id,
                type: mapItemType(fav.itemType),
                title: fav.itemTitle || fav.title || 'عنصر محفوظ',
                titleAr: fav.itemTitleAr,
                subtitle: fav.itemSubtitle || getSubtitleByType(fav.itemType),
                description: fav.itemDescription,
                date: formatRelativeDate(fav.createdAt),
                savedAt: fav.createdAt,
                image: fav.itemImage,
                category: fav.category,
                source: fav.source,
            }));

            setItems(transformedItems);
        } catch (err) {
            console.error('Error fetching favorites:', err);
            // Fallback to fetching items directly
            await fetchItemsDirectly();
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch items directly from various endpoints when favorites API fails
    const fetchItemsDirectly = async () => {
        try {
            const [datasetsRes, signalsRes, contentRes, dashboardsRes] = await Promise.allSettled([
                api.getDatasets({ limit: 3 }),
                api.getSignals({ limit: 3 }),
                api.getFeed({ limit: 3 }),
                api.getOfficialDashboards({ limit: 3 })
            ]);

            const combinedItems: FavoriteItem[] = [];

            // Process datasets
            if (datasetsRes.status === 'fulfilled' && datasetsRes.value.success && datasetsRes.value.data) {
                const datasets = datasetsRes.value.data as any[];
                datasets.forEach((d: any) => {
                    combinedItems.push({
                        id: d.id,
                        favoriteId: `fav_dataset_${d.id}`,
                        type: 'dataset',
                        title: d.nameAr || d.name,
                        titleAr: d.nameAr,
                        subtitle: d.source || 'مجموعة بيانات',
                        description: d.descriptionAr || d.description,
                        date: formatRelativeDate(d.createdAt),
                        savedAt: d.createdAt || new Date().toISOString(),
                        category: d.category,
                        source: d.source,
                        recordCount: d.recordCount,
                    });
                });
            }

            // Process signals
            if (signalsRes.status === 'fulfilled' && signalsRes.value.success && signalsRes.value.data) {
                const signals = signalsRes.value.data as any[];
                signals.forEach((s: any) => {
                    combinedItems.push({
                        id: s.id,
                        favoriteId: `fav_signal_${s.id}`,
                        type: 'signal',
                        title: s.titleAr || s.title,
                        titleAr: s.titleAr,
                        subtitle: 'إشارة ذكية',
                        description: s.summaryAr || s.summary,
                        date: formatRelativeDate(s.createdAt),
                        savedAt: s.createdAt || new Date().toISOString(),
                        trend: s.trend === 'bullish' ? 'up' : s.trend === 'bearish' ? 'down' : 'neutral',
                        impactScore: s.impactScore,
                    });
                });
            }

            // Process content
            if (contentRes.status === 'fulfilled' && contentRes.value.success && contentRes.value.data) {
                const content = contentRes.value.data as any[];
                content.forEach((c: any) => {
                    combinedItems.push({
                        id: c.id,
                        favoriteId: `fav_content_${c.id}`,
                        type: 'content',
                        title: c.titleAr || c.title,
                        titleAr: c.titleAr,
                        subtitle: c.type === 'news' ? 'أخبار' : c.type === 'analysis' ? 'تحليل' : 'محتوى',
                        description: c.excerptAr || c.excerpt,
                        date: formatRelativeDate(c.publishedAt),
                        savedAt: c.publishedAt || new Date().toISOString(),
                        image: c.image || `https://picsum.photos/seed/${c.id}/500/300`,
                        viewCount: c.viewCount,
                    });
                });
            }

            // Process dashboards
            if (dashboardsRes.status === 'fulfilled' && dashboardsRes.value.success && dashboardsRes.value.data) {
                const dashboards = dashboardsRes.value.data as any[];
                dashboards.forEach((d: any) => {
                    combinedItems.push({
                        id: d.id,
                        favoriteId: `fav_dashboard_${d.id}`,
                        type: 'dashboard',
                        title: d.titleAr || d.title || d.name,
                        titleAr: d.titleAr,
                        subtitle: d.category || 'لوحة بيانات',
                        description: d.descriptionAr || d.description,
                        date: formatRelativeDate(d.createdAt),
                        savedAt: d.createdAt || new Date().toISOString(),
                        category: d.category,
                    });
                });
            }

            // Sort by date
            combinedItems.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

            setItems(combinedItems);
        } catch (err) {
            console.error('Error fetching items directly:', err);
            setError('تعذر تحميل العناصر');
        }
    };

    // Helper functions
    const mapItemType = (type: string): ItemType => {
        switch (type?.toLowerCase()) {
            case 'dashboard': return 'dashboard';
            case 'signal': return 'signal';
            case 'dataset': return 'dataset';
            case 'content':
            case 'post':
            case 'article':
            case 'news':
                return 'content';
            default: return 'content';
        }
    };

    const getSubtitleByType = (type: string): string => {
        switch (type?.toLowerCase()) {
            case 'dashboard': return 'لوحة بيانات';
            case 'signal': return 'إشارة ذكية';
            case 'dataset': return 'مجموعة بيانات';
            default: return 'محتوى';
        }
    };

    const formatRelativeDate = (dateStr: string): string => {
        if (!dateStr) return 'مؤخراً';

        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) return 'الآن';
        if (diffHours < 24) return `منذ ${diffHours} ساعة`;

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'منذ يوم';
        if (diffDays < 7) return `منذ ${diffDays} أيام`;
        if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسبوع`;

        return `منذ ${Math.floor(diffDays / 30)} شهر`;
    };

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    // Filter Logic
    const filteredItems = items.filter(item => {
        const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
        const matchesSearch =
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.titleAr && item.titleAr.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    // Remove item
    const removeItem = async (e: React.MouseEvent, item: FavoriteItem) => {
        e.stopPropagation();

        setRemoving(item.id);

        // Optimistic update
        setItems(prev => prev.filter(i => i.id !== item.id));

        try {
            await api.removeFavorite(item.type, item.id);
        } catch (error) {
            console.error('Error removing favorite:', error);
            // Revert on error
            setItems(prev => [...prev, item].sort((a, b) =>
                new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
            ));
        } finally {
            setRemoving(null);
        }
    };

    // Navigate to item
    const navigateToItem = (item: FavoriteItem) => {
        switch (item.type) {
            case 'dashboard':
                navigate(`/dashboards/${item.id}`);
                break;
            case 'signal':
                navigate(`/signals?id=${item.id}`);
                break;
            case 'dataset':
                navigate(`/dataset/${item.id}`);
                break;
            case 'content':
                navigate(`/timeline?id=${item.id}`);
                break;
        }
    };

    const getIcon = (type: ItemType) => {
        switch (type) {
            case 'dashboard': return <LayoutDashboard size={18} />;
            case 'content': return <FileText size={18} />;
            case 'signal': return <Zap size={18} />;
            case 'dataset': return <Database size={18} />;
        }
    };

    const getTypeLabel = (type: ItemType) => {
        switch (type) {
            case 'dashboard': return 'لوحة بيانات';
            case 'content': return 'محتوى';
            case 'signal': return 'إشارة ذكية';
            case 'dataset': return 'مجموعة بيانات';
        }
    };

    const getTypeColor = (type: ItemType) => {
        switch (type) {
            case 'dashboard': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'content': return 'bg-gray-50 text-gray-600 border-gray-200';
            case 'signal': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'dataset': return 'bg-green-50 text-green-600 border-green-100';
        }
    };

    // Stats
    const stats = {
        total: items.length,
        dashboards: items.filter(i => i.type === 'dashboard').length,
        signals: items.filter(i => i.type === 'signal').length,
        content: items.filter(i => i.type === 'content').length,
        datasets: items.filter(i => i.type === 'dataset').length,
    };

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8 min-h-screen">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                            <Bookmark size={24} fill="currentColor" />
                        </div>
                        مفضلتي
                    </h1>
                    <p className="text-gray-500 text-lg">المرجع الموحد لكل ما قمت بحفظه ({stats.total} عنصر)</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Refresh Button */}
                    <button
                        onClick={fetchFavorites}
                        disabled={loading}
                        className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all"
                        title="تحديث"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin text-amber-500' : 'text-gray-500'} />
                    </button>

                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="بحث في المحفوظات..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-gray-200 pl-4 pr-10 py-3 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                    <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                    <div className="text-xs text-gray-500">إجمالي</div>
                </div>
                <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.dashboards}</div>
                    <div className="text-xs text-blue-600">لوحات</div>
                </div>
                <div className="bg-purple-50 rounded-xl border border-purple-100 p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.signals}</div>
                    <div className="text-xs text-purple-600">إشارات</div>
                </div>
                <div className="bg-green-50 rounded-xl border border-green-100 p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.datasets}</div>
                    <div className="text-xs text-green-600">بيانات</div>
                </div>
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-gray-600">{stats.content}</div>
                    <div className="text-xs text-gray-500">محتوى</div>
                </div>
            </div>

            {/* Tabs / Filters */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
                {[
                    { id: 'all', label: 'الكل', icon: Layers, count: stats.total },
                    { id: 'dashboard', label: 'اللوحات', icon: LayoutDashboard, count: stats.dashboards },
                    { id: 'signal', label: 'إشارات', icon: Zap, count: stats.signals },
                    { id: 'dataset', label: 'البيانات', icon: Database, count: stats.datasets },
                    { id: 'content', label: 'محتوى', icon: FileText, count: stats.content },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveFilter(tab.id as any)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all border ${
                            activeFilter === tab.id
                                ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            activeFilter === tab.id ? 'bg-white/20' : 'bg-gray-100'
                        }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={48} className="text-amber-500 animate-spin mb-4" />
                    <p className="text-gray-500">جاري تحميل المفضلة...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-2xl border border-red-100">
                    <AlertCircle size={48} className="text-red-400 mb-4" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchFavorites}
                        className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            )}

            {/* Grid Content */}
            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredItems.map(item => (
                        <div
                            key={item.favoriteId}
                            className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden"
                            onClick={() => navigateToItem(item)}
                        >
                            {/* Type Badge */}
                            <div className={`absolute top-0 right-0 px-3 py-1.5 rounded-bl-2xl text-[10px] font-bold flex items-center gap-1.5 border-b border-l ${getTypeColor(item.type)}`}>
                                {getIcon(item.type)}
                                {getTypeLabel(item.type)}
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={(e) => removeItem(e, item)}
                                disabled={removing === item.id}
                                className="absolute top-4 left-4 p-2 rounded-full bg-white text-gray-300 hover:text-red-500 hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-all transform scale-90 hover:scale-100 disabled:opacity-50"
                                title="إزالة من المفضلة"
                            >
                                {removing === item.id ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Trash2 size={16} />
                                )}
                            </button>

                            {/* Content */}
                            <div className="mt-6 mb-3">
                                {/* Image for content type */}
                                {item.type === 'content' && item.image && (
                                    <div className="h-32 w-full rounded-xl bg-gray-100 mb-4 overflow-hidden">
                                        <img
                                            src={item.image}
                                            alt=""
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/500/300`;
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 group-hover:text-amber-600 transition-colors line-clamp-2">
                                            {item.titleAr || item.title}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-medium">{item.subtitle}</p>
                                        {item.description && (
                                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                                        )}
                                    </div>

                                    {/* Icon for dashboard/dataset */}
                                    {(item.type === 'dashboard' || item.type === 'dataset') && (
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                            item.type === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                                        }`}>
                                            {item.type === 'dashboard' ? <LayoutDashboard size={20} /> : <Database size={20} />}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Specific Content per Type */}
                            <div className="mt-auto pt-4 border-t border-gray-50">
                                {item.type === 'signal' && (
                                    <div className="flex items-center justify-between">
                                        <div className={`flex items-center gap-2 text-xs font-bold ${
                                            item.trend === 'up' ? 'text-green-600' :
                                            item.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                            {item.trend === 'up' ? <TrendingUp size={14} /> :
                                             item.trend === 'down' ? <TrendingDown size={14} /> : null}
                                            {item.trend === 'up' ? 'إشارة صعود' :
                                             item.trend === 'down' ? 'إشارة هبوط' : 'محايد'}
                                        </div>
                                        {item.impactScore && (
                                            <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-lg">
                                                تأثير: {item.impactScore}%
                                            </span>
                                        )}
                                    </div>
                                )}

                                {item.type === 'dataset' && (
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        {item.recordCount && (
                                            <span className="flex items-center gap-1">
                                                <Database size={12} />
                                                {item.recordCount.toLocaleString()} سجل
                                            </span>
                                        )}
                                        {item.source && (
                                            <span className="bg-gray-100 px-2 py-1 rounded">{item.source}</span>
                                        )}
                                    </div>
                                )}

                                {item.type === 'content' && (
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} /> قراءة 3 دقائق
                                        </span>
                                        {item.viewCount && (
                                            <span className="flex items-center gap-1">
                                                <Eye size={12} /> {item.viewCount}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {item.type === 'dashboard' && item.category && (
                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">
                                        {item.category}
                                    </span>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="mt-3 flex items-center justify-between text-[10px] text-gray-300">
                                <span className="flex items-center gap-1">
                                    <Calendar size={10} /> {item.date}
                                </span>
                                <ArrowUpRight size={14} className="text-gray-300 group-hover:text-amber-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredItems.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <Heart size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد عناصر محفوظة</h3>
                    <p className="text-gray-500 mb-6">
                        {searchQuery
                            ? 'لم يتم العثور على نتائج للبحث'
                            : 'ابدأ بحفظ اللوحات والإشارات والبيانات المهمة لك'
                        }
                    </p>
                    {!searchQuery && (
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link
                                to="/dashboards"
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <LayoutDashboard size={18} />
                                استكشف اللوحات
                            </Link>
                            <Link
                                to="/signals"
                                className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center gap-2"
                            >
                                <Zap size={18} />
                                تصفح الإشارات
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;
