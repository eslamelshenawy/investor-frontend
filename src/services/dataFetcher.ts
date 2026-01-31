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

export interface DatasetInfo {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  category?: string;
  organization?: string;
  recordCount?: number;
  resources?: DatasetResource[];
  updatedAt?: string;
}

export interface DatasetListResult {
  datasets: DatasetInfo[];
  total: number;
  page: number;
  hasMore: boolean;
  source: 'api' | 'cache';
}

// ═══════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════

// Saudi Open Data Portal uses CKAN API
const CKAN_BASE = 'https://open.data.gov.sa/api/3/action';
const API_BASE = 'https://open.data.gov.sa/data/api';
const CATALOG_API = 'https://open.data.gov.sa/data/api/catalog';
const CACHE_PREFIX = 'dataset_cache_';
const DATASETS_LIST_KEY = 'datasets_list_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const LIST_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours for list cache

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
// Datasets List Cache Functions
// ═══════════════════════════════════════════════════════════════════

interface ListCacheEntry {
  datasets: DatasetInfo[];
  total: number;
  timestamp: number;
}

function getListFromCache(): ListCacheEntry | null {
  try {
    const cached = localStorage.getItem(DATASETS_LIST_KEY);
    if (!cached) return null;

    const entry: ListCacheEntry = JSON.parse(cached);
    const now = Date.now();

    if (now - entry.timestamp > LIST_CACHE_TTL) {
      localStorage.removeItem(DATASETS_LIST_KEY);
      return null;
    }

    return entry;
  } catch (error) {
    console.error('List cache read error:', error);
    return null;
  }
}

function saveListToCache(datasets: DatasetInfo[], total: number): void {
  try {
    const entry: ListCacheEntry = {
      datasets,
      total,
      timestamp: Date.now(),
    };
    localStorage.setItem(DATASETS_LIST_KEY, JSON.stringify(entry));
  } catch (error) {
    console.error('List cache write error:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════
// Datasets List API Functions (جلب قائمة كل الـ Datasets)
// ═══════════════════════════════════════════════════════════════════

/**
 * جلب قائمة الـ Datasets من API المنصة مباشرة
 * يستخدم عدة endpoints للحصول على أكبر عدد
 */
export async function fetchDatasetsList(options: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  forceRefresh?: boolean;
} = {}): Promise<DatasetListResult> {
  const { page = 1, limit = 100, category, search, forceRefresh = false } = options;

  // Check cache first (only for first page without filters)
  if (!forceRefresh && page === 1 && !category && !search) {
    const cached = getListFromCache();
    if (cached) {
      console.log(`📦 Datasets list from cache (${cached.datasets.length} datasets)`);
      return {
        datasets: cached.datasets.slice(0, limit),
        total: cached.total,
        page: 1,
        hasMore: cached.datasets.length > limit,
        source: 'cache',
      };
    }
  }

  console.log(`🌐 Fetching datasets list (page: ${page}, limit: ${limit})`);

  const allDatasets: DatasetInfo[] = [];
  const offset = (page - 1) * limit;

  try {
    // Try CKAN API first (most reliable for open data portals)
    const ckanEndpoints = [
      // CKAN package_search - main search API
      `${CKAN_BASE}/package_search?rows=${limit}&start=${offset}`,
      // CKAN with search query
      search ? `${CKAN_BASE}/package_search?q=${encodeURIComponent(search)}&rows=${limit}` : null,
      // CKAN with category/group filter
      category ? `${CKAN_BASE}/package_search?fq=groups:${encodeURIComponent(category)}&rows=${limit}` : null,
      // Alternative CKAN endpoints
      `${CKAN_BASE}/current_package_list_with_resources?limit=${limit}&offset=${offset}`,
    ].filter(Boolean) as string[];

    // Also try the custom API endpoints
    const customEndpoints = [
      `${CATALOG_API}?version=-1&rows=${limit}&start=${offset}`,
      `${API_BASE}/datasets/search?version=-1&rows=${limit}&start=${offset}`,
      `${API_BASE}/catalog/datasets?rows=${limit}&page=${page}`,
      `${API_BASE}/3/action/package_search?rows=${limit}&start=${offset}`,
    ];

    const allEndpoints = [...ckanEndpoints, ...customEndpoints];

    for (const endpoint of allEndpoints) {
      try {
        console.log(`   🔍 Trying: ${endpoint.substring(0, 80)}...`);

        const response = await fetch(endpoint, {
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors',
        });

        if (!response.ok) {
          console.log(`   ❌ HTTP ${response.status}`);
          continue;
        }

        const data = await response.json();

        // CKAN API returns: { success: true, result: { results: [...], count: N } }
        // Or for package_list: { success: true, result: [...] }
        let items: any[] = [];
        let totalCount = 0;

        if (data.success && data.result) {
          if (Array.isArray(data.result)) {
            items = data.result;
            totalCount = items.length;
          } else if (data.result.results) {
            items = data.result.results;
            totalCount = data.result.count || items.length;
          }
        } else {
          // Try other response structures
          items = data.results || data.datasets || data.data || data.items || [];
          totalCount = data.count || data.total || items.length;
        }

        if (Array.isArray(items) && items.length > 0) {
          console.log(`   ✅ Found ${items.length} datasets (total: ${totalCount})`);

          items.forEach((item: any) => {
            const dataset: DatasetInfo = {
              id: item.id || item.uuid || item.datasetId || item.name,
              titleAr: item.title_ar || item.titleAr || item.title || item.name,
              titleEn: item.title_en || item.titleEn || item.title || item.name,
              descriptionAr: item.notes_ar || item.descriptionAr || item.notes || item.description,
              descriptionEn: item.notes_en || item.descriptionEn || item.notes,
              category: item.groups?.[0]?.title || item.groups?.[0]?.name || item.category?.titleAr || item.category,
              organization: item.organization?.title || item.organization?.name || item.publisher?.name,
              recordCount: item.num_resources || item.recordCount || 0,
              updatedAt: item.metadata_modified || item.updatedAt || item.modified,
              resources: item.resources?.map((r: any) => ({
                id: r.id,
                name: r.name || r.description,
                format: r.format,
                downloadUrl: r.url,
              })),
            };

            // Avoid duplicates
            if (dataset.id && !allDatasets.find(d => d.id === dataset.id)) {
              allDatasets.push(dataset);
            }
          });

          // If we got enough results, break
          if (allDatasets.length >= limit) break;
        }
      } catch (e: any) {
        console.warn(`   ⚠️ Endpoint failed:`, e.message || e);
      }
    }

    // If API didn't work, try fetching from the HTML page (fallback)
    if (allDatasets.length === 0) {
      console.log('   🔄 Trying HTML scraping fallback...');
      const htmlDatasets = await fetchDatasetsFromHTML(page, limit);
      allDatasets.push(...htmlDatasets);
    }

    // Cache the results
    if (allDatasets.length > 0 && page === 1 && !category && !search) {
      saveListToCache(allDatasets, allDatasets.length);
    }

    console.log(`✅ Fetched ${allDatasets.length} datasets`);

    return {
      datasets: allDatasets,
      total: allDatasets.length,
      page,
      hasMore: allDatasets.length === limit,
      source: 'api',
    };
  } catch (error) {
    console.error('Failed to fetch datasets list:', error);
    return {
      datasets: [],
      total: 0,
      page,
      hasMore: false,
      source: 'api',
    };
  }
}

/**
 * جلب الـ Datasets من صفحة HTML (Fallback)
 */
async function fetchDatasetsFromHTML(page: number, limit: number): Promise<DatasetInfo[]> {
  try {
    // Try multiple pages to get more datasets
    const datasets: DatasetInfo[] = [];
    const pagesToFetch = Math.min(5, Math.ceil(limit / 20)); // Assuming 20 per page

    for (let p = page; p < page + pagesToFetch && datasets.length < limit; p++) {
      try {
        const response = await fetch(`https://open.data.gov.sa/ar/datasets?page=${p}`, {
          headers: {
            'Accept': 'text/html',
          },
          mode: 'cors',
        });

        if (!response.ok) continue;

        const html = await response.text();

        // Extract dataset IDs from HTML
        const idPattern = /\/datasets\/view\/([a-f0-9-]{36})/gi;
        const matches = html.matchAll(idPattern);
        const ids = new Set<string>();

        for (const match of matches) {
          ids.add(match[1].toLowerCase());
        }

        // Try to extract titles from HTML too
        const titlePattern = /<h[2-4][^>]*class="[^"]*dataset[^"]*"[^>]*>([^<]+)<\/h[2-4]>/gi;
        const titles: string[] = [];
        let titleMatch;
        while ((titleMatch = titlePattern.exec(html)) !== null) {
          titles.push(titleMatch[1].trim());
        }

        // Create dataset info from IDs
        let titleIndex = 0;
        for (const id of ids) {
          if (datasets.length >= limit) break;
          if (datasets.find(d => d.id === id)) continue;

          datasets.push({
            id,
            titleAr: titles[titleIndex] || `مجموعة بيانات ${id.substring(0, 8)}`,
            titleEn: `Dataset ${id.substring(0, 8)}`,
            category: 'أخرى',
          });
          titleIndex++;
        }

        console.log(`   📄 HTML page ${p}: Found ${ids.size} datasets`);

        // Small delay
        await new Promise(r => setTimeout(r, 300));
      } catch (pageError) {
        console.warn(`   ⚠️ HTML page ${p} failed:`, pageError);
      }
    }

    return datasets;
  } catch (error) {
    console.error('HTML scraping failed:', error);
    return [];
  }
}

/**
 * البحث في الـ Datasets
 */
export async function searchDatasets(query: string, limit: number = 50): Promise<DatasetInfo[]> {
  const result = await fetchDatasetsList({ search: query, limit });
  return result.datasets;
}

/**
 * جلب Datasets حسب الفئة
 */
export async function fetchDatasetsByCategory(category: string, limit: number = 50): Promise<DatasetInfo[]> {
  const result = await fetchDatasetsList({ category, limit });
  return result.datasets;
}

/**
 * جلب كل الـ Datasets (مع pagination تلقائي)
 */
export async function fetchAllDatasets(onProgress?: (loaded: number) => void): Promise<DatasetInfo[]> {
  const allDatasets: DatasetInfo[] = [];
  let page = 1;
  let hasMore = true;
  const limit = 100;

  while (hasMore && page <= 200) { // Max 200 pages = 20,000 datasets
    const result = await fetchDatasetsList({ page, limit });

    if (result.datasets.length === 0) {
      hasMore = false;
    } else {
      // Filter duplicates
      result.datasets.forEach(d => {
        if (!allDatasets.find(existing => existing.id === d.id)) {
          allDatasets.push(d);
        }
      });

      hasMore = result.hasMore;
      page++;

      if (onProgress) {
        onProgress(allDatasets.length);
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // Cache all results
  saveListToCache(allDatasets, allDatasets.length);

  return allDatasets;
}

// ═══════════════════════════════════════════════════════════════════
// Single Dataset API Functions
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
  // Datasets List
  fetchDatasetsList,
  searchDatasets,
  fetchDatasetsByCategory,
  fetchAllDatasets,
  // Single Dataset
  fetchDatasetMetadata,
  fetchDatasetResources,
  fetchDatasetData,
  fetchDatasetPreview,
  // Cache
  clearDatasetCache,
  clearAllCache,
  getCacheStats,
};
