/**
 * جلب Top 100 Datasets مع بياناتها الكاملة
 * هذا السكربت يجلب أهم 100 dataset مع كل البيانات (CSV) لتحميل فوري
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../public/data/top-datasets');
const METADATA_FILE = path.join(__dirname, '../public/data/datasets.json');
const INDEX_FILE = path.join(OUTPUT_DIR, 'index.json');

// Top categories للأولوية
const TOP_CATEGORIES = [
  'الاقتصاد والمالية',
  'السكان والمجتمع',
  'الصحة',
  'التعليم',
  'العمل والتوظيف',
  'التجارة',
  'النقل',
  'البيئة',
];

async function main() {
  console.log('🚀 جلب Top 100 Datasets مع البيانات الكاملة...\n');

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Load existing datasets metadata
  let datasets = [];
  try {
    const data = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'));
    datasets = data.datasets || [];
    console.log(`📋 تم تحميل ${datasets.length} dataset من الفهرس\n`);
  } catch (e) {
    console.error('❌ لم يتم العثور على datasets.json');
    console.log('شغّل fetch-all-datasets.cjs أولاً');
    process.exit(1);
  }

  if (datasets.length === 0) {
    console.error('❌ لا توجد datasets في الفهرس');
    process.exit(1);
  }

  // Sort by priority (categories and recent updates)
  datasets.sort((a, b) => {
    const aCategory = TOP_CATEGORIES.indexOf(a.category);
    const bCategory = TOP_CATEGORIES.indexOf(b.category);

    if (aCategory !== -1 && bCategory === -1) return -1;
    if (aCategory === -1 && bCategory !== -1) return 1;
    if (aCategory !== -1 && bCategory !== -1) return aCategory - bCategory;

    // Sort by update date
    return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
  });

  // Take top 100
  const topDatasets = datasets.slice(0, 100);
  console.log(`📊 جلب بيانات ${topDatasets.length} dataset...\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  const successfulDatasets = [];
  let processed = 0;

  for (const dataset of topDatasets) {
    processed++;
    const progress = Math.round((processed / topDatasets.length) * 100);
    process.stdout.write(`\r📥 ${processed}/${topDatasets.length} (${progress}%) - ${dataset.titleAr?.substring(0, 30) || dataset.id}...`);

    try {
      // Navigate to dataset page
      const datasetUrl = `https://open.data.gov.sa/ar/datasets/view/${dataset.id}`;

      await page.goto(datasetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 20000,
      });

      await new Promise(r => setTimeout(r, 2000));

      // Extract resources from page
      const resources = await page.evaluate(() => {
        const resourceElements = document.querySelectorAll('[class*="resource"], [class*="download"], a[href*=".csv"], a[href*=".xlsx"], a[href*=".json"]');
        const resources = [];

        resourceElements.forEach(el => {
          const href = el.getAttribute('href');
          if (href && (href.includes('.csv') || href.includes('.xlsx') || href.includes('.json') || href.includes('/download/'))) {
            resources.push({
              url: href.startsWith('http') ? href : `https://open.data.gov.sa${href}`,
              format: href.includes('.csv') ? 'CSV' : href.includes('.xlsx') ? 'XLSX' : href.includes('.json') ? 'JSON' : 'OTHER',
            });
          }
        });

        // Also check for download buttons
        document.querySelectorAll('button, a').forEach(el => {
          const onclick = el.getAttribute('onclick') || '';
          const href = el.getAttribute('href') || '';

          if (onclick.includes('download') || href.includes('download')) {
            const match = onclick.match(/['"]([^'"]*\.(?:csv|xlsx|json))['"]/i) ||
                          href.match(/(.*\.(?:csv|xlsx|json))/i);
            if (match) {
              resources.push({
                url: match[1].startsWith('http') ? match[1] : `https://open.data.gov.sa${match[1]}`,
                format: match[1].toLowerCase().includes('.csv') ? 'CSV' : 'XLSX',
              });
            }
          }
        });

        return resources;
      });

      // Find CSV resource
      const csvResource = resources.find(r => r.format === 'CSV') || resources[0];

      if (csvResource?.url) {
        // Download and save CSV data
        try {
          const response = await page.goto(csvResource.url, {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
          });

          if (response && response.ok()) {
            const content = await response.text();

            // Parse CSV to JSON
            const lines = content.split('\n').filter(l => l.trim());
            if (lines.length > 1) {
              const headers = parseCSVLine(lines[0]);
              const records = [];

              for (let i = 1; i < Math.min(lines.length, 10001); i++) { // Max 10000 records
                const values = parseCSVLine(lines[i]);
                if (values.length === headers.length) {
                  const record = {};
                  headers.forEach((h, idx) => {
                    record[h.trim()] = values[idx]?.trim() || '';
                  });
                  records.push(record);
                }
              }

              if (records.length > 0) {
                // Save to file
                const outputFile = path.join(OUTPUT_DIR, `${dataset.id}.json`);
                const dataToSave = {
                  id: dataset.id,
                  titleAr: dataset.titleAr,
                  titleEn: dataset.titleEn,
                  columns: headers,
                  totalRecords: records.length,
                  fetchedAt: new Date().toISOString(),
                  records: records,
                };

                fs.writeFileSync(outputFile, JSON.stringify(dataToSave, null, 2));

                successfulDatasets.push({
                  id: dataset.id,
                  titleAr: dataset.titleAr,
                  titleEn: dataset.titleEn,
                  category: dataset.category,
                  recordCount: records.length,
                  columns: headers,
                });

                console.log(`\n   ✅ ${dataset.id}: ${records.length} records saved`);
              }
            }
          }
        } catch (e) {
          // Silent fail for individual downloads
        }
      }

      // Small delay between requests
      await new Promise(r => setTimeout(r, 1000));

    } catch (e) {
      // Silent fail, continue to next
    }
  }

  await browser.close();

  // Save index file
  const indexData = {
    fetchedAt: new Date().toISOString(),
    total: successfulDatasets.length,
    datasets: successfulDatasets,
  };

  fs.writeFileSync(INDEX_FILE, JSON.stringify(indexData, null, 2));

  console.log(`\n\n✅ تم حفظ ${successfulDatasets.length} dataset بنجاح`);
  console.log(`📁 المجلد: public/data/top-datasets/`);
}

// Simple CSV line parser
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

main().catch(console.error);
