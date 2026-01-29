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
    AlertTriangle
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
    Cell
} from 'recharts';

// ============================================
// TYPES
// ============================================

type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'stacked';

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
    { id: 'bar', icon: BarChart2, label: 'أعمدة', labelEn: 'Bar Chart' },
    { id: 'line', icon: LineChart, label: 'خطي', labelEn: 'Line Chart' },
    { id: 'pie', icon: PieChart, label: 'دائري', labelEn: 'Pie Chart' },
    { id: 'area', icon: AreaChart, label: 'مساحة', labelEn: 'Area Chart' },
    { id: 'stacked', icon: Layers, label: 'متراكم', labelEn: 'Stacked Bar' },
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

    // Fetch datasets from API
    useEffect(() => {
        const fetchDatasets = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.getDatasets({ limit: 50 });
                if (response.success && response.data) {
                    const datasets = response.data as APIDataset[];
                    const sources: DataSource[] = datasets
                        .filter(d => d.columns && d.dataPreview)
                        .map(d => {
                            let fields: string[] = [];
                            let sampleData: Record<string, unknown>[] = [];

                            try {
                                fields = JSON.parse(d.columns || '[]');
                                sampleData = JSON.parse(d.dataPreview || '[]');
                            } catch {
                                fields = [];
                                sampleData = [];
                            }

                            return {
                                id: d.id,
                                name: d.name,
                                nameAr: d.nameAr || d.name,
                                category: d.category,
                                fields,
                                sampleData,
                            };
                        })
                        .filter(d => d.fields.length > 0 && d.sampleData.length > 0);

                    setDataSources(sources);

                    if (sources.length === 0) {
                        setError('لا توجد بيانات متاحة للعرض. جاري استخدام بيانات تجريبية.');
                        // Fallback to sample data
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
        if (!selectedDataSource || !xAxis || !yAxis) {
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

        return (
            <ResponsiveContainer width="100%" height={300}>
                {selectedChartType === 'bar' ? (
                    <BarChart data={chartData}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
                        <XAxis dataKey={xAxis} tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <Tooltip />
                        {showLegend && <Legend />}
                        <Bar dataKey={yAxis} fill={colors[0]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                ) : selectedChartType === 'line' ? (
                    <ReLineChart data={chartData}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
                        <XAxis dataKey={xAxis} tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <Tooltip />
                        {showLegend && <Legend />}
                        <Line type="monotone" dataKey={yAxis} stroke={colors[0]} strokeWidth={3} dot={{ fill: colors[0] }} />
                    </ReLineChart>
                ) : selectedChartType === 'area' ? (
                    <ReAreaChart data={chartData}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
                        <XAxis dataKey={xAxis} tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <Tooltip />
                        {showLegend && <Legend />}
                        <Area type="monotone" dataKey={yAxis} stroke={colors[0]} fill={colors[2]} fillOpacity={0.6} />
                    </ReAreaChart>
                ) : selectedChartType === 'pie' ? (
                    <RePieChart>
                        <Pie
                            data={chartData}
                            dataKey={yAxis}
                            nameKey={xAxis}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                        >
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        {showLegend && <Legend />}
                    </RePieChart>
                ) : (
                    <BarChart data={chartData}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
                        <XAxis dataKey={xAxis} tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <Tooltip />
                        {showLegend && <Legend />}
                        <Bar dataKey={yAxis} stackId="a" fill={colors[0]} />
                        <Bar dataKey={yAxis} stackId="a" fill={colors[1]} />
                    </BarChart>
                )}
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
    const handleExport = (format: 'png' | 'pdf' | 'excel') => {
        alert(`جاري تصدير الرسم بصيغة ${format.toUpperCase()}...`);
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
                                            setSelectedDataSource(ds);
                                            setXAxis(ds.fields[0]);
                                            setYAxis(ds.fields[1] || ds.fields[0]);
                                            setStep(2);
                                        }}
                                        className={`w-full text-right p-4 rounded-xl border-2 transition-all ${
                                            selectedDataSource?.id === ds.id
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <p className="font-bold text-gray-900">{ds.nameAr}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500">{ds.fields.length} حقول</span>
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{ds.category}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Step 2: Chart Type */}
                    <div className={`bg-white rounded-2xl border p-6 ${step === 2 ? 'border-indigo-300 shadow-lg' : 'border-gray-200'}`}>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <BarChart2 size={18} className="text-indigo-600" />
                            نوع الرسم البياني
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                            {CHART_TYPES.map(ct => (
                                <button
                                    key={ct.id}
                                    onClick={() => {
                                        setSelectedChartType(ct.id as ChartType);
                                        setStep(3);
                                    }}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                                        selectedChartType === ct.id
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                                            : 'border-gray-100 hover:border-gray-200 text-gray-600'
                                    }`}
                                >
                                    <ct.icon size={24} />
                                    <span className="text-xs font-bold">{ct.label}</span>
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
                                <div className="relative group">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200">
                                        <Download size={16} />
                                        تصدير
                                        <ChevronDown size={14} />
                                    </button>
                                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                        <button onClick={() => handleExport('png')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full text-right">
                                            <FileImage size={16} /> PNG
                                        </button>
                                        <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full text-right">
                                            <FileText size={16} /> PDF
                                        </button>
                                        <button onClick={() => handleExport('excel')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full text-right">
                                            <Table size={16} /> Excel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart Preview */}
                        <div className="p-6">
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
        </div>
    );
};

export default ChartBuilderPage;
