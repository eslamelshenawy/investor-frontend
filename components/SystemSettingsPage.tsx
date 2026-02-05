/**
 * ============================================
 * SYSTEM SETTINGS PAGE - إعدادات النظام
 * ============================================
 *
 * صفحة إعدادات النظام الشاملة للمديرين
 * Comprehensive system settings page for admins
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Shield,
  Mail,
  Brain,
  Server,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Globe,
  Clock,
  Lock,
  Wifi,
  HardDrive,
} from 'lucide-react';
import api from '../src/services/api';

// ============================================
// TYPES - الأنواع
// ============================================

interface GeneralSettings {
  platformName: string;
  platformDescription: string;
  maintenanceMode: boolean;
  defaultLanguage: string;
}

interface DataSettings {
  autoSync: boolean;
  syncInterval: number;
  cacheRefreshInterval: number;
  dataRetentionDays: number;
  lastSyncStatus: 'success' | 'failed' | 'running' | 'never';
  lastSyncTime: string;
}

interface SecuritySettings {
  sessionTimeout: number;
  maxLoginAttempts: number;
  minPasswordLength: number;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  rateLimitRequests: number;
  rateLimitWindow: number;
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  fromEmail: string;
  fromName: string;
}

interface AISettings {
  provider: 'openai' | 'gemini';
  model: string;
  autoAnalysis: boolean;
  contentGeneration: boolean;
}

interface SystemInfo {
  serverStatus: 'online' | 'offline' | 'degraded';
  databaseStatus: 'online' | 'offline' | 'degraded';
  redisStatus: 'online' | 'offline' | 'degraded';
  lastRestart: string;
  version: string;
  nodeVersion: string;
  uptime: string;
}

// ============================================
// TOAST NOTIFICATION - إشعار منبثق
// ============================================

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

let toastIdCounter = 0;

const ToastContainer: React.FC<{ toasts: Toast[]; onDismiss: (id: number) => void }> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-6 left-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border backdrop-blur-sm transition-all duration-300 animate-slide-in cursor-pointer ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
          onClick={() => onDismiss(toast.id)}
        >
          {toast.type === 'success' ? (
            <CheckCircle size={20} className="text-green-600 shrink-0" />
          ) : (
            <AlertTriangle size={20} className="text-red-600 shrink-0" />
          )}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

// ============================================
// TOGGLE SWITCH - مفتاح التبديل
// ============================================

const ToggleSwitch: React.FC<{
  enabled: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}> = ({ enabled, onChange, label, description }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
          enabled ? 'bg-amber-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
            enabled ? '-translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

// ============================================
// SECTION CARD - بطاقة القسم
// ============================================

const SectionCard: React.FC<{
  title: string;
  titleAr: string;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
  onSave?: () => void;
  saving?: boolean;
  readOnly?: boolean;
}> = ({ title, titleAr, icon: Icon, iconColor, children, onSave, saving, readOnly }) => {
  const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-500/20' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-500/20' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-500/20' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-500/20' },
    green: { bg: 'bg-green-50', text: 'text-green-600', ring: 'ring-green-500/20' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-600', ring: 'ring-slate-500/20' },
  };
  const colors = colorMap[iconColor] || colorMap.amber;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Section Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 ${colors.bg} ${colors.text} rounded-xl flex items-center justify-center ring-4 ${colors.ring}`}
          >
            <Icon size={22} />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900">{titleAr}</h3>
            <p className="text-xs text-gray-400 font-medium">{title}</p>
          </div>
        </div>
        {onSave && !readOnly && (
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {saving ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>{saving ? 'جاري الحفظ...' : 'حفظ'}</span>
          </button>
        )}
      </div>

      {/* Section Content */}
      <div className="px-6 py-5">{children}</div>
    </div>
  );
};

// ============================================
// INPUT FIELD - حقل الإدخال
// ============================================

const InputField: React.FC<{
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  type?: 'text' | 'number' | 'email';
  placeholder?: string;
  description?: string;
  readOnly?: boolean;
  suffix?: string;
}> = ({ label, value, onChange, type = 'text', placeholder, description, readOnly, suffix }) => {
  return (
    <div className="py-2">
      <label className="block text-sm font-bold text-gray-800 mb-1.5">{label}</label>
      {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 ${
            readOnly
              ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
              : 'bg-white text-gray-900 hover:border-gray-300'
          } ${suffix ? 'pl-16' : ''}`}
        />
        {suffix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================
// SELECT FIELD - حقل الاختيار
// ============================================

const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  description?: string;
}> = ({ label, value, onChange, options, description }) => {
  return (
    <div className="py-2">
      <label className="block text-sm font-bold text-gray-800 mb-1.5">{label}</label>
      {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 hover:border-gray-300 cursor-pointer appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// ============================================
// STATUS BADGE - شارة الحالة
// ============================================

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    online: { label: 'متصل', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    offline: { label: 'غير متصل', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    degraded: { label: 'متدهور', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    success: { label: 'ناجح', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    failed: { label: 'فشل', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    running: { label: 'قيد التشغيل', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    never: { label: 'لم يتم', bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
  };

  const c = config[status] || config.never;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot} ${status === 'online' || status === 'running' ? 'animate-pulse' : ''}`} />
      {c.label}
    </span>
  );
};

// ============================================
// MAIN COMPONENT - المكون الرئيسي
// ============================================

const SystemSettingsPage: React.FC = () => {
  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Saving states per section
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingData, setSavingData] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingAI, setSavingAI] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  // General Settings state
  const [general, setGeneral] = useState<GeneralSettings>({
    platformName: 'رادار المستثمر',
    platformDescription: 'منصة ذكية لتحليل بيانات الاستثمار في المملكة العربية السعودية',
    maintenanceMode: false,
    defaultLanguage: 'ar',
  });

  // Data Settings state
  const [data, setData] = useState<DataSettings>({
    autoSync: true,
    syncInterval: 60,
    cacheRefreshInterval: 30,
    dataRetentionDays: 365,
    lastSyncStatus: 'success',
    lastSyncTime: new Date().toISOString(),
  });

  // Security Settings state
  const [security, setSecurity] = useState<SecuritySettings>({
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    minPasswordLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    rateLimitRequests: 100,
    rateLimitWindow: 15,
  });

  // Email Settings state
  const [email, setEmail] = useState<EmailSettings>({
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    fromEmail: 'noreply@al-investor.com',
    fromName: 'رادار المستثمر',
  });

  // AI Settings state
  const [ai, setAI] = useState<AISettings>({
    provider: 'openai',
    model: 'gpt-4o',
    autoAnalysis: true,
    contentGeneration: false,
  });

  // System Info state
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    serverStatus: 'online',
    databaseStatus: 'online',
    redisStatus: 'online',
    lastRestart: new Date(Date.now() - 86400000 * 3).toISOString(),
    version: '1.0.0',
    nodeVersion: 'v20.11.0',
    uptime: '3 أيام، 14 ساعة',
  });

  // ============================================
  // TOAST HELPERS
  // ============================================

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ============================================
  // LOAD SETTINGS (placeholder - backend doesn't exist yet)
  // ============================================

  useEffect(() => {
    // In the future, load settings from the backend:
    // const loadSettings = async () => {
    //   try {
    //     const res = await api.get('/admin/settings');
    //     if (res.data) { ... }
    //   } catch (err) { ... }
    // };
    // loadSettings();
  }, []);

  // ============================================
  // SAVE HANDLERS
  // ============================================

  const simulateSave = async (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    sectionName: string,
    _payload: Record<string, unknown>
  ) => {
    setter(true);
    try {
      // Future: await api.put('/admin/settings', { section: sectionName, ...payload });
      await new Promise((resolve) => setTimeout(resolve, 800));
      showToast(`تم حفظ ${sectionName} بنجاح`);
    } catch {
      showToast(`فشل في حفظ ${sectionName}`, 'error');
    } finally {
      setter(false);
    }
  };

  const handleSaveGeneral = () => {
    simulateSave(setSavingGeneral, 'الإعدادات العامة', { ...general });
  };

  const handleSaveData = () => {
    simulateSave(setSavingData, 'إعدادات البيانات', { ...data });
  };

  const handleSaveSecurity = () => {
    simulateSave(setSavingSecurity, 'إعدادات الأمان', { ...security });
  };

  const handleSaveEmail = () => {
    simulateSave(setSavingEmail, 'إعدادات البريد', { ...email });
  };

  const handleSaveAI = () => {
    simulateSave(setSavingAI, 'إعدادات الذكاء الاصطناعي', { ...ai });
  };

  const handleSendTestEmail = async () => {
    setSendingTestEmail(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      showToast('تم إرسال البريد التجريبي بنجاح');
    } catch {
      showToast('فشل في إرسال البريد التجريبي', 'error');
    } finally {
      setSendingTestEmail(false);
    }
  };

  // ============================================
  // AI MODEL OPTIONS
  // ============================================

  const aiModelOptions =
    ai.provider === 'openai'
      ? [
          { value: 'gpt-4o', label: 'GPT-4o' },
          { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
          { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
        ]
      : [
          { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
          { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
          { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
        ];

  // ============================================
  // FORMAT HELPERS
  // ============================================

  const formatDateTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="p-6 max-w-5xl mx-auto" dir="rtl">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center ring-4 ring-amber-500/20">
            <Settings size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">إعدادات النظام</h1>
            <p className="text-sm text-gray-500 font-medium">System Settings</p>
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-3 mr-15">
          إدارة وتهيئة جميع إعدادات المنصة والأمان والخدمات المتصلة
        </p>
      </div>

      {/* Sections Grid */}
      <div className="space-y-6">
        {/* ===== 1. General Settings ===== */}
        <SectionCard
          title="General Settings"
          titleAr="إعدادات عامة"
          icon={Globe}
          iconColor="amber"
          onSave={handleSaveGeneral}
          saving={savingGeneral}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            <InputField
              label="اسم المنصة"
              value={general.platformName}
              onChange={(val) => setGeneral((prev) => ({ ...prev, platformName: val }))}
              placeholder="أدخل اسم المنصة"
            />
            <SelectField
              label="اللغة الافتراضية"
              value={general.defaultLanguage}
              onChange={(val) => setGeneral((prev) => ({ ...prev, defaultLanguage: val }))}
              options={[
                { value: 'ar', label: 'العربية' },
                { value: 'en', label: 'English' },
              ]}
            />
            <div className="md:col-span-2">
              <InputField
                label="وصف المنصة"
                value={general.platformDescription}
                onChange={(val) => setGeneral((prev) => ({ ...prev, platformDescription: val }))}
                placeholder="أدخل وصف المنصة"
              />
            </div>
            <div className="md:col-span-2 border-t border-gray-100 mt-2 pt-2">
              <ToggleSwitch
                enabled={general.maintenanceMode}
                onChange={(val) => setGeneral((prev) => ({ ...prev, maintenanceMode: val }))}
                label="وضع الصيانة"
                description="عند التفعيل، سيظهر للزوار صفحة صيانة بدلاً من المنصة"
              />
              {general.maintenanceMode && (
                <div className="flex items-center gap-2 mt-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                  <span className="text-xs text-amber-700 font-semibold">
                    تنبيه: وضع الصيانة مفعّل - المنصة غير متاحة للمستخدمين حالياً
                  </span>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ===== 2. Data Settings ===== */}
        <SectionCard
          title="Data Settings"
          titleAr="إعدادات البيانات"
          icon={Database}
          iconColor="blue"
          onSave={handleSaveData}
          saving={savingData}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            <div className="md:col-span-2">
              <ToggleSwitch
                enabled={data.autoSync}
                onChange={(val) => setData((prev) => ({ ...prev, autoSync: val }))}
                label="المزامنة التلقائية"
                description="مزامنة البيانات تلقائياً من المصادر الخارجية"
              />
            </div>
            {data.autoSync && (
              <InputField
                label="فاصل المزامنة (دقيقة)"
                value={data.syncInterval}
                onChange={(val) => setData((prev) => ({ ...prev, syncInterval: parseInt(val) || 0 }))}
                type="number"
                suffix="دقيقة"
                description="الفاصل الزمني بين كل عملية مزامنة تلقائية"
              />
            )}
            <InputField
              label="فاصل تحديث الكاش (دقيقة)"
              value={data.cacheRefreshInterval}
              onChange={(val) => setData((prev) => ({ ...prev, cacheRefreshInterval: parseInt(val) || 0 }))}
              type="number"
              suffix="دقيقة"
              description="الفاصل الزمني لتحديث البيانات المخزنة مؤقتاً"
            />
            <InputField
              label="فترة الاحتفاظ بالبيانات (يوم)"
              value={data.dataRetentionDays}
              onChange={(val) => setData((prev) => ({ ...prev, dataRetentionDays: parseInt(val) || 0 }))}
              type="number"
              suffix="يوم"
              description="عدد الأيام للاحتفاظ بالبيانات القديمة قبل الحذف"
            />

            {/* Last Sync Status */}
            <div className="md:col-span-2 border-t border-gray-100 mt-3 pt-4">
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <RefreshCw size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-bold text-gray-800">آخر مزامنة</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(data.lastSyncTime)}</p>
                  </div>
                </div>
                <StatusBadge status={data.lastSyncStatus} />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ===== 3. Security Settings ===== */}
        <SectionCard
          title="Security Settings"
          titleAr="إعدادات الأمان"
          icon={Shield}
          iconColor="rose"
          onSave={handleSaveSecurity}
          saving={savingSecurity}
        >
          <div className="space-y-4">
            {/* Session & Login */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lock size={15} className="text-gray-400" />
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">الجلسات وتسجيل الدخول</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                <InputField
                  label="مهلة الجلسة (دقيقة)"
                  value={security.sessionTimeout}
                  onChange={(val) => setSecurity((prev) => ({ ...prev, sessionTimeout: parseInt(val) || 0 }))}
                  type="number"
                  suffix="دقيقة"
                  description="مدة الخمول قبل تسجيل الخروج التلقائي"
                />
                <InputField
                  label="الحد الأقصى لمحاولات الدخول"
                  value={security.maxLoginAttempts}
                  onChange={(val) => setSecurity((prev) => ({ ...prev, maxLoginAttempts: parseInt(val) || 0 }))}
                  type="number"
                  description="عدد المحاولات الفاشلة قبل قفل الحساب مؤقتاً"
                />
              </div>
            </div>

            {/* Password Policy */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={15} className="text-gray-400" />
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">سياسة كلمة المرور</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                <InputField
                  label="الحد الأدنى لطول كلمة المرور"
                  value={security.minPasswordLength}
                  onChange={(val) => setSecurity((prev) => ({ ...prev, minPasswordLength: parseInt(val) || 0 }))}
                  type="number"
                  description="الحد الأدنى لعدد الأحرف في كلمة المرور"
                />
                <div /> {/* spacer */}
                <ToggleSwitch
                  enabled={security.requireUppercase}
                  onChange={(val) => setSecurity((prev) => ({ ...prev, requireUppercase: val }))}
                  label="اشتراط أحرف كبيرة"
                  description="يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل"
                />
                <ToggleSwitch
                  enabled={security.requireNumbers}
                  onChange={(val) => setSecurity((prev) => ({ ...prev, requireNumbers: val }))}
                  label="اشتراط أرقام"
                  description="يجب أن تحتوي كلمة المرور على رقم واحد على الأقل"
                />
                <ToggleSwitch
                  enabled={security.requireSpecialChars}
                  onChange={(val) => setSecurity((prev) => ({ ...prev, requireSpecialChars: val }))}
                  label="اشتراط رموز خاصة"
                  description="يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل (!@#$...)"
                />
              </div>
            </div>

            {/* Rate Limiting */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={15} className="text-gray-400" />
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">تحديد معدل الطلبات</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                <InputField
                  label="الحد الأقصى للطلبات"
                  value={security.rateLimitRequests}
                  onChange={(val) => setSecurity((prev) => ({ ...prev, rateLimitRequests: parseInt(val) || 0 }))}
                  type="number"
                  description="الحد الأقصى لعدد الطلبات المسموح بها"
                />
                <InputField
                  label="نافذة التحديد (دقيقة)"
                  value={security.rateLimitWindow}
                  onChange={(val) => setSecurity((prev) => ({ ...prev, rateLimitWindow: parseInt(val) || 0 }))}
                  type="number"
                  suffix="دقيقة"
                  description="الفترة الزمنية لتطبيق حد الطلبات"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ===== 4. Email Settings ===== */}
        <SectionCard
          title="Email Settings"
          titleAr="إعدادات البريد"
          icon={Mail}
          iconColor="purple"
          onSave={handleSaveEmail}
          saving={savingEmail}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            <InputField
              label="خادم SMTP"
              value={email.smtpHost}
              onChange={(val) => setEmail((prev) => ({ ...prev, smtpHost: val }))}
              placeholder="smtp.example.com"
              readOnly
              description="عنوان خادم البريد (يتم تعيينه من متغيرات البيئة)"
            />
            <InputField
              label="منفذ SMTP"
              value={email.smtpPort}
              onChange={(val) => setEmail((prev) => ({ ...prev, smtpPort: parseInt(val) || 0 }))}
              type="number"
              readOnly
              description="رقم المنفذ (يتم تعيينه من متغيرات البيئة)"
            />
            <InputField
              label="البريد المرسل"
              value={email.fromEmail}
              onChange={(val) => setEmail((prev) => ({ ...prev, fromEmail: val }))}
              type="email"
              placeholder="noreply@example.com"
            />
            <InputField
              label="اسم المرسل"
              value={email.fromName}
              onChange={(val) => setEmail((prev) => ({ ...prev, fromName: val }))}
              placeholder="اسم المنصة"
            />

            {/* Test Email Button */}
            <div className="md:col-span-2 border-t border-gray-100 mt-3 pt-4">
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4">
                <div>
                  <p className="text-sm font-bold text-gray-800">إرسال بريد تجريبي</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    إرسال رسالة تجريبية للتأكد من صحة إعدادات البريد
                  </p>
                </div>
                <button
                  onClick={handleSendTestEmail}
                  disabled={sendingTestEmail}
                  className="flex items-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {sendingTestEmail ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Mail size={16} />
                  )}
                  <span>{sendingTestEmail ? 'جاري الإرسال...' : 'إرسال تجريبي'}</span>
                </button>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ===== 5. AI Settings ===== */}
        <SectionCard
          title="AI Settings"
          titleAr="إعدادات الذكاء الاصطناعي"
          icon={Brain}
          iconColor="green"
          onSave={handleSaveAI}
          saving={savingAI}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            <SelectField
              label="مزود الذكاء الاصطناعي"
              value={ai.provider}
              onChange={(val) => {
                const provider = val as 'openai' | 'gemini';
                setAI((prev) => ({
                  ...prev,
                  provider,
                  model: provider === 'openai' ? 'gpt-4o' : 'gemini-2.0-flash',
                }));
              }}
              options={[
                { value: 'openai', label: 'OpenAI' },
                { value: 'gemini', label: 'Google Gemini' },
              ]}
              description="اختر مزود خدمة الذكاء الاصطناعي"
            />
            <SelectField
              label="النموذج"
              value={ai.model}
              onChange={(val) => setAI((prev) => ({ ...prev, model: val }))}
              options={aiModelOptions}
              description="اختر النموذج المستخدم للتحليل والمحتوى"
            />
            <ToggleSwitch
              enabled={ai.autoAnalysis}
              onChange={(val) => setAI((prev) => ({ ...prev, autoAnalysis: val }))}
              label="التحليل التلقائي"
              description="تحليل البيانات الجديدة تلقائياً عند وصولها"
            />
            <ToggleSwitch
              enabled={ai.contentGeneration}
              onChange={(val) => setAI((prev) => ({ ...prev, contentGeneration: val }))}
              label="توليد المحتوى"
              description="السماح بتوليد محتوى تلقائي بالذكاء الاصطناعي"
            />
          </div>
        </SectionCard>

        {/* ===== 6. System Info (Read-Only) ===== */}
        <SectionCard
          title="System Info"
          titleAr="معلومات النظام"
          icon={Server}
          iconColor="slate"
          readOnly
        >
          <div className="space-y-4">
            {/* Service Status Grid */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Wifi size={15} className="text-gray-400" />
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">حالة الخدمات</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Server Status */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-100">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Server size={18} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">الخادم</p>
                    <p className="text-sm font-bold text-gray-800">Server</p>
                  </div>
                  <StatusBadge status={systemInfo.serverStatus} />
                </div>

                {/* Database Status */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-100">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <HardDrive size={18} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">قاعدة البيانات</p>
                    <p className="text-sm font-bold text-gray-800">PostgreSQL</p>
                  </div>
                  <StatusBadge status={systemInfo.databaseStatus} />
                </div>

                {/* Redis Status */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-100">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Database size={18} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">الكاش</p>
                    <p className="text-sm font-bold text-gray-800">Redis</p>
                  </div>
                  <StatusBadge status={systemInfo.redisStatus} />
                </div>
              </div>
            </div>

            {/* System Details */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Settings size={15} className="text-gray-400" />
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">تفاصيل النظام</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <span className="text-sm text-gray-500">إصدار المنصة</span>
                  <span className="text-sm font-bold text-gray-800 font-mono">{systemInfo.version}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <span className="text-sm text-gray-500">إصدار Node.js</span>
                  <span className="text-sm font-bold text-gray-800 font-mono">{systemInfo.nodeVersion}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <span className="text-sm text-gray-500">وقت التشغيل</span>
                  <span className="text-sm font-bold text-gray-800">{systemInfo.uptime}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <span className="text-sm text-gray-500">آخر إعادة تشغيل</span>
                  <span className="text-sm font-bold text-gray-800">{formatDateTime(systemInfo.lastRestart)}</span>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Bottom Spacer */}
      <div className="h-8" />

      {/* Inline Animation Styles */}
      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SystemSettingsPage;
