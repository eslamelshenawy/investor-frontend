/**
 * ============================================
 * USER MANAGEMENT PAGE - صفحة إدارة المستخدمين
 * ============================================
 *
 * صفحة إدارية شاملة لإدارة المستخدمين والأدوار والصلاحيات
 * Comprehensive admin page for managing users, roles, and permissions
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit3,
  Shield,
  ToggleLeft,
  ToggleRight,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  UserPlus,
  Wifi,
} from 'lucide-react';
import { api } from '../src/services/api';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ============================================
// Types & Interfaces
// ============================================

interface AdminUser {
  id: string;
  name: string;
  nameAr?: string;
  email: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  phone?: string;
  bio?: string;
  createdAt: string;
}

interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newThisMonth: number;
}

interface UserFormData {
  name: string;
  nameAr: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  bio: string;
}

// ============================================
// Constants
// ============================================

const VALID_ROLES = [
  'USER',
  'ANALYST',
  'EXPERT',
  'WRITER',
  'DESIGNER',
  'EDITOR',
  'CONTENT_MANAGER',
  'ADMIN',
  'SUPER_ADMIN',
] as const;

const ROLE_DISPLAY_NAMES: Record<string, string> = {
  USER: 'مستخدم عادي',
  ANALYST: 'محلل',
  EXPERT: 'خبير',
  WRITER: 'كاتب',
  DESIGNER: 'مصمم',
  EDITOR: 'محرر',
  CONTENT_MANAGER: 'مدير محتوى',
  ADMIN: 'مدير',
  SUPER_ADMIN: 'مدير عام',
};

const ROLE_COLORS: Record<string, string> = {
  USER: 'bg-gray-100 text-gray-700',
  ANALYST: 'bg-cyan-50 text-cyan-700',
  EXPERT: 'bg-purple-50 text-purple-700',
  WRITER: 'bg-amber-50 text-amber-700',
  DESIGNER: 'bg-pink-50 text-pink-700',
  EDITOR: 'bg-teal-50 text-teal-700',
  CONTENT_MANAGER: 'bg-indigo-50 text-indigo-700',
  ADMIN: 'bg-orange-50 text-orange-700',
  SUPER_ADMIN: 'bg-red-50 text-red-700',
};

const EMPTY_FORM: UserFormData = {
  name: '',
  nameAr: '',
  email: '',
  password: '',
  role: 'USER',
  phone: '',
  bio: '',
};

const PAGE_LIMIT = 10;

// ============================================
// Helper Components
// ============================================

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString('ar-EG')}</p>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colorClass = ROLE_COLORS[role] || 'bg-gray-600 text-gray-100';
  const displayName = ROLE_DISPLAY_NAMES[role] || role;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      <Shield className="w-3 h-3" />
      {displayName}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      نشط
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      غير نشط
    </span>
  );
}

function UserAvatar({ user }: { user: AdminUser }) {
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
      />
    );
  }
  const initials = (user.nameAr || user.name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);
  return (
    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold border-2 border-gray-200">
      {initials}
    </div>
  );
}

// ============================================
// Modal Component
// ============================================

function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Content */}
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Body */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ============================================
// User Form Component
// ============================================

function UserForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  isEdit,
}: {
  formData: UserFormData;
  onChange: (field: keyof UserFormData, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit: boolean;
}) {
  const fieldClass =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

  return (
    <div className="space-y-4">
      {/* Name */}
      <div>
        <label className={labelClass}>الاسم (إنجليزي)</label>
        <input
          type="text"
          className={fieldClass}
          placeholder="Name"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
        />
      </div>

      {/* Name Arabic */}
      <div>
        <label className={labelClass}>الاسم (عربي)</label>
        <input
          type="text"
          className={fieldClass}
          placeholder="الاسم بالعربي"
          value={formData.nameAr}
          onChange={(e) => onChange('nameAr', e.target.value)}
        />
      </div>

      {/* Email */}
      <div>
        <label className={labelClass}>البريد الإلكتروني</label>
        <input
          type="email"
          className={fieldClass}
          placeholder="user@example.com"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          dir="ltr"
        />
      </div>

      {/* Password - only for create */}
      {!isEdit && (
        <div>
          <label className={labelClass}>كلمة المرور</label>
          <input
            type="password"
            className={fieldClass}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => onChange('password', e.target.value)}
            dir="ltr"
          />
        </div>
      )}

      {/* Role */}
      <div>
        <label className={labelClass}>الدور</label>
        <select
          className={fieldClass}
          value={formData.role}
          onChange={(e) => onChange('role', e.target.value)}
        >
          {VALID_ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_DISPLAY_NAMES[role]}
            </option>
          ))}
        </select>
      </div>

      {/* Phone */}
      <div>
        <label className={labelClass}>رقم الهاتف</label>
        <input
          type="tel"
          className={fieldClass}
          placeholder="+966 5XXXXXXXX"
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          dir="ltr"
        />
      </div>

      {/* Bio */}
      <div>
        <label className={labelClass}>النبذة التعريفية</label>
        <textarea
          className={`${fieldClass} resize-none`}
          rows={3}
          placeholder="نبذة مختصرة عن المستخدم..."
          value={formData.bio}
          onChange={(e) => onChange('bio', e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
        >
          {isSubmitting ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {isEdit ? 'تحديث المستخدم' : 'إنشاء المستخدم'}
        </button>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-6 rounded-lg transition-colors"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();

  // ----- State -----
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<UserStats>({ totalUsers: 0, activeUsers: 0, newThisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<UserFormData>({ ...EMPTY_FORM });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [bulkRole, setBulkRole] = useState('USER');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Role change dropdown per row
  const [roleChangeUserId, setRoleChangeUserId] = useState<string | null>(null);
  const [roleChangeValue, setRoleChangeValue] = useState('');

  const [streaming, setStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // ----- SSE Stream Data (WebFlux) -----

  const streamUsers = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setLoading(true);
    setStreaming(true);
    setError(null);
    setUsers([]);

    const token = localStorage.getItem('investor_radar_auth_token');
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (roleFilter) params.append('role', roleFilter);
    if (activeFilter === 'active') params.append('isActive', 'true');
    if (activeFilter === 'inactive') params.append('isActive', 'false');
    if (token) params.append('token', token);

    const url = `${API_BASE_URL}/admin/users/stream${params.toString() ? '?' + params.toString() : ''}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    const streamedUsers: AdminUser[] = [];

    eventSource.addEventListener('start', (e) => {
      try {
        const data = JSON.parse(e.data);
        setTotalUsers(data.total || 0);
        setTotalPages(Math.ceil((data.total || 0) / PAGE_LIMIT) || 1);
      } catch {}
      setLoading(false);
    });

    eventSource.addEventListener('user', (e) => {
      try {
        const user = JSON.parse(e.data);
        streamedUsers.push(user);
        setUsers(prev => {
          if (prev.some(u => u.id === user.id)) return prev;
          return [...prev, user];
        });
      } catch {}
    });

    eventSource.addEventListener('complete', () => {
      setStreaming(false);
      setLoading(false);
      eventSource.close();
      // Compute stats from streamed users
      const now = new Date();
      setStats({
        totalUsers: streamedUsers.length,
        activeUsers: streamedUsers.filter(u => u.isActive).length,
        newThisMonth: streamedUsers.filter(u => {
          const created = new Date(u.createdAt);
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }).length,
      });
    });

    eventSource.onerror = () => {
      eventSource.close();
      setStreaming(false);
      fetchUsersRest();
    };
  }, [searchQuery, roleFilter, activeFilter]);

  // REST fallback
  const fetchUsersRest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        page,
        limit: PAGE_LIMIT,
        sort: 'createdAt',
        order: 'desc' as const,
      };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (roleFilter) params.role = roleFilter;
      if (activeFilter === 'active') params.isActive = true;
      if (activeFilter === 'inactive') params.isActive = false;

      const response: UsersResponse = await api.getAdminUsers(params);
      setUsers(response.users || []);
      setTotalPages(response.totalPages || 1);
      setTotalUsers(response.total || 0);

      setStats({
        totalUsers: response.total || 0,
        activeUsers: (response.users || []).filter((u) => u.isActive).length,
        newThisMonth: (response.users || []).filter((u) => {
          const created = new Date(u.createdAt);
          const now = new Date();
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }).length,
      });
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء تحميل المستخدمين');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, roleFilter, activeFilter]);

  const fetchUsers = fetchUsersRest;

  useEffect(() => {
    streamUsers();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [streamUsers]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, roleFilter, activeFilter]);

  // Clear selection on data change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [users]);

  // ----- Form Handlers -----

  const handleFormChange = useCallback((field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const openCreateModal = useCallback(() => {
    setFormData({ ...EMPTY_FORM });
    setShowCreateModal(true);
  }, []);

  const openEditModal = useCallback((user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      nameAr: user.nameAr || '',
      email: user.email || '',
      password: '',
      role: user.role || 'USER',
      phone: user.phone || '',
      bio: user.bio || '',
    });
    setShowEditModal(true);
  }, []);

  const closeModals = useCallback(() => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingUser(null);
    setFormData({ ...EMPTY_FORM });
  }, []);

  // ----- API Actions -----

  const handleCreateUser = useCallback(async () => {
    if (!formData.name || !formData.email || !formData.password) {
      return;
    }
    setIsSubmitting(true);
    try {
      await api.createAdminUser({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        nameAr: formData.nameAr || undefined,
        role: formData.role,
        bio: formData.bio || undefined,
        phone: formData.phone || undefined,
      });
      closeModals();
      fetchUsers();
    } catch (err: any) {
      setError(err?.message || 'فشل في إنشاء المستخدم');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, closeModals, fetchUsers]);

  const handleUpdateUser = useCallback(async () => {
    if (!editingUser || !formData.name || !formData.email) {
      return;
    }
    setIsSubmitting(true);
    try {
      await api.updateAdminUser(editingUser.id, {
        name: formData.name,
        nameAr: formData.nameAr || undefined,
        email: formData.email,
        bio: formData.bio || undefined,
        phone: formData.phone || undefined,
      });

      // If role changed, update it separately
      if (formData.role !== editingUser.role) {
        await api.updateAdminUserRole(editingUser.id, formData.role);
      }

      closeModals();
      fetchUsers();
    } catch (err: any) {
      setError(err?.message || 'فشل في تحديث المستخدم');
    } finally {
      setIsSubmitting(false);
    }
  }, [editingUser, formData, closeModals, fetchUsers]);

  const handleToggleStatus = useCallback(
    async (userId: string) => {
      try {
        await api.toggleAdminUserStatus(userId);
        fetchUsers();
      } catch (err: any) {
        setError(err?.message || 'فشل في تغيير حالة المستخدم');
      }
    },
    [fetchUsers],
  );

  const handleChangeRole = useCallback(
    async (userId: string, newRole: string) => {
      try {
        await api.updateAdminUserRole(userId, newRole);
        setRoleChangeUserId(null);
        fetchUsers();
      } catch (err: any) {
        setError(err?.message || 'فشل في تغيير الدور');
      }
    },
    [fetchUsers],
  );

  // ----- Bulk Actions -----

  const allSelected = useMemo(
    () => users.length > 0 && users.every((u) => selectedIds.has(u.id)),
    [users, selectedIds],
  );

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  }, [allSelected, users]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleBulkAction = useCallback(async () => {
    if (selectedIds.size === 0 || !bulkAction) return;
    setIsBulkProcessing(true);
    try {
      const userIds = Array.from(selectedIds);
      if (bulkAction === 'changeRole') {
        await api.bulkUserAction(userIds, 'changeRole', bulkRole);
      } else {
        await api.bulkUserAction(userIds, bulkAction);
      }
      setBulkAction('');
      fetchUsers();
    } catch (err: any) {
      setError(err?.message || 'فشل في تنفيذ الإجراء الجماعي');
    } finally {
      setIsBulkProcessing(false);
    }
  }, [selectedIds, bulkAction, bulkRole, fetchUsers]);

  // ----- Date formatting -----

  const formatDate = useCallback((dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }, []);

  // ============================================
  // Render
  // ============================================

  return (
    <div dir="rtl" className="px-4 py-6 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* ---- Page Header ---- */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
              <p className="text-sm text-gray-500">إدارة وتنظيم حسابات المستخدمين والأدوار</p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4" />
            مستخدم جديد
          </button>
        </div>

        {/* ---- Error Banner ---- */}
        {error && (
          <div className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-center gap-2">
              <X className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ---- Streaming Indicator ---- */}
        {streaming && users.length > 0 && (
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-600">
              <Wifi className="h-4 w-4 animate-pulse" />
              <span>جاري تحميل المستخدمين...</span>
            </div>
          </div>
        )}

        {/* ---- Stats Bar ---- */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="إجمالي المستخدمين"
            value={stats.totalUsers}
            icon={Users}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            label="المستخدمون النشطون"
            value={stats.activeUsers}
            icon={ToggleRight}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            label="جدد هذا الشهر"
            value={stats.newThisMonth}
            icon={UserPlus}
            color="bg-purple-100 text-purple-600"
          />
        </div>

        {/* ---- Search & Filters ---- */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="بحث بالاسم أو البريد الإلكتروني..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <select
              className="min-w-[160px] rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">جميع الأدوار</option>
              {VALID_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_DISPLAY_NAMES[role]}
                </option>
              ))}
            </select>

            {/* Active Filter */}
            <select
              className="min-w-[140px] rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <option value="">الكل</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>
        </div>

        {/* ---- Bulk Actions Bar ---- */}
        {selectedIds.size > 0 && (
          <div className="mb-4 flex flex-col items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center">
            <span className="text-blue-700 text-sm font-medium">
              تم تحديد {selectedIds.size} مستخدم
            </span>
            <div className="flex items-center gap-2 flex-1">
              <select
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
              >
                <option value="">اختر إجراء...</option>
                <option value="activate">تفعيل</option>
                <option value="deactivate">إلغاء التفعيل</option>
                <option value="changeRole">تغيير الدور</option>
              </select>

              {bulkAction === 'changeRole' && (
                <select
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={bulkRole}
                  onChange={(e) => setBulkRole(e.target.value)}
                >
                  {VALID_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_DISPLAY_NAMES[role]}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || isBulkProcessing}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {isBulkProcessing ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                تنفيذ
              </button>

              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                إلغاء التحديد
              </button>
            </div>
          </div>
        )}

        {/* ---- Users Table ---- */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading && users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Wifi className="mb-3 h-6 w-6 animate-pulse text-blue-500" />
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
              <p className="mt-3 text-sm text-gray-500">جاري تحميل المستخدمين...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Users className="mb-3 h-12 w-12" />
              <p className="text-lg font-medium">لا توجد نتائج</p>
              <p className="text-sm">حاول تغيير معايير البحث أو الفلاتر</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="p-4 text-right">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                      />
                    </th>
                    <th className="p-4 text-right text-xs font-medium text-gray-500">المستخدم</th>
                    <th className="p-4 text-right text-xs font-medium text-gray-500">الدور</th>
                    <th className="p-4 text-right text-xs font-medium text-gray-500">الحالة</th>
                    <th className="p-4 text-right text-xs font-medium text-gray-500">تاريخ الإنشاء</th>
                    <th className="p-4 text-right text-xs font-medium text-gray-500">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedIds.has(user.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(user.id)}
                          onChange={() => toggleSelect(user.id)}
                          className="w-4 h-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                        />
                      </td>

                      {/* Avatar + Name + Email */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} />
                          <div>
                            <p className="text-gray-900 font-medium text-sm">
                              {user.nameAr || user.name}
                            </p>
                            <p className="text-gray-500 text-xs" dir="ltr">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        {roleChangeUserId === user.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              className="bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                              value={roleChangeValue}
                              onChange={(e) => setRoleChangeValue(e.target.value)}
                              autoFocus
                            >
                              {VALID_ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {ROLE_DISPLAY_NAMES[r]}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleChangeRole(user.id, roleChangeValue)}
                              className="p-1 rounded bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setRoleChangeUserId(null)}
                              className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setRoleChangeUserId(user.id);
                              setRoleChangeValue(user.role);
                            }}
                            className="group"
                            title="تغيير الدور"
                          >
                            <RoleBadge role={user.role} />
                          </button>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <StatusBadge isActive={user.isActive} />
                      </td>

                      {/* Created At */}
                      <td className="p-4">
                        <span className="text-gray-500 text-sm">{formatDate(user.createdAt)}</span>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="تعديل"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Toggle Active */}
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.isActive
                                ? 'text-green-600 hover:text-red-600 hover:bg-red-50'
                                : 'text-red-600 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={user.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                          >
                            {user.isActive ? (
                              <ToggleRight className="w-5 h-5" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </button>

                          {/* Change Role (shortcut) */}
                          <button
                            onClick={() => {
                              setRoleChangeUserId(user.id);
                              setRoleChangeValue(user.role);
                            }}
                            className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            title="تغيير الدور"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ---- Pagination ---- */}
          {!loading && users.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 p-4">
              <p className="text-sm text-gray-500">
                عرض {(page - 1) * PAGE_LIMIT + 1} - {Math.min(page * PAGE_LIMIT, totalUsers)} من {totalUsers}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
                        pageNum === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- Create User Modal ---- */}
      <Modal isOpen={showCreateModal} onClose={closeModals} title="إنشاء مستخدم جديد">
        <UserForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleCreateUser}
          onCancel={closeModals}
          isSubmitting={isSubmitting}
          isEdit={false}
        />
      </Modal>

      {/* ---- Edit User Modal ---- */}
      <Modal isOpen={showEditModal} onClose={closeModals} title="تعديل المستخدم">
        <UserForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleUpdateUser}
          onCancel={closeModals}
          isSubmitting={isSubmitting}
          isEdit={true}
        />
      </Modal>
    </div>
  );
}
