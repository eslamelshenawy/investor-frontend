
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

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  AREA = 'area',
  PIE = 'pie',
  KPI = 'kpi',
  EXTERNAL = 'external'
}

export enum TimelineEventType {
  NEW_DATA = 'new_data',   // 🆕
  UPDATE = 'update',       // 🔄
  REVISION = 'revision',   // ⚠
  SIGNAL = 'signal',       // 📈
  INSIGHT = 'insight',     // 🧠
  RADAR = 'radar'          // 🧩
}

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
  tags: string[]; // Related Radars or Sectors
  relatedWidgetId?: string;
}

export interface Dataset {
  id: string;
  name: string;
  agency: string;
  lastUpdated: string;
  status: 'active' | 'error' | 'maintenance';
}

export interface WidgetDataPoint {
  name: string;
  value: number;
  date?: string;
  category?: string;
  [key: string]: any;
}

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
  embedUrl?: string;
}

export interface Dashboard {
  id: string;
  name: string;
  type: 'official' | 'user';
  widgets: string[]; // Widget IDs
  ownerId?: string; // If null, it's system/official
  // New Fields for Expert/Official Dashboards
  isPublic?: boolean;
  isStarred?: boolean;
  description?: string;
  keyMetrics?: string[];
  dataFreq?: 'daily' | 'monthly' | 'quarterly' | 'yearly';
}

export interface RefreshLog {
  id: string;
  datasetId: string;
  timestamp: string;
  status: 'success' | 'failed';
  duration: string;
}

// --- NEW FEED TYPES ---

export enum FeedContentType {
  DASHBOARD = 'dashboard',
  WIDGET = 'widget',
  ARTICLE = 'article',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  CAROUSEL = 'carousel',
  // New Types based on SRS
  SIGNAL_ALERT = 'signal_alert', // 1. تنبيهات إشارة
  WEEKLY_SNAPSHOT = 'weekly_snapshot', // 2. ملخص الأسبوع
  COMPARISON = 'comparison', // 3. مقارنة ذكية
  FACT = 'fact', // 4. هل تعلم
  MARKET_PULSE = 'market_pulse', // 5. حرارة السوق
  // New Enhanced Types
  POLL = 'poll',
  EVENT = 'event',
  EXPERT_INSIGHT = 'expert_insight',
  PORTFOLIO = 'portfolio',
  // Educational & Interactive
  BREAKING_NEWS = 'breaking_news',
  TERMINOLOGY = 'terminology',
  Q_AND_A = 'q_and_a',
  CHECKLIST = 'checklist'
}

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
    comments: number;
  };
  hasLiked?: boolean;
  hasSaved?: boolean;
  payload: any; // Flexible payload based on content type
}

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
