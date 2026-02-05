/**
 * Home Feed Wrapper - مغلف صفحة الرئيسية
 * WebFlux SSE Streaming Edition - Real Data Only
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, RefreshCw, AlertTriangle, Wifi } from 'lucide-react';
import { api } from '../src/services/api';
import { FeedItem, FeedContentType, User } from '../types';
import HomeFeed from './HomeFeed';

// API Base URL for SSE streams
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://investor-backend-3p3m.onrender.com/api';

interface HomeFeedWrapperProps {
  user?: User;
  onOpenWizard?: () => void;
}

interface APIContent {
  id: string;
  type: string;
  title: string;
  titleAr: string;
  excerpt?: string;
  excerptAr?: string;
  tags: string;
  viewCount: number;
  likeCount?: number;
  saveCount?: number;
  publishedAt: string;
  coverImage?: string;
}

// Map API content type to FeedContentType
function mapContentType(apiType: string): FeedContentType {
  const typeMap: Record<string, FeedContentType> = {
    'ARTICLE': FeedContentType.ARTICLE,
    'NEWS': FeedContentType.BREAKING_NEWS,
    'REPORT': FeedContentType.EXPERT_INSIGHT,
    'ANALYSIS': FeedContentType.MARKET_PULSE,
    'INSIGHT': FeedContentType.SIGNAL_ALERT,
  };
  return typeMap[apiType] || FeedContentType.ARTICLE;
}

// Transform API content to FeedItem - uses only real data from API
function transformContent(content: APIContent): FeedItem {
  let tags: string[] = [];
  try {
    tags = JSON.parse(content.tags);
  } catch {
    tags = [];
  }

  return {
    id: content.id,
    title: content.titleAr || content.title,
    contentType: mapContentType(content.type),
    author: {
      id: 'system',
      name: 'رادار المستثمر',
      avatar: '',
      role: 'ADMIN' as any,
      verified: true,
    },
    timestamp: content.publishedAt,
    tags,
    engagement: {
      views: content.viewCount || 0,
      likes: content.likeCount || 0,
      comments: 0, // Real comments will come from comments API
      shares: 0,
      saves: content.saveCount || 0,
    },
    excerpt: content.excerptAr || content.excerpt || '',
    // Use real cover image if available, otherwise use content-type based placeholder
    coverImage: content.coverImage || getDefaultCoverImage(content.type),
    hasLiked: false,
    hasSaved: false,
  };
}

// Get default cover image based on content type
function getDefaultCoverImage(type: string): string {
  const images: Record<string, string> = {
    'REPORT': '/images/report-cover.jpg',
    'NEWS': '/images/news-cover.jpg',
    'ANALYSIS': '/images/analysis-cover.jpg',
    'ARTICLE': '/images/article-cover.jpg',
    'INSIGHT': '/images/insight-cover.jpg',
  };
  return images[type] || '/images/default-cover.jpg';
}

const HomeFeedWrapper: React.FC<HomeFeedWrapperProps> = ({ user, onOpenWizard }) => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [streaming, setStreaming] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref for EventSource cleanup
  const feedEventSourceRef = useRef<EventSource | null>(null);

  // WebFlux SSE Stream for Feed Content
  const streamFeed = useCallback(() => {
    const url = `${API_BASE_URL}/content/feed/stream`;
    console.log('[WebFlux] Connecting to feed stream:', url);

    const eventSource = new EventSource(url);
    feedEventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('[WebFlux] Feed stream connected');
    };

    eventSource.addEventListener('content', (e) => {
      try {
        const content = JSON.parse(e.data) as APIContent;
        const feedItem = transformContent(content);
        console.log('[WebFlux] Received content:', feedItem.title);
        setFeedItems(prev => {
          if (prev.some(item => item.id === feedItem.id)) return prev;
          return [...prev, feedItem];
        });
      } catch (err) {
        console.error('[WebFlux] Error parsing content:', err);
      }
    });

    eventSource.addEventListener('complete', () => {
      console.log('[WebFlux] Feed stream complete');
      setStreaming(false);
      eventSource.close();
    });

    eventSource.onerror = (err) => {
      console.error('[WebFlux] Feed stream error:', err);
      eventSource.close();
      // Fallback to regular API
      fetchFeedRegular();
    };
  }, []);

  // Regular API fallback
  const fetchFeedRegular = useCallback(async () => {
    try {
      console.log('[API] Fetching feed via regular API...');
      const response = await api.getFeed({ limit: 50 });

      if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
        const transformedItems = (response.data as APIContent[]).map(transformContent);
        setFeedItems(transformedItems);
        console.log(`[API] Loaded ${transformedItems.length} items`);
      } else {
        console.log('[API] No content available');
        setFeedItems([]);
      }
    } catch (err) {
      console.error('[API] Error fetching feed:', err);
      setError('تعذر جلب المحتوى. يرجى المحاولة لاحقاً.');
      setFeedItems([]);
    } finally {
      setStreaming(false);
    }
  }, []);

  // Handle like action - calls API
  const handleLike = useCallback(async (itemId: string) => {
    try {
      const response = await api.likeContent(itemId);
      if (response.success && response.data) {
        setFeedItems(prev => prev.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              hasLiked: response.data!.liked,
              engagement: {
                ...item.engagement,
                likes: response.data!.likeCount
              }
            };
          }
          return item;
        }));
      }
    } catch (err) {
      console.error('Error liking content:', err);
    }
  }, []);

  // Handle save/favorite action - calls API
  const handleSave = useCallback(async (itemId: string) => {
    try {
      const response = await api.saveContent(itemId);
      if (response.success && response.data) {
        setFeedItems(prev => prev.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              hasSaved: response.data!.saved,
              engagement: {
                ...item.engagement,
                saves: response.data!.saveCount
              }
            };
          }
          return item;
        }));
      }
    } catch (err) {
      console.error('Error saving content:', err);
    }
  }, []);

  // Refresh data
  const refreshData = useCallback(() => {
    if (feedEventSourceRef.current) {
      feedEventSourceRef.current.close();
    }
    setFeedItems([]);
    setStreaming(true);
    setError(null);
    streamFeed();
  }, [streamFeed]);

  // Initialize stream on mount
  useEffect(() => {
    streamFeed();

    return () => {
      if (feedEventSourceRef.current) {
        feedEventSourceRef.current.close();
      }
    };
  }, [streamFeed]);

  // Loading state
  if (streaming && feedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-4">
          <Wifi className="w-5 h-5 animate-pulse text-blue-600" />
          <span className="text-blue-600 font-medium">جاري تحميل المحتوى عبر WebFlux...</span>
        </div>
        <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">جاري تحميل المحتوى...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Streaming indicator */}
      {streaming && feedItems.length > 0 && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full text-sm text-blue-600">
            <Wifi className="w-4 h-4 animate-pulse" />
            <span>جاري تحميل المزيد...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-yellow-600" />
          <span className="text-yellow-700 text-sm flex-1">{error}</span>
          <button
            onClick={refreshData}
            className="flex items-center gap-1 text-yellow-700 hover:text-yellow-800 text-sm font-medium"
          >
            <RefreshCw size={16} />
            إعادة المحاولة
          </button>
        </div>
      )}

      <HomeFeed
        feedItems={feedItems}
        user={user}
        onOpenWizard={onOpenWizard}
        onLike={handleLike}
        onSave={handleSave}
        onRefresh={refreshData}
        isStreaming={streaming}
      />
    </div>
  );
};

export default HomeFeedWrapper;
