/**
 * اختبار: هل الـ API بيرجع resources؟
 * نجرب 3 datasets معروفين
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'https://open.data.gov.sa';

// 3 datasets للاختبار
const TEST_IDS = [
  '7818bf19-60b2-4fb2-841e-b3af43c4b3fa', // قائمة الادوية المسحوبة
  'f3dd2e38-296c-460b-bc42-b324cfd9b31d', // قائمة الدراسات السريرية
  'e2711904-bd53-4dd5-a0c3-ad90d96f11d9', // عدد السدود
];

async function testResources() {
  console.log('🧪 اختبار جلب الـ Resources\n');
  console.log('═'.repeat(60));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    for (let i = 0; i < TEST_IDS.length; i++) {
      const id = TEST_IDS[i];
      console.log(`\n📦 Dataset ${i + 1}/${TEST_IDS.length}`);
      console.log(`   ID: ${id}`);
      console.log('─'.repeat(60));

      // فتح صفحة تفاصيل الـ dataset
      console.log('   🌐 فتح صفحة التفاصيل...');
      await page.goto(`${BASE_URL}/ar/datasets/view/${id}`, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      await new Promise(r => setTimeout(r, 3000));

      // استخراج العنوان
      const title = await page.evaluate(() => {
        const h1 = document.querySelector('h1, .dataset-title, [class*="title"]');
        return h1 ? h1.textContent.trim() : 'N/A';
      });
      console.log(`   📄 العنوان: ${title.substring(0, 50)}...`);

      // استخراج الموارد من الصفحة
      const pageResources = await page.evaluate(() => {
        const resources = [];
        // البحث عن روابط التحميل
        const downloadLinks = document.querySelectorAll('a[href*="download"], a[href*=".csv"], a[href*=".xlsx"], a[href*=".xls"], a[href*=".json"], [class*="resource"] a, [class*="download"] a');
        downloadLinks.forEach(link => {
          const href = link.href || link.getAttribute('href');
          const text = link.textContent?.trim() || link.title || 'Resource';
          if (href && !resources.find(r => r.url === href)) {
            resources.push({
              name: text.substring(0, 50),
              url: href,
              format: href.match(/\.(csv|xlsx?|json|pdf|xml)/i)?.[1]?.toUpperCase() || '?'
            });
          }
        });
        return resources;
      });

      console.log(`\n   📋 من صفحة HTML:`);
      if (pageResources.length > 0) {
        console.log(`      ✅ ${pageResources.length} ملفات:`);
        pageResources.forEach((r, idx) => {
          console.log(`      ${idx + 1}. [${r.format}] ${r.name}`);
          console.log(`         ${r.url.substring(0, 70)}...`);
        });
      } else {
        console.log(`      ❌ لم نجد روابط تحميل`);
      }

      // جلب من API داخل الصفحة
      console.log(`\n   🔍 جلب من /api/datasets/${id.substring(0, 8)}...`);
      const apiResult = await page.evaluate(async (datasetId) => {
        try {
          const res = await fetch(`/api/datasets/${datasetId}`, {
            credentials: 'include',
            headers: { 'accept': 'application/json' }
          });
          if (!res.ok) return { error: res.status };
          return await res.json();
        } catch (e) {
          return { error: e.message };
        }
      }, id);

      if (apiResult.error) {
        console.log(`      ❌ خطأ: ${apiResult.error}`);
      } else {
        const apiResources = apiResult.resources || [];
        if (apiResources.length > 0) {
          console.log(`      ✅ ${apiResources.length} ملفات:`);
          apiResources.forEach((r, idx) => {
            console.log(`      ${idx + 1}. [${r.fileFormat || r.format || '?'}] ${r.titleAr || r.titleEn || r.name || 'Resource'}`);
            console.log(`         ${(r.downloadUrl || r.url || 'N/A').substring(0, 70)}...`);
          });
        } else {
          console.log(`      ❌ لا توجد resources`);
        }
      }

      // جلب من CKAN
      console.log(`\n   🔍 جلب من CKAN package_show...`);
      const ckanResult = await page.evaluate(async (datasetId) => {
        try {
          const res = await fetch(`/api/3/action/package_show?id=${datasetId}`, {
            credentials: 'include',
            headers: { 'accept': 'application/json' }
          });
          if (!res.ok) return { error: res.status };
          return await res.json();
        } catch (e) {
          return { error: e.message };
        }
      }, id);

      if (ckanResult.error) {
        console.log(`      ❌ خطأ: ${ckanResult.error}`);
      } else if (ckanResult.success && ckanResult.result) {
        const ckanResources = ckanResult.result.resources || [];
        if (ckanResources.length > 0) {
          console.log(`      ✅ ${ckanResources.length} ملفات:`);
          ckanResources.forEach((r, idx) => {
            console.log(`      ${idx + 1}. [${r.format || '?'}] ${r.name || r.description || 'Resource'}`);
            console.log(`         ${(r.url || 'N/A').substring(0, 70)}...`);
          });
        } else {
          console.log(`      ❌ لا توجد resources`);
        }
      } else {
        console.log(`      ❌ لا توجد نتائج`);
      }

      console.log('');
    }

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await browser.close();
  }

  console.log('═'.repeat(60));
  console.log('✅ انتهى الاختبار');
}

testResources();
