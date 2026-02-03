import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { FeedItem, FeedContentType, User } from '../types';
import FeedCard from './FeedCard';
import { api } from '../src/services/api';
import {
    Filter,
    LayoutGrid,
    FileText,
    BarChart2,
    Image,
    Video,
    TrendingUp,
    Search,
    Activity,
    Lightbulb,
    Scale,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    ArrowDownUp,
    ListFilter,
    Layers,
    Newspaper,
    GraduationCap,
    MessageCircle,
    CheckSquare,
    X,
    Database,
    Users,
    Zap,
    Globe,
    Building2,
    ArrowUpRight,
    RefreshCw,
    Clock,
    Eye,
    Heart,
    Bookmark,
    Share2,
    Play,
    ChevronDown,
    Loader2,
    Signal,
    Target,
    PieChart,
    LineChart,
    TrendingDown,
    AlertCircle
} from 'lucide-react';

interface HomeFeedProps {
    feedItems: FeedItem[];
    user?: User;
    onOpenWizard?: () => void;
}

interface StatsData {
    totalDatasets: number;
    totalCategories: number;
    totalSignals: number;
    activeSignals: number;
    totalUsers: number;
    totalContent: number;
    totalViews: number;
    newThisWeek: number;
    weeklyGrowth: number;
    isRealData: boolean;
}

interface TrendingTopic {
    tag: string;
    count: number;
    countFormatted: string;
    type: string;
    color: string;
}

interface QuickStats {
    todaySignals: number;
    newReports: number;
    opportunities: number;
}

interface UserStats {
    favorites: number;
    dashboards: number;
}

// Animated Counter Component
const AnimatedCounter: React.FC<{
    end: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    decimals?: number;
}> = ({ end, duration = 2000, suffix = '', prefix = '', decimals = 0 }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const animationRef = useRef<number>();

    useEffect(() => {
        startTimeRef.current = performance.now();
        countRef.current = 0;

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = Math.floor(easeOutQuart * end);

            if (currentCount !== countRef.current) {
                countRef.current = currentCount;
                setCount(currentCount);
            }

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [end, duration]);

    const formattedCount = decimals > 0
        ? count.toFixed(decimals)
        : count.toLocaleString('ar-SA');

    return (
        <span className="counter-value">
            {prefix}{formattedCount}{suffix}
        </span>
    );
};

// Stats Card Component
const StatsCard: React.FC<{
    icon: React.ElementType;
    label: string;
    value: number;
    suffix?: string;
    trend?: string;
    trendPositive?: boolean;
    color: string;
    delay?: number;
}> = ({ icon: Icon, label, value, suffix = '', trend, trendPositive = true, color, delay = 0 }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    const colorClasses: Record<string, string> = {
        blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
        purple: 'from-purple-500 to-purple-600 shadow-purple-500/30',
        green: 'from-green-500 to-green-600 shadow-green-500/30',
        amber: 'from-amber-500 to-amber-600 shadow-amber-500/30',
        rose: 'from-rose-500 to-rose-600 shadow-rose-500/30',
        cyan: 'from-cyan-500 to-cyan-600 shadow-cyan-500/30',
    };

    return (
        <div
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClasses[color]} p-4 sm:p-5 shadow-lg transition-all duration-500 card-hover-lift group ${
                isVisible ? 'animate-fadeInUp opacity-100' : 'opacity-0'
            }`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl transform translate-x-5 -translate-y-5 group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full blur-xl transform -translate-x-5 translate-y-5" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full ${
                            trendPositive ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'
                        }`}>
                            {trendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {trend}
                        </div>
                    )}
                </div>

                <div className="text-2xl sm:text-3xl font-black text-white mb-1">
                    {isVisible && <AnimatedCounter end={value} suffix={suffix} duration={2000} />}
                </div>
                <p className="text-white/80 text-xs sm:text-sm font-medium">{label}</p>
            </div>
        </div>
    );
};

// Skeleton Loader
const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
        <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full skeleton" />
            <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2 skeleton" />
                <div className="h-3 bg-gray-200 rounded w-1/4 skeleton" />
            </div>
        </div>
        <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded skeleton" />
            <div className="h-4 bg-gray-200 rounded w-5/6 skeleton" />
        </div>
        <div className="h-40 bg-gray-200 rounded-xl mt-4 skeleton" />
    </div>
);

// Live Indicator
const LiveIndicator: React.FC<{ label?: string }> = ({ label = 'مباشر' }) => (
    <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
        <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        {label}
    </div>
);

const ITEMS_PER_PAGE = 25;

const HomeFeed: React.FC<HomeFeedProps> = ({ feedItems, user, onOpenWizard }) => {
    // --- STATE ---
    const [activeTab, setActiveTab] = useState('ALL');
    const [activeType, setActiveType] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'LATEST' | 'POPULAR' | 'SAVED'>('LATEST');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Dynamic Stats State - ALL REAL DATA
    const [stats, setStats] = useState<StatsData | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState(false);

    // Trending Topics State - ALL REAL DATA
    const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
    const [trendingLoading, setTrendingLoading] = useState(true);

    // Quick Stats State - REAL DATA from recent activity
    const [quickStats, setQuickStats] = useState<QuickStats | null>(null);

    // User Stats State - REAL DATA from API
    const [userStats, setUserStats] = useState<UserStats | null>(null);

    // Animation States
    const [heroVisible, setHeroVisible] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Current time for live updates
    const [currentTime, setCurrentTime] = useState(new Date());

    // --- FETCH STATS (100% REAL DATA - NO FALLBACKS) ---
    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        setStatsError(false);
        try {
            const response = await api.get('/stats/overview');
            if (response.success && response.data && response.data.isRealData) {
                setStats({
                    totalDatasets: response.data.totalDatasets,
                    totalCategories: response.data.totalCategories,
                    totalSignals: response.data.totalSignals,
                    activeSignals: response.data.activeSignals,
                    totalUsers: response.data.totalUsers,
                    totalContent: response.data.totalContent,
                    totalViews: response.data.totalViews,
                    newThisWeek: response.data.newThisWeek,
                    weeklyGrowth: response.data.weeklyGrowth,
                    isRealData: true
                });
            } else {
                setStatsError(true);
                setStats(null);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            setStatsError(true);
            setStats(null);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    // --- FETCH TRENDING (100% REAL DATA - NO FALLBACKS) ---
    const fetchTrending = useCallback(async () => {
        setTrendingLoading(true);
        try {
            const response = await api.get('/stats/trending');
            if (response.success && response.data?.isRealData) {
                // Use combined topics from real categories and tags
                setTrendingTopics(response.data.topics || []);
            } else {
                setTrendingTopics([]);
            }
        } catch (error) {
            console.error('Failed to fetch trending:', error);
            setTrendingTopics([]);
        } finally {
            setTrendingLoading(false);
        }
    }, []);

    // --- FETCH QUICK STATS (REAL DATA from recent activity) ---
    const fetchQuickStats = useCallback(async () => {
        try {
            const response = await api.get('/stats/activity');
            if (response.success && response.data?.isRealData) {
                setQuickStats({
                    todaySignals: response.data.signals?.count || 0,
                    newReports: response.data.content?.count || 0,
                    opportunities: response.data.datasets?.count || 0
                });
            }
        } catch (error) {
            console.error('Failed to fetch quick stats:', error);
        }
    }, []);

    // --- FETCH USER STATS (REAL DATA - requires auth) ---
    const fetchUserStats = useCallback(async () => {
        if (!user) return;
        try {
            const response = await api.get('/stats/user');
            if (response.success && response.data?.isRealData) {
                setUserStats({
                    favorites: response.data.stats?.favorites || 0,
                    dashboards: response.data.stats?.dashboards || 0
                });
            }
        } catch (error) {
            // User might not be authenticated, silently fail
        }
    }, [user]);

    // --- EFFECTS ---
    useEffect(() => {
        // Trigger hero animation after mount
        const timer = setTimeout(() => setHeroVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        fetchStats();
        fetchTrending();
        fetchQuickStats();
    }, [fetchStats, fetchTrending, fetchQuickStats]);

    useEffect(() => {
        fetchUserStats();
    }, [fetchUserStats]);

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // --- REFRESH HANDLER ---
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([fetchStats(), fetchTrending(), fetchQuickStats(), fetchUserStats()]);
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    // --- CONFIG ---
    const tabs = [
        { id: 'ALL', label: 'الكل', icon: LayoutGrid },
        { id: 'ANALYTIC', label: 'تحليلات', icon: Activity },
        { id: 'DATA', label: 'بيانات', icon: BarChart2 },
        { id: 'NEWS', label: 'أخبار', icon: Newspaper },
        { id: 'EDU', label: 'تعليمي', icon: GraduationCap },
    ];

    const typeFilters = [
        { id: FeedContentType.SIGNAL_ALERT, label: 'إشارات', icon: TrendingUp, cat: 'ANALYTIC' },
        { id: FeedContentType.MARKET_PULSE, label: 'حرارة السوق', icon: Activity, cat: 'ANALYTIC' },
        { id: FeedContentType.COMPARISON, label: 'مقارنات', icon: Scale, cat: 'ANALYTIC' },

        { id: FeedContentType.DASHBOARD, label: 'لوحات', icon: Layers, cat: 'DATA' },
        { id: FeedContentType.PORTFOLIO, label: 'محافظ', icon: BarChart2, cat: 'DATA' },
        { id: FeedContentType.FACT, label: 'حقائق', icon: Lightbulb, cat: 'DATA' },

        { id: FeedContentType.BREAKING_NEWS, label: 'عاجل', icon: Newspaper, cat: 'NEWS' },
        { id: FeedContentType.EVENT, label: 'أحداث', icon: Sparkles, cat: 'NEWS' },
        { id: FeedContentType.ARTICLE, label: 'مقالات', icon: FileText, cat: 'NEWS' },

        { id: FeedContentType.TERMINOLOGY, label: 'مصطلحات', icon: GraduationCap, cat: 'EDU' },
        { id: FeedContentType.EXPERT_INSIGHT, label: 'رؤى', icon: Lightbulb, cat: 'EDU' },
        { id: FeedContentType.Q_AND_A, label: 'سؤال وجواب', icon: MessageCircle, cat: 'EDU' },
        { id: FeedContentType.CHECKLIST, label: 'قوائم', icon: CheckSquare, cat: 'EDU' },
        { id: FeedContentType.POLL, label: 'تصويت', icon: ListFilter, cat: 'EDU' },
    ];

    // --- LOGIC ---
    const filteredItems = useMemo(() => {
        let items = feedItems;

        // 1. Tab Filter
        if (activeTab !== 'ALL') {
            const allowedTypes = typeFilters.filter(t => t.cat === activeTab).map(t => t.id);
            items = items.filter(item => allowedTypes.includes(item.contentType as any));
        }

        // 2. Exact Type Filter
        if (activeType) {
            items = items.filter(item => item.contentType === activeType);
        }

        // 3. Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            items = items.filter(item =>
                item.title.toLowerCase().includes(q) ||
                item.author.name.toLowerCase().includes(q) ||
                item.tags.some(tag => tag.toLowerCase().includes(q))
            );
        }

        // 4. Sort
        if (sortBy === 'POPULAR') {
            items = [...items].sort((a, b) => b.engagement.likes - a.engagement.likes);
        } else if (sortBy === 'SAVED') {
            items = [...items].sort((a, b) => b.engagement.saves - a.engagement.saves);
        } else {
            // Default LATEST
            items = [...items].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }

        return items;
    }, [feedItems, activeTab, activeType, searchQuery, sortBy]);

    // Pagination Calculation
    const totalItems = filteredItems.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const displayedItems = filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handlePageChange = (p: number) => {
        setCurrentPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        setActiveType(null);
        setCurrentPage(1);
    };

    const getVisibleChips = () => {
        if (activeTab === 'ALL') return typeFilters;
        return typeFilters.filter(t => t.cat === activeTab);
    };

    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">

            {/* === DYNAMIC HERO SECTION === */}
            <div className={`mb-6 sm:mb-8 transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6 sm:p-8 lg:p-10 particles-bg noise-overlay">
                    {/* Animated Background Orbs */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-blob" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob delay-1000" />
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-float" />

                    <div className="relative z-10">
                        {/* Top Row: Title & Live Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                            <div className="animate-fadeInRight">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 animate-float">
                                        <Activity className="text-white w-6 h-6 sm:w-7 sm:h-7" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
                                            رادار المستثمر
                                        </h1>
                                        <p className="text-blue-200 text-sm sm:text-base font-medium">
                                            مركز البيانات الاستثمارية السعودية
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 animate-fadeInLeft">
                                <LiveIndicator />
                                <span className="text-white/60 text-xs sm:text-sm">
                                    {currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <button
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 hover:border-white/20 group ripple-btn"
                                >
                                    <RefreshCw size={18} className={`text-white group-hover:text-blue-300 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </button>
                                {onOpenWizard && (
                                    <button
                                        onClick={onOpenWizard}
                                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95 ripple-btn"
                                    >
                                        <Sparkles size={18} className="animate-sparkle" />
                                        <span className="hidden sm:inline">المستشار الذكي</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Stats Grid - 100% REAL DATA */}
                        {statsLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
                                {[1,2,3,4,5,6].map(i => (
                                    <div key={i} className="bg-white/10 rounded-2xl p-4 sm:p-5 animate-pulse">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl mb-3 skeleton" />
                                        <div className="h-8 bg-white/20 rounded w-2/3 mb-2 skeleton" />
                                        <div className="h-4 bg-white/20 rounded w-1/2 skeleton" />
                                    </div>
                                ))}
                            </div>
                        ) : statsError || !stats ? (
                            <div className="bg-white/10 rounded-2xl p-6 mb-6 sm:mb-8 text-center">
                                <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                                <p className="text-white/80 text-sm">فشل في جلب الإحصائيات - يرجى المحاولة لاحقاً</p>
                                <button onClick={handleRefresh} className="mt-3 text-blue-300 hover:text-blue-200 text-sm font-bold">
                                    إعادة المحاولة
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
                                <StatsCard
                                    icon={Database}
                                    label="مجموعة بيانات"
                                    value={stats.totalDatasets}
                                    trend={stats.newThisWeek > 0 ? `+${stats.newThisWeek}` : undefined}
                                    trendPositive
                                    color="blue"
                                    delay={100}
                                />
                                <StatsCard
                                    icon={Layers}
                                    label="تصنيف"
                                    value={stats.totalCategories}
                                    color="purple"
                                    delay={200}
                                />
                                <StatsCard
                                    icon={Zap}
                                    label="إشارة نشطة"
                                    value={stats.activeSignals}
                                    trend={stats.totalSignals > 0 ? `${stats.totalSignals} إجمالي` : undefined}
                                    trendPositive
                                    color="amber"
                                    delay={300}
                                />
                                <StatsCard
                                    icon={Users}
                                    label="مستخدم"
                                    value={stats.totalUsers}
                                    color="green"
                                    delay={400}
                                />
                                <StatsCard
                                    icon={Eye}
                                    label="إجمالي المشاهدات"
                                    value={stats.totalViews}
                                    color="cyan"
                                    delay={500}
                                />
                                <StatsCard
                                    icon={TrendingUp}
                                    label="نمو أسبوعي"
                                    value={stats.weeklyGrowth}
                                    suffix="%"
                                    trendPositive={stats.weeklyGrowth > 0}
                                    color="rose"
                                    delay={600}
                                />
                            </div>
                        )}

                        {/* Search Bar */}
                        <div className="relative group animate-fadeInUp delay-300">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-focus-within:blur-2xl transition-all" />
                            <div className="relative">
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none group-focus-within:text-blue-300 transition-colors w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder={stats ? `ابحث في ${stats.totalDatasets.toLocaleString('ar-SA')}+ مجموعة بيانات، تقارير، وتحليلات...` : 'ابحث في البيانات والتقارير والتحليلات...'}
                                    className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white placeholder-white/50 focus:bg-white/15 focus:border-blue-400/50 focus:ring-4 focus:ring-blue-400/20 outline-none text-sm sm:text-base font-medium transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-red-400 transition-colors p-1 hover:bg-white/10 rounded-full"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions - REAL DATA */}
                        {quickStats && (
                            <div className="flex flex-wrap gap-2 sm:gap-3 mt-6 animate-fadeInUp delay-500">
                                {[
                                    { icon: Signal, label: 'إشارات حديثة', count: quickStats.todaySignals },
                                    { icon: PieChart, label: 'محتوى جديد', count: quickStats.newReports },
                                    { icon: Target, label: 'بيانات جديدة', count: quickStats.opportunities },
                                ].filter(action => action.count > 0).map((action, idx) => (
                                    <button
                                        key={idx}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/80 hover:text-white text-sm font-medium transition-all border border-white/10 hover:border-white/20 group"
                                    >
                                        <action.icon size={16} className="group-hover:scale-110 transition-transform" />
                                        <span>{action.label}</span>
                                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{action.count}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">

                {/* Main Feed Column */}
                <div className="flex-1 w-full min-w-0">

                    {/* === FILTER BAR (Sticky) === */}
                    <div className="sticky top-[60px] lg:top-[72px] z-30 transition-all duration-300 -mx-3 sm:mx-0 px-3 sm:px-0">
                        <div className="bg-white/95 backdrop-blur-xl shadow-lg border border-gray-100 rounded-2xl p-2 mb-4 animate-fadeInDown">

                            {/* Top Row: Tabs + Sort */}
                            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-gray-100">
                                {/* Categories */}
                                <div className="flex-1 overflow-x-auto no-scrollbar">
                                    <div className="flex bg-gray-100/50 p-1 rounded-xl w-fit min-w-full sm:min-w-0">
                                        {tabs.map((tab, idx) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => handleTabChange(tab.id)}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                                                    activeTab === tab.id
                                                        ? 'bg-white text-blue-600 shadow-md'
                                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                                                }`}
                                                style={{ animationDelay: `${idx * 50}ms` }}
                                            >
                                                <tab.icon size={14} className="shrink-0" />
                                                <span className="hidden xs:inline sm:inline">{tab.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sort Actions */}
                                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                    <button
                                        onClick={() => setSortBy('LATEST')}
                                        className={`p-2 rounded-lg transition-all ${sortBy === 'LATEST' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                                        title="الأحدث"
                                    >
                                        <ArrowDownUp size={16} />
                                    </button>
                                    <button
                                        onClick={() => setSortBy('POPULAR')}
                                        className={`p-2 rounded-lg transition-all ${sortBy === 'POPULAR' ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                                        title="الأكثر شعبية"
                                    >
                                        <TrendingUp size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Bottom Row: Type Chips */}
                            <div className="overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1">
                                <div className="flex items-center gap-2 min-w-max stagger-children">
                                    <button
                                        onClick={() => setActiveType(null)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all animate-popIn ${
                                            !activeType
                                                ? 'bg-gray-800 text-white border-gray-800 shadow-md'
                                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        الكل
                                    </button>
                                    {getVisibleChips().map((type, idx) => (
                                        <button
                                            key={type.id}
                                            onClick={() => {
                                                setActiveType(activeType === type.id ? null : type.id as any);
                                                setCurrentPage(1);
                                            }}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all animate-popIn ${
                                                activeType === type.id
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                            }`}
                                            style={{ animationDelay: `${(idx + 1) * 50}ms` }}
                                        >
                                            <type.icon size={12} className="shrink-0" />
                                            <span>{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === FEED CONTENT === */}
                    <div className="space-y-4 sm:space-y-6 pb-28 sm:pb-24 lg:pb-0 min-h-[400px] sm:min-h-[600px]">
                        {displayedItems.length > 0 ? (
                            <>
                                {/* Staggered Feed Cards */}
                                <div className="stagger-children">
                                    {displayedItems.map((item, idx) => (
                                        <div
                                            key={item.id}
                                            className="animate-fadeInUp mb-4 sm:mb-6"
                                            style={{ animationDelay: `${Math.min(idx * 50, 500)}ms` }}
                                        >
                                            <FeedCard item={item} />
                                        </div>
                                    ))}
                                </div>

                                {/* === PAGINATION === */}
                                <div className="mt-8 mb-10 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
                                    <div className="text-sm text-gray-500 order-2 sm:order-1">
                                        عرض <span className="font-bold text-gray-900">{displayedItems.length}</span> من <span className="font-bold text-gray-900">{totalItems}</span>
                                    </div>

                                    <div className="flex items-center gap-2 order-1 sm:order-2">
                                        <button
                                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronRight size={18} />
                                        </button>

                                        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl">
                                            {Array.from({ length: Math.min(totalPages <= 3 ? totalPages : 3, totalPages) }, (_, i) => {
                                                let p = i + 1;
                                                return (
                                                    <button
                                                        key={p}
                                                        onClick={() => handlePageChange(p)}
                                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                                                            currentPage === p
                                                                ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                                                                : 'text-gray-500 hover:text-gray-900'
                                                        }`}
                                                    >
                                                        {p}
                                                    </button>
                                                );
                                            })}
                                            {totalPages > 3 && <span className="px-2 text-gray-400 text-sm">...</span>}
                                            {totalPages > 3 && (
                                                <button
                                                    onClick={() => handlePageChange(totalPages)}
                                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                                                        currentPage === totalPages
                                                            ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                                                            : 'text-gray-500 hover:text-gray-900'
                                                    }`}
                                                >
                                                    {totalPages}
                                                </button>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 animate-fadeIn">
                                <div className="inline-block p-4 bg-gray-50 rounded-full mb-3">
                                    <Search size={24} className="text-gray-400" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">لا توجد نتائج</h3>
                                <p className="text-gray-500 font-medium text-sm px-4">حاول تغيير الفلاتر أو كلمات البحث</p>
                                <button
                                    onClick={() => { setActiveTab('ALL'); setActiveType(null); setSearchQuery(''); }}
                                    className="mt-4 text-blue-600 font-bold text-sm hover:underline"
                                >
                                    مسح كل الفلاتر
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* === SIDEBAR === */}
                <div className="hidden lg:block w-80 shrink-0 space-y-6 pt-2">
                    {/* User Profile Card */}
                    {user ? (
                        <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden group animate-fadeInLeft">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700 animate-blob"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700 animate-blob delay-500"></div>

                            <div className="relative z-10">
                                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-3 border-4 border-white/30 shadow-lg overflow-hidden relative group-hover:scale-105 transition-transform">
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center backdrop-blur-[1px] cursor-pointer">
                                        <span className="text-[10px] font-bold uppercase tracking-wider">تعديل</span>
                                    </div>
                                </div>
                                <h3 className="font-bold text-white text-center mb-1 text-lg">{user.name}</h3>
                                <p className="text-xs text-white/80 font-medium text-center mb-4 bg-white/10 inline-block px-3 py-1 rounded-full mx-auto">{user.role}</p>

                                {/* Quick Stats - REAL USER DATA */}
                                {userStats && (
                                    <div className="grid grid-cols-2 gap-2 mt-6">
                                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 text-center border border-white/10 hover:bg-white/20 transition-colors cursor-pointer group/stat">
                                            <p className="text-xl font-black group-hover/stat:scale-110 transition-transform">
                                                <AnimatedCounter end={userStats.favorites} duration={1500} />
                                            </p>
                                            <p className="text-[10px] text-white/70 font-bold uppercase">المفضلة</p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 text-center border border-white/10 hover:bg-white/20 transition-colors cursor-pointer group/stat">
                                            <p className="text-xl font-black group-hover/stat:scale-110 transition-transform">
                                                <AnimatedCounter end={userStats.dashboards} duration={1500} />
                                            </p>
                                            <p className="text-[10px] text-white/70 font-bold uppercase">لوحات التحكم</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Guest Welcome Card */
                        <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden group animate-fadeInLeft">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-blob"></div>
                            <div className="relative z-10 text-center">
                                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-3 flex items-center justify-center animate-float">
                                    <Sparkles size={32} className="text-white animate-sparkle" />
                                </div>
                                <h3 className="font-bold text-white mb-2 text-lg">مرحباً بك في رادار المستثمر</h3>
                                <p className="text-xs text-white/80 mb-4">سجل دخولك للوصول لكامل الميزات</p>
                                <a href="#/login" className="block w-full bg-white text-blue-600 font-bold py-2.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                                    تسجيل الدخول
                                </a>
                                <a href="#/register" className="block w-full mt-2 bg-white/10 text-white font-bold py-2.5 rounded-xl hover:bg-white/20 transition-colors border border-white/20">
                                    إنشاء حساب جديد
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Trending Topics */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm sticky top-24 animate-fadeInLeft delay-200">
                        <h3 className="font-bold text-gray-900 mb-4 text-sm flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-red-200 shadow-lg animate-pulse">
                                <TrendingUp size={16} className="text-white" />
                            </div>
                            المواضيع الرائجة
                            <LiveIndicator label="" />
                        </h3>

                        {trendingLoading ? (
                            <div className="space-y-3">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                                        <div className="w-6 h-4 bg-gray-200 rounded skeleton" />
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-2/3 mb-1 skeleton" />
                                            <div className="h-3 bg-gray-200 rounded w-1/3 skeleton" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : trendingTopics.length === 0 ? (
                            <div className="text-center py-6 text-gray-400 text-sm">
                                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>لا توجد مواضيع رائجة حالياً</p>
                            </div>
                        ) : (
                            <div className="space-y-2 stagger-children">
                                {trendingTopics.map((item, idx) => (
                                    <button
                                        key={item.tag}
                                        onClick={() => setSearchQuery(item.tag.replace('#', ''))}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group animate-fadeInRight"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-black text-gray-300 group-hover:text-blue-500 transition-colors w-6">
                                                {idx + 1}
                                            </span>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                                    {item.tag}
                                                </p>
                                                <p className="text-[10px] text-gray-400">
                                                    {item.countFormatted} {item.type === 'category' ? 'مجموعة بيانات' : 'منشور'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border group-hover:scale-110 transition-transform ${
                                            item.color === 'blue' ? 'text-blue-600 bg-blue-50 border-blue-100' :
                                            item.color === 'green' ? 'text-green-600 bg-green-50 border-green-100' :
                                            item.color === 'purple' ? 'text-purple-600 bg-purple-50 border-purple-100' :
                                            item.color === 'amber' ? 'text-amber-600 bg-amber-50 border-amber-100' :
                                            'text-indigo-600 bg-indigo-50 border-indigo-100'
                                        }`}>
                                            {item.type === 'category' ? 'تصنيف' : 'وسم'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <button className="w-full mt-4 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-blue-100 hover:border-blue-200 flex items-center justify-center gap-2 group">
                            <span>عرض المزيد من التحليلات</span>
                            <ArrowUpRight size={14} className="group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-transform" />
                        </button>
                    </div>

                    {/* Platform Stats Widget - REAL DATA */}
                    {stats && stats.isRealData && (
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl shadow-xl text-white animate-fadeInLeft delay-400">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-sm flex items-center gap-2">
                                    <Activity size={16} className="text-green-400 animate-pulse" />
                                    إحصائيات المنصة
                                </h3>
                                <LiveIndicator />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group">
                                    <span className="text-white/70 text-sm font-medium">إجمالي البيانات</span>
                                    <div className="text-right">
                                        <p className="font-bold text-white group-hover:scale-105 transition-transform">
                                            {stats.totalDatasets.toLocaleString('ar-SA')}
                                        </p>
                                        {stats.newThisWeek > 0 && (
                                            <p className="text-xs font-bold text-green-400">
                                                +{stats.newThisWeek} هذا الأسبوع
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group">
                                    <span className="text-white/70 text-sm font-medium">الإشارات النشطة</span>
                                    <div className="text-right">
                                        <p className="font-bold text-white group-hover:scale-105 transition-transform">
                                            {stats.activeSignals.toLocaleString('ar-SA')}
                                        </p>
                                        <p className="text-xs font-bold text-blue-400">
                                            من {stats.totalSignals} إجمالي
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group">
                                    <span className="text-white/70 text-sm font-medium">المحتوى المنشور</span>
                                    <div className="text-right">
                                        <p className="font-bold text-white group-hover:scale-105 transition-transform">
                                            {stats.totalContent.toLocaleString('ar-SA')}
                                        </p>
                                        <p className="text-xs font-bold text-cyan-400">
                                            {stats.totalViews.toLocaleString('ar-SA')} مشاهدة
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomeFeed;
