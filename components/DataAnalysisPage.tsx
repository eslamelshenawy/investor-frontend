/**
 * Data Analysis Page - صفحة تحليل البيانات
 */

import React, { useState, useEffect } from 'react';
import {
    BarChart2,
    TrendingUp,
    TrendingDown,
    Activity,
    PieChart,
    Loader2,
    RefreshCw,
    Database,
    Zap,
    FileText,
    ArrowRight,
    Filter,
    Cloud,
    Globe,
    CheckCircle2
} from 'lucide-react';
import { api } from '../src/services/api';

interface SignalStats {
    total: number;
    byType: Record<string, number>;
    byTrend: Record<string, number>;
    avgImpact: number;
}

interface ContentStats {
    total: number;
    byType: Record<string, number>;
}

interface SyncStatus {
    architecture?: string;
    stats: {
        total: number;
        SUCCESS?: number;
        PENDING?: number;
        FAILED?: number;
        estimatedTotalRecords?: number;
    };
    note?: string;
}

const DataAnalysisPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [signalStats, setSignalStats] = useState<SignalStats | null>(null);
    const [contentStats, setContentStats] = useState<ContentStats | null>(null);
    const [datasets, setDatasets] = useState<any[]>([]);
    const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch signals
            const signalsRes = await api.getSignals({ limit: 100 });
            if (signalsRes.success && signalsRes.data) {
                const signals = signalsRes.data as any[];
                const stats: SignalStats = {
                    total: signals.length,
                    byType: {},
                    byTrend: {},
                    avgImpact: 0,
                };

                let totalImpact = 0;
                signals.forEach(s => {
                    stats.byType[s.type] = (stats.byType[s.type] || 0) + 1;
                    stats.byTrend[s.trend] = (stats.byTrend[s.trend] || 0) + 1;
                    totalImpact += s.impactScore || 0;
                });
                stats.avgImpact = signals.length > 0 ? Math.round(totalImpact / signals.length) : 0;
                setSignalStats(stats);
            }

            // Fetch content
            const contentRes = await api.getFeed({ limit: 100 });
            if (contentRes.success && contentRes.data) {
                const content = contentRes.data as any[];
                const stats: ContentStats = {
                    total: content.length,
                    byType: {},
                };
                content.forEach(c => {
                    stats.byType[c.type] = (stats.byType[c.type] || 0) + 1;
                });
                setContentStats(stats);
            }

            // Fetch datasets
            const datasetsRes = await api.getDatasets({ limit: 20 });
            if (datasetsRes.success && datasetsRes.data) {
                setDatasets(datasetsRes.data as any[]);
            }

            // Fetch sync status
            const syncRes = await api.getSyncStatus();
            if (syncRes.success && syncRes.data) {
                setSyncStatus(syncRes.data as SyncStatus);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const typeLabels: Record<string, string> = {
        'OPPORTUNITY': 'فرص',
        'RISK': 'مخاطر',
        'TREND': 'اتجاهات',
        'ALERT': 'تنبيهات',
        'ARTICLE': 'مقالات',
        'REPORT': 'تقارير',
        'NEWS': 'أخبار',
        'ANALYSIS': 'تحليلات',
        'INSIGHT': 'رؤى',
    };

    const trendLabels: Record<string, string> = {
        'UP': 'صاعد',
        'DOWN': 'هابط',
        'STABLE': 'مستقر',
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={48} className="animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                            <Activity size={24} className="text-purple-600" />
                        </div>
                        تحليل البيانات
                    </h1>
                    <p className="text-gray-500">نظرة شاملة على بيانات المنصة</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700"
                >
                    <RefreshCw size={18} />
                    تحديث
                </button>
            </div>

            {/* On-Demand Architecture Banner */}
            {syncStatus?.architecture === 'on-demand' && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 mb-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                        <Cloud size={24} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-emerald-800">المعمارية: On-Demand</h4>
                            <span className="text-xs bg-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full font-bold">نشط</span>
                        </div>
                        <p className="text-sm text-emerald-600">
                            {syncStatus.note || 'البيانات تُجلب عند الطلب من API - توفير 95% من مساحة التخزين'}
                        </p>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                        <div className="text-center">
                            <div className="text-2xl font-black text-emerald-700">{syncStatus.stats.total || 0}</div>
                            <div className="text-xs text-emerald-600">مجموعة بيانات</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-black text-emerald-700">38</div>
                            <div className="text-xs text-emerald-600">قسم متاح</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Zap size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">إجمالي الإشارات</p>
                            <p className="text-2xl font-black text-gray-900">{signalStats?.total || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <FileText size={24} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">إجمالي المحتوى</p>
                            <p className="text-2xl font-black text-gray-900">{contentStats?.total || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Database size={24} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">مجموعات البيانات</p>
                            <p className="text-2xl font-black text-gray-900">{datasets.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <TrendingUp size={24} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">متوسط التأثير</p>
                            <p className="text-2xl font-black text-gray-900">{signalStats?.avgImpact || 0}%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Signals by Type */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Zap size={20} className="text-blue-600" />
                        الإشارات حسب النوع
                    </h2>
                    <div className="space-y-3">
                        {signalStats && Object.entries(signalStats.byType).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <span className="font-medium text-gray-700">{typeLabels[type] || type}</span>
                                <span className="font-bold text-gray-900">{count}</span>
                            </div>
                        ))}
                        {(!signalStats || Object.keys(signalStats.byType).length === 0) && (
                            <p className="text-center text-gray-400 py-4">لا توجد بيانات</p>
                        )}
                    </div>
                </div>

                {/* Signals by Trend */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-green-600" />
                        الإشارات حسب الاتجاه
                    </h2>
                    <div className="space-y-3">
                        {signalStats && Object.entries(signalStats.byTrend).map(([trend, count]) => (
                            <div key={trend} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-2">
                                    {trend === 'UP' && <TrendingUp size={16} className="text-green-600" />}
                                    {trend === 'DOWN' && <TrendingDown size={16} className="text-red-600" />}
                                    {trend === 'STABLE' && <Activity size={16} className="text-yellow-600" />}
                                    <span className="font-medium text-gray-700">{trendLabels[trend] || trend}</span>
                                </div>
                                <span className="font-bold text-gray-900">{count}</span>
                            </div>
                        ))}
                        {(!signalStats || Object.keys(signalStats.byTrend).length === 0) && (
                            <p className="text-center text-gray-400 py-4">لا توجد بيانات</p>
                        )}
                    </div>
                </div>

                {/* Content by Type */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-purple-600" />
                        المحتوى حسب النوع
                    </h2>
                    <div className="space-y-3">
                        {contentStats && Object.entries(contentStats.byType).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <span className="font-medium text-gray-700">{typeLabels[type] || type}</span>
                                <span className="font-bold text-gray-900">{count}</span>
                            </div>
                        ))}
                        {(!contentStats || Object.keys(contentStats.byType).length === 0) && (
                            <p className="text-center text-gray-400 py-4">لا توجد بيانات</p>
                        )}
                    </div>
                </div>

                {/* Datasets */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Database size={20} className="text-amber-600" />
                            مجموعات البيانات المتاحة
                        </div>
                        {syncStatus?.architecture === 'on-demand' && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                <Cloud size={12} />
                                On-Demand
                            </span>
                        )}
                    </h2>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {datasets.map(ds => (
                            <div key={ds.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-700 text-sm truncate">{ds.nameAr || ds.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-400">{ds.category}</span>
                                        {ds.recordCount > 0 && (
                                            <span className="text-xs text-gray-400">• ~{ds.recordCount.toLocaleString('ar-SA')} سجل</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                                        ds.syncStatus === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {ds.syncStatus === 'SUCCESS' && <CheckCircle2 size={10} />}
                                        {ds.syncStatus === 'SUCCESS' ? 'جاهز' : ds.syncStatus}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {datasets.length === 0 && (
                            <p className="text-center text-gray-400 py-4">لا توجد بيانات</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataAnalysisPage;
