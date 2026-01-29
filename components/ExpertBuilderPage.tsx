import React, { useState, useMemo } from 'react';
import {
    Layers,
    Plus,
    Search,
    Filter,
    CheckCircle2,
    X,
    LayoutTemplate,
    Globe,
    Lock,
    ArrowRight,
    Save,
    Share2,
    Trash2,
    BarChart2,
    PieChart,
    LineChart,
    Zap,
    TrendingUp,
    Activity,
    Droplets,
    Wind,
    Cpu,
    Database,
    Users,
    DollarSign,
    Briefcase,
    Target,
    Thermometer,
    ShieldCheck,
    AlertTriangle,
    Clock,
    MapPin,
    Box,
    Truck
} from 'lucide-react';
import { Widget, ChartType } from '../types';

interface ExpertBuilderPageProps {
    allWidgets: Widget[];
    onPublishDashboard: (name: string, description: string, selectedWidgets: string[]) => void;
}

// Extended types for internal builder use
type AtomicWidgetType = 'metric' | 'sparkline' | 'progress' | 'donut' | 'status' | 'gauge';

interface AtomicWidget extends Widget {
    atomicType: AtomicWidgetType;
    atomicMetadata: {
        trend?: number;
        target?: number;
        statusColor?: string;
        subLabel?: string;
    };
}

// --------------------------------------------------------
// GENERATORS
// --------------------------------------------------------

const generateMockWidgets = (baseWidgets: Widget[]): AtomicWidget[] => {
    const categories = [
        { id: 'finance', icon: DollarSign, label: 'المالية', colors: ['blue', 'indigo'] },
        { id: 'ops', icon: Box, label: 'العمليات', colors: ['slate', 'gray'] },
        { id: 'hr', icon: Users, label: 'الموارد البشرية', colors: ['rose', 'pink'] },
        { id: 'energy', icon: Zap, label: 'الطاقة', colors: ['amber', 'yellow'] },
        { id: 'logistics', icon: Truck, label: 'اللوجستيات', colors: ['cyan', 'sky'] },
        { id: 'tech', icon: Cpu, label: 'التقنية', colors: ['violet', 'purple'] },
    ];

    const types: AtomicWidgetType[] = ['metric', 'sparkline', 'progress', 'donut', 'status', 'gauge'];

    const mockWidgets: AtomicWidget[] = [];

    // 1. Convert base widgets
    baseWidgets.forEach(w => {
        mockWidgets.push({
            ...w,
            atomicType: w.type === 'line' ? 'sparkline' : w.type === 'pie' ? 'donut' : 'metric',
            atomicMetadata: { trend: Math.floor(Math.random() * 20) - 10 }
        });
    });

    // 2. Generate 55+ more to reach > 60 total
    const remaining = 65 - baseWidgets.length;

    for (let i = 0; i < remaining; i++) {
        const cat = categories[i % categories.length];
        const type = types[i % types.length];
        const value = Math.floor(Math.random() * 10000);
        const trend = Math.floor(Math.random() * 40) - 15;

        mockWidgets.push({
            id: `gen_w_${i}`,
            title: `${cat.label} - مؤشر ${type === 'metric' ? 'الأداء' : type === 'progress' ? 'الإنجاز' : 'التحليل'} ${i + 1}`,
            type: 'kpi' as ChartType, // Generic type for backend
            category: cat.id,
            description: `وصف تجريبي لمؤشر ${cat.label}`,
            data: [{ name: 'Current', value: value }],
            lastRefresh: 'Now',
            widgets: [], // Not relevant
            tags: [],
            atomicType: type,
            atomicMetadata: {
                trend: trend,
                target: Math.floor(Math.random() * 100),
                statusColor: trend > 0 ? 'green' : trend < -5 ? 'red' : 'amber',
                subLabel: ['شهري', 'سنوي', 'تراكمي', 'Q1'][i % 4]
            }
        });
    }

    return mockWidgets;
};

// --------------------------------------------------------
// ATOMIC COMPONENTS
// --------------------------------------------------------

const AtomicWidgetCard = ({ widget, isSelected, onToggle }: { widget: AtomicWidget, isSelected: boolean, onToggle: () => void }) => {
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
                                <div key={i} style={{ height: `${h}%` }} className={`flex-1 rounded-t-sm ${isPositive ? 'bg-blue-500' : 'bg-red-500'}`}></div>
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
                            <div style={{ width: `${atomicMetadata.target}%` }} className={`h-full rounded-full ${isPositive ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400">
                            <span>المستهدف: 100%</span>
                        </div>
                    </div>
                );
            case 'donut':
                return (
                    <div className="flex items-center gap-3 h-16">
                        <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-purple-500 border-r-purple-500 rotate-45 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-purple-700">{atomicMetadata.target}%</span>
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
                            <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                            {isPositive ? 'عمليات مستقرة' : 'يتطلب انتباه'}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-2">آخر تحديث: الآن</span>
                    </div>
                );
            case 'gauge':
                return (
                    <div className="flex flex-col items-center justify-center h-16 relative">
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-1 flex">
                            <div className="w-1/3 bg-green-500"></div>
                            <div className="w-1/3 bg-yellow-500"></div>
                            <div className="w-1/3 bg-red-500"></div>
                        </div>
                        {/* Pointer Mock */}
                        <div className="absolute top-1/2 left-[60%] w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-slate-800 -translate-x-1/2"></div>
                        <div className="flex justify-between w-full text-[10px] text-gray-400 px-1 mt-1 font-bold">
                            <span>آمن</span>
                            <span>خطر</span>
                        </div>
                    </div>
                )
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
        relative group cursor-pointer transition-all duration-300
        rounded-2xl border p-4 flex flex-col justify-between h-[180px]
        ${isSelected
                    ? 'bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-200 transform scale-[1.02]'
                    : 'bg-white border-gray-100 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1'
                }
      `}
        >
            {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm animate-scaleIn z-10">
                    <CheckCircle2 size={12} strokeWidth={3} />
                </div>
            )}

            {/* Header */}
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

            {/* Body */}
            <div className="flex-1 content-center">
                {renderContent()}
            </div>

        </div>
    );
};

// --------------------------------------------------------
// MAIN PAGE
// --------------------------------------------------------

const ExpertBuilderPage: React.FC<ExpertBuilderPageProps> = ({ allWidgets, onPublishDashboard }) => {
    // Use Memo to generate widgets once
    const widgets = useMemo(() => generateMockWidgets(allWidgets), [allWidgets]);

    const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('ALL');

    // Staging / Metadata State
    const [dashboardName, setDashboardName] = useState('');
    const [dashboardDesc, setDashboardDesc] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);

    // Preview State (NEW)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Categories
    const categories = ['ALL', ...Array.from(new Set(widgets.map(w => w.category)))];

    // Filtering
    const filteredWidgets = widgets.filter(w => {
        const matchesSearch = w.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'ALL' || w.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleWidget = (id: string) => {
        setSelectedWidgets(prev =>
            prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
        );
    };

    const handlePublish = () => {
        if (!dashboardName || selectedWidgets.length === 0) return;
        setIsPublishing(true);

        // Simulate API call
        setTimeout(() => {
            // 1. Commit to App State
            onPublishDashboard(dashboardName, dashboardDesc, selectedWidgets);

            // 2. Open Preview Modal
            setIsPreviewOpen(true);
            setIsPublishing(false);

            // Note: We don't reset form immediately so user can see what they built in background too
        }, 1500);
    };

    const closePreview = () => {
        setIsPreviewOpen(false);
        setSelectedWidgets([]);
        setDashboardName('');
        setDashboardDesc('');
    };

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-slate-50">

            {/* LEFT: Widget Repository */}
            <div className="flex-1 flex flex-col min-w-0 pr-6 pl-6 pt-6 pb-2">

                {/* Header & Filter */}
                <div className="mb-6">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 mb-1 flex items-center gap-2">
                                <LayoutTemplate className="text-blue-600" />
                                استوديو الخبراء
                            </h1>
                            <p className="text-slate-500 text-sm">مكتبة المؤشرات الذكية ({widgets.length} عنصر)</p>
                        </div>
                        <div className="hidden lg:flex gap-3 text-xs font-bold text-gray-400">
                            <span className="flex items-center gap-1"><Target size={14} /> {widgets.filter(w => w.atomicType === 'progress').length} Progress</span>
                            <span className="flex items-center gap-1"><Activity size={14} /> {widgets.filter(w => w.atomicType === 'sparkline').length} Charts</span>
                        </div>
                    </div>

                    <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="بحث في المكتبة..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-4 pr-10 py-2.5 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                            />
                        </div>
                        <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-xl p-1">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-slate-900 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    {cat.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto pb-10 pr-2 custom-scrollbar">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredWidgets.map(widget => (
                            <AtomicWidgetCard
                                key={widget.id}
                                widget={widget}
                                isSelected={selectedWidgets.includes(widget.id)}
                                onToggle={() => toggleWidget(widget.id)}
                            />
                        ))}
                    </div>
                    {filteredWidgets.length === 0 && (
                        <div className="text-center py-20 text-gray-400">
                            لا توجد مؤشرات تطابق بحثك
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Staging Area (Sidebar) */}
            <div className="w-80 xl:w-96 bg-white border-r border-gray-200 shadow-2xl z-20 flex flex-col animate-slideInRight">

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
                            <p className="text-sm font-medium">اسحب وأفلت أو انقر على المؤشرات للإضافة</p>
                        </div>
                    ) : (
                        selectedWidgets.slice().reverse().map((id, index) => { // Show newest first
                            const w = widgets.find(aw => aw.id === id);
                            if (!w) return null;
                            return (
                                <div key={id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between gap-3 group hover:border-blue-300 transition-all animate-fadeIn">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <h5 className="text-xs font-bold text-gray-800 truncate leading-tight">{w.title}</h5>
                                            <p className="text-[10px] text-gray-400 uppercase">{w.atomicType}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleWidget(id)}
                                        className="text-gray-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )
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
                                : 'bg-slate-900 hover:bg-slate-800 hover:shadow-slate-900/20 hover:-translate-y-1'
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
                <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 lg:p-10 animate-fadeIn" style={{ animationDuration: '0.3s' }}>
                    <div className="bg-slate-50 w-full h-full max-w-7xl rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-scaleIn relative ring-4 ring-white/10" dir="rtl">

                        {/* Modal Header */}
                        <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <CheckCircle2 size={12} /> تم النشر بنجاح
                                    </span>
                                    <span className="text-gray-400 text-xs">|</span>
                                    <span className="text-gray-400 text-xs uppercase tracking-widest font-bold">LIVE PREVIEW</span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900">{dashboardName}</h2>
                                {dashboardDesc && <p className="text-gray-500 text-sm mt-1">{dashboardDesc}</p>}
                            </div>

                            <div className="flex items-center gap-3">
                                <button onClick={closePreview} className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 flex items-center gap-2">
                                    <X size={18} /> إغلاق ومتابعة
                                </button>
                            </div>
                        </div>

                        {/* Dashboard Content Preview */}
                        <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar bg-slate-50">
                            <div className="max-w-6xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {selectedWidgets.map(id => {
                                        const w = widgets.find(aw => aw.id === id);
                                        if (!w) return null;
                                        return (
                                            <div key={id} className="pointer-events-none select-none grayscale-0 opacity-100">
                                                <AtomicWidgetCard widget={w} isSelected={false} onToggle={() => { }} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Visual Footer */}
                        <div className="bg-white border-t border-gray-200 p-4 text-center text-xs text-gray-400">
                            هذه معاينة بصرية لكيفية ظهور اللوحة للمستخدمين النهائيين. البيانات المعروضة هي بيانات اللحظة الحالية.
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default ExpertBuilderPage;
