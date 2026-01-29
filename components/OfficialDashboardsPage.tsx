/**
 * ============================================
 * OFFICIAL DASHBOARDS PAGE
 * ============================================
 * 
 * صفحة اللوحات الرسمية - بتصاميم متعددة (Grid, List, Hybrid)
 * تدعم 30+ لوحة مع تصفية، بحث، ومفضلة
 */

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    LayoutGrid,
    List,
    Star,
    Search,
    Filter,
    BarChart2,
    PieChart,
    LineChart,
    ArrowUpRight,
    MoreHorizontal,
    Heart,
    ExternalLink,
    Info,
    Layers,
    Sparkles,
    Download,
    Share2,
    Calendar,
    Eye,
    TrendingUp,
    Building2,
    Zap,
    Globe,
    Briefcase,
    Landmark,
    Home,
    CheckCircle2,
    Smartphone
} from 'lucide-react';
import { Dashboard, Widget, UserRole } from '../types';
import WidgetCard from './WidgetCard';

// ============================================
// MOCK DATA - بيانات تجريبية موسعة ومثراة
// ============================================

interface ExtendedDashboard extends Dashboard {
    category: string;
    views: number;
    lastUpdated: string;
    isFavorite: boolean;
    color: string;
    trend: number;
    description: string;
    keyMetrics: string[]; // أبرز المؤشرات في اللوحة
    dataFreq: 'daily' | 'monthly' | 'quarterly' | 'yearly';
}

const DASHBOARD_CATEGORIES = [
    { id: 'all', label: 'الكل' },
    { id: 'economy', label: 'الاقتصاد الكلي' },
    { id: 'energy', label: 'الطاقة والتعدين' },
    { id: 'real_estate', label: 'العقار والإسكان' },
    { id: 'investment', label: 'الاستثمار' },
    { id: 'labor', label: 'سوق العمل' }
];

const MOCK_DASHBOARDS: ExtendedDashboard[] = [
    {
        id: 'odb1',
        name: 'مؤشرات الاستثمار الأجنبي المباشر',
        widgets: ['w1', 'w2'],
        category: 'investment',
        views: 45200,
        lastUpdated: 'منذ ساعتين',
        isFavorite: true,
        color: 'blue',
        trend: 12,
        type: 'official',
        description: 'رصد شامل لتدفقات الاستثمار الأجنبي وتوزيعها حسب القطاعات والمناطق الإدارية.',
        keyMetrics: ['صافي الاستثمار', 'التراخيص الجديدة', 'توزيع الدول'],
        dataFreq: 'quarterly'
    },
    {
        id: 'odb2',
        name: 'لوحة الرقم القياسي لأسعار المستهلك (التضخم)',
        widgets: ['w3', 'w4'],
        category: 'economy',
        views: 32100,
        lastUpdated: 'منذ يوم',
        isFavorite: false,
        color: 'green',
        trend: 5,
        type: 'official',
        description: 'تحليل شهري لتغيرات أسعار السلع والخدمات وتأثيرها على القوة الشرائية.',
        keyMetrics: ['معدل التضخم', 'النقل', 'الأغذية والمشروبات', 'السكن'],
        dataFreq: 'monthly'
    },
    {
        id: 'odb3_mining',
        name: 'المرصد الوطني للتعدين',
        widgets: ['w1', 'w3'],
        category: 'energy',
        views: 56000,
        lastUpdated: 'مباشر',
        isFavorite: true,
        color: 'amber',
        trend: 24,
        type: 'official',
        description: 'خريطة تفاعلية للموارد المعدنية، الرخص التعدينية، وحجم الإنتاج الفعلي.',
        keyMetrics: ['الرخص النشطة', 'إنتاج الذهب', 'الاستكشاف'],
        dataFreq: 'daily'
    },
    // ... generating enriched mock data
    ...Array.from({ length: 27 }).map((_, i) => {
        const catsLines = [
            { c: 'economy', desc: 'متابعة الأداء الاقتصادي الكلي ومؤشرات النمو والناتج المحلي.', metrics: ['GDP', 'الدين العام', 'الايرادات'] },
            { c: 'energy', desc: 'إحصائيات تفصيلية لاستهلاك وتصدير الطاقة ومشاريع الطاقة المتجددة.', metrics: ['الإنتاج', 'الصادرات', 'الاستهلاك المحلي'] },
            { c: 'real_estate', desc: 'رصد دقيق لحركة السوق العقاري والصفقات وكود البناء.', metrics: ['المبيعات', 'المتوسط السعري', 'المخططات'] },
            { c: 'investment', desc: 'تحليل الفرص الاستثمارية ونمو الشركات وتسهيلات الأعمال.', metrics: ['السجلات', 'رأس المال', 'النمو'] },
            { c: 'labor', desc: 'مؤشرات التوطين ومعدلات البطالة ومتوسط الأجور في القطاع الخاص.', metrics: ['معدل البطالة', 'الرواتب', 'القوى العاملة'] }
        ];
        const item = catsLines[i % catsLines.length];
        const colors = ['blue', 'green', 'amber', 'purple', 'rose', 'indigo', 'cyan'];

        return {
            id: `dash_${i + 4}`,
            name: [
                'تقرير سوق العمل المتعمق', 'التبادل التجاري الدولي', 'أداء القطاع الصناعي', 'مشاريع سكني', 'السياحة الوافدة',
                'التجارة الإلكترونية', 'الشركات الصغيرة والمتوسطة', 'القطاع المالي والمصرفي', 'سلاسل الإمداد والخدمات اللوجستية',
                'التعليم وسوق العمل', 'الرعاية الصحية', 'التحول الرقمي الحكومي', 'منظومة النقل', 'الأمن الغذائي والزراعة',
                'قطاع الترفيه وجودة الحياة', 'أسواق المال وتداول', 'الطاقة المتجددة', 'المحتوى المحلي',
            ][i % 18] + ` ${2025}`,
            widgets: ['w1'],
            category: item.c,
            views: Math.floor(Math.random() * 50000) + 1000,
            lastUpdated: ['منذ ساعة', 'منذ يومين', 'أسبوعي', 'شهري'][i % 4],
            isFavorite: Math.random() > 0.8,
            color: colors[i % colors.length],
            trend: Math.floor(Math.random() * 30) - 5,
            type: 'official' as const,
            description: item.desc,
            keyMetrics: item.metrics,
            dataFreq: (['daily', 'monthly', 'quarterly'] as const)[i % 3]
        };
    })
];

// ============================================
// COMPONENTS
// ============================================

type ViewMode = 'grid' | 'list' | 'compact';

interface OfficialDashboardsPageProps {
    dashboards: Dashboard[];
    widgets: Widget[];
    userRole: UserRole;
}

const OfficialDashboardsPage: React.FC<OfficialDashboardsPageProps> = ({ widgets, userRole }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [favorites, setFavorites] = useState<string[]>(['odb1', 'odb3_mining']);
    const [selectedDash, setSelectedDash] = useState<ExtendedDashboard | null>(null);

    // Filter Logic
    const filteredDashboards = useMemo(() => {
        return MOCK_DASHBOARDS.filter(d => {
            const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'all' || d.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);

    const toggleFavorite = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    // --- RENDERERS ---

    /**
     * GRID VIEW DESIGN - PRO VERSION
     * تصميم يركز على المحتوى والشرح
     */
    const renderGridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDashboards.map(dash => (
                <div
                    key={dash.id}
                    onClick={() => setSelectedDash(dash)}
                    className="group relative bg-white rounded-[2rem] border border-gray-100/80 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-[380px]"
                >
                    {/* 1. Header: Visual Context & Actions */}
                    <div className={`h-36 relative p-6 flex flex-col justify-between overflow-hidden`}>
                        {/* Background Mesh/Pattern */}
                        <div className={`absolute inset-0 bg-gradient-to-br from-${dash.color}-50 via-white to-${dash.color}-50 opacity-100 group-hover:scale-105 transition-transform duration-700`}></div>
                        <div className={`absolute inset-0 bg-[radial-gradient(${dash.color}_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.15]`}></div>

                        <div className="relative z-10 flex justify-between items-start">
                            {/* Icon Box */}
                            <div className={`w-12 h-12 rounded-2xl bg-white shadow-lg shadow-${dash.color}-500/10 border border-${dash.color}-100 flex items-center justify-center text-${dash.color}-600 group-hover:rotate-6 transition-transform duration-300`}>
                                {dash.category === 'economy' && <Landmark size={22} strokeWidth={1.5} />}
                                {dash.category === 'energy' && <Zap size={22} strokeWidth={1.5} />}
                                {dash.category === 'investment' && <TrendingUp size={22} strokeWidth={1.5} />}
                                {dash.category === 'real_estate' && <Building2 size={22} strokeWidth={1.5} />}
                                {dash.category === 'labor' && <Briefcase size={22} strokeWidth={1.5} />}
                                {/* Default Icon */}
                                {!['economy', 'energy', 'investment', 'real_estate', 'labor'].includes(dash.category) && <BarChart2 size={22} strokeWidth={1.5} />}
                            </div>

                            <button
                                onClick={(e) => toggleFavorite(e, dash.id)}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 border border-transparent hover:border-gray-100 ${favorites.includes(dash.id) ? 'bg-amber-50 text-amber-500' : 'bg-white/80 backdrop-blur text-gray-400 hover:bg-white hover:text-red-500 hover:shadow-md'}`}
                            >
                                <Heart size={18} fill={favorites.includes(dash.id) ? "currentColor" : "none"} />
                            </button>
                        </div>

                        {/* Frequency Badge */}
                        <div className="relative z-10 self-end">
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-lg bg-white/80 backdrop-blur border border-${dash.color}-100 text-${dash.color}-700 shadow-sm`}>
                                {dash.dataFreq === 'daily' ? 'Live Data' : `${dash.dataFreq} Update`}
                            </span>
                        </div>
                    </div>

                    {/* 2. Body: Content Explanation */}
                    <div className="px-6 pt-2 pb-6 flex-1 flex flex-col">
                        {/* Category & Title */}
                        <div className="mb-4">
                            <span className="text-[11px] font-bold text-gray-400 mb-1 block">
                                {DASHBOARD_CATEGORIES.find(c => c.id === dash.category)?.label}
                            </span>
                            <h3 className="font-bold text-gray-900 text-xl leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                                {dash.name}
                            </h3>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-500 leading-relaxed mb-5 line-clamp-2">
                            {dash.description}
                        </p>

                        {/* What's Inside (Key Metrics) */}
                        <div className="mt-auto">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                <Layers size={10} /> بيانات اللوحة
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {dash.keyMetrics.map((metric, idx) => (
                                    <span key={idx} className="text-[11px] font-medium bg-gray-50 text-gray-600 px-2.5 py-1.5 rounded-md border border-gray-100 group-hover:border-blue-100 group-hover:text-blue-700 transition-colors">
                                        {metric}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 3. Footer: Stats & Action */}
                    <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between group-hover:bg-blue-50/30 transition-colors">
                        <div className="flex items-center gap-3 text-xs font-medium text-gray-400">
                            <span className="flex items-center gap-1 hover:text-gray-600 cursor-help" title="مشاهدات">
                                <Eye size={14} /> {(dash.views / 1000).toFixed(1)}k
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className={`flex items-center gap-1 ${dash.trend > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                {dash.trend > 0 ? '+' : ''}{dash.trend}% تفاعل
                            </span>
                        </div>

                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-blue-500/30">
                            <ArrowUpRight size={16} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    /**
     * LIST VIEW DESIGN
     */
    const renderListView = () => (
        <div className="space-y-3 bg-white rounded-3xl border border-gray-100 p-2 shadow-sm">
            {filteredDashboards.map(dash => (
                <div
                    key={dash.id}
                    onClick={() => setSelectedDash(dash)}
                    className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100"
                >
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-${dash.color}-50 flex items-center justify-center text-${dash.color}-600 shrink-0`}>
                        {dash.category === 'economy' ? <Landmark size={24} /> : <BarChart2 size={24} />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base mb-1 truncate group-hover:text-blue-600 transition-colors">
                            {dash.name}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Layers size={12} /> {DASHBOARD_CATEGORIES.find(c => c.id === dash.category)?.label}</span>
                            <span className="flex items-center gap-1 hidden sm:flex"><Info size={12} /> {dash.description.substring(0, 40)}...</span>
                        </div>
                    </div>

                    {/* Metrics Preview (New for List View) */}
                    <div className="hidden lg:flex gap-2">
                        {dash.keyMetrics.slice(0, 2).map((m, i) => (
                            <span key={i} className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-500">
                                {m}
                            </span>
                        ))}
                    </div>

                    {/* Trend & Action */}
                    <div className="text-left shrink-0 hidden sm:block">
                        <div className={`text-sm font-bold ${dash.trend > 0 ? 'text-green-600' : 'text-red-500'} flex items-center justify-end gap-1`}>
                            {dash.trend > 0 ? '+' : ''}{dash.trend}% <TrendingUp size={14} className={dash.trend < 0 ? 'rotate-180' : ''} />
                        </div>
                        <div className="text-[10px] text-gray-400">تفاعل</div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={(e) => toggleFavorite(e, dash.id)}
                            className={`p-2 rounded-lg transition-colors ${favorites.includes(dash.id) ? 'bg-amber-50 text-amber-500' : 'text-gray-300 hover:bg-gray-100 hover:text-gray-500'}`}
                        >
                            <Heart size={18} fill={favorites.includes(dash.id) ? "currentColor" : "none"} />
                        </button>
                        <button className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <ArrowUpRight size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );

    /**
     * COMPACT VIEW DESIGN
     */
    const renderCompactView = () => (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredDashboards.map(dash => (
                <div
                    key={dash.id}
                    onClick={() => setSelectedDash(dash)}
                    className="group bg-white rounded-2xl border border-gray-100 hover:border-blue-300 p-4 hover:shadow-lg transition-all cursor-pointer text-center relative"
                >
                    <button
                        onClick={(e) => toggleFavorite(e, dash.id)}
                        className={`absolute top-2 right-2 p-1.5 rounded-full ${favorites.includes(dash.id) ? 'text-amber-500' : 'text-transparent group-hover:text-gray-300 hover:bg-gray-50'}`}
                    >
                        <Star size={14} fill={favorites.includes(dash.id) ? "currentColor" : "none"} />
                    </button>

                    <div className={`w-12 h-12 mx-auto rounded-full bg-${dash.color}-50 flex items-center justify-center text-${dash.color}-600 mb-3 group-hover:scale-110 transition-transform`}>
                        {activeCategory === 'real_estate' ? <Building2 size={20} /> :
                            activeCategory === 'energy' ? <Zap size={20} /> :
                                <PieChart size={20} />}
                    </div>

                    <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
                        {dash.name}
                    </h3>

                    <p className="text-[10px] text-gray-400 mb-3">
                        {DASHBOARD_CATEGORIES.find(c => c.id === dash.category)?.label}
                    </p>

                    <div className="flex justify-center items-center gap-2">
                        <span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-100">
                            {dash.views > 1000 ? (dash.views / 1000).toFixed(1) + 'k' : dash.views}
                        </span>
                        {dash.isFavorite && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 min-h-screen">

            {/* Page Header */}
            <div className="mb-8 relative overflow-hidden bg-slate-900 text-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl ring-1 ring-white/10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -ml-32 -mb-32"></div>

                <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                        <div>
                            <h1 className="text-3xl lg:text-5xl font-black mb-4 tracking-tight">
                                اللوحات الرسمية
                            </h1>
                            <p className="text-slate-300 text-lg max-w-2xl leading-relaxed font-light">
                                المرجع الموحد للمؤشرات والبيانات. اكتشف الرؤى الاقتصادية من خلال لوحات تفاعلية تشرح نفسها.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[100px] hover:bg-white/20 transition-colors cursor-default">
                                <p className="text-2xl font-black">{MOCK_DASHBOARDS.length}</p>
                                <p className="text-xs text-slate-300 uppercase tracking-widest">لوحة</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[100px] hover:bg-white/20 transition-colors cursor-default">
                                <p className="text-2xl font-black">1.2M</p>
                                <p className="text-xs text-slate-300 uppercase tracking-widest">مؤشر</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls Toolbar */}
            <div className="sticky top-[70px] z-30 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-2 mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between transition-all">

                {/* Categories */}
                <div className="flex items-center gap-1 overflow-x-auto w-full lg:w-auto p-1 no-scrollbar">
                    {DASHBOARD_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat.id
                                    ? 'bg-slate-900 text-white shadow-md scale-105'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Search & View Toggle */}
                <div className="flex items-center gap-2 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-64">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="بحث في المؤشرات واللوحات..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:bg-white"
                        />
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-xl shrink-0 border border-gray-200">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            title="شبكة تفاعلية"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            title="قائمة بيانات"
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('compact')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'compact' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            title="عرض مكثف"
                        >
                            <Layers size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="animate-fadeIn min-h-[500px]">
                {filteredDashboards.length > 0 ? (
                    <>
                        {viewMode === 'grid' && renderGridView()}
                        {viewMode === 'list' && renderListView()}
                        {viewMode === 'compact' && renderCompactView()}
                    </>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                        <div className="inline-block p-6 bg-white rounded-full shadow-sm mb-4">
                            <Search size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد نتائج مطابقة</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">لم نعثر على لوحات تطابق بحثك. جرب البحث عن "الناتج المحلي" أو "التضخم".</p>
                    </div>
                )}
            </div>

            {/* Dashboard Modal (Placeholder - Visual Enhancement) */}
            {selectedDash && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn flex flex-col md:flex-row">

                        {/* Sidebar Info */}
                        <div className="w-full md:w-80 bg-slate-50 p-8 border-l border-gray-100 flex flex-col order-2 md:order-1">
                            <div className={`w-14 h-14 rounded-2xl bg-${selectedDash.color}-100 flex items-center justify-center text-${selectedDash.color}-600 mb-6`}>
                                <BarChart2 size={28} />
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{selectedDash.name}</h2>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6">{selectedDash.description}</p>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">التصنيف</p>
                                    <span className="inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-bold">
                                        {DASHBOARD_CATEGORIES.find(c => c.id === selectedDash.category)?.label}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">تكرار البيانات</p>
                                    <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                                        {selectedDash.dataFreq === 'daily' ? 'يومي' : 'شهري'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-gray-200">
                                <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 mb-3 flex items-center justify-center gap-2">
                                    فتح اللوحة الكاملة <ArrowUpRight size={18} />
                                </button>
                                <button onClick={() => setSelectedDash(null)} className="w-full py-3 text-gray-500 hover:text-gray-800 font-bold">
                                    إلغاء
                                </button>
                            </div>
                        </div>

                        {/* Main Content Preview */}
                        <div className="flex-1 p-8 bg-white relative order-1 md:order-2 flex flex-col items-center justify-center">
                            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.4]"></div>

                            <div className="relative text-center max-w-lg">
                                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                    <PieChart size={40} className="text-blue-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">معاينة تفاعلية</h3>
                                <p className="text-gray-500 mb-8">
                                    تحتوي هذه اللوحة على {selectedDash.keyMetrics.length} مؤشرات رئيسية، بما في ذلك
                                    <span className="font-bold text-gray-800 mx-1">
                                        {selectedDash.keyMetrics.join('، ')}
                                    </span>.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-32 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                                        <span className="text-xs text-gray-400 font-bold">CHART 1</span>
                                    </div>
                                    <div className="h-32 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                                        <span className="text-xs text-gray-400 font-bold">CHART 2</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default OfficialDashboardsPage;
