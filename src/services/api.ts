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
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.timeout = API_CONFIG.timeout;
    this.setupTokenRefreshTimer();
  }

  private getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /** Decode JWT payload without verification (client-side only) */
  private decodeToken(token: string): { exp?: number; userId?: string } | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  /** Setup a timer that refreshes the token before it expires */
  private setupTokenRefreshTimer() {
    // Check every 5 minutes
    setInterval(() => {
      this.checkAndRefreshToken();
    }, 5 * 60 * 1000);
  }

  /** Check if token is close to expiry and refresh proactively */
  private async checkAndRefreshToken() {
    const token = this.getAuthToken();
    if (!token) return;

    const decoded = this.decodeToken(token);
    if (!decoded?.exp) return;

    const now = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - now;

    // Refresh if less than 1 hour remaining
    if (timeLeft > 0 && timeLeft < 3600) {
      await this.doRefreshToken();
    }
  }

  /** Perform the actual token refresh */
  private async doRefreshToken(): Promise<boolean> {
    // Prevent concurrent refreshes
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const token = this.getAuthToken();
        if (!token) return false;

        const url = `${this.baseUrl}/auth/refresh-token`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success && data.data?.token) {
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.data.token);
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    _isRetry = false
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

      // Auto-refresh on 401 "Token expired" (not on login/register/refresh endpoints)
      if (
        !_isRetry &&
        response.status === 401 &&
        token &&
        !endpoint.includes('/auth/login') &&
        !endpoint.includes('/auth/register') &&
        !endpoint.includes('/auth/refresh-token')
      ) {
        const refreshed = await this.doRefreshToken();
        if (refreshed) {
          return this.request<T>(endpoint, options, true);
        }
      }

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
    return this.get<UserProfile>('/auth/me');
  }

  async updateProfile(data: {
    name?: string; nameAr?: string; avatar?: string | null;
    bio?: string | null; bioAr?: string | null; phone?: string | null;
    location?: string | null; locationAr?: string | null;
    skills?: string | null; coverImage?: string | null;
  }) {
    return this.put<UserProfile>('/auth/me', data);
  }

  async getMyNetwork() {
    return this.get<{ followers: NetworkUser[]; following: NetworkUser[] }>('/auth/me/network');
  }

  async getPublicProfile(userId: string) {
    return this.get<PublicProfile>(`/auth/profile/${userId}`);
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  // =====================
  // File Upload
  // =====================

  async uploadFile(file: File): Promise<ApiResponse<{
    filename: string; originalName: string; size: number; mimetype: string; url: string;
  }>> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseUrl}/uploads`;
    const token = this.getAuthToken();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        body: formData,
      });
      return await response.json();
    } catch {
      return { success: false, error: 'Upload failed', errorAr: 'فشل في رفع الملف' };
    }
  }

  async uploadFiles(files: File[]): Promise<ApiResponse<Array<{
    filename: string; originalName: string; size: number; mimetype: string; url: string;
  }>>> {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));

    const url = `${this.baseUrl}/uploads/multiple`;
    const token = this.getAuthToken();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        body: formData,
      });
      return await response.json();
    } catch {
      return { success: false, error: 'Upload failed', errorAr: 'فشل في رفع الملفات' };
    }
  }

  async deleteUpload(filename: string) {
    return this.delete<{ deleted: boolean }>(`/uploads/${filename}`);
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

  async getDatasetData(id: string, params?: { page?: number; limit?: number; refresh?: boolean }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.refresh) query.append('refresh', 'true');

    const queryString = query.toString();
    return this.get<{
      dataset: { id: string; externalId: string; name: string; nameAr: string };
      records: Record<string, unknown>[];
      columns: string[];
      meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        fetchedAt: string;
        source: 'api' | 'cache';
      };
    }>(`/datasets/${id}/data${queryString ? `?${queryString}` : ''}`);
  }

  async getDatasetPreview(id: string, count: number = 10) {
    return this.get<{
      dataset: { id: string; name: string; nameAr: string };
      preview: Record<string, unknown>[];
      columns: string[];
      totalRecords: number;
    }>(`/datasets/${id}/preview?count=${count}`);
  }

  async refreshDatasetCache(id: string) {
    return this.post<{
      message: string;
      messageAr: string;
      dataset: string;
      recordsFetched: number;
    }>(`/datasets/${id}/refresh`);
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

  async createUserDashboard(data: { name: string; nameAr?: string; description?: string; widgets?: string; layout?: string }) {
    return this.post<UserDashboard>('/users/dashboards', data);
  }

  async updateUserDashboard(id: string, data: { name?: string; nameAr?: string; description?: string; widgets?: string; layout?: string }) {
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
  // Dashboard Templates
  // =====================

  async getDashboardTemplates() {
    return this.get<Array<{
      id: string; name: string; nameAr: string;
      description: string; descriptionAr: string;
      category: string; icon: string; widgetCount: number;
    }>>('/dashboard-templates');
  }

  async getDashboardTemplate(id: string) {
    return this.get<{
      id: string; name: string; nameAr: string;
      description: string; descriptionAr: string;
      category: string; icon: string;
      widgets: Array<{ type: string; title: string; titleAr: string; dataSource: string; chartType?: string; size: string }>;
      layout: Record<string, unknown>;
    }>(`/dashboard-templates/${id}`);
  }

  async cloneDashboardTemplate(id: string) {
    return this.post<UserDashboard>(`/dashboard-templates/${id}/clone`);
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

  async changePassword(currentPassword: string, newPassword: string) {
    return this.put<void>('/auth/change-password', { currentPassword, newPassword });
  }

  async forgotPassword(email: string) {
    return this.post<{ message: string; messageAr: string }>('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.post<{ message: string; messageAr: string }>('/auth/reset-password', { token, newPassword });
  }

  async refreshAuthToken() {
    return this.post<{ token: string }>('/auth/refresh-token');
  }

  async sendVerificationEmail() {
    return this.post<{ message: string; messageAr: string }>('/auth/send-verification');
  }

  async verifyEmail(token: string) {
    return this.post<{ message: string; messageAr: string }>('/auth/verify-email', { token });
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
  // Stats Endpoints (Public)
  // =====================

  async getOverviewStats() {
    return this.get<{
      totalDatasets: number;
      totalCategories: number;
      totalSignals: number;
      activeSignals: number;
      totalUsers: number;
      totalContent: number;
      totalViews: number;
      newThisWeek: number;
      weeklyGrowth: number;
      lastUpdated: string;
      isRealData: boolean;
    }>('/stats/overview');
  }

  async getTrendingTopics() {
    return this.get<{
      categories: Array<{ tag: string; count: number; countFormatted: string; type: string; color: string }>;
      tags: Array<{ tag: string; count: number; countFormatted: string; type: string; color: string }>;
      topics: Array<{ tag: string; count: number; countFormatted: string; type: string; color: string }>;
      lastUpdated: string;
      isRealData: boolean;
    }>('/stats/trending');
  }

  async getRecentActivity() {
    return this.get<{
      signals: { count: number; items: Array<{ id: string; title: string; titleAr: string; type: string; trend: string; impactScore: number; createdAt: string }> };
      content: { count: number; items: Array<{ id: string; title: string; titleAr: string; type: string; viewCount: number; publishedAt: string }> };
      datasets: { count: number; items: Array<{ id: string; name: string; nameAr: string; category: string; source: string; createdAt: string }> };
      lastUpdated: string;
      isRealData: boolean;
    }>('/stats/activity');
  }

  async getCategoryStats() {
    return this.get<{
      categories: Array<{ name: string; nameEn: string; count: number; percentage: number }>;
      total: number;
      uniqueCategories: number;
      lastUpdated: string;
      isRealData: boolean;
    }>('/stats/categories');
  }

  async getSourceStats() {
    return this.get<{
      sources: Array<{ name: string; count: number }>;
      totalSources: number;
      lastUpdated: string;
      isRealData: boolean;
    }>('/stats/sources');
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

  // =====================
  // Recommendations
  // =====================

  async getRecommendations(limit?: number) {
    const qs = limit ? `?limit=${limit}` : '';
    return this.get<{
      content: Array<{
        id: string; type: string; title: string; titleAr: string; excerptAr?: string;
        viewCount: number; likeCount: number; publishedAt: string; tags: string[];
        author?: { id: string; name: string; nameAr?: string; avatar?: string };
        _type: 'content'; _reason: string;
      }>;
      signals: Array<{
        id: string; type: string; title: string; titleAr: string; summaryAr: string;
        impactScore: number; confidence: number; trend: string; createdAt: string;
        _type: 'signal'; _reason: string;
      }>;
      datasets: Array<{
        id: string; name: string; nameAr: string; category: string; source: string;
        recordCount: number; lastSyncAt?: string;
        _type: 'dataset'; _reason: string;
      }>;
      meta: { basedOn: { favorites: number; following: number } };
    }>(`/recommendations${qs}`);
  }

  // =====================
  // Search
  // =====================

  async search(params: { q: string; type?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    query.append('q', params.q);
    if (params.type) query.append('type', params.type);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    return this.get<{
      query: string;
      type: string;
      results: {
        content: SearchContentItem[];
        datasets: SearchDatasetItem[];
        entities: SearchEntityItem[];
        signals: SearchSignalItem[];
      };
      counts: { content: number; datasets: number; entities: number; signals: number };
      totalResults: number;
    }>(`/search?${query.toString()}`);
  }

  async searchSuggestions(q: string) {
    if (!q || q.length < 2) return { success: true as const, data: { suggestions: [] } };
    return this.get<{
      suggestions: Array<{ id: string; text: string; category: string; subCategory: string }>;
    }>(`/search/suggestions?q=${encodeURIComponent(q)}`);
  }

  // =====================
  // Content Interactions
  // =====================

  async likeContent(id: string) {
    return this.post<{ liked: boolean; likeCount: number; contentId: string }>(`/content/${id}/like`);
  }

  async saveContent(id: string) {
    return this.post<{ saved: boolean; saveCount: number; contentId: string }>(`/content/${id}/save`);
  }

  async shareContent(id: string) {
    return this.post<{ shared: boolean; shareCount: number; contentId: string }>(`/content/${id}/share`);
  }

  async getEngagement(id: string) {
    return this.get<{
      likeCount: number; saveCount: number; commentCount: number;
      shareCount: number; viewCount: number; hasLiked: boolean; hasSaved: boolean;
    }>(`/content/${id}/engagement`);
  }

  // =====================
  // Comments
  // =====================

  async getComments(contentId: string, params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const qs = query.toString();
    return this.get<CommentItem[]>(`/content/${contentId}/comments${qs ? `?${qs}` : ''}`);
  }

  async createComment(contentId: string, body: string, parentId?: string) {
    return this.post<CommentItem>(`/content/${contentId}/comments`, { body, parentId });
  }

  async updateComment(contentId: string, commentId: string, body: string) {
    return this.put<CommentItem>(`/content/${contentId}/comments/${commentId}`, { body });
  }

  async deleteComment(contentId: string, commentId: string) {
    return this.delete<{ deleted: boolean }>(`/content/${contentId}/comments/${commentId}`);
  }

  // =====================
  // Content Creation & Workflow
  // =====================

  async createContentPost(data: {
    type: string; title: string; titleAr: string;
    body: string; bodyAr: string; excerpt?: string;
    excerptAr?: string; tags?: string[]; metadata?: Record<string, unknown>;
  }) {
    return this.post<Content>('/content/create', data);
  }

  async updateContentPost(id: string, data: Partial<{
    title: string; titleAr: string; body: string; bodyAr: string;
    excerpt: string; excerptAr: string; tags: string[]; metadata: Record<string, unknown>;
  }>) {
    return this.put<Content>(`/content/edit/${id}`, data);
  }

  async deleteContentPost(id: string) {
    return this.delete<{ deleted: boolean }>(`/content/remove/${id}`);
  }

  async getMyContent(params?: { status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const qs = query.toString();
    return this.get<Content[]>(`/content/my${qs ? `?${qs}` : ''}`);
  }

  async submitForReview(id: string) {
    return this.request<Content>(`/content/${id}/submit`, { method: 'PATCH' });
  }

  async reviewContent(id: string, action: 'approve' | 'reject', note?: string) {
    return this.request<Content>(`/content/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ action, note }),
    });
  }

  async scheduleContent(id: string, scheduledAt: string) {
    return this.request<Content>(`/content/${id}/schedule`, {
      method: 'PATCH',
      body: JSON.stringify({ scheduledAt }),
    });
  }

  async publishContent(id: string) {
    return this.request<Content>(`/content/${id}/publish`, { method: 'PATCH' });
  }

  async pinContent(id: string) {
    return this.request<Content>(`/content/${id}/pin`, { method: 'PATCH' });
  }

  async getPendingContent(params?: { status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const qs = query.toString();
    return this.get<Content[]>(`/content/pending${qs ? `?${qs}` : ''}`);
  }

  // =====================
  // Admin User Management
  // =====================

  async getAdminUsers(params?: {
    search?: string; role?: string; isActive?: string;
    page?: number; limit?: number; sort?: string; order?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.role) query.append('role', params.role);
    if (params?.isActive) query.append('isActive', params.isActive);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.sort) query.append('sort', params.sort);
    if (params?.order) query.append('order', params.order);
    const qs = query.toString();
    return this.get<AdminUser[]>(`/admin/users${qs ? `?${qs}` : ''}`);
  }

  async getAdminUser(id: string) {
    return this.get<AdminUser>(`/admin/users/${id}`);
  }

  async createAdminUser(data: {
    email: string; password: string; name: string;
    nameAr?: string; role?: string; bio?: string; phone?: string;
  }) {
    return this.post<AdminUser>('/admin/users', data);
  }

  async updateAdminUser(id: string, data: {
    name?: string; nameAr?: string; email?: string;
    bio?: string; phone?: string; avatar?: string;
  }) {
    return this.put<AdminUser>(`/admin/users/${id}`, data);
  }

  async updateAdminUserRole(id: string, role: string) {
    return this.request<AdminUser>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async toggleAdminUserStatus(id: string) {
    return this.request<AdminUser>(`/admin/users/${id}/status`, { method: 'PATCH' });
  }

  async bulkUserAction(userIds: string[], action: string, role?: string) {
    return this.post<{ affected: number }>('/admin/users/bulk-action', { userIds, action, role });
  }

  async getAuditLogs(params?: { page?: number; limit?: number; action?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.action) query.append('action', params.action);
    const qs = query.toString();
    return this.get<AuditLog[]>(`/admin/audit-logs${qs ? `?${qs}` : ''}`);
  }

  // =====================
  // Export (Download CSV)
  // =====================

  async exportCsv(type: 'datasets' | 'signals' | 'content' | 'entities' | string) {
    const url = `${this.baseUrl}/export/${type}`;
    const token = this.getAuthToken();
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Export failed');
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${type}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  }

  async exportDatasetCsv(datasetId: string) {
    const url = `${this.baseUrl}/export/dataset/${datasetId}`;
    const token = this.getAuthToken();
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Export failed');
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `dataset_${datasetId}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
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

interface UserProfile extends User {
  bio?: string;
  bioAr?: string;
  phone?: string;
  location?: string;
  locationAr?: string;
  skills?: string;
  coverImage?: string;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    dashboards: number;
    favorites: number;
    contents: number;
    comments: number;
    following: number;
    followers: number;
  };
  recentContent?: Array<{
    id: string;
    type: string;
    title: string;
    titleAr: string;
    excerptAr?: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    publishedAt: string;
  }>;
  totalViews?: number;
  totalLikes?: number;
}

interface NetworkUser {
  id: string;
  name: string;
  nameAr?: string;
  avatar?: string;
  role: string;
  followedAt: string;
}

interface PublicProfile {
  id: string;
  name: string;
  nameAr?: string;
  avatar?: string;
  role: string;
  bio?: string;
  bioAr?: string;
  createdAt: string;
  _count: {
    contents: number;
    comments: number;
    following: number;
    followers: number;
  };
  recentContent: Array<{
    id: string;
    type: string;
    title: string;
    titleAr: string;
    excerptAr?: string;
    viewCount: number;
    likeCount: number;
    publishedAt: string;
  }>;
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
  nameAr?: string;
  description?: string;
  widgets: string; // JSON string of widget IDs e.g. '["dataset_xxx"]'
  layout: string;  // JSON string e.g. '{}'
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

interface CommentItem {
  id: string;
  contentId: string;
  userId: string;
  parentId?: string;
  body: string;
  bodyAr?: string;
  isEdited: boolean;
  user: { id: string; name: string; nameAr?: string; avatar?: string; role: string };
  replies?: CommentItem[];
  createdAt: string;
  updatedAt: string;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  nameAr?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  bio?: string;
  phone?: string;
  createdAt: string;
  _count?: {
    contents: number;
    comments: number;
    dashboards: number;
  };
}

interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}

interface SearchContentItem {
  id: string;
  type: string;
  title: string;
  titleAr: string;
  excerpt?: string;
  excerptAr?: string;
  tags: string[];
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  author?: { id: string; name: string; nameAr?: string; avatar?: string };
  _type: 'content';
}

interface SearchDatasetItem {
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
  _type: 'dataset';
}

interface SearchEntityItem {
  id: string;
  name: string;
  nameEn?: string;
  role: string;
  type: string;
  avatar?: string;
  isVerified: boolean;
  verificationLevel: string;
  followersCount: number;
  specialties: string[];
  _type: 'entity';
}

interface SearchSignalItem {
  id: string;
  type: string;
  title: string;
  titleAr: string;
  summary: string;
  summaryAr: string;
  impactScore: number;
  confidence: number;
  trend: string;
  sector?: string;
  region?: string;
  createdAt: string;
  _type: 'signal';
}

// Export singleton instance
export const api = new ApiService();
export type { ApiResponse, CommentItem, AdminUser, AuditLog, Content, User, UserProfile, PublicProfile, SearchContentItem, SearchDatasetItem, SearchEntityItem, SearchSignalItem };
export default api;
