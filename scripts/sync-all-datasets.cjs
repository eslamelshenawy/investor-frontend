/**
 * مزامنة جميع الـ Datasets من البوابة الوطنية
 * يستخدم Puppeteer للحصول على Cookies + List API لجلب البيانات
 *
 * المميزات:
 * - يتجاوز WAF باستخدام متصفح حقيقي
 * - يجلب 100 dataset في الطلب الواحد (سريع جداً)
 * - يحفظ البيانات مع الأقسام والجهات المصدرة
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ============ الإعدادات ============
const CONFIG = {
  BASE_URL: 'https://open.data.gov.sa',
  OUTPUT_FILE: path.join(__dirname, '../public/data/datasets.json'),
  CATEGORIES_FILE: path.join(__dirname, '../public/data/categories.json'),
  PAGE_SIZE: 100,
  MAX_RETRIES: 3,
  DELAY_BETWEEN_PAGES: 1500,
  DELAY_ON_ERROR: 5000,
};

// ============ المتغيرات العامة ============
let browser = null;
let page = null;
let cookies = '';
let deviceFingerprint = '';

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

// ============ الحصول على Cookies ============

async function getCookies() {
  console.log('🌐 فتح المتصفح للحصول على Cookies...\n');

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

  // التقاط device_fingerprint من الطلبات
  page.on('request', (request) => {
    const headers = request.headers();
    if (headers['x-device-fingerprint']) {
      deviceFingerprint = headers['x-device-fingerprint'];
    }
  });

  console.log('   📡 تحميل صفحة البوابة الوطنية...');

  await page.goto(`${CONFIG.BASE_URL}/ar/datasets`, {
    waitUntil: 'networkidle2',
    timeout: 60000,
  });

  // انتظار تحميل الصفحة بالكامل
  await delay(3000);

  // التمرير لتفعيل كل الـ scripts
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight / 2);
  });
  await delay(2000);

  // الحصول على الكوكيز
  const allCookies = await page.cookies();
  cookies = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

  // محاولة الحصول على device_fingerprint من الكوكيز
  const fpCookie = allCookies.find(c => c.name === 'device_fingerprint');
  if (fpCookie) {
    deviceFingerprint = fpCookie.value;
  }

  // إذا لم نحصل على fingerprint، نولد واحد
  if (!deviceFingerprint) {
    deviceFingerprint = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  console.log(`   ✅ تم الحصول على ${allCookies.length} cookies`);
  console.log(`   🔑 Device Fingerprint: ${deviceFingerprint.substring(0, 16)}...`);

  return { cookies, deviceFingerprint };
}

// ============ جلب صفحة من API ============

async function fetchPage(pageNum, retryCount = 0) {
  const url = `${CONFIG.BASE_URL}/api/datasets/list?size=${CONFIG.PAGE_SIZE}&page=${pageNum}&sort=updatedAt,DESC`;

  const headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'ar',
    'content-language': 'ar',
    'content-type': 'application/json',
    'cookie': cookies,
    'origin': CONFIG.BASE_URL,
    'referer': `${CONFIG.BASE_URL}/ar/datasets`,
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
    tags: [],
    publishers: [],
    formats: [],
    categories: [],
    languages: [],
    datasetTypes: [],
    publishDate: { fromDate: null, toDate: null }
  });

  try {
    const response = await page.evaluate(async (url, headers, body) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      return await res.json();
    }, url, headers, body);

    return response;

  } catch (error) {
    if (retryCount < CONFIG.MAX_RETRIES) {
      console.log(`   ⚠️ خطأ في صفحة ${pageNum}، محاولة ${retryCount + 1}/${CONFIG.MAX_RETRIES}...`);
      await delay(CONFIG.DELAY_ON_ERROR);
      return fetchPage(pageNum, retryCount + 1);
    }
    throw error;
  }
}

// ============ استخراج بيانات Dataset ============

function extractDataset(item) {
  // استخراج الموارد
  const resources = (item.resources || []).map(r => ({
    id: r.id || r.resourceID || '',
    name: r.titleAr || r.titleEn || r.title || r.name || 'Resource',
    format: (r.fileFormat || r.format || '').toUpperCase(),
    url: r.downloadUrl || r.url || '',
    size: r.size || 0,
  }));

  // استخراج الأقسام
  const categories = (item.categories || []).map(c => ({
    id: c.categoryID || c.id || '',
    titleAr: c.titleAr || c.title || '',
    titleEn: c.titleEn || '',
  }));

  return {
    id: item.datasetID || item.id,
    titleAr: item.titleAr || item.title || '',
    titleEn: item.titleEn || '',
    descriptionAr: item.descriptionAr || item.description || '',
    descriptionEn: item.descriptionEn || '',
    category: categories[0]?.titleAr || item.category?.titleAr || '',
    categoryId: categories[0]?.id || item.category?.categoryID || '',
    categories: categories,
    organization: item.publisherNameAr || item.organization?.titleAr || item.provider?.titleAr || '',
    organizationEn: item.publisherNameEn || item.organization?.titleEn || '',
    publisherId: item.publisherId || item.organization?.id || '',
    updatedAt: item.updatedAt || item.updateDate || '',
    createdAt: item.createdAt || item.publishDate || '',
    viewsCount: item.viewsCount || 0,
    downloadsCount: item.downloadsCount || 0,
    resourcesCount: resources.length || item.resourcesCount || 0,
    resources: resources,
    tags: item.tags || [],
    license: item.license || '',
    sourceUrl: `${CONFIG.BASE_URL}/ar/datasets/view/${item.datasetID || item.id}`,
  };
}

// ============ جلب الأقسام ============

async function fetchCategories() {
  console.log('\n📁 جلب قائمة الأقسام...');

  try {
    const url = `${CONFIG.BASE_URL}/api/categories`;

    const response = await page.evaluate(async (url) => {
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    }, url);

    if (Array.isArray(response)) {
      const categories = response.map(c => ({
        categoryID: c.categoryID || c.id,
        titleAr: c.titleAr || c.title,
        titleEn: c.titleEn || '',
        name: c.name || '',
        descriptionAr: c.descriptionAr || c.description || '',
        descriptionEn: c.descriptionEn || '',
        noDatasets: c.noDatasets || c.datasetsCount || 0,
      }));

      // حفظ الأقسام
      fs.writeFileSync(CONFIG.CATEGORIES_FILE, JSON.stringify(categories, null, 2));
      console.log(`   ✅ تم حفظ ${categories.length} قسم`);

      // حساب إجمالي الـ datasets
      const totalFromCategories = categories.reduce((sum, c) => sum + (c.noDatasets || 0), 0);
      console.log(`   📊 إجمالي الـ Datasets (من الأقسام): ${formatNumber(totalFromCategories)}`);

      return categories;
    }

    return [];
  } catch (error) {
    console.log(`   ⚠️ فشل جلب الأقسام: ${error.message}`);
    return [];
  }
}

// ============ المزامنة الرئيسية ============

async function syncAllDatasets() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚀 مزامنة جميع الـ Datasets من البوابة الوطنية');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const startTime = Date.now();
  const allDatasets = new Map();
  let totalInAPI = 0;
  let totalPages = 0;
  let errors = 0;
  let consecutiveErrors = 0;

  try {
    // 1. الحصول على Cookies
    await getCookies();

    // 2. جلب الأقسام
    await fetchCategories();

    // 3. جلب الصفحة الأولى لمعرفة العدد الإجمالي
    console.log('\n📡 جلب معلومات الـ API...');
    const firstPage = await fetchPage(0);

    if (!firstPage || !firstPage.content) {
      throw new Error('فشل جلب الصفحة الأولى');
    }

    totalInAPI = firstPage.totalElements || 0;
    totalPages = firstPage.totalPages || Math.ceil(totalInAPI / CONFIG.PAGE_SIZE);

    console.log(`   📊 إجمالي الـ Datasets: ${formatNumber(totalInAPI)}`);
    console.log(`   📄 عدد الصفحات: ${formatNumber(totalPages)}`);
    console.log(`   📦 حجم الصفحة: ${CONFIG.PAGE_SIZE}`);

    // معالجة الصفحة الأولى
    for (const item of firstPage.content) {
      const dataset = extractDataset(item);
      allDatasets.set(dataset.id, dataset);
    }

    console.log(`\n📥 بدء جلب البيانات...\n`);

    // 4. جلب باقي الصفحات
    for (let pageNum = 1; pageNum < totalPages && consecutiveErrors < 5; pageNum++) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const count = allDatasets.size;
      const progress = Math.round((count / totalInAPI) * 100);
      const speed = count > 0 ? Math.round(count / (elapsed / 60)) : 0;
      const eta = speed > 0 ? Math.round((totalInAPI - count) / speed) : 0;

      process.stdout.write(
        `\r   📄 ${pageNum + 1}/${totalPages} | ` +
        `📦 ${formatNumber(count)}/${formatNumber(totalInAPI)} | ` +
        `📈 ${progress}% | ` +
        `⚡ ${formatNumber(speed)}/د | ` +
        `⏱️ ${formatTime(elapsed)} | ` +
        `ETA: ${eta}د     `
      );

      try {
        const pageData = await fetchPage(pageNum);

        if (pageData && pageData.content && Array.isArray(pageData.content)) {
          for (const item of pageData.content) {
            const dataset = extractDataset(item);
            allDatasets.set(dataset.id, dataset);
          }
          consecutiveErrors = 0;
        } else {
          consecutiveErrors++;
        }

        // تأخير بين الطلبات
        await delay(CONFIG.DELAY_BETWEEN_PAGES);

      } catch (error) {
        errors++;
        consecutiveErrors++;
        console.log(`\n   ❌ خطأ في صفحة ${pageNum}: ${error.message}`);

        if (consecutiveErrors >= 5) {
          console.log('\n   ⚠️ أخطاء متتالية كثيرة، تحديث الـ Cookies...');

          // محاولة تحديث الـ Cookies
          await page.reload({ waitUntil: 'networkidle2' });
          await delay(3000);
          const allCookies = await page.cookies();
          cookies = allCookies.map(c => `${c.name}=${c.value}`).join('; ');
          consecutiveErrors = 0;
        }

        await delay(CONFIG.DELAY_ON_ERROR);
      }

      // حفظ كل 50 صفحة
      if (pageNum % 50 === 0) {
        saveProgress(allDatasets, false);
      }
    }

    console.log('\n');

  } catch (error) {
    console.log(`\n❌ خطأ رئيسي: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // حفظ النتيجة النهائية
  saveProgress(allDatasets, true);

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  const finalCount = allDatasets.size;

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 النتائج النهائية:');
  console.log(`   ✅ تم جلب: ${formatNumber(finalCount)} dataset`);
  console.log(`   🎯 من أصل: ${formatNumber(totalInAPI)} في API`);
  console.log(`   📈 النسبة: ${Math.round((finalCount / totalInAPI) * 100)}%`);
  console.log(`   ⏱️ الوقت: ${formatTime(elapsed)}`);
  console.log(`   ❌ الأخطاء: ${errors}`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`📁 الملف: public/data/datasets.json`);
  console.log('═══════════════════════════════════════════════════════════════');

  return {
    success: finalCount > 0,
    total: finalCount,
    expected: totalInAPI,
    errors,
    duration: elapsed
  };
}

// ============ حفظ البيانات ============

function saveProgress(datasetsMap, isFinal) {
  const outputDir = path.dirname(CONFIG.OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const datasets = Array.from(datasetsMap.values());

  // ترتيب حسب تاريخ التحديث
  datasets.sort((a, b) => {
    const dateA = new Date(a.updatedAt || 0);
    const dateB = new Date(b.updatedAt || 0);
    return dateB - dateA;
  });

  const output = {
    fetchedAt: new Date().toISOString(),
    total: datasets.length,
    status: isFinal ? 'complete' : 'in_progress',
    datasets: datasets,
  };

  fs.writeFileSync(CONFIG.OUTPUT_FILE, JSON.stringify(output, null, 2));

  if (!isFinal) {
    console.log(`\n   💾 حفظ مؤقت: ${formatNumber(datasets.length)} datasets`);
  }
}

// ============ التشغيل ============

syncAllDatasets()
  .then(result => {
    if (result.success) {
      console.log('\n✅ تمت المزامنة بنجاح!');
      process.exit(0);
    } else {
      console.log('\n⚠️ المزامنة انتهت مع مشاكل');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ خطأ:', error.message);
    process.exit(1);
  });
