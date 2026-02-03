/**
 * Parallel Sync - Part 5 of 5
 * Categories 41-48
 */

const puppeteer = require('puppeteer');
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.udtuzktclvvjaqffvnfp:NiYqO4slVgX9k26s@aws-1-eu-west-1.pooler.supabase.com:6543/postgres";
const BASE_URL = 'https://open.data.gov.sa';
const PAGE_SIZE = 100;

// Part 5: Categories 41-48
const CATEGORIES = [
  { id: 'eservices_statistics', name: 'إحصاءات الخدمات' },
  { id: 'economy_and_planning', name: 'الاقتصاد والتخطيط' },
  { id: 'group', name: 'الميزانية' },
  { id: 'social_services', name: 'الخدمات الاجتماعية' },
  { id: 'government_expenditure_and_reporting', name: 'النفقات الحكومية' },
  { id: 'hajj_and_umrah', name: 'الحج والعمرة' },
  { id: 'arab_gulf_cooperation_council_-gcc-', name: 'مجلس التعاون الخليجي' },
  { id: 'open_data_migration_group', name: 'تهجير البيانات' },
];

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3
});

let totalSaved = 0;
let cookies = '';
let deviceFingerprint = '';
let page = null;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

async function fetchCategoryPage(categoryId, pageNum) {
  const url = `${BASE_URL}/api/datasets/list?size=${PAGE_SIZE}&page=${pageNum}&sort=updatedAt,DESC`;

  const headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'ar',
    'content-language': 'ar',
    'content-type': 'application/json',
    'cookie': cookies,
    'origin': BASE_URL,
    'referer': `${BASE_URL}/ar/datasets`,
    'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'x-device-fingerprint': deviceFingerprint
  };

  const body = JSON.stringify({
    categories: [categoryId],
    tags: [],
    publishers: [],
    formats: [],
    languages: [],
    datasetTypes: [],
    publishDate: { fromDate: null, toDate: null }
  });

  try {
    const response = await page.evaluate(async (url, headers, body) => {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: body,
          credentials: 'include'
        });

        const text = await res.text();
        if (text.startsWith('<')) {
          return { error: 'blocked', status: res.status };
        }
        return JSON.parse(text);
      } catch (e) {
        return { error: e.message };
      }
    }, url, headers, body);

    return response;
  } catch (error) {
    return { error: error.message };
  }
}

async function syncCategory(category) {
  const info = await fetchCategoryPage(category.id, 0);

  if (info.error) {
    console.log(`   ⚠️ Error: ${info.error}`);
    return { saved: 0, error: info.error };
  }

  if (!info.totalElements) {
    console.log(`   ⚠️ No data (totalElements: ${info.totalElements})`);
    return { saved: 0, total: 0 };
  }

  const totalPages = Math.ceil(info.totalElements / PAGE_SIZE);
  let saved = 0;

  for (let p = 0; p < totalPages; p++) {
    const pageData = p === 0 ? info : await fetchCategoryPage(category.id, p);

    if (pageData.error || !pageData.content) {
      console.log(`   ⚠️ Page ${p} error, skipping...`);
      continue;
    }

    for (const item of pageData.content || []) {
      const id = item.datasetID || item.datasetId || item.id;
      if (!id) continue;

      try {
        await saveDataset({
          id,
          title: item.titleAr || item.titleEn || id,
          titleEn: item.titleEn || '',
          description: item.descriptionAr || '',
          category: category.name,
          sourceUrl: `${BASE_URL}/ar/datasets/view/${id}`
        });
        saved++;
        totalSaved++;
      } catch (e) {}
    }

    await delay(1000);
  }

  return { saved, total: info.totalElements };
}

async function main() {
  console.log('══════════════════════════════════════════════════');
  console.log('🚀 PART 5/5 - Categories 41-48');
  console.log('══════════════════════════════════════════════════');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--window-size=1920,1080'],
  });

  page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1920, height: 1080 });

  page.on('request', (request) => {
    const headers = request.headers();
    if (headers['x-device-fingerprint']) deviceFingerprint = headers['x-device-fingerprint'];
  });

  console.log('🔐 Getting session and cookies...');
  await page.goto(`${BASE_URL}/ar/datasets`, { waitUntil: 'networkidle2', timeout: 60000 });
  await delay(3000);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await delay(2000);

  const allCookies = await page.cookies();
  cookies = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

  const fpCookie = allCookies.find(c => c.name === 'device_fingerprint');
  if (fpCookie && !deviceFingerprint) deviceFingerprint = fpCookie.value;
  if (!deviceFingerprint) deviceFingerprint = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  console.log(`   ✅ Got ${allCookies.length} cookies`);
  console.log(`   🔑 Fingerprint: ${deviceFingerprint.substring(0, 16)}...`);

  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    console.log(`[${i + 1}/${CATEGORIES.length}] 📂 ${cat.name}`);
    const result = await syncCategory(cat);
    console.log(`   ✅ ${result.saved}/${result.total || '?'}`);
    await delay(2000);
  }

  await browser.close();
  console.log('══════════════════════════════════════════════════');
  console.log(`✅ PART 5 COMPLETE - ${totalSaved} datasets saved`);
  console.log('══════════════════════════════════════════════════');
  await pool.end();
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
