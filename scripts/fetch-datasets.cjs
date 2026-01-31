/**
 * Script لجلب كل الـ Datasets من البوابة الوطنية وحفظها في JSON
 *
 * يتم تشغيله محلياً أو عبر GitHub Actions
 * node scripts/fetch-datasets.js
 */

const fs = require('fs');
const path = require('path');

const CKAN_BASE = 'https://open.data.gov.sa/api/3/action';
const OUTPUT_FILE = path.join(__dirname, '../public/data/datasets.json');
const BATCH_SIZE = 100;

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'ar,en;q=0.9',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      if (text.startsWith('<')) {
        throw new Error('Got HTML instead of JSON (WAF blocked)');
      }

      return JSON.parse(text);
    } catch (error) {
      console.log(`   ⚠️ Attempt ${i + 1} failed: ${error.message}`);
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 2000 * (i + 1)));
      }
    }
  }
  return null;
}

async function fetchAllDatasets() {
  console.log('🚀 بدء جلب الـ Datasets من البوابة الوطنية...\n');

  const allDatasets = [];
  let offset = 0;
  let total = 0;

  // First request to get total count
  const firstUrl = `${CKAN_BASE}/package_search?rows=${BATCH_SIZE}&start=0`;
  console.log(`📡 جلب الصفحة الأولى...`);

  const firstResponse = await fetchWithRetry(firstUrl);

  if (!firstResponse || !firstResponse.success) {
    console.error('❌ فشل في الاتصال بالـ API');
    console.log('\n💡 جرب تشغيل الـ Script من جهازك المحلي أو استخدم VPN');
    return null;
  }

  total = firstResponse.result.count;
  console.log(`✅ وجدنا ${total} dataset\n`);

  // Process first batch
  processResults(firstResponse.result.results, allDatasets);
  offset += BATCH_SIZE;

  // Fetch remaining pages
  while (offset < total) {
    const progress = Math.round((offset / total) * 100);
    console.log(`📥 جلب ${offset}/${total} (${progress}%)...`);

    const url = `${CKAN_BASE}/package_search?rows=${BATCH_SIZE}&start=${offset}`;
    const response = await fetchWithRetry(url);

    if (response && response.success) {
      processResults(response.result.results, allDatasets);
    }

    offset += BATCH_SIZE;

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  return allDatasets;
}

function processResults(results, allDatasets) {
  for (const item of results) {
    const dataset = {
      id: item.id || item.name,
      titleAr: item.title_ar || item.title || item.name || '',
      titleEn: item.title_en || item.title || item.name || '',
      descriptionAr: item.notes_ar || '',
      descriptionEn: item.notes_en || item.notes || '',
      category: item.groups?.[0]?.title || item.groups?.[0]?.name || '',
      organization: item.organization?.title || item.organization?.name || '',
      updatedAt: item.metadata_modified || '',
      resources: (item.resources || []).map(r => ({
        id: r.id,
        name: r.name || r.description || 'Resource',
        format: (r.format || '').toUpperCase(),
        url: r.url,
        size: r.size,
      })),
    };

    allDatasets.push(dataset);
  }
}

async function main() {
  const startTime = Date.now();

  const datasets = await fetchAllDatasets();

  if (!datasets) {
    process.exit(1);
  }

  // Create output directory
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

  console.log(`\n✅ تم حفظ ${datasets.length} dataset في:`);
  console.log(`   ${OUTPUT_FILE}`);
  console.log(`⏱️  الوقت: ${duration} ثانية`);
  console.log('\n📌 لتحديث البيانات على الموقع:');
  console.log('   git add . && git commit -m "Update datasets" && git push');
}

main().catch(console.error);
