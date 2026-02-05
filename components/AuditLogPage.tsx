/**
 * Audit Log Viewer - سجل التغييرات
 * Admin page to view system audit logs
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Filter, ChevronRight, ChevronLeft, Clock, User, Shield } from 'lucide-react';
import { api, AuditLog } from '../src/services/api';

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  USER_CREATED: { label: 'إنشاء مستخدم', color: 'bg-green-100 text-green-700' },
  USER_UPDATED: { label: 'تحديث مستخدم', color: 'bg-blue-100 text-blue-700' },
  USER_ACTIVATED: { label: 'تفعيل مستخدم', color: 'bg-emerald-100 text-emerald-700' },
  USER_DEACTIVATED: { label: 'تعطيل مستخدم', color: 'bg-red-100 text-red-700' },
  ROLE_CHANGED: { label: 'تغيير الدور', color: 'bg-purple-100 text-purple-700' },
  BULK_ACTIVATE: { label: 'تفعيل جماعي', color: 'bg-emerald-100 text-emerald-700' },
  BULK_DEACTIVATE: { label: 'تعطيل جماعي', color: 'bg-red-100 text-red-700' },
  BULK_CHANGE_ROLE: { label: 'تغيير دور جماعي', color: 'bg-purple-100 text-purple-700' },
};

const ALL_ACTIONS = Object.keys(ACTION_LABELS);

const AuditLogPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterAction, setFilterAction] = useState('');
  const limit = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params: { page: number; limit: number; action?: string } = { page, limit };
    if (filterAction) params.action = filterAction;

    const response = await api.getAuditLogs(params);
    if (response.success && response.data) {
      setLogs(response.data);
      if (response.meta) {
        setTotalPages(response.meta.totalPages || 1);
        setTotal(response.meta.total || 0);
      }
    }
    setLoading(false);
  }, [page, filterAction]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setPage(1);
  }, [filterAction]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-SA', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const parseDetails = (details: string): Record<string, unknown> | null => {
    try {
      return JSON.parse(details);
    } catch {
      return null;
    }
  };

  const getActionBadge = (action: string) => {
    const info = ACTION_LABELS[action] || { label: action, color: 'bg-gray-100 text-gray-600' };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${info.color}`}>
        {info.label}
      </span>
    );
  };

  const renderDetails = (details: string) => {
    const parsed = parseDetails(details);
    if (!parsed) return <span className="text-gray-400 text-xs">{details || '-'}</span>;

    return (
      <div className="text-xs text-gray-500 space-y-0.5">
        {parsed.email && <div>البريد: {String(parsed.email)}</div>}
        {parsed.role && <div>الدور: {String(parsed.role)}</div>}
        {parsed.oldRole && parsed.newRole && (
          <div>{String(parsed.oldRole)} &larr; {String(parsed.newRole)}</div>
        )}
        {parsed.fields && <div>الحقول: {(parsed.fields as string[]).join(', ')}</div>}
        {parsed.count !== undefined && <div>العدد: {String(parsed.count)}</div>}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <ClipboardList size={20} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">سجل التغييرات</h1>
            <p className="text-sm text-gray-400">{total} سجل</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 mb-4 border border-slate-700">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={16} className="text-gray-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-700 text-gray-200 text-sm rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-blue-500"
          >
            <option value="">جميع الإجراءات</option>
            {ALL_ACTIONS.map((a) => (
              <option key={a} value={a}>{ACTION_LABELS[a].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-50" />
            <p>لا توجد سجلات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-gray-400">
                  <th className="text-right px-4 py-3 font-medium">التاريخ</th>
                  <th className="text-right px-4 py-3 font-medium">الإجراء</th>
                  <th className="text-right px-4 py-3 font-medium">المنفذ</th>
                  <th className="text-right px-4 py-3 font-medium">الهدف</th>
                  <th className="text-right px-4 py-3 font-medium">التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-gray-300 text-xs">
                        <Clock size={12} className="text-gray-500" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-gray-300 text-xs">
                        <Shield size={12} className="text-gray-500" />
                        <span className="font-mono">{log.actorId.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-gray-300 text-xs">
                        <User size={12} className="text-gray-500" />
                        <span>{log.targetType}</span>
                        <span className="font-mono text-gray-500">{log.targetId.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {renderDetails(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
            <div className="text-xs text-gray-400">
              صفحة {page} من {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg bg-slate-700 text-gray-300 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg bg-slate-700 text-gray-300 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogPage;
