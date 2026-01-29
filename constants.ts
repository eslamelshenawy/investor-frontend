
import { ChartType, Dashboard, Dataset, FeedContentType, FeedItem, FollowableEntity, RefreshLog, TimelineEvent, TimelineEventType, User, UserRole, Widget } from './types';
import { generateFeedBatch } from './src/utils/mockGenerator';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'أحمد محمد',
  role: UserRole.ADMIN, // Default to Admin to show all features initially
  avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
};

export const DATASETS: Dataset[] = [
  { id: 'd1', name: 'مؤشرات سوق العمل', agency: 'الهيئة العامة للإحصاء', lastUpdated: '2025-05-10 14:30', status: 'active' },
  { id: 'd2', name: 'الاستثمار الأجنبي المباشر', agency: 'وزارة الاستثمار', lastUpdated: '2025-05-11 09:15', status: 'active' },
  { id: 'd3', name: 'مؤشر أسعار المستهلك', agency: 'البنك المركزي', lastUpdated: '2025-05-09 11:00', status: 'maintenance' },
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'e1',
    type: TimelineEventType.SIGNAL,
    title: 'تجاوز معدل نمو الناتج المحلي التوقعات',
    summary: 'أظهرت البيانات الأولية للربع الأول نمواً ملحوظاً في الأنشطة غير النفطية متجاوزة حاجز التوقعات السابقة.',
    timestamp: '2025-05-12T08:30:00',
    impactScore: 85,
    sourceName: 'الهيئة العامة للإحصاء',
    delta: { value: '5.1%', isPositive: true, label: 'النمو السنوي' },
    tags: ['Economy', 'GDP', 'المؤشرات الوطنية'],
    relatedWidgetId: 'w1'
  },
  {
    id: 'e2',
    type: TimelineEventType.UPDATE,
    title: 'تحديث بيانات الاستثمار الأجنبي',
    summary: 'تم نشر التقرير الفصلي لتدفقات الاستثمار الأجنبي المباشر مع تفاصيل جديدة حول القطاعات الصناعية.',
    timestamp: '2025-05-11T09:15:00',
    impactScore: 60,
    sourceName: 'وزارة الاستثمار',
    delta: { value: '12%', isPositive: true, label: 'QoQ' },
    tags: ['Investment', 'FDI', 'تقرير الاستثمار'],
    relatedWidgetId: 'w2'
  },
  {
    id: 'e3',
    type: TimelineEventType.INSIGHT,
    title: 'تحليل: تأثير الفائدة على التمويل العقاري',
    summary: 'تشير الارتباطات الأخيرة إلى بدء تعافي طفيف في طلبات التمويل العقاري بالتزامن مع استقرار أسعار الفائدة.',
    timestamp: '2025-05-10T14:00:00',
    impactScore: 45,
    sourceName: 'رادار المستثمر (AI)',
    tags: ['Real Estate', 'Finance'],
    relatedWidgetId: 'w5'
  },
  {
    id: 'e4',
    type: TimelineEventType.NEW_DATA,
    title: 'إضافة مجموعة بيانات: الصادرات السلعية',
    summary: 'تم ربط المصدر الجديد للصادرات السلعية غير النفطية وإضافته إلى سجل البيانات.',
    timestamp: '2025-05-09T10:00:00',
    impactScore: 30,
    sourceName: 'الجمارك',
    tags: ['Trade', 'Exports'],
  },
  {
    id: 'e5',
    type: TimelineEventType.REVISION,
    title: 'تعديل تاريخي: معدل البطالة Q4 2024',
    summary: 'تعديل طفيف في احتساب معدل البطالة للربع السابق بناءً على المنهجية المحدثة للمسح.',
    timestamp: '2025-05-08T16:45:00',
    impactScore: 70,
    sourceName: 'الهيئة العامة للإحصاء',
    delta: { value: '-0.2%', isPositive: true, label: 'تصحيح' },
    tags: ['Labor', 'Unemployment'],
    relatedWidgetId: 'w3'
  }
];

export const WIDGETS: Widget[] = [
  {
    id: 'w1',
    title: 'نمو الناتج المحلي الإجمالي',
    type: ChartType.AREA,
    datasetId: 'd1',
    category: 'Economy',
    tags: ['GDP', 'Growth'],
    lastRefresh: '2025-05-10',
    description: 'نسبة النمو السنوية للناتج المحلي الإجمالي بالأسعار الثابتة.',
    data: [
      { name: '2020', value: -4.1 },
      { name: '2021', value: 3.2 },
      { name: '2022', value: 8.7 },
      { name: '2023', value: 0.8 },
      { name: '2024', value: 4.4 },
      { name: '2025', value: 5.1 },
    ]
  },
  {
    id: 'w2',
    title: 'توزيع الاستثمار حسب القطاع',
    type: ChartType.PIE,
    datasetId: 'd2',
    category: 'Investment',
    tags: ['FDI', 'Sectors'],
    lastRefresh: '2025-05-11',
    description: 'توزيع الاستثمارات الأجنبية المباشرة حسب القطاعات الاقتصادية الرئيسية.',
    data: [
      { name: 'الصناعة', value: 35 },
      { name: 'التقنية', value: 25 },
      { name: 'العقار', value: 20 },
      { name: 'الطاقة', value: 15 },
      { name: 'أخرى', value: 5 },
    ]
  },
  {
    id: 'w3',
    title: 'معدل البطالة (فصلي)',
    type: ChartType.LINE,
    datasetId: 'd1',
    category: 'Labor',
    tags: ['Unemployment', 'Social'],
    lastRefresh: '2025-05-10',
    description: 'تطور معدلات البطالة بين المواطنين ربع سنويًا.',
    data: [
      { name: 'Q1 24', value: 7.6 },
      { name: 'Q2 24', value: 7.1 },
      { name: 'Q3 24', value: 6.8 },
      { name: 'Q4 24', value: 6.5 },
      { name: 'Q1 25', value: 6.3 },
    ]
  },
  {
    id: 'w4',
    title: 'عدد الرخص الاستثمارية',
    type: ChartType.BAR,
    datasetId: 'd2',
    category: 'Investment',
    tags: ['Licenses', 'Growth'],
    lastRefresh: '2025-05-11',
    description: 'إجمالي عدد الرخص الاستثمارية الجديدة المصدرة شهريًا.',
    data: [
      { name: 'يناير', value: 450 },
      { name: 'فبراير', value: 520 },
      { name: 'مارس', value: 480 },
      { name: 'أبريل', value: 600 },
      { name: 'مايو', value: 650 },
    ]
  },
  {
    id: 'w5',
    title: 'إجمالي التمويل العقاري',
    type: ChartType.KPI,
    datasetId: 'd3',
    category: 'Real Estate',
    tags: ['Finance', 'Housing'],
    lastRefresh: '2025-05-09',
    description: 'إجمالي عقود التمويل العقاري السكني الجديدة.',
    data: [
      { name: 'Current', value: 8500 } // Value in Millions SAR
    ]
  },
  {
    id: 'w_mb_1',
    title: 'تقرير المبيعات التفصيلي (Metabase)',
    type: ChartType.EXTERNAL,
    datasetId: 'external',
    category: 'Analysis',
    tags: ['Metabase', 'Analytics', 'Report'],
    lastRefresh: 'Live',
    description: 'لوحة تفاعلية مباشرة من نظام Metabase للتحليلات المتقدمة.',
    data: [],
    embedUrl: 'metabase://dashboard/1'
  }
];

export const INITIAL_DASHBOARDS: Dashboard[] = [
  { id: 'odb1', name: 'المؤشرات الوطنية الرئيسية', type: 'official', widgets: ['w1', 'w3', 'w5'], isPublic: true, isStarred: true },
  { id: 'odb2', name: 'تقرير الاستثمار الأجنبي', type: 'official', widgets: ['w2', 'w4', 'w_mb_1'], isPublic: true },
  { id: 'udb1', name: 'لوحتي الخاصة - قطاع الصناعة', type: 'user', widgets: ['w2', 'w1'], ownerId: 'u1', isStarred: true },
];

export const REFRESH_LOGS: RefreshLog[] = [
  { id: 'l1', datasetId: 'd1', timestamp: '2025-05-10 14:30', status: 'success', duration: '45s' },
  { id: 'l2', datasetId: 'd2', timestamp: '2025-05-10 14:00', status: 'success', duration: '120s' },
  { id: 'l3', datasetId: 'd3', timestamp: '2025-05-09 11:00', status: 'failed', duration: '10s' },
];

export const FEED_ITEMS: FeedItem[] = [
  // 1. POLL
  {
    id: 'f_poll_1',
    contentType: FeedContentType.POLL,
    title: 'توقعات أسعار العقار 2026',
    author: { name: 'فريق الرصد', role: 'رادار المستثمر', verified: true, avatar: 'https://ui-avatars.com/api/?name=Poll&background=6366f1&color=fff' },
    timestamp: '2025-05-13T09:00:00',
    tags: ['RealEstate', 'Poll'],
    engagement: { likes: 120, shares: 30, saves: 15 },
    payload: {
      totalVotes: 1240,
      options: [
        { label: 'استمرار الصعود', percentage: 45 },
        { label: 'استقرار نسبي', percentage: 35 },
        { label: 'تصحيح سعري', percentage: 20 },
      ]
    }
  },

  // 2. EVENT
  {
    id: 'f_event_1',
    contentType: FeedContentType.EVENT,
    title: 'مؤتمر مستقبل الاستثمار',
    author: { name: 'FII Institute', role: 'المنظم', verified: true, avatar: 'https://ui-avatars.com/api/?name=FII&background=000&color=fff' },
    timestamp: '2025-05-13T08:00:00',
    tags: ['Event', 'FII', 'Investment'],
    engagement: { likes: 250, shares: 120, saves: 300 },
    payload: {
      eventName: 'مبادرة مستقبل الاستثمار 8',
      month: 'OCT',
      day: '29',
      time: '09:00 AM - 05:00 PM',
      location: 'مركز الملك عبدالعزيز للمؤتمرات، الرياض',
      isOnline: false
    }
  },

  // 3. EXPERT INSIGHT
  {
    id: 'f_expert_1',
    contentType: FeedContentType.EXPERT_INSIGHT,
    title: 'رؤية خبير: قطاع التقنية',
    author: { name: 'د. عبدالله الرشيد', role: 'خبير تقني', verified: true, avatar: 'https://i.pravatar.cc/150?u=tech_expert' },
    timestamp: '2025-05-12T15:00:00',
    tags: ['Tech', 'AI', 'Expert'],
    engagement: { likes: 340, shares: 150, saves: 200 },
    payload: {
      quote: 'الذكاء الاصطناعي التوليدي لن يكون مجرد أداة مساعدة، بل سيصبح المحرك الأساسي لاتخاذ القرارات الاستثمارية في الربع القادم.',
      expertName: 'د. عبدالله الرشيد',
      expertRole: 'كبير مسؤولي البيانات - صندوق الاستثمار',
      expertImage: 'https://i.pravatar.cc/150?u=tech_expert'
    }
  },

  // 4. PORTFOLIO
  {
    id: 'f_port_1',
    contentType: FeedContentType.PORTFOLIO,
    title: 'محفظة النمو المتوازن',
    author: { name: 'المستشار الذكي', role: 'AI Advisor', verified: true, avatar: 'https://ui-avatars.com/api/?name=AI&background=10b981&color=fff' },
    timestamp: '2025-05-12T12:00:00',
    tags: ['Portfolio', 'Balanced', 'Recommendation'],
    engagement: { likes: 180, shares: 60, saves: 400 },
    payload: {
      expectedReturn: 12.5,
      assets: [
        { name: 'أسهم النمو', value: 40, color: 'blue' },
        { name: 'صكوك حكومية', value: 30, color: 'purple' },
        { name: 'صناديق عقارية', value: 20, color: 'green' },
        { name: 'ذهب ومعادن', value: 10, color: 'amber' },
      ]
    }
  },

  // 5. BREAKING NEWS (عاجل)
  {
    id: 'f_news_1',
    contentType: FeedContentType.BREAKING_NEWS,
    title: 'خبر عاجل: فائض الميزانية',
    author: { name: 'وزارة المالية', role: 'البيان التمهيدي', verified: true, avatar: 'https://ui-avatars.com/api/?name=MOF&background=ef4444&color=fff' },
    timestamp: '2025-05-13T10:05:00',
    tags: ['Budget', 'Economy', 'Urgent'],
    engagement: { likes: 1200, shares: 800, saves: 100 },
    payload: {
      headline: 'تحقيق فائض في الميزانية العامة للربع الأول بقيمة 12 مليار ريال',
      summary: 'عاجل: الإيرادات غير النفطية تسجل أعلى مستوى تاريخي لها، مع استمرار ضبط الإنفاق الحكومي.'
    }
  },

  // 6. TERMINOLOGY (مصطلح)
  {
    id: 'f_term_1',
    contentType: FeedContentType.TERMINOLOGY,
    title: 'مصطلح: صناديق الريت',
    author: { name: 'أكاديمية الاستثمار', role: 'تعليمي', verified: true, avatar: 'https://ui-avatars.com/api/?name=Acad&background=4f46e5&color=fff' },
    timestamp: '2025-05-13T08:30:00',
    tags: ['Education', 'REITs', 'Terminology'],
    engagement: { likes: 450, shares: 120, saves: 680 },
    payload: {
      term: 'REITs - صناديق الاستثمار العقارية',
      definition: 'هي صناديق استثمارية عقارية متداولة، تهدف إلى تسهيل الاستثمار في قطاع العقارات المطورة والجاهزة والتي تدر دخلاً دورياً وتأجيرياً.',
      difficulty: 'Easy'
    }
  },

  // 7. Q&A
  {
    id: 'f_qa_1',
    contentType: FeedContentType.Q_AND_A,
    title: 'سؤال: ما هو الوقت المناسب للدخول؟',
    author: { name: 'مجتمع المستثمرين', role: 'نقاش', verified: false, avatar: 'https://ui-avatars.com/api/?name=User&background=random' },
    timestamp: '2025-05-12T19:00:00',
    tags: ['Q&A', 'Strategy'],
    engagement: { likes: 85, shares: 10, saves: 45 },
    payload: {
      question: 'هل الوقت الحالي مناسب لزيادة المراكز في قطاع الاسمنتات؟',
      answer: 'بناءً على مشاريع البنية التحتية الكبرى المعلنة مؤخراً، يتوقع المحللون زيادة الطلب على مواد البناء في النصف الثاني من العام، مما يجعله وقتاً جيداً للتجميع الانتقائي.',
      expertAvatar: 'https://i.pravatar.cc/150?u=expert3'
    }
  },

  // 8. CHECKLIST
  {
    id: 'f_check_1',
    contentType: FeedContentType.CHECKLIST,
    title: 'قائمة مهام الاكتتاب',
    author: { name: 'مدير الاكتتاب', role: 'نصائح', verified: true, avatar: 'https://ui-avatars.com/api/?name=IPO&background=10b981&color=fff' },
    timestamp: '2025-05-12T07:00:00',
    tags: ['IPO', 'Checklist', 'Guide'],
    engagement: { likes: 560, shares: 200, saves: 900 },
    payload: {
      listTitle: 'خطوات المشاركة في اكتتاب شركة "تقنية المستقبل"',
      items: [
        { text: 'تحديث بيانات المحفظة الاستثمارية', checked: true },
        { text: 'التأكد من توفر السيولة النقدية', checked: true },
        { text: 'قراءة نشرة الإصدار بعناية', checked: false, subtext: 'مهم جداً لفهم المخاطر' },
        { text: 'تقديم طلب الاكتتاب عبر التطبيق', checked: false },
      ]
    }
  },

  // PREVIOUS ITEMS -> 
  {
    id: 'f_carousel_1',
    contentType: FeedContentType.CAROUSEL,
    title: 'أبرز الفرص الاستثمارية الواعدة 2025',
    author: { name: 'وزارة الاستثمار', role: 'شريك استراتيجي', verified: true, avatar: 'https://ui-avatars.com/api/?name=MI&background=0D8ABC&color=fff' },
    timestamp: '2025-05-12T13:00:00',
    tags: ['Investment', 'Opportunities', 'Top Picks'],
    engagement: { likes: 520, shares: 210, saves: 400 },
    payload: {
      slides: [
        {
          id: 's1',
          title: 'اللوجستيات العالمية',
          subtitle: 'المناطق الاقتصادية الخاصة',
          image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          summary: 'حوافز ضريبية جديدة للشركات اللوجستية في المنطقة الشرقية.',
          actionLabel: 'تفاصيل الحوافز'
        },
        {
          id: 's2',
          title: 'سياحة البحر الأحمر',
          subtitle: 'مشاريع الضيافة الفاخرة',
          image: 'https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          summary: 'طرح 50 فرصة استثمارية للمنتجعات البيئية.',
          actionLabel: 'استكشف الفرص'
        },
        {
          id: 's3',
          title: 'الأمن السيبراني',
          subtitle: 'قطاع التقنية',
          image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          summary: 'نمو متوقع بنسبة 18% في سوق الأمن السيبراني السعودي.',
          actionLabel: 'تقرير السوق'
        }
      ]
    }
  },

  // 2. AUDIO: Market Briefing
  {
    id: 'f_audio_1',
    contentType: FeedContentType.AUDIO,
    title: 'بودكاست الصباح: تحليل أداء تاسي والأسواق العالمية',
    author: { name: 'فريق التحليل المالي', role: 'رادار بودكاست', verified: true, avatar: 'https://ui-avatars.com/api/?name=MP&background=6366f1&color=fff' },
    timestamp: '2025-05-12T09:00:00',
    tags: ['Podcast', 'TASI', 'MarketBrief'],
    engagement: { likes: 145, shares: 60, saves: 88 },
    payload: {
      duration: '12:45',
      waveformData: [20, 45, 30, 80, 50, 90, 30, 40, 60, 80, 40, 20, 50, 70, 40, 60, 30, 80, 50, 90, 30, 40, 60, 80],
      audioUrl: '#' // Placeholder
    }
  },

  // 3. CAROUSEL: Neom Projects (Rich Visuals)
  {
    id: 'f_carousel_2',
    contentType: FeedContentType.CAROUSEL,
    title: 'جولة بصرية: تطورات مشاريع نيوم العملاقة',
    author: { name: 'مشاريع السعودية', role: 'تغطية خاصة', verified: true, avatar: 'https://ui-avatars.com/api/?name=NP&background=10b981&color=fff' },
    timestamp: '2025-05-12T08:45:00',
    tags: ['Neom', 'Construction', 'MegaProjects'],
    engagement: { likes: 890, shares: 340, saves: 510 },
    payload: {
      slides: [
        {
          id: 'n1',
          title: 'ذا لاين - The Line',
          subtitle: 'ثورة الحضارة الحضرية',
          image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Abstract futuristic
          summary: 'بدء أعمال الأساسات العميقة للمرحلة الأولى من المشروع.',
          actionLabel: 'فيديو الموقع'
        },
        {
          id: 'n2',
          title: 'تروجينا - Trojena',
          subtitle: 'سياحة الجبال',
          image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Mountain/Snow
          summary: 'توقيع عقود إنشاء البحيرة الاصطناعية وقرية التزلج.',
          actionLabel: 'المخطط العام'
        },
        {
          id: 'n3',
          title: 'أوكساجون - Oxagon',
          subtitle: 'الصناعة المتقدمة',
          image: 'https://images.unsplash.com/photo-1565514020176-db762a42080a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Industrial/Port
          summary: 'افتتاح مركز الأبحاث والابتكار للطاقة الهيدروجينية.',
          actionLabel: 'فرص المصانع'
        }
      ]
    }
  },

  // 4. SIGNAL ALERT
  {
    id: 'f_sig_1',
    contentType: FeedContentType.SIGNAL_ALERT,
    title: 'قفزة في السجلات التجارية لقطاع المطاعم',
    author: { name: 'وزارة التجارة', role: 'جهة رسمية', verified: true },
    timestamp: '2025-05-12T11:45:00',
    tags: ['Restaurants', 'SMEs', 'Growth'],
    engagement: { likes: 320, shares: 150, saves: 85 },
    payload: {
      delta: '12%',
      isPositive: true,
      context: 'ارتفاع عدد السجلات التجارية الجديدة في قطاع الإعاشة والمطاعم مقارنة بالربع السابق.',
      alertLevel: 'medium'
    }
  },

  // 5. INFOGRAPHIC (IMAGE)
  {
    id: 'f_img_1',
    contentType: FeedContentType.IMAGE,
    title: 'إنفوجرافيك: منظومة النقل والخدمات اللوجستية 2030',
    author: { name: 'وزارة النقل', role: 'جهة رسمية', verified: true, avatar: 'https://ui-avatars.com/api/?name=MT&background=1e3a8a&color=fff' },
    timestamp: '2025-05-11T16:20:00',
    tags: ['Logistics', 'Transport', 'Infographic'],
    engagement: { likes: 410, shares: 180, saves: 320 },
    payload: {
      imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=800&q=80', // Vertical abstract
      caption: 'استعراض لأهم مستهدفات الاستراتيجية الوطنية للنقل والخدمات اللوجستية، بما في ذلك رفع الطاقة الاستيعابية للموانئ.'
    }
  },

  // 6. MARKET PULSE
  {
    id: 'f_pulse_1',
    contentType: FeedContentType.MARKET_PULSE,
    title: 'مؤشر حرارة السوق: قطاع المقاولات',
    author: { name: 'رادار المستثمر', role: 'تحليل AI', verified: true, avatar: 'https://ui-avatars.com/api/?name=IR&background=0D8ABC&color=fff' },
    timestamp: '2025-05-12T10:30:00',
    tags: ['Construction', 'Market Pulse'],
    engagement: { likes: 180, shares: 40, saves: 210 },
    payload: {
      sector: 'المقاولات والإنشاءات',
      status: 'hot',
      score: 85,
      summary: 'نشاط مرتفع مدفوعاً بالمشاريع الكبرى في الرياض ونيوم.'
    }
  },

  // 7. FACT
  {
    id: 'f_fact_1',
    contentType: FeedContentType.FACT,
    title: 'حقيقة رقمية',
    author: { name: 'فريق البيانات', role: 'محرر', verified: false },
    timestamp: '2025-05-12T08:15:00',
    tags: ['DidYouKnow', 'Trivia'],
    engagement: { likes: 450, shares: 80, saves: 40 },
    payload: {
      fact: 'هل تعلم أن 65% من نمو التراخيص الجديدة جاء من 3 أنشطة فقط؟',
      highlight: 'التقنية، السياحة، الترفيه',
      source: 'تقرير الربع الأول 2025'
    }
  },

  // 8. RICH IMAGE (Aerial/Visual)
  {
    id: 'f_img_2',
    contentType: FeedContentType.IMAGE,
    title: 'صورة جوية: تقدم الأعمال في المربع الجديد',
    author: { name: 'عين الرياض', role: 'تصوير جوي', verified: false, avatar: 'https://ui-avatars.com/api/?name=ER&background=f59e0b&color=fff' },
    timestamp: '2025-05-11T10:00:00',
    tags: ['Riyadh', 'NewMurabba', 'Aerial'],
    engagement: { likes: 670, shares: 230, saves: 150 },
    payload: {
      imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=600&q=80', // Cityscape
      caption: 'مشهد بانورامي يوضح تسارع وتيرة البناء في منطقة المربع الجديد بوسط الرياض.'
    }
  },

  // 9. COMPARISON
  {
    id: 'f_comp_1',
    contentType: FeedContentType.COMPARISON,
    title: 'الصفقات العقارية: الرياض vs جدة',
    author: { name: 'هيئة العقار', role: 'جهة رسمية', verified: true },
    timestamp: '2025-05-11T14:20:00',
    tags: ['RealEstate', 'Comparison'],
    engagement: { likes: 215, shares: 95, saves: 300 },
    payload: {
      itemA: { label: 'الرياض', value: '4.2 مليار', subtext: 'قيمة الصفقات' },
      itemB: { label: 'جدة', value: '2.8 مليار', subtext: 'قيمة الصفقات' },
      conclusion: 'الرياض تستحوذ على 60% من السيولة العقارية هذا الأسبوع.'
    }
  },

  // 10. WEEKLY SNAPSHOT
  {
    id: 'f_weekly_1',
    contentType: FeedContentType.WEEKLY_SNAPSHOT,
    title: 'الملخص الاقتصادي الأسبوعي',
    author: { name: 'رادار المستثمر', role: 'النشرة الأسبوعية', verified: true },
    timestamp: '2025-05-11T09:00:00',
    tags: ['Weekly', 'Summary', 'Macro'],
    engagement: { likes: 890, shares: 420, saves: 650 },
    payload: {
      highlights: [
        { label: 'القطاع الأكثر نمواً', value: 'السياحة (+15%)' },
        { label: 'المنطقة الأكثر نشاطاً', value: 'الرياض' },
        { label: 'تحديث بيانات هام', value: 'التضخم (أبريل)' }
      ]
    }
  },

  // 11. ARTICLE
  {
    id: 'f1',
    contentType: FeedContentType.ARTICLE,
    title: 'نظرة مستقبلية: تحولات الطاقة المتجددة في المملكة 2030',
    author: { name: 'د. سعد القحطاني', role: 'كبير الاقتصاديين', verified: true },
    timestamp: '2025-05-12T10:00:00',
    tags: ['Energy', 'Vision 2030', 'Sustainability'],
    engagement: { likes: 124, shares: 45, saves: 89 },
    payload: {
      excerpt: 'مع تسارع وتيرة المشاريع العملاقة في مجال الهيدروجين الأخضر والطاقة الشمسية، تشير البيانات الأخيرة إلى انخفاض تكلفة الإنتاج بنسبة 15% مقارنة بالعام الماضي...',
      readTime: '5 دقائق',
      imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    }
  },

  // 12. WIDGET
  {
    id: 'f2',
    contentType: FeedContentType.WIDGET,
    title: 'مؤشر السيولة النقدية (M3)',
    author: { name: 'البنك المركزي السعودي', role: 'جهة رسمية', verified: true },
    timestamp: '2025-05-12T09:30:00',
    tags: ['Monetary', 'Economy', 'Liquidity'],
    engagement: { likes: 56, shares: 12, saves: 204 },
    payload: {
      widgetData: {
        id: 'w_feed_1',
        title: 'عرض النقود (M3)',
        type: ChartType.LINE,
        description: 'التغير الشهري في عرض النقود بمفهومه الواسع.',
        data: [
          { name: 'يناير', value: 2400 },
          { name: 'فبراير', value: 2450 },
          { name: 'مارس', value: 2520 },
          { name: 'أبريل', value: 2580 },
          { name: 'مايو', value: 2610 }
        ]
      }
    }
  },

  // 13. DASHBOARD
  {
    id: 'f4',
    contentType: FeedContentType.DASHBOARD,
    title: 'لوحة التعدين والمعادن 2025',
    author: { name: 'وزارة الصناعة', role: 'جهة رسمية', verified: true },
    timestamp: '2025-05-11T12:00:00',
    tags: ['Mining', 'Industry', 'Official Data'],
    engagement: { likes: 210, shares: 88, saves: 312 },
    payload: {
      dashboardId: 'odb3_mining',
      widgetCount: 8,
      views: 12500,
      previewImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    }
  },
  ...generateFeedBatch(75)
];

export const FOLLOWABLE_ENTITIES: FollowableEntity[] = [
  {
    id: 'e1',
    name: 'د. خالد بن فهد',
    role: 'خبير اقتصادي - تحليل مالي',
    avatar: 'https://i.pravatar.cc/150?u=expert1',
    coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&h=400&auto=format&fit=crop',
    stats: { posts: 124, followers: 8540, following: 432 },
    location: 'الرياض، السعودية',
    isFollowed: true,
    type: 'expert'
  },
  {
    id: 'm1',
    name: 'وزارة الاستثمار',
    role: 'جهة حكومية رسمية',
    avatar: 'https://ui-avatars.com/api/?name=MI&background=0284c7&color=fff',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&h=400&auto=format&fit=crop',
    stats: { posts: 450, followers: 154200, following: 12 },
    location: 'الرياض، السعودية',
    isFollowed: true,
    type: 'ministry'
  },
  {
    id: 'e2',
    name: 'سارة المنصور',
    role: 'محللة بيانات عقارية',
    avatar: 'https://i.pravatar.cc/150?u=expert2',
    stats: { posts: 89, followers: 3200, following: 150 },
    location: 'جدة، السعودية',
    isFollowed: false,
    type: 'expert'
  },
  {
    id: 'e3',
    name: 'م. عبدالله الجارالله',
    role: 'خبير في سلاسل الإمداد',
    avatar: 'https://i.pravatar.cc/150?u=expert3',
    stats: { posts: 215, followers: 12400, following: 89 },
    location: 'الدمام، السعودية',
    isFollowed: false,
    type: 'expert'
  },
  {
    id: 'm2',
    name: 'هيئة الاتصالات والتقنية',
    role: 'جهة حكومية رسمية',
    avatar: 'https://ui-avatars.com/api/?name=CST&background=059669&color=fff',
    stats: { posts: 320, followers: 98500, following: 5 },
    location: 'الرياض، السعودية',
    isFollowed: false,
    type: 'ministry'
  }
];
