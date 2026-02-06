/**
 * Data Sources Page - مصادر البيانات
 * Dynamic page loading real source stats from API
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Globe, Building2, ExternalLink, Database, CheckCircle,
  Loader2, BarChart3, Shield, RefreshCw, TrendingUp, Server,
  Landmark, GraduationCap, HeartPulse, Scale, BookOpen, Atom,
  CloudSun, Banknote, HardHat
} from 'lucide-react';
import { api } from '../src/services/api';

// Map source names to icons and colors
const sourceMetadata: Record<string, { icon: React.ElementType; color: string; url?: string }> = {
  'open.data.gov.sa': { icon: Globe, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', url: 'https://open.data.gov.sa' },
  'الهيئة العامة للإحصاء': { icon: BarChart3, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', url: 'https://www.stats.gov.sa' },
  'وزارة الصحة': { icon: HeartPulse, color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', url: 'https://www.moh.gov.sa' },
  'وزارة العدل': { icon: Scale, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', url: 'https://www.moj.gov.sa' },
  'وزارة التعليم': { icon: GraduationCap, color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', url: 'https://www.moe.gov.sa' },
  'هيئة السوق المالية': { icon: TrendingUp, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', url: 'https://cma.org.sa' },
  'هيئة الرقابة النووية والإشعاعية': { icon: Atom, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', url: 'https://www.nrrc.gov.sa' },
  'المؤسسة العامة للتدريب التقني والمهني': { icon: HardHat, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', url: 'https://www.tvtc.gov.sa' },
  'الهيئة العامة للأرصاد وحماية البيئة': { icon: CloudSun, color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
  'جامعة الملك سعود': { icon: BookOpen, color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', url: 'https://www.ksu.edu.sa' },
  'وزارة المالية': { icon: Banknote, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', url: 'https://www.mof.gov.sa' },
  'مؤسسة النقد العربي السعودي': { icon: Landmark, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', url: 'https://www.sama.gov.sa' },
};

const defaultMeta = { icon: Building2, color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' };

interface SourceItem {
  name: string;
  count: number;
}

const DataSourcesPage = () => {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [totalSources, setTotalSources] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalDatasets, setTotalDatasets] = useState(0);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getSourceStats();
      if (res.success && res.data) {
        setSources(res.data.sources || []);
        setTotalSources(res.data.totalSources || 0);
        setLastUpdated(res.data.lastUpdated || '');
        setTotalDatasets((res.data.sources || []).reduce((sum: number, s: SourceItem) => sum + s.count, 0));
      }
    } catch {
      setError('فشل في تحميل بيانات المصادر');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (n: number) => n.toLocaleString('ar-SA');
  const formatDate = (d: string) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getPercentage = (count: number) => {
    if (!totalDatasets) return 0;
    return Math.round((count / totalDatasets) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100" dir="rtl">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#002B5C] via-[#003d7a] to-[#004d99] text-white py-14 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-40 h-40 border border-white/30 rounded-full" />
          <div className="absolute bottom-5 left-10 w-60 h-60 border border-white/20 rounded-full" />
          <div className="absolute top-20 left-1/3 w-20 h-20 border border-white/20 rounded-full" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-5 border border-white/20">
            <Database size={32} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3">مصادر البيانات</h1>
          <p className="text-white/70 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            جميع بياناتنا مستمدة من مصادر حكومية رسمية وموثوقة في المملكة العربية السعودية
          </p>

          {/* Stats badges */}
          {!loading && (
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3">
                <div className="text-2xl font-black">{formatNumber(totalDatasets)}</div>
                <div className="text-xs text-white/60 mt-0.5">مجموعة بيانات</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3">
                <div className="text-2xl font-black">{totalSources}</div>
                <div className="text-xs text-white/60 mt-0.5">مصدر بيانات</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3">
                <div className="text-2xl font-black flex items-center gap-1">
                  <Shield size={18} className="text-green-400" /> موثق
                </div>
                <div className="text-xs text-white/60 mt-0.5">بيانات حكومية رسمية</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
            <p className="text-gray-500 text-sm">جاري تحميل مصادر البيانات...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-16">
            <Database size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">{error}</p>
            <button onClick={loadSources} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition inline-flex items-center gap-2">
              <RefreshCw size={16} />
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Sources Grid */}
        {!loading && !error && sources.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">المصادر الحكومية</h2>
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
                const pct = getPercentage(source.count);

                return (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300 group">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${meta.color} transition-transform group-hover:scale-110`}>
                        <IconComp size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">{source.name}</h3>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-lg font-black text-blue-600">{formatNumber(source.count)}</span>
                          <span className="text-xs text-gray-400">مجموعة بيانات</span>
                          <span className="text-xs text-gray-300 mr-auto">{pct}%</span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-l from-blue-500 to-blue-400 transition-all duration-1000 ease-out"
                            style={{ width: `${Math.max(pct, 3)}%` }}
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

        <div className="text-center mt-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 transition font-medium">
            <ArrowLeft size={16} />
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DataSourcesPage;
