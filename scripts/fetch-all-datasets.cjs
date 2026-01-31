/**
 * جلب كل الـ Datasets بسرعة عن طريق التنقل بين الصفحات
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../public/data/datasets.json');

async function main() {
  console.log('🚀 جلب جميع الـ Datasets...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  const allDatasets = new Map();
  let totalCount = 10000;

  // Intercept requests
  await page.setRequestInterception(true);

  page.on('request', (request) => {
    const url = request.url();

    // Block images and unnecessary resources for speed
    if (['image', 'stylesheet', 'font', 'media'].includes(request.resourceType())) {
      request.abort();
      return;
    }

    if (url.includes('/api/datasets/list')) {
      const headers = {
        ...request.headers(),
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };
      request.continue({ headers });
    } else {
      request.continue();
    }
  });

  // Capture responses
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/datasets/list')) {
      try {
        const text = await response.text();
        if (!text.startsWith('<') && text.length > 50) {
          const data = JSON.parse(text);
          if (data.content) {
            data.content.forEach(d => {
              allDatasets.set(d.datasetID, d);
            });
            totalCount = data.totalElements || totalCount;
          }
        }
      } catch (e) {
        // Ignore
      }
    }
  });

  // Navigate through pages
  const pageSize = 12;
  const totalPages = Math.ceil(totalCount / pageSize);

  console.log(`📊 جلب حتى ${totalCount} dataset...\n`);

  for (let pageNum = 0; pageNum < Math.min(totalPages, 850); pageNum++) {
    const count = allDatasets.size;
    const progress = Math.round((count / totalCount) * 100);

    process.stdout.write(`\r📄 صفحة ${pageNum + 1} | ${count}/${totalCount} (${progress}%)     `);

    try {
      await page.goto(`https://open.data.gov.sa/ar/datasets?page=${pageNum}`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      // Shorter wait
      await new Promise(r => setTimeout(r, 800));

    } catch (e) {
      // Continue on error
    }

    // Save progress every 100 pages
    if ((pageNum + 1) % 100 === 0) {
      saveProgress(Array.from(allDatasets.values()), false);
    }

    // Stop if we've collected enough
    if (allDatasets.size >= totalCount - 50) {
      console.log('\n✅ تم جلب معظم البيانات!');
      break;
    }
  }

  await browser.close();

  const datasets = Array.from(allDatasets.values());
  saveProgress(datasets, true);

  console.log(`\n\n✅ تم حفظ ${datasets.length} مجموعة بيانات`);
  console.log(`📁 الملف: public/data/datasets.json`);
}

function saveProgress(datasets, isFinal) {
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const formatted = datasets.map(d => ({
    id: d.datasetID || d.id,
    titleAr: d.titleAr || '',
    titleEn: d.titleEn || '',
    descriptionAr: d.descriptionAr || '',
    descriptionEn: d.descriptionEn || '',
    category: d.categoryTitleAr || '',
    organization: d.providerNameAr || '',
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
    console.log(`\n💾 حفظ: ${formatted.length} datasets\n`);
  }
}

main().catch(console.error);
