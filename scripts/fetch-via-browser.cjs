/**
 * جلب البيانات عبر المتصفح - يعمل حتى مع WAF
 * يستخدم Puppeteer لتجاوز الحماية
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../public/data/datasets.json');

async function fetchViaPage(page, url) {
  return await page.evaluate(async (apiUrl) => {
    try {
      const response = await fetch(apiUrl, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        return { error: `HTTP ${response.status}` };
      }
      const text = await response.text();
      if (text.startsWith('<')) {
        return { error: 'Got HTML (WAF blocked)' };
      }
      return JSON.parse(text);
    } catch (e) {
      return { error: e.message };
    }
  }, url);
}

async function main() {
  console.log('🚀 جلب البيانات عبر المتصفح...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  // First load the main page to get cookies
  console.log('📄 تحميل الصفحة الرئيسية...');
  await page.goto('https://open.data.gov.sa/ar/datasets', {
    waitUntil: 'networkidle0',
    timeout: 60000,
  });

  console.log('✅ تم تحميل الصفحة\n');

  // Fetch categories first
  console.log('📂 جلب الأقسام...');
  const categories = await fetchViaPage(page, 'https://open.data.gov.sa/api/categories');

  if (categories.error) {
    console.log(`   ❌ خطأ: ${categories.error}`);
  } else {
    console.log(`   ✅ وجدنا ${categories.length} قسم`);
    fs.writeFileSync(
      path.join(__dirname, '../public/data/categories.json'),
      JSON.stringify(categories, null, 2)
    );
  }

  // Try to fetch datasets - multiple attempts with different parameters
  console.log('\n📊 جلب مجموعات البيانات...');

  const allDatasets = [];
  let pageNum = 0;
  let hasMore = true;
  const pageSize = 100;

  while (hasMore && pageNum < 50) {
    const url = `https://open.data.gov.sa/api/datasets/list?size=${pageSize}&page=${pageNum}&sort=updatedAt,DESC`;
    console.log(`   صفحة ${pageNum + 1}...`);

    const result = await fetchViaPage(page, url);

    if (result.error) {
      console.log(`   ⚠️ ${result.error}`);
      // Try alternative URL format
      const altUrl = `https://open.data.gov.sa/api/datasets?size=${pageSize}&page=${pageNum}`;
      const altResult = await fetchViaPage(page, altUrl);
      if (altResult.error) {
        console.log(`   ⚠️ Alternative also failed: ${altResult.error}`);
        hasMore = false;
      } else if (Array.isArray(altResult)) {
        altResult.forEach((d) => allDatasets.push(d));
        console.log(`   ✅ وجدنا ${altResult.length} (المجموع: ${allDatasets.length})`);
        if (altResult.length < pageSize) hasMore = false;
        pageNum++;
      } else if (altResult.content) {
        altResult.content.forEach((d) => allDatasets.push(d));
        console.log(`   ✅ وجدنا ${altResult.content.length} (المجموع: ${allDatasets.length})`);
        hasMore = !altResult.last;
        pageNum++;
      } else {
        hasMore = false;
      }
    } else if (Array.isArray(result)) {
      result.forEach((d) => allDatasets.push(d));
      console.log(`   ✅ وجدنا ${result.length} (المجموع: ${allDatasets.length})`);
      if (result.length < pageSize) hasMore = false;
      pageNum++;
    } else if (result.content) {
      result.content.forEach((d) => allDatasets.push(d));
      console.log(`   ✅ وجدنا ${result.content.length} (المجموع: ${allDatasets.length})`);
      hasMore = !result.last;
      pageNum++;
    } else {
      console.log('   ⚠️ Unexpected response format');
      hasMore = false;
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  // If API failed, try scraping from the page
  if (allDatasets.length === 0) {
    console.log('\n🔄 API failed, trying to scrape from page...');

    // Try scrolling to load more
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise((r) => setTimeout(r, 2000));
    }

    const scrapedData = await page.evaluate(() => {
      const datasets = [];
      // Try to find dataset elements
      const items = document.querySelectorAll('[class*="dataset"], .card, article');

      items.forEach((item) => {
        const titleEl = item.querySelector('h2, h3, h4, [class*="title"]');
        const title = titleEl?.textContent?.trim();
        if (!title || title.length < 5) return;

        const link = item.querySelector('a[href*="dataset"]');
        const href = link?.getAttribute('href') || '';
        const idMatch = href.match(/([a-f0-9-]{36})/);

        datasets.push({
          id: idMatch ? idMatch[1] : `scraped-${datasets.length}`,
          titleAr: title,
          titleEn: title,
          url: href.startsWith('http') ? href : `https://open.data.gov.sa${href}`,
        });
      });

      return datasets;
    });

    scrapedData.forEach((d) => allDatasets.push(d));
    console.log(`   وجدنا ${scrapedData.length} من الصفحة`);
  }

  await browser.close();

  // Transform and save
  const formattedDatasets = allDatasets.map((d) => ({
    id: d.id || d.datasetID,
    titleAr: d.titleAr || d.title || '',
    titleEn: d.titleEn || d.title || '',
    descriptionAr: d.descriptionAr || d.description || '',
    descriptionEn: d.descriptionEn || '',
    category: d.category || '',
    organization: d.providerNameAr || d.organization || '',
    updatedAt: d.updatedAt || d.updateDate || '',
    resources: (d.resources || []).map((r) => ({
      id: r.id || r.resourceID,
      name: r.name || r.titleAr || 'Resource',
      format: (r.format || r.fileFormat || '').toUpperCase(),
      url: r.url || r.downloadUrl || '',
    })),
  }));

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const output = {
    fetchedAt: new Date().toISOString(),
    total: formattedDatasets.length,
    datasets: formattedDatasets,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n✅ تم حفظ ${formattedDatasets.length} مجموعة بيانات`);
  console.log(`📁 الملف: public/data/datasets.json`);

  if (!Array.isArray(categories) && !categories.error) {
    console.log(`📁 الأقسام: public/data/categories.json`);
  }
}

main().catch(console.error);
