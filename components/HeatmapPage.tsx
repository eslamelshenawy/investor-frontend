/**
 * HEATMAP PAGE - خرائط الحرارة
 * SSE-powered visualization - Dark theme
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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

type TabKey = 'sector' | 'region' | 'temporal';

// ============================================
// HELPERS
// ============================================

function getIntensityStyle(value: number, max: number) {
  if (max === 0) return { bg: 'bg-slate-800', border: 'border-slate-700', text: 'text-slate-400' };
  const ratio = value / max;
  if (ratio >= 0.85) return { bg: 'bg-red-950/60', border: 'border-red-800/50', text: 'text-red-400' };
  if (ratio >= 0.55) return { bg: 'bg-emerald-950/60', border: 'border-emerald-800/50', text: 'text-emerald-400' };
  if (ratio >= 0.25) return { bg: 'bg-blue-950/60', border: 'border-blue-800/50', text: 'text-blue-400' };
  return { bg: 'bg-slate-800/80', border: 'border-slate-700', text: 'text-slate-400' };
}

function getBarColor(value: number, max: number): string {
  if (max === 0) return 'bg-slate-600';
  const ratio = value / max;
  if (ratio >= 0.85) return 'bg-red-500';
  if (ratio >= 0.55) return 'bg-emerald-500';
  if (ratio >= 0.25) return 'bg-blue-500';
  return 'bg-slate-500';
}

function impactLabel(avg: number) {
  if (avg >= 80) return { label: 'حرج', color: 'text-red-400 bg-red-950/60' };
  if (avg >= 60) return { label: 'مرتفع', color: 'text-amber-400 bg-amber-950/60' };
  if (avg >= 35) return { label: 'متوسط', color: 'text-blue-400 bg-blue-950/60' };
  return { label: 'منخفض', color: 'text-slate-400 bg-slate-700' };
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function monthLabel(ym: string): string {
  const names: Record<string, string> = {
    '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل',
    '05': 'مايو', '06': 'يونيو', '07': 'يوليو', '08': 'أغسطس',
    '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر',
  };
  const [year, month] = ym.split('-');
  return `${names[month] || month} ${year}`;
}

function monthShort(ym: string): string {
  const names: Record<string, string> = {
    '01': 'ينا', '02': 'فبر', '03': 'مار', '04': 'أبر',
    '05': 'ماي', '06': 'يون', '07': 'يول', '08': 'أغس',
    '09': 'سبت', '10': 'أكت', '11': 'نوف', '12': 'ديس',
  };
  const [, month] = ym.split('-');
  return names[month] || month;
}

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'sector', label: 'قطاعي', icon: BarChart3 },
  { key: 'region', label: 'جغرافي', icon: Map },
  { key: 'temporal', label: 'زمني', icon: Clock },
];

// ============================================
// SUB-COMPONENTS
// ============================================

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xl font-black text-white">{value}</p>
        <p className="text-[11px] text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function Legend() {
  const items = [
    { color: 'bg-slate-500', label: 'منخفض' },
    { color: 'bg-blue-500', label: 'متوسط' },
    { color: 'bg-emerald-500', label: 'مرتفع' },
    { color: 'bg-red-500', label: 'حرج' },
  ];
  return (
    <div className="flex items-center gap-4 justify-center mt-5 pt-4 border-t border-slate-700/50">
      <span className="text-[11px] text-slate-500">مقياس الكثافة:</span>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-sm ${item.color}`} />
          <span className="text-[11px] text-slate-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Sector Grid ─────────────────────────────

function SectorGrid({ items }: { items: SectorHeatmapItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <BarChart3 size={36} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm">لا توجد بيانات قطاعية</p>
      </div>
    );
  }

  const maxDatasets = Math.max(...items.map((i) => i.datasetCount), 1);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {items.map((item) => {
        const style = getIntensityStyle(item.datasetCount, maxDatasets);
        const widthPct = Math.max((item.datasetCount / maxDatasets) * 100, 3);
        const impact = impactLabel(item.avgImpact);
        return (
          <div
            key={item.sector}
            className={`${style.bg} border ${style.border} rounded-xl p-4 transition-all hover:scale-[1.02] cursor-default`}
          >
            <h3 className="text-sm font-bold text-slate-200 truncate mb-3">{item.sector}</h3>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-3">
              <div className={`h-full rounded-full ${getBarColor(item.datasetCount, maxDatasets)}`} style={{ width: `${widthPct}%` }} />
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-1"><Database size={10} /> بيانات</span>
                <span className={`font-bold ${style.text}`}>{formatNumber(item.datasetCount)}</span>
              </div>
              {item.signalCount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-1"><Signal size={10} /> إشارات</span>
                  <span className="font-bold text-slate-300">{item.signalCount}</span>
                </div>
              )}
              {item.avgImpact > 0 && (
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500">التأثير</span>
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

// ── Region Grid ─────────────────────────────

function RegionGrid({ items }: { items: RegionHeatmapItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <Map size={36} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm">لا توجد بيانات جغرافية</p>
      </div>
    );
  }

  const maxSignals = Math.max(...items.map((i) => i.signalCount), 1);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((item) => {
        const style = getIntensityStyle(item.signalCount, maxSignals);
        const impact = impactLabel(item.avgImpact);
        return (
          <div key={item.region} className={`${style.bg} border ${style.border} rounded-xl p-4 transition-all hover:scale-[1.02] cursor-default`}>
            <div className="flex items-center gap-2 mb-3">
              <Map size={14} className="text-slate-500" />
              <h3 className="text-sm font-bold text-slate-200">{item.region}</h3>
            </div>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">إشارات</span>
                <span className={`text-base font-black ${style.text}`}>{item.signalCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">التأثير</span>
                <span className={`font-bold px-2 py-0.5 rounded-full ${impact.color}`}>
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

// ── Temporal Timeline ───────────────────────

function TemporalTimeline({ items }: { items: TemporalHeatmapItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <Clock size={36} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm">لا توجد بيانات زمنية</p>
      </div>
    );
  }

  const maxActivity = Math.max(...items.map((i) => i.signalCount + i.datasetUpdates), 1);
  const maxBarHeight = 120;

  return (
    <div className="space-y-6">
      {/* Bar chart */}
      <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/50">
        <div className="flex items-end gap-2.5 justify-center overflow-x-auto pb-2" style={{ minHeight: maxBarHeight + 40 }}>
          {items.map((item) => {
            const total = item.signalCount + item.datasetUpdates;
            const height = Math.max((total / maxActivity) * maxBarHeight, 4);
            const signalH = total > 0 ? (item.signalCount / total) * height : 0;
            const datasetH = total > 0 ? (item.datasetUpdates / total) * height : 0;
            return (
              <div key={item.month} className="flex flex-col items-center gap-1 min-w-[40px] group">
                <span className={`text-[10px] font-bold ${total > 0 ? 'text-slate-300' : 'text-slate-600'}`}>
                  {total > 0 ? formatNumber(total) : '0'}
                </span>
                <div className="flex flex-col-reverse rounded-t overflow-hidden" style={{ height: `${height}px`, width: '28px' }}>
                  {datasetH > 0 && (
                    <div className="w-full bg-blue-500 group-hover:bg-blue-400 transition-colors" style={{ height: `${datasetH}px` }} />
                  )}
                  {signalH > 0 && (
                    <div className="w-full bg-emerald-500 group-hover:bg-emerald-400 transition-colors" style={{ height: `${signalH}px` }} />
                  )}
                  {total === 0 && <div className="w-full bg-slate-700 rounded-t" style={{ height: '4px' }} />}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">{monthShort(item.month)}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-5 justify-center mt-3 pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span className="text-[11px] text-slate-400">إشارات</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
            <span className="text-[11px] text-slate-400">تحديثات بيانات</span>
          </div>
        </div>
      </div>

      {/* Monthly cards */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {items.map((item) => {
          const total = item.signalCount + item.datasetUpdates;
          const style = getIntensityStyle(total, maxActivity);
          return (
            <div key={item.month} className={`${style.bg} border ${style.border} rounded-xl p-3 text-center hover:scale-[1.02] transition-all cursor-default`}>
              <p className="text-[11px] text-slate-400 font-medium mb-1">{monthLabel(item.month)}</p>
              <p className={`text-lg font-black ${style.text}`}>{formatNumber(total)}</p>
              <p className="text-[10px] text-slate-500 mt-1">
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
// LOADING SKELETON
// ============================================

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-700" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-slate-700 rounded w-16" />
                <div className="h-3 bg-slate-700/50 rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6 animate-pulse">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-slate-700/50 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

const HeatmapPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('sector');
  const [sectorData, setSectorData] = useState<SectorHeatmapItem[]>([]);
  const [regionData, setRegionData] = useState<RegionHeatmapItem[]>([]);
  const [temporalData, setTemporalData] = useState<TemporalHeatmapItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionsLoaded, setSectionsLoaded] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connectStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setLoading(true);
    setError(null);
    setSectionsLoaded(0);

    const es = new EventSource(`${API_BASE}/heatmap/stream`);
    eventSourceRef.current = es;

    es.addEventListener('sector', (e) => {
      try {
        setSectorData(JSON.parse(e.data));
        setSectionsLoaded((p) => p + 1);
      } catch { /* ignore */ }
    });

    es.addEventListener('region', (e) => {
      try {
        setRegionData(JSON.parse(e.data));
        setSectionsLoaded((p) => p + 1);
      } catch { /* ignore */ }
    });

    es.addEventListener('temporal', (e) => {
      try {
        setTemporalData(JSON.parse(e.data));
        setSectionsLoaded((p) => p + 1);
      } catch { /* ignore */ }
    });

    es.addEventListener('meta', (e) => {
      try {
        const meta = JSON.parse(e.data);
        if (meta.lastUpdated) setLastUpdated(meta.lastUpdated);
      } catch { /* ignore */ }
    });

    es.addEventListener('complete', () => {
      setLoading(false);
      es.close();
    });

    es.addEventListener('error', (e) => {
      const data = (e as MessageEvent)?.data;
      if (data) {
        try {
          const parsed = JSON.parse(data);
          setError(parsed.message || 'فشل في تحميل البيانات');
        } catch {
          setError('فشل في تحميل البيانات');
        }
      }
      setLoading(false);
      es.close();
    });

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) {
        setLoading(false);
      } else {
        setError('فشل في الاتصال بالخادم');
        setLoading(false);
        es.close();
      }
    };
  }, []);

  useEffect(() => {
    connectStream();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connectStream]);

  const hasData = sectorData.length > 0 || regionData.length > 0 || temporalData.length > 0;
  const totalDatasets = sectorData.reduce((s, i) => s + i.datasetCount, 0);
  const totalSignals = sectorData.reduce((s, i) => s + i.signalCount, 0);
  const totalSectors = sectorData.length;

  return (
    <div className="min-h-screen bg-slate-900" dir="rtl">
      {/* ─── Header ─── */}
      <div className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Activity size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white">خرائط الحرارة</h1>
                <p className="text-[13px] text-slate-400 mt-0.5">تصور بصري لتوزيع البيانات والإشارات</p>
              </div>
            </div>
            <button
              onClick={connectStream}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              تحديث
            </button>
          </div>

          {/* Stats */}
          {hasData && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
              <StatCard icon={Layers} label="القطاعات" value={String(totalSectors)} color="bg-blue-500/20 text-blue-400" />
              <StatCard icon={Database} label="مجموعات البيانات" value={formatNumber(totalDatasets)} color="bg-emerald-500/20 text-emerald-400" />
              <StatCard icon={Zap} label="الإشارات" value={String(totalSignals)} color="bg-amber-500/20 text-amber-400" />
              <StatCard icon={TrendingUp} label="آخر تحديث" value={lastUpdated ? new Date(lastUpdated).toLocaleDateString('ar-SA') : '-'} color="bg-purple-500/20 text-purple-400" />
            </div>
          )}
        </div>
      </div>

      {/* ─── Tabs ─── */}
      {hasData && (
        <div className="border-b border-slate-800 sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex gap-1 py-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.key
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon size={15} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Content ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Loading */}
        {loading && !hasData && <LoadingSkeleton />}

        {/* Streaming progress */}
        {loading && sectionsLoaded > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <RefreshCw size={14} className="animate-spin text-blue-400" />
              <span>جاري تحميل البيانات... ({sectionsLoaded}/3)</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 mt-2 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(sectionsLoaded / 3) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && !hasData && (
          <div className="bg-slate-800 rounded-2xl border border-red-900/50 p-10 text-center max-w-md mx-auto mt-12">
            <div className="w-12 h-12 rounded-xl bg-red-950/60 flex items-center justify-center mx-auto mb-4">
              <Activity size={24} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">تعذر تحميل البيانات</h3>
            <p className="text-sm text-slate-400 mb-6">{error}</p>
            <button
              onClick={connectStream}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw size={15} />إعادة المحاولة
            </button>
          </div>
        )}

        {/* Data Sections */}
        {hasData && (
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 sm:p-6">
            {activeTab === 'sector' && (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold text-white">خريطة القطاعات</h2>
                  <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">{totalSectors} قطاع</span>
                </div>
                <SectorGrid items={sectorData} />
                <Legend />
              </>
            )}

            {activeTab === 'region' && (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold text-white">خريطة المناطق</h2>
                  <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">{regionData.length} منطقة</span>
                </div>
                <RegionGrid items={regionData} />
                <Legend />
              </>
            )}

            {activeTab === 'temporal' && (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold text-white">النشاط الزمني</h2>
                  <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">آخر 12 شهر</span>
                </div>
                <TemporalTimeline items={temporalData} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeatmapPage;
