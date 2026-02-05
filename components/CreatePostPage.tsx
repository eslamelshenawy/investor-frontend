import React, { useState, useCallback, KeyboardEvent } from 'react';
import { FileText, Send, Save, Eye, ArrowRight, Tag, X } from 'lucide-react';
import { api } from '../src/services/api';
import { useAuth } from '../contexts/AuthContext';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type PostType =
  | 'ARTICLE'
  | 'REPORT'
  | 'ANALYSIS'
  | 'INSIGHT'
  | 'DEEP_INSIGHT'
  | 'CHART'
  | 'COMPARISON'
  | 'DATA_HIGHLIGHT'
  | 'VISUAL'
  | 'INFOGRAPHIC';

const TYPE_LABELS: Record<PostType, string> = {
  ARTICLE: 'مقال',
  REPORT: 'تقرير',
  ANALYSIS: 'تحليل',
  INSIGHT: 'رؤية',
  DEEP_INSIGHT: 'تحليل معمّق',
  CHART: 'رسم بياني',
  COMPARISON: 'مقارنة',
  DATA_HIGHLIGHT: 'إبراز بيانات',
  VISUAL: 'محتوى بصري',
  INFOGRAPHIC: 'إنفوجرافيك',
};

const ROLE_TYPES: Record<string, PostType[]> = {
  WRITER: ['ARTICLE', 'REPORT'],
  EXPERT: ['ARTICLE', 'REPORT', 'ANALYSIS', 'INSIGHT', 'DEEP_INSIGHT'],
  ANALYST: ['ANALYSIS', 'CHART', 'COMPARISON', 'DATA_HIGHLIGHT'],
  DESIGNER: ['VISUAL', 'INFOGRAPHIC'],
  ADMIN: [
    'ARTICLE', 'REPORT', 'ANALYSIS', 'INSIGHT', 'DEEP_INSIGHT',
    'CHART', 'COMPARISON', 'DATA_HIGHLIGHT', 'VISUAL', 'INFOGRAPHIC',
  ],
  SUPER_ADMIN: [
    'ARTICLE', 'REPORT', 'ANALYSIS', 'INSIGHT', 'DEEP_INSIGHT',
    'CHART', 'COMPARISON', 'DATA_HIGHLIGHT', 'VISUAL', 'INFOGRAPHIC',
  ],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CreatePostPage: React.FC = () => {
  const { user } = useAuth();

  // Form state
  const [type, setType] = useState<PostType>('ARTICLE');
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [body, setBody] = useState('');
  const [bodyAr, setBodyAr] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [excerptAr, setExcerptAr] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // UI state
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Derive allowed types from user role
  const allowedTypes: PostType[] =
    ROLE_TYPES[(user as any)?.role ?? ''] ?? ROLE_TYPES.WRITER;

  // ---- Helpers ----

  const clearMessages = () => {
    setSuccessMsg('');
    setErrorMsg('');
  };

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

  // ---- API actions ----

  const handleSaveDraft = useCallback(async () => {
    clearMessages();
    setLoading(true);
    try {
      await api.createContentPost({
        type,
        title,
        titleAr,
        body,
        bodyAr,
        excerpt: excerpt || undefined,
        excerptAr: excerptAr || undefined,
        tags,
      });
      setSuccessMsg('تم حفظ المسودة بنجاح');
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'حدث خطأ أثناء حفظ المسودة');
    } finally {
      setLoading(false);
    }
  }, [type, title, titleAr, body, bodyAr, excerpt, excerptAr, tags]);

  const handleSubmitForReview = useCallback(async () => {
    clearMessages();
    if (!titleAr.trim() || !bodyAr.trim()) {
      setErrorMsg('يرجى تعبئة العنوان والمحتوى بالعربية على الأقل');
      return;
    }
    setLoading(true);
    try {
      const post = await api.createContentPost({
        type,
        title,
        titleAr,
        body,
        bodyAr,
        excerpt: excerpt || undefined,
        excerptAr: excerptAr || undefined,
        tags,
      });
      await api.submitForReview((post as any).id);
      setSuccessMsg('تم إرسال المحتوى للمراجعة بنجاح');
      // Reset form
      setTitle('');
      setTitleAr('');
      setBody('');
      setBodyAr('');
      setExcerpt('');
      setExcerptAr('');
      setTags([]);
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'حدث خطأ أثناء الإرسال');
    } finally {
      setLoading(false);
    }
  }, [type, title, titleAr, body, bodyAr, excerpt, excerptAr, tags]);

  // ---- Render helpers ----

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition';

  const renderPreview = () => (
    <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Type badge */}
      <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
        {TYPE_LABELS[type]}
      </span>

      {/* Arabic title & body */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{titleAr || '(بدون عنوان)'}</h2>
        {excerptAr && (
          <p className="mt-2 text-sm leading-relaxed text-gray-500">{excerptAr}</p>
        )}
        <div className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-gray-700">
          {bodyAr || '(لا يوجد محتوى)'}
        </div>
      </div>

      {/* English title & body */}
      {(title || body) && (
        <div className="border-t border-gray-200 pt-4" dir="ltr">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          {excerpt && (
            <p className="mt-1 text-sm leading-relaxed text-gray-500">{excerpt}</p>
          )}
          <div className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-gray-700">
            {body}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
            >
              <Tag className="h-3 w-3" />
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  // ---- Main render ----

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">إنشاء محتوى جديد</h1>
            <p className="text-sm text-gray-500">أنشئ مقالًا أو تقريرًا أو تحليلًا جديدًا</p>
          </div>
        </div>

        {/* Success / Error messages */}
        {successMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="mr-auto">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="mr-auto">
              <X className="h-4 w-4" />
            </button>
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

        {preview ? (
          renderPreview()
        ) : (
          <div className="space-y-6">
            {/* Post type selector */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                نوع المحتوى
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PostType)}
                className={inputClass}
              >
                {allowedTypes.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>

            {/* Title (Arabic + English) */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  العنوان بالعربية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="أدخل العنوان بالعربية..."
                  className={inputClass}
                />
              </div>
              <div dir="ltr">
                <label className="mb-1.5 block text-right text-sm font-medium text-gray-700">
                  العنوان بالإنجليزية
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter English title..."
                  className={inputClass}
                />
              </div>
            </div>

            {/* Body (Arabic + English) */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  المحتوى بالعربية <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={bodyAr}
                  onChange={(e) => setBodyAr(e.target.value)}
                  placeholder="اكتب المحتوى بالعربية..."
                  rows={10}
                  className={inputClass + ' resize-y'}
                />
              </div>
              <div dir="ltr">
                <label className="mb-1.5 block text-right text-sm font-medium text-gray-700">
                  المحتوى بالإنجليزية
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write English content..."
                  rows={10}
                  className={inputClass + ' resize-y'}
                />
              </div>
            </div>

            {/* Excerpts (Arabic + English) */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  المقتطف بالعربية <span className="text-xs text-gray-400">(اختياري)</span>
                </label>
                <textarea
                  value={excerptAr}
                  onChange={(e) => setExcerptAr(e.target.value)}
                  placeholder="ملخص قصير بالعربية..."
                  rows={3}
                  className={inputClass + ' resize-y'}
                />
              </div>
              <div dir="ltr">
                <label className="mb-1.5 block text-right text-sm font-medium text-gray-700">
                  المقتطف بالإنجليزية <span className="text-xs text-gray-400">(اختياري)</span>
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short English excerpt..."
                  rows={3}
                  className={inputClass + ' resize-y'}
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                الوسوم
              </label>
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600"
                  >
                    <Tag className="h-3 w-3" />
                    {t}
                    <button
                      onClick={() => removeTag(t)}
                      className="mr-1 rounded-full p-0.5 hover:bg-blue-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
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
                onClick={handleSaveDraft}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                حفظ كمسودة
              </button>

              <button
                onClick={handleSubmitForReview}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                إرسال للمراجعة
              </button>

              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
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
