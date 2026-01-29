/**
 * ======================================
 * APP CONFIGURATION - تكوينات التطبيق
 * ======================================
 * 
 * الإعدادات العامة للتطبيق
 * General application configuration settings
 */

export const APP_CONFIG = {
    name: 'رادار المستثمر',
    nameEn: 'Investor Radar',
    version: '1.0.0',
    description: 'منصة تحليل البيانات الاقتصادية والاستثمارية',
    descriptionEn: 'Economic and Investment Data Analysis Platform',
} as const;

/**
 * ======================================
 * API CONFIGURATION - إعدادات API
 * ======================================
 */

export const API_CONFIG = {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
} as const;

/**
 * ======================================
 * STORAGE KEYS - مفاتيح التخزين
 * ======================================
 * 
 * مفاتيح LocalStorage و SessionStorage
 * Keys for browser storage
 */

export const STORAGE_KEYS = {
    USER: 'investor_radar_user',
    USER_DASHBOARDS: 'userDashboards',
    THEME: 'investor_radar_theme',
    LANGUAGE: 'investor_radar_language',
    AUTH_TOKEN: 'investor_radar_auth_token',
    PREFERENCES: 'investor_radar_preferences',
} as const;

/**
 * ======================================
 * ROUTES - المسارات
 * ======================================
 * 
 * مسارات التطبيق
 * Application routes
 */

export const ROUTES = {
    HOME: '/',
    DASHBOARDS: '/dashboards',
    MY_DASHBOARDS: '/my-dashboards',
    SIGNALS: '/signals',
    TIMELINE: '/timeline',
    FOLLOWERS: '/followers',
    PROFILE: '/profile',
    DATASET: '/dataset/:id',
    BUILDER: '/builder',
    QUERIES: '/queries',
    ADMIN: '/admin',
    ADMIN_DATASETS: '/admin/datasets',
    ADMIN_DASHBOARDS: '/admin/official-dashboards',
    SUPER_USERS: '/super/users',
    SUPER_LOGS: '/super/system-logs',
    SUPER_INFRASTRUCTURE: '/super/infrastructure',
    SUPER_TERMINAL: '/super/terminal',
} as const;

/**
 * ======================================
 * UI CONSTANTS - ثوابت الواجهة
 * ======================================
 */

export const UI_CONSTANTS = {
    // Breakpoints (matching Tailwind)
    BREAKPOINTS: {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536,
    },

    // Animation Durations (ms)
    ANIMATION: {
        fast: 150,
        normal: 300,
        slow: 500,
    },

    // Z-Index Layers
    Z_INDEX: {
        dropdown: 1000,
        sticky: 1020,
        fixed: 1030,
        modalBackdrop: 1040,
        modal: 1050,
        popover: 1060,
        tooltip: 1070,
    },

    // Pagination
    PAGINATION: {
        defaultPageSize: 20,
        pageSizeOptions: [10, 20, 50, 100],
    },
} as const;

/**
 * ======================================
 * DATE & TIME - التاريخ والوقت
 * ======================================
 */

export const DATE_FORMATS = {
    SHORT: 'DD/MM/YYYY',
    LONG: 'DD MMMM YYYY',
    WITH_TIME: 'DD/MM/YYYY HH:mm',
    ISO: 'YYYY-MM-DDTHH:mm:ss',
} as const;

/**
 * ======================================
 * VALIDATION RULES - قواعد التحقق
 * ======================================
 */

export const VALIDATION = {
    PASSWORD: {
        minLength: 8,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecialChar: true,
    },
    USERNAME: {
        minLength: 3,
        maxLength: 30,
        pattern: /^[a-zA-Z0-9_]+$/,
    },
    EMAIL: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
} as const;

/**
 * ======================================
 * ERROR MESSAGES - رسائل الأخطاء
 * ======================================
 */

export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'حدث خطأ في الاتصال بالشبكة',
    UNAUTHORIZED: 'غير مصرح لك بالوصول',
    NOT_FOUND: 'الصفحة غير موجودة',
    SERVER_ERROR: 'حدث خطأ في الخادم',
    VALIDATION_ERROR: 'خطأ في التحقق من البيانات',
    UNKNOWN_ERROR: 'حدث خطأ غير متوقع',
} as const;

/**
 * ======================================
 * SUCCESS MESSAGES - رسائل النجاح
 * ======================================
 */

export const SUCCESS_MESSAGES = {
    SAVED: 'تم الحفظ بنجاح',
    UPDATED: 'تم التحديث بنجاح',
    DELETED: 'تم الحذف بنجاح',
    CREATED: 'تم الإنشاء بنجاح',
} as const;

/**
 * ======================================
 * FEATURE FLAGS - خيارات الميزات
 * ======================================
 * 
 * للتحكم في تفعيل/تعطيل الميزات
 * Feature toggles for enabling/disabling features
 */

export const FEATURE_FLAGS = {
    ENABLE_ANALYTICS: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_DARK_MODE: false,
    ENABLE_BETA_FEATURES: false,
    ENABLE_AI_ASSISTANT: true,
} as const;

/**
 * ======================================
 * EXTERNAL LINKS - الروابط الخارجية
 * ======================================
 */

export const EXTERNAL_LINKS = {
    SUPPORT: 'https://support.investor-radar.sa',
    DOCS: 'https://docs.investor-radar.sa',
    PRIVACY: 'https://investor-radar.sa/privacy',
    TERMS: 'https://investor-radar.sa/terms',
    CONTACT: 'https://investor-radar.sa/contact',
} as const;
