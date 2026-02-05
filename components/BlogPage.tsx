/**
 * Blog Page - المدونة والتحليلات
 * Public pre-auth page for listing published articles, analysis, and insights.
 * SEO-friendly with search, category filtering, tag cloud, and pagination.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Search,
  Tag,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  User,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

interface ContentItem {
  id: string;
  type: string;
  titleAr: string;
  excerptAr?: string;
  author?: { nameAr?: string; name?: string };
  authorName?: string;
  createdAt: string;
  publishedAt?: string;
  viewCount?: number;
  tags?: string[];
  coverImage?: string;
}

interface FeedResponse {
  success: boolean;
  data: ContentItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface TagsResponse {
  success: boolean;
  data: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TYPE_LABELS: Record<string, string> = {
  ARTICLE: 'مقال',
  REPORT: 'تقرير',
  ANALYSIS: 'تحليل',
  INSIGHT: 'رؤية',
  DEEP_INSIGHT: 'تحليل معمق',
};

const TYPE_COLORS: Record<string, string> = {
  ARTICLE: 'bg-blue-600',
  REPORT: 'bg-emerald-600',
  ANALYSIS: 'bg-amber-600',
  INSIGHT: 'bg-purple-600',
  DEEP_INSIGHT: 'bg-rose-600',
};

interface FilterTab {
  key: string;
  label: string;
  type: string | null;
}

const FILTER_TABS: FilterTab[] = [
  { key: 'all', label: 'الكل', type: null },
  { key: 'article', label: 'مقالات', type: 'ARTICLE' },
  { key: 'report', label: 'تقارير', type: 'REPORT' },
  { key: 'analysis', label: 'تحليلات', type: 'ANALYSIS' },
  { key: 'insight', label: 'رؤى', type: 'INSIGHT' },
];

const ITEMS_PER_PAGE = 12;

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatViewCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return String(count);
}

function getAuthorName(item: ContentItem): string {
  if (item.author?.nameAr) return item.author.nameAr;
  if (item.author?.name) return item.author.name;
  if (item.authorName) return item.authorName;
  return 'محرر المنصة';
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="bg-slate-800 border border-slate-700 rounded-xl p-5 animate-pulse"
      >
        <div className="h-4 bg-slate-700 rounded w-16 mb-4" />
        <div className="h-5 bg-slate-700 rounded w-3/4 mb-3" />
        <div className="h-4 bg-slate-700 rounded w-full mb-2" />
        <div className="h-4 bg-slate-700 rounded w-5/6 mb-4" />
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-slate-700 rounded-full w-14" />
          <div className="h-6 bg-slate-700 rounded-full w-14" />
        </div>
        <div className="h-3 bg-slate-700 rounded w-1/2" />
      </div>
    ))}
  </div>
);

const EmptyState: React.FC<{ searchQuery: string }> = ({ searchQuery }) => (
  <div className="text-center py-20">
    <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
      <BookOpen size={36} className="text-slate-500" />
    </div>
    <h3 className="text-xl font-semibold text-slate-300 mb-2">
      لا توجد نتائج
    </h3>
    <p className="text-slate-500 max-w-md mx-auto">
      {searchQuery
        ? `لم يتم العثور على محتوى يطابق "${searchQuery}". جرّب كلمات بحث مختلفة.`
        : 'لا يوجد محتوى منشور حالياً. يرجى المحاولة لاحقاً.'}
    </p>
  </div>
);

// ---------------------------------------------------------------------------
// Content Card
// ---------------------------------------------------------------------------

interface ContentCardProps {
  item: ContentItem;
}

const ContentCard: React.FC<ContentCardProps> = ({ item }) => {
  const typeLabel = TYPE_LABELS[item.type] || item.type;
  const typeBgColor = TYPE_COLORS[item.type] || 'bg-slate-600';

  const handleClick = () => {
    window.location.hash = `/content/${item.id}`;
  };

  return (
    <article
      onClick={handleClick}
      className="group bg-slate-800 border border-slate-700 rounded-xl p-5 cursor-pointer
                 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5
                 transition-all duration-200 flex flex-col"
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Type badge */}
      <div className="mb-3">
        <span
          className={`inline-block text-xs font-medium text-white px-2.5 py-1 rounded-full ${typeBgColor}`}
        >
          {typeLabel}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-slate-100 mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
        {item.titleAr}
      </h3>

      {/* Excerpt */}
      {item.excerptAr && (
        <p className="text-sm text-slate-400 mb-4 line-clamp-3 leading-relaxed flex-grow">
          {item.excerptAr}
        </p>
      )}
      {!item.excerptAr && <div className="flex-grow" />}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-700/60 px-2 py-0.5 rounded-full"
            >
              <Tag size={10} />
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-xs text-slate-500">
              +{item.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Meta footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-700/60">
        <div className="flex items-center gap-1.5">
          <User size={13} />
          <span>{getAuthorName(item)}</span>
        </div>
        <div className="flex items-center gap-3">
          {typeof item.viewCount === 'number' && (
            <span className="flex items-center gap-1">
              <Eye size={13} />
              {formatViewCount(item.viewCount)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={13} />
            {formatDate(item.publishedAt || item.createdAt)}
          </span>
        </div>
      </div>
    </article>
  );
};

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <nav
      className="flex items-center justify-center gap-1.5 mt-10"
      aria-label="التنقل بين الصفحات"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg
                   bg-slate-800 border border-slate-700 text-slate-300
                   hover:bg-slate-700 hover:text-white disabled:opacity-40
                   disabled:cursor-not-allowed transition-colors"
        aria-label="الصفحة السابقة"
      >
        <ChevronRight size={16} />
        <span className="hidden sm:inline">السابق</span>
      </button>

      {getPageNumbers().map((page, idx) =>
        page === '...' ? (
          <span
            key={`ellipsis-${idx}`}
            className="px-2 py-2 text-sm text-slate-500"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[36px] px-3 py-2 text-sm rounded-lg border transition-colors ${
              page === currentPage
                ? 'bg-blue-600 border-blue-500 text-white font-medium'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            aria-label={`الصفحة ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg
                   bg-slate-800 border border-slate-700 text-slate-300
                   hover:bg-slate-700 hover:text-white disabled:opacity-40
                   disabled:cursor-not-allowed transition-colors"
        aria-label="الصفحة التالية"
      >
        <span className="hidden sm:inline">التالي</span>
        <ChevronLeft size={16} />
      </button>
    </nav>
  );
};

// ---------------------------------------------------------------------------
// Main BlogPage Component
// ---------------------------------------------------------------------------

const BlogPage: React.FC = () => {
  // State
  const [items, setItems] = useState<ContentItem[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch(`${API_BASE}/content/tags`);
        if (res.ok) {
          const data: TagsResponse = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setTags(data.data);
          }
        }
      } catch {
        // Tags are non-critical; silently ignore
      }
    };
    fetchTags();
  }, []);

  // Fetch feed
  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(ITEMS_PER_PAGE));
      params.set('page', String(currentPage));

      const selectedType = FILTER_TABS.find((t) => t.key === activeTab)?.type;
      if (selectedType) {
        params.set('type', selectedType);
      }
      if (debouncedSearch.trim()) {
        params.set('search', debouncedSearch.trim());
      }
      if (selectedTag) {
        params.set('tag', selectedTag);
      }

      const res = await fetch(`${API_BASE}/content/feed?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data: FeedResponse = await res.json();

      if (data.success) {
        setItems(data.data || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalItems(data.pagination.total || 0);
        }
      } else {
        setItems([]);
      }
    } catch (err: any) {
      setError('حدث خطأ أثناء تحميل المحتوى. يرجى المحاولة مرة أخرى.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab, debouncedSearch, selectedTag]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // Handlers
  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    setCurrentPage(1);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag((prev) => (prev === tag ? null : tag));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100" dir="rtl">
      {/* ----------------------------------------------------------------- */}
      {/* Page Header */}
      {/* ----------------------------------------------------------------- */}
      <header className="bg-gradient-to-bl from-slate-800 via-slate-900 to-slate-800 border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-14 text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen size={32} className="text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            المدونة والتحليلات
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            مقالات وتحليلات اقتصادية متخصصة
          </p>
        </div>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* Toolbar: Search + Filters */}
      {/* ----------------------------------------------------------------- */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          {/* Search bar */}
          <div className="relative max-w-xl mx-auto mb-4">
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في المقالات والتحليلات..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-sm
                         text-slate-100 placeholder-slate-500
                         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30
                         transition-colors"
              aria-label="بحث"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                aria-label="مسح البحث"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex items-center justify-center gap-1 flex-wrap">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-600 border-blue-500 text-white font-medium'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Main content area */}
      {/* ----------------------------------------------------------------- */}
      <main className="container mx-auto px-4 py-8">
        {/* Tag cloud */}
        {tags.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Tag size={16} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-400">
                الوسوم الشائعة
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    selectedTag === tag
                      ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active filters summary */}
        {(debouncedSearch || selectedTag) && (
          <div className="flex items-center gap-2 mb-6 text-sm text-slate-400">
            <span>النتائج</span>
            {!loading && (
              <span className="text-slate-500">({totalItems})</span>
            )}
            {debouncedSearch && (
              <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full text-xs">
                بحث: {debouncedSearch}
              </span>
            )}
            {selectedTag && (
              <span className="bg-blue-600/20 border border-blue-500/40 px-2 py-0.5 rounded-full text-xs text-blue-300">
                {selectedTag}
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setDebouncedSearch('');
                setSelectedTag(null);
                setCurrentPage(1);
              }}
              className="text-xs text-red-400 hover:text-red-300 mr-auto"
            >
              مسح الفلاتر
            </button>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-6 text-center mb-8">
            <p className="text-red-300 mb-3">{error}</p>
            <button
              onClick={fetchFeed}
              className="text-sm px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && <LoadingSkeleton />}

        {/* Content grid */}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <EmptyState searchQuery={debouncedSearch} />
        )}

        {/* Pagination */}
        {!loading && items.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      {/* ----------------------------------------------------------------- */}
      {/* Footer note */}
      {/* ----------------------------------------------------------------- */}
      <footer className="border-t border-slate-800 py-6 text-center">
        <p className="text-xs text-slate-600">
          جميع المقالات والتحليلات هي آراء كتّابها ولا تمثل توصيات استثمارية
        </p>
      </footer>
    </div>
  );
};

export default BlogPage;
