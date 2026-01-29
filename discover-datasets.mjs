#!/usr/bin/env node
/**
 * سكربت اكتشاف مجموعات البيانات الجديدة
 * Dataset Discovery Script
 *
 * الاستخدام:
 *   node discover-datasets.mjs --help           # عرض المساعدة
 *   node discover-datasets.mjs --browser        # عرض سكربت المتصفح
 *   node discover-datasets.mjs --add ID         # إضافة dataset يدوياً
 *   node discover-datasets.mjs --import file    # استيراد من ملف
 *   node discover-datasets.mjs --list           # عرض المكتشفات
 *   node discover-datasets.mjs --export         # تصدير ككود
 *   node discover-datasets.mjs --stats          # إحصائيات
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════════
// الإعدادات
// ═══════════════════════════════════════════════════════════════════

const CONFIG = {
  API_URL: 'https://open.data.gov.sa/data/api',
  STATE_FILE: path.join(__dirname, 'discovery-state.json'),
};

// قائمة الـ datasets المعروفة (42)
const KNOWN_DATASET_IDS = [
  "1e7e8621-fd39-42fb-b78f-3c50b0be4f2e",
  "0e0d56bc-c8fe-44cd-bbc9-9fc3f6651799",
  "2b13bef4-8c0d-40d3-b071-00bd089fb610",
  "8fc9e19e-ed3a-4c8a-a768-58d9d04814f5",
  "66e8cee3-0495-4d78-bbad-00654e63aec8",
  "79998ff6-63b6-436e-9703-0430b440f3e6",
  "2746ab4f-0700-425f-9b5c-618944a8cada",
  "5948497a-d84f-45a4-944c-50c59cff9629",
  "6d54ae82-7736-4ccf-b662-31844233f5b5",
  "099d92d7-050f-494a-ba11-175e358bc121",
  "3a3ea3cc-dbf3-4d69-99db-a5c2f0165ae6",
  "e54350f5-4121-4007-a7d8-1938373d0bd1",
  "38ef9473-f5f4-4fbf-83a7-1a4bf0c7ccec",
  "2a265aaf-fd1d-4aab-808e-74d8a3088594",
  "ea90c3d0-cb8d-4c34-9892-ea0aa35ad9a3",
  "43f82be8-7298-48fb-840d-eb176e51abc9",
  "4a64b777-1db8-482d-b99a-5a0a76836d36",
  "c3e2b0a2-06b2-4a73-bb77-1e57fcb35365",
  "3d44d00e-5aa6-4937-981d-bd0548606109",
  "b748181e-4c9f-4521-8144-1f48f7cb945c",
  "40fd0d4e-76e1-4fb2-afd3-42a56698e5af",
  "cc856462-5d59-481c-8ceb-29007c2b5525",
  "c8ae6fea-4f68-436a-accc-2d83d14f0cd4",
  "b22e5e7c-2183-4115-bcd3-d6b955f24137",
  "0662ed73-d555-45e2-814a-898d368ab4ef",
  "2c2a3203-0671-4692-b030-628001b80d46",
  "7645e1f8-aed3-4038-9f74-090d015a13d6",
  "6dfb5c0b-0557-485d-be98-a39ea9b2e387",
  "30243301-2f50-4134-a967-a24dd5d9dfbf",
  "e8ed3887-59a5-4504-8316-e9cece8f2249",
  "68098400-520c-48d5-8d26-bd8855bf7572",
  "308744fe-60db-47f5-9ddb-691a51506a09",
  "e6e5bd44-95d5-4381-98c0-fa2b8c938b8b",
  "526237a0-c089-4003-939f-05dd827da9d1",
  "ba7b4224-da7d-4419-bbd3-1c6f586da49e",
  "9396bbd8-4283-4485-ac2a-c6743b74980c",
  "db0596fb-ff37-41a3-b6f2-cf15d7b724a4",
  "ad218919-2014-4917-a85d-d4ec1a43c050",
  "932edccb-b985-4fd0-bca6-5badf9d14300",
  "c02f10db-06ef-4528-aabb-264f63d163c9",
  "40892c84-c7ec-48c9-b89c-da6caf178e96",
  "b6dc46f4-9de0-4039-82f5-b5db3897883d",
  "4b7b45cb-e8b2-4864-a80d-6d9110865b99",
];

// ═══════════════════════════════════════════════════════════════════
// دوال المساعدة
// ═══════════════════════════════════════════════════════════════════

function loadState() {
  try {
    if (fs.existsSync(CONFIG.STATE_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG.STATE_FILE, 'utf-8'));
    }
  } catch (e) { }
  return { discovered: [], lastUpdate: null };
}

function saveState(state) {
  fs.writeFileSync(CONFIG.STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

async function fetchDataset(id) {
  const url = `${CONFIG.API_URL}/datasets?version=-1&dataset=${id}`;
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) return null;

  const data = await response.json();
  return (data && Object.keys(data).length > 0) ? data : null;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════════════════════
// الأوامر
// ═══════════════════════════════════════════════════════════════════

function showHelp() {
  console.log(`
═══════════════════════════════════════════════════════════════════
   أداة اكتشاف مجموعات البيانات الجديدة
   Dataset Discovery Tool
═══════════════════════════════════════════════════════════════════

الاستخدام:
  node discover-datasets.mjs [خيار]

الخيارات:
  --help, -h        عرض هذه المساعدة
  --browser, -b     عرض سكربت لاستخراج IDs من المتصفح
  --add ID          إضافة dataset جديد بالـ ID
  --import FILE     استيراد IDs من ملف نصي
  --list, -l        عرض الـ datasets المكتشفة
  --export, -e      تصدير المكتشفات ككود TypeScript
  --stats, -s       عرض إحصائيات
  --verify ID       التحقق من صحة dataset ID

أمثلة:
  node discover-datasets.mjs --browser
  node discover-datasets.mjs --add abc123-def456-...
  node discover-datasets.mjs --import new-ids.txt
  node discover-datasets.mjs --list
`);
}

function showBrowserScript() {
  console.log(`
═══════════════════════════════════════════════════════════════════
   سكربت استخراج Dataset IDs من المتصفح
═══════════════════════════════════════════════════════════════════

الخطوات:
1. افتح المتصفح وادخل على: https://open.data.gov.sa/ar/datasets
2. تصفح الصفحات لتحميل كل الـ datasets
3. اضغط F12 لفتح Developer Tools
4. اذهب لتبويب Console
5. انسخ والصق الكود التالي:

───────────────────────────────────────────────────────────────────
`);

  console.log(`
(function() {
  // جمع كل روابط الـ datasets
  const links = document.querySelectorAll('a[href*="/datasets/view/"]');
  const ids = new Set();

  links.forEach(link => {
    const match = link.href.match(/\\/datasets\\/view\\/([a-f0-9-]+)/i);
    if (match) ids.add(match[1]);
  });

  const result = Array.from(ids);
  console.log('\\n✅ تم العثور على', result.length, 'dataset\\n');

  // عرض النتائج
  result.forEach((id, i) => console.log(\`\${i+1}. \${id}\`));

  // نسخ للـ clipboard
  const text = result.join('\\n');
  navigator.clipboard.writeText(text)
    .then(() => console.log('\\n📋 تم نسخ الـ IDs للـ clipboard!'))
    .catch(() => {
      console.log('\\n📋 انسخ يدوياً من هنا:');
      console.log(text);
    });

  return result;
})();
`);

  console.log(`
───────────────────────────────────────────────────────────────────

6. اضغط Enter
7. ستُنسخ الـ IDs للـ clipboard تلقائياً
8. احفظها في ملف (مثل: new-ids.txt)
9. شغّل: node discover-datasets.mjs --import new-ids.txt
`);
}

async function addDataset(id) {
  console.log(`\n🔍 جاري التحقق من: ${id}\n`);

  // تحقق إذا كان معروف
  if (KNOWN_DATASET_IDS.includes(id)) {
    console.log('⚠️ هذا الـ dataset موجود مسبقاً في القائمة المعروفة');
    return;
  }

  const state = loadState();
  if (state.discovered.some(d => d.id === id)) {
    console.log('⚠️ هذا الـ dataset مكتشف مسبقاً');
    return;
  }

  // جلب البيانات
  const data = await fetchDataset(id);
  if (!data) {
    console.log('❌ لم يتم العثور على dataset بهذا الـ ID');
    return;
  }

  // إضافة للمكتشفات
  state.discovered.push({
    id,
    titleAr: data.titleAr,
    titleEn: data.titleEn,
    providerNameAr: data.providerNameAr,
    updateFrequency: data.updateFrequency,
    discoveredAt: new Date().toISOString(),
  });
  state.lastUpdate = new Date().toISOString();
  saveState(state);

  console.log('✅ تم اكتشاف dataset جديد!\n');
  console.log(`   العنوان: ${data.titleAr}`);
  console.log(`   المزود: ${data.providerNameAr}`);
  console.log(`   التحديث: ${data.updateFrequency}`);
}

async function importFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ الملف غير موجود: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const ids = content.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi) || [];
  const uniqueIds = [...new Set(ids)];

  console.log(`\n📄 تم العثور على ${uniqueIds.length} معرف في الملف\n`);

  // فلترة المعروفين
  const newIds = uniqueIds.filter(id => !KNOWN_DATASET_IDS.includes(id));
  console.log(`🆕 منها ${newIds.length} جديدة (غير موجودة في القائمة)\n`);

  if (newIds.length === 0) {
    console.log('✅ جميع الـ IDs موجودة مسبقاً');
    return;
  }

  let addedCount = 0;
  for (const id of newIds) {
    process.stdout.write(`   فحص ${id.slice(0, 8)}... `);

    const state = loadState();
    if (state.discovered.some(d => d.id === id)) {
      console.log('(مكتشف مسبقاً)');
      continue;
    }

    const data = await fetchDataset(id);
    if (data) {
      state.discovered.push({
        id,
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        providerNameAr: data.providerNameAr,
        updateFrequency: data.updateFrequency,
        discoveredAt: new Date().toISOString(),
      });
      state.lastUpdate = new Date().toISOString();
      saveState(state);
      console.log(`✅ ${data.titleAr.slice(0, 30)}...`);
      addedCount++;
    } else {
      console.log('❌ غير صالح');
    }

    await delay(500);
  }

  console.log(`\n📊 النتيجة: تم إضافة ${addedCount} dataset جديد`);
}

function listDiscovered() {
  const state = loadState();

  console.log(`
═══════════════════════════════════════════════════════════════════
   الـ Datasets المكتشفة
═══════════════════════════════════════════════════════════════════
`);

  if (state.discovered.length === 0) {
    console.log('📭 لم يتم اكتشاف أي datasets جديدة بعد\n');
    console.log('استخدم: node discover-datasets.mjs --browser');
    return;
  }

  state.discovered.forEach((d, i) => {
    console.log(`${i + 1}. ${d.titleAr}`);
    console.log(`   ID: ${d.id}`);
    console.log(`   المزود: ${d.providerNameAr}`);
    console.log(`   اكتُشف: ${new Date(d.discoveredAt).toLocaleDateString('ar-SA')}`);
    console.log('');
  });

  console.log(`───────────────────────────────────────────────────────────────────`);
  console.log(`الإجمالي: ${state.discovered.length} dataset جديد`);
}

function exportAsCode() {
  const state = loadState();

  if (state.discovered.length === 0) {
    console.log('📭 لا توجد datasets مكتشفة للتصدير');
    return;
  }

  console.log(`
// ═══════════════════════════════════════════════════════════════════
// Datasets جديدة مكتشفة - أضفها إلى AVAILABLE_DATASETS في openDataService.ts
// تاريخ التصدير: ${new Date().toISOString()}
// ═══════════════════════════════════════════════════════════════════
`);

  state.discovered.forEach(d => {
    console.log(`{
  id: "${d.id}",
  titleAr: "${d.titleAr}",
  columns: [], // TODO: أضف الأعمدة
  category: "" // TODO: أضف التصنيف
},`);
  });
}

function showStats() {
  const state = loadState();

  console.log(`
═══════════════════════════════════════════════════════════════════
   إحصائيات الاكتشاف
═══════════════════════════════════════════════════════════════════

📊 Datasets معروفة (في الكود):     ${KNOWN_DATASET_IDS.length}
🆕 Datasets مكتشفة (جديدة):        ${state.discovered.length}
📁 الإجمالي:                       ${KNOWN_DATASET_IDS.length + state.discovered.length}

🕐 آخر اكتشاف: ${state.lastUpdate ? new Date(state.lastUpdate).toLocaleString('ar-SA') : 'لم يحدث بعد'}
`);

  if (state.discovered.length > 0) {
    // تجميع حسب المزود
    const byProvider = {};
    state.discovered.forEach(d => {
      const provider = d.providerNameAr || 'غير معروف';
      byProvider[provider] = (byProvider[provider] || 0) + 1;
    });

    console.log('📦 المكتشفات حسب المزود:');
    Object.entries(byProvider).forEach(([provider, count]) => {
      console.log(`   • ${provider}: ${count}`);
    });
  }
}

async function verifyId(id) {
  console.log(`\n🔍 جاري التحقق من: ${id}\n`);

  const data = await fetchDataset(id);
  if (data) {
    console.log('✅ Dataset صالح!\n');
    console.log(`   العنوان (عربي): ${data.titleAr}`);
    console.log(`   العنوان (إنجليزي): ${data.titleEn}`);
    console.log(`   المزود: ${data.providerNameAr}`);
    console.log(`   تاريخ الإنشاء: ${data.createdAt}`);
    console.log(`   آخر تحديث: ${data.updatedAt}`);
    console.log(`   دورية التحديث: ${data.updateFrequency}`);

    if (KNOWN_DATASET_IDS.includes(id)) {
      console.log('\n⚠️ هذا الـ dataset موجود في القائمة المعروفة');
    }
  } else {
    console.log('❌ لم يتم العثور على dataset بهذا الـ ID');
  }
}

// ═══════════════════════════════════════════════════════════════════
// التشغيل
// ═══════════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case '--help':
  case '-h':
    showHelp();
    break;

  case '--browser':
  case '-b':
    showBrowserScript();
    break;

  case '--add':
    if (args[1]) {
      addDataset(args[1]);
    } else {
      console.log('❌ يجب تحديد الـ ID: --add <dataset-id>');
    }
    break;

  case '--import':
    if (args[1]) {
      importFromFile(args[1]);
    } else {
      console.log('❌ يجب تحديد الملف: --import <file>');
    }
    break;

  case '--list':
  case '-l':
    listDiscovered();
    break;

  case '--export':
  case '-e':
    exportAsCode();
    break;

  case '--stats':
  case '-s':
    showStats();
    break;

  case '--verify':
    if (args[1]) {
      verifyId(args[1]);
    } else {
      console.log('❌ يجب تحديد الـ ID: --verify <dataset-id>');
    }
    break;

  default:
    showHelp();
}
