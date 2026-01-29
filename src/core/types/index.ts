/**
 * ======================================
 * CORE TYPES - الأنواع الأساسية
 * ======================================
 * 
 * هذا الملف يحتوي على جميع الأنواع الأساسية المستخدمة في التطبيق
 * All core TypeScript types and interfaces used across the application
 */

// ============================================
// USER & AUTHENTICATION - المستخدم والصلاحيات
// ============================================

/**
 * أدوار المستخدمين في النظام
 * User roles in the system with hierarchical permissions
 */
export enum UserRole {
    STANDARD = 'Regular User',
    ANALYST = 'Analyst',
    EXPERT = 'Expert',
    WRITER = 'Writer',
    DESIGNER = 'Designer',
    CONTENT_MANAGER = 'Content Manager',
    EDITOR = 'Editor',
    ADMIN = 'Admin',
    SUPER_ADMIN = 'Super Admin',
    CURBTRON = 'CurbTron'
}

/**
 * بيانات المستخدم
 * User data interface
 */
export interface User {
    id: string;
    name: string;
    role: UserRole;
    avatar: string;
}

// ============================================
// CHARTS & VISUALIZATIONS - الرسوم البيانية
// ============================================

/**
 * أنواع الرسوم البيانية المدعومة
 * Supported chart types for data visualization
 */
export enum ChartType {
    LINE = 'line',
    BAR = 'bar',
    AREA = 'area',
    PIE = 'pie',
    KPI = 'kpi',
    EXTERNAL = 'external'
}

/**
 * نقطة بيانات في الرسم البياني
 * Single data point in a chart
 */
export interface WidgetDataPoint {
    name: string;
    value: number;
    date?: string;
    category?: string;
    [key: string]: any; // Allow additional properties
}

/**
 * Widget - مكون بيانات قابل للعرض
 * Reusable data visualization component
 */
export interface Widget {
    id: string;
    title: string;
    type: ChartType;
    datasetId: string;
    description?: string;
    category: string;
    tags: string[];
    data: WidgetDataPoint[];
    lastRefresh: string;
    embedUrl?: string; // For external embeds (e.g., Metabase)
}

// ============================================
// DASHBOARDS - اللوحات
// ============================================

/**
 * لوحة البيانات
 * Dashboard containing multiple widgets
 */
export interface Dashboard {
    id: string;
    name: string;
    type: 'official' | 'user';
    widgets: string[]; // Widget IDs
    ownerId?: string; // User ID if type is 'user'
    isPublic?: boolean;
    isStarred?: boolean;
}

// ============================================
// DATASETS - مجموعات البيانات
// ============================================

/**
 * مجموعة بيانات
 * Dataset from external source
 */
export interface Dataset {
    id: string;
    name: string;
    agency: string;
    lastUpdated: string;
    status: 'active' | 'error' | 'maintenance';
}

/**
 * سجل تحديث البيانات
 * Data refresh log entry
 */
export interface RefreshLog {
    id: string;
    datasetId: string;
    timestamp: string;
    status: 'success' | 'failed';
    duration: string;
}

// ============================================
// TIMELINE & EVENTS - الأحداث والتحديثات
// ============================================

/**
 * أنواع أحداث الـ Timeline
 * Timeline event types for different update categories
 */
export enum TimelineEventType {
    NEW_DATA = 'new_data',   // 🆕 بيانات جديدة
    UPDATE = 'update',       // 🔄 تحديث
    REVISION = 'revision',   // ⚠️ مراجعة
    SIGNAL = 'signal',       // 📈 إشارة
    INSIGHT = 'insight',     // 🧠 رؤية
    RADAR = 'radar'          // 🧩 رادار
}

/**
 * حدث في الـ Timeline
 * Timeline event with metadata
 */
export interface TimelineEvent {
    id: string;
    type: TimelineEventType;
    title: string;
    summary: string;
    timestamp: string; // ISO string
    impactScore: number; // 1-100
    sourceName: string;
    delta?: {
        value: string;
        isPositive: boolean;
        label: string;
    };
    tags: string[];
    relatedWidgetId?: string;
}

// ============================================
// FEED & CONTENT - المحتوى والأخبار
// ============================================

/**
 * أنواع محتوى الـ Feed
 * Feed content types for different post formats
 */
export enum FeedContentType {
    // Basic Types
    DASHBOARD = 'dashboard',
    WIDGET = 'widget',
    ARTICLE = 'article',
    IMAGE = 'image',
    VIDEO = 'video',
    AUDIO = 'audio',
    CAROUSEL = 'carousel',

    // Advanced Types
    SIGNAL_ALERT = 'signal_alert',     // تنبيهات إشارة
    WEEKLY_SNAPSHOT = 'weekly_snapshot', // ملخص الأسبوع
    COMPARISON = 'comparison',          // مقارنة ذكية
    FACT = 'fact',                      // هل تعلم
    MARKET_PULSE = 'market_pulse'       // حرارة السوق
}

/**
 * عنصر في الـ Feed
 * Feed item with flexible payload
 */
export interface FeedItem {
    id: string;
    contentType: FeedContentType;
    title: string;
    author: {
        name: string;
        role: string;
        avatar?: string;
        verified?: boolean;
    };
    timestamp: string;
    tags: string[];
    engagement: {
        likes: number;
        shares: number;
        saves: number;
    };
    payload: any; // Flexible payload based on content type
}

// ============================================
// FOLLOWERS & ENTITIES - المتابعة والجهات
// ============================================

/**
 * جهة قابلة للمتابعة (خبير أو جهة رسمية)
 * Followable entity (expert or official organization)
 */
export interface FollowableEntity {
    id: string;
    name: string;
    role: string;
    avatar: string;
    coverImage?: string;
    stats: {
        posts: number;
        followers: number;
        following: number;
    };
    location?: string;
    isFollowed: boolean;
    type: 'expert' | 'ministry';
}

// ============================================
// UTILITY TYPES - أنواع مساعدة
// ============================================

/**
 * حالة التحميل
 * Loading state for async operations
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * استجابة API عامة
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
    error?: string;
}

/**
 * خيارات الترقيم
 * Pagination options
 */
export interface PaginationOptions {
    page: number;
    pageSize: number;
    total?: number;
}

/**
 * خيارات الفرز
 * Sort options
 */
export interface SortOptions {
    field: string;
    direction: 'asc' | 'desc';
}

/**
 * خيارات الفلترة
 * Filter options
 */
export interface FilterOptions {
    [key: string]: any;
}
