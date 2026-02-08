/**
 * Followers Wrapper - مغلف صفحة الجهات والخبراء
 * Uses WebFlux-style SSE streaming for progressive data loading
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
   Users,
   Search,
   MapPin,
   UserPlus,
   Check,
   UserCheck,
   Shield,
   BadgeCheck,
   Building2,
   Award,
   Globe,
   FileText,
   BarChart3,
   Landmark,
   Loader2,
   RefreshCw,
   Zap,
   Radio,
   Activity,
   Clock,
   ArrowUpRight,
   Newspaper,
   Signal
} from 'lucide-react';
import { api } from '../src/services/api';

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
   verificationLevel?: 'official' | 'verified' | 'none';
   stats: {
      followers: string;
      posts: number;
      datasets?: number;
   };
   specialties?: string[];
   description?: string;
   website?: string;
   establishedYear?: string;
   impact: 'critical' | 'high' | 'medium' | 'low';
}

interface StreamMeta {
   total: number;
   official: number;
   experts: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Fallback data when API is unavailable
const FALLBACK_ENTITIES: Entity[] = [
   {
      id: 'gov_1',
      name: 'وزارة الاستثمار',
      nameEn: 'Ministry of Investment',
      role: 'جهة حكومية رسمية',
      type: 'ministry',
      location: 'الرياض، المملكة العربية السعودية',
      avatar: 'https://ui-avatars.com/api/?name=MISA&background=0D47A1&color=fff&size=200&bold=true',
      coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=400&fit=crop',
      isFollowing: false,
      isVerified: true,
      verificationLevel: 'official',
      stats: { followers: '245K', posts: 1240, datasets: 45 },
      specialties: ['الاستثمار الأجنبي', 'التراخيص', 'الفرص الاستثمارية', 'المناطق الاقتصادية'],
      description: 'الجهة المسؤولة عن تنظيم وتطوير بيئة الاستثمار في المملكة وجذب الاستثمارات الأجنبية المباشرة',
      website: 'misa.gov.sa',
      establishedYear: '2020',
      impact: 'critical'
   },
   {
      id: 'gov_2',
      name: 'الهيئة العامة للإحصاء',
      nameEn: 'General Authority for Statistics',
      role: 'جهة حكومية رسمية',
      type: 'authority',
      location: 'الرياض، المملكة العربية السعودية',
      avatar: 'https://ui-avatars.com/api/?name=GASTAT&background=1B5E20&color=fff&size=200&bold=true',
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=400&fit=crop',
      isFollowing: false,
      isVerified: true,
      verificationLevel: 'official',
      stats: { followers: '189K', posts: 2850, datasets: 120 },
      specialties: ['البيانات الإحصائية', 'المسوحات الوطنية', 'مؤشرات الاقتصاد', 'سوق العمل'],
      description: 'المصدر الرسمي للبيانات والإحصاءات الوطنية، توفر بيانات دقيقة وموثوقة لدعم اتخاذ القرار',
      website: 'stats.gov.sa',
      establishedYear: '1960',
      impact: 'critical'
   },
   {
      id: 'gov_3',
      name: 'البنك المركزي السعودي',
      nameEn: 'Saudi Central Bank (SAMA)',
      role: 'جهة حكومية رسمية',
      type: 'authority',
      location: 'الرياض، المملكة العربية السعودية',
      avatar: 'https://ui-avatars.com/api/?name=SAMA&background=B71C1C&color=fff&size=200&bold=true',
      coverImage: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=1200&h=400&fit=crop',
      isFollowing: false,
      isVerified: true,
      verificationLevel: 'official',
      stats: { followers: '312K', posts: 980, datasets: 65 },
      specialties: ['السياسة النقدية', 'الاستقرار المالي', 'الرقابة المصرفية', 'الاحتياطيات'],
      description: 'البنك المركزي للمملكة، المسؤول عن السياسة النقدية والرقابة على القطاع المصرفي والمالي',
      website: 'sama.gov.sa',
      establishedYear: '1952',
      impact: 'critical'
   },
   {
      id: 'gov_4',
      name: 'هيئة السوق المالية',
      nameEn: 'Capital Market Authority',
      role: 'جهة حكومية رسمية',
      type: 'authority',
      location: 'الرياض، المملكة العربية السعودية',
      avatar: 'https://ui-avatars.com/api/?name=CMA&background=4A148C&color=fff&size=200&bold=true',
      coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=400&fit=crop',
      isFollowing: false,
      isVerified: true,
      verificationLevel: 'official',
      stats: { followers: '198K', posts: 1120, datasets: 52 },
      specialties: ['سوق الأسهم', 'الشركات المدرجة', 'الإفصاحات', 'الرقابة المالية'],
      description: 'تنظيم وتطوير السوق المالية السعودية وحماية المستثمرين والمتعاملين',
      website: 'cma.org.sa',
      establishedYear: '2003',
      impact: 'critical'
   },
   {
      id: 'gov_5',
      name: 'وزارة التجارة',
      nameEn: 'Ministry of Commerce',
      role: 'جهة حكومية رسمية',
      type: 'ministry',
      location: 'الرياض، المملكة العربية السعودية',
      avatar: 'https://ui-avatars.com/api/?name=MC&background=E65100&color=fff&size=200&bold=true',
      coverImage: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1200&h=400&fit=crop',
      isFollowing: false,
      isVerified: true,
      verificationLevel: 'official',
      stats: { followers: '156K', posts: 1560, datasets: 38 },
      specialties: ['السجلات التجارية', 'حماية المستهلك', 'التجارة الإلكترونية', 'الملكية الفكرية'],
      description: 'تنظيم وتطوير الأنشطة التجارية وحماية حقوق المستهلكين وتعزيز بيئة الأعمال',
      website: 'mc.gov.sa',
      establishedYear: '1954',
      impact: 'high'
   },
   {
      id: 'gov_6',
      name: 'وزارة الطاقة',
      nameEn: 'Ministry of Energy',
      role: 'جهة حكومية رسمية',
      type: 'ministry',
      location: 'الرياض، المملكة العربية السعودية',
      avatar: 'https://ui-avatars.com/api/?name=MOE&background=1B5E20&color=fff&size=200&bold=true',
      coverImage: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&h=400&fit=crop',
      isFollowing: false,
      isVerified: true,
      verificationLevel: 'official',
      stats: { followers: '142K', posts: 890, datasets: 42 },
      specialties: ['الطاقة المتجددة', 'النفط والغاز', 'الكهرباء', 'الاستدامة'],
      description: 'تنظيم قطاع الطاقة وتطوير مصادر الطاقة المتجددة وضمان أمن الإمداد',
      website: 'moenergy.gov.sa',
      establishedYear: '2019',
      impact: 'critical'
   },
   {
      id: 'expert_1',
      name: 'د. خالد بن فهد العثمان',
      nameEn: 'Dr. Khalid Al-Othman',
      role: 'خبير اقتصادي - محلل أسواق',
      type: 'expert',
      location: 'الرياض، المملكة العربية السعودية',
      avatar: 'https://i.pravatar.cc/200?u=khalid',
      isFollowing: false,
      isVerified: true,
      verificationLevel: 'verified',
      stats: { followers: '45.2K', posts: 1850 },
      specialties: ['الاقتصاد الكلي', 'الأسواق المالية', 'رؤية 2030', 'التحليل الاستراتيجي'],
      description: 'خبير اقتصادي معتمد مع أكثر من 15 عاماً من الخبرة في تحليل الأسواق السعودية والخليجية',
      impact: 'high'
   },
   {
      id: 'expert_2',
      name: 'سارة المنصور',
      nameEn: 'Sarah Al-Mansour',
      role: 'محللة بيانات عقارية',
      type: 'analyst',
      location: 'جدة، المملكة العربية السعودية',
      avatar: 'https://i.pravatar.cc/200?u=sarah',
      isFollowing: false,
      isVerified: true,
      verificationLevel: 'verified',
      stats: { followers: '28.5K', posts: 920 },
      specialties: ['السوق العقاري', 'تحليل البيانات', 'التقييم العقاري', 'الاستثمار العقاري'],
      description: 'متخصصة في تحليل بيانات السوق العقاري السعودي وتقديم رؤى استثمارية دقيقة',
      impact: 'high'
   }
];

// Activity feed item interface
interface FeedItem {
   id: string;
   type: string;
   title: string;
   titleAr: string;
   body?: string;
   bodyAr?: string;
   excerpt?: string;
   excerptAr?: string;
   tags: string[];
   publishedAt: string;
   author?: {
      id: string;
      name: string;
      nameAr?: string;
      avatar?: string;
      role?: string;
   };
   viewCount?: number;
   likeCount?: number;
}

// Fallback activity data when API is unavailable
const FALLBACK_FEED: FeedItem[] = [
   {
      id: 'feed_1',
      type: 'article',
      title: 'Saudi Investment Outlook 2026',
      titleAr: 'توقعات الاستثمار السعودي 2026',
      excerptAr: 'تحليل شامل لتوقعات الاستثمار في المملكة العربية السعودية خلال العام الجاري وأبرز الفرص المتاحة',
      tags: ['استثمار', 'رؤية 2030', 'اقتصاد'],
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      author: { id: 'expert_1', name: 'د. خالد بن فهد العثمان', nameAr: 'د. خالد بن فهد العثمان', role: 'خبير اقتصادي' },
      viewCount: 1240,
      likeCount: 89
   },
   {
      id: 'feed_2',
      type: 'analysis',
      title: 'Real Estate Market Q1 Report',
      titleAr: 'تقرير السوق العقاري للربع الأول',
      excerptAr: 'مراجعة تفصيلية لأداء السوق العقاري السعودي مع تحليل الأسعار والاتجاهات في المناطق الرئيسية',
      tags: ['عقارات', 'تحليل', 'سوق'],
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      author: { id: 'expert_2', name: 'سارة المنصور', nameAr: 'سارة المنصور', role: 'محللة بيانات عقارية' },
      viewCount: 890,
      likeCount: 67
   },
   {
      id: 'feed_3',
      type: 'signal',
      title: 'SAMA Interest Rate Decision',
      titleAr: 'قرار البنك المركزي بشأن سعر الفائدة',
      excerptAr: 'البنك المركزي السعودي يعلن عن قراره بشأن أسعار الفائدة وتأثيره على القطاع المصرفي',
      tags: ['بنك مركزي', 'فائدة', 'سياسة نقدية'],
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      author: { id: 'gov_3', name: 'البنك المركزي السعودي', nameAr: 'البنك المركزي السعودي', role: 'جهة رسمية' },
      viewCount: 3200,
      likeCount: 156
   },
   {
      id: 'feed_4',
      type: 'article',
      title: 'New Investment Licenses Framework',
      titleAr: 'إطار تراخيص الاستثمار الجديد',
      excerptAr: 'وزارة الاستثمار تطلق إطاراً جديداً لتسهيل إصدار التراخيص الاستثمارية للمستثمرين الأجانب',
      tags: ['تراخيص', 'استثمار أجنبي', 'تنظيم'],
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      author: { id: 'gov_1', name: 'وزارة الاستثمار', nameAr: 'وزارة الاستثمار', role: 'جهة حكومية رسمية' },
      viewCount: 2100,
      likeCount: 134
   },
   {
      id: 'feed_5',
      type: 'analysis',
      title: 'Stock Market Weekly Review',
      titleAr: 'المراجعة الأسبوعية لسوق الأسهم',
      excerptAr: 'تحليل أداء السوق المالية السعودية خلال الأسبوع مع أبرز التحركات والتوصيات',
      tags: ['أسهم', 'تداول', 'تحليل فني'],
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      author: { id: 'gov_4', name: 'هيئة السوق المالية', nameAr: 'هيئة السوق المالية', role: 'جهة حكومية رسمية' },
      viewCount: 1780,
      likeCount: 98
   }
];

// Helper: format time ago in Arabic
const formatTimeAgoAr = (dateStr: string): string => {
   const now = new Date();
   const date = new Date(dateStr);
   const diffMs = now.getTime() - date.getTime();
   const diffMins = Math.floor(diffMs / (1000 * 60));
   const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
   const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

   if (diffMins < 1) return 'الآن';
   if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
   if (diffHours < 24) return `منذ ${diffHours} ساعة`;
   if (diffDays === 1) return 'منذ يوم';
   if (diffDays < 7) return `منذ ${diffDays} أيام`;
   if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسبوع`;
   return `منذ ${Math.floor(diffDays / 30)} شهر`;
};

// Helper: get content type label in Arabic
const getContentTypeLabelAr = (type: string): string => {
   const labels: Record<string, string> = {
      article: 'مقال',
      analysis: 'تحليل',
      signal: 'إشارة',
      report: 'تقرير',
      news: 'خبر',
      opinion: 'رأي',
      research: 'بحث',
      data: 'بيانات'
   };
   return labels[type] || 'محتوى';
};

// Helper: get content type icon
const getContentTypeIcon = (type: string) => {
   switch (type) {
      case 'article': return <Newspaper size={16} />;
      case 'analysis': return <BarChart3 size={16} />;
      case 'signal': return <Signal size={16} />;
      case 'report': return <FileText size={16} />;
      default: return <FileText size={16} />;
   }
};

// Helper: get content type badge color
const getContentTypeBadgeColor = (type: string): string => {
   const colors: Record<string, string> = {
      article: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      analysis: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      signal: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      report: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      news: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      opinion: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      research: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      data: 'bg-teal-500/20 text-teal-400 border-teal-500/30'
   };
   return colors[type] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
};

// Helper: get role badge color
const getRoleBadgeColor = (role?: string): string => {
   if (!role) return 'bg-slate-600 text-slate-300';
   if (role.includes('رسمية') || role.includes('حكومية')) return 'bg-blue-600/30 text-blue-400';
   if (role.includes('خبير')) return 'bg-purple-600/30 text-purple-400';
   if (role.includes('محلل')) return 'bg-green-600/30 text-green-400';
   return 'bg-slate-600/30 text-slate-300';
};

const FollowersWrapper = () => {
   const [entities, setEntities] = useState<Entity[]>([]);
   const [usingFallback, setUsingFallback] = useState(false);
   const [loading, setLoading] = useState(true);
   const [streaming, setStreaming] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [searchQuery, setSearchQuery] = useState('');
   const [activeFilter, setActiveFilter] = useState<'all' | 'following' | 'official' | 'experts'>('all');
   const [typeFilter, setTypeFilter] = useState<string>('all');
   const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
   const [streamMeta, setStreamMeta] = useState<StreamMeta | null>(null);
   const [streamProgress, setStreamProgress] = useState(0);
   const eventSourceRef = useRef<EventSource | null>(null);

   // Activity feed state
   const [activeTab, setActiveTab] = useState<'entities' | 'activity'>('entities');
   const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
   const [feedLoading, setFeedLoading] = useState(false);
   const [feedError, setFeedError] = useState<string | null>(null);
   const [feedUsingFallback, setFeedUsingFallback] = useState(false);

   const fetchEntitiesStream = useCallback(() => {
      // Close any existing connection
      if (eventSourceRef.current) {
         eventSourceRef.current.close();
      }

      setLoading(true);
      setStreaming(true);
      setError(null);
      setEntities([]);
      setStreamMeta(null);
      setStreamProgress(0);

      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const url = `${API_BASE_URL}/entities/stream${params.toString() ? '?' + params.toString() : ''}`;

      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.addEventListener('meta', (e) => {
         const meta = JSON.parse(e.data) as StreamMeta;
         setStreamMeta(meta);
      });

      eventSource.addEventListener('entity', (e) => {
         const entity = JSON.parse(e.data) as Entity;
         setEntities(prev => {
            const newEntities = [...prev, entity];
            if (streamMeta) {
               setStreamProgress(Math.round((newEntities.length / streamMeta.total) * 100));
            }
            return newEntities;
         });
         setLoading(false);
      });

      eventSource.addEventListener('complete', () => {
         setStreaming(false);
         setStreamProgress(100);
         eventSource.close();
      });

      eventSource.addEventListener('error', (e: any) => {
         console.error('SSE Error:', e);
         setStreaming(false);
         eventSource.close();
         // Fallback to regular API if streaming fails
         fallbackFetch();
      });

      eventSource.onerror = () => {
         setStreaming(false);
         eventSource.close();
         if (entities.length === 0) {
            fallbackFetch();
         }
      };
   }, [typeFilter, streamMeta]);

   const fallbackFetch = async () => {
      try {
         setLoading(true);
         const response = await api.getEntities({
            type: typeFilter !== 'all' ? typeFilter : undefined,
            limit: 50
         });

         if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
            setEntities(response.data as Entity[]);
            setUsingFallback(false);
         } else {
            // Use fallback data when API returns empty or fails
            console.log('Using fallback data - API returned empty or failed');
            let fallbackData = [...FALLBACK_ENTITIES];
            if (typeFilter !== 'all') {
               fallbackData = fallbackData.filter(e => e.type === typeFilter);
            }
            setEntities(fallbackData);
            setUsingFallback(true);
         }
      } catch (err) {
         console.error('Fallback fetch error:', err);
         // Use fallback data when API is completely unavailable
         console.log('Using fallback data - API unavailable');
         let fallbackData = [...FALLBACK_ENTITIES];
         if (typeFilter !== 'all') {
            fallbackData = fallbackData.filter(e => e.type === typeFilter);
         }
         setEntities(fallbackData);
         setUsingFallback(true);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchEntitiesStream();

      return () => {
         if (eventSourceRef.current) {
            eventSourceRef.current.close();
         }
      };
   }, [typeFilter]);

   // Fetch activity feed when tab switches to activity
   const fetchActivityFeed = useCallback(async () => {
      setFeedLoading(true);
      setFeedError(null);
      setFeedUsingFallback(false);

      try {
         const response = await api.getFeed({ limit: 20 });

         if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
            setFeedItems(response.data.slice(0, 20) as unknown as FeedItem[]);
         } else {
            console.log('Using fallback feed data - API returned empty or failed');
            setFeedItems(FALLBACK_FEED);
            setFeedUsingFallback(true);
         }
      } catch (err) {
         console.error('Feed fetch error:', err);
         console.log('Using fallback feed data - API unavailable');
         setFeedItems(FALLBACK_FEED);
         setFeedUsingFallback(true);
      } finally {
         setFeedLoading(false);
      }
   }, []);

   useEffect(() => {
      if (activeTab === 'activity' && feedItems.length === 0) {
         fetchActivityFeed();
      }
   }, [activeTab]);

   // Filter entities based on search and active filter
   const filteredEntities = useMemo(() => {
      let filtered = entities;

      // Apply search filter
      if (searchQuery) {
         const query = searchQuery.toLowerCase();
         filtered = filtered.filter(entity =>
            entity.name.toLowerCase().includes(query) ||
            entity.role.toLowerCase().includes(query) ||
            entity.location.toLowerCase().includes(query) ||
            entity.nameEn?.toLowerCase().includes(query) ||
            entity.specialties?.some(s => s.toLowerCase().includes(query))
         );
      }

      // Apply active filter
      if (activeFilter === 'following') {
         filtered = filtered.filter(e => followingIds.has(e.id));
      } else if (activeFilter === 'official') {
         filtered = filtered.filter(e => e.type === 'ministry' || e.type === 'authority');
      } else if (activeFilter === 'experts') {
         filtered = filtered.filter(e => e.type === 'expert' || e.type === 'analyst');
      }

      return filtered;
   }, [entities, searchQuery, activeFilter, followingIds]);

   const toggleFollow = async (id: string) => {
      setFollowingIds(prev => {
         const newSet = new Set(prev);
         if (newSet.has(id)) {
            newSet.delete(id);
         } else {
            newSet.add(id);
         }
         return newSet;
      });

      try {
         await api.toggleFollowEntity(id);
      } catch (err) {
         console.log('Follow toggled locally');
      }
   };

   const stats = useMemo(() => ({
      total: streamMeta?.total || entities.length,
      following: followingIds.size,
      official: streamMeta?.official || entities.filter(e => e.type === 'ministry' || e.type === 'authority').length,
      experts: streamMeta?.experts || entities.filter(e => e.type === 'expert' || e.type === 'analyst').length
   }), [entities, followingIds, streamMeta]);

   const getVerificationBadge = (entity: Entity) => {
      if (entity.verificationLevel === 'official') {
         return (
            <div className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-blue-500/30">
               <Shield size={12} className="fill-white" />
               <span>جهة رسمية</span>
            </div>
         );
      }
      if (entity.verificationLevel === 'verified') {
         return (
            <div className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-green-500/30">
               <BadgeCheck size={12} className="fill-white" />
               <span>موثق</span>
            </div>
         );
      }
      return null;
   };

   const getImpactBadge = (impact: string) => {
      const badges = {
         critical: { color: 'bg-red-100 text-red-700 border-red-200', label: 'تأثير حرج' },
         high: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'تأثير عالي' },
         medium: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'تأثير متوسط' },
         low: { color: 'bg-gray-100 text-gray-600 border-gray-200', label: 'تأثير منخفض' }
      };
      const badge = badges[impact as keyof typeof badges] || badges.medium;
      return (
         <span className={`${badge.color} px-2 py-1 rounded-lg text-[10px] font-bold border`}>
            {badge.label}
         </span>
      );
   };

   // Skeleton loader for cards
   const EntitySkeleton = () => (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden animate-pulse">
         <div className="h-32 bg-gray-200"></div>
         <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
               <div className="w-20 h-20 rounded-2xl bg-gray-200"></div>
               <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-1/3"></div>
               </div>
            </div>
            <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
            <div className="flex gap-2 mb-4">
               <div className="h-6 bg-gray-200 rounded-lg w-20"></div>
               <div className="h-6 bg-gray-200 rounded-lg w-24"></div>
               <div className="h-6 bg-gray-200 rounded-lg w-16"></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
               <div className="h-16 bg-gray-200 rounded-xl"></div>
               <div className="h-16 bg-gray-200 rounded-xl"></div>
               <div className="h-16 bg-gray-200 rounded-xl"></div>
            </div>
         </div>
      </div>
   );

   return (
      <div className="max-w-7xl mx-auto p-4 lg:p-8 animate-fadeIn">
         {/* Premium Header Section */}
         <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 lg:p-12 mb-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -ml-32 -mb-32"></div>

            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-xl text-white rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
                     <Users size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                     <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                        الجهات والخبراء
                     </h1>
                     <p className="text-blue-100 text-sm font-medium mt-1">اكتشف الجهات الرسمية والخبراء الموثوقين</p>
                  </div>
               </div>

               {/* Streaming Progress Indicator */}
               {streaming && (
                  <div className="mb-6 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="relative">
                           <Radio size={20} className="text-green-400 animate-pulse" />
                           <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></span>
                        </div>
                        <span className="text-white font-bold text-sm">جاري تحميل البيانات...</span>
                        <span className="text-blue-200 text-sm">{entities.length} / {streamMeta?.total || '?'}</span>
                     </div>
                     <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                        <div
                           className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-300 ease-out"
                           style={{ width: `${streamProgress}%` }}
                        ></div>
                     </div>
                  </div>
               )}

               {/* Fallback Data Notice */}
               {usingFallback && !loading && (
                  <div className="mb-6 bg-amber-500/20 backdrop-blur-xl rounded-2xl p-4 border border-amber-400/30">
                     <div className="flex items-center gap-3">
                        <Zap size={20} className="text-amber-300" />
                        <div>
                           <span className="text-white font-bold text-sm">بيانات مؤقتة</span>
                           <p className="text-amber-200 text-xs mt-1">الخادم غير متصل حالياً - يتم عرض بيانات محفوظة مسبقاً</p>
                        </div>
                        <button
                           onClick={fetchEntitiesStream}
                           className="mr-auto bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                        >
                           <RefreshCw size={14} />
                           إعادة المحاولة
                        </button>
                     </div>
                  </div>
               )}

               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 transition-all hover:bg-white/15">
                     <div className="flex items-center gap-2 mb-2">
                        <Landmark size={18} className="text-blue-200" />
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">إجمالي الجهات</p>
                     </div>
                     <h3 className="text-3xl font-black text-white">
                        {loading && entities.length === 0 ? (
                           <span className="inline-block w-12 h-8 bg-white/20 rounded animate-pulse"></span>
                        ) : stats.total}
                     </h3>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 transition-all hover:bg-white/15">
                     <div className="flex items-center gap-2 mb-2">
                        <UserCheck size={18} className="text-green-200" />
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">تتابعها</p>
                     </div>
                     <h3 className="text-3xl font-black text-white">{stats.following}</h3>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 transition-all hover:bg-white/15">
                     <div className="flex items-center gap-2 mb-2">
                        <Shield size={18} className="text-yellow-200" />
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">جهات رسمية</p>
                     </div>
                     <h3 className="text-3xl font-black text-white">
                        {loading && entities.length === 0 ? (
                           <span className="inline-block w-8 h-8 bg-white/20 rounded animate-pulse"></span>
                        ) : stats.official}
                     </h3>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 transition-all hover:bg-white/15">
                     <div className="flex items-center gap-2 mb-2">
                        <Award size={18} className="text-purple-200" />
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">خبراء</p>
                     </div>
                     <h3 className="text-3xl font-black text-white">
                        {loading && entities.length === 0 ? (
                           <span className="inline-block w-8 h-8 bg-white/20 rounded animate-pulse"></span>
                        ) : stats.experts}
                     </h3>
                  </div>
               </div>
            </div>
         </div>

         {/* Tab Switcher */}
         <div className="flex items-center gap-3 mb-8">
            <button
               onClick={() => setActiveTab('entities')}
               className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'entities'
                  ? 'bg-white text-blue-700 shadow-lg border border-blue-100'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-transparent'
                  }`}
            >
               <Users size={18} />
               الجهات والخبراء
            </button>
            <button
               onClick={() => setActiveTab('activity')}
               className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'activity'
                  ? 'bg-slate-900 text-emerald-400 shadow-lg shadow-slate-900/30 border border-slate-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-transparent'
                  }`}
            >
               <Activity size={18} />
               النشاط الأخير
            </button>
         </div>

         {/* ===== ENTITIES TAB ===== */}
         {activeTab === 'entities' && (
            <>
               {/* Search and Filters */}
               <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                  <div className="flex flex-col lg:flex-row gap-4 mb-6">
                     <div className="relative flex-1">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                           type="text"
                           placeholder="ابحث عن جهة رسمية، خبير، أو تخصص..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pr-12 pl-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                     </div>
                     <div className="flex items-center gap-2">
                        <select
                           value={typeFilter}
                           onChange={(e) => setTypeFilter(e.target.value)}
                           className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                        >
                           <option value="all">جميع الأنواع</option>
                           <option value="ministry">وزارات</option>
                           <option value="authority">هيئات</option>
                           <option value="expert">خبراء</option>
                           <option value="analyst">محللون</option>
                        </select>
                        <button
                           onClick={fetchEntitiesStream}
                           disabled={streaming}
                           className="p-3.5 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-all"
                           title="تحديث"
                        >
                           {streaming ? (
                              <Loader2 size={18} className="animate-spin text-blue-600" />
                           ) : (
                              <RefreshCw size={18} />
                           )}
                        </button>
                     </div>
                  </div>

                  <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                     <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeFilter === 'all'
                           ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                           : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                           }`}
                     >
                        الكل ({stats.total})
                     </button>
                     <button
                        onClick={() => setActiveFilter('following')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeFilter === 'following'
                           ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                           : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                           }`}
                     >
                        أتابعها ({stats.following})
                     </button>
                     <button
                        onClick={() => setActiveFilter('official')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeFilter === 'official'
                           ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                           : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                           }`}
                     >
                        <Shield size={16} />
                        جهات رسمية ({stats.official})
                     </button>
                     <button
                        onClick={() => setActiveFilter('experts')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeFilter === 'experts'
                           ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                           : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                           }`}
                     >
                        <Award size={16} />
                        خبراء ومحللون ({stats.experts})
                     </button>
                  </div>
               </div>

               {/* Error State */}
               {error && !loading && entities.length === 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                     <p className="text-red-600 mb-4">{error}</p>
                     <button
                        onClick={fetchEntitiesStream}
                        className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                     >
                        إعادة المحاولة
                     </button>
                  </div>
               )}

               {/* Loading Skeletons */}
               {loading && entities.length === 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {[1, 2, 3, 4].map(i => <EntitySkeleton key={i} />)}
                  </div>
               )}

               {/* Grid of Entities */}
               {entities.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {filteredEntities.map((entity, index) => (
                        <div
                           key={entity.id}
                           className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl hover:border-blue-200 transition-all duration-300 group overflow-hidden animate-fadeIn"
                           style={{ animationDelay: `${index * 50}ms` }}
                        >
                           {/* Cover Image */}
                           {entity.coverImage && (
                              <div className="h-32 overflow-hidden relative">
                                 <img
                                    src={entity.coverImage}
                                    alt={entity.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                 />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                 <div className="absolute top-4 right-4">
                                    {getVerificationBadge(entity)}
                                 </div>
                              </div>
                           )}

                           <div className="p-6">
                              <div className="flex items-start gap-4 mb-4">
                                 {/* Avatar */}
                                 <div className="relative shrink-0">
                                    <div className={`w-20 h-20 rounded-2xl overflow-hidden border-4 ${entity.verificationLevel === 'official' ? 'border-blue-500' :
                                       entity.verificationLevel === 'verified' ? 'border-green-500' :
                                          'border-gray-200'
                                       } shadow-xl group-hover:scale-105 transition-transform`}>
                                       <img src={entity.avatar} alt={entity.name} className="w-full h-full object-cover" />
                                    </div>
                                    {entity.isVerified && (
                                       <div className={`absolute -bottom-2 -left-2 ${entity.verificationLevel === 'official' ? 'bg-blue-600' : 'bg-green-600'
                                          } text-white p-1.5 rounded-lg border-4 border-white shadow-lg`}>
                                          {entity.verificationLevel === 'official' ? (
                                             <Shield size={14} className="fill-white" />
                                          ) : (
                                             <BadgeCheck size={14} className="fill-white" />
                                          )}
                                       </div>
                                    )}
                                 </div>

                                 {/* Info */}
                                 <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                                       {entity.name}
                                    </h3>
                                    {entity.nameEn && (
                                       <p className="text-xs text-gray-400 font-medium mb-2">{entity.nameEn}</p>
                                    )}
                                    <div className="flex items-center gap-2 mb-2">
                                       {entity.type === 'ministry' && <Building2 size={14} className="text-blue-500" />}
                                       {entity.type === 'authority' && <Landmark size={14} className="text-indigo-500" />}
                                       {entity.type === 'expert' && <Award size={14} className="text-purple-500" />}
                                       {entity.type === 'analyst' && <BarChart3 size={14} className="text-green-500" />}
                                       <p className="text-sm font-bold text-gray-600">{entity.role}</p>
                                    </div>
                                    {getImpactBadge(entity.impact)}
                                 </div>

                                 {/* Follow Button */}
                                 <button
                                    onClick={() => toggleFollow(entity.id)}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 ${followingIds.has(entity.id)
                                       ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700'
                                       : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                                       }`}
                                 >
                                    {followingIds.has(entity.id) ? (
                                       <span className="flex items-center gap-2">
                                          <Check size={16} strokeWidth={3} /> متابع
                                       </span>
                                    ) : (
                                       <span className="flex items-center gap-2">
                                          <UserPlus size={16} /> تابع
                                       </span>
                                    )}
                                 </button>
                              </div>

                              {/* Description */}
                              {entity.description && (
                                 <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
                                    {entity.description}
                                 </p>
                              )}

                              {/* Specialties */}
                              {entity.specialties && entity.specialties.length > 0 && (
                                 <div className="flex flex-wrap gap-2 mb-4">
                                    {entity.specialties.slice(0, 4).map((specialty, idx) => (
                                       <span
                                          key={idx}
                                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100"
                                       >
                                          {specialty}
                                       </span>
                                    ))}
                                    {entity.specialties.length > 4 && (
                                       <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">
                                          +{entity.specialties.length - 4}
                                       </span>
                                    )}
                                 </div>
                              )}

                              {/* Stats and Info */}
                              <div className="grid grid-cols-3 gap-3 mb-4">
                                 <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100 hover:bg-gray-100 transition-colors">
                                    <p className="text-xs text-gray-500 font-bold mb-1">متابعون</p>
                                    <p className="text-lg font-black text-gray-900">{entity.stats.followers}</p>
                                 </div>
                                 <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100 hover:bg-gray-100 transition-colors">
                                    <p className="text-xs text-gray-500 font-bold mb-1">منشورات</p>
                                    <p className="text-lg font-black text-gray-900">{entity.stats.posts.toLocaleString()}</p>
                                 </div>
                                 {entity.stats.datasets !== undefined && (
                                    <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100 hover:bg-blue-100 transition-colors">
                                       <p className="text-xs text-blue-600 font-bold mb-1">بيانات</p>
                                       <p className="text-lg font-black text-blue-700">{entity.stats.datasets}</p>
                                    </div>
                                 )}
                              </div>

                              {/* Footer */}
                              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                 <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <MapPin size={14} className="text-gray-400" />
                                    <span className="font-medium">{entity.location}</span>
                                 </div>
                                 {entity.website && (
                                    <a
                                       href={`https://${entity.website}`}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="flex items-center gap-1.5 text-blue-600 text-xs font-bold hover:underline"
                                    >
                                       <Globe size={14} />
                                       {entity.website}
                                    </a>
                                 )}
                              </div>

                              {entity.establishedYear && (
                                 <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                                    <FileText size={12} />
                                    <span>تأسست عام {entity.establishedYear}</span>
                                 </div>
                              )}
                           </div>
                        </div>
                     ))}

                     {/* Streaming indicator at the end */}
                     {streaming && entities.length > 0 && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-dashed border-blue-200 p-8 flex items-center justify-center">
                           <div className="text-center">
                              <div className="relative inline-block mb-3">
                                 <Zap size={32} className="text-blue-500" />
                                 <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
                              </div>
                              <p className="text-blue-600 font-bold">جاري تحميل المزيد...</p>
                              <p className="text-blue-400 text-sm">{streamProgress}%</p>
                           </div>
                        </div>
                     )}
                  </div>
               )}

               {/* Empty State */}
               {!loading && !error && !streaming && filteredEntities.length === 0 && entities.length > 0 && (
                  <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                     <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <Search size={40} />
                     </div>
                     <h3 className="text-2xl font-black text-gray-900 mb-2">لا توجد نتائج</h3>
                     <p className="text-gray-500">جرب البحث بكلمات أخرى أو تغيير الفلاتر</p>
                  </div>
               )}
            </>
         )}

         {/* ===== ACTIVITY FEED TAB ===== */}
         {activeTab === 'activity' && (
            <div className="bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden" dir="rtl">
               {/* Activity Feed Header */}
               <div className="px-6 lg:px-8 py-6 border-b border-slate-700 bg-slate-900/80">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                           <Activity size={20} className="text-emerald-400" />
                        </div>
                        <div>
                           <h2 className="text-xl font-black text-white">النشاط الأخير</h2>
                           <p className="text-slate-400 text-xs mt-0.5">آخر المنشورات من الجهات والخبراء المتابَعين</p>
                        </div>
                     </div>
                     <button
                        onClick={fetchActivityFeed}
                        disabled={feedLoading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-slate-300 text-sm font-bold hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
                     >
                        {feedLoading ? (
                           <Loader2 size={16} className="animate-spin" />
                        ) : (
                           <RefreshCw size={16} />
                        )}
                        تحديث
                     </button>
                  </div>

                  {/* Fallback notice for feed */}
                  {feedUsingFallback && !feedLoading && (
                     <div className="mt-4 bg-amber-500/10 rounded-xl p-3 border border-amber-500/20 flex items-center gap-3">
                        <Zap size={16} className="text-amber-400 shrink-0" />
                        <p className="text-amber-300 text-xs font-medium">بيانات مؤقتة - الخادم غير متصل حالياً</p>
                     </div>
                  )}
               </div>

               {/* Feed Loading State */}
               {feedLoading && (
                  <div className="p-6 lg:p-8 space-y-4">
                     {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-slate-800 rounded-2xl border border-slate-700 p-5 animate-pulse">
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-11 h-11 rounded-full bg-slate-700"></div>
                              <div className="flex-1">
                                 <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"></div>
                                 <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                              </div>
                              <div className="h-6 bg-slate-700 rounded-lg w-16"></div>
                           </div>
                           <div className="h-5 bg-slate-700 rounded w-2/3 mb-3"></div>
                           <div className="h-3 bg-slate-700 rounded w-full mb-2"></div>
                           <div className="h-3 bg-slate-700 rounded w-4/5"></div>
                        </div>
                     ))}
                  </div>
               )}

               {/* Feed Error State */}
               {feedError && !feedLoading && (
                  <div className="p-8 text-center">
                     <p className="text-red-400 mb-4 text-sm">{feedError}</p>
                     <button
                        onClick={fetchActivityFeed}
                        className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors"
                     >
                        إعادة المحاولة
                     </button>
                  </div>
               )}

               {/* Feed Items */}
               {!feedLoading && !feedError && feedItems.length > 0 && (
                  <div className="p-4 lg:p-6 space-y-3">
                     {feedItems.map((item, index) => {
                        const authorName = item.author?.nameAr || item.author?.name || 'مستخدم';
                        const authorInitial = authorName.charAt(0);
                        const displayTitle = item.titleAr || item.title;

                        return (
                           <a
                              key={item.id}
                              href={`/content/${item.id}`}
                              className="block bg-slate-800 rounded-2xl border border-slate-700 p-5 hover:bg-slate-750 hover:border-slate-600 transition-all duration-200 group animate-fadeIn"
                              style={{ animationDelay: `${index * 40}ms` }}
                           >
                              {/* Author row */}
                              <div className="flex items-center gap-3 mb-3">
                                 {/* Avatar circle with first letter */}
                                 <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-blue-500/20">
                                    {item.author?.avatar ? (
                                       <img src={item.author.avatar} alt={authorName} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                       authorInitial
                                    )}
                                 </div>

                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                       <span className="text-white font-bold text-sm truncate">{authorName}</span>
                                       {item.author?.role && (
                                          <span className={`${getRoleBadgeColor(item.author.role)} px-2 py-0.5 rounded-md text-[10px] font-bold`}>
                                             {item.author.role}
                                          </span>
                                       )}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                       <Clock size={12} className="text-slate-500" />
                                       <span className="text-slate-500 text-xs">{formatTimeAgoAr(item.publishedAt)}</span>
                                    </div>
                                 </div>

                                 {/* Content type badge */}
                                 <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold shrink-0 ${getContentTypeBadgeColor(item.type)}`}>
                                    {getContentTypeIcon(item.type)}
                                    <span>{getContentTypeLabelAr(item.type)}</span>
                                 </div>
                              </div>

                              {/* Content title */}
                              <h3 className="text-white font-bold text-base mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2 leading-relaxed">
                                 {displayTitle}
                              </h3>

                              {/* Excerpt */}
                              {(item.excerptAr || item.excerpt) && (
                                 <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-3">
                                    {item.excerptAr || item.excerpt}
                                 </p>
                              )}

                              {/* Tags */}
                              {item.tags && item.tags.length > 0 && (
                                 <div className="flex flex-wrap gap-1.5 mb-3">
                                    {item.tags.slice(0, 3).map((tag, idx) => (
                                       <span key={idx} className="bg-slate-700/60 text-slate-400 px-2 py-0.5 rounded-md text-[11px] font-medium">
                                          #{tag}
                                       </span>
                                    ))}
                                 </div>
                              )}

                              {/* Footer: view link */}
                              <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                                 <div className="flex items-center gap-4 text-slate-500 text-xs">
                                    {item.viewCount !== undefined && (
                                       <span>{item.viewCount.toLocaleString()} مشاهدة</span>
                                    )}
                                    {item.likeCount !== undefined && (
                                       <span>{item.likeCount.toLocaleString()} إعجاب</span>
                                    )}
                                 </div>
                                 <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span>عرض المحتوى</span>
                                    <ArrowUpRight size={14} />
                                 </div>
                              </div>
                           </a>
                        );
                     })}
                  </div>
               )}

               {/* Empty Feed State */}
               {!feedLoading && !feedError && feedItems.length === 0 && (
                  <div className="p-12 text-center">
                     <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-700">
                        <Activity size={36} className="text-slate-600" />
                     </div>
                     <h3 className="text-xl font-black text-white mb-2">لا يوجد نشاط حديث من المتابَعين</h3>
                     <p className="text-slate-500 text-sm max-w-md mx-auto">
                        تابع المزيد من الجهات والخبراء لمشاهدة نشاطهم الأخير هنا
                     </p>
                     <button
                        onClick={() => setActiveTab('entities')}
                        className="mt-6 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
                     >
                        <Users size={16} />
                        تصفح الجهات والخبراء
                     </button>
                  </div>
               )}
            </div>
         )}
      </div>
   );
};

export default FollowersWrapper;
