import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Image,
  Upload,
  Trash2,
  Eye,
  Copy,
  X,
  Search,
  Filter,
  Plus,
  FolderOpen,
  CheckCircle,
  AlertCircle,
  HardDrive,
  FileImage,
  Loader2,
  ImagePlus,
  Download,
  ZoomIn
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────
interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
  base64?: string;
  uploadedAt: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

// ─── Constants ───────────────────────────────────────────────────
const STORAGE_KEY = 'investor_media_library';
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ACCEPT_STRING = ACCEPTED_TYPES.join(',');

const TYPE_LABELS: Record<string, string> = {
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/gif': 'GIF',
  'image/webp': 'WebP',
  'image/svg+xml': 'SVG',
};

// ─── Helpers ─────────────────────────────────────────────────────
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ─── Load / Save from localStorage ──────────────────────────────
const loadMedia = (): MediaItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveMedia = (items: MediaItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage might be full
  }
};

// ─── Try backend upload, fall back to localStorage ───────────────
const uploadToBackend = async (
  file: File,
  onProgress: (pct: number) => void
): Promise<MediaItem> => {
  const token = localStorage.getItem('investor_auth_token');

  // Try real backend first
  try {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    const result = await new Promise<any>((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 90));
      });
      xhr.addEventListener('load', () => {
        try {
          const json = JSON.parse(xhr.responseText);
          if (json.success && json.data) resolve(json.data);
          else reject(new Error(json.error || 'Upload failed'));
        } catch {
          reject(new Error('Invalid response'));
        }
      });
      xhr.addEventListener('error', () => reject(new Error('Network error')));
      xhr.addEventListener('abort', () => reject(new Error('Aborted')));

      // Determine base URL
      const baseUrl =
        (window as any).__API_BASE_URL ||
        import.meta?.env?.VITE_API_URL ||
        '/api';

      xhr.open('POST', `${baseUrl}/uploads`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });

    onProgress(100);
    return {
      id: result.filename || `media-${Date.now()}`,
      filename: result.filename,
      originalName: result.originalName || file.name,
      size: result.size || file.size,
      mimetype: result.mimetype || file.type,
      url: result.url,
      uploadedAt: new Date().toISOString(),
    };
  } catch {
    // Fallback: store as base64 in localStorage
    onProgress(50);
    const base64 = await fileToBase64(file);
    onProgress(100);
    return {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      filename: file.name,
      originalName: file.name,
      size: file.size,
      mimetype: file.type,
      url: base64,
      base64,
      uploadedAt: new Date().toISOString(),
    };
  }
};

// =================================================================
// ─── COMPONENT ───────────────────────────────────────────────────
// =================================================================
const MediaLibraryPage: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>(loadMedia);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist media on change
  useEffect(() => {
    saveMedia(media);
  }, [media]);

  // ─── Upload handler ──────────────────────────────────────────
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => ACCEPTED_TYPES.includes(f.type));
    if (fileArray.length === 0) return;

    const newUploads: UploadProgress[] = fileArray.map((f) => ({
      file: f,
      progress: 0,
      status: 'uploading' as const,
    }));
    setUploads((prev) => [...prev, ...newUploads]);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      try {
        const item = await uploadToBackend(file, (pct) => {
          setUploads((prev) =>
            prev.map((u) => (u.file === file ? { ...u, progress: pct } : u))
          );
        });

        setUploads((prev) =>
          prev.map((u) => (u.file === file ? { ...u, progress: 100, status: 'done' } : u))
        );
        setMedia((prev) => [item, ...prev]);
      } catch (err: any) {
        setUploads((prev) =>
          prev.map((u) =>
            u.file === file ? { ...u, status: 'error', error: err?.message || 'فشل الرفع' } : u
          )
        );
      }
    }

    // Clear finished uploads after 3s
    setTimeout(() => {
      setUploads((prev) => prev.filter((u) => u.status === 'uploading'));
    }, 3000);
  }, []);

  // ─── Drag & Drop ─────────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  // ─── Delete ──────────────────────────────────────────────────
  const handleDelete = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
    setDeleteConfirmId(null);

    // Try backend delete (best-effort)
    const item = media.find((m) => m.id === id);
    if (item && !item.base64) {
      try {
        const token = localStorage.getItem('investor_auth_token');
        const baseUrl =
          (window as any).__API_BASE_URL ||
          import.meta?.env?.VITE_API_URL ||
          '/api';
        fetch(`${baseUrl}/uploads/${item.filename}`, {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).catch(() => {});
      } catch {}
    }
  };

  // ─── Copy URL ────────────────────────────────────────────────
  const handleCopyUrl = (item: MediaItem) => {
    const textToCopy = item.base64 ? item.originalName : item.url;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // ─── Filtering ───────────────────────────────────────────────
  const filteredMedia = media.filter((m) => {
    const matchesSearch =
      !searchQuery || m.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || m.mimetype === typeFilter;
    return matchesSearch && matchesType;
  });

  // ─── Stats ───────────────────────────────────────────────────
  const totalSize = media.reduce((s, m) => s + m.size, 0);
  const imageCount = media.filter((m) => m.mimetype.startsWith('image/')).length;

  // ─── Unique mime types present ────────────────────────────────
  const presentTypes = [...new Set(media.map((m) => m.mimetype))];

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 text-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Image size={22} className="text-white" />
                </div>
                مكتبة الوسائط
              </h1>
              <p className="text-slate-400 mt-2 text-sm lg:text-base">
                إدارة الصور والفيديوهات والأصول الرقمية
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-500/25 transition-all active:scale-95"
            >
              <ImagePlus size={18} />
              رفع وسائط جديدة
            </button>
          </div>
        </div>

        {/* ── Stats Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
            <div className="w-11 h-11 bg-blue-500/15 text-blue-400 rounded-lg flex items-center justify-center">
              <FolderOpen size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{media.length}</p>
              <p className="text-xs text-slate-400 font-medium">إجمالي الملفات</p>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
            <div className="w-11 h-11 bg-emerald-500/15 text-emerald-400 rounded-lg flex items-center justify-center">
              <HardDrive size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{formatFileSize(totalSize)}</p>
              <p className="text-xs text-slate-400 font-medium">الحجم الكلي</p>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
            <div className="w-11 h-11 bg-violet-500/15 text-violet-400 rounded-lg flex items-center justify-center">
              <FileImage size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{imageCount}</p>
              <p className="text-xs text-slate-400 font-medium">صور</p>
            </div>
          </div>
        </div>

        {/* ── Upload Progress ────────────────────────────────── */}
        {uploads.length > 0 && (
          <div className="mb-6 space-y-2">
            {uploads.map((u, idx) => (
              <div
                key={idx}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 flex items-center gap-3"
              >
                {u.status === 'uploading' && (
                  <Loader2 size={18} className="text-violet-400 animate-spin shrink-0" />
                )}
                {u.status === 'done' && (
                  <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                )}
                {u.status === 'error' && (
                  <AlertCircle size={18} className="text-red-400 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{u.file.name}</p>
                  {u.status === 'uploading' && (
                    <div className="mt-1.5 w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-violet-500 to-purple-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${u.progress}%` }}
                      />
                    </div>
                  )}
                  {u.status === 'error' && (
                    <p className="text-xs text-red-400 mt-0.5">{u.error}</p>
                  )}
                </div>
                <span className="text-xs text-slate-500 font-mono shrink-0">
                  {u.progress}%
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Drag & Drop Upload Zone ────────────────────────── */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative mb-8 border-2 border-dashed rounded-2xl p-8 lg:p-12 text-center cursor-pointer transition-all duration-200 group ${
            dragOver
              ? 'border-violet-400 bg-violet-500/10 scale-[1.01]'
              : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_STRING}
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <div className="flex flex-col items-center gap-3">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                dragOver
                  ? 'bg-violet-500/20 text-violet-300 scale-110'
                  : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600 group-hover:text-slate-300'
              }`}
            >
              <Upload size={32} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-200">
                {dragOver ? 'أفلت الملفات هنا' : 'اسحب الملفات وأفلتها هنا'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                أو اضغط لاختيار الملفات &mdash; JPEG, PNG, GIF, WebP, SVG
              </p>
            </div>
          </div>
        </div>

        {/* ── Filter Bar ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث باسم الملف..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pr-10 pl-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-slate-800 border border-slate-700 rounded-lg py-2.5 pr-9 pl-8 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all cursor-pointer"
            >
              <option value="all">جميع الأنواع</option>
              {presentTypes.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t] || t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Media Grid / Empty State ───────────────────────── */}
        {filteredMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-5">
              <FolderOpen size={40} className="text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-300 mb-2">
              {media.length === 0 ? 'لم يتم رفع أي وسائط بعد' : 'لا توجد نتائج'}
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mb-6">
              {media.length === 0
                ? 'ابدأ برفع الصور والأصول الرقمية لتنظيمها وإدارتها من هنا.'
                : 'جرّب تغيير كلمات البحث أو عوامل التصفية.'}
            </p>
            {media.length === 0 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-violet-500/25 transition-all active:scale-95"
              >
                <Plus size={18} />
                رفع وسائط
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="group relative bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-black/20"
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-slate-900 relative overflow-hidden">
                  {item.mimetype === 'image/svg+xml' ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800/60">
                      <Image size={48} className="text-slate-600" />
                      <span className="absolute bottom-2 right-2 bg-slate-700 text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        SVG
                      </span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.originalName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewItem(item);
                      }}
                      className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-lg flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                      title="معاينة"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUrl(item);
                      }}
                      className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-lg flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                      title="نسخ الرابط"
                    >
                      {copiedId === item.id ? (
                        <CheckCircle size={18} className="text-emerald-400" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(item.id);
                      }}
                      className="w-9 h-9 bg-red-500/20 hover:bg-red-500/40 rounded-lg flex items-center justify-center text-red-400 transition-colors backdrop-blur-sm"
                      title="حذف"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-slate-200 truncate" title={item.originalName}>
                    {item.originalName}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {formatFileSize(item.size)}
                    </span>
                    <span className="text-[11px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded font-bold">
                      {TYPE_LABELS[item.mimetype] || item.mimetype.split('/')[1]?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1">{formatDate(item.uploadedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Preview Modal ──────────────────────────────────────── */}
      {previewItem && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700 bg-slate-800/80 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <ZoomIn size={18} className="text-violet-400 shrink-0" />
                <p className="text-sm font-bold text-slate-200 truncate">
                  {previewItem.originalName}
                </p>
                <span className="text-[11px] text-slate-500 font-medium shrink-0">
                  {formatFileSize(previewItem.size)}
                </span>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Image */}
            <div className="flex-1 overflow-auto flex items-center justify-center bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)] bg-[length:20px_20px] p-4">
              {previewItem.mimetype === 'image/svg+xml' ? (
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <Image size={80} />
                  <span className="text-sm">معاينة SVG غير مدعومة بشكل مباشر</span>
                </div>
              ) : (
                <img
                  src={previewItem.url}
                  alt={previewItem.originalName}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-xl"
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700 bg-slate-800/80 shrink-0">
              <span className="text-xs text-slate-500">{formatDate(previewItem.uploadedAt)}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyUrl(previewItem)}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                >
                  {copiedId === previewItem.id ? (
                    <>
                      <CheckCircle size={14} className="text-emerald-400" />
                      تم النسخ
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      نسخ الرابط
                    </>
                  )}
                </button>
                {!previewItem.base64 && (
                  <a
                    href={previewItem.url}
                    download={previewItem.originalName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                  >
                    <Download size={14} />
                    تحميل
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────────── */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/15 rounded-lg flex items-center justify-center">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">حذف الملف</h3>
                <p className="text-xs text-slate-400">هل أنت متأكد من حذف هذا الملف؟</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-5 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-700 truncate">
              {media.find((m) => m.id === deleteConfirmId)?.originalName}
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-lg shadow-red-500/20 transition-all active:scale-95"
              >
                حذف نهائي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibraryPage;
