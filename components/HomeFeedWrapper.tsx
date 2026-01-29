/**
 * Home Feed Wrapper - مغلف صفحة الرئيسية
 * Fetches content from API and passes to HomeFeed
 */

import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '../src/services/api';
import { FeedItem, FeedContentType, User } from '../types';
import HomeFeed from './HomeFeed';
import { FEED_ITEMS } from '../constants';

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
  publishedAt: string;
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

// Transform API content to FeedItem
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
      views: content.viewCount,
      likes: Math.floor(content.viewCount * 0.3),
      comments: Math.floor(content.viewCount * 0.1),
      shares: Math.floor(content.viewCount * 0.05),
      saves: Math.floor(content.viewCount * 0.15),
    },
    excerpt: content.excerptAr || content.excerpt || '',
    coverImage: `https://picsum.photos/seed/${content.id}/800/400`,
    hasLiked: false,
    hasSaved: false,
  };
}

const HomeFeedWrapper: React.FC<HomeFeedWrapperProps> = ({ user, onOpenWizard }) => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getFeed({ limit: 50 });

      if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
        const transformedItems = (response.data as APIContent[]).map(transformContent);
        // Combine API content with some mock items for variety
        const combinedItems = [...transformedItems, ...FEED_ITEMS.slice(0, 10)];
        setFeedItems(combinedItems);
      } else {
        // Use fallback items if no content from API
        setFeedItems(FEED_ITEMS);
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      // Use fallback items on error
      setFeedItems(FEED_ITEMS);
      setError('تعذر جلب المحتوى الجديد، يتم عرض محتوى سابق');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">جاري تحميل المحتوى...</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-yellow-600" />
          <span className="text-yellow-700 text-sm flex-1">{error}</span>
          <button
            onClick={fetchContent}
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
      />
    </div>
  );
};

export default HomeFeedWrapper;
