/**
 * ======================================
 * AI SIGNALS PAGE - صفحة الإشارات الذكية
 * ======================================
 * 
 * صفحة مدعومة بالكامل بالذكاء الاصطناعي
 * AI-powered signals and insights page
 */

import React, { useState, useEffect } from 'react';
import {
    Sparkles,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Eye,
    Brain,
    Zap,
    Target,
    Activity,
    BarChart3,
    LineChart,
    PieChart,
    MapPin,
    Clock,
    Shield,
    Info,
    ChevronRight,
    Lightbulb,
    Database,
    Cpu,
    CheckCircle2,
    AlertCircle,
    Flame,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { api } from '../src/services/api';

// ============================================
// TYPES - الأنواع
// ============================================

type SignalType = 'opportunity' | 'watch' | 'risk';
type SignalCategory = 'comparison' | 'pattern' | 'heatmap' | 'trend' | 'anomaly';

interface APISignal {
    id: string;
    type: string;
    title: string;
    titleAr: string;
    summary: string;
    summaryAr: string;
    impactScore: number;
    confidence: number;
    trend: string;
    region?: string;
    sector?: string;
    dataSource: string;
    details: string;
    createdAt: string;
}

interface AISignal {
    id: string;
    type: SignalType;
    category: SignalCategory;
    title: string;
    summary: string;
    impactScore: number; // 0-100
    confidenceLevel: number; // 0-100
    timestamp: string;
    dataSources: string[];
    explanation: {
        why: string;
        dataUsed: string[];
        assumptions: string[];
        limitations: string[];
    };
    insights: string[];
    relatedSectors?: string[];
    relatedRegions?: string[];
}

// Transform API signal to UI signal
function transformSignal(apiSignal: APISignal): AISignal {
    const typeMap: Record<string, SignalType> = {
        'OPPORTUNITY': 'opportunity',
        'RISK': 'risk',
        'TREND': 'watch',
        'ALERT': 'watch',
    };

    let details: { relatedDatasets?: string[]; indicators?: Record<string, unknown> } = {};
    try {
        details = JSON.parse(apiSignal.details || '{}');
    } catch {
        details = {};
    }

    return {
        id: apiSignal.id,
        type: typeMap[apiSignal.type] || 'watch',
        category: 'trend',
        title: apiSignal.titleAr || apiSignal.title,
        summary: apiSignal.summaryAr || apiSignal.summary,
        impactScore: apiSignal.impactScore,
        confidenceLevel: apiSignal.confidence,
        timestamp: apiSignal.createdAt,
        dataSources: [apiSignal.dataSource === 'AI_ANALYSIS' ? 'تحليل الذكاء الاصطناعي' : 'البيانات المفتوحة السعودية'],
        explanation: {
            why: `تم رصد هذه الإشارة بناءً على تحليل البيانات الاقتصادية`,
            dataUsed: details.relatedDatasets || ['بيانات السوق'],
            assumptions: ['استمرار الاتجاهات الحالية', 'استقرار السياسات الاقتصادية'],
            limitations: ['التحليل يعتمد على البيانات المتاحة فقط'],
        },
        insights: Object.entries(details.indicators || {}).map(([key, value]) => `${key}: ${value}`),
        relatedSectors: apiSignal.sector ? [apiSignal.sector] : [],
        relatedRegions: apiSignal.region ? [apiSignal.region] : [],
    };
}

// ============================================
// FALLBACK DATA - بيانات احتياطية
// ============================================

const FALLBACK_SIGNALS: AISignal[] = [
    {
        id: 'fallback_1',
        type: 'opportunity',
        category: 'comparison',
        title: 'جاري تحميل البيانات...',
        summary: 'يتم الآن جلب أحدث الإشارات من الخادم',
        impactScore: 0,
        confidenceLevel: 0,
        timestamp: new Date().toISOString(),
        dataSources: [],
        explanation: { why: '', dataUsed: [], assumptions: [], limitations: [] },
        insights: [],
        relatedSectors: [],
        relatedRegions: []
    }
];

// ============================================
// COMPONENTS - المكونات
// ============================================

/**
 * AI Badge - شارة الذكاء الاصطناعي
 */
const AIBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg ${className}`}>
        <Sparkles size={12} className="animate-pulse" />
        <span>مولد بالذكاء الاصطناعي</span>
    </div>
);

/**
 * Signal Type Badge - شارة نوع الإشارة
 */
const SignalTypeBadge: React.FC<{ type: SignalType }> = ({ type }) => {
    const config = {
        opportunity: {
            icon: TrendingUp,
            label: 'فرصة',
            color: 'bg-green-100 text-green-700 border-green-200',
            iconColor: 'text-green-600'
        },
        watch: {
            icon: Eye,
            label: 'مراقبة',
            color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            iconColor: 'text-yellow-600'
        },
        risk: {
            icon: AlertTriangle,
            label: 'مخاطرة',
            color: 'bg-red-100 text-red-700 border-red-200',
            iconColor: 'text-red-600'
        }
    };

    const { icon: Icon, label, color, iconColor } = config[type];

    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${color}`}>
            <Icon size={14} className={iconColor} />
            <span>{label}</span>
        </div>
    );
};

/**
 * Confidence Meter - مقياس الثقة
 */
const ConfidenceMeter: React.FC<{ level: number }> = ({ level }) => {
    const getColor = () => {
        if (level >= 80) return 'bg-green-500';
        if (level >= 60) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">مستوى الثقة</span>
                <span className="font-bold text-gray-900">{level}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full ${getColor()} transition-all duration-500`}
                    style={{ width: `${level}%` }}
                />
            </div>
        </div>
    );
};

/**
 * Impact Score - درجة التأثير
 */
const ImpactScore: React.FC<{ score: number }> = ({ score }) => {
    const getColor = () => {
        if (score >= 80) return 'text-red-600';
        if (score >= 60) return 'text-orange-600';
        return 'text-yellow-600';
    };

    return (
        <div className="flex items-center gap-2">
            <Flame size={20} className={getColor()} />
            <div>
                <p className="text-xs text-gray-500 font-medium">درجة التأثير</p>
                <p className={`text-2xl font-black ${getColor()}`}>{score}</p>
            </div>
        </div>
    );
};

/**
 * Signal Card - بطاقة الإشارة
 */
const SignalCard: React.FC<{ signal: AISignal; onClick: () => void }> = ({ signal, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl hover:border-blue-300 transition-all duration-300 cursor-pointer group overflow-hidden"
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <SignalTypeBadge type={signal.type} />
                            <AIBadge />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                            {signal.title}
                        </h3>
                    </div>
                    <ImpactScore score={signal.impactScore} />
                </div>

                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                    {signal.summary}
                </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
                {/* Confidence */}
                <ConfidenceMeter level={signal.confidenceLevel} />

                {/* Insights Preview */}
                <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <Lightbulb size={14} className="text-yellow-500" />
                        رؤى رئيسية
                    </p>
                    <ul className="space-y-1">
                        {signal.insights.slice(0, 2).map((insight, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                <CheckCircle2 size={12} className="text-green-500 mt-0.5 shrink-0" />
                                <span className="line-clamp-1">{insight}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Tags */}
                {signal.relatedSectors && signal.relatedSectors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {signal.relatedSectors.slice(0, 3).map((sector, idx) => (
                            <span
                                key={idx}
                                className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium border border-blue-100"
                            >
                                {sector}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{new Date(signal.timestamp).toLocaleString('ar-SA', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</span>
                    </div>
                    <button className="flex items-center gap-1 text-blue-600 text-xs font-bold hover:gap-2 transition-all">
                        <span>التفاصيل الكاملة</span>
                        <ChevronRight size={14} className="rtl:rotate-180" />
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * Signal Detail Modal - نافذة تفاصيل الإشارة
 */
const SignalDetailModal: React.FC<{ signal: AISignal; onClose: () => void }> = ({ signal, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-4">
                                <SignalTypeBadge type={signal.type} />
                                <AIBadge className="bg-white/20 backdrop-blur-sm" />
                            </div>
                            <h2 className="text-2xl font-black leading-tight mb-2">
                                {signal.title}
                            </h2>
                            <p className="text-blue-100 text-sm">
                                {signal.summary}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <ChevronRight size={24} className="rotate-90" />
                        </button>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <p className="text-blue-100 text-xs font-medium mb-1">درجة التأثير</p>
                            <p className="text-3xl font-black">{signal.impactScore}%</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <p className="text-blue-100 text-xs font-medium mb-1">مستوى الثقة</p>
                            <p className="text-3xl font-black">{signal.confidenceLevel}%</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-300px)] space-y-6">
                    {/* Explanation */}
                    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Brain size={20} className="text-purple-600" />
                            التفسير الذكي
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-bold text-gray-700 mb-2">لماذا ظهرت هذه الإشارة؟</p>
                                <p className="text-sm text-gray-600 leading-relaxed">{signal.explanation.why}</p>
                            </div>

                            <div>
                                <p className="text-sm font-bold text-gray-700 mb-2">البيانات المستخدمة:</p>
                                <ul className="space-y-1">
                                    {signal.explanation.dataUsed.map((data, idx) => (
                                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                            <Database size={14} className="text-blue-500 mt-0.5 shrink-0" />
                                            <span>{data}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <p className="text-sm font-bold text-gray-700 mb-2">الافتراضات:</p>
                                <ul className="space-y-1">
                                    {signal.explanation.assumptions.map((assumption, idx) => (
                                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                            <Info size={14} className="text-yellow-500 mt-0.5 shrink-0" />
                                            <span>{assumption}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <p className="text-sm font-bold text-gray-700 mb-2">حدود التحليل:</p>
                                <ul className="space-y-1">
                                    {signal.explanation.limitations.map((limitation, idx) => (
                                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                            <AlertCircle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                                            <span>{limitation}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Insights */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Lightbulb size={20} className="text-yellow-500" />
                            الرؤى الرئيسية
                        </h3>
                        <div className="grid gap-3">
                            {signal.insights.map((insight, idx) => (
                                <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-3">
                                    <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-gray-700">{insight}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Data Sources */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Shield size={20} className="text-blue-600" />
                            مصادر البيانات الموثوقة
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {signal.dataSources.map((source, idx) => (
                                <span
                                    key={idx}
                                    className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium border border-blue-200 flex items-center gap-2"
                                >
                                    <Database size={14} />
                                    {source}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================
// MAIN COMPONENT - المكون الرئيسي
// ============================================

const AISignalsPage: React.FC = () => {
    const [selectedSignal, setSelectedSignal] = useState<AISignal | null>(null);
    const [filter, setFilter] = useState<'all' | SignalType>('all');
    const [signals, setSignals] = useState<AISignal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch signals from API
    const fetchSignals = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.getSignals({ limit: 20 });
            if (response.success && response.data) {
                const transformedSignals = (response.data as APISignal[]).map(transformSignal);
                setSignals(transformedSignals);
            } else {
                setError(response.errorAr || 'حدث خطأ في جلب البيانات');
            }
        } catch (err) {
            setError('تعذر الاتصال بالخادم');
            console.error('Error fetching signals:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSignals();
    }, []);

    const filteredSignals = filter === 'all'
        ? signals
        : signals.filter(s => s.type === filter);

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 animate-fadeIn">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-3xl p-8 lg:p-12 mb-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -ml-32 -mb-32"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-xl text-white rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
                            <Sparkles size={28} strokeWidth={2.5} className="animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                                إشارات السوق الذكية
                            </h1>
                            <p className="text-purple-100 text-sm font-medium mt-1">مدعومة بالكامل بالذكاء الاصطناعي</p>
                        </div>
                    </div>

                    <p className="text-white/90 text-base lg:text-lg max-w-3xl mb-6">
                        تحليل فوري وذكي لأهم الفرص والمخاطر في السوق، مع تفسير شامل لكل إشارة ومصادر البيانات المستخدمة
                    </p>

                    {/* AI Features */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
                            <Brain size={24} className="text-white mb-2" />
                            <p className="text-white font-bold text-sm">تحليل ذكي</p>
                            <p className="text-purple-100 text-xs">مدعوم بـ AI</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
                            <Shield size={24} className="text-white mb-2" />
                            <p className="text-white font-bold text-sm">مصادر موثوقة</p>
                            <p className="text-purple-100 text-xs">بيانات رسمية</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
                            <Target size={24} className="text-white mb-2" />
                            <p className="text-white font-bold text-sm">دقة عالية</p>
                            <p className="text-purple-100 text-xs">ثقة 70%+</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
                            <Activity size={24} className="text-white mb-2" />
                            <p className="text-white font-bold text-sm">تحديث مستمر</p>
                            <p className="text-purple-100 text-xs">بيانات حية</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filter === 'all'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            الكل ({signals.length})
                        </button>
                        <button
                            onClick={() => setFilter('opportunity')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${filter === 'opportunity'
                                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <TrendingUp size={16} />
                            فرص ({signals.filter(s => s.type === 'opportunity').length})
                        </button>
                        <button
                            onClick={() => setFilter('watch')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${filter === 'watch'
                                    ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/30'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <Eye size={16} />
                            مراقبة ({signals.filter(s => s.type === 'watch').length})
                        </button>
                        <button
                            onClick={() => setFilter('risk')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${filter === 'risk'
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <AlertTriangle size={16} />
                            مخاطر ({signals.filter(s => s.type === 'risk').length})
                        </button>
                    </div>
                    <button
                        onClick={fetchSignals}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        تحديث
                    </button>
                </div>
            </div>

            {/* Signals Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 mb-8">
                    <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">جاري تحميل الإشارات...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-8 text-center">
                    <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-red-700 mb-2">خطأ في التحميل</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchSignals}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            ) : filteredSignals.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-8 text-center">
                    <Eye size={48} className="text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-700 mb-2">لا توجد إشارات</h3>
                    <p className="text-gray-500">لم يتم العثور على إشارات بهذا التصنيف</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {filteredSignals.map(signal => (
                        <SignalCard
                            key={signal.id}
                            signal={signal}
                            onClick={() => setSelectedSignal(signal)}
                        />
                    ))}
                </div>
            )}

            {/* AI Disclaimer */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                        <Cpu size={24} className="text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">حول الذكاء الاصطناعي</h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                            جميع الإشارات والتحليلات في هذه الصفحة مولدة بالكامل بواسطة الذكاء الاصطناعي بناءً على مصادر بيانات موثوقة فقط.
                            يتم توضيح مصادر البيانات، الافتراضات، وحدود كل تحليل بشكل شفاف.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="bg-white text-purple-700 px-3 py-1 rounded-lg text-xs font-bold border border-purple-200">
                                بيانات حكومية موثوقة
                            </span>
                            <span className="bg-white text-blue-700 px-3 py-1 rounded-lg text-xs font-bold border border-blue-200">
                                تفسير شفاف
                            </span>
                            <span className="bg-white text-green-700 px-3 py-1 rounded-lg text-xs font-bold border border-green-200">
                                تحديث مستمر
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedSignal && (
                <SignalDetailModal
                    signal={selectedSignal}
                    onClose={() => setSelectedSignal(null)}
                />
            )}
        </div>
    );
};

export default AISignalsPage;
