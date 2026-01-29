/**
 * خدمة جلب البيانات من منصة البيانات المفتوحة السعودية
 * Saudi Open Data Platform API Service
 * https://open.data.gov.sa
 *
 * تحتوي على 42 مجموعة بيانات متاحة
 */

const OPEN_DATA_BASE_URL = 'https://open.data.gov.sa/data/api';

// ═══════════════════════════════════════════════════════════════════
// الأنواع (Types)
// ═══════════════════════════════════════════════════════════════════

export interface OpenDataCategory {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
}

export interface OpenDataTag {
  id: string;
  name: string;
}

export interface OpenDataDataset {
  transactionId: string;
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  providerNameEn: string;
  providerNameAr: string;
  organizationId: string;
  updateFrequency: string;
  language: string;
  timePeriod: string;
  resourcesCount: number;
  categories: OpenDataCategory[];
  tags: OpenDataTag[];
  createdAt: string;
  updatedAt: string;
}

export interface DatasetInfo {
  id: string;
  titleAr: string;
  columns: string[];
  category?: string;
}

// ═══════════════════════════════════════════════════════════════════
// قائمة جميع مجموعات البيانات المتاحة (42 dataset)
// ═══════════════════════════════════════════════════════════════════

export const AVAILABLE_DATASETS: DatasetInfo[] = [
  // ═══ العقارات والمؤشرات ═══
  {
    id: "1e7e8621-fd39-42fb-b78f-3c50b0be4f2e",
    titleAr: "المؤشر العقاري للمناطق في عام 2018 ،2019 ،2020، 2021",
    columns: ["المنطقة", "الشهر", "تصنيف العقار", "السعر بالريال السعودي", "المساحة بالمتر المربع", "عدد الصفقات"],
    category: "عقارات"
  },
  {
    id: "5948497a-d84f-45a4-944c-50c59cff9629",
    titleAr: "الصفقات العقارية 2025 الربع الثالث",
    columns: ["المنطقة", "المدينة", "الرقم المرجعي للصفقة", "تاريخ الصفقة", "تصنيف العقار", "السعر", "المساحة"],
    category: "عقارات"
  },
  {
    id: "ad218919-2014-4917-a85d-d4ec1a43c050",
    titleAr: "الصفقات العقارية 2025 الربع الثاني",
    columns: ["المنطقة", "المدينة", "الرقم المرجعي للصفقة", "تاريخ الصفقة", "تصنيف العقار", "السعر", "المساحة"],
    category: "عقارات"
  },
  {
    id: "b748181e-4c9f-4521-8144-1f48f7cb945c",
    titleAr: "مؤشرات صفقات البيع لمنطقة الرياض الربع الثالث من عام 2025",
    columns: ["المنطقة", "المدينة", "الحي", "نوع العقار", "عدد الصكوك", "قيمة الصفقات", "متوسط سعر المتر"],
    category: "عقارات"
  },
  {
    id: "c8ae6fea-4f68-436a-accc-2d83d14f0cd4",
    titleAr: "مؤشرات صفقات البيع لمنطقة الرياض الربع الأول من عام 2025",
    columns: ["المنطقة", "المدينة", "الحي", "نوع العقار", "عدد الصكوك", "قيمة الصفقات", "متوسط سعر المتر"],
    category: "عقارات"
  },
  {
    id: "2a265aaf-fd1d-4aab-808e-74d8a3088594",
    titleAr: "مؤشرات صفقات البيع لمنطقة مكة المكرمة الربع الثالث من عام 2025",
    columns: ["المنطقة", "المدينة", "الحي", "نوع العقار", "عدد الصكوك", "قيمة الصفقات", "متوسط سعر المتر"],
    category: "عقارات"
  },

  // ═══ التملك العقاري ═══
  {
    id: "66e8cee3-0495-4d78-bbad-00654e63aec8",
    titleAr: "نسب ومعدلات التملك العقاري للأفراد النساء 2025 الربع الثالث",
    columns: ["المنطقة", "المدينة", "السنة", "ربع السنة", "عدد الملاك النساء", "نسبة تملك النساء"],
    category: "تملك"
  },
  {
    id: "2746ab4f-0700-425f-9b5c-618944a8cada",
    titleAr: "نسب ومعدلات التملك العقاري للأفراد الرجال 2025 الربع الثالث",
    columns: ["المنطقة", "المدينة", "السنة", "ربع السنة", "عدد الملاك الرجال", "نسبة تملك الرجال"],
    category: "تملك"
  },
  {
    id: "2c2a3203-0671-4692-b030-628001b80d46",
    titleAr: "نسب ومعدلات التملك العقاري للأفراد الرجال 2025 الربع الأول",
    columns: ["المنطقة", "المدينة", "السنة", "ربع السنة", "عدد الملاك الرجال", "نسبة تملك الرجال"],
    category: "تملك"
  },

  // ═══ المزادات العقارية ═══
  {
    id: "38ef9473-f5f4-4fbf-83a7-1a4bf0c7ccec",
    titleAr: "مزادات العقارات السنوية 2025",
    columns: ["السنة", "الربع", "الشهر", "نوع المزاد", "إجمالي الأصول", "المنطقة", "المدينة"],
    category: "مزادات"
  },
  {
    id: "3d44d00e-5aa6-4937-981d-bd0548606109",
    titleAr: "المبيعات العقارية إلكتروني 2025",
    columns: ["السنة", "الربع", "نوع المزاد", "عدد المزادات", "عدد الأصول", "مجموع قيمة البيع"],
    category: "مزادات"
  },
  {
    id: "cc856462-5d59-481c-8ceb-29007c2b5525",
    titleAr: "المبيعات العقارية هجين 2025",
    columns: ["السنة", "الربع", "نوع المزاد", "عدد المزادات", "عدد الأصول", "مجموع قيمة البيع"],
    category: "مزادات"
  },
  {
    id: "40fd0d4e-76e1-4fb2-afd3-42a56698e5af",
    titleAr: "تفاصيل المزادات الإلكتروني 2025",
    columns: ["تاريخ بداية المزاد", "رقم الصك", "نوع المزاد", "اسم المزاد", "المنطقة", "المدينة", "المساحة"],
    category: "مزادات"
  },
  {
    id: "308744fe-60db-47f5-9ddb-691a51506a09",
    titleAr: "تفاصيل المزادات هجين 2025",
    columns: ["تاريخ بداية المزاد", "رقم الصك", "نوع المزاد", "اسم المزاد", "المنطقة", "المدينة", "المساحة"],
    category: "مزادات"
  },
  {
    id: "68098400-520c-48d5-8d26-bd8855bf7572",
    titleAr: "مبيعات الأصول العقارية السنوية 2025",
    columns: ["السنة", "الربع", "نوع المزاد", "عدد المزادات", "عدد الأصول", "مجموع قيمة البيع"],
    category: "مزادات"
  },

  // ═══ القرارات التنفيذية ═══
  {
    id: "0e0d56bc-c8fe-44cd-bbc9-9fc3f6651799",
    titleAr: "القرارات التنفيذية في قرار بيع عقار أو منقول للمنفذ ضده 2025 الربع الثالث",
    columns: ["المنطقة", "المدينة", "نوع السند الرئيسي", "تاريخ القرار", "الرقم المرجعي"],
    category: "قرارات"
  },
  {
    id: "099d92d7-050f-494a-ba11-175e358bc121",
    titleAr: "القرارات التنفيذية في قرار بيع عقار أو منقول للمنفذ ضده 2025 الربع الثاني",
    columns: ["المنطقة", "المدينة", "نوع السند الرئيسي", "تاريخ القرار", "الرقم المرجعي"],
    category: "قرارات"
  },
  {
    id: "7645e1f8-aed3-4038-9f74-090d015a13d6",
    titleAr: "القرارات التنفيذية في قرار بيع عقار أو منقول للمنفذ ضده 2025 الربع الأول",
    columns: ["المنطقة", "المدينة", "نوع السند الرئيسي", "تاريخ القرار", "الرقم المرجعي"],
    category: "قرارات"
  },

  // ═══ العمليات العقارية ═══
  {
    id: "2b13bef4-8c0d-40d3-b071-00bd089fb610",
    titleAr: "العمليات العقارية المسجلة في تعديل صك 2025 الربع الثالث",
    columns: ["المنطقة", "المدينة", "نوع القطاع", "نوع الخدمة", "التاريخ", "الرقم المرجعي"],
    category: "عمليات"
  },
  {
    id: "8fc9e19e-ed3a-4c8a-a768-58d9d04814f5",
    titleAr: "العمليات العقارية المسجلة في تسجيل ملكية عقار بدون صك 2025 الربع الثالث",
    columns: ["المنطقة", "المدينة", "نوع القطاع", "نوع الخدمة", "التاريخ", "الرقم المرجعي"],
    category: "عمليات"
  },

  // ═══ صندوق التنمية العقارية ═══
  {
    id: "79998ff6-63b6-436e-9703-0430b440f3e6",
    titleAr: "الوكالات الصادرة في صندوق التنمية العقارية 2025 الربع الثالث",
    columns: ["المنطقة", "المدينة", "نوع القطاع", "نوع الخدمة", "التاريخ", "الرقم المرجعي"],
    category: "صندوق التنمية"
  },
  {
    id: "e54350f5-4121-4007-a7d8-1938373d0bd1",
    titleAr: "الوكالات الصادرة في صندوق التنمية العقارية 2025 الربع الثاني",
    columns: ["المنطقة", "المدينة", "نوع القطاع", "نوع الخدمة", "التاريخ", "الرقم المرجعي"],
    category: "صندوق التنمية"
  },
  {
    id: "e8ed3887-59a5-4504-8316-e9cece8f2249",
    titleAr: "الوكالات الصادرة في صندوق التنمية العقارية 2025 الربع الأول",
    columns: ["المنطقة", "المدينة", "نوع القطاع", "نوع الخدمة", "التاريخ", "الرقم المرجعي"],
    category: "صندوق التنمية"
  },
  {
    id: "ba7b4224-da7d-4419-bbd3-1c6f586da49e",
    titleAr: "الدعم الشهري الذي يتم صرفه من خلال صندوق التنمية العقارية",
    columns: ["العام", "الشهر", "المبلغ الإجمالي (آلاف)"],
    category: "صندوق التنمية"
  },
  {
    id: "932edccb-b985-4fd0-bca6-5badf9d14300",
    titleAr: "نسبة التوطين بصندوق التنمية العقارية",
    columns: ["نسبة التوطين"],
    category: "صندوق التنمية"
  },
  {
    id: "c02f10db-06ef-4528-aabb-264f63d163c9",
    titleAr: "موظفي صندوق التنمية العقارية بشكل تاريخي حسب الجنس",
    columns: ["العام", "عدد الذكور", "عدد الإناث", "الإجمالي"],
    category: "صندوق التنمية"
  },

  // ═══ الدعم السكني ═══
  {
    id: "6d54ae82-7736-4ccf-b662-31844233f5b5",
    titleAr: "نسبة ثقة المستفيدين ببرامج الدعم السكني بشكل سنوي",
    columns: ["السنة", "النسبة"],
    category: "دعم سكني"
  },
  {
    id: "e6e5bd44-95d5-4381-98c0-fa2b8c938b8b",
    titleAr: "إجمالي المستفيدين من برامج الدعم السكني",
    columns: ["السنة", "الإجمالي"],
    category: "دعم سكني"
  },
  {
    id: "b22e5e7c-2183-4115-bcd3-d6b955f24137",
    titleAr: "نسبة المستفيدين من الحلول التمويلية حسب المناطق",
    columns: ["المنطقة", "عدد المستفيدين", "النسبة"],
    category: "دعم سكني"
  },
  {
    id: "db0596fb-ff37-41a3-b6f2-cf15d7b724a4",
    titleAr: "متوسط أعمار المستفيدين من الحلول التمويلية حسب المنتج",
    columns: ["المنتج", "متوسط العمر"],
    category: "دعم سكني"
  },

  // ═══ العقود والقروض ═══
  {
    id: "0662ed73-d555-45e2-814a-898d368ab4ef",
    titleAr: "عدد عقود الانتفاع المنتهية بالتملك حسب السنة",
    columns: ["السنة", "عدد العقود"],
    category: "عقود"
  },
  {
    id: "9396bbd8-4283-4485-ac2a-c6743b74980c",
    titleAr: "عدد عقود الرهن الميسر بشكل سنوي",
    columns: ["السنة", "عدد العقود"],
    category: "عقود"
  },
  {
    id: "b6dc46f4-9de0-4039-82f5-b5db3897883d",
    titleAr: "قروض الإقراض المباشر المغلقة",
    columns: ["العام", "عدد القروض المغلقة"],
    category: "عقود"
  },

  // ═══ الإقامة المميزة ═══
  {
    id: "ea90c3d0-cb8d-4c34-9892-ea0aa35ad9a3",
    titleAr: "نسبة الحاصلين على الإقامة المميزة حسب المنتج والفئة العمرية 2025",
    columns: ["نوع المنتج", "الفئة العمرية", "نسبة الحاصلين"],
    category: "إقامة مميزة"
  },
  {
    id: "c3e2b0a2-06b2-4a73-bb77-1e57fcb35365",
    titleAr: "عدد المتقدمين للحصول على الإقامة المميزة حسب المنتج",
    columns: ["نوع المنتج", "عدد المتقدمين"],
    category: "إقامة مميزة"
  },

  // ═══ الأوقاف ═══
  {
    id: "3a3ea3cc-dbf3-4d69-99db-a5c2f0165ae6",
    titleAr: "الأصول الوقفية العقارية المشمولة بنظارة الهيئة العامة للأوقاف",
    columns: ["السنة", "عدد الأصول الوقفية العقارية"],
    category: "أوقاف"
  },

  // ═══ العمل الحر ═══
  {
    id: "4b7b45cb-e8b2-4864-a80d-6d9110865b99",
    titleAr: "احصائيات وثائق العمل الحر للعام 2024",
    columns: ["إحصائيات", "بيانات العمل الحر"],
    category: "عمل حر"
  },

  // ═══ التسجيل العيني ═══
  {
    id: "526237a0-c089-4003-939f-05dd827da9d1",
    titleAr: "عدد المسجلين عينيا للعقارات حسب نوع الجنس لعام 2024",
    columns: ["Gender", "RENs", "Created Date"],
    category: "تسجيل عيني"
  },

  // ═══ الوساطة العقارية ═══
  {
    id: "43f82be8-7298-48fb-840d-eb176e51abc9",
    titleAr: "أنواع عقود الوساطة العقارية",
    columns: ["deed_type_CD", "deed_type_DESC_EN", "deed_type_DESC_AR"],
    category: "وساطة"
  },
  {
    id: "4a64b777-1db8-482d-b99a-5a0a76836d36",
    titleAr: "أنواع استخدامات العقارات للوساطة العقارية",
    columns: ["property_usage_type_CD", "property_usage_type_DESC_EN", "property_usage_type_DESC_AR"],
    category: "وساطة"
  },
  {
    id: "30243301-2f50-4134-a967-a24dd5d9dfbf",
    titleAr: "أنواع المنتجات العقارية",
    columns: ["product_type_CD", "product_type_DESC_EN", "product_type_DESC_AR"],
    category: "وساطة"
  },

  // ═══ خطط الإيجارات ═══
  {
    id: "6dfb5c0b-0557-485d-be98-a39ea9b2e387",
    titleAr: "خطة الشراء للإيجارات",
    columns: ["الفرع / المركز / المكتب", "مدة العقد", "العام المالي"],
    category: "إيجارات"
  },

  // ═══ مراكز الاتصال ═══
  {
    id: "40892c84-c7ec-48c9-b89c-da6caf178e96",
    titleAr: "عدد المكالمات الصادرة والواردة إلى مراكز الاتصال",
    columns: ["العام", "عدد المكالمات"],
    category: "خدمات"
  }
];

// ═══════════════════════════════════════════════════════════════════
// دوال المساعدة
// ═══════════════════════════════════════════════════════════════════

/**
 * الحصول على التصنيفات المتاحة
 */
export function getCategories(): string[] {
  const categories = new Set(AVAILABLE_DATASETS.map(d => d.category).filter(Boolean));
  return Array.from(categories) as string[];
}

/**
 * البحث في مجموعات البيانات بالعنوان
 */
export function searchDatasets(query: string): DatasetInfo[] {
  const lowerQuery = query.toLowerCase();
  return AVAILABLE_DATASETS.filter(d =>
    d.titleAr.includes(query) ||
    d.titleAr.toLowerCase().includes(lowerQuery) ||
    d.columns.some(col => col.includes(query))
  );
}

/**
 * الحصول على مجموعات البيانات حسب التصنيف
 */
export function getDatasetsByCategory(category: string): DatasetInfo[] {
  return AVAILABLE_DATASETS.filter(d => d.category === category);
}

/**
 * الحصول على معلومات dataset بواسطة ID
 */
export function getDatasetInfo(id: string): DatasetInfo | undefined {
  return AVAILABLE_DATASETS.find(d => d.id === id);
}

// ═══════════════════════════════════════════════════════════════════
// دوال جلب البيانات من الـ API
// ═══════════════════════════════════════════════════════════════════

/**
 * جلب معلومات مجموعة بيانات من الـ API
 * @param datasetId - معرف مجموعة البيانات
 * @param version - إصدار الـ API (افتراضي: -1)
 */
export async function fetchDataset(
  datasetId: string,
  version: number = -1
): Promise<OpenDataDataset> {
  const url = `${OPEN_DATA_BASE_URL}/datasets?version=${version}&dataset=${datasetId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`فشل في جلب البيانات: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data || Object.keys(data).length === 0) {
    throw new Error(`لم يتم العثور على بيانات للمعرف: ${datasetId}`);
  }

  return data;
}

/**
 * جلب عدة مجموعات بيانات بالتوازي
 * @param datasetIds - قائمة معرفات مجموعات البيانات
 */
export async function fetchMultipleDatasets(
  datasetIds: string[]
): Promise<Map<string, OpenDataDataset | Error>> {
  const results = new Map<string, OpenDataDataset | Error>();

  const promises = datasetIds.map(async (id) => {
    try {
      const data = await fetchDataset(id);
      results.set(id, data);
    } catch (error) {
      results.set(id, error as Error);
    }
  });

  await Promise.all(promises);
  return results;
}

/**
 * جلب جميع مجموعات البيانات المتاحة
 * تحذير: قد يستغرق وقتاً طويلاً
 */
export async function fetchAllDatasets(): Promise<Map<string, OpenDataDataset | Error>> {
  const allIds = AVAILABLE_DATASETS.map(d => d.id);
  return fetchMultipleDatasets(allIds);
}

/**
 * جلب مجموعات البيانات حسب التصنيف
 */
export async function fetchDatasetsByCategory(
  category: string
): Promise<Map<string, OpenDataDataset | Error>> {
  const datasets = getDatasetsByCategory(category);
  const ids = datasets.map(d => d.id);
  return fetchMultipleDatasets(ids);
}

// ═══════════════════════════════════════════════════════════════════
// دوال الاختبار
// ═══════════════════════════════════════════════════════════════════

/**
 * اختبار الاتصال بالـ API
 */
export async function testConnection(): Promise<boolean> {
  try {
    // نجرب على dataset معروف أنه يعمل
    const testId = '4b7b45cb-e8b2-4864-a80d-6d9110865b99';
    await fetchDataset(testId);
    return true;
  } catch {
    return false;
  }
}

/**
 * طباعة ملخص مجموعات البيانات المتاحة
 */
export function printDatasetsSummary(): void {
  console.log('═'.repeat(60));
  console.log('   مجموعات البيانات المتاحة من منصة البيانات المفتوحة السعودية');
  console.log('═'.repeat(60));
  console.log(`\nإجمالي المجموعات: ${AVAILABLE_DATASETS.length}`);
  console.log('\nالتصنيفات:');

  const categories = getCategories();
  categories.forEach(cat => {
    const count = getDatasetsByCategory(cat).length;
    console.log(`  • ${cat}: ${count} مجموعة`);
  });

  console.log('\n' + '─'.repeat(60));
}

// تصدير عدد الـ datasets
export const DATASETS_COUNT = AVAILABLE_DATASETS.length;
