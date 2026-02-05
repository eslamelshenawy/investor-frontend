/**
 * Notifications Page - صفحة الإشعارات
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Loader2,
  RefreshCw,
  Zap,
  Database,
  FileText,
  Users,
  MessageSquare,
  Star,
  AlertCircle,
  Clock,
} from 'lucide-react';
import api from '../src/services/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

const NotificationIcon = ({ type }: { type: string }) => {
  const iconMap: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    signal: { icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    dataset: { icon: Database, color: 'text-blue-600', bg: 'bg-blue-50' },
    content: { icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    follow: { icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    comment: { icon: MessageSquare, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    like: { icon: Star, color: 'text-rose-600', bg: 'bg-rose-50' },
    system: { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-50' },
  };

  const config = iconMap[type] || iconMap.system;
  const Icon = config.icon;

  return (
    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
      <Icon size={20} className={config.color} />
    </div>
  );
};

const timeAgo = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'الآن';
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  if (diff < 604800) return `منذ ${Math.floor(diff / 86400)} يوم`;
  return date.toLocaleDateString('ar-SA');
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    const response = await api.getNotifications({
      unreadOnly: filter === 'unread',
      page,
      limit: 20,
    });

    if (response.success && response.data) {
      const data = response.data as any;
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      if (data.meta) {
        setTotalPages(data.meta.totalPages || 1);
      }
    }
    setIsLoading(false);
  }, [filter, page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    const response = await api.markNotificationRead(id);
    if (response.success) {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllRead = async () => {
    const response = await api.markAllNotificationsRead();
    if (response.success) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="text-blue-600" />
            الإشعارات
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `لديك ${unreadCount} إشعار غير مقروء` : 'لا توجد إشعارات جديدة'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotifications}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="تحديث"
          >
            <RefreshCw size={18} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-blue-100"
            >
              <CheckCheck size={16} />
              قراءة الكل
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm w-fit">
        <button
          onClick={() => { setFilter('all'); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'all'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          الكل
        </button>
        <button
          onClick={() => { setFilter('unread'); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
            filter === 'unread'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          غير مقروء
          {unreadCount > 0 && (
            <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
              filter === 'unread' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'
            }`}>
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-600" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <BellOff size={48} className="mb-4 opacity-50" />
          <p className="text-lg font-medium">
            {filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات'}
          </p>
          <p className="text-sm mt-1">ستظهر هنا الإشعارات عند وصولها</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer group ${
                notification.isRead
                  ? 'bg-white border-gray-100 hover:border-gray-200'
                  : 'bg-blue-50/50 border-blue-100 hover:border-blue-200 shadow-sm'
              }`}
              onClick={() => !notification.isRead && handleMarkRead(notification.id)}
            >
              <NotificationIcon type={notification.type} />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-sm font-medium leading-snug ${
                    notification.isRead ? 'text-gray-700' : 'text-gray-900 font-bold'
                  }`}>
                    {notification.titleAr || notification.title}
                  </h3>
                  {!notification.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">
                  {notification.messageAr || notification.message}
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                  <Clock size={12} />
                  {timeAgo(notification.createdAt)}
                </div>
              </div>

              {!notification.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkRead(notification.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  title="تحديد كمقروء"
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            السابق
          </button>
          <span className="px-3 py-2 text-sm text-gray-500">
            {page} من {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
