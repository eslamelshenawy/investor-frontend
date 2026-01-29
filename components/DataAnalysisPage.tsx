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
    Filter
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

const DataAnalysisPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [signalStats, setSignalStats] = useState<SignalStats | null>(null);
    const [contentStats, setContentStats] = useState<ContentStats | null>(null);
    const [datasets, setDatasets] = useState<any[]>([]);

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
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Database size={20} className="text-amber-600" />
                        مجموعات البيانات المتاحة
                    </h2>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {datasets.map(ds => (
                            <div key={ds.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-medium text-gray-700 text-sm">{ds.nameAr || ds.name}</p>
                                    <p className="text-xs text-gray-400">{ds.category}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${
                                    ds.syncStatus === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {ds.syncStatus === 'SUCCESS' ? 'متزامن' : ds.syncStatus}
                                </span>
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
