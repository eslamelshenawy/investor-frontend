/**
 * Terms & Conditions Page - الشروط والأحكام
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-gradient-to-br from-[#002B5C] to-[#004080] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <FileText size={36} className="mx-auto mb-3 text-white/80" />
          <h1 className="text-3xl font-bold mb-2">الشروط والأحكام</h1>
          <p className="text-white/70 text-sm">آخر تحديث: فبراير 2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. القبول بالشروط</h2>
            <p>
              باستخدامك لمنصة رادار المستثمر، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام المنصة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. وصف الخدمة</h2>
            <p>
              رادار المستثمر هي منصة تحليلية تجمع وتعرض البيانات الحكومية السعودية المفتوحة. تقدم المنصة تحليلات وإشارات استثمارية مبنية على الذكاء الاصطناعي لأغراض معلوماتية فقط.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. إخلاء المسؤولية الاستثمارية</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
              <p className="font-bold text-amber-800 mb-2">تنبيه مهم:</p>
              <p className="text-amber-700">
                المعلومات والتحليلات المقدمة في المنصة هي لأغراض معلوماتية وتعليمية فقط، ولا تعتبر نصيحة أو توصية استثمارية. يجب عليك استشارة مستشار مالي مرخص قبل اتخاذ أي قرار استثماري. رادار المستثمر لا يتحمل أي مسؤولية عن أي خسائر ناتجة عن استخدام المعلومات المعروضة.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. حساب المستخدم</h2>
            <ul className="list-disc mr-6 space-y-2 text-sm">
              <li>أنت مسؤول عن الحفاظ على سرية بيانات حسابك</li>
              <li>يجب أن تكون المعلومات المقدمة صحيحة ودقيقة</li>
              <li>لا يجوز مشاركة حسابك مع أشخاص آخرين</li>
              <li>يحق لنا تعليق أو إلغاء حسابك في حال مخالفة الشروط</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. الاستخدام المقبول</h2>
            <p className="mb-3">يجب عليك عدم:</p>
            <ul className="list-disc mr-6 space-y-2 text-sm">
              <li>استخدام المنصة لأغراض غير قانونية</li>
              <li>محاولة اختراق أو التلاعب بالمنصة أو بياناتها</li>
              <li>جمع بيانات المستخدمين الآخرين بدون إذن</li>
              <li>نشر محتوى مسيء أو مضلل أو ينتهك حقوق الآخرين</li>
              <li>استخدام أدوات آلية للوصول للمنصة بشكل مفرط</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. المحتوى</h2>
            <p>
              المحتوى المنشور على المنصة محمي بحقوق الملكية الفكرية. يمكنك استخدام المحتوى للأغراض الشخصية وغير التجارية. لا يجوز نسخ أو توزيع المحتوى بدون إذن مسبق. المحتوى الذي ينشئه المستخدمون يبقى ملكاً لأصحابه مع منح المنصة حق العرض.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. البيانات المفتوحة</h2>
            <p>
              البيانات الحكومية المعروضة مصدرها منصة البيانات المفتوحة السعودية وهي متاحة للعموم. نحن لا نضمن دقة أو اكتمال هذه البيانات. التحليلات والإشارات المولدة منها تخضع لقيود النماذج المستخدمة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. تحديد المسؤولية</h2>
            <p>
              المنصة مقدمة "كما هي" بدون أي ضمانات صريحة أو ضمنية. لا نتحمل المسؤولية عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام المنصة أو عدم القدرة على استخدامها.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. التعديلات</h2>
            <p>
              نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم إشعار المستخدمين بالتغييرات الجوهرية. استمرارك في استخدام المنصة بعد التعديل يعني موافقتك على الشروط المحدثة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. القانون الحاكم</h2>
            <p>
              تخضع هذه الشروط لأنظمة وقوانين المملكة العربية السعودية. أي نزاع ينشأ عن استخدام المنصة يخضع للاختصاص القضائي للمحاكم السعودية المختصة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. التواصل</h2>
            <p>
              لأي استفسارات حول الشروط والأحكام، يمكنك التواصل معنا عبر البريد الإلكتروني: info@al-investor.com
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

export default TermsPage;
