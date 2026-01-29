#!/usr/bin/env node
/**
 * سكربت مراقبة تحديثات منصة البيانات المفتوحة السعودية
 * يمكن تشغيله يدوياً أو عبر cron job
 *
 * الاستخدام:
 *   node check-updates.mjs              # فحص كل الـ datasets
 *   node check-updates.mjs --summary    # عرض ملخص الحالة فقط
 *   node check-updates.mjs --webhook URL # إرسال التحديثات لـ webhook
 *   node check-updates.mjs --reset      # مسح الحالة المحفوظة والبدء من جديد
 *
 * للتشغيل التلقائي (Linux/Mac):
 *   crontab -e
 *   # كل 6 ساعات:
 *   0 */6 * * * cd /path/to/project && node check-updates.mjs >> /var/log/dataset-monitor.log 2>&1
 *
 * للتشغيل التلقائي (Windows Task Scheduler):
 *   schtasks /create /sc HOURLY /mo 6 /tn "DatasetMonitor" /tr "node E:\path\check-updates.mjs"
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
  OPEN_DATA_BASE_URL: 'https://open.data.gov.sa/data/api',
  STATE_FILE: path.join(__dirname, 'dataset-update-state.json'),
  LOG_FILE: path.join(__dirname, 'update-log.json'),
  DELAY_BETWEEN_REQUESTS: 500, // مللي ثانية
};

// قائمة الـ datasets المهمة للمراقبة
const DATASETS_TO_MONITOR = [
  { id: '4b7b45cb-e8b2-4864-a80d-6d9110865b99', name: 'العمل الحر 2024', category: 'عمل حر' },
  { id: '1e7e8621-fd39-42fb-b78f-3c50b0be4f2e', name: 'المؤشر العقاري', category: 'عقارات' },
  { id: '5948497a-d84f-45a4-944c-50c59cff9629', name: 'الصفقات العقارية Q3', category: 'عقارات' },
  { id: 'ad218919-2014-4917-a85d-d4ec1a43c050', name: 'الصفقات العقارية Q2', category: 'عقارات' },
  { id: 'b748181e-4c9f-4521-8144-1f48f7cb945c', name: 'مؤشرات الرياض Q3', category: 'عقارات' },
  { id: '2a265aaf-fd1d-4aab-808e-74d8a3088594', name: 'مؤشرات مكة Q3', category: 'عقارات' },
  { id: '66e8cee3-0495-4d78-bbad-00654e63aec8', name: 'تملك النساء', category: 'تملك' },
  { id: '2746ab4f-0700-425f-9b5c-618944a8cada', name: 'تملك الرجال', category: 'تملك' },
  { id: '38ef9473-f5f4-4fbf-83a7-1a4bf0c7ccec', name: 'المزادات العقارية', category: 'مزادات' },
  { id: '6d54ae82-7736-4ccf-b662-31844233f5b5', name: 'ثقة المستفيدين', category: 'دعم سكني' },
  { id: 'e6e5bd44-95d5-4381-98c0-fa2b8c938b8b', name: 'إجمالي المستفيدين', category: 'دعم سكني' },
  { id: 'b22e5e7c-2183-4115-bcd3-d6b955f24137', name: 'الحلول التمويلية', category: 'دعم سكني' },
  { id: 'ea90c3d0-cb8d-4c34-9892-ea0aa35ad9a3', name: 'الإقامة المميزة', category: 'إقامة مميزة' },
  { id: '3a3ea3cc-dbf3-4d69-99db-a5c2f0165ae6', name: 'الأصول الوقفية', category: 'أوقاف' },
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
  return {};
}

function saveState(state) {
  fs.writeFileSync(CONFIG.STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

function logUpdate(updates) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    updates: updates,
  };

  let log = [];
  try {
    if (fs.existsSync(CONFIG.LOG_FILE)) {
      log = JSON.parse(fs.readFileSync(CONFIG.LOG_FILE, 'utf-8'));
    }
  } catch (e) { }

  log.push(logEntry);

  // الاحتفاظ بآخر 100 سجل فقط
  if (log.length > 100) {
    log = log.slice(-100);
  }

  fs.writeFileSync(CONFIG.LOG_FILE, JSON.stringify(log, null, 2), 'utf-8');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchDataset(datasetId) {
  const url = `${CONFIG.OPEN_DATA_BASE_URL}/datasets?version=-1&dataset=${datasetId}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!data || Object.keys(data).length === 0) {
    throw new Error('Empty response');
  }

  return data;
}

async function sendWebhook(webhookUrl, updates) {
  try {
    const payload = {
      source: 'Saudi Open Data Monitor',
      timestamp: new Date().toISOString(),
      updates: updates.map(u => ({
        id: u.datasetId,
        title: u.titleAr,
        provider: u.providerNameAr,
        previousUpdate: u.previousUpdate,
        newUpdate: u.currentUpdate,
      })),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('✅ تم إرسال الإشعار للـ Webhook بنجاح');
    } else {
      console.error(`❌ فشل إرسال Webhook: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ خطأ في إرسال Webhook:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════
// الدوال الرئيسية
// ═══════════════════════════════════════════════════════════════════

async function checkUpdates(webhookUrl = null) {
  console.log('═'.repeat(70));
  console.log('   مراقب تحديثات منصة البيانات المفتوحة السعودية');
  console.log('   ' + new Date().toLocaleString('ar-SA'));
  console.log('═'.repeat(70));
  console.log('');

  const state = loadState();
  const updates = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < DATASETS_TO_MONITOR.length; i++) {
    const dataset = DATASETS_TO_MONITOR[i];
    process.stdout.write(`\r🔍 فحص ${i + 1}/${DATASETS_TO_MONITOR.length}: ${dataset.name.padEnd(25)}`);

    try {
      const data = await fetchDataset(dataset.id);
      const currentUpdate = data.updatedAt;
      const previousUpdate = state[dataset.id]?.lastKnownUpdate;

      // تحديث الحالة
      state[dataset.id] = {
        id: dataset.id,
        name: dataset.name,
        category: dataset.category,
        titleAr: data.titleAr,
        providerNameAr: data.providerNameAr,
        updateFrequency: data.updateFrequency,
        lastKnownUpdate: currentUpdate,
        lastChecked: new Date().toISOString(),
      };

      // فحص التحديث
      if (previousUpdate && previousUpdate !== currentUpdate) {
        updates.push({
          datasetId: dataset.id,
          name: dataset.name,
          titleAr: data.titleAr,
          providerNameAr: data.providerNameAr,
          previousUpdate,
          currentUpdate,
          category: dataset.category,
        });
      }

      successCount++;
    } catch (error) {
      errorCount++;
      state[dataset.id] = {
        ...state[dataset.id],
        lastError: error.message,
        lastErrorTime: new Date().toISOString(),
      };
    }

    await delay(CONFIG.DELAY_BETWEEN_REQUESTS);
  }

  console.log('\n');

  // حفظ الحالة
  saveState(state);

  // عرض النتائج
  console.log('─'.repeat(70));
  console.log(`📊 النتيجة: ${successCount} نجح، ${errorCount} فشل`);

  if (updates.length > 0) {
    console.log(`\n🔔 تم اكتشاف ${updates.length} تحديث جديد:\n`);

    updates.forEach((update, index) => {
      console.log(`${index + 1}. ${update.titleAr}`);
      console.log(`   📁 التصنيف: ${update.category}`);
      console.log(`   🏢 المزود: ${update.providerNameAr}`);
      console.log(`   📅 السابق: ${update.previousUpdate}`);
      console.log(`   📅 الجديد: ${update.currentUpdate}`);
      console.log('');
    });

    // تسجيل التحديثات
    logUpdate(updates);

    // إرسال Webhook إن وجد
    if (webhookUrl) {
      await sendWebhook(webhookUrl, updates);
    }
  } else {
    console.log('\n📭 لا توجد تحديثات جديدة');
  }

  console.log('\n' + '═'.repeat(70));

  return updates;
}

function showSummary() {
  const state = loadState();
  const datasets = Object.values(state);

  console.log('═'.repeat(70));
  console.log('   ملخص حالة المراقبة');
  console.log('═'.repeat(70));
  console.log('');

  console.log(`📊 إجمالي الـ Datasets المراقبة: ${datasets.length}`);

  if (datasets.length === 0) {
    console.log('\n⚠️ لم يتم فحص أي datasets بعد. شغّل: node check-updates.mjs');
    return;
  }

  // آخر فحص
  const lastCheck = datasets.reduce((latest, d) =>
    new Date(d.lastChecked) > new Date(latest.lastChecked) ? d : latest
  );
  console.log(`🕐 آخر فحص: ${new Date(lastCheck.lastChecked).toLocaleString('ar-SA')}`);

  // تجميع حسب التصنيف
  const byCategory = {};
  datasets.forEach(d => {
    const cat = d.category || 'غير مصنف';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  });

  console.log('\n📁 التصنيفات:');
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`   • ${cat}: ${count}`);
  });

  // تجميع حسب تكرار التحديث
  const byFrequency = {};
  datasets.forEach(d => {
    const freq = d.updateFrequency || 'غير معروف';
    byFrequency[freq] = (byFrequency[freq] || 0) + 1;
  });

  console.log('\n🔄 تكرار التحديث:');
  Object.entries(byFrequency).forEach(([freq, count]) => {
    const arabicFreq = {
      'DAILY': 'يومي',
      'WEEKLY': 'أسبوعي',
      'MONTHLY': 'شهري',
      'QUARTERLY': 'ربع سنوي',
      'YEARLY': 'سنوي',
    }[freq] || freq;
    console.log(`   • ${arabicFreq}: ${count}`);
  });

  // عرض سجل التحديثات
  try {
    if (fs.existsSync(CONFIG.LOG_FILE)) {
      const log = JSON.parse(fs.readFileSync(CONFIG.LOG_FILE, 'utf-8'));
      const recent = log.slice(-5);

      if (recent.length > 0) {
        console.log('\n📜 آخر التحديثات المكتشفة:');
        recent.forEach(entry => {
          const date = new Date(entry.timestamp).toLocaleString('ar-SA');
          console.log(`   ${date}: ${entry.updates.length} تحديث`);
        });
      }
    }
  } catch (e) { }

  console.log('\n' + '═'.repeat(70));
}

function resetState() {
  if (fs.existsSync(CONFIG.STATE_FILE)) {
    fs.unlinkSync(CONFIG.STATE_FILE);
  }
  if (fs.existsSync(CONFIG.LOG_FILE)) {
    fs.unlinkSync(CONFIG.LOG_FILE);
  }
  console.log('✅ تم مسح جميع البيانات المحفوظة');
}

// ═══════════════════════════════════════════════════════════════════
// التشغيل
// ═══════════════════════════════════════════════════════════════════

const args = process.argv.slice(2);

if (args.includes('--summary')) {
  showSummary();
} else if (args.includes('--reset')) {
  resetState();
} else {
  const webhookIndex = args.indexOf('--webhook');
  const webhookUrl = webhookIndex !== -1 ? args[webhookIndex + 1] : null;

  checkUpdates(webhookUrl).catch(console.error);
}
