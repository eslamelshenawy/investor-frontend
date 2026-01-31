/**
 * جلب كل الـ 11,500+ Datasets من البوابة الوطنية
 * يستخرج البيانات من HTML + API معاً
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../public/data/datasets.json');
const TOTAL_EXPECTED = 11500; // العدد المتوقع
const DATASETS_PER_PAGE = 12;
const MAX_PAGES = Math.ceil(TOTAL_EXPECTED / DATASETS_PER_PAGE) + 50; // ~1000 صفحة

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 جلب كل الـ Datasets من البوابة الوطنية');
  console.log('═══════════════════════════════════════════════════════\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  const page = await browser.newPage();

  // User agent حقيقي
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  );

  // Set extra headers
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'ar,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  });

  const allDatasets = new Map();
  let consecutiveErrors = 0;
  let totalPages = MAX_PAGES;

  // Block unnecessary resources
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const type = request.resourceType();
    if (['image', 'stylesheet', 'font', 'media', 'other'].includes(type)) {
      request.abort();
    } else {
      request.continue();
    }
  });

  // Capture API responses
  page.on('response', async (response) => {
    const url = response.url();

    // التقاط API البيانات
    if (url.includes('/api/') && url.includes('datasets')) {
      try {
        const text = await response.text();
        if (text && !text.startsWith('<') && text.includes('"datasetID"')) {
          const data = JSON.parse(text);

          // استخراج من content array
          const items = data.content || data.results || data.data || [];
          if (Array.isArray(items)) {
            items.forEach(d => {
              if (d.datasetID || d.id) {
                allDatasets.set(d.datasetID || d.id, d);
              }
            });
          }

          // تحديث العدد الكلي
          if (data.totalElements) {
            totalPages = Math.ceil(data.totalElements / DATASETS_PER_PAGE);
          }
        }
      } catch (e) {
        // تجاهل أخطاء الـ parsing
      }
    }
  });

  console.log(`📊 بدء جلب حتى ${TOTAL_EXPECTED} dataset...\n`);
  const startTime = Date.now();

  for (let pageNum = 0; pageNum < MAX_PAGES; pageNum++) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const count = allDatasets.size;
    const progress = Math.round((count / TOTAL_EXPECTED) * 100);
    const speed = count > 0 ? Math.round(count / (elapsed / 60)) : 0;

    process.stdout.write(
      `\r⏳ صفحة ${pageNum + 1}/${totalPages} | ` +
      `📦 ${count.toLocaleString()} dataset | ` +
      `📈 ${progress}% | ` +
      `⚡ ${speed}/دقيقة | ` +
      `⏱️ ${Math.floor(elapsed/60)}:${(elapsed%60).toString().padStart(2,'0')}     `
    );

    try {
      // Navigate to page
      const response = await page.goto(
        `https://open.data.gov.sa/ar/datasets?page=${pageNum}`,
        {
          waitUntil: 'networkidle2',
          timeout: 30000,
        }
      );

      // Check if blocked
      if (response && response.status() === 403) {
        console.log('\n⚠️ تم الحظر مؤقتاً، انتظار...');
        await new Promise(r => setTimeout(r, 10000));
        continue;
      }

      // استخراج البيانات من HTML
      const extractedData = await page.evaluate(() => {
        const datasets = [];

        // البحث عن كروت الـ datasets
        const cards = document.querySelectorAll('[class*="card"], [class*="dataset"], article, .list-item');

        cards.forEach(card => {
          // استخراج الرابط والـ ID
          const link = card.querySelector('a[href*="/datasets/view/"]');
          if (link) {
            const href = link.getAttribute('href') || '';
            const idMatch = href.match(/\/datasets\/view\/([a-f0-9-]{36})/i);

            if (idMatch) {
              const id = idMatch[1];
              const title = link.textContent?.trim() ||
                           card.querySelector('h2, h3, h4, .title')?.textContent?.trim() || '';
              const desc = card.querySelector('p, .description, .desc')?.textContent?.trim() || '';
              const category = card.querySelector('.category, .tag, .badge')?.textContent?.trim() || '';
              const org = card.querySelector('.org, .organization, .provider')?.textContent?.trim() || '';

              datasets.push({ id, title, desc, category, org });
            }
          }
        });

        // طريقة بديلة - البحث عن كل الروابط
        if (datasets.length === 0) {
          const links = document.querySelectorAll('a[href*="/datasets/view/"]');
          const seenIds = new Set();

          links.forEach(link => {
            const href = link.getAttribute('href') || '';
            const idMatch = href.match(/\/datasets\/view\/([a-f0-9-]{36})/i);

            if (idMatch && !seenIds.has(idMatch[1])) {
              seenIds.add(idMatch[1]);
              datasets.push({
                id: idMatch[1],
                title: link.textContent?.trim() || '',
                desc: '',
                category: '',
                org: '',
              });
            }
          });
        }

        return datasets;
      });

      // إضافة البيانات المستخرجة
      extractedData.forEach(d => {
        if (d.id && !allDatasets.has(d.id)) {
          allDatasets.set(d.id, {
            datasetID: d.id,
            titleAr: d.title,
            descriptionAr: d.desc,
            categoryTitleAr: d.category,
            providerNameAr: d.org,
          });
        }
      });

      consecutiveErrors = 0;

      // حفظ كل 50 صفحة
      if ((pageNum + 1) % 50 === 0) {
        saveProgress(allDatasets, false);
      }

      // توقف إذا جلبنا كل البيانات
      if (allDatasets.size >= TOTAL_EXPECTED - 100) {
        console.log('\n\n✅ تم جلب معظم البيانات!');
        break;
      }

      // توقف إذا لم نجد بيانات جديدة لـ 20 صفحة متتالية
      if (extractedData.length === 0) {
        consecutiveErrors++;
        if (consecutiveErrors >= 20) {
          console.log('\n\n⚠️ لا توجد بيانات جديدة، توقف.');
          break;
        }
      }

      // تأخير عشوائي لتجنب الحظر
      const delay = 500 + Math.random() * 1000;
      await new Promise(r => setTimeout(r, delay));

    } catch (e) {
      consecutiveErrors++;
      if (consecutiveErrors >= 10) {
        console.log('\n⚠️ أخطاء متكررة، انتظار 30 ثانية...');
        await new Promise(r => setTimeout(r, 30000));
        consecutiveErrors = 0;
      }
    }
  }

  await browser.close();

  // حفظ النتيجة النهائية
  saveProgress(allDatasets, true);

  const finalCount = allDatasets.size;
  const elapsed = Math.round((Date.now() - startTime) / 1000);

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ تم حفظ ${finalCount.toLocaleString()} مجموعة بيانات`);
  console.log(`⏱️ الوقت: ${Math.floor(elapsed/60)} دقيقة`);
  console.log(`📁 الملف: public/data/datasets.json`);
  console.log('═══════════════════════════════════════════════════════');
}

function saveProgress(datasetsMap, isFinal) {
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const datasets = Array.from(datasetsMap.values());

  const formatted = datasets.map(d => ({
    id: d.datasetID || d.id,
    titleAr: d.titleAr || '',
    titleEn: d.titleEn || '',
    descriptionAr: d.descriptionAr || '',
    descriptionEn: d.descriptionEn || '',
    category: d.categoryTitleAr || d.category || '',
    organization: d.providerNameAr || d.organization || '',
    updatedAt: d.updateDate || '',
    resources: (d.resources || []).map(r => ({
      id: r.resourceID || r.id,
      name: r.titleAr || r.name || 'Resource',
      format: (r.fileFormat || '').toUpperCase(),
      url: r.downloadUrl || '',
    })),
  }));

  const output = {
    fetchedAt: new Date().toISOString(),
    total: formatted.length,
    status: isFinal ? 'complete' : 'in_progress',
    datasets: formatted,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  if (!isFinal) {
    console.log(`\n💾 حفظ مؤقت: ${formatted.length} datasets\n`);
  }
}

main().catch(err => {
  console.error('\n❌ خطأ:', err.message);
  process.exit(1);
});
