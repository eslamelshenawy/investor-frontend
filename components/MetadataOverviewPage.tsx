/**
 * Metadata Overview Page - نظرة عامة على البيانات الوصفية
 * Shows metadata stats and dataset list with links to individual metadata pages
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Database,
  Loader2,
  ChevronLeft,
  Search,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { api } from '../src/services/api';
import { useAuth } from '../contexts/AuthContext';

const MetadataOverviewPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    setLoading(true);
    const [statsRes, datasetsRes] = await Promise.all([
      api.getMetadataStats(),
      api.getDatasets({ page, limit: 20, search: search || undefined }),
    ]);
    if (statsRes.success && statsRes.data) setStats(statsRes.data);
    if (datasetsRes.success && datasetsRes.data) {
      setDatasets(datasetsRes.data);
      setTotal((datasetsRes as any).meta?.total || datasetsRes.data.length);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setPage(1);
    loadData();
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Shield size={24} className="text-blue-600" />
            البيانات الوصفية
          </h1>
          <p className="text-sm text-gray-500 mt-1">نظرة عامة على جودة واكتمال البيانات الوصفية للمجموعات</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-2xl font-black text-gray-900">{stats.total?.toLocaleString()}</p>
              <p className="text-xs text-gray-500 font-medium">إجمالي المجموعات</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-2xl font-black text-blue-600">{stats.coverage?.businessMetadata || 0}%</p>
              <p className="text-xs text-gray-500 font-medium">تغطية البيانات التجارية</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-2xl font-black text-emerald-600">{stats.coverage?.qualityAssessed || 0}%</p>
              <p className="text-xs text-gray-500 font-medium">تقييم الجودة</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-2xl font-black text-amber-600">{stats.coverage?.dataLineage || 0}%</p>
              <p className="text-xs text-gray-500 font-medium">أصل البيانات</p>
            </div>
          </div>
        )}

        {/* Sensitivity & Risk Distribution */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3">توزيع الحساسية</h3>
              <div className="space-y-2">
                {Object.entries(stats.sensitivity || {}).map(([level, count]: [string, any]) => {
                  const colors: Record<string, string> = { PUBLIC: 'emerald', INTERNAL: 'blue', CONFIDENTIAL: 'amber', RESTRICTED: 'red' };
                  const labels: Record<string, string> = { PUBLIC: 'عام', INTERNAL: 'داخلي', CONFIDENTIAL: 'سري', RESTRICTED: 'مقيد' };
                  const c = colors[level] || 'gray';
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={level} className="flex items-center gap-3">
                      <span className={`text-xs font-bold w-16 text-${c}-700`}>{labels[level] || level}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-${c}-500 rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-20 text-left">{count?.toLocaleString()} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3">توزيع المخاطر</h3>
              <div className="space-y-2">
                {Object.entries(stats.risk || {}).map(([level, count]: [string, any]) => {
                  const colors: Record<string, string> = { LOW: 'emerald', MEDIUM: 'amber', HIGH: 'orange', CRITICAL: 'red' };
                  const labels: Record<string, string> = { LOW: 'منخفض', MEDIUM: 'متوسط', HIGH: 'مرتفع', CRITICAL: 'حرج' };
                  const c = colors[level] || 'gray';
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={level} className="flex items-center gap-3">
                      <span className={`text-xs font-bold w-16 text-${c}-700`}>{labels[level] || level}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-${c}-500 rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-20 text-left">{count?.toLocaleString()} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pr-10 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="ابحث عن مجموعة بيانات..."
              />
            </div>
            <button onClick={handleSearch} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">
              بحث
            </button>
          </div>
        </div>

        {/* Dataset List */}
        <div className="space-y-2">
          {datasets.map((ds: any) => (
            <div
              key={ds.id}
              onClick={() => navigate(`/datasets/${ds.id}/metadata`)}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm hover:border-blue-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {ds.nameAr || ds.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Database size={12} /> {ds.category}
                    </span>
                    <span>{ds.source}</span>
                    <span>{ds.recordCount?.toLocaleString()} سجل</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ds.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' :
                    ds.verificationStatus === 'NEEDS_REVIEW' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {ds.verificationStatus === 'VERIFIED' ? 'موثّق' : ds.verificationStatus === 'NEEDS_REVIEW' ? 'مراجعة' : 'غير محقق'}
                  </span>
                  <ChevronLeft size={16} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              السابق
            </button>
            <span className="text-sm text-gray-500">صفحة {page} من {Math.ceil(total / 20)}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / 20)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetadataOverviewPage;
