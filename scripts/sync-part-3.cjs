/**
 * Parallel Sync - Part 3 of 5
 * Categories 21-30
 *
 * يحفظ النتائج في Database مباشرة
 */

const puppeteer = require('puppeteer');
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.udtuzktclvvjaqffvnfp:NiYqO4slVgX9k26s@aws-1-eu-west-1.pooler.supabase.com:6543/postgres";
const BASE_URL = 'https://open.data.gov.sa';
const PAGE_SIZE = 100;
const FETCH_RESOURCES = true;
const RESOURCE_DELAY = 150;

// Part 3: Categories 21-30
const CATEGORIES = [
  { id: 'customer-service', name: 'خدمة العملاء' },
  { id: 'hajj-and-umrah', name: 'الحج و العمرة' },
  { id: 'population_and_housing', name: 'السكان والإسكان' },
  { id: 'environment', name: 'البيئة' },
  { id: 'social_protection_and_social_services', name: 'الحماية الاجتماعية' },
  { id: 'woman', name: 'المرأة' },
  { id: 'Sport', name: 'الرياضة' },
  { id: 'weather_conditions', name: 'الأحوال الجوية' },
  { id: 'employment', name: 'التوظيف' },
  { id: 'trade_-internal_and_external-', name: 'التجارة' },
];

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3
});

let resourcesUpdated = 0;

async function saveDataset(ds) {
  const query = `
    INSERT INTO datasets (id, external_id, name, name_ar, description, category, source, source_url, sync_status, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'open.data.gov.sa', $6, 'SYNCED', NOW(), NOW())
    ON CONFLICT (external_id) DO UPDATE SET
      name = EXCLUDED.name,
      name_ar = EXCLUDED.name_ar,
      category = EXCLUDED.category,
      updated_at = NOW()
  `;
  return pool.query(query, [ds.id, ds.titleEn || ds.title, ds.title, ds.description || '', ds.category, ds.sourceUrl]);
}

async function fetchDatasetDetails(page, datasetId) {
  try {
    return await page.evaluate(async (id, baseUrl) => {
      try {
        const response = await fetch(`${baseUrl}/api/datasets/${id}`, {
          headers: { 'accept': 'application/json', 'accept-language': 'ar' }
        });
        if (!response.ok) return { error: `HTTP ${response.status}` };
        const text = await response.text();
        if (text.startsWith('<')) return { error: 'blocked' };
        return JSON.parse(text);
      } catch (e) {
        return { error: e.message };
      }
    }, datasetId, BASE_URL);
  } catch (e) {
    return { error: e.message };
  }
}

async function updateDatasetFull(externalId, apiResponse) {
  const resources = apiResponse.resources || [];
  const formattedResources = resources.map(r => ({
    id: r.resourceID, url: r.url, name: r.name, format: r.format, columns: r.columns || []
  }));
  const csvResource = resources.find(r => r.format === 'CSV');
  const columns = csvResource?.columns?.map(c => c.name) || [];

  const query = `
    UPDATE datasets SET
      name = $2, name_ar = $3, description = $4, description_ar = $5,
      source = $6, resources = $7, columns = $8, metadata = $9, updated_at = NOW()
    WHERE external_id = $1
  `;
  await pool.query(query, [
    externalId, apiResponse.titleEn || '', apiResponse.titleAr || '',
    apiResponse.descriptionEn || '', apiResponse.descriptionAr || '',
    apiResponse.publisherNameAr || 'open.data.gov.sa',
    JSON.stringify(formattedResources), JSON.stringify(columns), JSON.stringify(apiResponse)
  ]);
}

async function fetchAndSaveResources(page, datasetId) {
  const details = await fetchDatasetDetails(page, datasetId);
  if (details.error) return false;
  await updateDatasetFull(datasetId, details);
  if ((details.resources || []).length > 0) resourcesUpdated++;
  return true;
}

async function fetchCategoryPage(page, categoryId, pageNum) {
  return page.evaluate(async (baseUrl, catId, pNum, pSize) => {
    try {
      const res = await fetch(`${baseUrl}/api/datasets/list?size=${pSize}&page=${pNum}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ categories: [catId] })
      });
      if (!res.ok) return { error: res.status };
      const text = await res.text();
      if (text.startsWith('<')) return { error: 'blocked' };
      return JSON.parse(text);
    } catch (e) {
      return { error: e.message };
    }
  }, BASE_URL, categoryId, pageNum, PAGE_SIZE);
}

async function refreshSession(page) {
  console.log('   🔄 Refreshing session...');
  await page.goto(`${BASE_URL}/ar/datasets`, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 10000));
}

async function syncCategory(page, category) {
  const info = await fetchCategoryPage(page, category.id, 0);
  if (info.error || !info.totalElements) return { saved: 0, error: info.error };

  const totalPages = Math.ceil(info.totalElements / PAGE_SIZE);
  let saved = 0;

  for (let p = 0; p < totalPages; p++) {
    const pageData = p === 0 ? info : await fetchCategoryPage(page, category.id, p);
    if (pageData.error || !pageData.content) {
      await refreshSession(page);
      const retry = await fetchCategoryPage(page, category.id, p);
      if (retry.error || !retry.content) break;
      pageData.content = retry.content;
    }

    for (const item of pageData.content || []) {
      const id = item.datasetID || item.datasetId || item.id;
      if (!id) continue;
      try {
        await saveDataset({
          id, title: item.titleAr || item.titleEn || id, titleEn: item.titleEn || '',
          description: item.descriptionAr || '', category: category.name,
          sourceUrl: `${BASE_URL}/ar/datasets/view/${id}`
        });
        saved++;
        if (FETCH_RESOURCES) {
          await fetchAndSaveResources(page, id);
          await new Promise(r => setTimeout(r, RESOURCE_DELAY));
        }
      } catch (e) {}
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  return { saved, total: info.totalElements };
}

async function main() {
  console.log('═'.repeat(50));
  console.log('🚀 PART 3/5 - Categories 21-30');
  console.log('═'.repeat(50));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  console.log('🔐 Getting session...');
  await page.goto(`${BASE_URL}/ar/datasets`, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 5000));

  let total = 0;
  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    console.log(`[${i + 1}/${CATEGORIES.length}] 📂 ${cat.name}`);
    const result = await syncCategory(page, cat);
    console.log(`   ✅ ${result.saved}/${result.total || '?'}`);
    total += result.saved;
    if ((i + 1) % 3 === 0) await refreshSession(page);
    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();
  console.log('═'.repeat(50));
  console.log(`✅ PART 3 COMPLETE - ${total} datasets, ${resourcesUpdated} resources`);
  console.log('═'.repeat(50));
  await pool.end();
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
