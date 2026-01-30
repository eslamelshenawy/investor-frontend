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
import { api } from '../src/services/api';
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

interface APIDataset {
    id: string;
    externalId: string;
    name: string;
    nameAr: string;
    category: string;
    columns?: string;
    dataPreview?: string;
    recordCount: number;
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

    // Fetch datasets metadata from API (On-Demand Architecture)
    useEffect(() => {
        const fetchDatasets = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.getDatasets({ limit: 100 });
                if (response.success && response.data) {
                    const datasets = response.data as APIDataset[];
                    // With On-Demand architecture, we load all datasets
                    // Data will be fetched when user selects one
                    const sources: DataSource[] = datasets.map(d => ({
                        id: d.externalId || d.id,
                        name: d.name,
                        nameAr: d.nameAr || d.name,
                        category: d.category,
                        fields: [], // Will be fetched on-demand
                        sampleData: [], // Will be fetched on-demand
                        recordCount: d.recordCount,
                    }));

                    setDataSources(sources);

                    if (sources.length === 0) {
                        setError('لا توجد مجموعات بيانات. جاري استخدام بيانات تجريبية.');
                        setDataSources(getSampleDataSources());
                    }
                } else {
                    setError('تعذر جلب البيانات');
                    setDataSources(getSampleDataSources());
                }
            } catch (err) {
                console.error('Error fetching datasets:', err);
                setError('تعذر الاتصال بالخادم. جاري استخدام بيانات تجريبية.');
                setDataSources(getSampleDataSources());
            } finally {
                setLoading(false);
            }
        };

        fetchDatasets();
    }, []);

    // Fetch dataset data on-demand when selected
    const fetchDatasetData = async (datasetId: string) => {
        setLoadingData(true);
        setDataSource(null);
        try {
            const response = await api.getDatasetPreview(datasetId, 50);
            if (response.success && response.data) {
                const { preview, columns } = response.data;

                if (preview && preview.length > 0 && columns && columns.length > 0) {
                    setSelectedDataSource(prev => prev ? {
                        ...prev,
                        fields: columns,
                        sampleData: preview,
                    } : null);
                    setXAxis(columns[0]);
                    setYAxis(columns[1] || columns[0]);
                    setDataSource('api');
                    setStep(2);
                } else {
                    setError('لا توجد بيانات متاحة لهذا المصدر');
                }
            } else {
                setError(response.errorAr || 'تعذر جلب البيانات');
            }
        } catch (err) {
            console.error('Error fetching dataset data:', err);
            setError('تعذر جلب البيانات من المصدر');
        } finally {
            setLoadingData(false);
        }
    };

    // Fallback sample data
    const getSampleDataSources = (): DataSource[] => [
        {
            id: 'signals-data',
            name: 'Market Signals',
            nameAr: 'إشارات السوق',
            category: 'تحليلات',
            fields: ['القطاع', 'درجة التأثير', 'الثقة', 'الاتجاه'],
            sampleData: [
                { القطاع: 'العقارات', 'درجة التأثير': 78, 'الثقة': 85, 'الاتجاه': 15 },
                { القطاع: 'السياحة', 'درجة التأثير': 82, 'الثقة': 90, 'الاتجاه': 28 },
                { القطاع: 'الغذاء', 'درجة التأثير': 65, 'الثقة': 88, 'الاتجاه': -4 },
                { القطاع: 'التجزئة', 'درجة التأثير': 70, 'الثقة': 95, 'الاتجاه': 8 },
                { القطاع: 'الطاقة', 'درجة التأثير': 88, 'الثقة': 92, 'الاتجاه': 12 },
            ]
        },
        {
            id: 'content-stats',
            name: 'Content Statistics',
            nameAr: 'إحصائيات المحتوى',
            category: 'محتوى',
            fields: ['النوع', 'العدد', 'المشاهدات', 'التفاعل'],
            sampleData: [
                { النوع: 'مقالات', 'العدد': 45, 'المشاهدات': 12500, 'التفاعل': 850 },
                { النوع: 'تقارير', 'العدد': 12, 'المشاهدات': 8200, 'التفاعل': 420 },
                { النوع: 'أخبار', 'العدد': 156, 'المشاهدات': 45000, 'التفاعل': 2100 },
                { النوع: 'تحليلات', 'العدد': 28, 'المشاهدات': 15800, 'التفاعل': 980 },
            ]
        }
    ];

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

                        {/* On-Demand Badge */}
                        <div className="mb-4 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-700 text-xs">
                            <Cloud size={14} />
                            <span>البيانات تُجلب عند الطلب (On-Demand)</span>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="animate-spin text-indigo-600" size={32} />
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {dataSources.map(ds => (
                                    <button
                                        key={ds.id}
                                        onClick={() => {
                                            // Set basic info first
                                            setSelectedDataSource({
                                                ...ds,
                                                fields: [],
                                                sampleData: [],
                                            });
                                            // Fetch data on-demand
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
                                            <p className="font-bold text-gray-900">{ds.nameAr}</p>
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
