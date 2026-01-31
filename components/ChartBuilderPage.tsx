/**
 * ======================================
 * UI CHART BUILDER - باني الرسوم البيانية
 * ======================================
 *
 * واجهة لإنشاء وتخصيص الرسوم البيانية
 * Drag & Drop chart building interface
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
    BarChart2,
    LineChart,
    PieChart,
    AreaChart,
    ScatterChart,
    TrendingUp,
    Download,
    Save,
    Share2,
    Settings,
    Palette,
    Database,
    ArrowRight,
    Plus,
    X,
    Check,
    ChevronDown,
    Layers,
    Eye,
    RefreshCw,
    FileImage,
    FileText,
    Table,
    Loader2,
    AlertTriangle,
    Zap,
    Cloud,
    Target,
    Activity,
    GitBranch,
    Gauge,
    BarChart3,
    TrendingDown,
    Circle,
    Square,
    Triangle,
    Hexagon,
    Link,
    Copy,
    CheckCircle2
} from 'lucide-react';
// Frontend Fetch فقط - بدون Backend API
import { fetchDatasetData as fetchDirectData, fetchDatasetsList, fetchAllDatasets, DatasetInfo } from '../src/services/dataFetcher';
import {
    BarChart,
    Bar,
    LineChart as ReLineChart,
    Line,
    PieChart as RePieChart,
    Pie,
    AreaChart as ReAreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
    ScatterChart as ReScatterChart,
    Scatter,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    RadialBarChart,
    RadialBar,
    ComposedChart,
    Treemap,
    FunnelChart,
    Funnel,
    LabelList
} from 'recharts';

// ============================================
// TYPES
// ============================================

type ChartType =
    | 'bar' | 'line' | 'pie' | 'area' | 'stacked'
    | 'horizontal-bar' | 'scatter' | 'radar' | 'radial'
    | 'donut' | 'composed' | 'treemap' | 'funnel'
    | 'waterfall' | 'gauge' | 'bullet' | 'sparkline'
    | 'grouped-bar' | 'stacked-area' | 'step-line'
    | 'polar' | 'bubble' | 'histogram' | 'box-plot'
    | 'heatmap';

interface ChartConfig {
    id: string;
    type: ChartType;
    title: string;
    titleAr: string;
    dataSource: string;
    xAxis: string;
    yAxis: string;
    colors: string[];
    showLegend: boolean;
    showGrid: boolean;
}

interface DataSource {
    id: string;
    name: string;
    nameAr: string;
    category: string;
    fields: string[];
    sampleData: Record<string, unknown>[];
    recordCount?: number;
}

const CHART_TYPES = [
    // Basic Charts
    { id: 'bar', icon: BarChart2, label: 'أعمدة', labelEn: 'Bar Chart', category: 'basic' },
    { id: 'horizontal-bar', icon: BarChart3, label: 'أعمدة أفقية', labelEn: 'Horizontal Bar', category: 'basic' },
    { id: 'line', icon: LineChart, label: 'خطي', labelEn: 'Line Chart', category: 'basic' },
    { id: 'area', icon: AreaChart, label: 'مساحة', labelEn: 'Area Chart', category: 'basic' },
    { id: 'pie', icon: PieChart, label: 'دائري', labelEn: 'Pie Chart', category: 'basic' },
    { id: 'donut', icon: Circle, label: 'حلقي', labelEn: 'Donut Chart', category: 'basic' },

    // Advanced Charts
    { id: 'stacked', icon: Layers, label: 'متراكم', labelEn: 'Stacked Bar', category: 'advanced' },
    { id: 'grouped-bar', icon: BarChart2, label: 'مجمع', labelEn: 'Grouped Bar', category: 'advanced' },
    { id: 'stacked-area', icon: AreaChart, label: 'مساحة متراكمة', labelEn: 'Stacked Area', category: 'advanced' },
    { id: 'composed', icon: Activity, label: 'مركب', labelEn: 'Composed Chart', category: 'advanced' },
    { id: 'step-line', icon: TrendingUp, label: 'خطي متدرج', labelEn: 'Step Line', category: 'advanced' },

    // Scientific Charts
    { id: 'scatter', icon: ScatterChart, label: 'نقطي', labelEn: 'Scatter Plot', category: 'scientific' },
    { id: 'bubble', icon: Circle, label: 'فقاعي', labelEn: 'Bubble Chart', category: 'scientific' },
    { id: 'radar', icon: Target, label: 'رادار', labelEn: 'Radar Chart', category: 'scientific' },
    { id: 'polar', icon: Target, label: 'قطبي', labelEn: 'Polar Chart', category: 'scientific' },
    { id: 'heatmap', icon: Square, label: 'خريطة حرارية', labelEn: 'Heatmap', category: 'scientific' },

    // Business Charts
    { id: 'funnel', icon: Triangle, label: 'قمع', labelEn: 'Funnel Chart', category: 'business' },
    { id: 'treemap', icon: Hexagon, label: 'خريطة شجرية', labelEn: 'Treemap', category: 'business' },
    { id: 'waterfall', icon: TrendingDown, label: 'شلال', labelEn: 'Waterfall', category: 'business' },
    { id: 'gauge', icon: Gauge, label: 'مقياس', labelEn: 'Gauge', category: 'business' },
    { id: 'radial', icon: Target, label: 'شعاعي', labelEn: 'Radial Bar', category: 'business' },

    // Mini Charts
    { id: 'sparkline', icon: Activity, label: 'مصغر', labelEn: 'Sparkline', category: 'mini' },
    { id: 'bullet', icon: TrendingUp, label: 'رصاصة', labelEn: 'Bullet Chart', category: 'mini' },
    { id: 'histogram', icon: BarChart2, label: 'تكراري', labelEn: 'Histogram', category: 'mini' },
];

const CHART_CATEGORIES = [
    { id: 'basic', label: 'أساسية', labelEn: 'Basic' },
    { id: 'advanced', label: 'متقدمة', labelEn: 'Advanced' },
    { id: 'scientific', label: 'علمية', labelEn: 'Scientific' },
    { id: 'business', label: 'أعمال', labelEn: 'Business' },
    { id: 'mini', label: 'مصغرة', labelEn: 'Mini' },
];

const COLOR_PALETTES = [
    { id: 'blue', colors: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'] },
    { id: 'green', colors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'] },
    { id: 'purple', colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'] },
    { id: 'amber', colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'] },
    { id: 'rose', colors: ['#F43F5E', '#FB7185', '#FDA4AF', '#FECDD3', '#FFF1F2'] },
];

// ============================================
// COMPONENTS
// ============================================

const ChartBuilderPage: React.FC = () => {
    // State
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [dataSources, setDataSources] = useState<DataSource[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
    const [selectedChartType, setSelectedChartType] = useState<ChartType>('bar');
    const [xAxis, setXAxis] = useState<string>('');
    const [yAxis, setYAxis] = useState<string>('');
    const [chartTitle, setChartTitle] = useState('');
    const [selectedPalette, setSelectedPalette] = useState(COLOR_PALETTES[0]);
    const [showLegend, setShowLegend] = useState(true);
    const [showGrid, setShowGrid] = useState(true);
    const [savedCharts, setSavedCharts] = useState<ChartConfig[]>([]);
    const [dataSource, setDataSource] = useState<'api' | 'cache' | null>(null);
    const [chartCategory, setChartCategory] = useState<string>('all');
    const [exporting, setExporting] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [embedCode, setEmbedCode] = useState('');
    const [copied, setCopied] = useState(false);
    const chartRef = React.useRef<HTMLDivElement>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalLoaded, setTotalLoaded] = useState(0);
    const [loadingAll, setLoadingAll] = useState(false);
    const listContainerRef = React.useRef<HTMLDivElement>(null);
    const PAGE_SIZE = 100; // جلب 100 dataset في كل صفحة

    // Fetch datasets with pagination - Frontend Fetch من البوابة الوطنية
    const fetchDatasetsPage = async (page: number, append: boolean = false) => {
        if (page === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }
        setError(null);

        try {
            console.log(`🌐 Frontend Fetch: جلب الصفحة ${page} من البوابة الوطنية...`);

            const result = await fetchDatasetsList({
                page,
                limit: PAGE_SIZE,
                forceRefresh: page === 1
            });

            if (result.datasets && result.datasets.length > 0) {
                const newSources: DataSource[] = result.datasets
                    .filter((d: DatasetInfo) => d.id && (d.titleAr || d.titleEn))
                    .map((d: DatasetInfo) => ({
                        id: d.id,
                        name: d.titleEn || d.titleAr || 'بدون اسم',
                        nameAr: d.titleAr || d.titleEn || 'بدون اسم',
                        category: d.category || 'أخرى',
                        fields: [],
                        sampleData: [],
                        recordCount: d.recordCount,
                    }));

                if (append) {
                    setDataSources(prev => {
                        // Filter duplicates
                        const existingIds = new Set(prev.map(d => d.id));
                        const uniqueNew = newSources.filter(d => !existingIds.has(d.id));
                        return [...prev, ...uniqueNew];
                    });
                } else {
                    setDataSources(newSources);
                }

                setTotalLoaded(prev => append ? prev + newSources.length : newSources.length);
                setHasMore(result.hasMore && newSources.length === PAGE_SIZE);
                setCurrentPage(page);

                console.log(`✅ تم جلب ${newSources.length} dataset - المجموع: ${append ? totalLoaded + newSources.length : newSources.length}`);
            } else {
                if (page === 1) {
                    setError('لا توجد مجموعات بيانات متاحة');
                }
                setHasMore(false);
            }
        } catch (err) {
            console.error('Error fetching datasets:', err);
            if (page === 1) {
                setError('تعذر الاتصال بالبوابة الوطنية للبيانات المفتوحة');
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchDatasetsPage(1);
    }, []);

    // Load more function
    const loadMoreDatasets = () => {
        if (!loadingMore && hasMore) {
            fetchDatasetsPage(currentPage + 1, true);
        }
    };

    // Infinite scroll handler
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // Load more when scrolled to bottom (with 100px threshold)
        if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !loadingMore) {
            loadMoreDatasets();
        }
    };

    // Load ALL datasets at once
    const loadAllDatasetsHandler = async () => {
        setLoadingAll(true);
        setError(null);
        try {
            console.log('🚀 جاري تحميل جميع الـ Datasets...');

            const allDatasets = await fetchAllDatasets((loaded) => {
                setTotalLoaded(loaded);
            });

            if (allDatasets.length > 0) {
                const sources: DataSource[] = allDatasets
                    .filter((d: DatasetInfo) => d.id && (d.titleAr || d.titleEn))
                    .map((d: DatasetInfo) => ({
                        id: d.id,
                        name: d.titleEn || d.titleAr || 'بدون اسم',
                        nameAr: d.titleAr || d.titleEn || 'بدون اسم',
                        category: d.category || 'أخرى',
                        fields: [],
                        sampleData: [],
                        recordCount: d.recordCount,
                    }));

                setDataSources(sources);
                setHasMore(false);
                console.log(`✅ تم تحميل ${sources.length} dataset`);
            }
        } catch (err) {
            console.error('Error loading all datasets:', err);
            setError('تعذر تحميل جميع البيانات');
        } finally {
            setLoadingAll(false);
        }
    };

    // Fetch dataset data on-demand when selected (Frontend Fetch فقط - بدون Backend API)
    const fetchDatasetData = async (datasetId: string) => {
        setLoadingData(true);
        setDataSource(null);
        setError(null);
        try {
            // Frontend Fetch فقط - جلب مباشر من المصدر (بدون Backend)
            console.log(`🌐 Frontend Fetch: جلب البيانات مباشرة لـ ${datasetId}`);
            const result = await fetchDirectData(datasetId, { limit: 100 });

            if (result && result.records.length > 0) {
                const columns = result.columns;
                const preview = result.records as Record<string, unknown>[];

                setSelectedDataSource(prev => prev ? {
                    ...prev,
                    fields: columns,
                    sampleData: preview,
                } : null);
                setXAxis(columns[0]);
                setYAxis(columns[1] || columns[0]);
                setDataSource(result.source === 'cache' ? 'cache' : 'api');
                setStep(2);
                console.log(`✅ Frontend Fetch: تم جلب ${result.records.length} سجل (${result.source})`);
            } else {
                // No backend fallback - show error directly
                console.log('⚠️ Frontend Fetch: لا توجد بيانات متاحة');
                setError('لا توجد بيانات متاحة لهذا المصدر. تأكد من وجود ملف CSV.');
            }
        } catch (err) {
            console.error('Error fetching dataset data:', err);
            setError('تعذر جلب البيانات من المصدر مباشرة');
        } finally {
            setLoadingData(false);
        }
    };


    // Get current data
    const chartData = useMemo(() => {
        if (!selectedDataSource) return [];
        return selectedDataSource.sampleData;
    }, [selectedDataSource]);

    // Render Chart Preview
    const renderChart = () => {
        if (loadingData) {
            return (
                <div className="h-64 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                        <Loader2 size={48} className="mx-auto mb-3 animate-spin text-indigo-500" />
                        <p className="text-indigo-600 font-medium">جاري جلب البيانات من المصدر...</p>
                        <p className="text-xs text-gray-400 mt-1">On-Demand Data Loading</p>
                    </div>
                </div>
            );
        }

        if (!selectedDataSource || !xAxis || !yAxis || selectedDataSource.sampleData.length === 0) {
            return (
                <div className="h-64 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                        <BarChart2 size={48} className="mx-auto mb-3 opacity-30" />
                        <p>اختر مصدر البيانات والمحاور لعرض الرسم</p>
                    </div>
                </div>
            );
        }

        const colors = selectedPalette.colors;
        const chartHeight = 300;

        // Get numeric fields for multi-series charts
        const numericFields = selectedDataSource.fields.filter(f => {
            const sample = chartData[0]?.[f];
            return typeof sample === 'number';
        });

        const renderChartByType = () => {
            switch (selectedChartType) {
                // Basic Charts
                case 'bar':
                    return (
                        <BarChart data={chartData}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
                            <XAxis dataKey={xAxis} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            {showLegend && <Legend />}
                            <Bar dataKey={yAxis} fill={colors[0]} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    );

                case 'horizontal-bar':
                    return (
                        <BarChart data={chartData} layout="vertical">
                            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
                            <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <YAxis dataKey={xAxis} type="category" tick={{ fill: '#6B7280', fontSize: 12 }} width={100} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            {showLegend && <Legend />}
                            <Bar dataKey={yAxis} fill={colors[0]} radius={[0, 4, 4, 0]} />
                        </BarChart>
                    );

                case 'line':
                    return (
                        <ReLineChart data={chartData}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
                            <XAxis dataKey={xAxis} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            {showLegend && <Legend />}
                            <Line type="monotone" dataKey={yAxis} stroke={colors[0]} strokeWidth={3} dot={{ fill: colors[0], strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </ReLineChart>
                    );

                case 'step-line':
                    return (
                        <ReLineChart data={chartData}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
                            <XAxis dataKey={xAxis} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            {showLegend && <Legend />}
                            <Line type="stepAfter" dataKey={yAxis} stroke={colors[0]} strokeWidth={3} dot={{ fill: colors[0] }} />
                        </ReLineChart>
                    );

                case 'area':
                    return (
                        <ReAreaChart data={chartData}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
                            <XAxis dataKey={xAxis} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            {showLegend && <Legend />}
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={colors[0]} stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey={yAxis} stroke={colors[0]} fill="url(#colorGradient)" strokeWidth={2} />
                        </ReAreaChart>
                    );

                case 'stacked-area':
                    return (
                        <ReAreaChart data={chartData}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
                            <XAxis dataKey={xAxis} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            {showLegend && <Legend />}
                            {numericFields.slice(0, 3).map((field, idx) => (
                                <Area key={field} type="monotone" dataKey={field} stackId="1" stroke={colors[idx]} fill={colors[idx]} fillOpacity={0.6} />
                            ))}
                        </ReAreaChart>
                    );

                case 'pie':
                    return (
                        <RePieChart>
                            <Pie data={chartData} dataKey={yAxis} nameKey={xAxis} cx="50%" cy="50%" outerRadius={100} label>
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            {showLegend && <Legend />}
                        </RePieChart>
                    );

                case 'donut':
                    return (
                        <RePieChart>
                            <Pie data={chartData} dataKey={yAxis} nameKey={xAxis} cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            {showLegend && <Legend />}
                        </RePieChart>
                    );

                // Advanced Charts
                case 'stacked':
                case 'grouped-bar':
                    return (
                        <BarChart data={chartData}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
                            <XAxis dataKey={xAxis} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            {showLegend && <Legend />}
                            {numericFields.slice(0, 3).map((field, idx) => (
                                <Bar key={field} dataKey={field} stackId={selectedChartType === 'stacked' ? 'a' : undefined} fill={colors[idx]} radius={[4, 4, 0, 0]} />
                            ))}
                        </BarChart>
                    );

                case 'composed':
                    return (
                        <ComposedChart data={chartData}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
                            <XAxis dataKey={xAxis} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            {showLegend && <Legend />}
                            <Bar dataKey={yAxis} fill={colors[0]} radius={[4, 4, 0, 0]} />
                            {numericFields[1] && <Line type="monotone" dataKey={numericFields[1]} stroke={colors[1]} strokeWidth={3} />}
                        </ComposedChart>
                    );

                // Scientific Charts
                case 'scatter':
                case 'bubble':
                    return (
                        <ReScatterChart>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
                            <XAxis dataKey={xAxis} type="number" tick={{ fill: '#6B7280', fontSize: 12 }} name={xAxis} />
                            <YAxis dataKey={yAxis} type="number" tick={{ fill: '#6B7280', fontSize: 12 }} name={yAxis} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            {showLegend && <Legend />}
                            <Scatter name="البيانات" data={chartData} fill={colors[0]}>
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Scatter>
                        </ReScatterChart>
                    );

                case 'radar':
                case 'polar':
                    return (
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                            <PolarGrid stroke="#E5E7EB" />
                            <PolarAngleAxis dataKey={xAxis} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <PolarRadiusAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            {showLegend && <Legend />}
                            <Radar name={yAxis} dataKey={yAxis} stroke={colors[0]} fill={colors[0]} fillOpacity={0.5} />
                        </RadarChart>
                    );

                // Business Charts
                case 'radial':
                case 'gauge':
                    return (
                        <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={chartData} startAngle={180} endAngle={0}>
                            <RadialBar minAngle={15} background clockWise dataKey={yAxis} cornerRadius={10}>
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </RadialBar>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            {showLegend && <Legend iconType="circle" />}
                        </RadialBarChart>
                    );

                case 'funnel':
                    return (
                        <FunnelChart>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Funnel dataKey={yAxis} data={chartData} isAnimationActive>
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                                <LabelList position="center" fill="#fff" stroke="none" fontSize={12} />
                            </Funnel>
                        </FunnelChart>
                    );

                case 'treemap':
                    const treemapData = chartData.map((item, idx) => ({
                        name: String(item[xAxis] || `Item ${idx}`),
                        size: Number(item[yAxis]) || 0,
                        fill: colors[idx % colors.length],
                    }));
                    return (
                        <Treemap data={treemapData} dataKey="size" aspectRatio={4/3} stroke="#fff" fill={colors[0]}>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        </Treemap>
                    );

                case 'waterfall':
                    // Waterfall as stacked bars with positive/negative
                    return (
                        <BarChart data={chartData}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
                            <XAxis dataKey={xAxis} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            {showLegend && <Legend />}
                            <Bar dataKey={yAxis} radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={Number(entry[yAxis]) >= 0 ? colors[0] : colors[4]} />
                                ))}
                            </Bar>
                        </BarChart>
                    );

                // Mini Charts
                case 'sparkline':
                    return (
                        <ReAreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                            <defs>
                                <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={colors[0]} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={colors[0]} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey={yAxis} stroke={colors[0]} fill="url(#sparkGradient)" strokeWidth={2} dot={false} />
                        </ReAreaChart>
                    );

                case 'bullet':
                case 'histogram':
                    return (
                        <BarChart data={chartData}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
                            <XAxis dataKey={xAxis} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey={yAxis} fill={colors[0]} radius={[2, 2, 0, 0]} />
                        </BarChart>
                    );

                case 'heatmap':
                    // Simple heatmap representation
                    return (
                        <BarChart data={chartData}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
                            <XAxis dataKey={xAxis} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey={yAxis}>
                                {chartData.map((entry, index) => {
                                    const value = Number(entry[yAxis]) || 0;
                                    const maxVal = Math.max(...chartData.map(d => Number(d[yAxis]) || 0));
                                    const intensity = value / maxVal;
                                    const colorIdx = Math.floor(intensity * (colors.length - 1));
                                    return <Cell key={`cell-${index}`} fill={colors[colorIdx]} />;
                                })}
                            </Bar>
                        </BarChart>
                    );

                default:
                    return (
                        <BarChart data={chartData}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
                            <XAxis dataKey={xAxis} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <Tooltip />
                            {showLegend && <Legend />}
                            <Bar dataKey={yAxis} fill={colors[0]} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    );
            }
        };

        return (
            <ResponsiveContainer width="100%" height={chartHeight}>
                {renderChartByType()}
            </ResponsiveContainer>
        );
    };

    // Save Chart
    const handleSaveChart = () => {
        if (!selectedDataSource || !xAxis || !yAxis) return;

        const newChart: ChartConfig = {
            id: `chart_${Date.now()}`,
            type: selectedChartType,
            title: chartTitle || 'رسم بياني جديد',
            titleAr: chartTitle || 'رسم بياني جديد',
            dataSource: selectedDataSource.id,
            xAxis,
            yAxis,
            colors: selectedPalette.colors,
            showLegend,
            showGrid,
        };

        setSavedCharts([...savedCharts, newChart]);
        alert('تم حفظ الرسم بنجاح!');
    };

    // Export Chart
    const handleExport = async (format: 'png' | 'svg' | 'pdf' | 'excel') => {
        if (!chartRef.current) return;

        setExporting(true);
        try {
            const chartElement = chartRef.current.querySelector('.recharts-wrapper');
            if (!chartElement) {
                alert('لا يوجد رسم للتصدير');
                return;
            }

            if (format === 'png' || format === 'pdf') {
                // Use html2canvas for PNG/PDF
                const html2canvas = (await import('html2canvas')).default;
                const canvas = await html2canvas(chartElement as HTMLElement, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                });

                if (format === 'png') {
                    const link = document.createElement('a');
                    link.download = `chart_${Date.now()}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                } else {
                    const jsPDF = (await import('jspdf')).default;
                    const pdf = new jsPDF('l', 'mm', 'a4');
                    const imgData = canvas.toDataURL('image/png');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`chart_${Date.now()}.pdf`);
                }
            } else if (format === 'svg') {
                const svgElement = chartElement.querySelector('svg');
                if (svgElement) {
                    const svgData = new XMLSerializer().serializeToString(svgElement);
                    const blob = new Blob([svgData], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = `chart_${Date.now()}.svg`;
                    link.href = url;
                    link.click();
                    URL.revokeObjectURL(url);
                }
            } else if (format === 'excel') {
                // Export data to Excel
                const XLSX = await import('xlsx');
                const worksheet = XLSX.utils.json_to_sheet(chartData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Chart Data');
                XLSX.writeFile(workbook, `chart_data_${Date.now()}.xlsx`);
            }
        } catch (err) {
            console.error('Export error:', err);
            alert('حدث خطأ أثناء التصدير. تأكد من تثبيت المكتبات المطلوبة.');
        } finally {
            setExporting(false);
        }
    };

    // Generate Share Link & Embed Code
    const handleShare = () => {
        const chartConfig = {
            type: selectedChartType,
            title: chartTitle,
            dataSource: selectedDataSource?.id,
            xAxis,
            yAxis,
            palette: selectedPalette.id,
            showLegend,
            showGrid,
        };

        // Create shareable link (base64 encoded config)
        const configString = btoa(JSON.stringify(chartConfig));
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/#/chart-view?config=${configString}`;
        setShareLink(link);

        // Create embed code
        const embed = `<iframe
  src="${link}&embed=true"
  width="100%"
  height="400"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
></iframe>`;
        setEmbedCode(embed);

        setShowShareModal(true);
    };

    // Copy to clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 mb-8 text-white">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        <BarChart2 size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black">باني الرسوم البيانية</h1>
                        <p className="text-indigo-100">أنشئ رسومات بيانية احترافية بدون كود</p>
                    </div>
                </div>

                {/* Steps */}
                <div className="flex items-center gap-4 mt-6">
                    {[
                        { num: 1, label: 'مصدر البيانات' },
                        { num: 2, label: 'نوع الرسم' },
                        { num: 3, label: 'المحاور' },
                        { num: 4, label: 'التخصيص' },
                    ].map((s, i) => (
                        <React.Fragment key={s.num}>
                            <button
                                onClick={() => setStep(s.num as 1 | 2 | 3 | 4)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                                    step >= s.num
                                        ? 'bg-white text-indigo-600'
                                        : 'bg-white/20 text-white/70'
                                }`}
                            >
                                <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-sm">
                                    {step > s.num ? <Check size={14} /> : s.num}
                                </span>
                                <span className="hidden sm:inline">{s.label}</span>
                            </button>
                            {i < 3 && <ArrowRight size={20} className="text-white/40" />}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel - Controls */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Step 1: Data Source */}
                    <div className={`bg-white rounded-2xl border p-6 ${step === 1 ? 'border-indigo-300 shadow-lg' : 'border-gray-200'}`}>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Database size={18} className="text-indigo-600" />
                            اختر مصدر البيانات
                        </h3>

                        {error && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-2 text-yellow-700 text-sm">
                                <AlertTriangle size={16} />
                                {error}
                            </div>
                        )}

                        {/* Frontend Fetch Badge with Count & Load All */}
                        <div className="mb-4 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Zap size={14} />
                                    <span>جلب مباشر من البوابة الوطنية</span>
                                </div>
                                {dataSources.length > 0 && (
                                    <span className="bg-emerald-200 px-2 py-0.5 rounded-full font-bold">
                                        {dataSources.length} مصدر
                                    </span>
                                )}
                            </div>
                            {/* Load All Button */}
                            {hasMore && !loading && (
                                <button
                                    onClick={loadAllDatasetsHandler}
                                    disabled={loadingAll}
                                    className="mt-2 w-full py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loadingAll ? (
                                        <>
                                            <Loader2 size={12} className="animate-spin" />
                                            <span>جاري التحميل... ({totalLoaded})</span>
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw size={12} />
                                            <span>تحميل جميع مصادر البيانات</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="animate-spin text-indigo-600" size={32} />
                                <span className="mr-2 text-sm text-gray-500">جاري الجلب من البوابة...</span>
                            </div>
                        ) : dataSources.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Database size={32} className="mx-auto mb-2 opacity-50" />
                                <p>لا توجد مصادر بيانات متاحة</p>
                                <button
                                    onClick={() => fetchDatasetsPage(1)}
                                    className="mt-3 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-200"
                                >
                                    إعادة المحاولة
                                </button>
                            </div>
                        ) : (
                            <div
                                ref={listContainerRef}
                                className="space-y-3 max-h-80 overflow-y-auto"
                                onScroll={handleScroll}
                            >
                                {dataSources.map(ds => (
                                    <button
                                        key={ds.id}
                                        onClick={() => {
                                            setSelectedDataSource({
                                                ...ds,
                                                fields: [],
                                                sampleData: [],
                                            });
                                            fetchDatasetData(ds.id);
                                        }}
                                        disabled={loadingData && selectedDataSource?.id === ds.id}
                                        className={`w-full text-right p-4 rounded-xl border-2 transition-all ${
                                            selectedDataSource?.id === ds.id
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                        } ${loadingData && selectedDataSource?.id === ds.id ? 'opacity-70' : ''}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-gray-900 text-sm">{ds.nameAr}</p>
                                            {loadingData && selectedDataSource?.id === ds.id && (
                                                <Loader2 className="animate-spin text-indigo-600" size={16} />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            {ds.recordCount ? (
                                                <span className="text-xs text-gray-500">~{ds.recordCount.toLocaleString('ar-SA')} سجل</span>
                                            ) : null}
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{ds.category}</span>
                                        </div>
                                    </button>
                                ))}

                                {/* Load More Indicator */}
                                {loadingMore && (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="animate-spin text-indigo-600 ml-2" size={20} />
                                        <span className="text-sm text-gray-500">جاري تحميل المزيد...</span>
                                    </div>
                                )}

                                {/* Load More Button */}
                                {hasMore && !loadingMore && (
                                    <button
                                        onClick={loadMoreDatasets}
                                        className="w-full py-3 text-center text-indigo-600 hover:bg-indigo-50 rounded-xl text-sm font-bold border-2 border-dashed border-indigo-200"
                                    >
                                        تحميل المزيد...
                                    </button>
                                )}

                                {/* End of List */}
                                {!hasMore && dataSources.length > 0 && (
                                    <p className="text-center text-xs text-gray-400 py-2">
                                        تم تحميل جميع مصادر البيانات ({dataSources.length})
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Step 2: Chart Type */}
                    <div className={`bg-white rounded-2xl border p-6 ${step === 2 ? 'border-indigo-300 shadow-lg' : 'border-gray-200'}`}>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BarChart2 size={18} className="text-indigo-600" />
                                نوع الرسم البياني
                            </div>
                            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-bold">
                                {CHART_TYPES.length} نوع
                            </span>
                        </h3>

                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <button
                                onClick={() => setChartCategory('all')}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                    chartCategory === 'all'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                الكل
                            </button>
                            {CHART_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setChartCategory(cat.id)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                        chartCategory === cat.id
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto">
                            {CHART_TYPES
                                .filter(ct => chartCategory === 'all' || ct.category === chartCategory)
                                .map(ct => (
                                <button
                                    key={ct.id}
                                    onClick={() => {
                                        setSelectedChartType(ct.id as ChartType);
                                        setStep(3);
                                    }}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                                        selectedChartType === ct.id
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                                            : 'border-gray-100 hover:border-gray-200 text-gray-600'
                                    }`}
                                >
                                    <ct.icon size={20} />
                                    <span className="text-[10px] font-bold text-center leading-tight">{ct.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 3: Axes */}
                    {selectedDataSource && (
                        <div className={`bg-white rounded-2xl border p-6 ${step === 3 ? 'border-indigo-300 shadow-lg' : 'border-gray-200'}`}>
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp size={18} className="text-indigo-600" />
                                تحديد المحاور
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">المحور الأفقي (X)</label>
                                    <select
                                        value={xAxis}
                                        onChange={(e) => setXAxis(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {selectedDataSource.fields.map(f => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">المحور الرأسي (Y)</label>
                                    <select
                                        value={yAxis}
                                        onChange={(e) => {
                                            setYAxis(e.target.value);
                                            setStep(4);
                                        }}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {selectedDataSource.fields.map(f => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Customization */}
                    <div className={`bg-white rounded-2xl border p-6 ${step === 4 ? 'border-indigo-300 shadow-lg' : 'border-gray-200'}`}>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Palette size={18} className="text-indigo-600" />
                            التخصيص
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">عنوان الرسم</label>
                                <input
                                    type="text"
                                    value={chartTitle}
                                    onChange={(e) => setChartTitle(e.target.value)}
                                    placeholder="أدخل عنوان الرسم..."
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">الألوان</label>
                                <div className="flex gap-2">
                                    {COLOR_PALETTES.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedPalette(p)}
                                            className={`w-8 h-8 rounded-lg border-2 ${
                                                selectedPalette.id === p.id ? 'border-gray-900' : 'border-transparent'
                                            }`}
                                            style={{ background: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[2]})` }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">إظهار وسيلة الإيضاح</span>
                                <button
                                    onClick={() => setShowLegend(!showLegend)}
                                    className={`w-12 h-6 rounded-full transition-all ${showLegend ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-all ${showLegend ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">إظهار الشبكة</span>
                                <button
                                    onClick={() => setShowGrid(!showGrid)}
                                    className={`w-12 h-6 rounded-full transition-all ${showGrid ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-all ${showGrid ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Preview */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-4">
                        {/* Preview Header */}
                        <div className="border-b border-gray-100 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Eye size={18} className="text-gray-400" />
                                <span className="font-bold text-gray-900">
                                    {chartTitle || 'معاينة الرسم البياني'}
                                </span>
                                {dataSource && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                        dataSource === 'api'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-green-100 text-green-700'
                                    }`}>
                                        {dataSource === 'api' ? '🌐 من API' : '⚡ من Cache'}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSaveChart}
                                    disabled={!selectedDataSource || !xAxis || !yAxis}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save size={16} />
                                    حفظ
                                </button>
                                {/* Export Dropdown */}
                                <div className="relative group">
                                    <button
                                        disabled={exporting}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 disabled:opacity-50"
                                    >
                                        {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                        تصدير
                                        <ChevronDown size={14} />
                                    </button>
                                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[140px]">
                                        <button onClick={() => handleExport('png')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full text-right">
                                            <FileImage size={16} className="text-blue-600" /> PNG
                                        </button>
                                        <button onClick={() => handleExport('svg')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full text-right">
                                            <FileImage size={16} className="text-purple-600" /> SVG
                                        </button>
                                        <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full text-right">
                                            <FileText size={16} className="text-red-600" /> PDF
                                        </button>
                                        <button onClick={() => handleExport('excel')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full text-right">
                                            <Table size={16} className="text-green-600" /> Excel
                                        </button>
                                    </div>
                                </div>

                                {/* Share Button */}
                                <button
                                    onClick={handleShare}
                                    disabled={!selectedDataSource || !xAxis || !yAxis}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Share2 size={16} />
                                    مشاركة
                                </button>
                            </div>
                        </div>

                        {/* Chart Preview */}
                        <div ref={chartRef} className="p-6">
                            {renderChart()}
                        </div>

                        {/* Data Table */}
                        {selectedDataSource && (
                            <div className="border-t border-gray-100 p-4">
                                <h4 className="font-bold text-gray-700 mb-3 text-sm">البيانات المستخدمة</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                {selectedDataSource.fields.map(f => (
                                                    <th key={f} className="p-2 text-right font-bold text-gray-600">{f}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedDataSource.sampleData.slice(0, 5).map((row, i) => (
                                                <tr key={i} className="border-t border-gray-100">
                                                    {selectedDataSource.fields.map(f => (
                                                        <td key={f} className="p-2 text-gray-700">
                                                            {row[f] as string}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Saved Charts */}
                    {savedCharts.length > 0 && (
                        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-900 mb-4">الرسوم المحفوظة ({savedCharts.length})</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {savedCharts.map(chart => (
                                    <div key={chart.id} className="p-4 bg-gray-50 rounded-xl">
                                        <p className="font-bold text-gray-900">{chart.title}</p>
                                        <p className="text-xs text-gray-500">{chart.type} • {chart.dataSource}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <Share2 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black">مشاركة الرسم البياني</h3>
                                        <p className="text-emerald-100 text-sm">شارك أو ضمّن الرسم في موقعك</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Share Link */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                    <Link size={16} className="text-emerald-600" />
                                    رابط المشاركة
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={shareLink}
                                        className="flex-1 p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-600 font-mono"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(shareLink)}
                                        className={`px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                                            copied
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        }`}
                                    >
                                        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                        {copied ? 'تم النسخ!' : 'نسخ'}
                                    </button>
                                </div>
                            </div>

                            {/* Embed Code */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                    <Layers size={16} className="text-indigo-600" />
                                    كود التضمين (Embed)
                                </label>
                                <div className="relative">
                                    <textarea
                                        readOnly
                                        value={embedCode}
                                        rows={4}
                                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-600 font-mono resize-none"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(embedCode)}
                                        className="absolute top-2 left-2 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    انسخ هذا الكود وألصقه في موقعك لعرض الرسم البياني
                                </p>
                            </div>

                            {/* Social Share Buttons */}
                            <div>
                                <label className="text-sm font-bold text-gray-700 mb-3 block">مشاركة على</label>
                                <div className="flex gap-3">
                                    <a
                                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(chartTitle || 'رسم بياني من منصة المستثمر')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-3 bg-[#1DA1F2] text-white rounded-xl font-bold text-sm text-center hover:opacity-90"
                                    >
                                        Twitter
                                    </a>
                                    <a
                                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-3 bg-[#0077B5] text-white rounded-xl font-bold text-sm text-center hover:opacity-90"
                                    >
                                        LinkedIn
                                    </a>
                                    <a
                                        href={`https://wa.me/?text=${encodeURIComponent(chartTitle || 'رسم بياني')}%20${encodeURIComponent(shareLink)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-3 bg-[#25D366] text-white rounded-xl font-bold text-sm text-center hover:opacity-90"
                                    >
                                        WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-300"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChartBuilderPage;
