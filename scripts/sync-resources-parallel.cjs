/**
 * مزامنة الـ Resources بالتوازي
 * ============================
 * يقسم العمل على عدة workers للسرعة
 *
 * التشغيل:
 *   node scripts/sync-resources-parallel.cjs [workerIndex] [totalWorkers]
 *
 * مثال - تشغيل 4 workers بالتوازي:
 *   node scripts/sync-resources-parallel.cjs 0 4
 *   node scripts/sync-resources-parallel.cjs 1 4
 *   node scripts/sync-resources-parallel.cjs 2 4
 *   node scripts/sync-resources-parallel.cjs 3 4
 */

const puppeteer = require('puppeteer');
const { Client } = require('pg');

// ============ الإعدادات ============
const CONFIG = {
  BASE_URL: 'https://open.data.gov.sa',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres.udtuzktclvvjaqffvnfp:NiYqO4slVgX9k26s@aws-1-eu-west-1.pooler.supabase.com:6543/postgres',
  DELAY_BETWEEN_REQUESTS: 300,
  MAX_RETRIES: 3,
  BATCH_SIZE: 50,
};

// Worker settings from command line
const WORKER_INDEX = parseInt(process.argv[2]) || 0;
const TOTAL_WORKERS = parseInt(process.argv[3]) || 4;

// ============ المتغيرات ============
let browser = null;
let page = null;
let dbClient = null;
let stats = { total: 0, processed: 0, withResources: 0, saved: 0, resourcesCount: 0 };

// ============ دوال مساعدة ============
const delay = ms => new Promise(r => setTimeout(r, ms));
const formatNum = n => n.toLocaleString('en-US');
const formatTime = s => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0 ? `${h}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}` : `${m}:${sec.toString().padStart(2,'0')}`;
};

// ============ Database ============
async function connectDB() {
  if (dbClient) return dbClient;
  dbClient = new Client({ connectionString: CONFIG.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await dbClient.connect();
  return dbClient;
}

async function closeDB() {
  if (dbClient) { await dbClient.end(); dbClient = null; }
}

async function getDatasetIdsFromDB() {
  const client = await connectDB();
  // جلب datasets اللي ما عندها resources بعد
  const res = await client.query(`
    SELECT external_id FROM datasets
    WHERE (resources IS NULL OR resources = '[]')
    ORDER BY external_id
  `);
  return res.rows.map(r => r.external_id);
}

// جلب كل الـ datasets من API
async function fetchAllDatasetIdsFromAPI() {
  console.log('   📡 جلب قائمة الـ datasets من API...');
  const allIds = [];
  let pageNum = 0;
  let hasMore = true;

  while (hasMore) {
    const url = `${CONFIG.BASE_URL}/api/datasets/list?size=100&page=${pageNum}&sort=updatedAt,DESC`;

    try {
      const result = await page.evaluate(async (fetchUrl) => {
        const res = await fetch(fetchUrl, {
          method: 'POST',
          headers: { 'accept': 'application/json', 'content-type': 'application/json' },
          body: JSON.stringify({
            tags: [], publishers: [], formats: [], categories: [],
            languages: [], datasetTypes: [], publishDate: { fromDate: null, toDate: null }
          }),
          credentials: 'include'
        });
        if (!res.ok) return { error: res.status };
        return res.json();
      }, url);

      if (result.content && result.content.length > 0) {
        for (const item of result.content) {
          allIds.push({
            id: item.datasetID || item.id,
            titleAr: item.titleAr || item.title || '',
            titleEn: item.titleEn || '',
          });
        }
        process.stdout.write(`\r   📄 صفحة ${pageNum + 1} | تم جلب: ${allIds.length}     `);
        hasMore = !result.last;
        pageNum++;
        await delay(1000);
      } else {
        hasMore = false;
      }
    } catch (e) {
      hasMore = false;
    }
  }
  console.log('');
  return allIds;
}

async function saveToDatabase(datasets) {
  const client = await connectDB();
  let count = 0;
  for (const d of datasets) {
    try {
      // UPSERT - إضافة جديد أو تحديث موجود
      const res = await client.query(
        `INSERT INTO datasets (external_id, name, name_ar, category, source, resources, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT (external_id) DO UPDATE SET
           resources = EXCLUDED.resources,
           updated_at = NOW()`,
        [
          d.id,
          d.titleEn || d.titleAr || 'Dataset',
          d.titleAr || d.titleEn || 'Dataset',
          d.category || 'أخرى',
          'open.data.gov.sa',
          JSON.stringify(d.resources || [])
        ]
      );
      if (res.rowCount > 0) count++;
    } catch (e) {
      // console.log('DB Error:', e.message);
    }
  }
  stats.saved += count;
  return count;
}

// ============ Browser ============
async function initBrowser() {
  console.log(`🌐 [Worker ${WORKER_INDEX}] تشغيل المتصفح...`);
  browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  console.log(`   📡 الاتصال بالبوابة...`);
  await page.goto(`${CONFIG.BASE_URL}/ar/datasets`, { waitUntil: 'networkidle2', timeout: 60000 });
  await delay(3000);
  await page.evaluate(() => window.scrollTo(0, 500));
  await delay(2000);
  console.log(`   ✅ تم الاتصال\n`);
}

// ============ Fetch Resources ============
async function fetchResources(datasetId, retry = 0) {
  try {
    const result = await page.evaluate(async (id) => {
      const res = await fetch(`/api/datasets/${id}`, { credentials: 'include', headers: { 'accept': 'application/json' } });
      if (!res.ok) return { error: res.status };
      return res.json();
    }, datasetId);

    if (result.error) throw new Error(`HTTP ${result.error}`);

    const resources = (result.resources || []).map(r => ({
      id: r.resourceID || r.id || '',
      name: r.titleAr || r.titleEn || r.name || 'Resource',
      format: (r.fileFormat || r.format || '').toUpperCase(),
      url: r.downloadUrl || r.url || '',
    })).filter(r => r.url);

    // إرجاع بيانات إضافية للـ datasets الجديدة
    return {
      resources,
      category: result.categories?.[0]?.titleAr || result.category?.titleAr || 'أخرى',
      titleAr: result.titleAr || result.title || '',
      titleEn: result.titleEn || '',
      description: result.descriptionAr || result.description || '',
    };
  } catch (e) {
    if (retry < CONFIG.MAX_RETRIES) {
      await delay(1000);
      return fetchResources(datasetId, retry + 1);
    }
    return { resources: [], category: 'أخرى', titleAr: '', titleEn: '', description: '' };
  }
}

// ============ Main ============
async function main() {
  console.log('═'.repeat(50));
  console.log(`🚀 Worker ${WORKER_INDEX + 1}/${TOTAL_WORKERS} - مزامنة الـ Resources`);
  console.log('═'.repeat(50) + '\n');

  const startTime = Date.now();

  try {
    // 1. جلب IDs من Database (كل الـ datasets)
    console.log('📊 جلب dataset IDs من قاعدة البيانات...');
    const client = await connectDB();
    const res = await client.query(`SELECT external_id, name_ar FROM datasets ORDER BY external_id`);
    const allDatasets = res.rows.map(r => ({ id: r.external_id, titleAr: r.name_ar || '' }));
    console.log(`   📦 إجمالي: ${formatNum(allDatasets.length)}\n`);

    if (allDatasets.length === 0) {
      console.log('✅ لا يوجد datasets!');
      await closeDB();
      return;
    }

    // 2. تقسيم العمل
    const chunkSize = Math.ceil(allDatasets.length / TOTAL_WORKERS);
    const startIdx = WORKER_INDEX * chunkSize;
    const endIdx = Math.min(startIdx + chunkSize, allDatasets.length);
    const myDatasets = allDatasets.slice(startIdx, endIdx);

    stats.total = myDatasets.length;
    console.log(`📋 Worker ${WORKER_INDEX}: معالجة ${formatNum(myDatasets.length)} dataset (${startIdx + 1} → ${endIdx})\n`);

    // 3. تهيئة المتصفح
    await initBrowser();

    // 4. معالجة الـ datasets (UPSERT)
    const results = [];

    for (let i = 0; i < myDatasets.length; i++) {
      const dataset = myDatasets[i];
      const progress = Math.round(((i + 1) / myDatasets.length) * 100);
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const speed = i > 0 ? Math.round(i / (elapsed / 60)) : 0;

      process.stdout.write(`\r   📦 ${i + 1}/${myDatasets.length} (${progress}%) | ✅ ${stats.withResources} | 📁 ${formatNum(stats.resourcesCount)} | ⚡ ${speed}/د     `);

      const details = await fetchResources(dataset.id);

      if (details.resources.length > 0) {
        stats.withResources++;
        stats.resourcesCount += details.resources.length;
      }

      results.push({
        id: dataset.id,
        titleAr: details.titleAr || dataset.titleAr,
        titleEn: details.titleEn || dataset.titleEn,
        category: details.category,
        resources: details.resources,
      });
      stats.processed++;

      await delay(CONFIG.DELAY_BETWEEN_REQUESTS);

      // حفظ كل BATCH_SIZE
      if (results.length >= CONFIG.BATCH_SIZE) {
        await saveToDatabase(results);
        results.length = 0;
      }
    }

    // حفظ الباقي
    if (results.length > 0) {
      await saveToDatabase(results);
    }

  } catch (error) {
    console.error(`\n❌ خطأ: ${error.message}`);
  } finally {
    if (browser) await browser.close();
    await closeDB();
  }

  // الإحصائيات
  const elapsed = Math.round((Date.now() - startTime) / 1000);

  console.log('\n\n' + '═'.repeat(50));
  console.log(`📊 Worker ${WORKER_INDEX + 1} - النتائج:`);
  console.log(`   📦 تمت معالجة: ${formatNum(stats.processed)}/${formatNum(stats.total)}`);
  console.log(`   ✅ مع Resources: ${formatNum(stats.withResources)}`);
  console.log(`   📁 إجمالي الملفات: ${formatNum(stats.resourcesCount)}`);
  console.log(`   💾 تم الحفظ: ${formatNum(stats.saved)}`);
  console.log(`   ⏱️ الوقت: ${formatTime(elapsed)}`);
  console.log('═'.repeat(50));
}

main().then(() => {
  console.log(`\n✅ Worker ${WORKER_INDEX + 1} انتهى!`);
  process.exit(0);
}).catch(e => {
  console.error('\n❌', e.message);
  process.exit(1);
});
