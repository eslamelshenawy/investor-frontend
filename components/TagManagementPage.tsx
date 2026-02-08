import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Tag, Plus, X, Search, Edit3, Hash, Trash2, Check, BarChart3, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../src/services/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TagItem {
  id: string;
  tag: string;
  count: number;
  color: string;
  isLocal?: boolean; // locally-created tag (not yet backed by backend)
}

// ─── Colour palette for tags ─────────────────────────────────────────────────

const TAG_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#06b6d4',
  '#84cc16', '#e11d48', '#0ea5e9', '#a855f7', '#22c55e',
  '#eab308', '#dc2626', '#7c3aed', '#059669', '#d946ef',
];

const STORAGE_KEY = 'investor_tag_management';

function pickColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

function generateId(): string {
  return `tag_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Persistence helpers (localStorage fallback) ─────────────────────────────

function loadLocalTags(): TagItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalTags(tags: TagItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tags.filter(t => t.isLocal)));
}

// ─── Component ───────────────────────────────────────────────────────────────

const TagManagementPage: React.FC = () => {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'count'>('count');

  // New tag creation
  const [newTagName, setNewTagName] = useState('');
  const [creating, setCreating] = useState(false);

  // Inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Fetch tags from backend + merge local ──────────────────────────────────

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ tag: string; count: number }[]>('/content/tags?limit=200');
      const localTags = loadLocalTags();
      const localTagNames = new Set(localTags.map(t => t.tag));

      const backendTags: TagItem[] = (res.data || []).map(t => ({
        id: `backend_${t.tag}`,
        tag: t.tag,
        count: t.count,
        color: pickColor(t.tag),
        isLocal: false,
      }));

      // Merge: local tags that don't collide with backend
      const mergedLocal = localTags.filter(lt => !backendTags.some(bt => bt.tag === lt.tag));

      setTags([...backendTags, ...mergedLocal]);
    } catch {
      setError('فشل في تحميل الوسوم. يرجى المحاولة مرة أخرى.');
      // Fall back to local only
      setTags(loadLocalTags());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // ── Persist local tags on change ───────────────────────────────────────────

  useEffect(() => {
    if (!loading) {
      saveLocalTags(tags);
    }
  }, [tags, loading]);

  // ── Filtered & sorted tags ─────────────────────────────────────────────────

  const filteredTags = useMemo(() => {
    let result = tags;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(t => t.tag.toLowerCase().includes(q));
    }
    if (sortBy === 'count') {
      result = [...result].sort((a, b) => b.count - a.count);
    } else {
      result = [...result].sort((a, b) => a.tag.localeCompare(b.tag, 'ar'));
    }
    return result;
  }, [tags, searchQuery, sortBy]);

  // ── Stats ──────────────────────────────────────────────────────────────────

  const totalTags = tags.length;
  const totalUsage = tags.reduce((sum, t) => sum + t.count, 0);
  const localCount = tags.filter(t => t.isLocal).length;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCreate = () => {
    const name = newTagName.trim();
    if (!name) return;
    if (tags.some(t => t.tag.toLowerCase() === name.toLowerCase())) {
      setError('هذا الوسم موجود بالفعل');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setCreating(true);
    const newTag: TagItem = {
      id: generateId(),
      tag: name,
      count: 0,
      color: pickColor(name),
      isLocal: true,
    };
    setTags(prev => [newTag, ...prev]);
    setNewTagName('');
    setCreating(false);
  };

  const handleDelete = (id: string) => {
    setTags(prev => prev.filter(t => t.id !== id));
    setDeletingId(null);
  };

  const handleStartEdit = (tag: TagItem) => {
    setEditingId(tag.id);
    setEditValue(tag.tag);
    setTimeout(() => editInputRef.current?.focus(), 50);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const trimmed = editValue.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    if (tags.some(t => t.id !== editingId && t.tag.toLowerCase() === trimmed.toLowerCase())) {
      setError('هذا الوسم موجود بالفعل');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setTags(prev =>
      prev.map(t =>
        t.id === editingId
          ? { ...t, tag: trimmed, color: pickColor(trimmed) }
          : t
      )
    );
    setEditingId(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-900 text-white" dir="rtl">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">

        {/* ── Page header ──────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Tag size={24} />
              </div>
              إدارة الوسوم والتصنيفات
            </h1>
            <p className="text-slate-400 mt-2 text-sm lg:text-base">
              إنشاء وتعديل وحذف الوسوم المستخدمة في تصنيف المحتوى على المنصة
            </p>
          </div>
          <button
            onClick={fetchTags}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            تحديث
          </button>
        </div>

        {/* ── Stats Cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Hash size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{totalTags}</p>
              <p className="text-xs text-slate-400 font-medium">إجمالي الوسوم</p>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <BarChart3 size={24} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{totalUsage.toLocaleString('ar-SA')}</p>
              <p className="text-xs text-slate-400 font-medium">إجمالي الاستخدام</p>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Tag size={24} className="text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{localCount}</p>
              <p className="text-xs text-slate-400 font-medium">وسوم محلية (جديدة)</p>
            </div>
          </div>
        </div>

        {/* ── Error Banner ─────────────────────────────────────────── */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm animate-fadeIn">
            <AlertCircle size={18} />
            {error}
            <button onClick={() => setError(null)} className="mr-auto hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Create New Tag ───────────────────────────────────────── */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6">
          <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-200">
            <Plus size={18} className="text-emerald-400" />
            إضافة وسم جديد
          </h2>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
                placeholder="أدخل اسم الوسم الجديد..."
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                dir="rtl"
              />
              {newTagName.trim() && (
                <div
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                  style={{ backgroundColor: pickColor(newTagName.trim()) }}
                />
              )}
            </div>
            <button
              onClick={handleCreate}
              disabled={!newTagName.trim() || creating}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 active:scale-95"
            >
              <Plus size={18} />
              إضافة
            </button>
          </div>
        </div>

        {/* ── Search & Sort Controls ───────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث في الوسوم..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-11 pl-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              dir="rtl"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('count')}
              className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                sortBy === 'count'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              الأكثر استخداماً
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                sortBy === 'name'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              أبجدياً
            </button>
          </div>
        </div>

        {/* ── Tags Grid ────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCw size={32} className="text-purple-400 animate-spin" />
            <p className="text-slate-400 text-sm">جاري تحميل الوسوم...</p>
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center">
              <Tag size={36} className="text-slate-600" />
            </div>
            <p className="text-slate-400 text-base font-medium">
              {searchQuery ? 'لا توجد وسوم مطابقة لبحثك' : 'لا توجد وسوم بعد. أضف وسمك الأول!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTags.map(tag => (
              <div
                key={tag.id}
                className="group bg-slate-800 border border-slate-700 rounded-2xl p-4 hover:border-slate-600 hover:bg-slate-800/80 transition-all relative"
              >
                {/* Delete confirmation overlay */}
                {deletingId === tag.id && (
                  <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm rounded-2xl z-10 flex flex-col items-center justify-center gap-3 p-4 animate-fadeIn">
                    <p className="text-sm text-slate-300 text-center font-medium">
                      حذف الوسم "{tag.tag}"؟
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        نعم، حذف
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-bold transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}

                {/* Color indicator bar */}
                <div
                  className="absolute top-0 right-0 left-0 h-1 rounded-t-2xl"
                  style={{ backgroundColor: tag.color }}
                />

                <div className="flex items-start justify-between mt-1">
                  {/* Tag name (editable) */}
                  <div className="flex-1 min-w-0">
                    {editingId === tag.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="bg-slate-900 border border-purple-500 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                          dir="rtl"
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shrink-0"
                          title="حفظ"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors shrink-0"
                          title="إلغاء"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        <h3 className="font-bold text-white text-sm truncate">{tag.tag}</h3>
                        {tag.isLocal && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold shrink-0">
                            جديد
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {editingId !== tag.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                      <button
                        onClick={() => handleStartEdit(tag)}
                        className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-blue-400"
                        title="تعديل"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingId(tag.id)}
                        className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                        title="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Usage count */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Hash size={14} />
                    <span className="text-xs font-medium">
                      {tag.count > 0
                        ? `${tag.count.toLocaleString('ar-SA')} استخدام`
                        : 'لم يُستخدم بعد'}
                    </span>
                  </div>
                  {/* Usage bar */}
                  {totalUsage > 0 && tag.count > 0 && (
                    <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(5, (tag.count / (tags[0]?.count || 1)) * 100)}%`,
                          backgroundColor: tag.color,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Results count ────────────────────────────────────────── */}
        {!loading && filteredTags.length > 0 && (
          <div className="mt-6 text-center text-xs text-slate-500">
            عرض {filteredTags.length} من {totalTags} وسم
          </div>
        )}
      </div>
    </div>
  );
};

export default TagManagementPage;
