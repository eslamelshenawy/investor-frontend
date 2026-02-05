/**
 * Search Page - صفحة البحث الموحد
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search, FileText, Database, Building2, TrendingUp,
  Loader2, AlertCircle, Eye, Heart, Calendar, User,
  BadgeCheck, ChevronLeft, ChevronRight, Filter,
} from 'lucide-react';
import api from '../src/services/api';
import type { SearchContentItem, SearchDatasetItem, SearchEntityItem, SearchSignalItem } from '../src/services/api';

type SearchType = 'all' | 'content' | 'datasets' | 'entities' | 'signals';

const TABS: { id: SearchType; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'الكل', icon: <Search size={16} /> },
  { id: 'content', label: 'المحتوى', icon: <FileText size={16} /> },
  { id: 'datasets', label: 'البيانات', icon: <Database size={16} /> },
  { id: 'entities', label: 'الجهات', icon: <Building2 size={16} /> },
  { id: 'signals', label: 'الإشارات', icon: <TrendingUp size={16} /> },
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialQuery = searchParams.get('q') || '';
  const initialType = (searchParams.get('type') as SearchType) || 'all';
  const initialPage = parseInt(searchParams.get('page') || '1');

  const [query, setQuery] = useState(initialQuery);
  const [activeType, setActiveType] = useState<SearchType>(initialType);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    content: SearchContentItem[];
    datasets: SearchDatasetItem[];
    entities: SearchEntityItem[];
    signals: SearchSignalItem[];
  }>({ content: [], datasets: [], entities: [], signals: [] });
  const [counts, setCounts] = useState({ content: 0, datasets: 0, entities: 0, signals: 0 });
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const doSearch = useCallback(async (q: string, type: SearchType, p: number) => {
    if (!q || q.length < 2) return;

    setIsLoading(true);
    setHasSearched(true);
    const result = await api.search({ q, type, page: p, limit: 10 });
    setIsLoading(false);

    if (result.success && result.data) {
      setResults(result.data.results);
      setCounts(result.data.counts);
      setTotalResults(result.data.totalResults);
      setTotalPages(result.meta?.totalPages || 1);
    }
  }, []);

  // Search on mount if query is provided
  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery, initialType, initialPage);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || query.length < 2) return;
    setPage(1);
    setSearchParams({ q: query, type: activeType, page: '1' });
    doSearch(query, activeType, 1);
  };

  const handleTypeChange = (type: SearchType) => {
    setActiveType(type);
    setPage(1);
    setSearchParams({ q: query, type, page: '1' });
    doSearch(query, type, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSearchParams({ q: query, type: activeType, page: String(newPage) });
    doSearch(query, activeType, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    if (diff < 604800) return `منذ ${Math.floor(diff / 86400)} يوم`;
    return d.toLocaleDateString('ar-SA');
  };

  const totalCount = counts.content + counts.datasets + counts.entities + counts.signals;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6" dir="rtl">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">البحث</h1>
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-3.5 pr-12 pl-28 text-base text-gray-900 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
            placeholder="ابحث عن محتوى، بيانات، جهات، إشارات..."
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || query.length < 2}
            className="absolute inset-y-0 left-0 flex items-center px-5 m-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg transition-all text-sm"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'بحث'}
          </button>
        </form>
      </div>

      {/* Tabs */}
      {hasSearched && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTypeChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeType === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeType === tab.id ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {tab.id === 'all' ? totalCount :
                 tab.id === 'content' ? counts.content :
                 tab.id === 'datasets' ? counts.datasets :
                 tab.id === 'entities' ? counts.entities :
                 counts.signals}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-600" />
          <span className="mr-3 text-gray-500">جاري البحث...</span>
        </div>
      )}

      {/* No Results */}
      {hasSearched && !isLoading && totalCount === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">لا توجد نتائج</h3>
          <p className="text-gray-500 text-sm">لم يتم العثور على نتائج لـ "{query}"</p>
        </div>
      )}

      {/* Results */}
      {!isLoading && hasSearched && totalCount > 0 && (
        <div className="space-y-6">
          {/* Content Results */}
          {(activeType === 'all' || activeType === 'content') && results.content.length > 0 && (
            <ResultSection
              title="المحتوى"
              count={counts.content}
              icon={<FileText size={18} />}
              showHeader={activeType === 'all'}
              onSeeAll={() => handleTypeChange('content')}
            >
              {results.content.map(item => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/content/${item.id}`)}
                  className="p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{item.type}</span>
                        {item.author && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <User size={12} />
                            {item.author.nameAr || item.author.name}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{item.titleAr || item.title}</h3>
                      {(item.excerptAr || item.excerpt) && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.excerptAr || item.excerpt}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Eye size={12} />{item.viewCount}</span>
                        <span className="flex items-center gap-1"><Heart size={12} />{item.likeCount}</span>
                        {item.publishedAt && <span className="flex items-center gap-1"><Calendar size={12} />{timeAgo(item.publishedAt)}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </ResultSection>
          )}

          {/* Dataset Results */}
          {(activeType === 'all' || activeType === 'datasets') && results.datasets.length > 0 && (
            <ResultSection
              title="مجموعات البيانات"
              count={counts.datasets}
              icon={<Database size={18} />}
              showHeader={activeType === 'all'}
              onSeeAll={() => handleTypeChange('datasets')}
            >
              {results.datasets.map(item => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/data/${item.id}`)}
                  className="p-4 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{item.category}</span>
                    <span className="text-xs text-gray-400">{item.source}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{item.nameAr || item.name}</h3>
                  {(item.descriptionAr || item.description) && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.descriptionAr || item.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{item.recordCount.toLocaleString('ar-SA')} سجل</span>
                    {item.lastSyncAt && <span>آخر تحديث: {timeAgo(item.lastSyncAt)}</span>}
                  </div>
                </div>
              ))}
            </ResultSection>
          )}

          {/* Entity Results */}
          {(activeType === 'all' || activeType === 'entities') && results.entities.length > 0 && (
            <ResultSection
              title="الجهات والخبراء"
              count={counts.entities}
              icon={<Building2 size={18} />}
              showHeader={activeType === 'all'}
              onSeeAll={() => handleTypeChange('entities')}
            >
              {results.entities.map(item => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/entities?id=${item.id}`)}
                  className="p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {item.avatar ? (
                        <img src={item.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        item.name.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{item.name}</h3>
                        {item.isVerified && <BadgeCheck size={16} className="text-blue-500" />}
                      </div>
                      <p className="text-sm text-gray-500">{item.role}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>{item.followersCount} متابع</span>
                        <span>{item.type}</span>
                        {item.specialties.length > 0 && (
                          <span className="truncate">{item.specialties.slice(0, 2).join('، ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </ResultSection>
          )}

          {/* Signal Results */}
          {(activeType === 'all' || activeType === 'signals') && results.signals.length > 0 && (
            <ResultSection
              title="الإشارات الذكية"
              count={counts.signals}
              icon={<TrendingUp size={18} />}
              showHeader={activeType === 'all'}
              onSeeAll={() => handleTypeChange('signals')}
            >
              {results.signals.map(item => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/signals?id=${item.id}`)}
                  className="p-4 bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.trend === 'up' ? 'bg-emerald-100 text-emerald-700' :
                      item.trend === 'down' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{item.trend === 'up' ? 'صاعد' : item.trend === 'down' ? 'هابط' : 'مستقر'}</span>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{item.type}</span>
                    {item.sector && <span className="text-xs text-gray-400">{item.sector}</span>}
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-1">{item.titleAr || item.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.summaryAr || item.summary}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>التأثير: {Math.round(item.impactScore * 100)}%</span>
                    <span>الثقة: {Math.round(item.confidence * 100)}%</span>
                    <span>{timeAgo(item.createdAt)}</span>
                  </div>
                </div>
              ))}
            </ResultSection>
          )}

          {/* Pagination (only for single-type views) */}
          {activeType !== 'all' && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100 transition-all"
              >
                <ChevronRight size={18} />
              </button>
              <span className="text-sm text-gray-600 px-3">
                صفحة {page} من {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={36} className="text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">ابحث في رادار المستثمر</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            ابحث عن المحتوى، مجموعات البيانات، الجهات الحكومية، والإشارات الذكية في مكان واحد
          </p>
        </div>
      )}
    </div>
  );
};

// Result Section Component
const ResultSection = ({
  title,
  count,
  icon,
  showHeader,
  onSeeAll,
  children,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  showHeader: boolean;
  onSeeAll: () => void;
  children: React.ReactNode;
}) => (
  <div>
    {showHeader && (
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-gray-700 font-bold">
          {icon}
          {title}
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{count}</span>
        </div>
        {count > 5 && (
          <button onClick={onSeeAll} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            عرض الكل
          </button>
        )}
      </div>
    )}
    <div className="space-y-3">{children}</div>
  </div>
);

export default SearchPage;
