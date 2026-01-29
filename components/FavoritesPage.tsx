import React, { useState, useEffect } from 'react';
import {
    Bookmark,
    Search,
    LayoutDashboard,
    FileText,
    Zap,
    Filter,
    ArrowUpRight,
    Trash2,
    MoreHorizontal,
    Calendar,
    Clock,
    Star,
    Layers,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../src/services/api';
import { useAuth } from '../contexts/AuthContext';

// --- TYPES ---
type ItemType = 'dashboard' | 'post' | 'signal';

interface SavedItem {
    id: string;
    type: ItemType;
    title: string;
    subtitle?: string;
    date: string;
    image?: string; // For posts
    metrics?: { label: string; value: string; color: string }[]; // For dashboards
    signalType?: 'buy' | 'sell' | 'hold'; // For signals
}

// --- MOCK DATA ---
const SAVED_ITEMS: SavedItem[] = [
    {
        id: 'fav_1',
        type: 'dashboard',
        title: 'مؤشرات قطاع التعدين 2025',
        subtitle: 'وزارة الصناعة',
        date: 'تم الحفظ منذ يومين',
        metrics: [
            { label: 'الإنتاج', value: '450k', color: 'amber' },
            { label: 'الرخص', value: '+12%', color: 'green' }
        ]
    },
    {
        id: 'fav_2',
        type: 'post',
        title: 'تحليل: أثر الفائدة على العقار',
        subtitle: 'أخبار السوق',
        date: 'تم الحفظ اليوم',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=500'
    },
    {
        id: 'fav_3',
        type: 'signal',
        title: 'إشارة دخول: سابك للمغذيات',
        subtitle: 'إشارات AI',
        date: 'منذ 3 ساعات',
        signalType: 'buy'
    },
    {
        id: 'fav_4',
        type: 'dashboard',
        title: 'الأداء المالي للربع الثالث',
        subtitle: 'تقارير مالية',
        date: 'منذ أسبوع',
        metrics: [
            { label: 'الإيرادات', value: 'SAR 4B', color: 'blue' }
        ]
    },
    {
        id: 'fav_5',
        type: 'post',
        title: 'أرامكو تعلن توزيعات أرباح جديدة',
        subtitle: 'عاجل',
        date: 'منذ 5 ساعات',
        image: 'https://images.unsplash.com/photo-1629814249584-bd4d53cf0e7d?auto=format&fit=crop&q=80&w=500'
    }
];

const FavoritesPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeFilter, setActiveFilter] = useState<'all' | ItemType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<SavedItem[]>(SAVED_ITEMS);
    const [loading, setLoading] = useState(false);

    // Fetch favorites from API
    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) return;

            setLoading(true);
            try {
                const response = await api.getFavorites();
                if (response.success && response.data && Array.isArray(response.data)) {
                    // Transform API favorites to SavedItem format
                    const apiItems: SavedItem[] = response.data.map((fav: any) => ({
                        id: fav.id,
                        type: fav.itemType as ItemType,
                        title: fav.itemTitle || 'عنصر محفوظ',
                        subtitle: fav.itemSubtitle || '',
                        date: `تم الحفظ ${formatDate(fav.createdAt)}`,
                        image: fav.itemType === 'post' ? `https://picsum.photos/seed/${fav.id}/500/300` : undefined,
                    }));

                    if (apiItems.length > 0) {
                        setItems(apiItems);
                    }
                }
            } catch (error) {
                console.error('Error fetching favorites:', error);
                // Keep mock data on error
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [user]);

    // Helper to format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffHours < 1) return 'الآن';
        if (diffHours < 24) return `منذ ${diffHours} ساعة`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'منذ يوم';
        if (diffDays < 7) return `منذ ${diffDays} أيام`;
        return `منذ ${Math.floor(diffDays / 7)} أسبوع`;
    };

    // Filter Logic
    const filteredItems = items.filter(item => {
        const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const removeItem = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const item = items.find(i => i.id === id);
        if (!item) return;

        // Optimistic update
        setItems(prev => prev.filter(i => i.id !== id));

        // Call API if logged in
        if (user) {
            try {
                await api.removeFavorite(item.type, id);
            } catch (error) {
                console.error('Error removing favorite:', error);
                // Revert on error
                setItems(prev => [...prev, item]);
            }
        }
    };

    const getIcon = (type: ItemType) => {
        switch (type) {
            case 'dashboard': return <LayoutDashboard size={18} />;
            case 'post': return <FileText size={18} />;
            case 'signal': return <Zap size={18} />;
        }
    };

    const getTypeLabel = (type: ItemType) => {
        switch (type) {
            case 'dashboard': return 'لوحة بيانات';
            case 'post': return 'خبر / مقال';
            case 'signal': return 'إشارة ذكية';
        }
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
                    <p className="text-gray-500 text-lg">المرجع الموحد لكل ما قمت بحفظه ({items.length} عنصر)</p>
                </div>

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

            {/* Tabs / Filters */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
                {[
                    { id: 'all', label: 'الكل', icon: Layers },
                    { id: 'dashboard', label: 'اللوحات', icon: LayoutDashboard },
                    { id: 'post', label: 'محتوى وأخبار', icon: FileText },
                    { id: 'signal', label: 'إشارات', icon: Zap },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveFilter(tab.id as any)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all border ${activeFilter === tab.id
                                ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredItems.map(item => (
                    <div
                        key={item.id}
                        className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden"
                        onClick={() => {/* Navigate */ }}
                    >
                        {/* Type Badge */}
                        <div className={`absolute top-0 right-0 px-3 py-1.5 rounded-bl-2xl text-[10px] font-bold flex items-center gap-1.5
                  ${item.type === 'dashboard' ? 'bg-blue-50 text-blue-600' :
                                item.type === 'signal' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'}
               `}>
                            {getIcon(item.type)}
                            {getTypeLabel(item.type)}
                        </div>

                        {/* Remove Actions */}
                        <button
                            onClick={(e) => removeItem(e, item.id)}
                            className="absolute top-4 left-4 p-2 rounded-full bg-white text-gray-300 hover:text-red-500 hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-all transform scale-90 hover:scale-100"
                            title="إزالة من المفضلة"
                        >
                            <Trash2 size={16} />
                        </button>


                        {/* Content Head */}
                        <div className="mt-6 mb-3">
                            {item.image && (
                                <div className="h-32 w-full rounded-xl bg-gray-100 mb-4 overflow-hidden">
                                    <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                </div>
                            )}

                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 group-hover:text-amber-600 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-gray-400 font-medium">{item.subtitle}</p>
                                </div>
                                {item.type === 'dashboard' && (
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <LayoutDashboard size={20} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Specific Content per Type */}
                        <div className="mt-auto pt-4 border-t border-gray-50">
                            {item.type === 'dashboard' && item.metrics && (
                                <div className="flex gap-2">
                                    {item.metrics.map((m, i) => (
                                        <span key={i} className={`text-[10px] font-bold px-2 py-1 rounded-md bg-${m.color}-50 text-${m.color}-700 border border-${m.color}-100`}>
                                            {m.label}: {m.value}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {item.type === 'signal' && (
                                <div className={`flex items-center gap-2 text-xs font-bold ${item.signalType === 'buy' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    <span className={`w-2 h-2 rounded-full ${item.signalType === 'buy' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                                    {item.signalType === 'buy' ? 'إشارة شراء قوية' : 'توصية بالبيع'}
                                </div>
                            )}

                            {item.type === 'post' && (
                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock size={12} /> قراءة 3 دقائق
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="mt-3 flex items-center justify-between text-[10px] text-gray-300">
                            <span className="flex items-center gap-1"><Calendar size={10} /> {item.date}</span>
                            <ArrowUpRight size={14} className="text-gray-300 group-hover:text-amber-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                        </div>

                    </div>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <Bookmark size={40} className="mx-auto mb-3 opacity-20" />
                    <p>لا توجد عناصر محفوظة في هذه القائمة</p>
                </div>
            )}

        </div>
    );
};

export default FavoritesPage;
