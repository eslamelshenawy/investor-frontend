/**
 * مزامنة الـ Datasets مع الـ Resources → Supabase
 * ================================================
 *
 * هذا السكريبت يجلب كل الـ datasets مع روابط الملفات (resources)
 * ويحفظها مباشرة في Supabase
 *
 * الخطوات:
 * 1. جلب قائمة الـ datasets من /api/datasets/list
 * 2. لكل dataset → جلب التفاصيل من /api/datasets/{id} للحصول على resources
 * 3. حفظ/تحديث في Supabase
 *
 * التشغيل:
 *   node scripts/sync-with-resources.cjs
 *   node scripts/sync-with-resources.cjs --test  (10 فقط للاختبار)
 */

const puppeteer = require('puppeteer');
const { Client } = require('pg');

// ============ الإعدادات ============
const CONFIG = {
  BASE_URL: 'https://open.data.gov.sa',
  // PostgreSQL Direct Connection
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres.udtuzktclvvjaqffvnfp:NiYqO4slVgX9k26s@aws-1-eu-west-1.pooler.supabase.com:6543/postgres',
  // إعدادات الجلب
  PAGE_SIZE: 100,
  MAX_DATASETS: null, // null = كل الـ datasets، أو رقم للتحديد
  DELAY_BETWEEN_REQUESTS: 500,
  DELAY_BETWEEN_PAGES: 1500,
  MAX_RETRIES: 3,
  // حفظ في Database كل X dataset
  BATCH_SIZE: 50,
};

// ============ المتغيرات العامة ============
let browser = null;
let page = null;
let stats = {
  total: 0,
  withResources: 0,
  withoutResources: 0,
  errors: 0,
  resourcesCount: 0,
};

// ============ دوال مساعدة ============

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatNumber(num) {
  return num.toLocaleString('en-US');
}

// ============ Database Functions ============

let dbClient = null;

async function connectDB() {
  if (dbClient) return dbClient;

  dbClient = new Client({
    connectionString: CONFIG.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await dbClient.connect();
  console.log('   ✅ متصل بقاعدة البيانات');
  return dbClient;
}

async function closeDB() {
  if (dbClient) {
    await dbClient.end();
    dbClient = null;
  }
}

async function saveToDatabase(datasets) {
  let successCount = 0;
  let errorCount = 0;

  const client = await connectDB();

  // تحديث كل dataset على حدة (لأن الجدول يستخدم external_id)
  for (const d of datasets) {
    try {
      // تحديث الـ resources فقط للـ datasets الموجودة
      const result = await client.query(
        `UPDATE datasets
         SET resources = $1, updated_at = NOW()
         WHERE external_id = $2`,
        [JSON.stringify(d.resources || []), d.id]
      );

      if (result.rowCount > 0) {
        successCount++;
      } else {
        // Dataset غير موجود - تخطي
        errorCount++;
      }
    } catch (error) {
      errorCount++;
      console.log(`   ⚠️ خطأ في تحديث ${d.id}: ${error.message}`);
    }
  }

  return {
    success: errorCount === 0,
    count: successCount,
    errors: errorCount
  };
}

// ============ تهيئة المتصفح ============

async function initBrowser() {
  console.log('🌐 تشغيل المتصفح...');

  browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1920,1080',
    ],
  });

  page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  );
  await page.setViewport({ width: 1920, height: 1080 });

  // فتح الصفحة للحصول على session
  console.log('   📡 الاتصال بالبوابة الوطنية...');
  await page.goto(`${CONFIG.BASE_URL}/ar/datasets`, {
    waitUntil: 'networkidle2',
    timeout: 60000,
  });

  await delay(3000);

  // التمرير لتفعيل الـ scripts
  await page.evaluate(() => window.scrollTo(0, 500));
  await delay(2000);

  console.log('   ✅ تم الاتصال\n');
}

// ============ جلب قائمة الـ Datasets ============

async function fetchDatasetsList() {
  console.log('📋 جلب قائمة الـ Datasets...');

  const allDatasets = [];
  let pageNum = 0;
  let hasMore = true;
  let totalInAPI = 0;

  while (hasMore) {
    const url = `${CONFIG.BASE_URL}/api/datasets/list?size=${CONFIG.PAGE_SIZE}&page=${pageNum}&sort=updatedAt,DESC`;

    try {
      const result = await page.evaluate(async (fetchUrl) => {
        const res = await fetch(fetchUrl, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            tags: [], publishers: [], formats: [], categories: [],
            languages: [], datasetTypes: [], publishDate: { fromDate: null, toDate: null }
          }),
          credentials: 'include'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }, url);

      if (result.content && result.content.length > 0) {
        if (pageNum === 0) {
          totalInAPI = result.totalElements || 0;
          console.log(`   📊 إجمالي الـ Datasets: ${formatNumber(totalInAPI)}`);
        }

        for (const item of result.content) {
          allDatasets.push({
            id: item.datasetID || item.id,
            titleAr: item.titleAr || item.title || '',
            titleEn: item.titleEn || '',
          });
        }

        process.stdout.write(`\r   📄 صفحة ${pageNum + 1} | تم جلب: ${formatNumber(allDatasets.length)}/${formatNumber(totalInAPI)}   `);

        hasMore = !result.last && allDatasets.length < (CONFIG.MAX_DATASETS || Infinity);
        pageNum++;

        await delay(CONFIG.DELAY_BETWEEN_PAGES);
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.log(`\n   ⚠️ خطأ في صفحة ${pageNum}: ${error.message}`);
      hasMore = false;
    }
  }

  console.log(`\n   ✅ تم جلب ${formatNumber(allDatasets.length)} dataset\n`);
  return allDatasets;
}

// ============ جلب Resources لـ Dataset واحد ============

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

    if (result.error) {
      throw new Error(`HTTP ${result.error}`);
    }

    // استخراج الـ resources
    const resources = (result.resources || []).map(r => ({
      id: r.resourceID || r.id || '',
      name: r.titleAr || r.titleEn || r.name || 'Resource',
      format: (r.fileFormat || r.format || '').toUpperCase(),
      url: r.downloadUrl || r.url || '',
      size: r.size || 0,
    })).filter(r => r.url); // فقط اللي عندها روابط

    return {
      success: true,
      resources,
      // معلومات إضافية
      category: result.categories?.[0]?.titleAr || result.category?.titleAr || '',
      organization: result.publisherNameAr || result.organization?.titleAr || '',
      description: result.descriptionAr || result.description || '',
    };

  } catch (error) {
    if (retryCount < CONFIG.MAX_RETRIES) {
      await delay(1000);
      return fetchDatasetResources(datasetId, retryCount + 1);
    }
    return { success: false, error: error.message };
  }
}

// ============ المزامنة الرئيسية ============

async function syncWithResources() {
  console.log('═'.repeat(60));
  console.log('🚀 مزامنة الـ Datasets مع الـ Resources');
  console.log('═'.repeat(60) + '\n');

  const startTime = Date.now();
  const results = [];

  try {
    // 1. تهيئة المتصفح
    await initBrowser();

    // 2. جلب قائمة الـ Datasets
    const datasetsList = await fetchDatasetsList();
    stats.total = datasetsList.length;

    if (CONFIG.MAX_DATASETS) {
      console.log(`⚠️ محدد بـ ${CONFIG.MAX_DATASETS} dataset للاختبار\n`);
    }

    // 3. جلب Resources لكل Dataset
    console.log('🔗 جلب الـ Resources لكل Dataset...\n');

    for (let i = 0; i < datasetsList.length; i++) {
      const dataset = datasetsList[i];
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const progress = Math.round(((i + 1) / datasetsList.length) * 100);
      const speed = i > 0 ? Math.round(i / (elapsed / 60)) : 0;
      const eta = speed > 0 ? Math.round((datasetsList.length - i) / speed) : 0;

      process.stdout.write(
        `\r   📦 ${i + 1}/${datasetsList.length} (${progress}%) | ` +
        `✅ ${stats.withResources} | ❌ ${stats.withoutResources} | ` +
        `⚡ ${speed}/د | ETA: ${eta}د     `
      );

      // جلب الـ resources
      const resourcesResult = await fetchDatasetResources(dataset.id);

      if (resourcesResult.success) {
        const fullDataset = {
          id: dataset.id,
          titleAr: dataset.titleAr,
          titleEn: dataset.titleEn,
          descriptionAr: resourcesResult.description,
          category: resourcesResult.category,
          organization: resourcesResult.organization,
          resources: resourcesResult.resources,
          resourcesCount: resourcesResult.resources.length,
          hasData: resourcesResult.resources.length > 0,
        };

        results.push(fullDataset);

        if (resourcesResult.resources.length > 0) {
          stats.withResources++;
          stats.resourcesCount += resourcesResult.resources.length;
        } else {
          stats.withoutResources++;
        }
      } else {
        stats.errors++;
        results.push({
          id: dataset.id,
          titleAr: dataset.titleAr,
          titleEn: dataset.titleEn,
          resources: [],
          resourcesCount: 0,
          hasData: false,
          error: resourcesResult.error,
        });
      }

      // تأخير بين الطلبات
      await delay(CONFIG.DELAY_BETWEEN_REQUESTS);

      // حفظ في Supabase كل BATCH_SIZE dataset
      if ((i + 1) % CONFIG.BATCH_SIZE === 0) {
        const batch = results.slice(i + 1 - CONFIG.BATCH_SIZE, i + 1);
        const saveResult = await saveToDatabase(batch);
        if (saveResult.success) {
          console.log(`\n   💾 تم حفظ ${saveResult.count} في Database`);
        } else {
          console.log(`\n   ⚠️ فشل الحفظ: ${saveResult.error}`);
        }
      }
    }

    // حفظ الباقي
    const remaining = results.length % CONFIG.BATCH_SIZE;
    if (remaining > 0) {
      const batch = results.slice(-remaining);
      const saveResult = await saveToDatabase(batch);
      if (saveResult.success) {
        console.log(`\n   💾 تم حفظ ${saveResult.count} في Database (الأخيرة)`);
      }
    }

    console.log('\n');

  } catch (error) {
    console.error(`\n❌ خطأ: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
    await closeDB();
  }

  // عرض الإحصائيات
  const elapsed = Math.round((Date.now() - startTime) / 1000);

  console.log('═'.repeat(60));
  console.log('📊 الإحصائيات النهائية:');
  console.log(`   📦 إجمالي الـ Datasets: ${formatNumber(stats.total)}`);
  console.log(`   ✅ مع Resources: ${formatNumber(stats.withResources)} (${Math.round(stats.withResources/stats.total*100)}%)`);
  console.log(`   ❌ بدون Resources: ${formatNumber(stats.withoutResources)}`);
  console.log(`   📁 إجمالي الملفات: ${formatNumber(stats.resourcesCount)}`);
  console.log(`   ⚠️ أخطاء: ${stats.errors}`);
  console.log(`   ⏱️ الوقت: ${formatTime(elapsed)}`);
  console.log('═'.repeat(60));
  console.log(`🗄️ تم الحفظ في: PostgreSQL Database (datasets table)`);
  console.log('═'.repeat(60));

  return results;
}

// ============ التشغيل ============

// للاختبار: جلب 10 فقط
if (process.argv.includes('--test')) {
  CONFIG.MAX_DATASETS = 10;
  console.log('🧪 وضع الاختبار: 10 datasets فقط\n');
}

syncWithResources()
  .then(() => {
    console.log('\n✅ تمت المزامنة!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ خطأ:', error.message);
    process.exit(1);
  });
