/**
 * ======================================
 * AI SIGNALS PAGE - إشارات السوق الذكية
 * ======================================
 *
 * العقل التحليلي للمنصة - لوحة القيادة الاستراتيجية
 * Strategic command center for market intelligence
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    Clock,
    Shield,
    Info,
    ChevronRight,
    ChevronLeft,
    Lightbulb,
    Database,
    Cpu,
    CheckCircle2,
    AlertCircle,
    Flame,
    Loader2,
    RefreshCw,
    Play,
    Wifi,
    Hash,
    ArrowUpRight,
    Layers,
    X,
    Search
} from 'lucide-react';
import { api } from '../src/services/api';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ============================================
// TYPES
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
    titleEn?: string;
    summary: string;
    summaryEn?: string;
    impactScore: number;
    confidenceLevel: number;
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
        titleEn: apiSignal.title,
        summary: apiSignal.summaryAr || apiSignal.summary,
        summaryEn: apiSignal.summary,
        impactScore: apiSignal.impactScore,
        confidenceLevel: apiSignal.confidence,
        timestamp: apiSignal.createdAt,
        dataSources: [apiSignal.dataSource === 'AI_ANALYSIS' ? 'تحليل الذكاء الاصطناعي' : 'البيانات المفتوحة السعودية'],
        explanation: details.explanation || {
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
// HELPER
// ============================================

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getImpactColor(score: number): string {
    if (score >= 80) return 'text-red-500';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-blue-500';
}

function getImpactBg(score: number): string {
    if (score >= 80) return 'from-red-500/20 to-red-600/10 border-red-500/30';
    if (score >= 60) return 'from-orange-500/20 to-orange-600/10 border-orange-500/30';
    if (score >= 40) return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
    return 'from-blue-500/20 to-blue-600/10 border-blue-500/30';
}

// ============================================
// SUB-COMPONENTS
// ============================================

/** Featured Signal - الإشارة المميزة */
const FeaturedSignalCard: React.FC<{ signal: AISignal; onClick: () => void }> = ({ signal, onClick }) => {
    const typeConfig: Record<SignalType, { label: string; icon: typeof TrendingUp; gradient: string; badge: string }> = {
        opportunity: {
            label: 'فرصة استثمارية',
            icon: TrendingUp,
            gradient: 'from-emerald-600 via-green-600 to-teal-700',
            badge: 'bg-emerald-400/20 text-emerald-100 border-emerald-400/30',
        },
        watch: {
            label: 'اتجاه مرصود',
            icon: Eye,
            gradient: 'from-amber-600 via-yellow-600 to-orange-700',
            badge: 'bg-amber-400/20 text-amber-100 border-amber-400/30',
        },
        risk: {
            label: 'تنبيه مخاطر',
            icon: AlertTriangle,
            gradient: 'from-red-600 via-rose-600 to-pink-700',
            badge: 'bg-red-400/20 text-red-100 border-red-400/30',
        },
    };

    const config = typeConfig[signal.type];
    const TypeIcon = config.icon;

    return (
        <div
            onClick={onClick}
            className={`relative overflow-hidden bg-gradient-to-br ${config.gradient} rounded-3xl shadow-2xl cursor-pointer group transition-all duration-300 hover:shadow-3xl hover:scale-[1.01]`}
        >
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -ml-36 -mt-36" />
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-black/10 rounded-full blur-3xl -mr-28 -mb-28" />

            <div className="relative z-10 p-8 lg:p-10">
                {/* Top row: badge + timestamp */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border backdrop-blur-sm ${config.badge}`}>
                            <Zap size={14} className="animate-pulse" />
                            FEATURED SIGNAL
                        </div>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-sm ${config.badge}`}>
                            <TypeIcon size={14} />
                            {config.label}
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/60 text-sm">
                        <Clock size={14} />
                        <span>{formatDate(signal.timestamp)}</span>
                    </div>
                </div>

                {/* Main content + Impact Score */}
                <div className="flex items-start gap-6">
                    <div className="flex-1">
                        <h2 className="text-2xl lg:text-3xl font-black text-white leading-tight mb-4 group-hover:text-white/90 transition-colors">
                            {signal.title}
                        </h2>
                        <p className="text-white/80 text-base lg:text-lg leading-relaxed mb-6 max-w-3xl">
                            {signal.summary}
                        </p>

                        {/* Sectors tags */}
                        {signal.relatedSectors && signal.relatedSectors.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {signal.relatedSectors.map((sector, idx) => (
                                    <span key={idx} className="bg-white/10 backdrop-blur-sm text-white/90 px-3 py-1 rounded-lg text-xs font-bold border border-white/20">
                                        #{sector}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Source */}
                        <div className="flex items-center gap-2 text-white/50 text-sm">
                            <Sparkles size={14} />
                            <span>رادار المستثمر (AI)</span>
                        </div>
                    </div>

                    {/* Impact Score Circle */}
                    <div className="shrink-0 hidden sm:flex flex-col items-center">
                        <div className={`w-28 h-28 lg:w-32 lg:h-32 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/30 flex flex-col items-center justify-center shadow-2xl`}>
                            <span className="text-white/60 text-xs font-bold mb-1">الأثر</span>
                            <span className="text-5xl lg:text-6xl font-black text-white leading-none">{signal.impactScore}</span>
                            <span className="text-white/60 text-lg font-bold">%</span>
                        </div>
                        <div className="mt-3 flex items-center gap-1.5 text-white/50 text-xs">
                            <Activity size={12} />
                            <span>الثقة: {signal.confidenceLevel}%</span>
                        </div>
                    </div>
                </div>

                {/* Mobile Impact Score */}
                <div className="sm:hidden mt-4 flex items-center gap-4">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 flex items-center gap-2">
                        <span className="text-white/60 text-xs font-bold">الأثر</span>
                        <span className="text-3xl font-black text-white">{signal.impactScore}%</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 flex items-center gap-2">
                        <span className="text-white/60 text-xs font-bold">الثقة</span>
                        <span className="text-xl font-bold text-white">{signal.confidenceLevel}%</span>
                    </div>
                </div>

                {/* View details prompt */}
                <div className="mt-6 flex items-center gap-2 text-white/50 group-hover:text-white/80 transition-colors text-sm font-medium">
                    <span>اضغط لعرض التحليل الكامل</span>
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                </div>
            </div>
        </div>
    );
};

/** Smart Insight Card - بطاقة رؤية ذكية */
const SmartInsightCard: React.FC<{ signal: AISignal; onClick: () => void }> = ({ signal, onClick }) => {
    const typeStyles: Record<SignalType, { border: string; iconBg: string; iconColor: string }> = {
        opportunity: { border: 'border-emerald-200 hover:border-emerald-400', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
        watch: { border: 'border-amber-200 hover:border-amber-400', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
        risk: { border: 'border-red-200 hover:border-red-400', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
    };

    const style = typeStyles[signal.type];

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl border-2 ${style.border} shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden`}
        >
            <div className="p-6">
                {/* Top: badge + impact */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 ${style.iconBg} rounded-xl flex items-center justify-center`}>
                            <Lightbulb size={18} className={style.iconColor} />
                        </div>
                        <span className="text-xs font-black text-gray-500 uppercase tracking-wider">رؤية ذكية</span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r ${getImpactBg(signal.impactScore)} border`}>
                        <Flame size={14} className={getImpactColor(signal.impactScore)} />
                        <span className={`text-sm font-black ${getImpactColor(signal.impactScore)}`}>{signal.impactScore}%</span>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-3 group-hover:text-blue-700 transition-colors line-clamp-2">
                    {signal.title}
                </h3>

                {/* Summary */}
                <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                    {signal.summary}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {signal.relatedSectors && signal.relatedSectors.slice(0, 3).map((sector, idx) => (
                        <span
                            key={idx}
                            className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-100"
                        >
                            #{sector}
                        </span>
                    ))}
                    {signal.relatedRegions && signal.relatedRegions.slice(0, 2).map((region, idx) => (
                        <span
                            key={`r-${idx}`}
                            className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-purple-100"
                        >
                            #{region}
                        </span>
                    ))}
                </div>

                {/* Footer: source + date */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <Sparkles size={12} className="text-purple-400" />
                        <span>رادار المستثمر (AI)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock size={12} />
                        <span>{formatDate(signal.timestamp)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

/** Signal Detail Modal */
const SignalDetailModal: React.FC<{ signal: AISignal; onClose: () => void }> = ({ signal, onClose }) => {
    const typeGradients: Record<SignalType, string> = {
        opportunity: 'from-emerald-600 to-teal-700',
        watch: 'from-amber-600 to-orange-700',
        risk: 'from-red-600 to-rose-700',
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className={`bg-gradient-to-r ${typeGradients[signal.type]} p-8 text-white relative`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-start gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/30">
                                    <Sparkles size={12} />
                                    مولد بالذكاء الاصطناعي
                                </div>
                            </div>
                            <h2 className="text-2xl font-black leading-tight mb-3">{signal.title}</h2>
                            <p className="text-white/80 text-sm leading-relaxed">{signal.summary}</p>
                        </div>

                        {/* Impact Score */}
                        <div className="shrink-0 hidden sm:block">
                            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl flex flex-col items-center justify-center">
                                <span className="text-white/60 text-xs">الأثر</span>
                                <span className="text-4xl font-black">{signal.impactScore}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Metrics bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <p className="text-white/60 text-xs mb-0.5">درجة التأثير</p>
                            <p className="text-xl font-black">{signal.impactScore}%</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <p className="text-white/60 text-xs mb-0.5">مستوى الثقة</p>
                            <p className="text-xl font-black">{signal.confidenceLevel}%</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <p className="text-white/60 text-xs mb-0.5">القطاع</p>
                            <p className="text-sm font-bold">{signal.relatedSectors?.[0] || 'عام'}</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <p className="text-white/60 text-xs mb-0.5">التاريخ</p>
                            <p className="text-sm font-bold">{new Date(signal.timestamp).toLocaleDateString('ar-SA')}</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-320px)] space-y-6">
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
                    {signal.insights.length > 0 && (
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
                    )}

                    {/* Data Sources */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Shield size={20} className="text-blue-600" />
                            مصادر البيانات
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {signal.dataSources.map((source, idx) => (
                                <span key={idx} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium border border-blue-200 flex items-center gap-2">
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
// MAIN COMPONENT
// ============================================

// Economic Summary types
interface DailySummary {
    summary: string;
    summaryAr: string;
    keyPoints?: Array<{
        title: string;
        description: string;
        impact: 'positive' | 'negative' | 'neutral';
        sector?: string;
    }>;
    marketMood?: 'bullish' | 'bearish' | 'neutral';
    topSectors?: string[];
    signalStats?: { total: number; opportunities: number; risks: number; trends: number };
}

/** Economic Summary Card */
const EconomicSummaryCard: React.FC<{ summary: DailySummary }> = ({ summary }) => {
    const moodConfig = {
        bullish: { label: 'إيجابي', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: TrendingUp },
        bearish: { label: 'سلبي', color: 'text-red-700 bg-red-50 border-red-200', icon: TrendingDown },
        neutral: { label: 'محايد', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: Activity },
    };
    const mood = moodConfig[summary.marketMood || 'neutral'];
    const MoodIcon = mood.icon;

    const impactIcons = {
        positive: { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        negative: { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
        neutral: { icon: Activity, color: 'text-gray-500', bg: 'bg-gray-50' },
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Brain size={16} className="text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">الملخص الاقتصادي</h2>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${mood.color}`}>
                    <MoodIcon size={12} />
                    مزاج السوق: {mood.label}
                </span>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed mb-4">{summary.summaryAr}</p>

            {summary.keyPoints && summary.keyPoints.length > 0 && (
                <div className="space-y-2">
                    {summary.keyPoints.slice(0, 7).map((point, idx) => {
                        const ic = impactIcons[point.impact || 'neutral'];
                        const ImpactIcon = ic.icon;
                        return (
                            <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50/80">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${ic.bg}`}>
                                    <ImpactIcon size={14} className={ic.color} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900">{point.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{point.description}</p>
                                </div>
                                {point.sector && (
                                    <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0">{point.sector}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {summary.signalStats && (
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <span>{summary.signalStats.total} إشارة</span>
                    <span className="text-emerald-600">{summary.signalStats.opportunities} فرصة</span>
                    <span className="text-red-600">{summary.signalStats.risks} مخاطر</span>
                    <span className="text-blue-600">{summary.signalStats.trends} اتجاه</span>
                </div>
            )}
        </div>
    );
};

const AISignalsPage: React.FC = () => {
    const [selectedSignal, setSelectedSignal] = useState<AISignal | null>(null);
    const [filter, setFilter] = useState<'all' | SignalType>('all');
    const [signals, setSignals] = useState<AISignal[]>([]);
    const [streaming, setStreaming] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<{ totalDatasets: number; totalSignals: number; lastUpdate: string | null }>({
        totalDatasets: 0, totalSignals: 0, lastUpdate: null
    });
    const [generating, setGenerating] = useState(false);
    const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
    const signalsEventSourceRef = useRef<EventSource | null>(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounced search handler
    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            setDebouncedSearch(value);
        }, 300);
    }, []);

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        };
    }, []);

    // SSE: Stream signals
    const streamSignals = useCallback(() => {
        const url = `${API_BASE}/signals/stream`;
        const eventSource = new EventSource(url);
        signalsEventSourceRef.current = eventSource;

        eventSource.addEventListener('signal', (e) => {
            try {
                const apiSignal = JSON.parse(e.data) as APISignal;
                const signal = transformSignal(apiSignal);
                setSignals(prev => {
                    if (prev.some(s => s.id === signal.id)) return prev;
                    return [...prev, signal];
                });
            } catch {}
        });

        eventSource.addEventListener('meta', (e) => {
            try {
                const meta = JSON.parse(e.data);
                setStats(prev => ({ ...prev, totalSignals: meta.total || prev.totalSignals }));
            } catch {}
        });

        eventSource.addEventListener('complete', () => {
            setStreaming(false);
            eventSource.close();
        });

        eventSource.onerror = () => {
            eventSource.close();
            fetchSignalsRegular();
        };
    }, []);

    // REST fallback
    const fetchSignalsRegular = useCallback(async () => {
        try {
            const response = await api.getSignals({ limit: 50 });
            if (response.success && response.data && (response.data as APISignal[]).length > 0) {
                const transformed = (response.data as APISignal[]).map(transformSignal);
                setSignals(transformed);
                setStats(prev => ({ ...prev, totalSignals: transformed.length }));
            } else {
                setSignals([]);
            }
        } catch {
            setError('تعذر تحميل الإشارات. يرجى المحاولة لاحقاً.');
            setSignals([]);
        } finally {
            setStreaming(false);
        }
    }, []);

    // Fetch stats
    const fetchStatsData = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/stats/overview`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    setStats({
                        totalDatasets: data.data.totalDatasets || 0,
                        totalSignals: data.data.totalSignals || signals.length,
                        lastUpdate: data.data.lastSyncAt || null
                    });
                }
            }
        } catch {}
    }, [signals.length]);

    // Generate signals
    const generateSignals = async () => {
        setGenerating(true);
        setError(null);
        try {
            const response = await api.post('/signals/analyze');
            if (response.success) {
                refreshData();
            } else if (response.error?.includes('unauthorized') || response.error?.includes('Unauthorized')) {
                setError('يجب تسجيل الدخول كمسؤول لتوليد الإشارات');
            } else {
                throw new Error(response.errorAr || response.error || 'فشل');
            }
        } catch {
            setError('تعذر توليد الإشارات. جاري المحاولة من البيانات المتاحة...');
            refreshData();
        } finally {
            setGenerating(false);
        }
    };

    // Refresh
    const refreshData = useCallback(() => {
        if (signalsEventSourceRef.current) signalsEventSourceRef.current.close();
        setSignals([]);
        setStreaming(true);
        setError(null);
        streamSignals();
        fetchStatsData();
    }, [streamSignals, fetchStatsData]);

    // Fetch daily summary
    const fetchDailySummary = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/signals/summary`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    setDailySummary(data.data);
                }
            }
        } catch {}
    }, []);

    // Init
    useEffect(() => {
        streamSignals();
        fetchStatsData();
        fetchDailySummary();
        return () => { if (signalsEventSourceRef.current) signalsEventSourceRef.current.close(); };
    }, [streamSignals, fetchStatsData, fetchDailySummary]);

    const loading = streaming && signals.length === 0;

    // Apply type filter
    const typeFilteredSignals = filter === 'all'
        ? signals
        : signals.filter(s => s.type === filter);

    // Apply search filter
    const filteredSignals = debouncedSearch.trim()
        ? typeFilteredSignals.filter(s => {
            const query = debouncedSearch.trim().toLowerCase();
            return (
                s.title.toLowerCase().includes(query) ||
                (s.titleEn && s.titleEn.toLowerCase().includes(query)) ||
                s.summary.toLowerCase().includes(query) ||
                (s.summaryEn && s.summaryEn.toLowerCase().includes(query)) ||
                (s.relatedSectors && s.relatedSectors.some(sec => sec.toLowerCase().includes(query))) ||
                (s.relatedRegions && s.relatedRegions.some(reg => reg.toLowerCase().includes(query)))
            );
        })
        : typeFilteredSignals;

    // Sort by impact score descending
    const sortedSignals = [...filteredSignals].sort((a, b) => b.impactScore - a.impactScore);

    // Split: featured (highest impact) vs rest
    const featuredSignal = sortedSignals[0] || null;
    const insightSignals = sortedSignals.slice(1);

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 animate-fadeIn">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-gray-900">إشارات السوق الذكية</h1>
                        <p className="text-sm text-gray-500 font-medium">تحليل فوري لأهم الفرص والمخاطر في السوق</p>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Database size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">مجموعات البيانات</p>
                        <p className="text-xl font-black text-gray-900">{stats.totalDatasets.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Zap size={20} className="text-purple-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">الإشارات النشطة</p>
                        <p className="text-xl font-black text-gray-900">{signals.length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <TrendingUp size={20} className="text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">فرص استثمارية</p>
                        <p className="text-xl font-black text-emerald-600">{signals.filter(s => s.type === 'opportunity').length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                        <AlertTriangle size={20} className="text-red-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">تنبيهات المخاطر</p>
                        <p className="text-xl font-black text-red-600">{signals.filter(s => s.type === 'risk').length}</p>
                    </div>
                </div>
            </div>

            {/* Economic Summary */}
            {dailySummary && <EconomicSummaryCard summary={dailySummary} />}

            {/* Search Bar - حقل بحث */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <Search size={18} className="text-slate-400" />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="ابحث عن إشارة، مؤشر، أو قطاع..."
                    className="w-full bg-slate-800 border border-slate-600 text-white placeholder-slate-400 rounded-xl pr-11 pl-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    dir="rtl"
                />
                {searchQuery && (
                    <button
                        onClick={() => { setSearchQuery(''); setDebouncedSearch(''); }}
                        className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Search result count */}
            {debouncedSearch.trim() && (
                <div className="flex items-center gap-2 mb-4 text-sm font-medium text-slate-500">
                    <Search size={14} />
                    <span>
                        {sortedSignals.length === 0
                            ? `لا توجد نتائج لـ "${debouncedSearch.trim()}"`
                            : `${sortedSignals.length} نتيجة لـ "${debouncedSearch.trim()}"`}
                    </span>
                </div>
            )}

            {/* Filters + Actions */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {[
                        { key: 'all' as const, label: 'الكل', count: signals.length, color: 'blue' },
                        { key: 'opportunity' as const, label: 'فرص', count: signals.filter(s => s.type === 'opportunity').length, color: 'green', icon: TrendingUp },
                        { key: 'watch' as const, label: 'مراقبة', count: signals.filter(s => s.type === 'watch').length, color: 'yellow', icon: Eye },
                        { key: 'risk' as const, label: 'مخاطر', count: signals.filter(s => s.type === 'risk').length, color: 'red', icon: AlertTriangle },
                    ].map(f => {
                        const active = filter === f.key;
                        const Icon = (f as any).icon;
                        return (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                    active
                                        ? `bg-${f.color === 'blue' ? 'blue' : f.color === 'green' ? 'emerald' : f.color === 'yellow' ? 'amber' : 'red'}-600 text-white shadow-lg`
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {Icon && <Icon size={14} />}
                                {f.label} ({f.count})
                            </button>
                        );
                    })}
                </div>
                <button
                    onClick={refreshData}
                    disabled={streaming}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                >
                    <RefreshCw size={14} className={streaming ? 'animate-spin' : ''} />
                    تحديث
                </button>
            </div>

            {/* Streaming indicator */}
            {streaming && signals.length > 0 && (
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-sm text-blue-600 font-medium">
                        <Wifi className="w-4 h-4 animate-pulse" />
                        <span>جاري تحميل المزيد...</span>
                    </div>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">جاري تحميل الإشارات...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-8 text-center">
                    <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-red-700 mb-2">خطأ في التحميل</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button onClick={refreshData} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors">
                        إعادة المحاولة
                    </button>
                </div>
            ) : sortedSignals.length === 0 ? (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-10 text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Sparkles size={36} className="text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">لا توجد إشارات حالياً</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        {stats.totalDatasets > 0
                            ? `لديك ${stats.totalDatasets.toLocaleString()} مجموعة بيانات جاهزة للتحليل. يمكنك توليد إشارات ذكية منها.`
                            : 'يمكنك توليد إشارات من البيانات الحقيقية'}
                    </p>
                    <button
                        onClick={generateSignals}
                        disabled={generating}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
                    >
                        {generating ? (
                            <><Loader2 size={20} className="animate-spin" /> جاري التوليد...</>
                        ) : (
                            <><Play size={20} /> توليد إشارات من البيانات الحقيقية</>
                        )}
                    </button>
                    <p className="text-xs text-gray-400 mt-4">سيتم تحليل البيانات من البوابة الوطنية للبيانات المفتوحة</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Featured Signal - الإشارة المميزة */}
                    {featuredSignal && (
                        <FeaturedSignalCard
                            signal={featuredSignal}
                            onClick={() => setSelectedSignal(featuredSignal)}
                        />
                    )}

                    {/* Smart Insights Grid - بطاقات الرؤى الذكية */}
                    {insightSignals.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Lightbulb size={18} className="text-amber-500" />
                                <h2 className="text-lg font-bold text-gray-800">رؤى ذكية</h2>
                                <span className="text-xs text-gray-400 font-medium">({insightSignals.length})</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {insightSignals.map(signal => (
                                    <SmartInsightCard
                                        key={signal.id}
                                        signal={signal}
                                        onClick={() => setSelectedSignal(signal)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* AI Disclaimer */}
            <div className="mt-8 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                        <Cpu size={20} className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 leading-relaxed">
                            <span className="font-bold text-gray-700">حول التحليلات: </span>
                            جميع الإشارات مولدة بالذكاء الاصطناعي من مصادر بيانات حكومية موثوقة. يتم توضيح المصادر والافتراضات وحدود كل تحليل بشفافية كاملة.
                        </p>
                    </div>
                    <div className="hidden sm:flex gap-1.5 shrink-0">
                        <span className="bg-white text-purple-700 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-purple-200">بيانات موثوقة</span>
                        <span className="bg-white text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-blue-200">تفسير شفاف</span>
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
