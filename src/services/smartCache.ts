/**
 * Smart Cache Service - IndexedDB للتخزين الذكي
 *
 * يوفر:
 * - تخزين بيانات كبيرة (أكبر من localStorage)
 * - تحميل فوري للبيانات المخزنة
 * - انتهاء صلاحية تلقائي
 */

const DB_NAME = 'investor_radar_cache';
const DB_VERSION = 1;
const STORE_NAME = 'datasets';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 أيام

interface CachedDataset {
  id: string;
  data: {
    records: Record<string, unknown>[];
    columns: string[];
    totalRecords: number;
  };
  metadata: {
    titleAr: string;
    titleEn: string;
    category?: string;
  };
  cachedAt: number;
  expiresAt: number;
}

let db: IDBDatabase | null = null;

/**
 * فتح قاعدة البيانات
 */
async function openDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('cachedAt', 'cachedAt', { unique: false });
        store.createIndex('expiresAt', 'expiresAt', { unique: false });
      }
    };
  });
}

/**
 * حفظ بيانات في الـ Cache
 */
export async function cacheDataset(
  id: string,
  data: {
    records: Record<string, unknown>[];
    columns: string[];
    totalRecords: number;
  },
  metadata: {
    titleAr: string;
    titleEn: string;
    category?: string;
  }
): Promise<void> {
  try {
    const database = await openDB();
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const now = Date.now();
    const entry: CachedDataset = {
      id,
      data,
      metadata,
      cachedAt: now,
      expiresAt: now + CACHE_TTL,
    };

    store.put(entry);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

/**
 * جلب بيانات من الـ Cache
 */
export async function getCachedDataset(id: string): Promise<CachedDataset | null> {
  try {
    const database = await openDB();
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result as CachedDataset | undefined;

        if (!result) {
          resolve(null);
          return;
        }

        // Check expiration
        if (Date.now() > result.expiresAt) {
          // Remove expired entry
          deleteFromCache(id);
          resolve(null);
          return;
        }

        resolve(result);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

/**
 * حذف من الـ Cache
 */
export async function deleteFromCache(id: string): Promise<void> {
  try {
    const database = await openDB();
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(id);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

/**
 * جلب كل الـ Datasets المخزنة
 */
export async function getAllCachedDatasets(): Promise<CachedDataset[]> {
  try {
    const database = await openDB();
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as CachedDataset[];
        const now = Date.now();

        // Filter out expired entries
        const valid = results.filter(r => r.expiresAt > now);
        resolve(valid);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Cache getAll error:', error);
    return [];
  }
}

/**
 * مسح الـ Datasets المنتهية الصلاحية
 */
export async function cleanExpiredCache(): Promise<number> {
  try {
    const database = await openDB();
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('expiresAt');

    const now = Date.now();
    const range = IDBKeyRange.upperBound(now);
    let deletedCount = 0;

    return new Promise((resolve, reject) => {
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;

        if (cursor) {
          store.delete(cursor.primaryKey);
          deletedCount++;
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Cache cleanup error:', error);
    return 0;
  }
}

/**
 * مسح كل الـ Cache
 */
export async function clearAllCache(): Promise<void> {
  try {
    const database = await openDB();
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}

/**
 * إحصائيات الـ Cache
 */
export async function getCacheStats(): Promise<{
  count: number;
  totalRecords: number;
  oldestCache: Date | null;
  newestCache: Date | null;
}> {
  try {
    const datasets = await getAllCachedDatasets();

    if (datasets.length === 0) {
      return { count: 0, totalRecords: 0, oldestCache: null, newestCache: null };
    }

    const totalRecords = datasets.reduce((sum, d) => sum + (d.data?.totalRecords || 0), 0);
    const dates = datasets.map(d => d.cachedAt).sort((a, b) => a - b);

    return {
      count: datasets.length,
      totalRecords,
      oldestCache: new Date(dates[0]),
      newestCache: new Date(dates[dates.length - 1]),
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return { count: 0, totalRecords: 0, oldestCache: null, newestCache: null };
  }
}

/**
 * تحميل Top Datasets من الملفات المحلية إلى الـ Cache
 */
export async function preloadTopDatasets(): Promise<number> {
  try {
    // Load index
    const indexResponse = await fetch('/data/top-datasets/index.json');
    if (!indexResponse.ok) {
      console.log('No top-datasets index found');
      return 0;
    }

    const index = await indexResponse.json();
    let loaded = 0;

    for (const dataset of index.datasets || []) {
      try {
        // Check if already cached
        const cached = await getCachedDataset(dataset.id);
        if (cached) continue;

        // Load and cache
        const dataResponse = await fetch(`/data/top-datasets/${dataset.id}.json`);
        if (!dataResponse.ok) continue;

        const data = await dataResponse.json();

        await cacheDataset(
          dataset.id,
          {
            records: data.records,
            columns: data.columns,
            totalRecords: data.totalRecords,
          },
          {
            titleAr: data.titleAr,
            titleEn: data.titleEn,
            category: dataset.category,
          }
        );

        loaded++;
      } catch (e) {
        // Skip failed loads
      }
    }

    console.log(`📦 Preloaded ${loaded} datasets to cache`);
    return loaded;
  } catch (error) {
    console.error('Preload error:', error);
    return 0;
  }
}

export default {
  cacheDataset,
  getCachedDataset,
  deleteFromCache,
  getAllCachedDatasets,
  cleanExpiredCache,
  clearAllCache,
  getCacheStats,
  preloadTopDatasets,
};
