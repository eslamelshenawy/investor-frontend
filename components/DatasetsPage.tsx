/**
 * Datasets Page - صفحة مجموعات البيانات
 * Similar to Saudi Open Data Portal (open.data.gov.sa)
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

const ITEMS_PER_PAGE = 12;

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
    // State
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [categories, setCategories] = useState<CategoryCount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // View
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Stats
    const [totalDatasets, setTotalDatasets] = useState(0);

    // Saudi Open Data Categories - الأقسام من البوابة الوطنية
    const SAUDI_CATEGORIES: CategoryCount[] = [
        { name: 'الاقتصاد والأعمال', count: 2850 },
        { name: 'الصحة', count: 1920 },
        { name: 'التعليم والتدريب', count: 1650 },
        { name: 'البيئة والطاقة', count: 1420 },
        { name: 'السكان والإسكان', count: 1280 },
        { name: 'النقل والمواصلات', count: 980 },
        { name: 'الزراعة والمياه', count: 890 },
        { name: 'السياحة والثقافة', count: 820 },
        { name: 'العمل والتوظيف', count: 760 },
        { name: 'الحكومة والإدارة', count: 720 },
        { name: 'التجارة والصناعة', count: 680 },
        { name: 'المالية والضرائب', count: 640 },
        { name: 'العدل والقانون', count: 580 },
        { name: 'الأمن والدفاع', count: 450 },
        { name: 'التقنية والاتصالات', count: 420 },
        { name: 'الرياضة والشباب', count: 380 },
        { name: 'الخدمات الاجتماعية', count: 350 },
        { name: 'أخرى', count: 710 },
    ];

    // Sample Datasets - نماذج بيانات للعرض عند فشل الـ API
    const SAMPLE_DATASETS: Dataset[] = [
        {
            id: 'pop-stats-2024',
            externalId: 'pop-stats-2024',
            name: 'Population Statistics 2024',
            nameAr: 'إحصائيات السكان 2024',
            description: 'Saudi Arabia population statistics by region and age group',
            descriptionAr: 'إحصائيات السكان في المملكة العربية السعودية حسب المنطقة والفئة العمرية',
            category: 'السكان والإسكان',
            source: 'الهيئة العامة للإحصاء',
            sourceUrl: null,
            recordCount: 45000,
            columns: ['المنطقة', 'السنة', 'الذكور', 'الإناث', 'الإجمالي'],
            lastSyncAt: '2024-12-15T10:30:00Z',
            syncStatus: 'SUCCESS',
            updatedAt: '2024-12-15T10:30:00Z',
        },
        {
            id: 'gdp-quarterly-2024',
            externalId: 'gdp-quarterly-2024',
            name: 'GDP Quarterly Report 2024',
            nameAr: 'تقرير الناتج المحلي الربع سنوي 2024',
            description: 'Quarterly GDP data by economic sector',
            descriptionAr: 'بيانات الناتج المحلي الإجمالي ربع السنوية حسب القطاع الاقتصادي',
            category: 'الاقتصاد والأعمال',
            source: 'وزارة المالية',
            sourceUrl: null,
            recordCount: 1200,
            columns: ['الربع', 'القطاع', 'القيمة', 'نسبة النمو'],
            lastSyncAt: '2024-12-20T08:00:00Z',
            syncStatus: 'SUCCESS',
            updatedAt: '2024-12-20T08:00:00Z',
        },
        {
            id: 'health-facilities-2024',
            externalId: 'health-facilities-2024',
            name: 'Healthcare Facilities Directory',
            nameAr: 'دليل المنشآت الصحية',
            description: 'Complete directory of hospitals and health centers',
            descriptionAr: 'دليل شامل للمستشفيات والمراكز الصحية في المملكة',
            category: 'الصحة',
            source: 'وزارة الصحة',
            sourceUrl: null,
            recordCount: 3500,
            columns: ['اسم المنشأة', 'المنطقة', 'المدينة', 'النوع', 'السعة'],
            lastSyncAt: '2024-11-30T14:00:00Z',
            syncStatus: 'SUCCESS',
            updatedAt: '2024-11-30T14:00:00Z',
        },
        {
            id: 'education-schools-2024',
            externalId: 'education-schools-2024',
            name: 'Schools Statistics 2024',
            nameAr: 'إحصائيات المدارس 2024',
            description: 'Statistics of schools by region and education level',
            descriptionAr: 'إحصائيات المدارس حسب المنطقة والمرحلة التعليمية',
            category: 'التعليم والتدريب',
            source: 'وزارة التعليم',
            sourceUrl: null,
            recordCount: 28000,
            columns: ['المنطقة', 'المرحلة', 'عدد المدارس', 'عدد الطلاب', 'عدد المعلمين'],
            lastSyncAt: '2024-12-01T09:00:00Z',
            syncStatus: 'SUCCESS',
            updatedAt: '2024-12-01T09:00:00Z',
        },
        {
            id: 'employment-stats-2024',
            externalId: 'employment-stats-2024',
            name: 'Employment Statistics Q4 2024',
            nameAr: 'إحصائيات التوظيف الربع الرابع 2024',
            description: 'Labor market and employment data',
            descriptionAr: 'بيانات سوق العمل والتوظيف في المملكة',
            category: 'العمل والتوظيف',
            source: 'وزارة الموارد البشرية',
            sourceUrl: null,
            recordCount: 15000,
            columns: ['القطاع', 'الجنسية', 'الجنس', 'عدد العاملين', 'متوسط الراتب'],
            lastSyncAt: '2024-12-18T11:00:00Z',
            syncStatus: 'SUCCESS',
            updatedAt: '2024-12-18T11:00:00Z',
        },
        {
            id: 'tourism-visitors-2024',
            externalId: 'tourism-visitors-2024',
            name: 'Tourism Visitors Statistics',
            nameAr: 'إحصائيات زوار السياحة',
            description: 'Monthly tourism and visitor statistics',
            descriptionAr: 'إحصائيات شهرية للسياحة وأعداد الزوار',
            category: 'السياحة والثقافة',
            source: 'وزارة السياحة',
            sourceUrl: null,
            recordCount: 8500,
            columns: ['الشهر', 'الجنسية', 'نوع التأشيرة', 'عدد الزوار', 'مدة الإقامة'],
            lastSyncAt: '2024-12-10T16:00:00Z',
            syncStatus: 'SUCCESS',
            updatedAt: '2024-12-10T16:00:00Z',
        },
        {
            id: 'transport-traffic-2024',
            externalId: 'transport-traffic-2024',
            name: 'Traffic Flow Statistics',
            nameAr: 'إحصائيات حركة المرور',
            description: 'Daily traffic flow data on major highways',
            descriptionAr: 'بيانات حركة المرور اليومية على الطرق الرئيسية',
            category: 'النقل والمواصلات',
            source: 'وزارة النقل',
            sourceUrl: null,
            recordCount: 120000,
            columns: ['الطريق', 'التاريخ', 'الساعة', 'عدد المركبات', 'السرعة المتوسطة'],
            lastSyncAt: '2024-12-22T07:00:00Z',
            syncStatus: 'SUCCESS',
            updatedAt: '2024-12-22T07:00:00Z',
        },
        {
            id: 'agriculture-production-2024',
            externalId: 'agriculture-production-2024',
            name: 'Agricultural Production 2024',
            nameAr: 'الإنتاج الزراعي 2024',
            description: 'Annual agricultural production by crop type',
            descriptionAr: 'الإنتاج الزراعي السنوي حسب نوع المحصول',
            category: 'الزراعة والمياه',
            source: 'وزارة البيئة والمياه والزراعة',
            sourceUrl: null,
            recordCount: 5600,
            columns: ['المنطقة', 'المحصول', 'المساحة', 'الإنتاج', 'السنة'],
            lastSyncAt: '2024-11-25T12:00:00Z',
            syncStatus: 'SUCCESS',
            updatedAt: '2024-11-25T12:00:00Z',
        },
        {
            id: 'energy-consumption-2024',
            externalId: 'energy-consumption-2024',
            name: 'Energy Consumption Report',
            nameAr: 'تقرير استهلاك الطاقة',
            description: 'Monthly energy consumption by sector',
            descriptionAr: 'استهلاك الطاقة الشهري حسب القطاع',
            category: 'البيئة والطاقة',
            source: 'وزارة الطاقة',
            sourceUrl: null,
            recordCount: 9800,
            columns: ['الشهر', 'القطاع', 'نوع الطاقة', 'الاستهلاك', 'التكلفة'],
            lastSyncAt: '2024-12-05T10:00:00Z',
            syncStatus: 'SUCCESS',
            updatedAt: '2024-12-05T10:00:00Z',
        },
        {
            id: 'business-licenses-2024',
            externalId: 'business-licenses-2024',
            name: 'Commercial Licenses Registry',
            nameAr: 'سجل الرخص التجارية',
            description: 'Active commercial licenses by activity type',
            descriptionAr: 'الرخص التجارية النشطة حسب نوع النشاط',
            category: 'التجارة والصناعة',
            source: 'وزارة التجارة',
            sourceUrl: null,
            recordCount: 250000,
            columns: ['رقم الرخصة', 'النشاط', 'المنطقة', 'تاريخ الإصدار', 'الحالة'],
            lastSyncAt: '2024-12-19T15:00:00Z',
            syncStatus: 'SUCCESS',
            updatedAt: '2024-12-19T15:00:00Z',
        },
        {
            id: 'gov-budget-2024',
            externalId: 'gov-budget-2024',
            name: 'Government Budget 2024',
            nameAr: 'الميزانية الحكومية 2024',
            description: 'Government budget allocation by ministry',
            descriptionAr: 'توزيع الميزانية الحكومية حسب الوزارة',
            category: 'المالية والضرائب',
            source: 'وزارة المالية',
            sourceUrl: null,
            recordCount: 850,
            columns: ['الوزارة', 'البند', 'المخصص', 'المصروف', 'النسبة'],
            lastSyncAt: '2024-12-01T08:00:00Z',
            syncStatus: 'SUCCESS',
            updatedAt: '2024-12-01T08:00:00Z',
        },
        {
            id: 'tech-startups-2024',
            externalId: 'tech-startups-2024',
            name: 'Tech Startups Directory',
            nameAr: 'دليل الشركات الناشئة التقنية',
            description: 'Registered tech startups and their funding',
            descriptionAr: 'الشركات الناشئة التقنية المسجلة وتمويلها',
            category: 'التقنية والاتصالات',
            source: 'هيئة الاتصالات',
            sourceUrl: null,
            recordCount: 3200,
            columns: ['اسم الشركة', 'المجال', 'التمويل', 'عدد الموظفين', 'سنة التأسيس'],
            lastSyncAt: '2024-12-12T13:00:00Z',
            syncStatus: 'SUCCESS',
            updatedAt: '2024-12-12T13:00:00Z',
        },
    ];

    // Fetch datasets - Frontend Fetch فقط
    const fetchDatasets = async () => {
        setLoading(true);
        setError(null);

        // Set default categories from Saudi Open Data
        setCategories(SAUDI_CATEGORIES);
        setTotalDatasets(15500);

        try {
            console.log('🌐 Frontend Fetch: جلب قائمة الـ Datasets...');

            const result = await fetchDatasetsList({ limit: 500, forceRefresh: false });

            if (result.datasets.length > 0) {
                // Convert to Dataset format
                const data: Dataset[] = result.datasets.map((d: DatasetInfo) => ({
                    id: d.id,
                    externalId: d.id,
                    name: d.titleEn || d.titleAr,
                    nameAr: d.titleAr,
                    description: d.descriptionEn || '',
                    descriptionAr: d.descriptionAr || '',
                    category: d.category || 'أخرى',
                    source: 'open.data.gov.sa',
                    sourceUrl: `https://open.data.gov.sa/ar/datasets/view/${d.id}`,
                    recordCount: d.recordCount || 0,
                    columns: [],
                    lastSyncAt: d.updatedAt || '',
                    syncStatus: 'SUCCESS',
                    updatedAt: d.updatedAt || new Date().toISOString(),
                }));

                setDatasets(data);
                setTotalDatasets(data.length > 0 ? Math.max(data.length, 15500) : 15500);

                // Calculate categories from fetched data
                const categoryMap = new Map<string, number>();
                data.forEach(d => {
                    const cat = d.category || 'أخرى';
                    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
                });

                if (categoryMap.size > 0) {
                    const cats: CategoryCount[] = Array.from(categoryMap.entries())
                        .map(([name, count]) => ({ name, count }))
                        .sort((a, b) => b.count - a.count);
                    setCategories(cats);
                }

                console.log(`✅ Frontend Fetch: تم جلب ${data.length} dataset (${result.source})`);
            } else {
                console.log('⚠️ Frontend Fetch returned 0 datasets');
                setError('لم يتم العثور على بيانات - جرب إعادة المحاولة');
                setDatasets([]);
            }
        } catch (err: any) {
            console.error('Frontend Fetch error:', err);
            setError(`فشل في جلب البيانات: ${err.message || 'خطأ غير معروف'}`);
            setDatasets([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDatasets();
    }, []);

    // Filtered datasets
    const filteredDatasets = useMemo(() => {
        let result = datasets;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(d =>
                d.nameAr?.toLowerCase().includes(query) ||
                d.name?.toLowerCase().includes(query) ||
                d.descriptionAr?.toLowerCase().includes(query) ||
                d.description?.toLowerCase().includes(query) ||
                d.category?.toLowerCase().includes(query)
            );
        }

        // Category filter
        if (selectedCategory) {
            result = result.filter(d => d.category === selectedCategory);
        }

        // Status filter
        if (selectedStatus) {
            result = result.filter(d => d.syncStatus === selectedStatus);
        }

        return result;
    }, [datasets, searchQuery, selectedCategory, selectedStatus]);

    // Paginated datasets
    const paginatedDatasets = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredDatasets.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredDatasets, currentPage]);

    const totalPages = Math.ceil(filteredDatasets.length / ITEMS_PER_PAGE);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory, selectedStatus]);

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

    // Clear filters
    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory(null);
        setSelectedStatus(null);
    };

    const hasFilters = searchQuery || selectedCategory || selectedStatus;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">جاري تحميل مجموعات البيانات...</p>
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
                            <p className="text-3xl font-black mt-1">{totalDatasets.toLocaleString('ar-SA')}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <p className="text-blue-100 text-sm">التصنيفات</p>
                            <p className="text-3xl font-black mt-1">{categories.length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <p className="text-blue-100 text-sm">المحملة</p>
                            <p className="text-3xl font-black mt-1">{datasets.length}</p>
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
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100 bg-gray-50">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Filter size={18} className="text-blue-600" />
                                    التصنيفات
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
                                        {totalDatasets}
                                    </span>
                                </button>

                                {categories.map(cat => {
                                    const Icon = getCategoryIcon(cat.name);
                                    return (
                                        <button
                                            key={cat.name}
                                            onClick={() => setSelectedCategory(cat.name)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all mt-1 ${
                                                selectedCategory === cat.name
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                    : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Icon size={16} />
                                                <span className="font-medium text-sm">{cat.name}</span>
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                selectedCategory === cat.name
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

                        {/* Status Filter */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-4">
                            <div className="p-4 border-b border-gray-100 bg-gray-50">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-green-600" />
                                    حالة المزامنة
                                </h3>
                            </div>
                            <div className="p-2">
                                {['SUCCESS', 'PENDING', 'FAILED'].map(status => {
                                    const count = datasets.filter(d => d.syncStatus === status).length;
                                    const statusConfig = {
                                        'SUCCESS': { label: 'متزامن', color: 'green', icon: CheckCircle2 },
                                        'PENDING': { label: 'قيد الانتظار', color: 'yellow', icon: Clock },
                                        'FAILED': { label: 'فشل', color: 'red', icon: AlertCircle }
                                    }[status]!;

                                    return (
                                        <button
                                            key={status}
                                            onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all mt-1 ${
                                                selectedStatus === status
                                                    ? `bg-${statusConfig.color}-50 text-${statusConfig.color}-700 border border-${statusConfig.color}-200`
                                                    : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <statusConfig.icon size={16} className={`text-${statusConfig.color}-600`} />
                                                <span className="font-medium text-sm">{statusConfig.label}</span>
                                            </span>
                                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                                {count}
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
                                    onClick={fetchDatasets}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                                    title="تحديث"
                                >
                                    <RefreshCw size={18} />
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
                        {paginatedDatasets.length === 0 && !loading ? (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Database size={40} className="text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {hasFilters ? 'لا توجد نتائج للبحث' : 'جاري تحميل البيانات...'}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {hasFilters
                                        ? 'جرب تغيير معايير البحث أو إزالة الفلاتر'
                                        : 'يتم جلب البيانات من المصدر...'}
                                </p>
                                <button
                                    onClick={() => {
                                        clearFilters();
                                        fetchDatasets();
                                    }}
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                                >
                                    <RefreshCw size={18} />
                                    {hasFilters ? 'إزالة الفلاتر وإعادة المحاولة' : 'إعادة المحاولة'}
                                </button>
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={20} />
                                </button>

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let page;
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
                                            className={`w-10 h-10 rounded-lg font-medium transition-all ${
                                                currentPage === page
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={20} />
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
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        dataset.syncStatus === 'SUCCESS'
                            ? 'bg-green-100 text-green-700'
                            : dataset.syncStatus === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                    }`}>
                        {dataset.syncStatus === 'SUCCESS' ? 'متزامن' : dataset.syncStatus === 'PENDING' ? 'قيد الانتظار' : 'فشل'}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
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
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {dataset.nameAr || dataset.name}
                    </h3>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                        dataset.syncStatus === 'SUCCESS'
                            ? 'bg-green-100 text-green-700'
                            : dataset.syncStatus === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                    }`}>
                        {dataset.syncStatus === 'SUCCESS' ? 'متزامن' : dataset.syncStatus === 'PENDING' ? 'قيد الانتظار' : 'فشل'}
                    </span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {dataset.descriptionAr || dataset.description || 'لا يوجد وصف'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded">{dataset.category}</span>
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
