import { FeedItem, FeedContentType } from '../../types';

const TITLES = [
    "تحليل أداء قطاع البتروكيماويات", "مستقبل الذكاء الاصطناعي في الاستثمار", "تقرير التضخم الربع سنوي",
    "صفقة استحواذ جديدة في القطاع التقني", "كيف تدير محفظتك في الأزمات؟", "مؤشرات السوق العقاري في الرياض",
    "الفرص الواعدة في الطاقة المتجددة", "تأثير الفائدة على قروض الشركات", "إطلاق صندوق استثماري جديد",
    "تحول رقمي في الخدمات اللوجستية"
];

const AUTHORS = [
    { name: 'د. فهد العتيبي', role: 'خبير اقتصادي', verified: true },
    { name: 'سارة المهندس', role: 'محلل مالي', verified: true },
    { name: 'رادار المستثمر', role: 'AI System', verified: true },
    { name: 'وزارة الاستثمار', role: 'جهة رسمية', verified: true },
    { name: 'عبدالله المالي', role: 'متداول محترف', verified: false }
];

const TAGS = ['Economy', 'Tech', 'Vision2030', 'RealEstate', 'Energy', 'Finance', 'Stocks', 'Crypto'];

// Helper to get random item from array
const rand = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

// Generate a randomized feed item
export const generateFeedItem = (index: number): FeedItem => {
    const type = Object.values(FeedContentType)[Math.floor(Math.random() * Object.values(FeedContentType).length)];
    const id = `generated_${index}`;
    const author = rand(AUTHORS);
    const title = `${rand(TITLES)} ${index + 1}`; // Make title unique

    // Dynamic payload based on type to ensure components don't crash
    let payload: any = {};

    switch (type) {
        case FeedContentType.POLL:
            payload = { totalVotes: Math.floor(Math.random() * 5000), options: [{ label: 'نعم', percentage: 60 }, { label: 'لا', percentage: 40 }] };
            break;
        case FeedContentType.EVENT:
            payload = { eventName: 'قمة الاستثمار', month: 'NOV', day: (10 + index % 20).toString(), time: '09:00 AM', location: 'الرياض', isOnline: index % 2 === 0 };
            break;
        case FeedContentType.EXPERT_INSIGHT:
            payload = { quote: 'السوق يتجه نحو مرحلة جديدة من النمو المستدام.', expertName: author.name, expertRole: author.role, expertImage: `https://ui-avatars.com/api/?name=${author.name}` };
            break;
        case FeedContentType.PORTFOLIO:
            payload = { expectedReturn: 10 + (index % 10), assets: [{ name: 'أسهم', value: 50, color: 'blue' }, { name: 'عقار', value: 30, color: 'green' }, { name: 'نقد', value: 20, color: 'gray' }] };
            break;
        case FeedContentType.BREAKING_NEWS:
            payload = { headline: title, summary: 'تفاصيل عاجلة حول التطورات الأخيرة في السوق وتأثيرها المباشر.' };
            break;
        case FeedContentType.TERMINOLOGY:
            payload = { term: 'التحوط (Hedging)', definition: 'استراتيجية تستخدم للحد من المخاطر في الاستثمارات المالية.' };
            break;
        case FeedContentType.Q_AND_A:
            payload = { question: 'هل هذا هو القاع؟', answer: 'تشير المؤشرات الفنية إلى بوادر ارتداد ولكن الحذر واجب.', expertAvatar: `https://ui-avatars.com/api/?name=${author.name}` };
            break;
        case FeedContentType.CHECKLIST:
            payload = { listTitle: 'ما قبل التداول', items: [{ text: 'مراجعة الأخبار', checked: true }, { text: 'تحديد نقاط الدخول', checked: false }] };
            break;
        case FeedContentType.SIGNAL_ALERT:
            payload = { delta: '2.5%', isPositive: index % 2 === 0, context: 'تحرك ملحوظ في السيولة.' };
            break;
        case FeedContentType.MARKET_PULSE:
            payload = { sector: 'التقنية', status: index % 2 === 0 ? 'hot' : 'warm', score: 70 + (index % 30), summary: 'تدفقات نقدية عالية.' };
            break;
        case FeedContentType.COMPARISON:
            payload = { itemA: { label: 'Q1', value: '20M' }, itemB: { label: 'Q2', value: '25M' } };
            break;
        case FeedContentType.WEEKLY_SNAPSHOT:
            payload = { highlights: [{ label: 'الأفضل', value: 'البنوك' }, { label: 'الأسوأ', value: 'الاسمنت' }] };
            break;
        case FeedContentType.FACT:
            payload = { fact: 'السوق السعودي هو الأكبر في المنطقة.' };
            break;
        default:
            // Generic fallback for Article, Image, Video, Dashboard, Widget
            payload = {
                excerpt: 'نظرة شاملة على تطورات السوق وأهم الفرص المتاحة للمستثمرين.',
                imageUrl: `https://picsum.photos/seed/${index}/800/400`,
                dashboardId: 'd1'
            };
    }

    return {
        id,
        contentType: type as FeedContentType,
        title,
        author: { ...author, avatar: `https://ui-avatars.com/api/?name=${author.name}&background=random` },
        timestamp: new Date().toISOString(),
        tags: [rand(TAGS), rand(TAGS)],
        engagement: {
            likes: Math.floor(Math.random() * 1000),
            shares: Math.floor(Math.random() * 500),
            saves: Math.floor(Math.random() * 500)
        },
        payload
    };
};

export const generateFeedBatch = (count: number): FeedItem[] => {
    return Array.from({ length: count }, (_, i) => generateFeedItem(i));
};
