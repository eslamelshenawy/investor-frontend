import React, { useState } from 'react';
import {
   Users,
   Search,
   MapPin,
   Filter,
   UserPlus,
   Check,
   ChevronRight,
   UserCheck,
   Shield,
   BadgeCheck,
   Building2,
   TrendingUp,
   Award,
   Star,
   Globe,
   Briefcase,
   FileText,
   BarChart3,
   Landmark
} from 'lucide-react';

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

const SAUDI_ENTITIES: Entity[] = [
   {
      id: 'gov_1',
      name: 'وزارة الاستثمار',
      nameEn: 'Ministry of Investment',
      role: 'جهة حكومية رسمية',
      type: 'ministry',
      location: 'الرياض، المملكة العربية السعودية',
      avatar: 'https://ui-avatars.com/api/?name=MISA&background=0D47A1&color=fff&size=200&bold=true',
      coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=400&fit=crop',
      isFollowing: true,
      isVerified: true,
      verificationLevel: 'official',
      stats: {
         followers: '245K',
         posts: 1240,
         datasets: 45
      },
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
      isFollowing: true,
      isVerified: true,
      verificationLevel: 'official',
      stats: {
         followers: '189K',
         posts: 2850,
         datasets: 120
      },
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
      isFollowing: true,
      isVerified: true,
      verificationLevel: 'official',
      stats: {
         followers: '312K',
         posts: 980,
         datasets: 65
      },
      specialties: ['السياسة النقدية', 'الاستقرار المالي', 'الرقابة المصرفية', 'الاحتياطيات'],
      description: 'البنك المركزي للمملكة، المسؤول عن السياسة النقدية والرقابة على القطاع المصرفي والمالي',
      website: 'sama.gov.sa',
      establishedYear: '1952',
      impact: 'critical'
   },
   {
      id: 'gov_4',
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
      stats: {
         followers: '156K',
         posts: 1560,
         datasets: 38
      },
      specialties: ['السجلات التجارية', 'حماية المستهلك', 'التجارة الإلكترونية', 'الملكية الفكرية'],
      description: 'تنظيم وتطوير الأنشطة التجارية وحماية حقوق المستهلكين وتعزيز بيئة الأعمال',
      website: 'mc.gov.sa',
      establishedYear: '1954',
      impact: 'high'
   },
   {
      id: 'gov_5',
      name: 'هيئة السوق المالية',
      nameEn: 'Capital Market Authority',
      role: 'جهة حكومية رسمية',
      type: 'authority',
      location: 'الرياض، المملكة العربية السعودية',
      avatar: 'https://ui-avatars.com/api/?name=CMA&background=4A148C&color=fff&size=200&bold=true',
      coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=400&fit=crop',
      isFollowing: true,
      isVerified: true,
      verificationLevel: 'official',
      stats: {
         followers: '198K',
         posts: 1120,
         datasets: 52
      },
      specialties: ['سوق الأسهم', 'الشركات المدرجة', 'الإفصاحات', 'الرقابة المالية'],
      description: 'تنظيم وتطوير السوق المالية السعودية وحماية المستثمرين والمتعاملين',
      website: 'cma.org.sa',
      establishedYear: '2003',
      impact: 'critical'
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
      stats: {
         followers: '142K',
         posts: 890,
         datasets: 42
      },
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
      isFollowing: true,
      isVerified: true,
      verificationLevel: 'verified',
      stats: {
         followers: '45.2K',
         posts: 1850
      },
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
      stats: {
         followers: '28.5K',
         posts: 920
      },
      specialties: ['السوق العقاري', 'تحليل البيانات', 'التقييم العقاري', 'الاستثمار العقاري'],
      description: 'متخصصة في تحليل بيانات السوق العقاري السعودي وتقديم رؤى استثمارية دقيقة',
      impact: 'high'
   },
   {
      id: 'expert_3',
      name: 'م. عبدالله الجارالله',
      nameEn: 'Eng. Abdullah Al-Jarallah',
      role: 'خبير سلاسل الإمداد واللوجستيات',
      type: 'expert',
      location: 'الدمام، المملكة العربية السعودية',
      avatar: 'https://i.pravatar.cc/200?u=abdullah',
      isFollowing: false,
      isVerified: true,
      verificationLevel: 'verified',
      stats: {
         followers: '32.8K',
         posts: 1240
      },
      specialties: ['سلاسل الإمداد', 'اللوجستيات', 'التجارة الدولية', 'الموانئ'],
      description: 'مهندس صناعي متخصص في تحسين سلاسل الإمداد وتطوير الحلول اللوجستية',
      impact: 'high'
   },
   {
      id: 'analyst_1',
      name: 'أحمد محمود الشهري',
      nameEn: 'Ahmed Al-Shehri',
      role: 'محلل تقني - أسواق المال',
      type: 'analyst',
      location: 'الرياض، المملكة العربية السعودية',
      avatar: 'https://i.pravatar.cc/200?u=ahmed',
      isFollowing: true,
      isVerified: false,
      verificationLevel: 'none',
      stats: {
         followers: '18.3K',
         posts: 2450
      },
      specialties: ['التحليل الفني', 'تاسي', 'العملات الرقمية', 'الأسهم'],
      description: 'محلل تقني متخصص في أسواق الأسهم السعودية والخليجية',
      impact: 'medium'
   }
];

const FollowersPage = () => {
   const [entities, setEntities] = useState<Entity[]>(SAUDI_ENTITIES);
   const [searchQuery, setSearchQuery] = useState('');
   const [activeFilter, setActiveFilter] = useState<'all' | 'following' | 'official' | 'experts'>('all');
   const [typeFilter, setTypeFilter] = useState<string>('all');

   const toggleFollow = (id: string) => {
      setEntities(prev => prev.map(e =>
         e.id === id ? { ...e, isFollowing: !e.isFollowing } : e
      ));
   };

   const filteredEntities = entities.filter(entity => {
      const matchesSearch =
         entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         entity.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
         entity.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
         (entity.nameEn?.toLowerCase().includes(searchQuery.toLowerCase())) ||
         (entity.specialties?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesActiveFilter =
         activeFilter === 'all' ? true :
            activeFilter === 'following' ? entity.isFollowing :
               activeFilter === 'official' ? (entity.type === 'ministry' || entity.type === 'authority') :
                  activeFilter === 'experts' ? (entity.type === 'expert' || entity.type === 'analyst') :
                     true;

      const matchesTypeFilter =
         typeFilter === 'all' ? true : entity.type === typeFilter;

      return matchesSearch && matchesActiveFilter && matchesTypeFilter;
   });

   const stats = {
      total: entities.length,
      following: entities.filter(e => e.isFollowing).length,
      official: entities.filter(e => e.type === 'ministry' || e.type === 'authority').length,
      experts: entities.filter(e => e.type === 'expert' || e.type === 'analyst').length
   };

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
         critical: { color: 'bg-red-100 text-red-700 border-red-200', label: 'تأثير حرج', icon: '🔴' },
         high: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'تأثير عالي', icon: '🟠' },
         medium: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'تأثير متوسط', icon: '🟡' },
         low: { color: 'bg-gray-100 text-gray-600 border-gray-200', label: 'تأثير منخفض', icon: '⚪' }
      };
      const badge = badges[impact as keyof typeof badges];
      return (
         <span className={`${badge.color} px-2 py-1 rounded-lg text-[10px] font-bold border`}>
            {badge.icon} {badge.label}
         </span>
      );
   };

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

               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
                     <div className="flex items-center gap-2 mb-2">
                        <Landmark size={18} className="text-blue-200" />
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">إجمالي الجهات</p>
                     </div>
                     <h3 className="text-3xl font-black text-white">{stats.total}</h3>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
                     <div className="flex items-center gap-2 mb-2">
                        <UserCheck size={18} className="text-green-200" />
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">تتابعها</p>
                     </div>
                     <h3 className="text-3xl font-black text-white">{stats.following}</h3>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
                     <div className="flex items-center gap-2 mb-2">
                        <Shield size={18} className="text-yellow-200" />
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">جهات رسمية</p>
                     </div>
                     <h3 className="text-3xl font-black text-white">{stats.official}</h3>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
                     <div className="flex items-center gap-2 mb-2">
                        <Award size={18} className="text-purple-200" />
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">خبراء</p>
                     </div>
                     <h3 className="text-3xl font-black text-white">{stats.experts}</h3>
                  </div>
               </div>
            </div>
         </div>

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

         {/* Grid of Entities */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEntities.map(entity => (
               <div
                  key={entity.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl hover:border-blue-200 transition-all duration-300 group overflow-hidden"
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
                           className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 ${entity.isFollowing
                                 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700'
                                 : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                              }`}
                        >
                           {entity.isFollowing ? (
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
                        <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                           <p className="text-xs text-gray-500 font-bold mb-1">متابعون</p>
                           <p className="text-lg font-black text-gray-900">{entity.stats.followers}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                           <p className="text-xs text-gray-500 font-bold mb-1">منشورات</p>
                           <p className="text-lg font-black text-gray-900">{entity.stats.posts.toLocaleString()}</p>
                        </div>
                        {entity.stats.datasets && (
                           <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                              <p className="text-xs text-gray-500 font-bold mb-1">بيانات</p>
                              <p className="text-lg font-black text-gray-900">{entity.stats.datasets}</p>
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
         </div>

         {/* Empty State */}
         {filteredEntities.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
               <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                  <Search size={40} />
               </div>
               <h3 className="text-2xl font-black text-gray-900 mb-2">لا توجد نتائج</h3>
               <p className="text-gray-500">جرب البحث بكلمات أخرى أو تغيير الفلاتر</p>
            </div>
         )}
      </div>
   );
};

export default FollowersPage;
