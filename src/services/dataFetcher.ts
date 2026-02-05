/**
 * خدمة جلب البيانات من المصدر مباشرة - Data Fetcher Service
 *
 * الترتيب:
 * 1. Top Datasets (ملفات محلية - فوري)
 * 2. Smart Cache (IndexedDB - فوري)
 * 3. API مع fallbacks
 */

import * as Papa from 'papaparse';
import { getCachedDataset, cacheDataset, preloadTopDatasets } from './smartCache';

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

// Backend API (Render) - Primary source for datasets
const BACKEND_API = import.meta.env.VITE_API_URL || '/api';

// Saudi Open Data Portal APIs (fallback)
const CKAN_BASE = 'https://open.data.gov.sa/api/3/action';
const API_BASE = 'https://open.data.gov.sa/data/api';
const CATALOG_API = 'https://open.data.gov.sa/data/api/catalog';

// Vercel proxy (fallback)
const VERCEL_PROXY = '/api/proxy?url=';

// External CORS proxies (last resort)
const CORS_PROXIES = [
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://corsproxy.org/?',
];
const CACHE_PREFIX = 'dataset_cache_';
const DATASETS_LIST_KEY = 'datasets_list_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const LIST_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours for list cache

// ═══════════════════════════════════════════════════════════════════
// Helper: Fetch with CORS proxy fallback
// ═══════════════════════════════════════════════════════════════════

async function fetchWithCorsProxy(url: string): Promise<any> {
  // 1. Try direct fetch FIRST (البوابة السعودية تسمح بطلبات Browser)
  try {
    console.log(`   🌐 Trying direct fetch...`);
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });
    if (response.ok) {
      console.log(`   ✅ Direct fetch worked!`);
      return response;
    }
  } catch (e) {
    console.log(`   ⚠️ Direct fetch failed (CORS)`);
  }

  // 2. Try Vercel API route (serverless proxy)
  try {
    const proxyUrl = VERCEL_PROXY + encodeURIComponent(url);
    console.log(`   🔄 Trying Vercel proxy...`);

    const response = await fetch(proxyUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      console.log(`   ✅ Vercel proxy worked!`);
      return response;
    } else {
      const error = await response.json().catch(() => ({}));
      console.log(`   ⚠️ Vercel proxy returned ${response.status}:`, error);
    }
  } catch (e: any) {
    console.log(`   ⚠️ Vercel proxy failed: ${e.message}`);
  }

  // 3. Try external CORS proxies as last resort
  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = proxy + encodeURIComponent(url);
      console.log(`   🔄 Trying external proxy: ${proxy.substring(0, 30)}...`);

      const response = await fetch(proxyUrl, {
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        console.log(`   ✅ External proxy worked!`);
        return response;
      }
    } catch (e: any) {
      console.log(`   ❌ Proxy failed: ${e.message || e}`);
      continue;
    }
  }

  throw new Error('All fetch attempts failed');
}

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
 * جلب قائمة الـ Datasets
 * 1. يجرب Backend API أولاً (الأسرع والأضمن)
 * 2. يرجع للـ direct API مع proxy لو Backend فشل
 */
export async function fetchDatasetsList(options: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  forceRefresh?: boolean;
} = {}): Promise<DatasetListResult> {
  const { page = 1, limit = 100, category, search, forceRefresh = false } = options;

  console.log(`🌐 Fetching datasets list (page: ${page}, limit: ${limit})`);

  // ═══════════════════════════════════════════════════════════════════
  // 0. For large requests (>5000), use /saudi/all endpoint
  // ═══════════════════════════════════════════════════════════════════
  if (limit >= 5000 && !search && !category) {
    try {
      console.log(`   🚀 Using /saudi/all endpoint for bulk fetch...`);

      const response = await fetch(`${BACKEND_API}/datasets/saudi/all`, {
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.data?.datasets?.length > 0) {
          const datasets: DatasetInfo[] = data.data.datasets.map((d: any) => ({
            id: d.id,
            titleAr: d.titleAr,
            titleEn: d.titleEn,
            descriptionAr: d.descriptionAr,
            descriptionEn: d.descriptionEn,
            category: d.category,
            organization: d.organization,
            recordCount: d.recordCount,
            updatedAt: d.updatedAt,
          }));

          console.log(`   ✅ Got ALL ${datasets.length} datasets from /saudi/all`);

          // Cache locally for faster subsequent loads
          saveListToCache(datasets, datasets.length);

          return {
            datasets,
            total: datasets.length,
            page: 1,
            hasMore: false,
            source: 'api',
          };
        }
      }
    } catch (e: any) {
      console.warn(`   ⚠️ /saudi/all failed: ${e.message}, falling back to paginated`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 1. Try Backend API FIRST (reads from Supabase database)
  // ═══════════════════════════════════════════════════════════════════
  try {
    console.log(`   🚀 Trying Backend API: ${BACKEND_API}/datasets/saudi`);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search && { search }),
      ...(category && { category }),
    });

    const response = await fetch(`${BACKEND_API}/datasets/saudi?${params}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();

      if (data.success && data.data?.datasets?.length > 0) {
        const datasets: DatasetInfo[] = data.data.datasets.map((d: any) => ({
          id: d.id,
          titleAr: d.titleAr,
          titleEn: d.titleEn,
          descriptionAr: d.descriptionAr,
          descriptionEn: d.descriptionEn,
          category: d.category,
          organization: d.organization,
          recordCount: d.recordCount,
          updatedAt: d.updatedAt,
          resources: d.resources,
        }));

        console.log(`   ✅ Backend returned ${datasets.length} datasets (source: ${data.data.meta?.source})`);

        // Cache locally
        if (page === 1 && !category && !search) {
          saveListToCache(datasets, data.data.meta?.total || datasets.length);
        }

        return {
          datasets,
          total: data.data.meta?.total || datasets.length,
          page: data.data.meta?.page || page,
          hasMore: data.data.meta?.hasMore ?? datasets.length === limit,
          source: data.data.meta?.source === 'cache' ? 'cache' : 'api',
        };
      }
    } else {
      console.warn(`   ⚠️ Backend returned ${response.status}`);
    }
  } catch (e: any) {
    console.warn(`   ⚠️ Backend API failed: ${e.message}`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 2. Fallback: Load from LOCAL JSON
  // ═══════════════════════════════════════════════════════════════════
  try {
    console.log(`📁 Fallback: Loading from local datasets.json...`);
    const response = await fetch('/data/datasets.json');

    if (response.ok) {
      const data = await response.json();

      if (data.datasets && data.datasets.length > 0) {
        console.log(`✅ Loaded ${data.datasets.length} datasets from local JSON`);

        let filtered = data.datasets;

        // Apply search filter
        if (search) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter((d: DatasetInfo) =>
            d.titleAr?.toLowerCase().includes(searchLower) ||
            d.titleEn?.toLowerCase().includes(searchLower) ||
            d.descriptionAr?.toLowerCase().includes(searchLower)
          );
        }

        // Apply category filter
        if (category) {
          filtered = filtered.filter((d: DatasetInfo) =>
            d.category?.toLowerCase().includes(category.toLowerCase())
          );
        }

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const paginated = filtered.slice(startIndex, startIndex + limit);

        return {
          datasets: paginated,
          total: filtered.length,
          page,
          hasMore: startIndex + limit < filtered.length,
          source: 'cache',
        };
      }
    }
  } catch (e) {
    console.log(`⚠️ Local JSON not available`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 3. Fallback: Try direct CKAN API with proxies
  // ═══════════════════════════════════════════════════════════════════
  console.log(`   🔄 Falling back to direct API...`);

  const allDatasets: DatasetInfo[] = [];
  const offset = (page - 1) * limit;

  try {
    const ckanEndpoints = [
      `${CKAN_BASE}/package_search?rows=${limit}&start=${offset}`,
      search ? `${CKAN_BASE}/package_search?q=${encodeURIComponent(search)}&rows=${limit}` : null,
      category ? `${CKAN_BASE}/package_search?fq=groups:${encodeURIComponent(category)}&rows=${limit}` : null,
    ].filter(Boolean) as string[];

    for (const endpoint of ckanEndpoints) {
      try {
        console.log(`   🔍 Trying: ${endpoint.substring(0, 60)}...`);

        const response = await fetchWithCorsProxy(endpoint);
        const data = await response.json();

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
        }

        if (Array.isArray(items) && items.length > 0) {
          console.log(`   ✅ Found ${items.length} datasets`);

          items.forEach((item: any) => {
            const dataset: DatasetInfo = {
              id: item.id || item.name,
              titleAr: item.title_ar || item.title || item.name,
              titleEn: item.title_en || item.title || item.name,
              descriptionAr: item.notes_ar || item.notes,
              descriptionEn: item.notes_en || item.notes,
              category: item.groups?.[0]?.title || item.groups?.[0]?.name,
              organization: item.organization?.title || item.organization?.name,
              recordCount: item.num_resources || 0,
              updatedAt: item.metadata_modified,
              resources: item.resources?.map((r: any) => ({
                id: r.id,
                name: r.name || r.description,
                format: r.format,
                downloadUrl: r.url,
              })),
            };

            if (dataset.id && !allDatasets.find(d => d.id === dataset.id)) {
              allDatasets.push(dataset);
            }
          });

          if (allDatasets.length >= limit) break;
        }
      } catch (e: any) {
        console.warn(`   ⚠️ Endpoint failed:`, e.message || e);
      }
    }

    // Cache results
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
  }

  // Return empty if all methods failed
  return {
    datasets: [],
    total: 0,
    page,
    hasMore: false,
    source: 'api',
  };
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
 * جلب كل الـ Datasets
 * 1. يجرب Backend API أولاً (endpoint واحد يجيب الكل)
 * 2. يرجع للـ pagination اليدوي لو فشل
 */
export async function fetchAllDatasets(onProgress?: (loaded: number) => void): Promise<DatasetInfo[]> {
  // ═══════════════════════════════════════════════════════════════════
  // 1. Try Backend API's /saudi/all endpoint (fetches all at once)
  // ═══════════════════════════════════════════════════════════════════
  try {
    console.log(`🚀 Trying Backend API for all datasets...`);

    const response = await fetch(`${BACKEND_API}/datasets/saudi/all`, {
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();

      if (data.success && data.data?.datasets?.length > 0) {
        const datasets: DatasetInfo[] = data.data.datasets.map((d: any) => ({
          id: d.id,
          titleAr: d.titleAr,
          titleEn: d.titleEn,
          descriptionAr: d.descriptionAr,
          descriptionEn: d.descriptionEn,
          category: d.category,
          organization: d.organization,
          recordCount: d.recordCount,
          updatedAt: d.updatedAt,
          resources: d.resources,
        }));

        console.log(`✅ Backend returned ${datasets.length} datasets`);

        // Cache locally
        saveListToCache(datasets, datasets.length);

        if (onProgress) {
          onProgress(datasets.length);
        }

        return datasets;
      }
    }
  } catch (e: any) {
    console.warn(`⚠️ Backend /saudi/all failed: ${e.message}`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 2. Fallback: Manual pagination
  // ═══════════════════════════════════════════════════════════════════
  console.log(`🔄 Falling back to manual pagination...`);

  const allDatasets: DatasetInfo[] = [];
  let page = 1;
  let hasMore = true;
  const limit = 100;

  while (hasMore && page <= 200) {
    const result = await fetchDatasetsList({ page, limit });

    if (result.datasets.length === 0) {
      hasMore = false;
    } else {
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

      await new Promise(r => setTimeout(r, 500));
    }
  }

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
 * جلب resources (روابط التحميل) - يستخدم Backend API أولاً
 */
export async function fetchDatasetResources(datasetId: string): Promise<DatasetResource[]> {
  console.log(`🔍 Fetching resources for dataset: ${datasetId}`);

  // 1. Try Backend API first (resources stored in DB)
  try {
    console.log(`   🔗 Trying Backend API...`);
    const response = await fetch(`${BACKEND_API}/datasets/${datasetId}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data?.resources?.length > 0) {
        const resources = data.data.resources.map((r: any) => ({
          id: r.id,
          name: r.name,
          format: r.format,
          downloadUrl: r.url,
        }));
        console.log(`   ✅ Found ${resources.length} resources from Backend`);
        return resources;
      }
    }
  } catch (error) {
    console.warn(`   ⚠️ Backend API failed:`, error);
  }

  // 2. Try Saudi Open Data API directly (correct endpoint)
  try {
    console.log(`   🔗 Trying Saudi Open Data API...`);
    const response = await fetchWithCorsProxy(`https://open.data.gov.sa/api/datasets/${datasetId}`);
    const data = await response.json();

    if (data.resources?.length > 0) {
      const resources = data.resources.map((r: any) => ({
        id: r.resourceID || r.id,
        name: r.titleAr || r.titleEn || r.name,
        format: (r.fileFormat || r.format || '').toUpperCase(),
        downloadUrl: r.downloadUrl || r.url,
      }));
      console.log(`   ✅ Found ${resources.length} resources from Saudi API`);
      return resources;
    }
  } catch (error) {
    console.warn(`   ⚠️ Saudi API failed:`, error);
  }

  console.warn(`❌ No resources found for ${datasetId}`);
  return [];
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
 * 1. يتحقق من Top Datasets (ملفات محلية - الأسرع)
 * 2. يتحقق من Smart Cache (IndexedDB)
 * 3. يتحقق من Cache المحلي (localStorage)
 * 4. يجرب Backend API
 * 5. يجرب جلب مباشر من Saudi API
 */
export async function fetchDatasetData(
  datasetId: string,
  options: {
    forceRefresh?: boolean;
    limit?: number;
  } = {}
): Promise<FetchedData | null> {
  const { forceRefresh = false, limit = 100 } = options;

  // ═══════════════════════════════════════════════════════════════════
  // 1. Check Top Datasets (local JSON files - INSTANT!)
  // ═══════════════════════════════════════════════════════════════════
  if (!forceRefresh) {
    try {
      const response = await fetch(`/data/top-datasets/${datasetId}.json`);
      if (response.ok) {
        const data = await response.json();
        if (data.records && data.records.length > 0) {
          console.log(`⚡ Top Dataset hit: ${datasetId} (${data.records.length} records)`);

          const result: FetchedData = {
            records: limit ? data.records.slice(0, limit) : data.records,
            columns: data.columns || Object.keys(data.records[0] || {}),
            totalRecords: data.totalRecords || data.records.length,
            fetchedAt: data.fetchedAt || new Date().toISOString(),
            source: 'cache',
          };

          return result;
        }
      }
    } catch (e) {
      // Top dataset not available, continue
    }

    // ═══════════════════════════════════════════════════════════════════
    // 2. Check Smart Cache (IndexedDB - larger storage)
    // ═══════════════════════════════════════════════════════════════════
    try {
      const smartCached = await getCachedDataset(datasetId);
      if (smartCached) {
        console.log(`📦 Smart Cache hit: ${datasetId}`);

        const result: FetchedData = {
          records: limit ? smartCached.data.records.slice(0, limit) : smartCached.data.records,
          columns: smartCached.data.columns,
          totalRecords: smartCached.data.totalRecords,
          fetchedAt: new Date(smartCached.cachedAt).toISOString(),
          source: 'cache',
        };

        return result;
      }
    } catch (e) {
      // IndexedDB not available, continue
    }

    // ═══════════════════════════════════════════════════════════════════
    // 3. Check localStorage cache
    // ═══════════════════════════════════════════════════════════════════
    const cached = getFromCache(datasetId);
    if (cached) {
      console.log(`💾 localStorage cache hit for ${datasetId}`);

      if (limit && cached.records.length > limit) {
        cached.records = cached.records.slice(0, limit);
      }

      return cached;
    }
  }

  console.log(`🌐 Fetching data for ${datasetId}`);

  // ═══════════════════════════════════════════════════════════════════
  // 2. Try Backend API first (has Redis cache)
  // ═══════════════════════════════════════════════════════════════════
  try {
    console.log(`   🚀 Trying Backend API: ${BACKEND_API}/datasets/${datasetId}/data`);

    const params = new URLSearchParams({
      limit: String(limit),
      ...(forceRefresh && { refresh: 'true' }),
    });

    const response = await fetch(`${BACKEND_API}/datasets/${datasetId}/data?${params}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();

      if (data.success && data.data?.records?.length > 0) {
        const result: FetchedData = {
          records: data.data.records,
          columns: data.data.columns || Object.keys(data.data.records[0] || {}),
          totalRecords: data.data.meta?.total || data.data.records.length,
          fetchedAt: data.data.meta?.fetchedAt || new Date().toISOString(),
          source: data.data.meta?.source === 'cache' ? 'cache' : 'api',
        };

        console.log(`   ✅ Backend returned ${result.records.length} records (source: ${result.source})`);

        // Cache locally (localStorage)
        saveToCache(datasetId, result);

        // Also save to Smart Cache (IndexedDB) for larger storage
        try {
          await cacheDataset(datasetId, {
            records: data.data.records,
            columns: result.columns,
            totalRecords: result.totalRecords,
          }, { titleAr: '', titleEn: '' });
        } catch (e) {
          // IndexedDB save failed, continue
        }

        return result;
      }
    } else {
      console.warn(`   ⚠️ Backend returned ${response.status}`);
    }
  } catch (e: any) {
    console.warn(`   ⚠️ Backend API failed: ${e.message}`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 3. Fallback: Direct fetch from Saudi API
  // ═══════════════════════════════════════════════════════════════════
  console.log(`   🔄 Falling back to direct API...`);

  try {
    // 2. Get resources from API
    const resources = await fetchDatasetResources(datasetId);

    // 3. Find CSV resource (try multiple formats)
    let csvResource = resources.find(
      r => r.format?.toLowerCase() === 'csv' || r.downloadUrl?.toLowerCase().includes('.csv')
    );

    // Try JSON if no CSV
    if (!csvResource?.downloadUrl) {
      csvResource = resources.find(
        r => r.format?.toLowerCase() === 'json' || r.downloadUrl?.toLowerCase().includes('.json')
      );
    }

    // Try XLS/XLSX
    if (!csvResource?.downloadUrl) {
      csvResource = resources.find(
        r => ['xls', 'xlsx'].includes(r.format?.toLowerCase() || '')
      );
    }

    // 4. If still no resource, try Backend preview API
    if (!csvResource?.downloadUrl) {
      console.log('   🔄 Trying Backend preview API...');

      try {
        const response = await fetch(`${BACKEND_API}/datasets/${datasetId}/preview?count=${limit || 100}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.records?.length > 0) {
            console.log(`   ✅ Got ${data.data.records.length} records from Backend`);

            const result: FetchedData = {
              records: data.data.records,
              columns: data.data.columns || Object.keys(data.data.records[0] || {}),
              totalRecords: data.data.totalRecords || data.data.records.length,
              fetchedAt: new Date().toISOString(),
              source: 'api',
            };

            saveToCache(datasetId, result);
            return result;
          }
        }
      } catch (e) {
        console.warn('   ⚠️ Backend preview failed:', e);
      }
    }

    if (!csvResource?.downloadUrl) {
      console.warn(`❌ No downloadable resource found for ${datasetId}`);
      console.log('   📋 Available resources:', resources.map(r => `${r.name || 'unnamed'} (${r.format || 'unknown'})`).join(', ') || 'none');
      return null;
    }

    console.log(`   📥 Downloading: ${csvResource.downloadUrl.substring(0, 60)}...`);

    // 5. Fetch and parse CSV
    const records = await fetchAndParseCSV(csvResource.downloadUrl);

    if (!records || records.length === 0) {
      console.warn(`Empty data for ${datasetId}`);
      return null;
    }

    // 6. Prepare result
    const result: FetchedData = {
      records,
      columns: Object.keys(records[0] || {}),
      totalRecords: records.length,
      fetchedAt: new Date().toISOString(),
      source: 'api',
    };

    // 7. Save to cache
    saveToCache(datasetId, result);

    console.log(`✅ Fetched ${records.length} records for ${datasetId}`);

    // 8. Apply limit if specified
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

/**
 * تحميل Top Datasets مسبقاً عند بدء التطبيق
 */
export async function initializeCache(): Promise<void> {
  try {
    console.log('🚀 Initializing Smart Cache...');
    const loaded = await preloadTopDatasets();
    console.log(`✅ Cache initialized: ${loaded} datasets preloaded`);
  } catch (e) {
    console.log('⚠️ Cache initialization skipped');
  }
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
  initializeCache,
};
