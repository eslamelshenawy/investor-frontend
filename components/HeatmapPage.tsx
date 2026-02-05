/**
 * ======================================
 * HEATMAP PAGE - خرائط الحرارة
 * ======================================
 *
 * تصور بصري لتوزيع البيانات والإشارات عبر القطاعات والمناطق والزمن
 * Visual heatmap for datasets and signals across sectors, regions, and time
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Map,
  BarChart3,
  Clock,
  RefreshCw,
  Activity,
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

/**
 * Returns a Tailwind background class based on a normalized intensity value (0-100).
 * low = slate, medium = blue, high = emerald, critical = red
 */
function intensityBg(value: number, max: number): string {
  if (max === 0) return 'bg-slate-700';
  const ratio = value / max;
  if (ratio >= 0.85) return 'bg-red-500';
  if (ratio >= 0.55) return 'bg-emerald-500';
  if (ratio >= 0.25) return 'bg-blue-600';
  return 'bg-slate-700';
}

function intensityBorder(value: number, max: number): string {
  if (max === 0) return 'border-slate-600';
  const ratio = value / max;
  if (ratio >= 0.85) return 'border-red-400';
  if (ratio >= 0.55) return 'border-emerald-400';
  if (ratio >= 0.25) return 'border-blue-500';
  return 'border-slate-600';
}

function intensityText(value: number, max: number): string {
  if (max === 0) return 'text-slate-400';
  const ratio = value / max;
  if (ratio >= 0.85) return 'text-red-100';
  if (ratio >= 0.55) return 'text-emerald-100';
  if (ratio >= 0.25) return 'text-blue-100';
  return 'text-slate-300';
}

function impactLabel(avg: number): string {
  if (avg >= 80) return 'حرج';
  if (avg >= 60) return 'مرتفع';
  if (avg >= 35) return 'متوسط';
  return 'منخفض';
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function monthLabel(ym: string): string {
  const monthNames: Record<string, string> = {
    '01': 'يناير',
    '02': 'فبراير',
    '03': 'مارس',
    '04': 'أبريل',
    '05': 'مايو',
    '06': 'يونيو',
    '07': 'يوليو',
    '08': 'أغسطس',
    '09': 'سبتمبر',
    '10': 'أكتوبر',
    '11': 'نوفمبر',
    '12': 'ديسمبر',
  };
  const [year, month] = ym.split('-');
  return `${monthNames[month] || month} ${year}`;
}

// ============================================
// TAB CONFIG
// ============================================

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'sector', label: 'قطاعي', icon: BarChart3 },
  { key: 'region', label: 'جغرافي', icon: Map },
  { key: 'temporal', label: 'زمني', icon: Clock },
];

// ============================================
// SUB-COMPONENTS
// ============================================

function Legend() {
  const items = [
    { color: 'bg-slate-700', label: 'منخفض' },
    { color: 'bg-blue-600', label: 'متوسط' },
    { color: 'bg-emerald-500', label: 'مرتفع' },
    { color: 'bg-red-500', label: 'حرج' },
  ];
  return (
    <div className="flex items-center gap-4 justify-center mt-8 pt-6 border-t border-slate-700/60">
      <span className="text-xs text-slate-400">مقياس الكثافة:</span>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded ${item.color}`} />
          <span className="text-xs text-slate-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Sector Heatmap ──────────────────────────────────────────────────────────

function SectorGrid({ items }: { items: SectorHeatmapItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <BarChart3 size={40} className="mx-auto mb-3 opacity-40" />
        <p>لا توجد بيانات قطاعية متاحة</p>
      </div>
    );
  }

  const maxDatasets = Math.max(...items.map((i) => i.datasetCount), 1);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((item) => {
        const bg = intensityBg(item.datasetCount, maxDatasets);
        const border = intensityBorder(item.datasetCount, maxDatasets);
        const text = intensityText(item.datasetCount, maxDatasets);
        return (
          <div
            key={item.sector}
            className={`${bg} ${border} border rounded-xl p-4 transition-transform hover:scale-[1.03] hover:shadow-lg cursor-default`}
          >
            <h3 className={`text-sm font-bold truncate mb-2 ${text}`} title={item.sector}>
              {item.sector}
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-white/60">مجموعات بيانات</span>
                <span className="text-sm font-semibold text-white">
                  {formatNumber(item.datasetCount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-white/60">إشارات</span>
                <span className="text-sm font-semibold text-white">{item.signalCount}</span>
              </div>
              {item.avgImpact > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-white/60">التأثير</span>
                  <span className="text-xs font-medium text-white/80">
                    {item.avgImpact}% - {impactLabel(item.avgImpact)}
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

// ── Region Heatmap ──────────────────────────────────────────────────────────

function RegionGrid({ items }: { items: RegionHeatmapItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Map size={40} className="mx-auto mb-3 opacity-40" />
        <p>لا توجد بيانات جغرافية متاحة</p>
      </div>
    );
  }

  const maxSignals = Math.max(...items.map((i) => i.signalCount), 1);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((item) => {
        const bg = intensityBg(item.signalCount, maxSignals);
        const border = intensityBorder(item.signalCount, maxSignals);
        const text = intensityText(item.signalCount, maxSignals);
        return (
          <div
            key={item.region}
            className={`${bg} ${border} border rounded-xl p-4 transition-transform hover:scale-[1.03] hover:shadow-lg cursor-default`}
          >
            <h3 className={`text-sm font-bold truncate mb-2 ${text}`} title={item.region}>
              {item.region}
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-white/60">إشارات</span>
                <span className="text-sm font-semibold text-white">{item.signalCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-white/60">التأثير</span>
                <span className="text-xs font-medium text-white/80">
                  {item.avgImpact}% - {impactLabel(item.avgImpact)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Temporal Heatmap ────────────────────────────────────────────────────────

function TemporalTimeline({ items }: { items: TemporalHeatmapItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Clock size={40} className="mx-auto mb-3 opacity-40" />
        <p>لا توجد بيانات زمنية متاحة</p>
      </div>
    );
  }

  const maxActivity = Math.max(
    ...items.map((i) => i.signalCount + i.datasetUpdates),
    1
  );
  const maxBarHeight = 120; // px

  return (
    <div className="space-y-6">
      {/* Bar chart */}
      <div className="flex items-end gap-2 justify-center overflow-x-auto pb-2" style={{ minHeight: maxBarHeight + 60 }}>
        {items.map((item) => {
          const total = item.signalCount + item.datasetUpdates;
          const height = Math.max((total / maxActivity) * maxBarHeight, 4);
          const signalH = total > 0 ? (item.signalCount / total) * height : 0;
          const datasetH = total > 0 ? (item.datasetUpdates / total) * height : 0;
          return (
            <div key={item.month} className="flex flex-col items-center gap-1 min-w-[52px]">
              <span className="text-[10px] text-slate-400 font-medium">{total}</span>
              <div className="flex flex-col-reverse" style={{ height: `${height}px` }}>
                {datasetH > 0 && (
                  <div
                    className="w-8 bg-blue-600 rounded-t-sm"
                    style={{ height: `${datasetH}px` }}
                    title={`تحديثات بيانات: ${item.datasetUpdates}`}
                  />
                )}
                {signalH > 0 && (
                  <div
                    className="w-8 bg-emerald-500 rounded-t-sm"
                    style={{ height: `${signalH}px` }}
                    title={`إشارات: ${item.signalCount}`}
                  />
                )}
              </div>
              <span className="text-[10px] text-slate-500 text-center leading-tight whitespace-nowrap">
                {monthLabel(item.month)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Inline legend for temporal */}
      <div className="flex items-center gap-6 justify-center">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-xs text-slate-400">إشارات</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-600" />
          <span className="text-xs text-slate-400">تحديثات بيانات</span>
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {items.map((item) => {
          const total = item.signalCount + item.datasetUpdates;
          const bg = intensityBg(total, maxActivity);
          const border = intensityBorder(total, maxActivity);
          return (
            <div
              key={item.month}
              className={`${bg} ${border} border rounded-lg p-3 text-center cursor-default`}
            >
              <p className="text-xs text-white/70 mb-1">{monthLabel(item.month)}</p>
              <p className="text-lg font-bold text-white">{total}</p>
              <p className="text-[10px] text-white/50">
                {item.signalCount} إشارة | {item.datasetUpdates} تحديث
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
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

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

  // ── Loading State ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <RefreshCw size={32} className="mx-auto mb-3 text-blue-400 animate-spin" />
          <p className="text-slate-400 text-sm">جاري تحميل خرائط الحرارة...</p>
        </div>
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────────────────

  if (error && !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center" dir="rtl">
        <div className="text-center max-w-md">
          <Activity size={40} className="mx-auto mb-3 text-red-400" />
          <p className="text-slate-200 font-medium mb-2">تعذر تحميل البيانات</p>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => fetchData()}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // ── Main Render ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-bl from-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                  <Activity size={22} className="text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold text-slate-100">خرائط الحرارة</h1>
              </div>
              <p className="text-sm text-slate-400 mr-13">
                تصور بصري لتوزيع البيانات والإشارات
              </p>
            </div>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>تحديث</span>
            </button>
          </div>

          {/* Last updated */}
          {data?.lastUpdated && (
            <p className="text-[11px] text-slate-500 mt-3 mr-13">
              آخر تحديث: {new Date(data.lastUpdated).toLocaleString('ar-SA')}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 mt-6">
        <div className="flex gap-2 border-b border-slate-700/50 pb-px">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-blue-400 border border-slate-700 border-b-transparent -mb-px'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          {/* Tab title */}
          {activeTab === 'sector' && (
            <>
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-100 mb-1">خريطة القطاعات</h2>
                <p className="text-xs text-slate-400">
                  توزيع مجموعات البيانات والإشارات حسب القطاع - حجم الخلية يعكس عدد مجموعات البيانات ولونها يعكس الكثافة
                </p>
              </div>
              <SectorGrid items={data?.sectorHeatmap || []} />
            </>
          )}

          {activeTab === 'region' && (
            <>
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-100 mb-1">خريطة المناطق</h2>
                <p className="text-xs text-slate-400">
                  توزيع الإشارات ومتوسط التأثير حسب المنطقة الجغرافية
                </p>
              </div>
              <RegionGrid items={data?.regionHeatmap || []} />
            </>
          )}

          {activeTab === 'temporal' && (
            <>
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-100 mb-1">خريطة زمنية</h2>
                <p className="text-xs text-slate-400">
                  النشاط خلال آخر 12 شهر - الإشارات وتحديثات مجموعات البيانات
                </p>
              </div>
              <TemporalTimeline items={data?.temporalHeatmap || []} />
            </>
          )}

          {/* Color Legend */}
          {activeTab !== 'temporal' && <Legend />}
        </div>
      </div>
    </div>
  );
};

export default HeatmapPage;
