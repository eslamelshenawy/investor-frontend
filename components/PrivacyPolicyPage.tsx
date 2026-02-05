/**
 * Privacy Policy Page - سياسة الخصوصية
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-gradient-to-br from-[#002B5C] to-[#004080] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <Shield size={36} className="mx-auto mb-3 text-white/80" />
          <h1 className="text-3xl font-bold mb-2">سياسة الخصوصية</h1>
          <p className="text-white/70 text-sm">آخر تحديث: فبراير 2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. مقدمة</h2>
            <p>
              مرحباً بك في رادار المستثمر. نحن نقدر خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك عند استخدام منصتنا.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. البيانات التي نجمعها</h2>
            <p className="mb-3">نجمع الأنواع التالية من البيانات:</p>
            <ul className="list-disc mr-6 space-y-2 text-sm">
              <li><strong>بيانات الحساب:</strong> الاسم، البريد الإلكتروني، كلمة المرور (مشفرة)، رقم الهاتف (اختياري)</li>
              <li><strong>بيانات الاستخدام:</strong> الصفحات المزارة، المحتوى المفضل، سجل البحث</li>
              <li><strong>بيانات تقنية:</strong> عنوان IP، نوع المتصفح، نظام التشغيل</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. كيف نستخدم بياناتك</h2>
            <ul className="list-disc mr-6 space-y-2 text-sm">
              <li>تقديم خدمات المنصة وتحسينها</li>
              <li>تخصيص تجربتك وعرض محتوى مناسب</li>
              <li>إرسال إشعارات وتنبيهات (بموافقتك)</li>
              <li>تحليل الاستخدام لتحسين الأداء</li>
              <li>حماية المنصة من الاستخدام غير المصرح به</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. حماية البيانات</h2>
            <p>
              نستخدم تقنيات تشفير متقدمة لحماية بياناتك. كلمات المرور مشفرة بخوارزمية bcrypt ولا يمكن الوصول إليها. جميع الاتصالات مشفرة عبر HTTPS. نخزن بياناتك على خوادم آمنة مع نسخ احتياطية منتظمة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. مشاركة البيانات</h2>
            <p>
              لا نبيع أو نشارك بياناتك الشخصية مع أطراف ثالثة لأغراض تسويقية. قد نشارك بيانات مجهولة الهوية لأغراض تحليلية. قد نكشف عن بياناتك إذا طُلب ذلك قانونياً.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. ملفات تعريف الارتباط (Cookies)</h2>
            <p>
              نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتذكر تفضيلاتك. يمكنك إدارة إعدادات الكوكيز من خلال متصفحك. تعطيل الكوكيز قد يؤثر على بعض وظائف المنصة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. حقوقك</h2>
            <ul className="list-disc mr-6 space-y-2 text-sm">
              <li>الوصول إلى بياناتك الشخصية وتعديلها</li>
              <li>طلب حذف حسابك وبياناتك</li>
              <li>إلغاء الاشتراك في الإشعارات</li>
              <li>الحصول على نسخة من بياناتك</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. التواصل</h2>
            <p>
              لأي استفسارات حول سياسة الخصوصية، يمكنك التواصل معنا عبر البريد الإلكتروني: info@al-investor.com
            </p>
          </section>

        </div>

        <div className="text-center mt-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft size={16} />
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
