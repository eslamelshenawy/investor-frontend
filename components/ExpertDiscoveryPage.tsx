/**
 * ==========================================
 * EXPERT DISCOVERY PAGE - اكتشاف الخبراء والمحللين
 * ==========================================
 *
 * صفحة اكتشاف الخبراء - المحرك الاجتماعي للمنصة
 * Social engine of the platform - connecting users with real analysts and experts
 * "Humanizing data" by linking users to verified professionals
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  UserPlus,
  UserCheck,
  Star,
  BadgeCheck,
  Filter,
  TrendingUp,
  Building2,
  Briefcase,
  MapPin,
  ChevronLeft,
} from 'lucide-react';
import api from '../src/services/api';

// ============================================
// TYPES
// ============================================

interface MutualFollower {
  id: string;
  name: string;
  avatar: string;
}

interface Expert {
  id: string;
  name: string;
  nameEn?: string;
  title: string;
  type: 'expert' | 'analyst' | 'consultant';
  specialty: string;
  region: string;
  country: string;
  avatar: string;
  isVerified: boolean;
  isFollowing: boolean;
  followerCount: string;
  postsCount: number;
  categories: string[];
  bio?: string;
  mutualFollowers: MutualFollower[];
}

type TabFilter = 'all' | 'following' | 'suggested';

// ============================================
// CATEGORY CHIPS
// ============================================

const CATEGORIES = [
  { id: 'real-estate', label: 'عقارات', icon: Building2 },
  { id: 'finance', label: 'تمويل', icon: TrendingUp },
  { id: 'energy', label: 'طاقة', icon: Star },
  { id: 'tech', label: 'تقنية', icon: Briefcase },
  { id: 'industry', label: 'صناعة', icon: Building2 },
  { id: 'trade', label: 'تجارة', icon: Briefcase },
] as const;

// ============================================
// FALLBACK EXPERTS DATA
// ============================================

const FALLBACK_EXPERTS: Expert[] = [
  {
    id: 'exp_1',
    name: 'د. خالد بن فهد العثمان',
    nameEn: 'Dr. Khalid Al-Othman',
    title: 'محلل مالي معتمد',
    type: 'analyst',
    specialty: 'الأسواق المالية',
    region: 'الرياض',
    country: 'السعودية',
    avatar: 'https://i.pravatar.cc/200?u=khalid_expert',
    isVerified: true,
    isFollowing: true,
    followerCount: '45.2K',
    postsCount: 1850,
    categories: ['finance'],
    bio: 'خبير اقتصادي معتمد مع أكثر من 15 عاما من الخبرة في تحليل الأسواق السعودية والخليجية',
    mutualFollowers: [
      { id: 'm1', name: 'أحمد', avatar: 'https://i.pravatar.cc/40?u=m1' },
      { id: 'm2', name: 'فهد', avatar: 'https://i.pravatar.cc/40?u=m2' },
      { id: 'm3', name: 'نورة', avatar: 'https://i.pravatar.cc/40?u=m3' },
    ],
  },
  {
    id: 'exp_2',
    name: 'سارة المنصور',
    nameEn: 'Sarah Al-Mansour',
    title: 'مستشارة عقارية',
    type: 'consultant',
    specialty: 'السوق العقاري',
    region: 'جدة',
    country: 'السعودية',
    avatar: 'https://i.pravatar.cc/200?u=sarah_expert',
    isVerified: true,
    isFollowing: false,
    followerCount: '28.5K',
    postsCount: 920,
    categories: ['real-estate'],
    bio: 'متخصصة في تحليل بيانات السوق العقاري السعودي وتقديم رؤى استثمارية دقيقة',
    mutualFollowers: [
      { id: 'm4', name: 'ريم', avatar: 'https://i.pravatar.cc/40?u=m4' },
      { id: 'm5', name: 'خالد', avatar: 'https://i.pravatar.cc/40?u=m5' },
    ],
  },
  {
    id: 'exp_3',
    name: 'م. عبدالله الجارالله',
    nameEn: 'Eng. Abdullah Al-Jarallah',
    title: 'خبير طاقة متجددة',
    type: 'expert',
    specialty: 'قطاع الطاقة',
    region: 'الدمام',
    country: 'السعودية',
    avatar: 'https://i.pravatar.cc/200?u=abdullah_expert',
    isVerified: true,
    isFollowing: false,
    followerCount: '32.8K',
    postsCount: 1240,
    categories: ['energy'],
    bio: 'مهندس صناعي متخصص في مشاريع الطاقة المتجددة والاستدامة في المنطقة',
    mutualFollowers: [
      { id: 'm6', name: 'سعود', avatar: 'https://i.pravatar.cc/40?u=m6' },
    ],
  },
  {
    id: 'exp_4',
    name: 'أحمد الشهري',
    nameEn: 'Ahmed Al-Shehri',
    title: 'محلل تقني',
    type: 'analyst',
    specialty: 'التقنية المالية',
    region: 'الرياض',
    country: 'السعودية',
    avatar: 'https://i.pravatar.cc/200?u=ahmed_expert',
    isVerified: false,
    isFollowing: true,
    followerCount: '18.3K',
    postsCount: 2450,
    categories: ['tech', 'finance'],
    bio: 'محلل تقني متخصص في التقنية المالية والتحول الرقمي',
    mutualFollowers: [],
  },
  {
    id: 'exp_5',
    name: 'نورة القحطاني',
    nameEn: 'Noura Al-Qahtani',
    title: 'خبيرة تجارة دولية',
    type: 'expert',
    specialty: 'التجارة الدولية',
    region: 'أبوظبي',
    country: 'الإمارات',
    avatar: 'https://i.pravatar.cc/200?u=noura_expert',
    isVerified: true,
    isFollowing: false,
    followerCount: '22.1K',
    postsCount: 780,
    categories: ['trade'],
    bio: 'خبيرة في التجارة الدولية والعلاقات الاقتصادية بين دول الخليج والأسواق العالمية',
    mutualFollowers: [
      { id: 'm7', name: 'ليلى', avatar: 'https://i.pravatar.cc/40?u=m7' },
      { id: 'm8', name: 'منى', avatar: 'https://i.pravatar.cc/40?u=m8' },
      { id: 'm9', name: 'طارق', avatar: 'https://i.pravatar.cc/40?u=m9' },
      { id: 'm10', name: 'عمر', avatar: 'https://i.pravatar.cc/40?u=m10' },
    ],
  },
  {
    id: 'exp_6',
    name: 'د. فيصل الدوسري',
    nameEn: 'Dr. Faisal Al-Dosari',
    title: 'مستشار صناعي',
    type: 'consultant',
    specialty: 'القطاع الصناعي',
    region: 'الجبيل',
    country: 'السعودية',
    avatar: 'https://i.pravatar.cc/200?u=faisal_expert',
    isVerified: true,
    isFollowing: true,
    followerCount: '15.7K',
    postsCount: 560,
    categories: ['industry'],
    bio: 'مستشار في التطوير الصناعي والمدن الاقتصادية مع خبرة واسعة في القطاع',
    mutualFollowers: [
      { id: 'm11', name: 'ياسر', avatar: 'https://i.pravatar.cc/40?u=m11' },
    ],
  },
  {
    id: 'exp_7',
    name: 'ريم الحربي',
    nameEn: 'Reem Al-Harbi',
    title: 'محللة أسواق مال',
    type: 'analyst',
    specialty: 'صناديق الاستثمار',
    region: 'الرياض',
    country: 'السعودية',
    avatar: 'https://i.pravatar.cc/200?u=reem_expert',
    isVerified: true,
    isFollowing: false,
    followerCount: '38.9K',
    postsCount: 1650,
    categories: ['finance'],
    bio: 'متخصصة في تحليل أداء صناديق الاستثمار والمحافظ المالية في السوق السعودي',
    mutualFollowers: [
      { id: 'm12', name: 'سلمان', avatar: 'https://i.pravatar.cc/40?u=m12' },
      { id: 'm13', name: 'هند', avatar: 'https://i.pravatar.cc/40?u=m13' },
    ],
  },
  {
    id: 'exp_8',
    name: 'طارق بن سعيد العمري',
    nameEn: 'Tariq Al-Omari',
    title: 'خبير عقاري',
    type: 'expert',
    specialty: 'التطوير العقاري',
    region: 'دبي',
    country: 'الإمارات',
    avatar: 'https://i.pravatar.cc/200?u=tariq_expert',
    isVerified: true,
    isFollowing: false,
    followerCount: '51.4K',
    postsCount: 2100,
    categories: ['real-estate'],
    bio: 'خبير في التطوير العقاري والمشاريع الكبرى في دول الخليج العربي',
    mutualFollowers: [
      { id: 'm14', name: 'عادل', avatar: 'https://i.pravatar.cc/40?u=m14' },
      { id: 'm15', name: 'مها', avatar: 'https://i.pravatar.cc/40?u=m15' },
      { id: 'm16', name: 'بدر', avatar: 'https://i.pravatar.cc/40?u=m16' },
    ],
  },
  {
    id: 'exp_9',
    name: 'سلطان الغامدي',
    nameEn: 'Sultan Al-Ghamdi',
    title: 'محلل تقنية معلومات',
    type: 'analyst',
    specialty: 'الأمن السيبراني',
    region: 'الرياض',
    country: 'السعودية',
    avatar: 'https://i.pravatar.cc/200?u=sultan_expert',
    isVerified: false,
    isFollowing: false,
    followerCount: '12.6K',
    postsCount: 430,
    categories: ['tech'],
    bio: 'متخصص في الأمن السيبراني وتحليل مخاطر التقنية في القطاع المالي',
    mutualFollowers: [],
  },
];

// ============================================
// HELPER: Map API entities to Expert type
// ============================================

function mapEntityToExpert(entity: any): Expert {
  const categoriesMap: Record<string, string> = {
    'عقاري': 'real-estate',
    'مالي': 'finance',
    'طاقة': 'energy',
    'تقنية': 'tech',
    'تقني': 'tech',
    'صناعي': 'industry',
    'تجارة': 'trade',
    'تجاري': 'trade',
  };

  const role = entity.role || entity.title || '';
  const specialties: string[] = entity.specialties || [];

  const detectedCategories: string[] = [];
  const allText = [role, ...specialties].join(' ');
  for (const [keyword, cat] of Object.entries(categoriesMap)) {
    if (allText.includes(keyword) && !detectedCategories.includes(cat)) {
      detectedCategories.push(cat);
    }
  }
  if (detectedCategories.length === 0) detectedCategories.push('finance');

  const entityType =
    entity.type === 'consultant'
      ? 'consultant'
      : entity.type === 'analyst'
        ? 'analyst'
        : 'expert';

  return {
    id: entity.id || String(Math.random()),
    name: entity.name || entity.nameAr || '',
    nameEn: entity.nameEn || '',
    title: role,
    type: entityType,
    specialty: specialties[0] || role,
    region: entity.location?.split(',')[0]?.trim() || entity.region || '',
    country:
      entity.country ||
      (entity.location?.includes('الإمارات') ? 'الإمارات' : 'السعودية'),
    avatar:
      entity.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(entity.name || 'X')}&background=3B82F6&color=fff&size=200&bold=true`,
    isVerified: entity.isVerified ?? false,
    isFollowing: entity.isFollowing ?? false,
    followerCount: entity.stats?.followers || '0',
    postsCount: entity.stats?.posts || 0,
    categories: detectedCategories,
    bio: entity.description || entity.bio || '',
    mutualFollowers: entity.mutualFollowers || [],
  };
}

// ============================================
// COMPONENT
// ============================================

const ExpertDiscoveryPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [experts, setExperts] = useState<Expert[]>(FALLBACK_EXPERTS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');

  // ============================================
  // FETCH DATA
  // ============================================

  useEffect(() => {
    const fetchExperts = async () => {
      setLoading(true);
      try {
        const response = await api.get('/entities');
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const mapped = response.data
            .filter(
              (e: any) =>
                e.type === 'expert' || e.type === 'analyst' || e.type === 'consultant'
            )
            .map(mapEntityToExpert);
          if (mapped.length > 0) {
            setExperts(mapped);
          }
        }
      } catch {
        // Use fallback data silently
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, []);

  // ============================================
  // TOGGLE FOLLOW
  // ============================================

  const toggleFollow = (id: string) => {
    setExperts((prev) =>
      prev.map((expert) =>
        expert.id === id ? { ...expert, isFollowing: !expert.isFollowing } : expert
      )
    );
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const stats = {
    total: experts.length,
    following: experts.filter((e) => e.isFollowing).length,
    newToday: 3,
    followRequests: 5,
  };

  // Get unique countries for filter
  const uniqueCountries = Array.from(new Set(experts.map((e) => e.country)));
  const uniqueSpecialties = Array.from(new Set(experts.map((e) => e.specialty)));

  // Filter experts
  const filteredExperts = experts.filter((expert) => {
    // Search
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      expert.name.toLowerCase().includes(query) ||
      (expert.nameEn?.toLowerCase().includes(query)) ||
      expert.title.toLowerCase().includes(query) ||
      expert.specialty.toLowerCase().includes(query) ||
      expert.region.toLowerCase().includes(query) ||
      expert.country.toLowerCase().includes(query);

    // Tab filter
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'following'
          ? expert.isFollowing
          : !expert.isFollowing; // suggested = not yet following

    // Category filter
    const matchesCategory =
      !selectedCategory || expert.categories.includes(selectedCategory);

    // Country filter
    const matchesCountry =
      countryFilter === 'all' || expert.country === countryFilter;

    // Specialty filter
    const matchesSpecialty =
      specialtyFilter === 'all' || expert.specialty === specialtyFilter;

    return matchesSearch && matchesTab && matchesCategory && matchesCountry && matchesSpecialty;
  });

  // ============================================
  // RENDER
  // ============================================

  return (
    <div dir="rtl" className="max-w-7xl mx-auto p-4 lg:p-8 animate-fadeIn">
      {/* ===== HEADER SECTION ===== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 rounded-3xl p-8 lg:p-12 mb-8 shadow-2xl">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl -ml-24 -mb-24" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-300/10 rounded-full blur-2xl" />

        <div className="relative z-10">
          {/* Title */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl text-white rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
              <Users size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                اكتشاف الخبراء والمحللين
              </h1>
              <p className="text-emerald-100 text-sm font-medium mt-1">
                تواصل مع أفضل المحللين والخبراء في مجال الاستثمار
              </p>
            </div>
          </div>

          {/* ===== NETWORK OVERVIEW STATS (4 Cards) ===== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {/* Total Experts */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Users size={18} className="text-emerald-200" />
                <p className="text-emerald-100 text-xs font-bold">
                  اجمالي الخبراء
                </p>
              </div>
              <h3 className="text-3xl font-black text-white">{stats.total}</h3>
            </div>

            {/* Currently Following */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck size={18} className="text-green-200" />
                <p className="text-emerald-100 text-xs font-bold">
                  تتابعهم حاليا
                </p>
              </div>
              <h3 className="text-3xl font-black text-white">{stats.following}</h3>
            </div>

            {/* New Followers Today */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-yellow-200" />
                <p className="text-emerald-100 text-xs font-bold">
                  متابعون جدد اليوم
                </p>
              </div>
              <h3 className="text-3xl font-black text-white">+{stats.newToday}</h3>
            </div>

            {/* Follow Requests */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus size={18} className="text-purple-200" />
                <p className="text-emerald-100 text-xs font-bold">
                  طلبات المتابعة
                </p>
              </div>
              <h3 className="text-3xl font-black text-white">{stats.followRequests}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SEARCH & FILTER BAR ===== */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
        {/* Search Input + Filter Button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-5">
          <div className="relative flex-1">
            <Search
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="ابحث بالاسم، التخصص، أو المنطقة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pr-12 pl-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold transition-all shrink-0 ${
              showFilterPanel
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter size={18} />
            <span>فلترة متقدمة</span>
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilterPanel && (
          <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">
                  الدولة
                </label>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                >
                  <option value="all">جميع الدول</option>
                  {uniqueCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">
                  التخصص
                </label>
                <select
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                >
                  <option value="all">جميع التخصصات</option>
                  {uniqueSpecialties.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            الكل ({stats.total})
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'following'
                ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <UserCheck size={16} />
            اتابعهم ({stats.following})
          </button>
          <button
            onClick={() => setActiveTab('suggested')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'suggested'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Star size={16} />
            المقترحون ({stats.total - stats.following})
          </button>
        </div>
      </div>

      {/* ===== CATEGORY FILTER CHIPS ===== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar mb-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
            !selectedCategory
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
              : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
          }`}
        >
          الكل
        </button>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() =>
                setSelectedCategory(isActive ? null : cat.id)
              }
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
              }`}
            >
              <Icon size={14} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ===== LOADING STATE ===== */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded-lg w-full mb-3" />
              <div className="h-3 bg-gray-100 rounded-lg w-2/3 mb-4" />
              <div className="flex gap-2">
                <div className="h-6 bg-gray-100 rounded-full w-16" />
                <div className="h-6 bg-gray-100 rounded-full w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== EXPERT CARDS GRID ===== */}
      {!loading && filteredExperts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredExperts.map((expert, index) => (
            <div
              key={expert.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Card Top Accent */}
              <div className="h-1.5 bg-gradient-to-l from-emerald-500 via-teal-500 to-cyan-500" />

              <div className="p-6">
                {/* Expert Info Row */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className={`w-16 h-16 rounded-2xl overflow-hidden border-3 ${
                        expert.isVerified
                          ? 'border-emerald-400'
                          : 'border-gray-200'
                      } shadow-lg group-hover:scale-105 transition-transform duration-300`}
                    >
                      <img
                        src={expert.avatar}
                        alt={expert.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {expert.isVerified && (
                      <div className="absolute -bottom-1.5 -left-1.5 bg-blue-600 text-white p-1 rounded-lg border-2 border-white shadow-md">
                        <BadgeCheck size={12} className="fill-white" />
                      </div>
                    )}
                  </div>

                  {/* Name & Title */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-black text-gray-900 mb-0.5 group-hover:text-emerald-600 transition-colors line-clamp-1">
                      {expert.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Briefcase size={13} className="text-emerald-500 shrink-0" />
                      <p className="text-sm font-semibold text-gray-600 line-clamp-1">
                        {expert.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-gray-400 shrink-0" />
                      <p className="text-xs text-gray-500 font-medium">
                        {expert.region}، {expert.country}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {expert.bio && (
                  <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
                    {expert.bio}
                  </p>
                )}

                {/* Category Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {expert.categories.map((catId) => {
                    const catInfo = CATEGORIES.find((c) => c.id === catId);
                    return catInfo ? (
                      <span
                        key={catId}
                        className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-emerald-100"
                      >
                        {catInfo.label}
                      </span>
                    ) : null;
                  })}
                </div>

                {/* Follower Count */}
                <div className="flex items-center gap-2 mb-4">
                  <Users size={14} className="text-gray-400" />
                  <span className="text-sm font-bold text-gray-700">
                    {expert.followerCount}
                  </span>
                  <span className="text-xs text-gray-400">متابع</span>
                </div>

                {/* Mutual Followers */}
                {expert.mutualFollowers.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-2 space-x-reverse">
                      {expert.mutualFollowers.slice(0, 3).map((mf) => (
                        <img
                          key={mf.id}
                          src={mf.avatar}
                          alt={mf.name}
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm object-cover"
                          title={mf.name}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {expert.mutualFollowers.length <= 3
                        ? `${expert.mutualFollowers.map((m) => m.name).join(' و ')} يتابعونه`
                        : `${expert.mutualFollowers[0].name} و ${expert.mutualFollowers.length - 1} آخرين يتابعونه`}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => toggleFollow(expert.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      expert.isFollowing
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700'
                        : 'bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    {expert.isFollowing ? (
                      <>
                        <UserCheck size={16} strokeWidth={2.5} />
                        <span>متابع</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        <span>تابع</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate(`/experts/${expert.id}`)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                  >
                    <span>الملف</span>
                    <ChevronLeft size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== EMPTY STATE ===== */}
      {!loading && filteredExperts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
            <Search size={40} />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">
            لا توجد نتائج
          </h3>
          <p className="text-gray-500 mb-6">
            جرب البحث بكلمات أخرى أو تغيير الفلاتر
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveTab('all');
              setSelectedCategory(null);
              setCountryFilter('all');
              setSpecialtyFilter('all');
            }}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30"
          >
            مسح جميع الفلاتر
          </button>
        </div>
      )}

      {/* ===== RESULTS COUNT ===== */}
      {!loading && filteredExperts.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-400 font-medium">
            عرض {filteredExperts.length} من {experts.length} خبير ومحلل
          </p>
        </div>
      )}
    </div>
  );
};

export default ExpertDiscoveryPage;
