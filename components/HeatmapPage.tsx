/**
 * HEATMAP PAGE - خرائط الحرارة
 * تصور بصري لتوزيع البيانات والإشارات عبر القطاعات والمناطق والزمن
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Map,
  BarChart3,
  Clock,
  RefreshCw,
  Activity,
  Database,
  Signal,
  Zap,
  TrendingUp,
  Layers,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ============================================
// TYPES
// ============================================

interface SectorHeatmapItem {
  sector: string;
  datasetCount: number;
  signalCount: number;
  avgImpact: number;
}

interface RegionHeatmapItem {
  region: string;
  signalCount: number;
  avgImpact: number;
}

interface TemporalHeatmapItem {
  month: string;
  signalCount: number;
  datasetUpdates: number;
}

interface HeatmapData {
  sectorHeatmap: SectorHeatmapItem[];
  regionHeatmap: RegionHeatmapItem[];
  temporalHeatmap: TemporalHeatmapItem[];
  lastUpdated: string;
}

type TabKey = 'sector' | 'region' | 'temporal';

// ============================================
// COLOR HELPERS
// ============================================

function getIntensityStyle(value: number, max: number): { bg: string; text: string; badge: string } {
  if (max === 0) return { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-500', badge: 'bg-gray-100 text-gray-600' };
  const ratio = value / max;
  if (ratio >= 0.85) return { bg: 'bg-red-50 border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' };
  if (ratio >= 0.55) return { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' };
  if (ratio >= 0.25) return { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' };
  return { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-600', badge: 'bg-gray-100 text-gray-600' };
}

function getBarColor(value: number, max: number): string {
  if (max === 0) return 'bg-gray-300';
  const ratio = value / max;
  if (ratio >= 0.85) return 'bg-red-500';
  if (ratio >= 0.55) return 'bg-emerald-500';
  if (ratio >= 0.25) return 'bg-blue-500';
  return 'bg-gray-400';
}

function impactLabel(avg: number): { label: string; color: string } {
  if (avg >= 80) return { label: 'حرج', color: 'text-red-600 bg-red-50' };
  if (avg >= 60) return { label: 'مرتفع', color: 'text-amber-600 bg-amber-50' };
  if (avg >= 35) return { label: 'متوسط', color: 'text-blue-600 bg-blue-50' };
  return { label: 'منخفض', color: 'text-gray-500 bg-gray-50' };
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function monthLabel(ym: string): string {
  const monthNames: Record<string, string> = {
    '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل',
    '05': 'مايو', '06': 'يونيو', '07': 'يوليو', '08': 'أغسطس',
    '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر',
  };
  const [year, month] = ym.split('-');
  return `${monthNames[month] || month} ${year}`;
}

function monthShort(ym: string): string {
  const monthNames: Record<string, string> = {
    '01': 'ينا', '02': 'فبر', '03': 'مار', '04': 'أبر',
    '05': 'ماي', '06': 'يون', '07': 'يول', '08': 'أغس',
    '09': 'سبت', '10': 'أكت', '11': 'نوف', '12': 'ديس',
  };
  const [, month] = ym.split('-');
  return monthNames[month] || month;
}

// ============================================
// TAB CONFIG
// ============================================

const TABS: { key: TabKey; label: string; icon: React.ElementType; desc: string }[] = [
  { key: 'sector', label: 'قطاعي', icon: BarChart3, desc: 'توزيع البيانات حسب القطاعات' },
  { key: 'region', label: 'جغرافي', icon: Map, desc: 'التوزيع الجغرافي للإشارات' },
  { key: 'temporal', label: 'زمني', icon: Clock, desc: 'النشاط خلال 12 شهر' },
];

// ============================================
// SUB-COMPONENTS
// ============================================

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Legend() {
  const items = [
    { color: 'bg-gray-200', label: 'منخفض' },
    { color: 'bg-blue-400', label: 'متوسط' },
    { color: 'bg-emerald-400', label: 'مرتفع' },
    { color: 'bg-red-400', label: 'حرج' },
  ];
  return (
    <div className="flex items-center gap-4 justify-center mt-6 pt-5 border-t border-gray-100">
      <span className="text-xs text-gray-400 font-medium">مقياس الكثافة:</span>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-sm ${item.color}`} />
          <span className="text-xs text-gray-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Sector Heatmap ──────────────────────────────

function SectorGrid({ items }: { items: SectorHeatmapItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <BarChart3 size={40} className="mx-auto mb-3 opacity-40" />
        <p>لا توجد بيانات قطاعية متاحة</p>
      </div>
    );
  }

  const maxDatasets = Math.max(...items.map((i) => i.datasetCount), 1);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {items.map((item) => {
        const style = getIntensityStyle(item.datasetCount, maxDatasets);
        const widthPercent = Math.max((item.datasetCount / maxDatasets) * 100, 3);
        const impact = impactLabel(item.avgImpact);
        return (
          <div
            key={item.sector}
            className={`${style.bg} border rounded-xl p-4 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-default group`}
          >
            <h3 className="text-sm font-bold text-gray-800 truncate mb-3" title={item.sector}>
              {item.sector}
            </h3>
            {/* Mini bar */}
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all ${getBarColor(item.datasetCount, maxDatasets)}`}
                style={{ width: `${widthPercent}%` }}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                  <Database size={10} /> مجموعات بيانات
                </span>
                <span className={`text-sm font-bold ${style.text}`}>
                  {formatNumber(item.datasetCount)}
                </span>
              </div>
              {item.signalCount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Signal size={10} /> إشارات
                  </span>
                  <span className="text-sm font-semibold text-gray-700">{item.signalCount}</span>
                </div>
              )}
              {item.avgImpact > 0 && (
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[11px] text-gray-500">التأثير</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${impact.color}`}>
                    {item.avgImpact}% {impact.label}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Region Heatmap ──────────────────────────────

function RegionGrid({ items }: { items: RegionHeatmapItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Map size={40} className="mx-auto mb-3 opacity-40" />
        <p>لا توجد بيانات جغرافية متاحة</p>
      </div>
    );
  }

  const maxSignals = Math.max(...items.map((i) => i.signalCount), 1);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        const style = getIntensityStyle(item.signalCount, maxSignals);
        const impact = impactLabel(item.avgImpact);
        return (
          <div
            key={item.region}
            className={`${style.bg} border rounded-xl p-5 transition-all hover:shadow-md cursor-default`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Map size={16} className="text-gray-400" />
              <h3 className="text-sm font-bold text-gray-800">{item.region}</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">إشارات</span>
                <span className={`text-lg font-black ${style.text}`}>{item.signalCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">التأثير</span>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${impact.color}`}>
                  {item.avgImpact}% {impact.label}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Temporal Heatmap ────────────────────────────

function TemporalTimeline({ items }: { items: TemporalHeatmapItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Clock size={40} className="mx-auto mb-3 opacity-40" />
        <p>لا توجد بيانات زمنية متاحة</p>
      </div>
    );
  }

  const maxActivity = Math.max(...items.map((i) => i.signalCount + i.datasetUpdates), 1);
  const maxBarHeight = 140;

  return (
    <div className="space-y-8">
      {/* Bar chart */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
        <div className="flex items-end gap-3 justify-center overflow-x-auto pb-2" style={{ minHeight: maxBarHeight + 50 }}>
          {items.map((item) => {
            const total = item.signalCount + item.datasetUpdates;
            const height = Math.max((total / maxActivity) * maxBarHeight, 4);
            const signalH = total > 0 ? (item.signalCount / total) * height : 0;
            const datasetH = total > 0 ? (item.datasetUpdates / total) * height : 0;
            const hasActivity = total > 0;
            return (
              <div key={item.month} className="flex flex-col items-center gap-1.5 min-w-[48px] group">
                <span className={`text-[10px] font-bold transition-colors ${hasActivity ? 'text-gray-700' : 'text-gray-300'}`}>
                  {hasActivity ? formatNumber(total) : '0'}
                </span>
                <div className="flex flex-col-reverse rounded-t-lg overflow-hidden" style={{ height: `${height}px`, width: '32px' }}>
                  {datasetH > 0 && (
                    <div
                      className="w-full bg-blue-400 group-hover:bg-blue-500 transition-colors"
                      style={{ height: `${datasetH}px` }}
                      title={`تحديثات بيانات: ${formatNumber(item.datasetUpdates)}`}
                    />
                  )}
                  {signalH > 0 && (
                    <div
                      className="w-full bg-emerald-400 group-hover:bg-emerald-500 transition-colors"
                      style={{ height: `${signalH}px` }}
                      title={`إشارات: ${item.signalCount}`}
                    />
                  )}
                  {!hasActivity && (
                    <div className="w-full bg-gray-200 rounded-t" style={{ height: '4px' }} />
                  )}
                </div>
                <span className="text-[10px] text-gray-500 font-medium text-center leading-tight">
                  {monthShort(item.month)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Inline legend */}
        <div className="flex items-center gap-5 justify-center mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-400" />
            <span className="text-xs text-gray-500">إشارات</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-400" />
            <span className="text-xs text-gray-500">تحديثات بيانات</span>
          </div>
        </div>
      </div>

      {/* Monthly detail cards */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {items.map((item) => {
          const total = item.signalCount + item.datasetUpdates;
          const style = getIntensityStyle(total, maxActivity);
          return (
            <div
              key={item.month}
              className={`${style.bg} border rounded-xl p-3 text-center transition-all hover:shadow-sm cursor-default`}
            >
              <p className="text-[11px] text-gray-500 font-medium mb-1">{monthLabel(item.month)}</p>
              <p className={`text-xl font-black ${style.text}`}>{formatNumber(total)}</p>
              <p className="text-[10px] text-gray-400 mt-1">
                {item.signalCount} إشارة · {formatNumber(item.datasetUpdates)} تحديث
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

const HeatmapPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('sector');
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/heatmap`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const json = await response.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        throw new Error(json.error || 'Unknown error');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'فشل في تحميل البيانات';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <RefreshCw size={32} className="mx-auto mb-3 text-blue-500 animate-spin" />
          <p className="text-gray-500 text-sm">جاري تحميل خرائط الحرارة...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error && !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" dir="rtl">
        <div className="text-center max-w-md bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <Activity size={40} className="mx-auto mb-3 text-red-400" />
          <p className="text-gray-800 font-bold mb-2">تعذر تحميل البيانات</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => fetchData()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition-colors font-bold"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const totalDatasets = data?.sectorHeatmap.reduce((s, i) => s + i.datasetCount, 0) || 0;
  const totalSignals = data?.sectorHeatmap.reduce((s, i) => s + i.signalCount, 0) || 0;
  const totalSectors = data?.sectorHeatmap.length || 0;

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-bl from-blue-50 via-white to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Activity size={22} className="text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900">خرائط الحرارة</h1>
                  <p className="text-sm text-gray-500">تصور بصري لتوزيع البيانات والإشارات</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-xl transition-colors disabled:opacity-50 shadow-sm font-medium"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              تحديث
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            <StatCard icon={Layers} label="إجمالي القطاعات" value={String(totalSectors)} color="bg-blue-100 text-blue-600" />
            <StatCard icon={Database} label="مجموعات البيانات" value={formatNumber(totalDatasets)} color="bg-emerald-100 text-emerald-600" />
            <StatCard icon={Zap} label="الإشارات" value={String(totalSignals)} color="bg-amber-100 text-amber-600" />
            <StatCard icon={TrendingUp} label="آخر تحديث" value={data?.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString('ar-SA') : '-'} color="bg-purple-100 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl w-fit">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2 mr-2">
          {TABS.find(t => t.key === activeTab)?.desc}
        </p>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          {activeTab === 'sector' && (
            <>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">خريطة القطاعات</h2>
                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                  {totalSectors} قطاع
                </span>
              </div>
              <SectorGrid items={data?.sectorHeatmap || []} />
              <Legend />
            </>
          )}

          {activeTab === 'region' && (
            <>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">خريطة المناطق</h2>
                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                  {data?.regionHeatmap.length || 0} منطقة
                </span>
              </div>
              <RegionGrid items={data?.regionHeatmap || []} />
              <Legend />
            </>
          )}

          {activeTab === 'temporal' && (
            <>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">النشاط الزمني</h2>
                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                  آخر 12 شهر
                </span>
              </div>
              <TemporalTimeline items={data?.temporalHeatmap || []} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeatmapPage;
