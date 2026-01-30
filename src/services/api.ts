/**
 * API Service - خدمة الـ API
 * Handles all communication with the backend
 */

import { API_CONFIG, STORAGE_KEYS } from '../core/config/app.config';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorAr?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

class ApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.timeout = API_CONFIG.timeout;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAuthToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout',
          errorAr: 'انتهت مهلة الطلب',
        };
      }

      return {
        success: false,
        error: 'Network error',
        errorAr: 'خطأ في الاتصال بالشبكة',
      };
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // =====================
  // Auth Endpoints
  // =====================

  async login(email: string, password: string) {
    const response = await this.post<{
      user: User;
      token: string;
    }>('/auth/login', { email, password });

    if (response.success && response.data) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
    }

    return response;
  }

  async register(data: { email: string; password: string; name: string; nameAr?: string }) {
    const response = await this.post<{
      user: User;
      token: string;
    }>('/auth/register', data);

    if (response.success && response.data) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
    }

    return response;
  }

  async getMe() {
    return this.get<User>('/auth/me');
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  // =====================
  // Datasets Endpoints
  // =====================

  async getDatasets(params?: { category?: string; search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString();
    return this.get<Dataset[]>(`/datasets${queryString ? `?${queryString}` : ''}`);
  }

  async getDataset(id: string) {
    return this.get<Dataset>(`/datasets/${id}`);
  }

  async getDatasetData(id: string, params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString();
    return this.get<{ dataset: Dataset; records: unknown[]; meta: unknown }>(
      `/datasets/${id}/data${queryString ? `?${queryString}` : ''}`
    );
  }

  async getCategories() {
    return this.get<{ name: string; count: number }[]>('/datasets/categories');
  }

  async getSyncStatus() {
    return this.get<{
      architecture: string;
      latestSyncs: unknown[];
      stats: unknown;
      note?: string;
    }>('/datasets/sync/status');
  }

  // =====================
  // Discovery Endpoints
  // =====================

  async getDiscoveryStats() {
    return this.get<{
      totalInDb: number;
      lastDiscovery: string | null;
      categoriesAvailable: number;
    }>('/discovery/stats');
  }

  async getDiscoveryCategories() {
    return this.get<Array<{
      id: string;
      nameAr: string;
      nameEn: string;
      slug: string;
    }>>('/discovery/categories');
  }

  async triggerDiscovery() {
    return this.post<{
      message: string;
      newDatasets: string[];
      total: number;
    }>('/discovery/discover-and-sync');
  }

  async triggerFullDiscovery() {
    return this.post<{
      message: string;
      totalDiscovered: number;
      categoriesScanned: number;
    }>('/discovery/full-discover-and-sync');
  }

  // =====================
  // Signals Endpoints
  // =====================

  async getSignals(params?: {
    type?: string;
    trend?: string;
    region?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.trend) query.append('trend', params.trend);
    if (params?.region) query.append('region', params.region);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString();
    return this.get<Signal[]>(`/signals${queryString ? `?${queryString}` : ''}`);
  }

  async getSignal(id: string) {
    return this.get<Signal>(`/signals/${id}`);
  }

  async getLatestSignals(limit?: number) {
    return this.get<Signal[]>(`/signals/latest${limit ? `?limit=${limit}` : ''}`);
  }

  // =====================
  // Content Endpoints
  // =====================

  async getFeed(params?: { type?: string; tags?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.tags) query.append('tags', params.tags);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString();
    return this.get<Content[]>(`/content/feed${queryString ? `?${queryString}` : ''}`);
  }

  async getContent(id: string) {
    return this.get<Content>(`/content/${id}`);
  }

  async getTimeline(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString();
    return this.get<TimelineItem[]>(`/content/timeline${queryString ? `?${queryString}` : ''}`);
  }

  // =====================
  // User Favorites Endpoints
  // =====================

  async getFavorites() {
    return this.get<Favorite[]>('/users/favorites');
  }

  async addFavorite(itemType: string, itemId: string) {
    return this.post<Favorite>('/users/favorites', { itemType, itemId });
  }

  async removeFavorite(itemType: string, itemId: string) {
    return this.delete<void>(`/users/favorites/${itemType}/${itemId}`);
  }

  async checkFavorite(itemType: string, itemId: string) {
    return this.get<{ isFavorite: boolean }>(`/users/favorites/check/${itemType}/${itemId}`);
  }

  // =====================
  // User Dashboards Endpoints
  // =====================

  async getUserDashboards() {
    return this.get<UserDashboard[]>('/users/dashboards');
  }

  async getUserDashboard(id: string) {
    return this.get<UserDashboard>(`/users/dashboards/${id}`);
  }

  async createUserDashboard(data: { name: string; description?: string; config?: unknown }) {
    return this.post<UserDashboard>('/users/dashboards', data);
  }

  async updateUserDashboard(id: string, data: { name?: string; description?: string; config?: unknown }) {
    return this.put<UserDashboard>(`/users/dashboards/${id}`, data);
  }

  async deleteUserDashboard(id: string) {
    return this.delete<void>(`/users/dashboards/${id}`);
  }

  // =====================
  // Official Dashboards Endpoints
  // =====================

  async getOfficialDashboards(params?: { category?: string; search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString();
    return this.get<any[]>(`/dashboards${queryString ? `?${queryString}` : ''}`);
  }

  async getDashboardCategories() {
    return this.get<{ id: string; label: string; labelEn: string }[]>('/dashboards/categories');
  }

  async getOfficialDashboard(id: string) {
    return this.get<any>(`/dashboards/${id}`);
  }

  // =====================
  // Notifications Endpoints
  // =====================

  async getNotifications(params?: { unreadOnly?: boolean; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.unreadOnly) query.append('unreadOnly', 'true');
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString();
    return this.get<Notification[]>(`/users/notifications${queryString ? `?${queryString}` : ''}`);
  }

  async markNotificationRead(id: string) {
    return this.put<Notification>(`/users/notifications/${id}/read`);
  }

  async markAllNotificationsRead() {
    return this.put<{ count: number }>('/users/notifications/read-all');
  }

  // =====================
  // User Profile Endpoints
  // =====================

  async updateProfile(data: { name?: string; nameAr?: string; avatar?: string }) {
    return this.put<User>('/auth/me', data);
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.put<void>('/auth/change-password', { currentPassword, newPassword });
  }

  // =====================
  // Entities Endpoints
  // =====================

  async getEntities(params?: { type?: string; search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString();
    return this.get<Entity[]>(`/entities${queryString ? `?${queryString}` : ''}`);
  }

  async getEntity(id: string) {
    return this.get<Entity>(`/entities/${id}`);
  }

  async getEntityTypes() {
    return this.get<{ id: string; label: string; labelEn: string }[]>('/entities/types');
  }

  async toggleFollowEntity(id: string) {
    return this.post<{ isFollowing: boolean }>(`/entities/${id}/follow`);
  }

  async getFollowedEntities() {
    return this.get<Entity[]>('/entities/user/following');
  }

  // =====================
  // Widgets Endpoints
  // =====================

  async getWidgets(params?: { category?: string; search?: string; type?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.type) query.append('type', params.type);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString();
    return this.get<Widget[]>(`/widgets${queryString ? `?${queryString}` : ''}`);
  }

  async getWidget(id: string) {
    return this.get<Widget>(`/widgets/${id}`);
  }

  async getWidgetCategories() {
    return this.get<{ id: string; label: string; labelEn: string }[]>('/widgets/categories');
  }

  async getWidgetTypes() {
    return this.get<{ id: string; label: string; labelEn: string }[]>('/widgets/types');
  }
}

// Types
interface User {
  id: string;
  email: string;
  name: string;
  nameAr?: string;
  avatar?: string;
  role: string;
}

interface Dataset {
  id: string;
  externalId: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  category: string;
  source: string;
  recordCount: number;
  lastSyncAt?: string;
  syncStatus: string;
}

interface Signal {
  id: string;
  type: string;
  title: string;
  titleAr: string;
  summary: string;
  summaryAr: string;
  impactScore: number;
  confidence: number;
  trend: string;
  createdAt: string;
}

interface Content {
  id: string;
  type: string;
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  excerpt?: string;
  excerptAr?: string;
  tags: string[];
  publishedAt: string;
}

interface TimelineItem {
  id: string;
  itemType: 'content' | 'signal';
  type: string;
  title: string;
  titleAr: string;
  date: string;
}

interface Favorite {
  id: string;
  userId: string;
  itemType: string;
  itemId: string;
  createdAt: string;
}

interface UserDashboard {
  id: string;
  userId: string;
  name: string;
  description?: string;
  config: unknown;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  data?: unknown;
  isRead: boolean;
  createdAt: string;
}

interface Entity {
  id: string;
  name: string;
  nameEn?: string;
  role: string;
  type: 'ministry' | 'authority' | 'expert' | 'analyst';
  location: string;
  avatar: string;
  coverImage?: string;
  isFollowing: boolean;
  isVerified: boolean;
  verificationLevel: 'official' | 'verified' | 'none';
  stats: {
    followers: string;
    posts: number;
    datasets?: number;
  };
  specialties: string[];
  description?: string;
  website?: string;
  establishedYear?: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
}

interface Widget {
  id: string;
  title: string;
  type: string;
  category: string;
  description: string;
  data: Array<{ name: string; value: number }>;
  lastRefresh: string;
  atomicType: 'metric' | 'sparkline' | 'progress' | 'donut' | 'status' | 'gauge';
  atomicMetadata: {
    trend?: number;
    target?: number;
    statusColor?: string;
    subLabel?: string;
  };
}

// Export singleton instance
export const api = new ApiService();
export default api;
