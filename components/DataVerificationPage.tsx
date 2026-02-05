/**
 * Data Verification Page - مراجعة صحة البيانات
 * Expert role page for verifying dataset accuracy, updating metadata, and reporting issues
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Star,
  MessageSquare,
  Database,
  FileCheck,
  XCircle,
  ChevronDown,
  Eye,
  ThumbsUp,
} from 'lucide-react';
import api from '../src/services/api';

// ============================================
// TYPES
// ============================================

interface Dataset {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: string;
  organization: string;
  recordCount: number;
  updatedAt: string;
}

type VerificationStatus = 'verified' | 'pending' | 'issue';

interface VerificationInfo {
  status: VerificationStatus;
  rating?: number;
  verifiedAt?: string;
  verifiedBy?: string;
  issueType?: string;
  issueDescription?: string;
  issueSeverity?: string;
}

interface VerificationFormData {
  rating: number;
  completeness: boolean;
  timeliness: boolean;
  notes: string;
}

interface IssueFormData {
  type: string;
  description: string;
  severity: string;
}

type StatusFilter = 'all' | 'pending' | 'verified' | 'issue';

// ============================================
// CONSTANTS
// ============================================

const STATUS_CONFIG: Record<VerificationStatus, { label: string; icon: React.ElementType; color: string; bg: string; badge: string }> = {
  verified: {
    label: 'تم التحقق',
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  pending: {
    label: 'بانتظار المراجعة',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  issue: {
    label: 'يوجد مشاكل',
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    badge: 'bg-red-100 text-red-700 border-red-200',
  },
};

const ISSUE_TYPES = [
  { value: 'inaccurate', label: 'بيانات غير دقيقة' },
  { value: 'incomplete', label: 'بيانات ناقصة' },
  { value: 'outdated', label: 'بيانات قديمة' },
  { value: 'unreliable', label: 'مصدر غير موثوق' },
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'منخفض', color: 'bg-blue-100 text-blue-700' },
  { value: 'medium', label: 'متوسط', color: 'bg-amber-100 text-amber-700' },
  { value: 'high', label: 'مرتفع', color: 'bg-red-100 text-red-700' },
];

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: 'pending', label: 'بانتظار المراجعة' },
  { value: 'verified', label: 'تم التحقق' },
  { value: 'issue', label: 'يوجد مشاكل' },
];

// ============================================
// MOCK VERIFICATION DATA
// ============================================

const generateMockVerification = (datasetId: string): VerificationInfo => {
  const hash = datasetId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const mod = hash % 10;

  if (mod < 4) {
    return { status: 'pending' };
  } else if (mod < 8) {
    return {
      status: 'verified',
      rating: 3 + (hash % 3),
      verifiedAt: new Date(Date.now() - (hash % 30) * 86400000).toISOString(),
      verifiedBy: 'خبير البيانات',
    };
  } else {
    return {
      status: 'issue',
      issueType: ISSUE_TYPES[hash % ISSUE_TYPES.length].value,
      issueDescription: 'تم رصد مشكلة في هذه البيانات تحتاج لمراجعة',
      issueSeverity: SEVERITY_LEVELS[hash % SEVERITY_LEVELS.length].value,
    };
  }
};

// ============================================
// SUB-COMPONENTS
// ============================================

const StarRating: React.FC<{ rating: number; onChange: (r: number) => void; size?: number }> = ({
  rating,
  onChange,
  size = 24,
}) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1" dir="ltr">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            size={size}
            className={
              i <= (hovered || rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300'
            }
          />
        </button>
      ))}
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  bg: string;
}> = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>
      <Icon size={22} className={color} />
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

const DataVerificationPage: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [verifications, setVerifications] = useState<Record<string, VerificationInfo>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Modal state
  const [verifyModalDataset, setVerifyModalDataset] = useState<Dataset | null>(null);
  const [issueModalDataset, setIssueModalDataset] = useState<Dataset | null>(null);
  const [detailModalDataset, setDetailModalDataset] = useState<Dataset | null>(null);

  // Verification form
  const [verifyForm, setVerifyForm] = useState<VerificationFormData>({
    rating: 0,
    completeness: false,
    timeliness: false,
    notes: '',
  });

  // Issue form
  const [issueForm, setIssueForm] = useState<IssueFormData>({
    type: '',
    description: '',
    severity: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // ---- Data Fetching ----

  useEffect(() => {
    const fetchDatasets = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/datasets?limit=20');
        const items: Dataset[] = response.data ?? [];
        setDatasets(items);

        // Generate mock verification statuses
        const mockMap: Record<string, VerificationInfo> = {};
        items.forEach((ds) => {
          mockMap[ds.id] = generateMockVerification(ds.id);
        });
        setVerifications(mockMap);
      } catch (err) {
        console.error('Failed to fetch datasets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, []);

  // ---- Computed Values ----

  const filteredDatasets = datasets.filter((ds) => {
    const v = verifications[ds.id];
    if (!v) return false;

    // Status filter
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchTitle = ds.titleAr?.toLowerCase().includes(q) || ds.titleEn?.toLowerCase().includes(q);
      const matchOrg = ds.organization?.toLowerCase().includes(q);
      const matchCat = ds.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchOrg && !matchCat) return false;
    }

    return true;
  });

  const stats = {
    pending: Object.values(verifications).filter((v) => v.status === 'pending').length,
    verified: Object.values(verifications).filter((v) => v.status === 'verified').length,
    issues: Object.values(verifications).filter((v) => v.status === 'issue').length,
    total: Object.values(verifications).length,
  };

  const verificationRate = stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0;

  // ---- Handlers ----

  const handleVerifySubmit = () => {
    if (!verifyModalDataset || verifyForm.rating === 0) return;
    setSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setVerifications((prev) => ({
        ...prev,
        [verifyModalDataset.id]: {
          status: 'verified',
          rating: verifyForm.rating,
          verifiedAt: new Date().toISOString(),
          verifiedBy: 'المستخدم الحالي',
        },
      }));
      setSubmitting(false);
      setVerifyModalDataset(null);
      setVerifyForm({ rating: 0, completeness: false, timeliness: false, notes: '' });
    }, 800);
  };

  const handleIssueSubmit = () => {
    if (!issueModalDataset || !issueForm.type || !issueForm.severity) return;
    setSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setVerifications((prev) => ({
        ...prev,
        [issueModalDataset.id]: {
          status: 'issue',
          issueType: issueForm.type,
          issueDescription: issueForm.description,
          issueSeverity: issueForm.severity,
        },
      }));
      setSubmitting(false);
      setIssueModalDataset(null);
      setIssueForm({ type: '', description: '', severity: '' });
    }, 800);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // ---- Render ----

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#002B5C] to-[#004080] text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield size={28} className="text-white/80" />
            <h1 className="text-2xl md:text-3xl font-bold">مراجعة صحة البيانات</h1>
          </div>
          <p className="text-white/60 text-sm mr-10">
            تحقق من دقة البيانات وحدّث المعلومات الوصفية
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Clock}
            label="بحاجة لمراجعة"
            value={stats.pending}
            color="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            icon={CheckCircle}
            label="تم التحقق هذا الشهر"
            value={stats.verified}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            icon={AlertTriangle}
            label="مشاكل مبلّغة"
            value={stats.issues}
            color="text-red-600"
            bg="bg-red-50"
          />
          <StatCard
            icon={FileCheck}
            label="نسبة التحقق"
            value={`${verificationRate}%`}
            color="text-blue-600"
            bg="bg-blue-50"
          />
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن مجموعة بيانات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-gray-50"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-gray-100 transition-colors min-w-[180px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-500" />
                  <span className="text-gray-700">
                    {FILTER_OPTIONS.find((f) => f.value === statusFilter)?.label}
                  </span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {showFilterDropdown && (
                <div className="absolute top-full mt-1 right-0 w-full bg-white rounded-lg border border-gray-200 shadow-lg z-20 overflow-hidden">
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-right px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                        statusFilter === opt.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-400">
            عرض {filteredDatasets.length} من {datasets.length} مجموعة بيانات
          </div>
        </div>

        {/* Dataset Cards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-sm text-gray-500">جاري تحميل البيانات...</p>
          </div>
        ) : filteredDatasets.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <Database size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">لا توجد مجموعات بيانات تطابق معايير البحث</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDatasets.map((ds) => {
              const v = verifications[ds.id];
              if (!v) return null;
              const statusConf = STATUS_CONFIG[v.status];
              const StatusIcon = statusConf.icon;

              return (
                <div
                  key={ds.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Dataset Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${statusConf.bg}`}>
                          <Database size={18} className={statusConf.color} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm leading-relaxed truncate">
                            {ds.titleAr || ds.titleEn}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Shield size={12} />
                              المصدر: {ds.organization || 'غير محدد'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              آخر تحديث: {formatDate(ds.updatedAt)}
                            </span>
                            {ds.category && (
                              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                {ds.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConf.badge}`}
                      >
                        <StatusIcon size={14} />
                        {statusConf.label}
                      </span>

                      {v.status === 'verified' && v.rating && (
                        <div className="flex items-center gap-0.5" dir="ltr">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i <= v.rating!
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-200'
                              }
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {v.status !== 'verified' && (
                        <button
                          onClick={() => {
                            setVerifyForm({ rating: 0, completeness: false, timeliness: false, notes: '' });
                            setVerifyModalDataset(ds);
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          <ThumbsUp size={14} />
                          تحقق
                        </button>
                      )}
                      {v.status !== 'issue' && (
                        <button
                          onClick={() => {
                            setIssueForm({ type: '', description: '', severity: '' });
                            setIssueModalDataset(ds);
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                        >
                          <MessageSquare size={14} />
                          ابلاغ
                        </button>
                      )}
                      <button
                        onClick={() => setDetailModalDataset(ds)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <Eye size={14} />
                        تفاصيل
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* VERIFICATION MODAL */}
      {/* ============================================ */}
      {verifyModalDataset && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck size={20} className="text-emerald-600" />
                <h2 className="text-lg font-bold text-gray-900">التحقق من البيانات</h2>
              </div>
              <button
                onClick={() => setVerifyModalDataset(null)}
                className="p-1 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <XCircle size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Dataset Name */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">مجموعة البيانات</p>
                <p className="text-sm font-semibold text-gray-900">
                  {verifyModalDataset.titleAr || verifyModalDataset.titleEn}
                </p>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تقييم دقة البيانات
                </label>
                <StarRating rating={verifyForm.rating} onChange={(r) => setVerifyForm((f) => ({ ...f, rating: r }))} />
                {verifyForm.rating > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {verifyForm.rating === 1 && 'ضعيف جدا'}
                    {verifyForm.rating === 2 && 'ضعيف'}
                    {verifyForm.rating === 3 && 'مقبول'}
                    {verifyForm.rating === 4 && 'جيد'}
                    {verifyForm.rating === 5 && 'ممتاز'}
                  </p>
                )}
              </div>

              {/* Checks */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={verifyForm.completeness}
                    onChange={(e) => setVerifyForm((f) => ({ ...f, completeness: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">اكتمال البيانات</p>
                    <p className="text-xs text-gray-400">البيانات كاملة ولا تحتوي على نقص واضح</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={verifyForm.timeliness}
                    onChange={(e) => setVerifyForm((f) => ({ ...f, timeliness: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">حداثة البيانات</p>
                    <p className="text-xs text-gray-400">البيانات محدّثة وتعكس الوضع الحالي</p>
                  </div>
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ملاحظات</label>
                <textarea
                  value={verifyForm.notes}
                  onChange={(e) => setVerifyForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="أضف ملاحظاتك حول جودة البيانات..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setVerifyModalDataset(null)}
                className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors"
              >
                الغاء
              </button>
              <button
                onClick={handleVerifySubmit}
                disabled={verifyForm.rating === 0 || submitting}
                className="px-5 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle size={16} />
                )}
                تأكيد التحقق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* REPORT ISSUE MODAL */}
      {/* ============================================ */}
      {issueModalDataset && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-600" />
                <h2 className="text-lg font-bold text-gray-900">الابلاغ عن مشكلة</h2>
              </div>
              <button
                onClick={() => setIssueModalDataset(null)}
                className="p-1 rounded-lg hover:bg-red-100 transition-colors"
              >
                <XCircle size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Dataset Name */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">مجموعة البيانات</p>
                <p className="text-sm font-semibold text-gray-900">
                  {issueModalDataset.titleAr || issueModalDataset.titleEn}
                </p>
              </div>

              {/* Issue Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">نوع المشكلة</label>
                <div className="relative">
                  <select
                    value={issueForm.type}
                    onChange={(e) => setIssueForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 appearance-none bg-white pr-4 pl-10"
                  >
                    <option value="">اختر نوع المشكلة...</option>
                    {ISSUE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">وصف المشكلة</label>
                <textarea
                  value={issueForm.description}
                  onChange={(e) => setIssueForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="اشرح المشكلة بالتفصيل..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none"
                />
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">درجة الخطورة</label>
                <div className="flex gap-2">
                  {SEVERITY_LEVELS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setIssueForm((f) => ({ ...f, severity: s.value }))}
                      className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-medium border-2 transition-all ${
                        issueForm.severity === s.value
                          ? `${s.color} border-current ring-2 ring-current/20`
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setIssueModalDataset(null)}
                className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors"
              >
                الغاء
              </button>
              <button
                onClick={handleIssueSubmit}
                disabled={!issueForm.type || !issueForm.severity || submitting}
                className="px-5 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <AlertTriangle size={16} />
                )}
                ارسال البلاغ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* DETAILS MODAL */}
      {/* ============================================ */}
      {detailModalDataset && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="bg-blue-50 border-b border-blue-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={20} className="text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">تفاصيل مجموعة البيانات</h2>
              </div>
              <button
                onClick={() => setDetailModalDataset(null)}
                className="p-1 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <XCircle size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">الاسم</p>
                <p className="text-sm font-semibold text-gray-900">
                  {detailModalDataset.titleAr || detailModalDataset.titleEn}
                </p>
              </div>

              {detailModalDataset.descriptionAr && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">الوصف</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{detailModalDataset.descriptionAr}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">المصدر</p>
                  <p className="text-sm font-medium text-gray-900">{detailModalDataset.organization || 'غير محدد'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">التصنيف</p>
                  <p className="text-sm font-medium text-gray-900">{detailModalDataset.category || 'غير محدد'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">عدد السجلات</p>
                  <p className="text-sm font-medium text-gray-900">
                    {detailModalDataset.recordCount?.toLocaleString('ar-SA') || '---'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">آخر تحديث</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(detailModalDataset.updatedAt)}</p>
                </div>
              </div>

              {/* Verification Status Detail */}
              {(() => {
                const v = verifications[detailModalDataset.id];
                if (!v) return null;
                const conf = STATUS_CONFIG[v.status];
                const Icon = conf.icon;

                return (
                  <div className={`rounded-lg p-4 border ${conf.bg} border-opacity-50`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={16} className={conf.color} />
                      <p className={`text-sm font-semibold ${conf.color}`}>{conf.label}</p>
                    </div>
                    {v.status === 'verified' && (
                      <div className="text-xs text-gray-600 space-y-1">
                        {v.rating && (
                          <div className="flex items-center gap-1">
                            <span>التقييم:</span>
                            <div className="flex gap-0.5" dir="ltr">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={i <= v.rating! ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {v.verifiedAt && <p>تاريخ التحقق: {formatDate(v.verifiedAt)}</p>}
                        {v.verifiedBy && <p>بواسطة: {v.verifiedBy}</p>}
                      </div>
                    )}
                    {v.status === 'issue' && (
                      <div className="text-xs text-gray-600 space-y-1">
                        {v.issueType && (
                          <p>
                            نوع المشكلة:{' '}
                            {ISSUE_TYPES.find((t) => t.value === v.issueType)?.label || v.issueType}
                          </p>
                        )}
                        {v.issueDescription && <p>الوصف: {v.issueDescription}</p>}
                        {v.issueSeverity && (
                          <p>
                            الخطورة:{' '}
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                SEVERITY_LEVELS.find((s) => s.value === v.issueSeverity)?.color || ''
                              }`}
                            >
                              {SEVERITY_LEVELS.find((s) => s.value === v.issueSeverity)?.label || v.issueSeverity}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <div className="flex gap-2">
                {verifications[detailModalDataset.id]?.status !== 'verified' && (
                  <button
                    onClick={() => {
                      const ds = detailModalDataset;
                      setDetailModalDataset(null);
                      setVerifyForm({ rating: 0, completeness: false, timeliness: false, notes: '' });
                      setVerifyModalDataset(ds);
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                  >
                    <ThumbsUp size={14} />
                    تحقق
                  </button>
                )}
                {verifications[detailModalDataset.id]?.status !== 'issue' && (
                  <button
                    onClick={() => {
                      const ds = detailModalDataset;
                      setDetailModalDataset(null);
                      setIssueForm({ type: '', description: '', severity: '' });
                      setIssueModalDataset(ds);
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors flex items-center gap-1.5"
                  >
                    <MessageSquare size={14} />
                    ابلاغ
                  </button>
                )}
              </div>
              <button
                onClick={() => setDetailModalDataset(null)}
                className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors"
              >
                اغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click-away handler for filter dropdown */}
      {showFilterDropdown && (
        <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)} />
      )}
    </div>
  );
};

export default DataVerificationPage;
