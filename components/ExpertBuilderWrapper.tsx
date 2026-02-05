/**
 * Expert Builder Wrapper - استوديو الخبراء
 * WebFlux SSE Streaming with Pagination - Performance Optimized
 */

import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import {
    Layers,
    Plus,
    Search,
    X,
    LayoutTemplate,
    Globe,
    CheckCircle2,
    Trash2,
    BarChart2,
    Zap,
    TrendingUp,
    Activity,
    Target,
    Thermometer,
    ShieldCheck,
    Loader2,
    RefreshCw,
    Radio,
    Database,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

// Types
type AtomicWidgetType = 'metric' | 'sparkline' | 'progress' | 'donut' | 'status' | 'gauge';

interface Widget {
    id: string;
    title: string;
    type: string;
    category: string;
    description: string;
    data: Array<{ name: string; value: number }>;
    lastRefresh: string;
    atomicType: AtomicWidgetType;
    atomicMetadata: {
        trend?: number;
        target?: number;
        statusColor?: string;
        subLabel?: string;
    };
}

interface StreamMeta {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
    categories: Array<{ id: string; label: string; labelEn: string; count: number }>;
}

interface ExpertBuilderWrapperProps {
    onPublishDashboard?: (name: string, description: string, selectedWidgets: string[]) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const PAGE_SIZE = 60;

// Memoized Atomic Widget Card
const AtomicWidgetCard = memo(({
    widget,
    isSelected,
    onToggle,
}: {
    widget: Widget;
    isSelected: boolean;
    onToggle: () => void;
}) => {
    const { atomicType, atomicMetadata, data } = widget;
    const primaryValue = data[0]?.value || 0;
    const isPositive = (atomicMetadata.trend || 0) >= 0;

    const renderContent = () => {
        switch (atomicType) {
            case 'sparkline':
                return (
                    <div className="flex flex-col justify-end h-16 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-end gap-1 opacity-50">
                            {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                                <div key={i} style={{ height: `${h}%` }} className={`flex-1 rounded-t-sm ${isPositive ? 'bg-blue-500' : 'bg-red-500'}`} />
                            ))}
                        </div>
                        <div className="relative z-10 flex justify-between items-end pb-1">
                            <span className="font-black text-xl text-gray-800">{primaryValue.toLocaleString()}</span>
                            <TrendingUp size={16} className={isPositive ? 'text-blue-600' : 'text-red-500 rotate-180'} />
                        </div>
                    </div>
                );
            case 'progress':
                return (
                    <div className="flex flex-col justify-center h-16 space-y-2">
                        <div className="flex justify-between text-xs font-bold text-gray-500">
                            <span>الإنجاز</span>
                            <span>{atomicMetadata.target}%</span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div style={{ width: `${atomicMetadata.target}%` }} className={`h-full rounded-full ${isPositive ? 'bg-green-500' : 'bg-amber-500'}`} />
                        </div>
                    </div>
                );
            case 'donut':
                return (
                    <div className="flex items-center gap-3 h-16">
                        <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-purple-500 border-r-purple-500 rotate-45 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-purple-700 -rotate-45">{atomicMetadata.target}%</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg text-gray-800">{primaryValue}</span>
                            <span className="text-[10px] text-gray-400">وحدة قياس</span>
                        </div>
                    </div>
                );
            case 'status':
                return (
                    <div className="flex flex-col items-center justify-center h-16 bg-gray-50 rounded-xl border border-gray-100">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`} />
                            {isPositive ? 'عمليات مستقرة' : 'يتطلب انتباه'}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-2">آخر تحديث: الآن</span>
                    </div>
                );
            case 'gauge':
                return (
                    <div className="flex flex-col items-center justify-center h-16 relative">
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-1 flex">
                            <div className="w-1/3 bg-green-500" />
                            <div className="w-1/3 bg-yellow-500" />
                            <div className="w-1/3 bg-red-500" />
                        </div>
                        <div className="absolute top-1/2 left-[60%] w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-slate-800 -translate-x-1/2" />
                        <div className="flex justify-between w-full text-[10px] text-gray-400 px-1 mt-1 font-bold">
                            <span>آمن</span>
                            <span>خطر</span>
                        </div>
                    </div>
                );
            case 'metric':
            default:
                return (
                    <div className="flex flex-col h-16 justify-center">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-gray-900 tracking-tight">{primaryValue.toLocaleString()}</span>
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {isPositive ? '+' : ''}{atomicMetadata.trend}%
                            </span>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1">{atomicMetadata.subLabel || 'مقارنة بالعام الماضي'}</span>
                    </div>
                );
        }
    };

    return (
        <div
            onClick={onToggle}
            className={`
                relative group cursor-pointer transition-all duration-200
                rounded-2xl border p-4 flex flex-col justify-between h-[180px]
                ${isSelected
                    ? 'bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-200'
                    : 'bg-white border-gray-100 hover:border-blue-300 hover:shadow-lg'
                }
            `}
        >
            {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm z-10">
                    <CheckCircle2 size={12} strokeWidth={3} />
                </div>
            )}

            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-200 text-blue-700' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600'} transition-colors`}>
                    {widget.atomicType === 'progress' ? <Target size={16} /> :
                        widget.atomicType === 'sparkline' ? <Activity size={16} /> :
                            widget.atomicType === 'status' ? <ShieldCheck size={16} /> :
                                widget.atomicType === 'gauge' ? <Thermometer size={16} /> :
                                    <BarChart2 size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 text-xs leading-tight truncate" title={widget.title}>{widget.title}</h4>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest block">{widget.category}</span>
                </div>
            </div>

            <div className="flex-1 content-center">
                {renderContent()}
            </div>
        </div>
    );
});

// Skeleton
const WidgetSkeleton = () => (
    <div className="rounded-2xl border border-gray-100 p-4 h-[180px] bg-white animate-pulse">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gray-200" />
            <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
        </div>
        <div className="h-16 bg-gray-100 rounded-xl" />
    </div>
);

// Main Component
const ExpertBuilderWrapper: React.FC<ExpertBuilderWrapperProps> = ({ onPublishDashboard }) => {
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [loading, setLoading] = useState(true);
    const [streaming, setStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
    const [selectedWidgetData, setSelectedWidgetData] = useState<Map<string, Widget>>(new Map());
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [dashboardName, setDashboardName] = useState('');
    const [dashboardDesc, setDashboardDesc] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [streamMeta, setStreamMeta] = useState<StreamMeta | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounced search
    const handleSearchInput = useCallback((value: string) => {
        setSearchInput(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setSearchQuery(value);
            setCurrentPage(1);
        }, 400);
    }, []);

    // Stream widgets for current page
    const fetchWidgetsStream = useCallback((page: number, cat: string, search: string) => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        setLoading(true);
        setStreaming(true);
        setError(null);
        setWidgets([]);

        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('limit', String(PAGE_SIZE));
        if (cat !== 'ALL') params.append('category', cat);
        if (search) params.append('search', search);

        const url = `${API_BASE_URL}/widgets/stream?${params.toString()}`;
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.addEventListener('meta', (e) => {
            const meta = JSON.parse(e.data) as StreamMeta;
            setStreamMeta(meta);
        });

        eventSource.addEventListener('widget', (e) => {
            const widget = JSON.parse(e.data) as Widget;
            setWidgets(prev => {
                if (prev.some(w => w.id === widget.id)) return prev;
                return [...prev, widget];
            });
            setLoading(false);
        });

        eventSource.addEventListener('complete', () => {
            setStreaming(false);
            setLoading(false);
            eventSource.close();
        });

        eventSource.onerror = () => {
            setStreaming(false);
            eventSource.close();
            if (widgets.length === 0) {
                setLoading(false);
                setError('تعذر الاتصال بالخادم');
            }
        };
    }, []);

    // Trigger stream on page/category/search change
    useEffect(() => {
        fetchWidgetsStream(currentPage, activeCategory, searchQuery);
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [currentPage, activeCategory, searchQuery]);

    // Cleanup search timer
    useEffect(() => {
        return () => {
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        };
    }, []);

    // Categories from meta
    const categories = useMemo(() => {
        if (streamMeta?.categories) {
            return [{ id: 'ALL', label: 'الكل', count: streamMeta.total }, ...streamMeta.categories];
        }
        return [{ id: 'ALL', label: 'الكل', count: 0 }];
    }, [streamMeta]);

    const toggleWidget = useCallback((id: string) => {
        setSelectedWidgets(prev => {
            if (prev.includes(id)) {
                setSelectedWidgetData(map => {
                    const next = new Map(map);
                    next.delete(id);
                    return next;
                });
                return prev.filter(w => w !== id);
            } else {
                return [...prev, id];
            }
        });
    }, []);

    // Track selected widget data when widgets load
    useEffect(() => {
        if (widgets.length === 0) return;
        setSelectedWidgetData(prev => {
            const next = new Map(prev);
            for (const w of widgets) {
                if (selectedWidgets.includes(w.id)) {
                    next.set(w.id, w);
                }
            }
            return next;
        });
    }, [widgets, selectedWidgets]);

    // Also store widget data on selection
    const handleToggle = useCallback((widget: Widget) => {
        setSelectedWidgets(prev => {
            if (prev.includes(widget.id)) {
                setSelectedWidgetData(map => {
                    const next = new Map(map);
                    next.delete(widget.id);
                    return next;
                });
                return prev.filter(w => w !== widget.id);
            } else {
                setSelectedWidgetData(map => {
                    const next = new Map(map);
                    next.set(widget.id, widget);
                    return next;
                });
                return [...prev, widget.id];
            }
        });
    }, []);

    const handlePublish = () => {
        if (!dashboardName || selectedWidgets.length === 0) return;
        setIsPublishing(true);
        setTimeout(() => {
            if (onPublishDashboard) {
                onPublishDashboard(dashboardName, dashboardDesc, selectedWidgets);
            }
            setIsPreviewOpen(true);
            setIsPublishing(false);
        }, 1000);
    };

    const closePreview = () => {
        setIsPreviewOpen(false);
        setSelectedWidgets([]);
        setSelectedWidgetData(new Map());
        setDashboardName('');
        setDashboardDesc('');
    };

    const handleCategoryChange = useCallback((cat: string) => {
        setActiveCategory(cat);
        setCurrentPage(1);
    }, []);

    const totalPages = streamMeta?.totalPages || 1;
    const total = streamMeta?.total || 0;

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-slate-50">
            {/* LEFT: Widget Repository */}
            <div className="flex-1 flex flex-col min-w-0 pr-6 pl-6 pt-6 pb-2">
                {/* Header */}
                <div className="mb-4">
                    <div className="flex justify-between items-end mb-3">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 mb-1 flex items-center gap-2">
                                <LayoutTemplate className="text-blue-600" />
                                استوديو الخبراء
                                {streaming && (
                                    <Radio size={18} className="text-green-500 animate-pulse" />
                                )}
                            </h1>
                            <p className="text-slate-500 text-sm flex items-center gap-2">
                                <Database size={14} className="text-blue-500" />
                                {total > 0 ? (
                                    <>مكتبة المؤشرات ({total.toLocaleString()} مؤشر) — صفحة {currentPage} من {totalPages}</>
                                ) : loading ? 'جاري التحميل...' : 'لا توجد مؤشرات'}
                            </p>
                        </div>
                        <button
                            onClick={() => fetchWidgetsStream(currentPage, activeCategory, searchQuery)}
                            disabled={streaming}
                            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-all"
                            title="تحديث"
                        >
                            {streaming ? <Loader2 size={18} className="animate-spin text-blue-600" /> : <RefreshCw size={18} />}
                        </button>
                    </div>

                    {/* Search + Categories */}
                    <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="بحث في المكتبة..."
                                value={searchInput}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                className="w-full pl-4 pr-10 py-2.5 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                            />
                        </div>
                        <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-xl p-1">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.id)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeCategory === cat.id
                                        ? 'bg-slate-900 text-white shadow-md'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                    }`}
                                >
                                    {cat.label}
                                    {cat.count > 0 && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-white/20' : 'bg-gray-200'}`}>
                                            {cat.count > 999 ? `${(cat.count / 1000).toFixed(1)}k` : cat.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Streaming Progress */}
                {streaming && (
                    <div className="mb-3 flex items-center gap-3 text-blue-600 text-xs font-bold px-2">
                        <Loader2 size={14} className="animate-spin" />
                        جاري تحميل المؤشرات... ({widgets.length})
                    </div>
                )}

                {/* Loading Skeletons */}
                {loading && widgets.length === 0 && (
                    <div className="flex-1 overflow-y-auto pb-10 pr-2">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {Array.from({ length: 10 }, (_, i) => <WidgetSkeleton key={i} />)}
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && widgets.length === 0 && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                            <p className="text-red-600 mb-4">{error}</p>
                            <button
                                onClick={() => fetchWidgetsStream(currentPage, activeCategory, searchQuery)}
                                className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                            >
                                إعادة المحاولة
                            </button>
                        </div>
                    </div>
                )}

                {/* Grid */}
                {widgets.length > 0 && (
                    <div className="flex-1 overflow-y-auto pb-4 pr-2 custom-scrollbar">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {widgets.map((widget) => (
                                <AtomicWidgetCard
                                    key={widget.id}
                                    widget={widget}
                                    isSelected={selectedWidgets.includes(widget.id)}
                                    onToggle={() => handleToggle(widget)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && !loading && (
                    <div className="flex items-center justify-center gap-3 py-3 border-t border-gray-200 bg-white/50">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage <= 1 || streaming}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                            السابق
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let page: number;
                                if (totalPages <= 5) {
                                    page = i + 1;
                                } else if (currentPage <= 3) {
                                    page = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    page = totalPages - 4 + i;
                                } else {
                                    page = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        disabled={streaming}
                                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                                            page === currentPage
                                                ? 'bg-slate-900 text-white shadow-md'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <>
                                    <span className="text-gray-400 px-1">...</span>
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={streaming}
                                        className="w-9 h-9 rounded-lg text-sm font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages || streaming}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            التالي
                            <ChevronLeft size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* RIGHT: Staging Area */}
            <div className="w-80 xl:w-96 bg-white border-r border-gray-200 shadow-2xl z-20 flex flex-col">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <Layers size={20} className="text-blue-600" />
                            لوحة قيد البناء
                        </h2>
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg transition-all ${selectedWidgets.length > 0 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-200 text-gray-500'}`}>
                            {selectedWidgets.length}
                        </span>
                    </div>
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={dashboardName}
                            onChange={(e) => setDashboardName(e.target.value)}
                            placeholder="عنوان اللوحة..."
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-300"
                        />
                        <input
                            type="text"
                            value={dashboardDesc}
                            onChange={(e) => setDashboardDesc(e.target.value)}
                            placeholder="وصف (اختياري)..."
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-300"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 custom-scrollbar">
                    {selectedWidgets.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400/50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                            <Plus size={48} strokeWidth={1} className="mb-4" />
                            <p className="text-sm font-medium">انقر على المؤشرات للإضافة</p>
                        </div>
                    ) : (
                        selectedWidgets.slice().reverse().map((id, index) => {
                            const w = selectedWidgetData.get(id) || widgets.find(aw => aw.id === id);
                            if (!w) return (
                                <div key={id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                                    <span className="text-xs text-gray-400 truncate">{id}</span>
                                    <button onClick={() => toggleWidget(id)} className="text-red-400 hover:text-red-600 p-1">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            );
                            return (
                                <div key={id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between gap-3 group hover:border-blue-300 transition-all">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center shrink-0 text-sm font-bold">
                                            {index + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <h5 className="text-xs font-bold text-gray-800 truncate leading-tight">{w.title}</h5>
                                            <p className="text-[10px] text-gray-400 uppercase">{w.atomicType}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggle(w)}
                                        className="text-gray-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-5 border-t border-gray-200 bg-white">
                    <button
                        disabled={selectedWidgets.length === 0 || !dashboardName || isPublishing}
                        onClick={handlePublish}
                        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-xl flex items-center justify-center gap-2 transition-all
                            ${selectedWidgets.length === 0 || !dashboardName
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-slate-900 hover:bg-slate-800 hover:shadow-slate-900/20'
                            }
                        `}
                    >
                        {isPublishing ? (
                            <><Zap size={18} className="animate-spin" /> جاري النشر...</>
                        ) : (
                            <><Globe size={18} /> نشر اللوحة</>
                        )}
                    </button>
                </div>
            </div>

            {/* POST-PUBLISH PREVIEW MODAL */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 lg:p-10" dir="rtl">
                    <div className="bg-slate-50 w-full h-full max-w-7xl rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative ring-4 ring-white/10">
                        <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <CheckCircle2 size={12} /> تم النشر بنجاح
                                    </span>
                                    <span className="text-gray-400 text-xs uppercase tracking-widest font-bold">LIVE PREVIEW</span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900">{dashboardName}</h2>
                                {dashboardDesc && <p className="text-gray-500 text-sm mt-1">{dashboardDesc}</p>}
                            </div>
                            <button onClick={closePreview} className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-lg flex items-center gap-2">
                                <X size={18} /> إغلاق
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar bg-slate-50">
                            <div className="max-w-6xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {selectedWidgets.map(id => {
                                        const w = selectedWidgetData.get(id);
                                        if (!w) return null;
                                        return (
                                            <div key={id} className="pointer-events-none select-none">
                                                <AtomicWidgetCard widget={w} isSelected={false} onToggle={() => {}} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border-t border-gray-200 p-4 text-center text-xs text-gray-400">
                            معاينة بصرية للوحة — {selectedWidgets.length} مؤشر
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpertBuilderWrapper;
