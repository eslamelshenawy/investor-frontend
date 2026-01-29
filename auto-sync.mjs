#!/usr/bin/env node
/**
 * نظام المزامنة التلقائية للبيانات المفتوحة السعودية
 * Saudi Open Data Auto-Sync System
 *
 * الاستخدام:
 *   node auto-sync.mjs                    # مزامنة كاملة
 *   node auto-sync.mjs --check            # فحص التحديثات فقط
 *   node auto-sync.mjs --stats            # عرض الإحصائيات
 *   node auto-sync.mjs --schedule         # تشغيل مستمر (كل 6 ساعات)
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
  API_BASE: 'https://open.data.gov.sa/data/api',
  DATA_DIR: path.join(__dirname, 'data', 'open-data'),
  STATE_FILE: path.join(__dirname, 'data', 'sync-state.json'),
  REQUEST_DELAY: 500,
  SYNC_INTERVAL: 6 * 60 * 60 * 1000, // 6 ساعات
};

// قائمة الـ Dataset IDs (43 dataset)
const DATASET_IDS = [
  "1e7e8621-fd39-42fb-b78f-3c50b0be4f2e",
  "5948497a-d84f-45a4-944c-50c59cff9629",
  "ad218919-2014-4917-a85d-d4ec1a43c050",
  "b748181e-4c9f-4521-8144-1f48f7cb945c",
  "c8ae6fea-4f68-436a-accc-2d83d14f0cd4",
  "2a265aaf-fd1d-4aab-808e-74d8a3088594",
  "66e8cee3-0495-4d78-bbad-00654e63aec8",
  "2746ab4f-0700-425f-9b5c-618944a8cada",
  "2c2a3203-0671-4692-b030-628001b80d46",
  "38ef9473-f5f4-4fbf-83a7-1a4bf0c7ccec",
  "3d44d00e-5aa6-4937-981d-bd0548606109",
  "cc856462-5d59-481c-8ceb-29007c2b5525",
  "40fd0d4e-76e1-4fb2-afd3-42a56698e5af",
  "308744fe-60db-47f5-9ddb-691a51506a09",
  "68098400-520c-48d5-8d26-bd8855bf7572",
  "0e0d56bc-c8fe-44cd-bbc9-9fc3f6651799",
  "099d92d7-050f-494a-ba11-175e358bc121",
  "7645e1f8-aed3-4038-9f74-090d015a13d6",
  "2b13bef4-8c0d-40d3-b071-00bd089fb610",
  "8fc9e19e-ed3a-4c8a-a768-58d9d04814f5",
  "79998ff6-63b6-436e-9703-0430b440f3e6",
  "e54350f5-4121-4007-a7d8-1938373d0bd1",
  "e8ed3887-59a5-4504-8316-e9cece8f2249",
  "ba7b4224-da7d-4419-bbd3-1c6f586da49e",
  "932edccb-b985-4fd0-bca6-5badf9d14300",
  "c02f10db-06ef-4528-aabb-264f63d163c9",
  "6d54ae82-7736-4ccf-b662-31844233f5b5",
  "e6e5bd44-95d5-4381-98c0-fa2b8c938b8b",
  "b22e5e7c-2183-4115-bcd3-d6b955f24137",
  "db0596fb-ff37-41a3-b6f2-cf15d7b724a4",
  "0662ed73-d555-45e2-814a-898d368ab4ef",
  "9396bbd8-4283-4485-ac2a-c6743b74980c",
  "b6dc46f4-9de0-4039-82f5-b5db3897883d",
  "ea90c3d0-cb8d-4c34-9892-ea0aa35ad9a3",
  "c3e2b0a2-06b2-4a73-bb77-1e57fcb35365",
  "3a3ea3cc-dbf3-4d69-99db-a5c2f0165ae6",
  "4b7b45cb-e8b2-4864-a80d-6d9110865b99",
  "526237a0-c089-4003-939f-05dd827da9d1",
  "43f82be8-7298-48fb-840d-eb176e51abc9",
  "4a64b777-1db8-482d-b99a-5a0a76836d36",
  "30243301-2f50-4134-a967-a24dd5d9dfbf",
  "6dfb5c0b-0557-485d-be98-a39ea9b2e387",
  "40892c84-c7ec-48c9-b89c-da6caf178e96",
];

// ═══════════════════════════════════════════════════════════════════
// دوال المساعدة
// ═══════════════════════════════════════════════════════════════════

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadState() {
  try {
    if (fs.existsSync(CONFIG.STATE_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG.STATE_FILE, 'utf-8'));
    }
  } catch (e) { }
  return { datasets: {}, lastSync: null };
}

function saveState(state) {
  ensureDir(path.dirname(CONFIG.STATE_FILE));
  fs.writeFileSync(CONFIG.STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return (data && Object.keys(data).length > 0) ? data : null;
  } catch {
    return null;
  }
}

async function downloadCsv(url, filePath) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://open.data.gov.sa/',
      }
    });

    if (!response.ok) return false;

    const content = await response.text();
    if (content.includes('Request Rejected') || content.includes('<html>')) {
      return false;
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// الدوال الرئيسية
// ═══════════════════════════════════════════════════════════════════

async function syncDataset(id, state) {
  // 1. جلب معلومات الـ dataset
  const info = await fetchJson(`${CONFIG.API_BASE}/datasets?version=-1&dataset=${id}`);
  if (!info) return { success: false, status: 'error' };

  // 2. فحص إذا كان محدث
  const existing = state.datasets[id];
  const isNew = !existing;
  const isUpdated = existing && existing.updatedAt !== info.updatedAt;

  if (!isNew && !isUpdated) {
    return { success: true, status: 'unchanged' };
  }

  // 3. جلب روابط التحميل
  const resources = await fetchJson(`${CONFIG.API_BASE}/datasets/resources?version=-1&dataset=${id}`);
  if (!resources?.resources?.length) {
    return { success: false, status: 'no_resources' };
  }

  // 4. البحث عن CSV
  const csvResource = resources.resources.find(r => r.format === 'CSV');
  if (!csvResource?.downloadUrl) {
    return { success: false, status: 'no_csv' };
  }

  // 5. تحميل الملف
  ensureDir(CONFIG.DATA_DIR);
  const fileName = `${id}.csv`;
  const filePath = path.join(CONFIG.DATA_DIR, fileName);
  const downloaded = await downloadCsv(csvResource.downloadUrl, filePath);

  if (!downloaded) {
    return { success: false, status: 'download_failed' };
  }

  // 6. تحديث الحالة
  state.datasets[id] = {
    id,
    titleAr: info.titleAr,
    titleEn: info.titleEn,
    provider: info.providerNameAr,
    updatedAt: info.updatedAt,
    syncedAt: new Date().toISOString(),
    file: fileName,
  };

  return { success: true, status: isNew ? 'new' : 'updated', title: info.titleAr };
}

async function fullSync() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     نظام المزامنة التلقائية - البيانات المفتوحة السعودية      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📅 ${new Date().toLocaleString('ar-SA')}`);
  console.log(`📊 عدد الـ Datasets: ${DATASET_IDS.length}`);
  console.log('');
  console.log('─'.repeat(65));

  const state = loadState();
  const results = { new: [], updated: [], unchanged: 0, failed: [] };

  for (let i = 0; i < DATASET_IDS.length; i++) {
    const id = DATASET_IDS[i];
    process.stdout.write(`\r🔄 معالجة ${i + 1}/${DATASET_IDS.length}...`);

    const result = await syncDataset(id, state);

    if (result.status === 'new') {
      results.new.push(result.title);
    } else if (result.status === 'updated') {
      results.updated.push(result.title);
    } else if (result.status === 'unchanged') {
      results.unchanged++;
    } else {
      results.failed.push(id);
    }

    await delay(CONFIG.REQUEST_DELAY);
  }

  state.lastSync = new Date().toISOString();
  saveState(state);

  // عرض النتائج
  console.log('\n');
  console.log('─'.repeat(65));
  console.log('');
  console.log('📊 النتائج:');
  console.log(`   ✅ جديد:     ${results.new.length}`);
  console.log(`   🔄 محدث:     ${results.updated.length}`);
  console.log(`   ⏸️  بدون تغيير: ${results.unchanged}`);
  console.log(`   ❌ فشل:      ${results.failed.length}`);
  console.log('');

  if (results.new.length > 0) {
    console.log('📥 Datasets جديدة:');
    results.new.forEach(t => console.log(`   • ${t}`));
    console.log('');
  }

  if (results.updated.length > 0) {
    console.log('🔄 Datasets محدثة:');
    results.updated.forEach(t => console.log(`   • ${t}`));
    console.log('');
  }

  console.log(`📁 البيانات محفوظة في: ${CONFIG.DATA_DIR}`);
  console.log('');
  console.log('═'.repeat(65));
}

async function checkUpdates() {
  console.log('🔍 فحص التحديثات...\n');

  const state = loadState();
  const updates = [];

  for (let i = 0; i < DATASET_IDS.length; i++) {
    const id = DATASET_IDS[i];
    process.stdout.write(`\r   فحص ${i + 1}/${DATASET_IDS.length}...`);

    const info = await fetchJson(`${CONFIG.API_BASE}/datasets?version=-1&dataset=${id}`);
    if (!info) continue;

    const existing = state.datasets[id];
    if (existing && existing.updatedAt !== info.updatedAt) {
      updates.push({
        id,
        title: info.titleAr,
        oldDate: existing.updatedAt,
        newDate: info.updatedAt,
      });
    }

    await delay(CONFIG.REQUEST_DELAY);
  }

  console.log('\n');

  if (updates.length === 0) {
    console.log('✅ لا توجد تحديثات جديدة');
  } else {
    console.log(`🔔 ${updates.length} تحديث جديد:\n`);
    updates.forEach(u => {
      console.log(`   • ${u.title}`);
      console.log(`     السابق: ${u.oldDate}`);
      console.log(`     الجديد: ${u.newDate}`);
      console.log('');
    });
  }
}

function showStats() {
  const state = loadState();
  const synced = Object.keys(state.datasets).length;

  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                        الإحصائيات                              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📊 Datasets معروفة:    ${DATASET_IDS.length}`);
  console.log(`📥 Datasets محملة:     ${synced}`);
  console.log(`🕐 آخر مزامنة:         ${state.lastSync ? new Date(state.lastSync).toLocaleString('ar-SA') : 'لم تتم'}`);
  console.log(`📁 مجلد البيانات:      ${CONFIG.DATA_DIR}`);
  console.log('');

  if (synced > 0) {
    console.log('📋 آخر 5 datasets محملة:');
    const recent = Object.values(state.datasets)
      .sort((a, b) => new Date(b.syncedAt) - new Date(a.syncedAt))
      .slice(0, 5);
    recent.forEach(d => {
      console.log(`   • ${d.titleAr?.slice(0, 40) || d.id}...`);
    });
  }
}

async function runScheduled() {
  console.log('🕐 تشغيل المزامنة المجدولة (كل 6 ساعات)\n');
  console.log('   اضغط Ctrl+C للإيقاف\n');

  // تشغيل فوري
  await fullSync();

  // جدولة
  setInterval(async () => {
    console.log('\n\n');
    await fullSync();
  }, CONFIG.SYNC_INTERVAL);
}

// ═══════════════════════════════════════════════════════════════════
// التشغيل
// ═══════════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case '--check':
    checkUpdates();
    break;
  case '--stats':
    showStats();
    break;
  case '--schedule':
    runScheduled();
    break;
  case '--help':
    console.log(`
الاستخدام:
  node auto-sync.mjs              مزامنة كاملة
  node auto-sync.mjs --check      فحص التحديثات فقط
  node auto-sync.mjs --stats      عرض الإحصائيات
  node auto-sync.mjs --schedule   تشغيل مستمر (كل 6 ساعات)
`);
    break;
  default:
    fullSync();
}
