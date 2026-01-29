/**
 * خدمة مراقبة تحديثات مجموعات البيانات
 * Dataset Update Monitor Service
 *
 * تراقب التحديثات الجديدة وترسل إشعارات عند اكتشاف تغييرات
 */

import * as fs from 'fs';
import * as path from 'path';
import { AVAILABLE_DATASETS, fetchDataset, OpenDataDataset } from './openDataService';

// ═══════════════════════════════════════════════════════════════════
// الأنواع
// ═══════════════════════════════════════════════════════════════════

export interface DatasetUpdateRecord {
  id: string;
  titleAr: string;
  lastKnownUpdate: string;
  lastChecked: string;
  providerNameAr?: string;
  updateFrequency?: string;
}

export interface UpdateCheckResult {
  datasetId: string;
  titleAr: string;
  hasUpdate: boolean;
  previousUpdate: string | null;
  currentUpdate: string;
  providerNameAr: string;
  error?: string;
}

export interface MonitorConfig {
  /** مسار ملف تخزين آخر التحديثات */
  stateFilePath: string;
  /** دالة تُنفذ عند اكتشاف تحديث */
  onUpdateDetected?: (updates: UpdateCheckResult[]) => void | Promise<void>;
  /** دالة تُنفذ عند حدوث خطأ */
  onError?: (error: Error, datasetId: string) => void;
  /** عدد الطلبات المتزامنة (لتجنب الحظر) */
  concurrencyLimit?: number;
  /** تأخير بين الطلبات بالمللي ثانية */
  delayBetweenRequests?: number;
}

// ═══════════════════════════════════════════════════════════════════
// الثوابت
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_STATE_FILE = './dataset-update-state.json';
const DEFAULT_CONCURRENCY = 3;
const DEFAULT_DELAY = 500; // نصف ثانية

// ═══════════════════════════════════════════════════════════════════
// فئة المراقبة
// ═══════════════════════════════════════════════════════════════════

export class DatasetMonitor {
  private config: Required<MonitorConfig>;
  private state: Map<string, DatasetUpdateRecord> = new Map();

  constructor(config: Partial<MonitorConfig> = {}) {
    this.config = {
      stateFilePath: config.stateFilePath || DEFAULT_STATE_FILE,
      onUpdateDetected: config.onUpdateDetected || this.defaultUpdateHandler,
      onError: config.onError || this.defaultErrorHandler,
      concurrencyLimit: config.concurrencyLimit || DEFAULT_CONCURRENCY,
      delayBetweenRequests: config.delayBetweenRequests || DEFAULT_DELAY,
    };

    this.loadState();
  }

  /**
   * تحميل الحالة المحفوظة من الملف
   */
  private loadState(): void {
    try {
      if (fs.existsSync(this.config.stateFilePath)) {
        const data = fs.readFileSync(this.config.stateFilePath, 'utf-8');
        const records: DatasetUpdateRecord[] = JSON.parse(data);
        records.forEach(record => this.state.set(record.id, record));
        console.log(`📂 تم تحميل ${this.state.size} سجل من الحالة المحفوظة`);
      }
    } catch (error) {
      console.warn('⚠️ فشل تحميل الحالة المحفوظة، سيتم البدء من جديد');
    }
  }

  /**
   * حفظ الحالة إلى الملف
   */
  private saveState(): void {
    try {
      const records = Array.from(this.state.values());
      fs.writeFileSync(
        this.config.stateFilePath,
        JSON.stringify(records, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('❌ فشل حفظ الحالة:', error);
    }
  }

  /**
   * المعالج الافتراضي للتحديثات
   */
  private defaultUpdateHandler(updates: UpdateCheckResult[]): void {
    console.log('\n🔔 تم اكتشاف تحديثات جديدة!\n');
    updates.forEach(update => {
      console.log(`📊 ${update.titleAr}`);
      console.log(`   المزود: ${update.providerNameAr}`);
      console.log(`   التحديث السابق: ${update.previousUpdate || 'غير معروف'}`);
      console.log(`   التحديث الجديد: ${update.currentUpdate}`);
      console.log('');
    });
  }

  /**
   * المعالج الافتراضي للأخطاء
   */
  private defaultErrorHandler(error: Error, datasetId: string): void {
    console.error(`❌ خطأ في فحص ${datasetId}:`, error.message);
  }

  /**
   * تأخير بين الطلبات
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * فحص dataset واحد للتحديثات
   */
  async checkDataset(datasetId: string): Promise<UpdateCheckResult | null> {
    try {
      const data = await fetchDataset(datasetId);
      const currentUpdate = data.updatedAt;
      const previousRecord = this.state.get(datasetId);
      const previousUpdate = previousRecord?.lastKnownUpdate || null;

      const hasUpdate = previousUpdate !== null && previousUpdate !== currentUpdate;

      // تحديث السجل
      this.state.set(datasetId, {
        id: datasetId,
        titleAr: data.titleAr,
        lastKnownUpdate: currentUpdate,
        lastChecked: new Date().toISOString(),
        providerNameAr: data.providerNameAr,
        updateFrequency: data.updateFrequency,
      });

      return {
        datasetId,
        titleAr: data.titleAr,
        hasUpdate,
        previousUpdate,
        currentUpdate,
        providerNameAr: data.providerNameAr,
      };
    } catch (error) {
      this.config.onError(error as Error, datasetId);
      return null;
    }
  }

  /**
   * فحص جميع مجموعات البيانات للتحديثات
   */
  async checkAllDatasets(): Promise<UpdateCheckResult[]> {
    console.log('🔄 جاري فحص التحديثات...\n');
    const startTime = Date.now();

    const results: UpdateCheckResult[] = [];
    const updates: UpdateCheckResult[] = [];

    // فحص كل dataset مع تأخير
    for (let i = 0; i < AVAILABLE_DATASETS.length; i++) {
      const dataset = AVAILABLE_DATASETS[i];
      process.stdout.write(`\r   فحص ${i + 1}/${AVAILABLE_DATASETS.length}: ${dataset.titleAr.slice(0, 40)}...`);

      const result = await this.checkDataset(dataset.id);
      if (result) {
        results.push(result);
        if (result.hasUpdate) {
          updates.push(result);
        }
      }

      // تأخير بين الطلبات
      if (i < AVAILABLE_DATASETS.length - 1) {
        await this.delay(this.config.delayBetweenRequests);
      }
    }

    console.log('\n');

    // حفظ الحالة
    this.saveState();

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ تم فحص ${results.length} مجموعة بيانات في ${duration} ثانية`);

    // إشعار بالتحديثات
    if (updates.length > 0) {
      await this.config.onUpdateDetected(updates);
    } else {
      console.log('📭 لا توجد تحديثات جديدة');
    }

    return results;
  }

  /**
   * فحص مجموعات بيانات محددة
   */
  async checkSpecificDatasets(datasetIds: string[]): Promise<UpdateCheckResult[]> {
    const results: UpdateCheckResult[] = [];
    const updates: UpdateCheckResult[] = [];

    for (const id of datasetIds) {
      const result = await this.checkDataset(id);
      if (result) {
        results.push(result);
        if (result.hasUpdate) {
          updates.push(result);
        }
      }
      await this.delay(this.config.delayBetweenRequests);
    }

    this.saveState();

    if (updates.length > 0) {
      await this.config.onUpdateDetected(updates);
    }

    return results;
  }

  /**
   * الحصول على حالة dataset معين
   */
  getDatasetState(datasetId: string): DatasetUpdateRecord | undefined {
    return this.state.get(datasetId);
  }

  /**
   * الحصول على جميع السجلات
   */
  getAllState(): DatasetUpdateRecord[] {
    return Array.from(this.state.values());
  }

  /**
   * الحصول على آخر وقت فحص
   */
  getLastCheckTime(): string | null {
    const records = this.getAllState();
    if (records.length === 0) return null;

    const latest = records.reduce((latest, record) =>
      new Date(record.lastChecked) > new Date(latest.lastChecked) ? record : latest
    );
    return latest.lastChecked;
  }

  /**
   * الحصول على ملخص الحالة
   */
  getSummary(): {
    totalDatasets: number;
    trackedDatasets: number;
    lastCheckTime: string | null;
    updateFrequencies: Record<string, number>;
  } {
    const records = this.getAllState();
    const frequencies: Record<string, number> = {};

    records.forEach(record => {
      const freq = record.updateFrequency || 'UNKNOWN';
      frequencies[freq] = (frequencies[freq] || 0) + 1;
    });

    return {
      totalDatasets: AVAILABLE_DATASETS.length,
      trackedDatasets: records.length,
      lastCheckTime: this.getLastCheckTime(),
      updateFrequencies: frequencies,
    };
  }

  /**
   * مسح الحالة المحفوظة
   */
  clearState(): void {
    this.state.clear();
    if (fs.existsSync(this.config.stateFilePath)) {
      fs.unlinkSync(this.config.stateFilePath);
    }
    console.log('🗑️ تم مسح الحالة المحفوظة');
  }
}

// ═══════════════════════════════════════════════════════════════════
// دوال مساعدة للتشغيل السريع
// ═══════════════════════════════════════════════════════════════════

/**
 * إنشاء مراقب بإعدادات افتراضية
 */
export function createMonitor(
  onUpdate?: (updates: UpdateCheckResult[]) => void | Promise<void>
): DatasetMonitor {
  return new DatasetMonitor({
    onUpdateDetected: onUpdate,
  });
}

/**
 * فحص سريع لجميع التحديثات
 */
export async function quickCheck(): Promise<UpdateCheckResult[]> {
  const monitor = new DatasetMonitor();
  return monitor.checkAllDatasets();
}

/**
 * تحويل تكرار التحديث إلى عدد الأيام المتوقعة
 */
export function updateFrequencyToDays(frequency: string): number {
  const map: Record<string, number> = {
    'DAILY': 1,
    'WEEKLY': 7,
    'MONTHLY': 30,
    'QUARTERLY': 90,
    'YEARLY': 365,
    'REAL_TIME': 0,
  };
  return map[frequency] || 30;
}

/**
 * الحصول على datasets التي من المتوقع تحديثها قريباً
 */
export function getExpectedUpdates(state: DatasetUpdateRecord[]): DatasetUpdateRecord[] {
  const now = new Date();

  return state.filter(record => {
    if (!record.updateFrequency || !record.lastKnownUpdate) return false;

    const lastUpdate = new Date(record.lastKnownUpdate);
    const expectedDays = updateFrequencyToDays(record.updateFrequency);
    const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

    // إذا مر أكثر من 80% من الفترة المتوقعة
    return daysSinceUpdate >= expectedDays * 0.8;
  });
}
