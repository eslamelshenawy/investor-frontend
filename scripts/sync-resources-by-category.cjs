/**
 * مزامنة الـ Resources حسب الـ Category
 * =====================================
 * يجلب datasets لكل category على حدة لتجاوز حد الـ 10,000
 */

const puppeteer = require('puppeteer');
const { Client } = require('pg');

// ============ الإعدادات ============
const CONFIG = {
  BASE_URL: 'https://open.data.gov.sa',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres.udtuzktclvvjaqffvnfp:NiYqO4slVgX9k26s@aws-1-eu-west-1.pooler.supabase.com:6543/postgres',
  PAGE_SIZE: 100,
  DELAY_BETWEEN_REQUESTS: 300,
  DELAY_BETWEEN_PAGES: 1000,
  MAX_RETRIES: 3,
  BATCH_SIZE: 50,
};

// ============ المتغيرات العامة ============
let browser = null;
let page = null;
let dbClient = null;
let stats = {
  totalCategories: 0,
  processedCategories: 0,
  totalDatasets: 0,
  withResources: 0,
  savedToDb: 0,
  errors: 0,
  resourcesCount: 0,
};

// ============ دوال مساعدة ============
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatNumber(num) {
  return num.toLocaleString('en-US');
}

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============ Database Functions ============
async function connectDB() {
  if (dbClient) return dbClient;
  dbClient = new Client({
    connectionString: CONFIG.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await dbClient.connect();
  return dbClient;
}

async function closeDB() {
  if (dbClient) {
    await dbClient.end();
    dbClient = null;
  }
}

async function getCategories() {
  const client = await connectDB();
  const res = await client.query(`
    SELECT DISTINCT category, COUNT(*) as count
    FROM datasets
    WHERE category IS NOT NULL AND category != ''
    GROUP BY category
    ORDER BY count DESC
  `);
  return res.rows;
}

async function saveToDatabase(datasets) {
  const client = await connectDB();
  let successCount = 0;

  for (const d of datasets) {
    try {
      const result = await client.query(
        `UPDATE datasets SET resources = $1, updated_at = NOW() WHERE external_id = $2`,
        [JSON.stringify(d.resources || []), d.id]
      );
      if (result.rowCount > 0) successCount++;
    } catch (error) {
      // Skip errors silently
    }
  }

  stats.savedToDb += successCount;
  return successCount;
}

// ============ تهيئة المتصفح ============
async function initBrowser() {
  console.log('🌐 تشغيل المتصفح...');

  browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('   📡 الاتصال بالبوابة الوطنية...');
  await page.goto(`${CONFIG.BASE_URL}/ar/datasets`, { waitUntil: 'networkidle2', timeout: 60000 });
  await delay(3000);
  await page.evaluate(() => window.scrollTo(0, 500));
  await delay(2000);

  console.log('   ✅ تم الاتصال\n');
}

// ============ جلب Datasets لـ Category معينة ============
async function fetchDatasetsByCategory(categoryName) {
  const allDatasets = [];
  let pageNum = 0;
  let hasMore = true;

  while (hasMore) {
    const url = `${CONFIG.BASE_URL}/api/datasets/list?size=${CONFIG.PAGE_SIZE}&page=${pageNum}&sort=updatedAt,DESC`;

    try {
      const result = await page.evaluate(async (fetchUrl, catName) => {
        const res = await fetch(fetchUrl, {
          method: 'POST',
          headers: { 'accept': 'application/json', 'content-type': 'application/json' },
          body: JSON.stringify({
            tags: [], publishers: [], formats: [],
            categories: [catName],
            languages: [], datasetTypes: [],
            publishDate: { fromDate: null, toDate: null }
          }),
          credentials: 'include'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }, url, categoryName);

      if (result.content && result.content.length > 0) {
        for (const item of result.content) {
          allDatasets.push({
            id: item.datasetID || item.id,
            titleAr: item.titleAr || item.title || '',
          });
        }
        hasMore = !result.last;
        pageNum++;
        await delay(CONFIG.DELAY_BETWEEN_PAGES);
      } else {
        hasMore = false;
      }
    } catch (error) {
      hasMore = false;
    }
  }

  return allDatasets;
}

// ============ جلب Resources لـ Dataset ============
async function fetchDatasetResources(datasetId, retryCount = 0) {
  try {
    const result = await page.evaluate(async (id) => {
      const res = await fetch(`/api/datasets/${id}`, {
        credentials: 'include',
        headers: { 'accept': 'application/json' }
      });
      if (!res.ok) return { error: res.status };
      return res.json();
    }, datasetId);

    if (result.error) throw new Error(`HTTP ${result.error}`);

    const resources = (result.resources || []).map(r => ({
      id: r.resourceID || r.id || '',
      name: r.titleAr || r.titleEn || r.name || 'Resource',
      format: (r.fileFormat || r.format || '').toUpperCase(),
      url: r.downloadUrl || r.url || '',
      size: r.size || 0,
    })).filter(r => r.url);

    return { success: true, resources };
  } catch (error) {
    if (retryCount < CONFIG.MAX_RETRIES) {
      await delay(1000);
      return fetchDatasetResources(datasetId, retryCount + 1);
    }
    return { success: false, resources: [] };
  }
}

// ============ معالجة Category واحدة ============
async function processCategory(categoryName, categoryCount, categoryIndex) {
  console.log(`\n📁 [${categoryIndex}/${stats.totalCategories}] ${categoryName} (${formatNumber(categoryCount)} datasets)`);

  // جلب datasets لهذه الـ category
  const datasets = await fetchDatasetsByCategory(categoryName);
  console.log(`   📋 تم جلب ${formatNumber(datasets.length)} dataset`);

  if (datasets.length === 0) return;

  const results = [];

  for (let i = 0; i < datasets.length; i++) {
    const dataset = datasets[i];
    const progress = Math.round(((i + 1) / datasets.length) * 100);

    process.stdout.write(`\r   📦 ${i + 1}/${datasets.length} (${progress}%) | ✅ ${stats.withResources} | 📁 ${formatNumber(stats.resourcesCount)}     `);

    const resourcesResult = await fetchDatasetResources(dataset.id);

    if (resourcesResult.success && resourcesResult.resources.length > 0) {
      stats.withResources++;
      stats.resourcesCount += resourcesResult.resources.length;
    }

    results.push({
      id: dataset.id,
      resources: resourcesResult.resources,
    });

    stats.totalDatasets++;
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

  console.log(`\n   ✅ تم معالجة ${categoryName}`);
}

// ============ المزامنة الرئيسية ============
async function syncByCategory() {
  console.log('═'.repeat(60));
  console.log('🚀 مزامنة الـ Resources حسب الـ Category');
  console.log('═'.repeat(60) + '\n');

  const startTime = Date.now();

  try {
    // 1. الاتصال بقاعدة البيانات وجلب الـ categories
    console.log('📊 جلب الـ Categories من قاعدة البيانات...');
    const categories = await getCategories();
    stats.totalCategories = categories.length;

    const totalDatasets = categories.reduce((sum, c) => sum + parseInt(c.count), 0);
    console.log(`   ✅ ${categories.length} category | ${formatNumber(totalDatasets)} dataset\n`);

    // 2. تهيئة المتصفح
    await initBrowser();

    // 3. معالجة كل category
    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      stats.processedCategories = i + 1;
      await processCategory(cat.category, parseInt(cat.count), i + 1);
    }

  } catch (error) {
    console.error(`\n❌ خطأ: ${error.message}`);
  } finally {
    if (browser) await browser.close();
    await closeDB();
  }

  // الإحصائيات النهائية
  const elapsed = Math.round((Date.now() - startTime) / 1000);

  console.log('\n' + '═'.repeat(60));
  console.log('📊 الإحصائيات النهائية:');
  console.log(`   📁 Categories: ${stats.processedCategories}/${stats.totalCategories}`);
  console.log(`   📦 Datasets: ${formatNumber(stats.totalDatasets)}`);
  console.log(`   ✅ مع Resources: ${formatNumber(stats.withResources)}`);
  console.log(`   📁 إجمالي الملفات: ${formatNumber(stats.resourcesCount)}`);
  console.log(`   💾 تم الحفظ: ${formatNumber(stats.savedToDb)}`);
  console.log(`   ⏱️ الوقت: ${formatTime(elapsed)}`);
  console.log('═'.repeat(60));
}

// ============ التشغيل ============
syncByCategory()
  .then(() => {
    console.log('\n✅ تمت المزامنة!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ خطأ:', error.message);
    process.exit(1);
  });
