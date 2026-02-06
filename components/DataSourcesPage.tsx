/**
 * Data Sources Page - مصادر البيانات
 * Uses WebFlux SSE stream for real-time data loading
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Globe, Building2, ExternalLink, Database, CheckCircle,
  Loader2, BarChart3, Shield, RefreshCw, TrendingUp, Server,
  Landmark, GraduationCap, HeartPulse, Scale, BookOpen, Atom,
  CloudSun, Banknote, HardHat, Wifi, Users, Layers
} from 'lucide-react';
import { API_CONFIG } from '../src/core/config/app.config';

// Map source names to icons and colors
const sourceMetadata: Record<string, { icon: React.ElementType; color: string; url?: string }> = {
  'open.data.gov.sa': { icon: Globe, color: 'bg-green-100 text-green-600', url: 'https://open.data.gov.sa' },
  'الهيئة العامة للإحصاء': { icon: BarChart3, color: 'bg-blue-100 text-blue-600', url: 'https://www.stats.gov.sa' },
  'وزارة الصحة': { icon: HeartPulse, color: 'bg-rose-100 text-rose-600', url: 'https://www.moh.gov.sa' },
  'وزارة العدل': { icon: Scale, color: 'bg-purple-100 text-purple-600', url: 'https://www.moj.gov.sa' },
  'وزارة التعليم': { icon: GraduationCap, color: 'bg-cyan-100 text-cyan-600', url: 'https://www.moe.gov.sa' },
  'هيئة السوق المالية': { icon: TrendingUp, color: 'bg-amber-100 text-amber-600', url: 'https://cma.org.sa' },
  'هيئة الرقابة النووية والإشعاعية': { icon: Atom, color: 'bg-yellow-100 text-yellow-600', url: 'https://www.nrrc.gov.sa' },
  'المؤسسة العامة للتدريب التقني والمهني': { icon: HardHat, color: 'bg-orange-100 text-orange-600', url: 'https://www.tvtc.gov.sa' },
  'الهيئة العامة للأرصاد وحماية البيئة': { icon: CloudSun, color: 'bg-teal-100 text-teal-600' },
  'جامعة الملك سعود': { icon: BookOpen, color: 'bg-indigo-100 text-indigo-600', url: 'https://www.ksu.edu.sa' },
  'وزارة المالية': { icon: Banknote, color: 'bg-emerald-100 text-emerald-600', url: 'https://www.mof.gov.sa' },
  'مؤسسة النقد العربي السعودي': { icon: Landmark, color: 'bg-amber-100 text-amber-600', url: 'https://www.sama.gov.sa' },
};

const defaultMeta = { icon: Building2, color: 'bg-gray-100 text-gray-600' };

interface SourceItem {
  name: string;
  count: number;
  percentage: number;
}

interface OverviewData {
  totalCategories: number;
  totalSignals: number;
  totalUsers: number;
  totalDatasets: number;
}

const DataSourcesPage = () => {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [totalSources, setTotalSources] = useState(0);
  const [totalDatasets, setTotalDatasets] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [streaming, setStreaming] = useState(true);
  const [error, setError] = useState('');
  const [streamStatus, setStreamStatus] = useState<'connecting' | 'streaming' | 'complete' | 'error'>('connecting');
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    connectStream();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const connectStream = () => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setSources([]);
    setStreaming(true);
    setError('');
    setStreamStatus('connecting');
    setOverview(null);

    const url = `${API_CONFIG.baseUrl}/stats/sources/stream`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener('meta', (e) => {
      const data = JSON.parse(e.data);
      setTotalSources(data.totalSources);
      setTotalDatasets(data.totalDatasets);
      setLastUpdated(data.lastUpdated);
      setStreamStatus('streaming');
    });

    es.addEventListener('source', (e) => {
      const data = JSON.parse(e.data);
      setSources(prev => [...prev, {
        name: data.name,
        count: data.count,
        percentage: data.percentage
      }]);
    });

    es.addEventListener('overview', (e) => {
      const data = JSON.parse(e.data);
      setOverview(data);
    });

    es.addEventListener('complete', () => {
      setStreaming(false);
      setStreamStatus('complete');
      es.close();
    });

    es.addEventListener('error', (e) => {
      if ((e as any).data) {
        const data = JSON.parse((e as any).data);
        setError(data.message || 'فشل في تحميل البيانات');
      }
      setStreaming(false);
      setStreamStatus('error');
      es.close();
    });

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) return;
      setError('فشل الاتصال بالخادم');
      setStreaming(false);
      setStreamStatus('error');
      es.close();
    };
  };

  const formatNumber = (n: number) => n.toLocaleString('ar-SA');
  const formatDate = (d: string) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8" dir="rtl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Database size={22} className="text-blue-600" />
              </div>
              مصادر البيانات
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              جميع بياناتنا مستمدة من مصادر حكومية رسمية وموثوقة في المملكة العربية السعودية
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Stream status badge */}
            {streamStatus === 'connecting' && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                <Loader2 size={12} className="animate-spin" /> جاري الاتصال...
              </span>
            )}
            {streamStatus === 'streaming' && (
              <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
                <Wifi size={12} className="animate-pulse" /> بث مباشر
              </span>
            )}
            {streamStatus === 'complete' && (
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-100 px-3 py-1.5 rounded-full">
                <CheckCircle size={12} /> مكتمل
              </span>
            )}

            <button
              onClick={connectStream}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition"
            >
              <RefreshCw size={16} />
              تحديث
            </button>
          </div>
        </div>

        {/* Stats badges */}
        {totalDatasets > 0 && (
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3">
              <div className="text-2xl font-black text-gray-900">{formatNumber(totalDatasets)}</div>
              <div className="text-xs text-gray-400 mt-0.5">مجموعة بيانات</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3">
              <div className="text-2xl font-black text-gray-900">{totalSources}</div>
              <div className="text-xs text-gray-400 mt-0.5">مصدر بيانات</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 flex items-center gap-2">
              <Shield size={18} className="text-green-500" />
              <div>
                <div className="text-sm font-bold text-gray-900">بيانات موثقة</div>
                <div className="text-xs text-gray-400">مصادر حكومية رسمية</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        {/* Initial Loading */}
        {streaming && sources.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
            <p className="text-gray-500 text-sm">جاري تحميل مصادر البيانات عبر البث المباشر...</p>
          </div>
        )}

        {/* Error */}
        {error && sources.length === 0 && (
          <div className="text-center py-16">
            <Database size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">{error}</p>
            <button onClick={connectStream} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition inline-flex items-center gap-2">
              <RefreshCw size={16} />
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Sources Grid - streams in progressively */}
        {sources.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                المصادر الحكومية
                {streaming && <Loader2 size={16} className="inline-block mr-2 animate-spin text-blue-500" />}
              </h2>
              {lastUpdated && (
                <span className="text-xs text-gray-400">
                  آخر تحديث: {formatDate(lastUpdated)}
                </span>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {sources.map((source, i) => {
                const meta = sourceMetadata[source.name] || defaultMeta;
                const IconComp = meta.icon;

                return (
                  <div
                    key={source.name}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300 group animate-fadeIn"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${meta.color} transition-transform group-hover:scale-110`}>
                        <IconComp size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">{source.name}</h3>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-lg font-black text-blue-600">{formatNumber(source.count)}</span>
                          <span className="text-xs text-gray-400">مجموعة بيانات</span>
                          <span className="text-xs text-gray-300 mr-auto">{source.percentage}%</span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-l from-blue-500 to-blue-400 transition-all duration-1000 ease-out"
                            style={{ width: `${Math.max(source.percentage, 3)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {meta.url && (
                      <div className="mt-4 pt-3 border-t border-gray-50">
                        <a
                          href={meta.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition font-medium"
                        >
                          <ExternalLink size={12} />
                          زيارة الموقع الرسمي
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Overview Stats from stream */}
        {overview && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'مجموعات البيانات', value: formatNumber(overview.totalDatasets), icon: Database, color: 'text-blue-600 bg-blue-50' },
              { label: 'التصنيفات', value: formatNumber(overview.totalCategories), icon: Layers, color: 'text-purple-600 bg-purple-50' },
              { label: 'الإشارات النشطة', value: formatNumber(overview.totalSignals), icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
              { label: 'المستخدمين', value: formatNumber(overview.totalUsers), icon: Users, color: 'text-green-600 bg-green-50' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2 ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div className="text-xl font-black text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Verification Process */}
        <div className="mt-12 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Server size={20} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">آلية جمع وتحقق البيانات</h2>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: '1', title: 'الاكتشاف', desc: 'مسح دوري للمنصات الحكومية لاكتشاف بيانات جديدة', icon: Globe },
              { step: '2', title: 'المزامنة', desc: 'سحب البيانات عبر واجهات برمجة التطبيقات الرسمية', icon: RefreshCw },
              { step: '3', title: 'التحقق', desc: 'فحص سلامة البيانات والتأكد من الاتساق', icon: Shield },
              { step: '4', title: 'المعالجة', desc: 'تنظيف وتصنيف وإثراء بالتحليلات الذكية', icon: BarChart3 },
              { step: '5', title: 'العرض', desc: 'عرض في لوحات تفاعلية بتحديثات لحظية', icon: TrendingUp },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                  <item.icon size={24} className="text-blue-600" />
                </div>
                <div className="w-7 h-7 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold mb-2">
                  {item.step}
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Commitment */}
        <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle size={22} className="text-green-600" />
            التزامنا بجودة البيانات
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'نعرض فقط بيانات من مصادر حكومية رسمية ومعتمدة',
              'نذكر دائماً مصدر البيانات وتاريخ آخر تحديث',
              'نوفر إمكانية التصدير حتى تتمكن من التحقق بنفسك',
              'نبلّغ فوراً عن أي تأخير أو خلل في مزامنة البيانات',
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-2 bg-white/60 rounded-xl p-3">
                <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-700">{text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DataSourcesPage;
