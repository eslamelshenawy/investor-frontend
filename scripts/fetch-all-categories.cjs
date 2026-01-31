/**
 * جلب كل الـ Datasets من جميع الأقسام
 * يستخدم صفحات الأقسام للتغلب على حدود API
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../public/data/datasets.json');
const CATEGORIES_FILE = path.join(__dirname, '../public/data/categories.json');

async function main() {
  console.log('🚀 جلب جميع الـ Datasets من كل الأقسام...\n');

  // Load categories
  if (!fs.existsSync(CATEGORIES_FILE)) {
    console.error('❌ يجب تشغيل fetch-via-browser.cjs أولاً لجلب الأقسام');
    process.exit(1);
  }

  const categories = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf-8'));
  const totalExpected = categories.reduce((sum, c) => sum + (c.noDatasets || 0), 0);

  console.log(`📂 عدد الأقسام: ${categories.length}`);
  console.log(`📊 إجمالي الـ Datasets المتوقع: ${totalExpected}\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  const allDatasets = new Map(); // Use Map to avoid duplicates by ID

  // Process each category
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const catName = category.name || category.categoryID;

    if (!category.noDatasets || category.noDatasets === 0) {
      continue;
    }

    console.log(`\n📁 [${i + 1}/${categories.length}] ${category.titleAr} (${category.noDatasets} datasets)`);

    try {
      // Go to category page
      const url = `https://open.data.gov.sa/ar/datasets?category=${catName}`;
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      // Wait for content
      await new Promise((r) => setTimeout(r, 3000));

      // Scroll to load more content
      let previousCount = 0;
      let scrollAttempts = 0;
      const maxScrolls = Math.min(Math.ceil(category.noDatasets / 10), 30);

      while (scrollAttempts < maxScrolls) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise((r) => setTimeout(r, 1500));

        const currentCount = await page.evaluate(
          () => document.querySelectorAll('[class*="dataset-card"], .card, article').length
        );

        if (currentCount === previousCount) {
          // Try clicking "Load More" button if exists
          const hasLoadMore = await page.evaluate(() => {
            const btn = document.querySelector('button[onclick*="load"], [class*="load-more"], .btn-load');
            if (btn) {
              btn.click();
              return true;
            }
            return false;
          });

          if (!hasLoadMore) break;
        }

        previousCount = currentCount;
        scrollAttempts++;
      }

      // Extract datasets from page
      const pageDatasets = await page.evaluate((catTitle) => {
        const datasets = [];
        const cards = document.querySelectorAll('.card, article, [class*="dataset"]');

        cards.forEach((card) => {
          const titleEl = card.querySelector('h2, h3, h4, h5, [class*="title"]');
          const title = titleEl?.textContent?.trim();
          if (!title || title.length < 5) return;

          const link = card.querySelector('a[href*="dataset"]');
          const href = link?.getAttribute('href') || '';
          const idMatch = href.match(/([a-f0-9-]{36})/);

          if (!idMatch) return;

          const descEl = card.querySelector('p, [class*="desc"]');

          datasets.push({
            id: idMatch[1],
            titleAr: title,
            titleEn: title,
            descriptionAr: descEl?.textContent?.trim() || '',
            category: catTitle,
            url: href.startsWith('http') ? href : `https://open.data.gov.sa${href}`,
          });
        });

        return datasets;
      }, category.titleAr);

      console.log(`   ✅ وجدنا ${pageDatasets.length} dataset`);

      // Add to map (deduplication by ID)
      pageDatasets.forEach((d) => {
        if (!allDatasets.has(d.id)) {
          allDatasets.set(d.id, d);
        }
      });

      console.log(`   📊 المجموع: ${allDatasets.size}`);
    } catch (error) {
      console.log(`   ❌ خطأ: ${error.message}`);
    }

    // Progress save every 10 categories
    if ((i + 1) % 10 === 0) {
      const tempOutput = {
        fetchedAt: new Date().toISOString(),
        total: allDatasets.size,
        status: 'in_progress',
        datasets: Array.from(allDatasets.values()),
      };
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(tempOutput, null, 2));
      console.log(`\n💾 حفظ مؤقت: ${allDatasets.size} datasets`);
    }
  }

  await browser.close();

  // Final save
  const output = {
    fetchedAt: new Date().toISOString(),
    total: allDatasets.size,
    datasets: Array.from(allDatasets.values()),
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n✅ تم حفظ ${allDatasets.size} مجموعة بيانات`);
  console.log(`📁 الملف: public/data/datasets.json`);
  console.log('\n📌 لرفع البيانات:');
  console.log('   git add public/data && git commit -m "Update datasets" && git push');
}

main().catch(console.error);
