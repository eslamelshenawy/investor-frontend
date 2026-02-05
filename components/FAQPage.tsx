/**
 * FAQ Page - الأسئلة الشائعة
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowLeft, HelpCircle } from 'lucide-react';

const faqs = [
  {
    category: 'عام',
    questions: [
      {
        q: 'ما هو رادار المستثمر؟',
        a: 'رادار المستثمر هو منصة استثمارية ذكية تجمع البيانات الحكومية السعودية المفتوحة وتحللها باستخدام الذكاء الاصطناعي لتقديم إشارات استثمارية ورؤى تحليلية تساعد المستثمرين في اتخاذ قرارات مبنية على بيانات حقيقية.',
      },
      {
        q: 'من أين تأتي البيانات؟',
        a: 'نجمع البيانات من منصة البيانات المفتوحة السعودية (data.gov.sa) التي تضم أكثر من 17,400 مجموعة بيانات من جهات حكومية مختلفة. جميع البيانات عامة ومتاحة للجميع.',
      },
      {
        q: 'هل المنصة مجانية؟',
        a: 'نعم، يمكنك التسجيل واستخدام المنصة مجاناً. الخطة المجانية تتيح لك تصفح البيانات وعرض الإشارات وقراءة المحتوى. للمميزات المتقدمة مثل التصدير وإنشاء المحتوى، يمكنك الترقية للخطة المحترفة.',
      },
    ],
  },
  {
    category: 'البيانات',
    questions: [
      {
        q: 'كم مرة يتم تحديث البيانات؟',
        a: 'يتم تحديث البيانات تلقائياً كل 6 ساعات من خلال مزامنة كاملة، بالإضافة إلى فحص سريع كل ساعة للتحديثات الجديدة. كما يتم تحديث الكاش كل 30 دقيقة.',
      },
      {
        q: 'هل يمكنني تصدير البيانات؟',
        a: 'نعم، يمكنك تصدير البيانات بصيغ CSV وExcel وPDF. هذه الميزة متاحة في الخطة المحترفة وخطة المؤسسات.',
      },
      {
        q: 'ما مدى دقة البيانات؟',
        a: 'البيانات تأتي مباشرة من المصادر الحكومية الرسمية ويتم التحقق منها أثناء المزامنة. نحن لا نعدل البيانات الأصلية، بل نحللها ونعرضها بطريقة سهلة الفهم.',
      },
    ],
  },
  {
    category: 'الإشارات الذكية',
    questions: [
      {
        q: 'ما هي الإشارات الذكية؟',
        a: 'الإشارات الذكية هي تنبيهات يولدها الذكاء الاصطناعي عند اكتشاف أنماط أو اتجاهات مهمة في البيانات. كل إشارة تحتوي على درجة تأثير ودرجة ثقة واتجاه (صاعد/هابط/مستقر).',
      },
      {
        q: 'هل الإشارات توصيات استثمارية؟',
        a: 'لا، الإشارات ليست توصيات استثمارية. هي رؤى تحليلية مبنية على بيانات تساعدك في فهم السوق. يجب عليك دائماً استشارة مستشار مالي مرخص قبل اتخاذ أي قرار استثماري.',
      },
    ],
  },
  {
    category: 'الحساب',
    questions: [
      {
        q: 'كيف أنشئ حساب؟',
        a: 'يمكنك إنشاء حساب مجاني من خلال صفحة التسجيل. تحتاج فقط لبريدك الإلكتروني واسمك وكلمة مرور. سيتم تفعيل حسابك فوراً.',
      },
      {
        q: 'نسيت كلمة المرور، ماذا أفعل؟',
        a: 'يمكنك استعادة كلمة المرور من خلال صفحة "نسيت كلمة المرور" في تسجيل الدخول. سيتم إرسال رابط إعادة تعيين إلى بريدك الإلكتروني المسجل.',
      },
      {
        q: 'ما هي أدوار المستخدمين؟',
        a: 'يوجد 9 مستويات: مستخدم عادي، محلل، خبير، كاتب، مصمم، محرر، مدير محتوى، مدير، ومدير أعلى. كل دور له صلاحيات محددة لإنشاء ونشر المحتوى.',
      },
    ],
  },
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#002B5C] to-[#004080] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <HelpCircle size={40} className="mx-auto mb-4 text-white/80" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">الأسئلة الشائعة</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            إجابات على الأسئلة الأكثر شيوعاً حول رادار المستثمر
          </p>
        </div>
      </div>

      {/* FAQ List */}
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {faqs.map((section, si) => (
          <div key={si} className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">{si + 1}</span>
              {section.category}
            </h2>
            <div className="space-y-3">
              {section.questions.map((faq, qi) => {
                const key = `${si}-${qi}`;
                const isOpen = openIndex === key;
                return (
                  <div key={qi} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => toggle(key)}
                      className="w-full flex items-center justify-between p-4 text-right hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900 text-sm">{faq.q}</span>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 transition-transform shrink-0 mr-3 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-2">لم تجد إجابة لسؤالك؟</h3>
          <p className="text-gray-500 text-sm mb-4">تواصل معنا وسنسعد بمساعدتك</p>
          <Link to="/contact" className="inline-block px-6 py-3 bg-[#002B5C] text-white rounded-xl font-bold hover:bg-[#003A7A] transition-colors">
            تواصل معنا
          </Link>
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

export default FAQPage;
