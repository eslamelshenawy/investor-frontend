/**
 * Dataset Metadata Page - البيانات الوصفية (3 مستويات)
 * View and edit comprehensive metadata for datasets
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Shield,
  Cpu,
  Save,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Database,
  User,
  Tag,
  Clock,
  Lock,
  FileText,
  BarChart3,
  Edit3,
  Eye,
} from 'lucide-react';
import { api } from '../src/services/api';
import { useAuth } from '../contexts/AuthContext';

const FREQ_LABELS: Record<string, string> = {
  DAILY: 'يومي',
  WEEKLY: 'أسبوعي',
  MONTHLY: 'شهري',
  QUARTERLY: 'ربع سنوي',
  YEARLY: 'سنوي',
  ONCE: 'مرة واحدة',
  REAL_TIME: 'لحظي',
};

const SENSITIVITY_LABELS: Record<string, { label: string; color: string }> = {
  PUBLIC: { label: 'عام', color: 'emerald' },
  INTERNAL: { label: 'داخلي', color: 'blue' },
  CONFIDENTIAL: { label: 'سري', color: 'amber' },
  RESTRICTED: { label: 'مقيد', color: 'red' },
};

const RISK_LABELS: Record<string, { label: string; color: string }> = {
  LOW: { label: 'منخفض', color: 'emerald' },
  MEDIUM: { label: 'متوسط', color: 'amber' },
  HIGH: { label: 'مرتفع', color: 'orange' },
  CRITICAL: { label: 'حرج', color: 'red' },
};

const QualityBar = ({ label, value }: { label: string; value?: number | null }) => {
  const v = value ?? 0;
  const color = v >= 80 ? 'bg-emerald-500' : v >= 60 ? 'bg-amber-500' : v >= 40 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${v}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-700 w-10 text-left">{v}%</span>
    </div>
  );
};

const Section = ({ title, icon: Icon, children, defaultOpen = true }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className="text-blue-600" />
          <span className="font-bold text-gray-900 text-sm">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-50">{children}</div>}
    </div>
  );
};

const FieldRow = ({ label, value, badge }: { label: string; value?: string | number | null; badge?: { text: string; color: string } }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-500 font-medium">{label}</span>
    <div className="flex items-center gap-2">
      {badge && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-${badge.color}-100 text-${badge.color}-700`}>
          {badge.text}
        </span>
      )}
      <span className="text-sm text-gray-900 font-medium text-left max-w-[250px] truncate">
        {value ?? <span className="text-gray-300">—</span>}
      </span>
    </div>
  </div>
);

const DatasetMetadataPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});

  const isExpert = user && ['EXPERT', 'ADMIN', 'SUPER_ADMIN'].includes((user as any).role?.toUpperCase());

  useEffect(() => {
    if (id) loadMetadata();
  }, [id]);

  const loadMetadata = async () => {
    if (!id) return;
    setLoading(true);
    const res = await api.getDatasetMetadata(id);
    if (res.success && res.data) {
      setMetadata(res.data);
      // Flatten for form
      setForm({
        owner: res.data.businessMetadata.owner || '',
        ownerAr: res.data.businessMetadata.ownerAr || '',
        steward: res.data.businessMetadata.steward || '',
        stewardAr: res.data.businessMetadata.stewardAr || '',
        businessDomain: res.data.businessMetadata.businessDomain || '',
        tags: res.data.businessMetadata.tags || '[]',
        updateFrequency: res.data.businessMetadata.updateFrequency || '',
        license: res.data.businessMetadata.license || '',
        language: res.data.businessMetadata.language || 'ar',
        sensitivityLevel: res.data.governanceMetadata.sensitivityLevel || 'PUBLIC',
        completeness: res.data.governanceMetadata.completeness ?? '',
        accuracy: res.data.governanceMetadata.accuracy ?? '',
        timeliness: res.data.governanceMetadata.timeliness ?? '',
        consistency: res.data.governanceMetadata.consistency ?? '',
        riskLevel: res.data.governanceMetadata.riskLevel || 'LOW',
        complianceNotes: res.data.governanceMetadata.complianceNotes || '',
        retentionPolicy: res.data.governanceMetadata.retentionPolicy || '',
        accessRestrictions: res.data.governanceMetadata.accessRestrictions || '',
        hasPII: res.data.governanceMetadata.hasPII || false,
        formatType: res.data.technicalMetadata.formatType || '',
        encoding: res.data.technicalMetadata.encoding || 'UTF-8',
        fileSize: res.data.technicalMetadata.fileSize || '',
        dataLineage: res.data.technicalMetadata.dataLineage || '',
        apiEndpoint: res.data.technicalMetadata.apiEndpoint || '',
        schemaVersion: res.data.technicalMetadata.schemaVersion || '',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    const data: Record<string, any> = {};
    for (const [key, value] of Object.entries(form)) {
      if (value === '') {
        data[key] = null;
      } else if (['completeness', 'accuracy', 'timeliness', 'consistency'].includes(key)) {
        data[key] = value === '' ? null : Number(value);
      } else {
        data[key] = value;
      }
    }
    const res = await api.updateDatasetMetadata(id, data);
    setSaving(false);
    if (res.success) {
      setEditing(false);
      loadMetadata();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">مجموعة البيانات غير موجودة</p>
      </div>
    );
  }

  const biz = metadata.businessMetadata;
  const gov = metadata.governanceMetadata;
  const tech = metadata.technicalMetadata;
  const sensInfo = SENSITIVITY_LABELS[gov.sensitivityLevel || 'PUBLIC'] || SENSITIVITY_LABELS.PUBLIC;
  const riskInfo = RISK_LABELS[gov.riskLevel || 'LOW'] || RISK_LABELS.LOW;

  let tags: string[] = [];
  try { tags = JSON.parse(biz.tags || '[]'); } catch {}

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-lg transition-colors">
            <ArrowRight size={18} className="text-gray-500" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-black text-gray-900">{metadata.nameAr}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{metadata.name} · {metadata.category}</p>
          </div>
          {isExpert && (
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                editing
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : editing ? <Save size={14} /> : <Edit3 size={14} />}
              {editing ? 'حفظ التغييرات' : 'تعديل'}
            </button>
          )}
          {editing && (
            <button onClick={() => { setEditing(false); loadMetadata(); }} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200">
              إلغاء
            </button>
          )}
        </div>

        {/* Quality Overview Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-black text-blue-600">{gov.qualityScore ?? '—'}</p>
              <p className="text-[10px] text-gray-400 font-medium">جودة عامة</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-gray-900">{tech.recordCount?.toLocaleString()}</p>
              <p className="text-[10px] text-gray-400 font-medium">سجل</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-gray-900">{tech.columnCount}</p>
              <p className="text-[10px] text-gray-400 font-medium">عمود</p>
            </div>
            <div className="text-center">
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full bg-${sensInfo.color}-100 text-${sensInfo.color}-700`}>
                {sensInfo.label}
              </span>
              <p className="text-[10px] text-gray-400 font-medium mt-1">الحساسية</p>
            </div>
            <div className="text-center">
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full bg-${riskInfo.color}-100 text-${riskInfo.color}-700`}>
                {riskInfo.label}
              </span>
              <p className="text-[10px] text-gray-400 font-medium mt-1">المخاطر</p>
            </div>
          </div>
          <div className="space-y-2">
            <QualityBar label="الاكتمال" value={gov.completeness} />
            <QualityBar label="الدقة" value={gov.accuracy} />
            <QualityBar label="الحداثة" value={gov.timeliness} />
            <QualityBar label="الاتساق" value={gov.consistency} />
          </div>
        </div>

        <div className="space-y-3">
          {/* Level 1: Business Metadata */}
          <Section title="المستوى 1: البيانات التجارية" icon={Briefcase}>
            {editing ? (
              <div className="space-y-3 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">المالك (عربي)</label>
                    <input value={form.ownerAr} onChange={e => setForm({ ...form, ownerAr: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Owner (English)</label>
                    <input value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" dir="ltr" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">المشرف (عربي)</label>
                    <input value={form.stewardAr} onChange={e => setForm({ ...form, stewardAr: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Steward (English)</label>
                    <input value={form.steward} onChange={e => setForm({ ...form, steward: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" dir="ltr" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">المجال التجاري</label>
                    <input value={form.businessDomain} onChange={e => setForm({ ...form, businessDomain: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="مالية، عقارات، طاقة..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">تكرار التحديث</label>
                    <select value={form.updateFrequency} onChange={e => setForm({ ...form, updateFrequency: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="">غير محدد</option>
                      {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">الرخصة</label>
                    <input value={form.license} onChange={e => setForm({ ...form, license: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">اللغة</label>
                    <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="ar">العربية</option>
                      <option value="en">الإنجليزية</option>
                      <option value="ar,en">ثنائي اللغة</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">الوسوم (JSON Array)</label>
                  <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20" dir="ltr" placeholder='["tag1","tag2"]' />
                </div>
              </div>
            ) : (
              <div className="pt-3">
                <FieldRow label="الوصف" value={biz.descriptionAr || biz.description} />
                <FieldRow label="المالك" value={biz.ownerAr || biz.owner} />
                <FieldRow label="المشرف" value={biz.stewardAr || biz.steward} />
                <FieldRow label="المجال التجاري" value={biz.businessDomain} />
                <FieldRow label="تكرار التحديث" value={biz.updateFrequency ? FREQ_LABELS[biz.updateFrequency] || biz.updateFrequency : null} />
                <FieldRow label="الرخصة" value={biz.license} />
                <FieldRow label="اللغة" value={biz.language === 'ar' ? 'العربية' : biz.language === 'en' ? 'الإنجليزية' : biz.language} />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-3">
                    {tags.map((tag, i) => (
                      <span key={i} className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* Level 2: Governance / Quality / Risk */}
          <Section title="المستوى 2: الحوكمة والجودة والمخاطر" icon={Shield}>
            {editing ? (
              <div className="space-y-3 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">مستوى الحساسية</label>
                    <select value={form.sensitivityLevel} onChange={e => setForm({ ...form, sensitivityLevel: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      {Object.entries(SENSITIVITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">مستوى المخاطر</label>
                    <select value={form.riskLevel} onChange={e => setForm({ ...form, riskLevel: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      {Object.entries(RISK_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">الاكتمال %</label>
                    <input type="number" min="0" max="100" value={form.completeness} onChange={e => setForm({ ...form, completeness: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">الدقة %</label>
                    <input type="number" min="0" max="100" value={form.accuracy} onChange={e => setForm({ ...form, accuracy: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">الحداثة %</label>
                    <input type="number" min="0" max="100" value={form.timeliness} onChange={e => setForm({ ...form, timeliness: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">الاتساق %</label>
                    <input type="number" min="0" max="100" value={form.consistency} onChange={e => setForm({ ...form, consistency: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={form.hasPII} onChange={e => setForm({ ...form, hasPII: e.target.checked })} className="rounded border-gray-300" />
                    يحتوي بيانات شخصية (PII)
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">ملاحظات الامتثال</label>
                  <textarea value={form.complianceNotes} onChange={e => setForm({ ...form, complianceNotes: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-16 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">سياسة الاحتفاظ</label>
                    <input value={form.retentionPolicy} onChange={e => setForm({ ...form, retentionPolicy: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="مثال: 5 سنوات" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">قيود الوصول</label>
                    <input value={form.accessRestrictions} onChange={e => setForm({ ...form, accessRestrictions: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-3">
                <FieldRow label="مستوى الحساسية" badge={{ text: sensInfo.label, color: sensInfo.color }} value={null} />
                <FieldRow label="مستوى المخاطر" badge={{ text: riskInfo.label, color: riskInfo.color }} value={null} />
                <FieldRow label="بيانات شخصية (PII)" value={gov.hasPII ? 'نعم' : 'لا'} />
                <FieldRow label="حالة التحقق" value={gov.verificationStatus === 'VERIFIED' ? 'موثّق' : gov.verificationStatus === 'NEEDS_REVIEW' ? 'يحتاج مراجعة' : gov.verificationStatus === 'REJECTED' ? 'مرفوض' : 'غير محقق'} />
                <FieldRow label="ملاحظات الامتثال" value={gov.complianceNotes} />
                <FieldRow label="سياسة الاحتفاظ" value={gov.retentionPolicy} />
                <FieldRow label="قيود الوصول" value={gov.accessRestrictions} />
              </div>
            )}
          </Section>

          {/* Level 3: Technical Metadata */}
          <Section title="المستوى 3: البيانات التقنية" icon={Cpu}>
            {editing ? (
              <div className="space-y-3 pt-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">نوع التنسيق</label>
                    <select value={form.formatType} onChange={e => setForm({ ...form, formatType: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="">غير محدد</option>
                      <option value="CSV">CSV</option>
                      <option value="JSON">JSON</option>
                      <option value="XML">XML</option>
                      <option value="EXCEL">Excel</option>
                      <option value="API">API</option>
                      <option value="PDF">PDF</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">الترميز</label>
                    <select value={form.encoding} onChange={e => setForm({ ...form, encoding: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="UTF-8">UTF-8</option>
                      <option value="UTF-16">UTF-16</option>
                      <option value="ASCII">ASCII</option>
                      <option value="ISO-8859-1">ISO-8859-1</option>
                      <option value="WINDOWS-1256">Windows-1256 (Arabic)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">حجم الملف</label>
                    <input value={form.fileSize} onChange={e => setForm({ ...form, fileSize: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="مثال: 12.5 MB" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">إصدار المخطط</label>
                    <input value={form.schemaVersion} onChange={e => setForm({ ...form, schemaVersion: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" dir="ltr" placeholder="v1.0" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">رابط API</label>
                    <input value={form.apiEndpoint} onChange={e => setForm({ ...form, apiEndpoint: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" dir="ltr" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">أصل البيانات (Data Lineage)</label>
                  <textarea value={form.dataLineage} onChange={e => setForm({ ...form, dataLineage: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-16 resize-none" placeholder="من أين جاءت البيانات وكيف تم تحويلها" />
                </div>
              </div>
            ) : (
              <div className="pt-3">
                <FieldRow label="عدد السجلات" value={tech.recordCount?.toLocaleString()} />
                <FieldRow label="عدد الأعمدة" value={tech.columnCount} />
                <FieldRow label="نوع التنسيق" value={tech.formatType} />
                <FieldRow label="الترميز" value={tech.encoding} />
                <FieldRow label="حجم الملف" value={tech.fileSize} />
                <FieldRow label="إصدار المخطط" value={tech.schemaVersion} />
                <FieldRow label="رابط API" value={tech.apiEndpoint} />
                <FieldRow label="حالة المزامنة" value={tech.syncStatus === 'SYNCED' ? 'متزامن' : tech.syncStatus === 'FAILED' ? 'فشل' : 'في الانتظار'} />
                <FieldRow label="آخر مزامنة" value={tech.lastSyncAt ? new Date(tech.lastSyncAt).toLocaleDateString('ar-SA') : null} />
                {tech.dataLineage && (
                  <div className="pt-3">
                    <p className="text-xs text-gray-500 font-medium mb-1">أصل البيانات (Data Lineage)</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{tech.dataLineage}</p>
                  </div>
                )}
                {tech.dataDictionary && Array.isArray(tech.dataDictionary) && tech.dataDictionary.length > 0 && (
                  <div className="pt-3">
                    <p className="text-xs text-gray-500 font-medium mb-2">قاموس البيانات</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-right px-3 py-2 font-bold text-gray-600">العمود</th>
                            <th className="text-right px-3 py-2 font-bold text-gray-600">النوع</th>
                            <th className="text-right px-3 py-2 font-bold text-gray-600">الوصف</th>
                            <th className="text-right px-3 py-2 font-bold text-gray-600">مثال</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tech.dataDictionary.map((col: any, i: number) => (
                            <tr key={i} className="border-t border-gray-50">
                              <td className="px-3 py-2 font-mono text-gray-900">{col.name}</td>
                              <td className="px-3 py-2 text-gray-500">{col.type}</td>
                              <td className="px-3 py-2 text-gray-600">{col.description}</td>
                              <td className="px-3 py-2 text-gray-400 font-mono">{col.sample}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Section>
        </div>

        {/* Timestamps footer */}
        <div className="flex items-center justify-between text-[10px] text-gray-400 mt-4 px-1">
          <span>تاريخ الإنشاء: {new Date(metadata.createdAt).toLocaleDateString('ar-SA')}</span>
          <span>آخر تحديث: {new Date(metadata.updatedAt).toLocaleDateString('ar-SA')}</span>
        </div>
      </div>
    </div>
  );
};

export default DatasetMetadataPage;
