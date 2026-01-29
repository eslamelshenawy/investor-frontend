import { NavItem, Tag, ActivityData } from './types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'الرئيسية', href: '#' },
  { label: 'مجموعات البيانات', href: '#' },
  { label: 'الجهات', href: '#' },
  { label: 'واجهات برمجة التطبيقات', href: '#' },
  { label: 'المجتمع', href: '#' },
  { label: 'البيانات المرجعية', href: '#' },
  { label: 'إمكانية الوصول', href: '#' },
];

export const DATASET_TAGS: Tag[] = [
  { label: 'Trade', lang: 'en' },
  { label: 'International', lang: 'en' },
  { label: 'September 2025', lang: 'en' },
  { label: 'التجارة', lang: 'ar' },
  { label: 'الدولية', lang: 'ar' },
];

export const ACTIVITY_DATA: ActivityData[] = [
  { date: '2025-01', views: 120, downloads: 45 },
  { date: '2025-02', views: 132, downloads: 55 },
  { date: '2025-03', views: 101, downloads: 40 },
  { date: '2025-04', views: 154, downloads: 60 },
  { date: '2025-05', views: 190, downloads: 85 },
  { date: '2025-06', views: 230, downloads: 100 },
];

export const DESCRIPTION_TEXT = `
تعتمد هذه المجموعة من البيانات على السجلات الإدارية من الجهات الحكومية ذات العلاقة (هيئة الزكاة والضريبة والجمارك، وزارة الطاقة، وزارة الصناعة والثروة المعدنية)، وتوفر إحصاءات دقيقة وشاملة حول حركة التجارة الدولية للمملكة لشهر سبتمبر 2025. تشمل البيانات حجم الصادرات والواردات حسب الدول، والمنافذ الجمركية، والسلع المصنفة حسب النظام المنسق. تهدف هذه البيانات إلى دعم صناع القرار والباحثين والمحللين الاقتصاديين في فهم اتجاهات التجارة الخارجية.
`;
