/**
 * نظام المزامنة التلقائية للبيانات المفتوحة السعودية
 * Saudi Open Data Auto-Sync System
 *
 * يقوم بـ:
 * 1. اكتشاف datasets جديدة تلقائياً
 * 2. مراقبة التحديثات
 * 3. تحميل البيانات الجديدة
 * 4. حفظها في مجلد محدد
 */

import * as fs from 'fs';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════════
// الإعدادات
// ═══════════════════════════════════════════════════════════════════

export interface SyncConfig {
  /** مجلد حفظ البيانات */
  dataDir: string;
  /** ملف حالة المزامنة */
  stateFile: string;
  /** تأخير بين الطلبات (مللي ثانية) */
  requestDelay: number;
}

export const DEFAULT_CONFIG: SyncConfig = {
  dataDir: './data/open-data',
  stateFile: './data/sync-state.json',
  requestDelay: 500,
};

// ═══════════════════════════════════════════════════════════════════
// الأنواع
// ═══════════════════════════════════════════════════════════════════

export interface DatasetState {
  id: string;
  titleAr: string;
  titleEn: string;
  providerNameAr: string;
  lastKnownUpdate: string;
  lastSyncTime: string;
  localFile: string | null;
  format: string;
}

export interface SyncState {
  datasets: Record<string, DatasetState>;
  lastFullSync: string | null;
  lastDiscovery: string | null;
  totalDatasets: number;
}

export interface SyncResult {
  newDatasets: string[];
  updatedDatasets: string[];
  failedDatasets: string[];
  totalProcessed: number;
}

// ═══════════════════════════════════════════════════════════════════
// الـ API URLs
// ═══════════════════════════════════════════════════════════════════

const API_BASE = 'https://open.data.gov.sa/data/api';
const API_ENDPOINTS = {
  dataset: (id: string) => `${API_BASE}/datasets?version=-1&dataset=${id}`,
  resources: (id: string) => `${API_BASE}/datasets/resources?version=-1&dataset=${id}`,
};

// ═══════════════════════════════════════════════════════════════════
// قائمة الـ Dataset IDs المعروفة
// ═══════════════════════════════════════════════════════════════════

export const KNOWN_DATASET_IDS: string[] = [
  "1e7e8621-fd39-42fb-b78f-3c50b0be4f2e", // المؤشر العقاري
  "5948497a-d84f-45a4-944c-50c59cff9629", // الصفقات العقارية Q3
  "ad218919-2014-4917-a85d-d4ec1a43c050", // الصفقات العقارية Q2
  "b748181e-4c9f-4521-8144-1f48f7cb945c", // مؤشرات الرياض Q3
  "c8ae6fea-4f68-436a-accc-2d83d14f0cd4", // مؤشرات الرياض Q1
  "2a265aaf-fd1d-4aab-808e-74d8a3088594", // مؤشرات مكة Q3
  "66e8cee3-0495-4d78-bbad-00654e63aec8", // تملك النساء Q3
  "2746ab4f-0700-425f-9b5c-618944a8cada", // تملك الرجال Q3
  "2c2a3203-0671-4692-b030-628001b80d46", // تملك الرجال Q1
  "38ef9473-f5f4-4fbf-83a7-1a4bf0c7ccec", // المزادات العقارية
  "3d44d00e-5aa6-4937-981d-bd0548606109", // المبيعات الإلكترونية
  "cc856462-5d59-481c-8ceb-29007c2b5525", // المبيعات هجين
  "40fd0d4e-76e1-4fb2-afd3-42a56698e5af", // تفاصيل المزادات إلكتروني
  "308744fe-60db-47f5-9ddb-691a51506a09", // تفاصيل المزادات هجين
  "68098400-520c-48d5-8d26-bd8855bf7572", // مبيعات الأصول العقارية
  "0e0d56bc-c8fe-44cd-bbc9-9fc3f6651799", // القرارات التنفيذية Q3
  "099d92d7-050f-494a-ba11-175e358bc121", // القرارات التنفيذية Q2
  "7645e1f8-aed3-4038-9f74-090d015a13d6", // القرارات التنفيذية Q1
  "2b13bef4-8c0d-40d3-b071-00bd089fb610", // تعديل صك Q3
  "8fc9e19e-ed3a-4c8a-a768-58d9d04814f5", // تسجيل ملكية بدون صك
  "79998ff6-63b6-436e-9703-0430b440f3e6", // وكالات صندوق التنمية Q3
  "e54350f5-4121-4007-a7d8-1938373d0bd1", // وكالات صندوق التنمية Q2
  "e8ed3887-59a5-4504-8316-e9cece8f2249", // وكالات صندوق التنمية Q1
  "ba7b4224-da7d-4419-bbd3-1c6f586da49e", // الدعم الشهري
  "932edccb-b985-4fd0-bca6-5badf9d14300", // نسبة التوطين
  "c02f10db-06ef-4528-aabb-264f63d163c9", // موظفي الصندوق
  "6d54ae82-7736-4ccf-b662-31844233f5b5", // ثقة المستفيدين
  "e6e5bd44-95d5-4381-98c0-fa2b8c938b8b", // إجمالي المستفيدين
  "b22e5e7c-2183-4115-bcd3-d6b955f24137", // الحلول التمويلية
  "db0596fb-ff37-41a3-b6f2-cf15d7b724a4", // متوسط أعمار المستفيدين
  "0662ed73-d555-45e2-814a-898d368ab4ef", // عقود الانتفاع
  "9396bbd8-4283-4485-ac2a-c6743b74980c", // عقود الرهن
  "b6dc46f4-9de0-4039-82f5-b5db3897883d", // قروض الإقراض المباشر
  "ea90c3d0-cb8d-4c34-9892-ea0aa35ad9a3", // الإقامة المميزة
  "c3e2b0a2-06b2-4a73-bb77-1e57fcb35365", // المتقدمين للإقامة
  "3a3ea3cc-dbf3-4d69-99db-a5c2f0165ae6", // الأصول الوقفية
  "4b7b45cb-e8b2-4864-a80d-6d9110865b99", // العمل الحر 2024
  "526237a0-c089-4003-939f-05dd827da9d1", // التسجيل العيني
  "43f82be8-7298-48fb-840d-eb176e51abc9", // عقود الوساطة
  "4a64b777-1db8-482d-b99a-5a0a76836d36", // استخدامات العقارات
  "30243301-2f50-4134-a967-a24dd5d9dfbf", // أنواع المنتجات العقارية
  "6dfb5c0b-0557-485d-be98-a39ea9b2e387", // خطة الإيجارات
  "40892c84-c7ec-48c9-b89c-da6caf178e96", // مكالمات مراكز الاتصال
];

// ═══════════════════════════════════════════════════════════════════
// فئة المزامنة التلقائية
// ═══════════════════════════════════════════════════════════════════

export class OpenDataAutoSync {
  private config: SyncConfig;
  private state: SyncState;
  private knownIds: Set<string>;

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = this.loadState();
    this.knownIds = new Set(KNOWN_DATASET_IDS);

    // إنشاء المجلدات
    this.ensureDirectories();
  }

  // ─────────────────────────────────────────────────────────────────
  // إدارة الحالة
  // ─────────────────────────────────────────────────────────────────

  private loadState(): SyncState {
    try {
      if (fs.existsSync(this.config.stateFile)) {
        return JSON.parse(fs.readFileSync(this.config.stateFile, 'utf-8'));
      }
    } catch (e) { }

    return {
      datasets: {},
      lastFullSync: null,
      lastDiscovery: null,
      totalDatasets: 0,
    };
  }

  private saveState(): void {
    const dir = path.dirname(this.config.stateFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.config.stateFile, JSON.stringify(this.state, null, 2), 'utf-8');
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.config.dataDir)) {
      fs.mkdirSync(this.config.dataDir, { recursive: true });
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // دوال المساعدة
  // ─────────────────────────────────────────────────────────────────

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchJson(url: string): Promise<any> {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) return null;
    return response.json();
  }

  private async downloadFile(url: string, filePath: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://open.data.gov.sa/',
        }
      });

      if (!response.ok) return false;

      const content = await response.text();
      if (content.includes('Request Rejected')) return false;

      fs.writeFileSync(filePath, content, 'utf-8');
      return true;
    } catch {
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // الدوال الرئيسية
  // ─────────────────────────────────────────────────────────────────

  /**
   * جلب معلومات dataset واحد
   */
  async fetchDatasetInfo(id: string): Promise<any> {
    return this.fetchJson(API_ENDPOINTS.dataset(id));
  }

  /**
   * جلب روابط التحميل لـ dataset
   */
  async fetchDatasetResources(id: string): Promise<any> {
    return this.fetchJson(API_ENDPOINTS.resources(id));
  }

  /**
   * تحميل بيانات dataset واحد
   */
  async syncDataset(id: string): Promise<{ success: boolean; isNew: boolean; isUpdated: boolean }> {
    const result = { success: false, isNew: false, isUpdated: false };

    try {
      // 1. جلب معلومات الـ dataset
      const info = await this.fetchDatasetInfo(id);
      if (!info) return result;

      // 2. فحص إذا كان جديد أو محدث
      const existingState = this.state.datasets[id];
      const isNew = !existingState;
      const isUpdated = existingState && existingState.lastKnownUpdate !== info.updatedAt;

      if (!isNew && !isUpdated) {
        // لا تغيير
        return { success: true, isNew: false, isUpdated: false };
      }

      // 3. جلب روابط التحميل
      const resources = await this.fetchDatasetResources(id);
      if (!resources?.resources?.length) {
        return result;
      }

      // 4. البحث عن CSV
      const csvResource = resources.resources.find((r: any) => r.format === 'CSV');
      if (!csvResource?.downloadUrl) {
        return result;
      }

      // 5. تحميل الملف
      const fileName = `${id}.csv`;
      const filePath = path.join(this.config.dataDir, fileName);
      const downloaded = await this.downloadFile(csvResource.downloadUrl, filePath);

      if (!downloaded) {
        return result;
      }

      // 6. تحديث الحالة
      this.state.datasets[id] = {
        id,
        titleAr: info.titleAr,
        titleEn: info.titleEn,
        providerNameAr: info.providerNameAr,
        lastKnownUpdate: info.updatedAt,
        lastSyncTime: new Date().toISOString(),
        localFile: fileName,
        format: 'CSV',
      };

      this.state.totalDatasets = Object.keys(this.state.datasets).length;
      this.saveState();

      return { success: true, isNew, isUpdated };

    } catch (error) {
      return result;
    }
  }

  /**
   * مزامنة جميع الـ datasets
   */
  async syncAll(): Promise<SyncResult> {
    const result: SyncResult = {
      newDatasets: [],
      updatedDatasets: [],
      failedDatasets: [],
      totalProcessed: 0,
    };

    console.log('🔄 بدء المزامنة الكاملة...\n');

    for (const id of this.knownIds) {
      result.totalProcessed++;
      process.stdout.write(`\r   معالجة ${result.totalProcessed}/${this.knownIds.size}...`);

      const syncResult = await this.syncDataset(id);

      if (syncResult.success) {
        if (syncResult.isNew) {
          result.newDatasets.push(id);
        } else if (syncResult.isUpdated) {
          result.updatedDatasets.push(id);
        }
      } else {
        result.failedDatasets.push(id);
      }

      await this.delay(this.config.requestDelay);
    }

    this.state.lastFullSync = new Date().toISOString();
    this.saveState();

    console.log('\n');
    return result;
  }

  /**
   * فحص التحديثات فقط (بدون تحميل)
   */
  async checkForUpdates(): Promise<string[]> {
    const updatedIds: string[] = [];

    for (const id of this.knownIds) {
      const info = await this.fetchDatasetInfo(id);
      if (!info) continue;

      const existingState = this.state.datasets[id];
      if (existingState && existingState.lastKnownUpdate !== info.updatedAt) {
        updatedIds.push(id);
      }

      await this.delay(this.config.requestDelay);
    }

    return updatedIds;
  }

  /**
   * إضافة dataset جديد للقائمة
   */
  addDatasetId(id: string): void {
    this.knownIds.add(id);
  }

  /**
   * الحصول على الإحصائيات
   */
  getStats(): {
    totalKnown: number;
    totalSynced: number;
    lastFullSync: string | null;
    datasetsWithUpdates: number;
  } {
    return {
      totalKnown: this.knownIds.size,
      totalSynced: Object.keys(this.state.datasets).length,
      lastFullSync: this.state.lastFullSync,
      datasetsWithUpdates: 0, // سيتم حسابها لاحقاً
    };
  }

  /**
   * الحصول على قائمة الـ datasets المحملة
   */
  getSyncedDatasets(): DatasetState[] {
    return Object.values(this.state.datasets);
  }
}

// ═══════════════════════════════════════════════════════════════════
// تصدير
// ═══════════════════════════════════════════════════════════════════

export default OpenDataAutoSync;
