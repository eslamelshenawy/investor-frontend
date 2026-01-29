/**
 * اختبار شامل لخدمة منصة البيانات المفتوحة السعودية
 * شغّل بـ: node test-open-data.mjs
 */

const OPEN_DATA_BASE_URL = 'https://open.data.gov.sa/data/api';

// قائمة مختارة من الـ datasets للاختبار (من كل تصنيف)
const TEST_DATASETS = [
  { id: '4b7b45cb-e8b2-4864-a80d-6d9110865b99', name: 'العمل الحر 2024' },
  { id: '1e7e8621-fd39-42fb-b78f-3c50b0be4f2e', name: 'المؤشر العقاري' },
  { id: '6d54ae82-7736-4ccf-b662-31844233f5b5', name: 'ثقة المستفيدين' },
  { id: '38ef9473-f5f4-4fbf-83a7-1a4bf0c7ccec', name: 'مزادات العقارات' },
  { id: 'b22e5e7c-2183-4115-bcd3-d6b955f24137', name: 'الحلول التمويلية' },
];

// التصنيفات المتاحة
const CATEGORIES = [
  'عقارات', 'تملك', 'مزادات', 'قرارات', 'عمليات',
  'صندوق التنمية', 'دعم سكني', 'عقود', 'إقامة مميزة',
  'أوقاف', 'عمل حر', 'تسجيل عيني', 'وساطة', 'إيجارات', 'خدمات'
];

async function fetchDataset(datasetId) {
  const url = `${OPEN_DATA_BASE_URL}/datasets?version=-1&dataset=${datasetId}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const data = await response.json();
  if (!data || Object.keys(data).length === 0) {
    throw new Error('Empty response');
  }

  return data;
}

async function testMultipleDatasets() {
  console.log('═'.repeat(70));
  console.log('   اختبار خدمة منصة البيانات المفتوحة السعودية');
  console.log('   Saudi Open Data Platform API Test');
  console.log('═'.repeat(70));
  console.log('');

  let successCount = 0;
  let failCount = 0;

  for (const dataset of TEST_DATASETS) {
    process.stdout.write(`جاري اختبار: ${dataset.name}... `);

    try {
      const data = await fetchDataset(dataset.id);
      console.log('✅ نجح');
      successCount++;

      // عرض معلومات مختصرة
      console.log(`   ├─ العنوان: ${data.titleAr}`);
      console.log(`   ├─ المزود: ${data.providerNameAr}`);
      console.log(`   └─ التحديث: ${data.updateFrequency}`);
      console.log('');

    } catch (error) {
      console.log(`❌ فشل: ${error.message}`);
      failCount++;
    }
  }

  console.log('─'.repeat(70));
  console.log(`\n📊 النتيجة: ${successCount}/${TEST_DATASETS.length} نجح`);

  if (failCount === 0) {
    console.log('✅ جميع الاختبارات نجحت!');
  } else {
    console.log(`⚠️ ${failCount} اختبار فشل`);
  }

  console.log('\n📁 التصنيفات المتاحة:');
  CATEGORIES.forEach(cat => console.log(`   • ${cat}`));

  console.log('\n' + '═'.repeat(70));
}

// تشغيل الاختبار
testMultipleDatasets();
