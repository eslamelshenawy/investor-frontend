/**
 * ======================================
 * CUSTOM REPORTS PAGE - التقارير المخصصة
 * ======================================
 *
 * EXPERT role page for creating, scheduling,
 * and managing custom investment reports.
 * Uses local state only (no backend endpoint yet).
 */

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Calendar,
  Download,
  Edit3,
  Trash2,
  Clock,
  CheckCircle,
  Send,
  FileBarChart,
  BookOpen,
  TrendingUp,
  PieChart,
  ChevronDown,
  X,
  Save,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

type ReportStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';

type ReportType =
  | 'QUARTERLY'
  | 'SECTOR'
  | 'INVESTMENT_OPPORTUNITIES'
  | 'MARKET_ANALYSIS';

type RecurringType = 'NONE' | 'WEEKLY' | 'MONTHLY';

interface KeyFinding {
  id: string;
  text: string;
}

interface Recommendation {
  id: string;
  text: string;
}

interface Report {
  id: string;
  title: string;
  type: ReportType;
  status: ReportStatus;
  createdAt: string;
  scheduledAt?: string;
  recurring: RecurringType;
  sectors: string[];
  dataSources: string[];
  content: string;
  keyFindings: KeyFinding[];
  recommendations: Recommendation[];
}

interface ReportFormData {
  title: string;
  type: ReportType;
  sectors: string[];
  dataSources: string[];
  content: string;
  keyFindings: KeyFinding[];
  recommendations: Recommendation[];
  publishMode: 'NOW' | 'SCHEDULE' | 'RECURRING';
  scheduledDate: string;
  scheduledTime: string;
  recurring: RecurringType;
}

// ============================================
// CONSTANTS
// ============================================

const REPORT_TYPE_MAP: Record<ReportType, string> = {
  QUARTERLY: 'تقرير فصلي',
  SECTOR: 'تقرير قطاعي',
  INVESTMENT_OPPORTUNITIES: 'تقرير فرص استثمارية',
  MARKET_ANALYSIS: 'تحليل سوق',
};

const REPORT_TYPE_ICON: Record<ReportType, React.ElementType> = {
  QUARTERLY: FileBarChart,
  SECTOR: PieChart,
  INVESTMENT_OPPORTUNITIES: TrendingUp,
  MARKET_ANALYSIS: BookOpen,
};

const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  DRAFT: {
    label: 'مسودة',
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
  },
  SCHEDULED: {
    label: 'مجدول',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-400',
  },
  PUBLISHED: {
    label: 'منشور',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-400',
  },
};

const AVAILABLE_SECTORS = [
  'البنوك',
  'الطاقة',
  'البتروكيماويات',
  'التأمين',
  'الاتصالات',
  'التجزئة',
  'العقارات',
  'الصحة',
  'التقنية',
  'الغذاء',
  'المواد الأساسية',
  'النقل',
  'المرافق العامة',
  'الإعلام',
];

const AVAILABLE_DATA_SOURCES = [
  { id: 'tadawul', label: 'تداول (السوق المالية السعودية)' },
  { id: 'sama', label: 'البنك المركزي السعودي' },
  { id: 'gstat', label: 'الهيئة العامة للإحصاء' },
  { id: 'cma', label: 'هيئة السوق المالية' },
  { id: 'argaam', label: 'أرقام' },
  { id: 'reuters', label: 'رويترز' },
  { id: 'bloomberg', label: 'بلومبيرغ' },
  { id: 'custom', label: 'مصادر مخصصة' },
];

interface TemplateConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  defaultType: ReportType;
  defaultSectors: string[];
  defaultSources: string[];
}

const REPORT_TEMPLATES: TemplateConfig[] = [
  {
    id: 'weekly-market',
    title: 'تقرير السوق الأسبوعي',
    description: 'ملخص أداء السوق والمؤشرات الرئيسية خلال الأسبوع',
    icon: TrendingUp,
    color: 'blue',
    defaultType: 'MARKET_ANALYSIS',
    defaultSectors: ['البنوك', 'الطاقة', 'البتروكيماويات'],
    defaultSources: ['tadawul', 'cma', 'argaam'],
  },
  {
    id: 'sector-analysis',
    title: 'تحليل قطاعي شامل',
    description: 'تحليل معمق لقطاع محدد مع توقعات الأداء المستقبلي',
    icon: PieChart,
    color: 'purple',
    defaultType: 'SECTOR',
    defaultSectors: [],
    defaultSources: ['tadawul', 'cma', 'reuters'],
  },
  {
    id: 'investment-opportunities',
    title: 'تقرير الفرص الاستثمارية',
    description: 'رصد أبرز الفرص الاستثمارية والتوصيات',
    icon: FileBarChart,
    color: 'emerald',
    defaultType: 'INVESTMENT_OPPORTUNITIES',
    defaultSectors: [],
    defaultSources: ['tadawul', 'argaam', 'bloomberg'],
  },
  {
    id: 'economic-indicators',
    title: 'ملخص المؤشرات الاقتصادية',
    description: 'متابعة المؤشرات الاقتصادية الكلية وتأثيرها على السوق',
    icon: BookOpen,
    color: 'amber',
    defaultType: 'MARKET_ANALYSIS',
    defaultSectors: [],
    defaultSources: ['sama', 'gstat', 'reuters', 'bloomberg'],
  },
];

// ============================================
// SEED DATA
// ============================================

const SEED_REPORTS: Report[] = [
  {
    id: '1',
    title: 'تقرير أداء قطاع البنوك - الربع الثالث 2025',
    type: 'QUARTERLY',
    status: 'PUBLISHED',
    createdAt: '2025-10-15T10:00:00Z',
    sectors: ['البنوك'],
    dataSources: ['tadawul', 'cma', 'argaam'],
    content: 'تحليل شامل لأداء قطاع البنوك خلال الربع الثالث...',
    keyFindings: [
      { id: 'f1', text: 'ارتفاع أرباح البنوك بنسبة 12% مقارنة بالربع السابق' },
      { id: 'f2', text: 'تحسن جودة الأصول مع انخفاض نسبة القروض المتعثرة' },
    ],
    recommendations: [
      { id: 'r1', text: 'الاستمرار في الاستثمار في البنوك الكبرى' },
    ],
    recurring: 'NONE',
  },
  {
    id: '2',
    title: 'فرص استثمارية في قطاع التقنية',
    type: 'INVESTMENT_OPPORTUNITIES',
    status: 'DRAFT',
    createdAt: '2025-11-01T08:30:00Z',
    sectors: ['التقنية', 'الاتصالات'],
    dataSources: ['tadawul', 'bloomberg'],
    content: 'استكشاف الفرص المتاحة في قطاع التقنية...',
    keyFindings: [
      { id: 'f3', text: 'نمو قطاع التقنية بنسبة 18% خلال العام الحالي' },
    ],
    recommendations: [],
    recurring: 'NONE',
  },
  {
    id: '3',
    title: 'التقرير الأسبوعي للسوق السعودي',
    type: 'MARKET_ANALYSIS',
    status: 'SCHEDULED',
    createdAt: '2025-11-10T14:00:00Z',
    scheduledAt: '2025-11-17T08:00:00Z',
    sectors: ['البنوك', 'الطاقة', 'البتروكيماويات'],
    dataSources: ['tadawul', 'cma', 'argaam'],
    content: 'ملخص تحركات السوق خلال الأسبوع...',
    keyFindings: [],
    recommendations: [],
    recurring: 'WEEKLY',
  },
];

// ============================================
// HELPERS
// ============================================

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function emptyFormData(): ReportFormData {
  return {
    title: '',
    type: 'MARKET_ANALYSIS',
    sectors: [],
    dataSources: [],
    content: '',
    keyFindings: [],
    recommendations: [],
    publishMode: 'NOW',
    scheduledDate: '',
    scheduledTime: '08:00',
    recurring: 'NONE',
  };
}

// ============================================
// SUB-COMPONENTS
// ============================================

/* ---------- Status Badge ---------- */
function StatusBadge({ status }: { status: ReportStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ---------- Sector Chip ---------- */
function SectorChip({
  label,
  removable,
  onRemove,
}: {
  label: string;
  removable?: boolean;
  onRemove?: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
      {label}
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:text-blue-900 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

/* ---------- Report Card ---------- */
function ReportCard({
  report,
  onEdit,
  onDelete,
  onSchedule,
}: {
  report: Report;
  onEdit: (r: Report) => void;
  onDelete: (id: string) => void;
  onSchedule: (r: Report) => void;
}) {
  const TypeIcon = REPORT_TYPE_ICON[report.type];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Card Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <TypeIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                {report.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {REPORT_TYPE_MAP[report.type]}
              </p>
            </div>
          </div>
          <StatusBadge status={report.status} />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-3">
        {/* Sectors */}
        {report.sectors.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {report.sectors.map((s) => (
              <SectorChip key={s} label={s} />
            ))}
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(report.createdAt)}
          </span>
          {report.scheduledAt && (
            <span className="flex items-center gap-1 text-amber-600">
              <Clock className="w-3.5 h-3.5" />
              {formatDateTime(report.scheduledAt)}
            </span>
          )}
        </div>

        {/* Recurring badge */}
        {report.recurring !== 'NONE' && (
          <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
            <Clock className="w-3 h-3" />
            {report.recurring === 'WEEKLY' ? 'أسبوعي' : 'شهري'}
          </span>
        )}

        {/* Key findings count */}
        {report.keyFindings.length > 0 && (
          <p className="text-xs text-gray-400">
            {report.keyFindings.length} نتائج رئيسية
          </p>
        )}
      </div>

      {/* Card Actions */}
      <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 rounded-b-xl flex items-center gap-2">
        <button
          onClick={() => onEdit(report)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          تعديل
        </button>
        {report.status === 'DRAFT' && (
          <button
            onClick={() => onSchedule(report)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            جدولة
          </button>
        )}
        <button
          onClick={() => {}}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          PDF
        </button>
        <button
          onClick={() => onDelete(report.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors mr-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ---------- Template Card ---------- */
function TemplateCard({
  template,
  onUse,
}: {
  template: TemplateConfig;
  onUse: (t: TemplateConfig) => void;
}) {
  const Icon = template.icon;
  const colorClasses: Record<string, { bg: string; icon: string; border: string; btn: string }> = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      border: 'border-blue-100',
      btn: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      border: 'border-purple-100',
      btn: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
    emerald: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      border: 'border-emerald-100',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    amber: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      border: 'border-amber-100',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
  };
  const c = colorClasses[template.color] || colorClasses.blue;

  return (
    <div
      className={`rounded-xl border ${c.border} ${c.bg} p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <h4 className="text-sm font-semibold text-gray-900">{template.title}</h4>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{template.description}</p>
      <button
        onClick={() => onUse(template)}
        className={`mt-auto self-start flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${c.btn}`}
      >
        <Plus className="w-3.5 h-3.5" />
        استخدام القالب
      </button>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function CustomReportsPage() {
  // ------ State ------
  const [reports, setReports] = useState<Report[]>(SEED_REPORTS);
  const [showModal, setShowModal] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [form, setForm] = useState<ReportFormData>(emptyFormData());
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'ALL'>('ALL');
  const [sectorDropdownOpen, setSectorDropdownOpen] = useState(false);
  const [newFinding, setNewFinding] = useState('');
  const [newRecommendation, setNewRecommendation] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ------ Derived ------
  const filteredReports =
    filterStatus === 'ALL'
      ? reports
      : reports.filter((r) => r.status === filterStatus);

  const counts = {
    ALL: reports.length,
    DRAFT: reports.filter((r) => r.status === 'DRAFT').length,
    SCHEDULED: reports.filter((r) => r.status === 'SCHEDULED').length,
    PUBLISHED: reports.filter((r) => r.status === 'PUBLISHED').length,
  };

  // ------ Handlers ------

  function openCreateModal() {
    setEditingReportId(null);
    setForm(emptyFormData());
    setNewFinding('');
    setNewRecommendation('');
    setShowModal(true);
  }

  function openEditModal(report: Report) {
    setEditingReportId(report.id);
    setForm({
      title: report.title,
      type: report.type,
      sectors: [...report.sectors],
      dataSources: [...report.dataSources],
      content: report.content,
      keyFindings: [...report.keyFindings],
      recommendations: [...report.recommendations],
      publishMode: report.status === 'SCHEDULED' ? 'SCHEDULE' : 'NOW',
      scheduledDate: report.scheduledAt
        ? new Date(report.scheduledAt).toISOString().slice(0, 10)
        : '',
      scheduledTime: report.scheduledAt
        ? new Date(report.scheduledAt).toTimeString().slice(0, 5)
        : '08:00',
      recurring: report.recurring,
    });
    setNewFinding('');
    setNewRecommendation('');
    setShowModal(true);
  }

  function openScheduleModal(report: Report) {
    openEditModal(report);
    // Pre-select schedule mode
    setForm((prev) => ({ ...prev, publishMode: 'SCHEDULE' }));
  }

  function closeModal() {
    setShowModal(false);
    setEditingReportId(null);
  }

  function handleFormChange(
    field: keyof ReportFormData,
    value: string | string[] | ReportType | RecurringType | KeyFinding[] | Recommendation[],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleSector(sector: string) {
    setForm((prev) => {
      const exists = prev.sectors.includes(sector);
      return {
        ...prev,
        sectors: exists
          ? prev.sectors.filter((s) => s !== sector)
          : [...prev.sectors, sector],
      };
    });
  }

  function toggleDataSource(sourceId: string) {
    setForm((prev) => {
      const exists = prev.dataSources.includes(sourceId);
      return {
        ...prev,
        dataSources: exists
          ? prev.dataSources.filter((s) => s !== sourceId)
          : [...prev.dataSources, sourceId],
      };
    });
  }

  function addFinding() {
    const text = newFinding.trim();
    if (!text) return;
    setForm((prev) => ({
      ...prev,
      keyFindings: [...prev.keyFindings, { id: generateId(), text }],
    }));
    setNewFinding('');
  }

  function removeFinding(id: string) {
    setForm((prev) => ({
      ...prev,
      keyFindings: prev.keyFindings.filter((f) => f.id !== id),
    }));
  }

  function addRecommendation() {
    const text = newRecommendation.trim();
    if (!text) return;
    setForm((prev) => ({
      ...prev,
      recommendations: [...prev.recommendations, { id: generateId(), text }],
    }));
    setNewRecommendation('');
  }

  function removeRecommendation(id: string) {
    setForm((prev) => ({
      ...prev,
      recommendations: prev.recommendations.filter((r) => r.id !== id),
    }));
  }

  function saveReport(asDraft: boolean) {
    if (!form.title.trim()) return;

    let status: ReportStatus = 'DRAFT';
    let scheduledAt: string | undefined;
    let recurring: RecurringType = 'NONE';

    if (!asDraft) {
      if (form.publishMode === 'NOW') {
        status = 'PUBLISHED';
      } else if (form.publishMode === 'SCHEDULE') {
        status = 'SCHEDULED';
        if (form.scheduledDate) {
          scheduledAt = new Date(
            `${form.scheduledDate}T${form.scheduledTime || '08:00'}`,
          ).toISOString();
        }
      } else if (form.publishMode === 'RECURRING') {
        status = 'SCHEDULED';
        recurring = form.recurring;
        if (form.scheduledDate) {
          scheduledAt = new Date(
            `${form.scheduledDate}T${form.scheduledTime || '08:00'}`,
          ).toISOString();
        }
      }
    }

    const reportData: Report = {
      id: editingReportId || generateId(),
      title: form.title,
      type: form.type,
      status,
      createdAt: editingReportId
        ? reports.find((r) => r.id === editingReportId)?.createdAt ||
          new Date().toISOString()
        : new Date().toISOString(),
      scheduledAt,
      recurring,
      sectors: form.sectors,
      dataSources: form.dataSources,
      content: form.content,
      keyFindings: form.keyFindings,
      recommendations: form.recommendations,
    };

    if (editingReportId) {
      setReports((prev) =>
        prev.map((r) => (r.id === editingReportId ? reportData : r)),
      );
    } else {
      setReports((prev) => [reportData, ...prev]);
    }

    closeModal();
  }

  function deleteReport(id: string) {
    setReports((prev) => prev.filter((r) => r.id !== id));
    setDeleteConfirmId(null);
  }

  function useTemplate(template: TemplateConfig) {
    setEditingReportId(null);
    setForm({
      ...emptyFormData(),
      title: template.title,
      type: template.defaultType,
      sectors: [...template.defaultSectors],
      dataSources: [...template.defaultSources],
    });
    setNewFinding('');
    setNewRecommendation('');
    setShowModal(true);
  }

  // ------ Render ------
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========== Header ========== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              التقارير المخصصة
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              إنشاء وجدولة تقارير استثمارية مفصلة
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 shadow-sm hover:shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            تقرير جديد
          </button>
        </div>

        {/* ========== Stat Summary ========== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {(
            [
              { key: 'ALL', label: 'الكل', icon: FileText, color: 'blue' },
              { key: 'DRAFT', label: 'مسودة', icon: Edit3, color: 'gray' },
              { key: 'SCHEDULED', label: 'مجدولة', icon: Clock, color: 'amber' },
              {
                key: 'PUBLISHED',
                label: 'منشورة',
                icon: CheckCircle,
                color: 'green',
              },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const isActive = filterStatus === item.key;
            const countVal = counts[item.key];
            return (
              <button
                key={item.key}
                onClick={() => setFilterStatus(item.key)}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-right ${
                  isActive
                    ? 'bg-white border-blue-200 shadow-sm ring-1 ring-blue-100'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.color === 'blue'
                      ? 'bg-blue-50'
                      : item.color === 'gray'
                        ? 'bg-gray-100'
                        : item.color === 'amber'
                          ? 'bg-amber-50'
                          : 'bg-green-50'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      item.color === 'blue'
                        ? 'text-blue-600'
                        : item.color === 'gray'
                          ? 'text-gray-500'
                          : item.color === 'amber'
                            ? 'text-amber-600'
                            : 'text-green-600'
                    }`}
                  />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{countVal}</p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ========== Reports Grid ========== */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            تقاريري
          </h2>
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {filterStatus === 'ALL'
                  ? 'لا توجد تقارير بعد. أنشئ تقريرك الأول!'
                  : 'لا توجد تقارير بهذه الحالة'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onEdit={openEditModal}
                  onDelete={(id) => setDeleteConfirmId(id)}
                  onSchedule={openScheduleModal}
                />
              ))}
            </div>
          )}
        </div>

        {/* ========== Report Templates ========== */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            قوالب التقارير
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            ابدأ من قالب جاهز لتوفير الوقت
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REPORT_TEMPLATES.map((tpl) => (
              <TemplateCard key={tpl.id} template={tpl} onUse={useTemplate} />
            ))}
          </div>
        </div>
      </div>

      {/* ========== Delete Confirmation ========== */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center" dir="rtl">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              حذف التقرير
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              هل أنت متأكد من حذف هذا التقرير؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => deleteReport(deleteConfirmId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== Create / Edit Modal ========== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-8 pb-8">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div
            dir="rtl"
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-4"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {editingReportId ? 'تعديل التقرير' : 'تقرير جديد'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  عنوان التقرير
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="أدخل عنوان التقرير..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  نوع التقرير
                </label>
                <div className="relative">
                  <select
                    value={form.type}
                    onChange={(e) =>
                      handleFormChange('type', e.target.value as ReportType)
                    }
                    className="w-full appearance-none px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pl-10"
                  >
                    {Object.entries(REPORT_TYPE_MAP).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Sectors Multi-select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  القطاعات
                </label>
                {/* Selected chips */}
                {form.sectors.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.sectors.map((s) => (
                      <SectorChip
                        key={s}
                        label={s}
                        removable
                        onRemove={() => toggleSector(s)}
                      />
                    ))}
                  </div>
                )}
                {/* Dropdown trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSectorDropdownOpen(!sectorDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white hover:border-gray-400 transition-colors"
                  >
                    <span className="text-gray-500">
                      {form.sectors.length > 0
                        ? `${form.sectors.length} قطاع محدد`
                        : 'اختر القطاعات...'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        sectorDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {sectorDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {AVAILABLE_SECTORS.map((sector) => {
                        const selected = form.sectors.includes(sector);
                        return (
                          <button
                            key={sector}
                            type="button"
                            onClick={() => toggleSector(sector)}
                            className={`w-full text-right px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                              selected
                                ? 'text-blue-600 bg-blue-50/50'
                                : 'text-gray-700'
                            }`}
                          >
                            {sector}
                            {selected && (
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Data Sources */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  مصادر البيانات
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_DATA_SOURCES.map((src) => {
                    const checked = form.dataSources.includes(src.id);
                    return (
                      <label
                        key={src.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                          checked
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleDataSource(src.id)}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                            checked
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {checked && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        {src.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  محتوى التقرير
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => handleFormChange('content', e.target.value)}
                  placeholder="اكتب محتوى التقرير هنا..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y transition-colors leading-relaxed"
                />
              </div>

              {/* Key Findings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  النتائج الرئيسية
                </label>
                {form.keyFindings.length > 0 && (
                  <ul className="space-y-2 mb-3">
                    {form.keyFindings.map((f) => (
                      <li
                        key={f.id}
                        className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-800"
                      >
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                        <span className="flex-1">{f.text}</span>
                        <button
                          onClick={() => removeFinding(f.id)}
                          className="text-green-400 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFinding}
                    onChange={(e) => setNewFinding(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFinding();
                      }
                    }}
                    placeholder="أضف نتيجة رئيسية..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <button
                    onClick={addFinding}
                    disabled={!newFinding.trim()}
                    className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  التوصيات
                </label>
                {form.recommendations.length > 0 && (
                  <ul className="space-y-2 mb-3">
                    {form.recommendations.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-800"
                      >
                        <Send className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                        <span className="flex-1">{r.text}</span>
                        <button
                          onClick={() => removeRecommendation(r.id)}
                          className="text-blue-400 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRecommendation}
                    onChange={(e) => setNewRecommendation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addRecommendation();
                      }
                    }}
                    placeholder="أضف توصية..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <button
                    onClick={addRecommendation}
                    disabled={!newRecommendation.trim()}
                    className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Schedule Options */}
              <div className="border-t border-gray-200 pt-5">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  خيارات النشر
                </label>
                <div className="space-y-3">
                  {/* Publish Now */}
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      form.publishMode === 'NOW'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="publishMode"
                      value="NOW"
                      checked={form.publishMode === 'NOW'}
                      onChange={() =>
                        setForm((prev) => ({ ...prev, publishMode: 'NOW' }))
                      }
                      className="accent-blue-600"
                    />
                    <Send className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        نشر فوري
                      </p>
                      <p className="text-xs text-gray-500">
                        نشر التقرير مباشرة بعد الحفظ
                      </p>
                    </div>
                  </label>

                  {/* Schedule */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      form.publishMode === 'SCHEDULE'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="publishMode"
                      value="SCHEDULE"
                      checked={form.publishMode === 'SCHEDULE'}
                      onChange={() =>
                        setForm((prev) => ({
                          ...prev,
                          publishMode: 'SCHEDULE',
                        }))
                      }
                      className="accent-amber-600 mt-1"
                    />
                    <Calendar className="w-4 h-4 text-amber-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        جدولة النشر
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        تحديد تاريخ ووقت نشر التقرير
                      </p>
                      {form.publishMode === 'SCHEDULE' && (
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={form.scheduledDate}
                            onChange={(e) =>
                              handleFormChange('scheduledDate', e.target.value)
                            }
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          />
                          <input
                            type="time"
                            value={form.scheduledTime}
                            onChange={(e) =>
                              handleFormChange('scheduledTime', e.target.value)
                            }
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          />
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Recurring */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      form.publishMode === 'RECURRING'
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="publishMode"
                      value="RECURRING"
                      checked={form.publishMode === 'RECURRING'}
                      onChange={() =>
                        setForm((prev) => ({
                          ...prev,
                          publishMode: 'RECURRING',
                        }))
                      }
                      className="accent-purple-600 mt-1"
                    />
                    <Clock className="w-4 h-4 text-purple-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        تكرار دوري
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        جدولة التقرير للنشر بشكل متكرر
                      </p>
                      {form.publishMode === 'RECURRING' && (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <select
                              value={form.recurring}
                              onChange={(e) =>
                                handleFormChange(
                                  'recurring',
                                  e.target.value as RecurringType,
                                )
                              }
                              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            >
                              <option value="NONE">اختر التكرار...</option>
                              <option value="WEEKLY">أسبوعي</option>
                              <option value="MONTHLY">شهري</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={form.scheduledDate}
                              onChange={(e) =>
                                handleFormChange(
                                  'scheduledDate',
                                  e.target.value,
                                )
                              }
                              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                            <input
                              type="time"
                              value={form.scheduledTime}
                              onChange={(e) =>
                                handleFormChange(
                                  'scheduledTime',
                                  e.target.value,
                                )
                              }
                              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-5 border-t border-gray-200 bg-gray-50/50 rounded-b-2xl">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                إلغاء
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => saveReport(true)}
                  disabled={!form.title.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  حفظ كمسودة
                </button>
                <button
                  onClick={() => saveReport(false)}
                  disabled={!form.title.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                >
                  {form.publishMode === 'NOW' ? (
                    <>
                      <Send className="w-4 h-4" />
                      نشر التقرير
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      جدولة التقرير
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
