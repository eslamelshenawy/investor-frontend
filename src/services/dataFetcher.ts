/**
 * خدمة جلب البيانات من المصدر مباشرة - Data Fetcher Service
 *
 * تجلب البيانات مباشرة من منصة البيانات السعودية عبر Browser
 * لا حظر لأن الطلب من Browser وليس Server
 */

import * as Papa from 'papaparse';

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

export interface DatasetResource {
  id: string;
  name: string;
  format: string;
  downloadUrl: string;
  columns?: { name: string; type: string }[];
}

export interface FetchedData {
  records: Record<string, unknown>[];
  columns: string[];
  totalRecords: number;
  fetchedAt: string;
  source: 'api' | 'cache';
}

// ═══════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════

const API_BASE = 'https://open.data.gov.sa/data/api';
const CACHE_PREFIX = 'dataset_cache_';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// ═══════════════════════════════════════════════════════════════════
// Cache Functions
// ═══════════════════════════════════════════════════════════════════

interface CacheEntry {
  data: FetchedData;
  timestamp: number;
}

function getCacheKey(datasetId: string): string {
  return `${CACHE_PREFIX}${datasetId}`;
}

function getFromCache(datasetId: string): FetchedData | null {
  try {
    const key = getCacheKey(datasetId);
    const cached = localStorage.getItem(key);

    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired
    if (now - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }

    return { ...entry.data, source: 'cache' };
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

function saveToCache(datasetId: string, data: FetchedData): void {
  try {
    const key = getCacheKey(datasetId);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error('Cache write error:', error);
    // localStorage might be full, try to clear old entries
    clearOldCache();
  }
}

function clearOldCache(): void {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));

    // Sort by age and remove oldest half
    const entries = cacheKeys.map(key => {
      const entry = JSON.parse(localStorage.getItem(key) || '{}');
      return { key, timestamp: entry.timestamp || 0 };
    });

    entries.sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest half
    const toRemove = entries.slice(0, Math.floor(entries.length / 2));
    toRemove.forEach(e => localStorage.removeItem(e.key));
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════
// API Functions
// ═══════════════════════════════════════════════════════════════════

/**
 * جلب معلومات الـ Dataset
 */
export async function fetchDatasetMetadata(datasetId: string): Promise<{
  id: string;
  titleAr: string;
  titleEn: string;
  resources?: DatasetResource[];
} | null> {
  try {
    const response = await fetch(
      `${API_BASE}/datasets?version=-1&dataset=${datasetId}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch metadata:', error);
    return null;
  }
}

/**
 * جلب resources (روابط التحميل)
 */
export async function fetchDatasetResources(datasetId: string): Promise<DatasetResource[]> {
  try {
    const response = await fetch(
      `${API_BASE}/datasets/resources?version=-1&dataset=${datasetId}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data?.resources || [];
  } catch (error) {
    console.error('Failed to fetch resources:', error);
    return [];
  }
}

/**
 * جلب وتحويل CSV إلى JSON
 */
async function fetchAndParseCSV(url: string): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parse warnings:', results.errors);
        }
        resolve(results.data as Record<string, unknown>[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// Main Functions
// ═══════════════════════════════════════════════════════════════════

/**
 * جلب بيانات Dataset
 * يتحقق من Cache أولاً، ثم يجلب من المصدر
 */
export async function fetchDatasetData(
  datasetId: string,
  options: {
    forceRefresh?: boolean;
    limit?: number;
  } = {}
): Promise<FetchedData | null> {
  const { forceRefresh = false, limit } = options;

  // 1. Check cache first
  if (!forceRefresh) {
    const cached = getFromCache(datasetId);
    if (cached) {
      console.log(`📦 Cache hit for ${datasetId}`);

      // Apply limit if specified
      if (limit && cached.records.length > limit) {
        cached.records = cached.records.slice(0, limit);
      }

      return cached;
    }
  }

  console.log(`🌐 Fetching data for ${datasetId}`);

  try {
    // 2. Get resources
    const resources = await fetchDatasetResources(datasetId);

    // 3. Find CSV resource
    const csvResource = resources.find(
      r => r.format?.toLowerCase() === 'csv' || r.downloadUrl?.endsWith('.csv')
    );

    if (!csvResource?.downloadUrl) {
      console.warn(`No CSV resource for ${datasetId}`);
      return null;
    }

    // 4. Fetch and parse CSV
    const records = await fetchAndParseCSV(csvResource.downloadUrl);

    if (!records || records.length === 0) {
      console.warn(`Empty data for ${datasetId}`);
      return null;
    }

    // 5. Prepare result
    const result: FetchedData = {
      records,
      columns: Object.keys(records[0] || {}),
      totalRecords: records.length,
      fetchedAt: new Date().toISOString(),
      source: 'api',
    };

    // 6. Save to cache
    saveToCache(datasetId, result);

    console.log(`✅ Fetched ${records.length} records for ${datasetId}`);

    // 7. Apply limit if specified
    if (limit && result.records.length > limit) {
      result.records = result.records.slice(0, limit);
    }

    return result;
  } catch (error) {
    console.error(`Failed to fetch data for ${datasetId}:`, error);
    return null;
  }
}

/**
 * جلب preview سريع
 */
export async function fetchDatasetPreview(
  datasetId: string,
  count: number = 10
): Promise<FetchedData | null> {
  return fetchDatasetData(datasetId, { limit: count });
}

/**
 * مسح Cache لـ Dataset معين
 */
export function clearDatasetCache(datasetId: string): void {
  localStorage.removeItem(getCacheKey(datasetId));
}

/**
 * مسح كل الـ Cache
 */
export function clearAllCache(): void {
  const keys = Object.keys(localStorage);
  keys.filter(k => k.startsWith(CACHE_PREFIX)).forEach(k => localStorage.removeItem(k));
}

/**
 * الحصول على إحصائيات الـ Cache
 */
export function getCacheStats(): {
  count: number;
  totalSize: number;
  datasets: string[];
} {
  const keys = Object.keys(localStorage);
  const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));

  let totalSize = 0;
  const datasets: string[] = [];

  cacheKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      totalSize += value.length;
      datasets.push(key.replace(CACHE_PREFIX, ''));
    }
  });

  return {
    count: cacheKeys.length,
    totalSize,
    datasets,
  };
}

export default {
  fetchDatasetMetadata,
  fetchDatasetResources,
  fetchDatasetData,
  fetchDatasetPreview,
  clearDatasetCache,
  clearAllCache,
  getCacheStats,
};
