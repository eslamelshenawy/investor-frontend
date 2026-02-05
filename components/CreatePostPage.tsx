import React, { useState, useEffect, useCallback, KeyboardEvent } from 'react';
import {
  FileText, Send, Save, Eye, Tag, X, Loader2,
  BarChart3, AlertTriangle, GitCompare, Zap, Brain,
  TrendingUp, Database, Image, ArrowUpDown, Clock,
} from 'lucide-react';
import { api } from '../src/services/api';
import { useAuth } from '../contexts/AuthContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PostTypeInfo {
  id: string;
  label: string;
  labelEn: string;
}

// Type-specific metadata config
const TYPE_ICONS: Record<string, typeof FileText> = {
  ARTICLE: FileText,
  REPORT: FileText,
  ANALYSIS: Brain,
  INSIGHT: Zap,
  DEEP_INSIGHT: Brain,
  CHART: BarChart3,
  CHART_GRAPH: BarChart3,
  COMPARISON: GitCompare,
  HISTORICAL_COMPARE: Clock,
  DATA_HIGHLIGHT: Database,
  DATASET_HIGHLIGHT: Database,
  VISUAL: Image,
  VISUAL_CONTEXT: Image,
  INFOGRAPHIC: Image,
  SIGNAL_POST: TrendingUp,
  CONTEXT_ALERT: AlertTriangle,
  PROGRESS_DIST: ArrowUpDown,
  AI_SUMMARY: Brain,
  QUICK_METRIC: Zap,
  INTRO_INSIGHT: Zap,
};

// Types that need extra metadata fields
const TYPES_WITH_EXTRA_FIELDS = [
  'SIGNAL_POST', 'CHART_GRAPH', 'PROGRESS_DIST', 'HISTORICAL_COMPARE',
  'CONTEXT_ALERT', 'AI_SUMMARY', 'QUICK_METRIC', 'DATASET_HIGHLIGHT',
  'COMPARISON',
];

// Fallback types if API fails
const FALLBACK_TYPES: PostTypeInfo[] = [
  { id: 'ARTICLE', label: 'مقال', labelEn: 'Article' },
  { id: 'REPORT', label: 'تقرير', labelEn: 'Report' },
  { id: 'ANALYSIS', label: 'تحليل', labelEn: 'Analysis' },
  { id: 'INSIGHT', label: 'رؤية', labelEn: 'Insight' },
  { id: 'DEEP_INSIGHT', label: 'تحليل معمّق', labelEn: 'Deep Insight' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CreatePostPage: React.FC = () => {
  const { user } = useAuth();

  // Post types from API
  const [postTypes, setPostTypes] = useState<PostTypeInfo[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);

  // Form state
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [body, setBody] = useState('');
  const [bodyAr, setBodyAr] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [excerptAr, setExcerptAr] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Type-specific metadata
  const [metadata, setMetadata] = useState<Record<string, unknown>>({});

  // UI state
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch post types on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<PostTypeInfo[]>('/content/my/post-types');
        const types = Array.isArray(res) ? res : (res as any)?.data ?? [];
        if (!cancelled && types.length > 0) {
          setPostTypes(types);
          setType(types[0].id);
        } else if (!cancelled) {
          setPostTypes(FALLBACK_TYPES);
          setType(FALLBACK_TYPES[0].id);
        }
      } catch {
        if (!cancelled) {
          setPostTypes(FALLBACK_TYPES);
          setType(FALLBACK_TYPES[0].id);
        }
      } finally {
        if (!cancelled) setTypesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Reset metadata when type changes
  useEffect(() => {
    setMetadata({});
  }, [type]);

  // ---- Helpers ----

  const clearMessages = () => { setSuccessMsg(''); setErrorMsg(''); };

  const currentTypeLabel = postTypes.find(t => t.id === type)?.label ?? type;

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = tagInput.trim();
      if (trimmed && !tags.includes(trimmed)) {
        setTags((prev) => [...prev, trimmed]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const updateMeta = (key: string, value: unknown) => {
    setMetadata(prev => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setTitle(''); setTitleAr(''); setBody(''); setBodyAr('');
    setExcerpt(''); setExcerptAr(''); setTags([]); setMetadata({});
  };

  // ---- API actions ----

  const handleSaveDraft = useCallback(async () => {
    clearMessages();
    setLoading(true);
    try {
      await api.createContentPost({
        type, title, titleAr, body, bodyAr,
        excerpt: excerpt || undefined,
        excerptAr: excerptAr || undefined,
        tags,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      });
      setSuccessMsg('تم حفظ المسودة بنجاح');
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'حدث خطأ أثناء حفظ المسودة');
    } finally {
      setLoading(false);
    }
  }, [type, title, titleAr, body, bodyAr, excerpt, excerptAr, tags, metadata]);

  const handleSubmitForReview = useCallback(async () => {
    clearMessages();
    if (!titleAr.trim() || !bodyAr.trim()) {
      setErrorMsg('يرجى تعبئة العنوان والمحتوى بالعربية على الأقل');
      return;
    }
    setLoading(true);
    try {
      const post = await api.createContentPost({
        type, title, titleAr, body, bodyAr,
        excerpt: excerpt || undefined,
        excerptAr: excerptAr || undefined,
        tags,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      });
      await api.submitForReview((post as any).id);
      setSuccessMsg('تم إرسال المحتوى للمراجعة بنجاح');
      resetForm();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'حدث خطأ أثناء الإرسال');
    } finally {
      setLoading(false);
    }
  }, [type, title, titleAr, body, bodyAr, excerpt, excerptAr, tags, metadata]);

  // ---- Style ----

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition';

  // ---- Type-specific fields ----

  const renderTypeSpecificFields = () => {
    switch (type) {
      case 'QUICK_METRIC':
        return (
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-4">
            <p className="text-sm font-medium text-blue-800">حقول المؤشر السريع</p>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-gray-600">القيمة الرقمية</label>
                <input type="number" value={(metadata.value as string) ?? ''} onChange={e => updateMeta('value', e.target.value)} placeholder="1500" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">الوحدة</label>
                <input type="text" value={(metadata.unit as string) ?? ''} onChange={e => updateMeta('unit', e.target.value)} placeholder="ريال / % / نقطة" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">الاتجاه</label>
                <select value={(metadata.trend as string) ?? ''} onChange={e => updateMeta('trend', e.target.value)} className={inputClass}>
                  <option value="">اختر...</option>
                  <option value="UP">صاعد ↑</option>
                  <option value="DOWN">هابط ↓</option>
                  <option value="STABLE">مستقر →</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'CONTEXT_ALERT':
        return (
          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 space-y-4">
            <p className="text-sm font-medium text-amber-800">حقول التنبيه السياقي</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-gray-600">مستوى الأهمية</label>
                <select value={(metadata.severity as string) ?? 'medium'} onChange={e => updateMeta('severity', e.target.value)} className={inputClass}>
                  <option value="low">منخفض</option>
                  <option value="medium">متوسط</option>
                  <option value="high">عالي</option>
                  <option value="critical">حرج</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">القطاع المتأثر</label>
                <input type="text" value={(metadata.affectedSector as string) ?? ''} onChange={e => updateMeta('affectedSector', e.target.value)} placeholder="الطاقة، العقار..." className={inputClass} />
              </div>
            </div>
          </div>
        );

      case 'HISTORICAL_COMPARE':
        return (
          <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4 space-y-4">
            <p className="text-sm font-medium text-purple-800">حقول المقارنة التاريخية</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-gray-600">الفترة الأولى</label>
                <div className="flex gap-2">
                  <input type="date" value={(metadata.period1Start as string) ?? ''} onChange={e => updateMeta('period1Start', e.target.value)} className={inputClass} />
                  <input type="date" value={(metadata.period1End as string) ?? ''} onChange={e => updateMeta('period1End', e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">الفترة الثانية</label>
                <div className="flex gap-2">
                  <input type="date" value={(metadata.period2Start as string) ?? ''} onChange={e => updateMeta('period2Start', e.target.value)} className={inputClass} />
                  <input type="date" value={(metadata.period2End as string) ?? ''} onChange={e => updateMeta('period2End', e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'PROGRESS_DIST':
        return (
          <div className="rounded-xl border border-green-100 bg-green-50/50 p-4 space-y-4">
            <p className="text-sm font-medium text-green-800">حقول شريط التوزيع</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-gray-600">نوع العرض</label>
                <select value={(metadata.displayType as string) ?? 'progress'} onChange={e => updateMeta('displayType', e.target.value)} className={inputClass}>
                  <option value="progress">شريط تقدم</option>
                  <option value="distribution">توزيع نسبي</option>
                  <option value="comparison">مقارنة شرائح</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">القيمة الحالية (%)</label>
                <input type="number" min="0" max="100" value={(metadata.progressValue as string) ?? ''} onChange={e => updateMeta('progressValue', e.target.value)} placeholder="75" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-600">البيانات (قيم مفصولة بفاصلة)</label>
              <input type="text" value={(metadata.dataValues as string) ?? ''} onChange={e => updateMeta('dataValues', e.target.value)} placeholder="40,30,20,10" className={inputClass} />
            </div>
          </div>
        );

      case 'SIGNAL_POST':
        return (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-4">
            <p className="text-sm font-medium text-emerald-800">حقول الإشارة الذكية</p>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-gray-600">نوع الإشارة</label>
                <select value={(metadata.signalType as string) ?? ''} onChange={e => updateMeta('signalType', e.target.value)} className={inputClass}>
                  <option value="">اختر...</option>
                  <option value="OPPORTUNITY">فرصة</option>
                  <option value="RISK">مخاطر</option>
                  <option value="TREND">اتجاه</option>
                  <option value="ALERT">تنبيه</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">درجة التأثير (0-100)</label>
                <input type="number" min="0" max="100" value={(metadata.impactScore as string) ?? ''} onChange={e => updateMeta('impactScore', e.target.value)} placeholder="75" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">درجة الثقة (0-100)</label>
                <input type="number" min="0" max="100" value={(metadata.confidence as string) ?? ''} onChange={e => updateMeta('confidence', e.target.value)} placeholder="85" className={inputClass} />
              </div>
            </div>
          </div>
        );

      case 'CHART_GRAPH':
        return (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-4">
            <p className="text-sm font-medium text-indigo-800">حقول التحليل البصري</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-gray-600">نوع الرسم</label>
                <select value={(metadata.chartType as string) ?? ''} onChange={e => updateMeta('chartType', e.target.value)} className={inputClass}>
                  <option value="">اختر...</option>
                  <option value="line">خط</option>
                  <option value="bar">أعمدة</option>
                  <option value="pie">دائري</option>
                  <option value="area">مساحة</option>
                  <option value="scatter">نقطي</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">مصدر البيانات</label>
                <input type="text" value={(metadata.dataSourceLabel as string) ?? ''} onChange={e => updateMeta('dataSourceLabel', e.target.value)} placeholder="الهيئة العامة للإحصاء..." className={inputClass} />
              </div>
            </div>
          </div>
        );

      case 'AI_SUMMARY':
        return (
          <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4 space-y-4">
            <p className="text-sm font-medium text-violet-800">حقول ملخص الذكاء الاصطناعي</p>
            <div>
              <label className="mb-1 block text-xs text-gray-600">القطاع المستهدف</label>
              <select value={(metadata.targetSector as string) ?? ''} onChange={e => updateMeta('targetSector', e.target.value)} className={inputClass}>
                <option value="">عام</option>
                <option value="finance">المالية</option>
                <option value="economy">الاقتصاد</option>
                <option value="real_estate">العقار</option>
                <option value="energy">الطاقة</option>
                <option value="labor">سوق العمل</option>
                <option value="trade">التجارة</option>
                <option value="investment">الاستثمار</option>
                <option value="tech">التقنية</option>
              </select>
            </div>
          </div>
        );

      case 'DATASET_HIGHLIGHT':
        return (
          <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-4 space-y-4">
            <p className="text-sm font-medium text-cyan-800">حقول إبراز مجموعة البيانات</p>
            <div>
              <label className="mb-1 block text-xs text-gray-600">معرف مجموعة البيانات (Dataset ID)</label>
              <input type="text" value={(metadata.datasetId as string) ?? ''} onChange={e => updateMeta('datasetId', e.target.value)} placeholder="أدخل معرف مجموعة البيانات..." className={inputClass} />
            </div>
          </div>
        );

      case 'COMPARISON':
        return (
          <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4 space-y-4">
            <p className="text-sm font-medium text-orange-800">حقول المقارنة الرقمية</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-gray-600">العنصر الأول</label>
                <input type="text" value={(metadata.item1 as string) ?? ''} onChange={e => updateMeta('item1', e.target.value)} placeholder="مثلاً: الربع الأول 2025" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">العنصر الثاني</label>
                <input type="text" value={(metadata.item2 as string) ?? ''} onChange={e => updateMeta('item2', e.target.value)} placeholder="مثلاً: الربع الأول 2026" className={inputClass} />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ---- Preview ----

  const renderPreview = () => (
    <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
        {currentTypeLabel}
      </span>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{titleAr || '(بدون عنوان)'}</h2>
        {excerptAr && <p className="mt-2 text-sm leading-relaxed text-gray-500">{excerptAr}</p>}
        <div className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-gray-700">
          {bodyAr || '(لا يوجد محتوى)'}
        </div>
      </div>
      {(title || body) && (
        <div className="border-t border-gray-200 pt-4" dir="ltr">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          {excerpt && <p className="mt-1 text-sm leading-relaxed text-gray-500">{excerpt}</p>}
          <div className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-gray-700">{body}</div>
        </div>
      )}
      {Object.keys(metadata).length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs font-medium text-gray-500 mb-2">بيانات إضافية</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(metadata).filter(([, v]) => v).map(([k, v]) => (
              <span key={k} className="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                {k}: {String(v)}
              </span>
            ))}
          </div>
        </div>
      )}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4">
          {tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
              <Tag className="h-3 w-3" />{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  // ---- Main render ----

  if (typesLoading) {
    return (
      <div dir="rtl" className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="mr-3 text-gray-500">جارٍ تحميل أنواع المحتوى...</span>
      </div>
    );
  }

  return (
    <div dir="rtl" className="px-4 py-6 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">إنشاء محتوى جديد</h1>
            <p className="text-sm text-gray-500">
              {postTypes.length} نوع متاح لدورك ({(user as any)?.role ?? 'USER'})
            </p>
          </div>
        </div>

        {/* Messages */}
        {successMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="mr-auto"><X className="h-4 w-4" /></button>
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="mr-auto"><X className="h-4 w-4" /></button>
          </div>
        )}

        {/* Preview toggle */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setPreview((p) => !p)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
          >
            <Eye className="h-4 w-4" />
            {preview ? 'العودة للتحرير' : 'معاينة'}
          </button>
        </div>

        {preview ? renderPreview() : (
          <div className="space-y-6">
            {/* Post type selector - visual grid */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">نوع المحتوى</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {postTypes.map((pt) => {
                  const Icon = TYPE_ICONS[pt.id] ?? FileText;
                  const isActive = type === pt.id;
                  return (
                    <button
                      key={pt.id}
                      onClick={() => setType(pt.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-center transition-all ${
                        isActive
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className="text-xs font-medium leading-tight">{pt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Type-specific fields */}
            {TYPES_WITH_EXTRA_FIELDS.includes(type) && renderTypeSpecificFields()}

            {/* Title (Arabic + English) */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  العنوان بالعربية <span className="text-red-500">*</span>
                </label>
                <input type="text" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} placeholder="أدخل العنوان بالعربية..." className={inputClass} />
              </div>
              <div dir="ltr">
                <label className="mb-1.5 block text-right text-sm font-medium text-gray-700">العنوان بالإنجليزية</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter English title..." className={inputClass} />
              </div>
            </div>

            {/* Body (Arabic + English) */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  المحتوى بالعربية <span className="text-red-500">*</span>
                </label>
                <textarea value={bodyAr} onChange={(e) => setBodyAr(e.target.value)} placeholder="اكتب المحتوى بالعربية..." rows={10} className={inputClass + ' resize-y'} />
              </div>
              <div dir="ltr">
                <label className="mb-1.5 block text-right text-sm font-medium text-gray-700">المحتوى بالإنجليزية</label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write English content..." rows={10} className={inputClass + ' resize-y'} />
              </div>
            </div>

            {/* Excerpts (Arabic + English) */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  المقتطف بالعربية <span className="text-xs text-gray-400">(اختياري)</span>
                </label>
                <textarea value={excerptAr} onChange={(e) => setExcerptAr(e.target.value)} placeholder="ملخص قصير بالعربية..." rows={3} className={inputClass + ' resize-y'} />
              </div>
              <div dir="ltr">
                <label className="mb-1.5 block text-right text-sm font-medium text-gray-700">
                  المقتطف بالإنجليزية <span className="text-xs text-gray-400">(اختياري)</span>
                </label>
                <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short English excerpt..." rows={3} className={inputClass + ' resize-y'} />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">الوسوم</label>
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                    <Tag className="h-3 w-3" />{t}
                    <button onClick={() => removeTag(t)} className="mr-1 rounded-full p-0.5 hover:bg-blue-100">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text" value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={tags.length === 0 ? 'اكتب وسمًا واضغط Enter...' : ''}
                  className="min-w-[120px] flex-1 border-none bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">اكتب الوسم ثم اضغط Enter لإضافته</p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 pt-6">
              <button
                onClick={handleSaveDraft} disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                حفظ كمسودة
              </button>
              <button
                onClick={handleSubmitForReview} disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                إرسال للمراجعة
              </button>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جارٍ المعالجة...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePostPage;
