/**
 * خدمة اكتشاف مجموعات البيانات الجديدة
 * Dataset Discovery Service
 *
 * بما أن المنصة تستخدم Angular SPA ولا توفر API لقائمة الـ datasets
 * نستخدم نهج هجين: مراقبة + اكتشاف يدوي + تحقق تلقائي
 */

import * as fs from 'fs';
import * as path from 'path';
import { AVAILABLE_DATASETS, fetchDataset, OpenDataDataset } from './openDataService';

// ═══════════════════════════════════════════════════════════════════
// الأنواع
// ═══════════════════════════════════════════════════════════════════

export interface DiscoveredDataset {
  id: string;
  titleAr: string;
  titleEn: string;
  providerNameAr: string;
  discoveredAt: string;
  source: 'manual' | 'probe' | 'scrape';
  verified: boolean;
}

export interface DiscoveryState {
  knownDatasets: string[];
  discoveredDatasets: DiscoveredDataset[];
  lastProbeTime: string | null;
  lastDiscoveryTime: string | null;
}

// ═══════════════════════════════════════════════════════════════════
// قائمة المنظمات/المزودين المعروفين (لتوليد probe IDs)
// ═══════════════════════════════════════════════════════════════════

export const KNOWN_PROVIDERS = [
  'وزارة الموارد البشرية والتنمية الاجتماعية',
  'وزارة العدل',
  'صندوق التنمية العقارية',
  'مركز الإسناد والتصفية (إنفاذ)',
  'الهيئة العامة للأوقاف',
  'مركز الإقامة المميزة',
  'وزارة الشؤون البلدية والقروية والإسكان',
];

// ═══════════════════════════════════════════════════════════════════
// فئة الاكتشاف
// ═══════════════════════════════════════════════════════════════════

export class DatasetDiscovery {
  private stateFilePath: string;
  private state: DiscoveryState;

  constructor(stateFilePath: string = './discovery-state.json') {
    this.stateFilePath = stateFilePath;
    this.state = this.loadState();
  }

  private loadState(): DiscoveryState {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        return JSON.parse(fs.readFileSync(this.stateFilePath, 'utf-8'));
      }
    } catch (e) { }

    // الحالة الافتراضية
    return {
      knownDatasets: AVAILABLE_DATASETS.map(d => d.id),
      discoveredDatasets: [],
      lastProbeTime: null,
      lastDiscoveryTime: null,
    };
  }

  private saveState(): void {
    fs.writeFileSync(
      this.stateFilePath,
      JSON.stringify(this.state, null, 2),
      'utf-8'
    );
  }

  /**
   * التحقق من dataset ID معين
   */
  async verifyDatasetId(id: string): Promise<OpenDataDataset | null> {
    try {
      return await fetchDataset(id);
    } catch {
      return null;
    }
  }

  /**
   * إضافة dataset يدوياً (عند اكتشافه من الموقع)
   */
  async addManualDiscovery(id: string): Promise<DiscoveredDataset | null> {
    // تحقق إذا كان موجود مسبقاً
    if (this.state.knownDatasets.includes(id)) {
      console.log(`⚠️ Dataset ${id} موجود مسبقاً`);
      return null;
    }

    if (this.state.discoveredDatasets.some(d => d.id === id)) {
      console.log(`⚠️ Dataset ${id} مكتشف مسبقاً`);
      return null;
    }

    // تحقق من صحة الـ ID
    const data = await this.verifyDatasetId(id);
    if (!data) {
      console.log(`❌ Dataset ${id} غير موجود`);
      return null;
    }

    const discovered: DiscoveredDataset = {
      id,
      titleAr: data.titleAr,
      titleEn: data.titleEn,
      providerNameAr: data.providerNameAr,
      discoveredAt: new Date().toISOString(),
      source: 'manual',
      verified: true,
    };

    this.state.discoveredDatasets.push(discovered);
    this.state.lastDiscoveryTime = new Date().toISOString();
    this.saveState();

    console.log(`✅ تم اكتشاف: ${data.titleAr}`);
    return discovered;
  }

  /**
   * استيراد قائمة IDs من ملف
   */
  async importFromFile(filePath: string): Promise<DiscoveredDataset[]> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const ids = content.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi) || [];
    const uniqueIds = [...new Set(ids)];

    console.log(`📄 تم العثور على ${uniqueIds.length} معرف في الملف`);

    const discovered: DiscoveredDataset[] = [];
    for (const id of uniqueIds) {
      const result = await this.addManualDiscovery(id);
      if (result) {
        discovered.push(result);
      }
    }

    return discovered;
  }

  /**
   * تصدير الـ datasets المكتشفة بتنسيق يمكن إضافته للكود
   */
  exportAsCode(): string {
    const datasets = this.state.discoveredDatasets.filter(d => d.verified);

    if (datasets.length === 0) {
      return '// لا توجد datasets جديدة مكتشفة';
    }

    let code = '// Datasets مكتشفة جديدة - أضفها إلى AVAILABLE_DATASETS\n\n';

    datasets.forEach(d => {
      code += `{
  id: "${d.id}",
  titleAr: "${d.titleAr}",
  columns: [], // أضف الأعمدة يدوياً
  category: "" // أضف التصنيف
},\n`;
    });

    return code;
  }

  /**
   * الحصول على إحصائيات
   */
  getStats(): {
    knownCount: number;
    discoveredCount: number;
    totalCount: number;
    lastDiscovery: string | null;
  } {
    return {
      knownCount: this.state.knownDatasets.length,
      discoveredCount: this.state.discoveredDatasets.length,
      totalCount: this.state.knownDatasets.length + this.state.discoveredDatasets.length,
      lastDiscovery: this.state.lastDiscoveryTime,
    };
  }

  /**
   * عرض كل الـ datasets المكتشفة
   */
  listDiscovered(): DiscoveredDataset[] {
    return this.state.discoveredDatasets;
  }

  /**
   * نقل dataset مكتشف إلى القائمة المعروفة
   */
  promoteDiscovered(id: string): boolean {
    const index = this.state.discoveredDatasets.findIndex(d => d.id === id);
    if (index === -1) return false;

    const dataset = this.state.discoveredDatasets[index];
    this.state.knownDatasets.push(dataset.id);
    this.state.discoveredDatasets.splice(index, 1);
    this.saveState();

    return true;
  }
}

// ═══════════════════════════════════════════════════════════════════
// سكربت استخراج IDs من صفحة الويب (للنسخ واللصق)
// ═══════════════════════════════════════════════════════════════════

export const BROWSER_EXTRACTION_SCRIPT = `
// انسخ هذا الكود والصقه في Console المتصفح على صفحة المنصة
// ثم انسخ النتيجة وأضفها لملف

(function() {
  const links = document.querySelectorAll('a[href*="/datasets/view/"]');
  const ids = new Set();

  links.forEach(link => {
    const match = link.href.match(/\\/datasets\\/view\\/([a-f0-9-]+)/i);
    if (match) ids.add(match[1]);
  });

  const result = Array.from(ids);
  console.log('Dataset IDs found:', result.length);
  console.log(JSON.stringify(result, null, 2));

  // نسخ للـ clipboard
  navigator.clipboard.writeText(result.join('\\n'))
    .then(() => console.log('✅ تم نسخ الـ IDs للـ clipboard'))
    .catch(err => console.log('انسخ يدوياً:', result.join('\\n')));

  return result;
})();
`;

// ═══════════════════════════════════════════════════════════════════
// دوال مساعدة
// ═══════════════════════════════════════════════════════════════════

/**
 * طباعة سكربت الاستخراج للمتصفح
 */
export function printBrowserScript(): void {
  console.log('═'.repeat(70));
  console.log('   سكربت استخراج Dataset IDs من المتصفح');
  console.log('═'.repeat(70));
  console.log('');
  console.log('1. افتح المتصفح وادخل على: https://open.data.gov.sa/ar/datasets');
  console.log('2. اضغط F12 لفتح Developer Tools');
  console.log('3. اذهب لتبويب Console');
  console.log('4. انسخ والصق الكود التالي:');
  console.log('');
  console.log('─'.repeat(70));
  console.log(BROWSER_EXTRACTION_SCRIPT);
  console.log('─'.repeat(70));
  console.log('');
  console.log('5. اضغط Enter وستُنسخ الـ IDs للـ clipboard');
  console.log('6. احفظها في ملف وشغّل: node discover-datasets.mjs --import file.txt');
  console.log('');
}
