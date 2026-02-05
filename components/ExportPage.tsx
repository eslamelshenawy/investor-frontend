/**
 * ======================================
 * EXPORT PAGE - تصدير البيانات
 * ======================================
 *
 * Authenticated page for exporting data as CSV files.
 * Supports bulk export of datasets, signals, content,
 * entities, and individual dataset export by ID.
 */

import React, { useState, useCallback } from 'react';
import {
  Download,
  Database,
  Zap,
  FileText,
  Users,
  Table,
  Loader2,
  CheckCircle,
} from 'lucide-react';

// ============================================
// CONSTANTS
// ============================================

const API_BASE = import.meta.env.VITE_API_URL || '/api';

type ExportStatus = 'idle' | 'loading' | 'success';

interface ExportCardConfig {
  id: string;
  titleAr: string;
  descriptionAr: string;
  endpoint: string;
  filename: string;
  icon: React.ElementType;
  color: 'blue' | 'amber' | 'emerald' | 'purple';
}

// ============================================
// COLOR MAPS
// ============================================

const colorMap = {
  blue: {
    iconBg: 'bg-blue-500/20',
    iconText: 'text-blue-400',
    border: 'border-blue-500/30',
    button: 'from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400',
    ring: 'focus:ring-blue-500/40',
    successText: 'text-blue-400',
  },
  amber: {
    iconBg: 'bg-amber-500/20',
    iconText: 'text-amber-400',
    border: 'border-amber-500/30',
    button: 'from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400',
    ring: 'focus:ring-amber-500/40',
    successText: 'text-amber-400',
  },
  emerald: {
    iconBg: 'bg-emerald-500/20',
    iconText: 'text-emerald-400',
    border: 'border-emerald-500/30',
    button: 'from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400',
    ring: 'focus:ring-emerald-500/40',
    successText: 'text-emerald-400',
  },
  purple: {
    iconBg: 'bg-purple-500/20',
    iconText: 'text-purple-400',
    border: 'border-purple-500/30',
    button: 'from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400',
    ring: 'focus:ring-purple-500/40',
    successText: 'text-purple-400',
  },
};

// ============================================
// EXPORT CARD CONFIGURATIONS
// ============================================

const exportCards: ExportCardConfig[] = [
  {
    id: 'datasets',
    titleAr: 'مجموعات البيانات',
    descriptionAr: 'تصدير جميع مجموعات البيانات المتوفرة في المنصة بصيغة CSV شاملة جميع التفاصيل والبيانات الوصفية.',
    endpoint: '/export/datasets',
    filename: 'datasets.csv',
    icon: Database,
    color: 'blue',
  },
  {
    id: 'signals',
    titleAr: 'الإشارات الذكية',
    descriptionAr: 'تصدير جميع الإشارات والتنبيهات الذكية المولّدة من تحليل البيانات بصيغة CSV.',
    endpoint: '/export/signals',
    filename: 'signals.csv',
    icon: Zap,
    color: 'amber',
  },
  {
    id: 'content',
    titleAr: 'المحتوى المنشور',
    descriptionAr: 'تصدير جميع المحتوى المنشور على المنصة من تقارير ومقالات ومنشورات بصيغة CSV.',
    endpoint: '/export/content',
    filename: 'content.csv',
    icon: FileText,
    color: 'emerald',
  },
  {
    id: 'entities',
    titleAr: 'الجهات والخبراء',
    descriptionAr: 'تصدير قائمة الجهات والمنظمات والخبراء المسجلين في المنصة بصيغة CSV.',
    endpoint: '/export/entities',
    filename: 'entities.csv',
    icon: Users,
    color: 'purple',
  },
];

// ============================================
// MAIN COMPONENT
// ============================================

const ExportPage: React.FC = () => {
  const [statuses, setStatuses] = useState<Record<string, ExportStatus>>({});
  const [datasetId, setDatasetId] = useState('');
  const [datasetExportStatus, setDatasetExportStatus] = useState<ExportStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ------------------------------------------
  // Download helper
  // ------------------------------------------

  const downloadCSV = useCallback(async (endpoint: string, filename: string, statusKey?: string) => {
    const token = localStorage.getItem('investor_radar_auth_token');
    if (!token) {
      setErrorMsg('يرجى تسجيل الدخول أولاً');
      return;
    }

    // Set loading state
    if (statusKey) {
      setStatuses(prev => ({ ...prev, [statusKey]: 'loading' }));
    } else {
      setDatasetExportStatus('loading');
    }
    setErrorMsg(null);

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`فشل التحميل: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Set success state
      if (statusKey) {
        setStatuses(prev => ({ ...prev, [statusKey]: 'success' }));
        setTimeout(() => {
          setStatuses(prev => ({ ...prev, [statusKey]: 'idle' }));
        }, 3000);
      } else {
        setDatasetExportStatus('success');
        setTimeout(() => setDatasetExportStatus('idle'), 3000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء التحميل';
      setErrorMsg(message);
      if (statusKey) {
        setStatuses(prev => ({ ...prev, [statusKey]: 'idle' }));
      } else {
        setDatasetExportStatus('idle');
      }
    }
  }, []);

  // ------------------------------------------
  // Handlers
  // ------------------------------------------

  const handleCardExport = (card: ExportCardConfig) => {
    downloadCSV(card.endpoint, card.filename, card.id);
  };

  const handleDatasetExport = () => {
    const trimmed = datasetId.trim();
    if (!trimmed) {
      setErrorMsg('يرجى إدخال معرّف مجموعة البيانات');
      return;
    }
    downloadCSV(`/export/dataset/${encodeURIComponent(trimmed)}`, `dataset-${trimmed}.csv`);
  };

  // ------------------------------------------
  // Render
  // ------------------------------------------

  return (
    <div dir="rtl" className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ---- Header ---- */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 mb-4">
            <Download className="w-8 h-8 text-sky-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2">
            تصدير البيانات
          </h1>
          <p className="text-slate-400 text-lg">
            تحميل البيانات بصيغة CSV
          </p>
        </div>

        {/* ---- Error Banner ---- */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {errorMsg}
          </div>
        )}

        {/* ---- Export Cards Grid ---- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {exportCards.map(card => {
            const status = statuses[card.id] || 'idle';
            const colors = colorMap[card.color];
            const Icon = card.icon;

            return (
              <div
                key={card.id}
                className={`
                  relative rounded-2xl bg-slate-800 border border-slate-700
                  p-6 transition-all duration-300
                  hover:border-slate-600 hover:shadow-lg hover:shadow-black/20
                `}
              >
                {/* Card Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${colors.iconBg} ${colors.border} border mb-4`}>
                  <Icon className={`w-6 h-6 ${colors.iconText}`} />
                </div>

                {/* Card Title & Description */}
                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                  {card.titleAr}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  {card.descriptionAr}
                </p>

                {/* Download Button */}
                <button
                  onClick={() => handleCardExport(card)}
                  disabled={status === 'loading'}
                  className={`
                    w-full flex items-center justify-center gap-2
                    px-4 py-3 rounded-xl font-medium text-sm
                    text-white bg-gradient-to-l ${colors.button}
                    transition-all duration-200
                    focus:outline-none focus:ring-2 ${colors.ring}
                    disabled:opacity-60 disabled:cursor-not-allowed
                  `}
                >
                  {status === 'loading' && (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جارٍ التحميل...</span>
                    </>
                  )}
                  {status === 'success' && (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>تم التحميل بنجاح</span>
                    </>
                  )}
                  {status === 'idle' && (
                    <>
                      <Download className="w-4 h-4" />
                      <span>تحميل CSV</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* ---- Specific Dataset Export Section ---- */}
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30">
              <Table className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                تصدير مجموعة بيانات محددة
              </h2>
              <p className="text-sm text-slate-400">
                أدخل معرّف مجموعة البيانات لتصدير بياناتها بصيغة CSV
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <input
              type="text"
              value={datasetId}
              onChange={e => setDatasetId(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleDatasetExport();
              }}
              placeholder="معرّف مجموعة البيانات (Dataset ID)"
              className={`
                flex-1 px-4 py-3 rounded-xl
                bg-slate-900 border border-slate-600
                text-slate-100 placeholder-slate-500
                text-sm
                focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50
                transition-colors duration-200
              `}
            />
            <button
              onClick={handleDatasetExport}
              disabled={datasetExportStatus === 'loading'}
              className={`
                flex items-center justify-center gap-2
                px-6 py-3 rounded-xl font-medium text-sm
                text-white bg-gradient-to-l from-sky-600 to-sky-500
                hover:from-sky-500 hover:to-sky-400
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-sky-500/40
                disabled:opacity-60 disabled:cursor-not-allowed
                whitespace-nowrap
              `}
            >
              {datasetExportStatus === 'loading' && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ التحميل...</span>
                </>
              )}
              {datasetExportStatus === 'success' && (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>تم التحميل</span>
                </>
              )}
              {datasetExportStatus === 'idle' && (
                <>
                  <Download className="w-4 h-4" />
                  <span>تحميل CSV</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
