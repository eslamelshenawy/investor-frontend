/**
 * جلب كل الـ Datasets باستخدام Puppeteer (متصفح حقيقي)
 * يتجاوز WAF ويجلب كل الصفحات
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../public/data/datasets.json');
const BASE_URL = 'https://open.data.gov.sa/ar/datasets';

async function scrapeAllDatasets() {
  console.log('🚀 بدء جلب جميع الـ Datasets...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();

  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  const allDatasets = [];
  let pageNum = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${BASE_URL}?page=${pageNum}`;
    console.log(`📄 صفحة ${pageNum}: ${url}`);

    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 60000,
      });

      // Wait for datasets to load
      await page.waitForSelector('.dataset-item, .card, [class*="dataset"]', { timeout: 10000 }).catch(() => {});

      // Scroll to load lazy content
      await autoScroll(page);

      // Extract datasets from this page
      const pageDatasets = await page.evaluate(() => {
        const datasets = [];

        // Try different selectors
        const cards = document.querySelectorAll('.dataset-item, .package-item, .card');

        cards.forEach((card) => {
          // Get title
          const titleEl = card.querySelector('h3, h4, h5, .card-title, [class*="title"]');
          if (!titleEl) return;

          const title = titleEl.textContent?.trim() || '';
          if (!title || title.length < 5) return;

          // Get link and extract ID
          const linkEl = card.querySelector('a[href*="/datasets/"]');
          const href = linkEl?.getAttribute('href') || '';
          const idMatch = href.match(/\/datasets\/(?:view\/)?([a-f0-9-]+)/);
          const id = idMatch ? idMatch[1] : '';

          // Get description
          const descEl = card.querySelector('p, .card-text, [class*="desc"]');
          const description = descEl?.textContent?.trim() || '';

          // Get organization/source
          const orgEl = card.querySelector('[class*="org"], [class*="provider"], .text-muted');
          const organization = orgEl?.textContent?.trim() || '';

          // Get category
          const catEl = card.querySelector('[class*="category"], .badge');
          const category = catEl?.textContent?.trim() || '';

          // Get file count
          const filesMatch = description.match(/(\d+)\s*ملف/);
          const fileCount = filesMatch ? parseInt(filesMatch[1]) : 0;

          datasets.push({
            id: id || `temp-${datasets.length}`,
            titleAr: title,
            titleEn: title,
            descriptionAr: description.replace(/أضيفت.*ملفات?/, '').trim(),
            organization,
            category,
            fileCount,
            url: href.startsWith('http') ? href : `https://open.data.gov.sa${href}`,
          });
        });

        return datasets;
      });

      console.log(`   ✅ وجدنا ${pageDatasets.length} datasets`);

      if (pageDatasets.length === 0) {
        hasMore = false;
        break;
      }

      // Add unique datasets
      for (const ds of pageDatasets) {
        if (!allDatasets.find((d) => d.id === ds.id)) {
          allDatasets.push(ds);
        }
      }

      // Check if there's a next page
      const hasNextPage = await page.evaluate(() => {
        const nextBtn = document.querySelector('a[rel="next"], .pagination .next:not(.disabled), [aria-label="Next"]');
        return !!nextBtn;
      });

      if (!hasNextPage || pageNum >= 100) {
        hasMore = false;
      } else {
        pageNum++;
        await new Promise((r) => setTimeout(r, 1000)); // Delay between pages
      }
    } catch (error) {
      console.log(`   ❌ خطأ: ${error.message}`);
      hasMore = false;
    }
  }

  // Now fetch resources for each dataset
  console.log(`\n📦 جلب الـ Resources لـ ${allDatasets.length} dataset...`);

  let processed = 0;
  for (const dataset of allDatasets) {
    if (!dataset.url || dataset.url.includes('temp-')) continue;

    processed++;
    if (processed % 10 === 0) {
      console.log(`   معالجة ${processed}/${allDatasets.length}...`);
    }

    try {
      await page.goto(dataset.url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      const resources = await page.evaluate(() => {
        const res = [];
        const resourceLinks = document.querySelectorAll(
          'a[href*=".csv"], a[href*=".xlsx"], a[href*=".json"], a[href*=".xml"], a[href*="download"], .resource-item a'
        );

        resourceLinks.forEach((link) => {
          const href = link.getAttribute('href') || '';
          const name = link.textContent?.trim() || 'Resource';
          const format = href.match(/\.(csv|xlsx|json|xml|pdf)/i)?.[1]?.toUpperCase() || 'DATA';

          if (href && !res.find((r) => r.url === href)) {
            res.push({
              id: `res-${res.length}`,
              name,
              format,
              url: href.startsWith('http') ? href : `https://open.data.gov.sa${href}`,
            });
          }
        });

        return res;
      });

      dataset.resources = resources;

      // Small delay
      await new Promise((r) => setTimeout(r, 200));
    } catch {
      // Skip this dataset if error
    }
  }

  await browser.close();
  return allDatasets;
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight || totalHeight > 10000) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function main() {
  const startTime = Date.now();

  try {
    const datasets = await scrapeAllDatasets();

    if (!datasets || datasets.length === 0) {
      console.error('❌ لم يتم جلب أي بيانات');
      process.exit(1);
    }

    // Ensure directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save to JSON
    const output = {
      fetchedAt: new Date().toISOString(),
      total: datasets.length,
      datasets: datasets,
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n✅ تم حفظ ${datasets.length} dataset`);
    console.log(`📁 الملف: public/data/datasets.json`);
    console.log(`⏱️  الوقت: ${duration} ثانية`);
    console.log('\n📌 لرفع البيانات:');
    console.log('   git add public/data && git commit -m "Update datasets" && git push');
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

main();
