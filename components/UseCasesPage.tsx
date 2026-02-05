/**
 * Use Cases Page - حالات الاستخدام
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lightbulb, TrendingUp, Building, Briefcase, GraduationCap, BarChart3 } from 'lucide-react';

const useCases = [
  {
    icon: TrendingUp,
    title: 'المستثمر الفردي',
    titleEn: 'Individual Investor',
    color: 'bg-blue-100 text-blue-600 border-blue-200',
    scenarios: [
      'متابعة الإشارات الاقتصادية لاتخاذ قرارات استثمارية مبنية على بيانات',
      'تحليل اتجاهات القطاعات المختلفة قبل الاستثمار',
      'مقارنة أداء القطاعات العقارية والمالية والطاقة',
      'الحصول على تنبيهات فورية عن التغيرات المهمة في السوق',
    ],
  },
  {
    icon: Building,
    title: 'الجهات الحكومية',
    titleEn: 'Government Entities',
    color: 'bg-green-100 text-green-600 border-green-200',
    scenarios: [
      'مراقبة مؤشرات الأداء الاقتصادي في الوقت الحقيقي',
      'تحليل تأثير السياسات على القطاعات المختلفة',
      'إعداد تقارير دورية مدعومة ببيانات محدثة',
      'تتبع مؤشرات رؤية 2030 وتقدم المشاريع الكبرى',
    ],
  },
  {
    icon: Briefcase,
    title: 'الشركات والمؤسسات',
    titleEn: 'Businesses',
    color: 'bg-purple-100 text-purple-600 border-purple-200',
    scenarios: [
      'دراسة السوق والمنافسين باستخدام بيانات حكومية موثوقة',
      'تحليل الفرص الاستثمارية في القطاعات الناشئة',
      'متابعة مؤشرات سوق العمل والتوظيف',
      'بناء لوحات بيانات مخصصة لقرارات الأعمال',
    ],
  },
  {
    icon: BarChart3,
    title: 'المحللون الماليون',
    titleEn: 'Financial Analysts',
    color: 'bg-amber-100 text-amber-600 border-amber-200',
    scenarios: [
      'الوصول لبيانات مفتوحة موحدة من مصادر متعددة',
      'استخدام أدوات الذكاء الاصطناعي لاكتشاف الأنماط',
      'إنشاء تحليلات ومقالات ونشرها للمجتمع',
      'تصدير البيانات بصيغ متعددة (CSV, Excel) للتحليل المتقدم',
    ],
  },
  {
    icon: GraduationCap,
    title: 'الباحثون والأكاديميون',
    titleEn: 'Researchers',
    color: 'bg-rose-100 text-rose-600 border-rose-200',
    scenarios: [
      'الوصول لقواعد بيانات حكومية موحدة ومنظمة',
      'تتبع المؤشرات الاقتصادية عبر الزمن لأبحاث الاتجاهات',
      'مقارنة البيانات بين المناطق والقطاعات المختلفة',
      'استخدام البيانات في الأوراق البحثية والرسائل العلمية',
    ],
  },
];

const UseCasesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-gradient-to-br from-[#002B5C] to-[#004080] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <Lightbulb size={36} className="mx-auto mb-3 text-white/80" />
          <h1 className="text-3xl font-bold mb-2">حالات الاستخدام</h1>
          <p className="text-white/70 text-sm max-w-xl mx-auto">
            اكتشف كيف يستفيد مختلف المستخدمين من منصة رادار المستثمر
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="space-y-6">
          {useCases.map((uc, i) => (
            <div key={i} className={`bg-white rounded-2xl p-6 border shadow-sm ${uc.color.split(' ')[2]}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${uc.color.split(' ').slice(0, 2).join(' ')}`}>
                  <uc.icon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{uc.title}</h3>
                  <p className="text-xs text-gray-400">{uc.titleEn}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {uc.scenarios.map((s, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 mt-1 shrink-0">&#x2713;</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-blue-50 rounded-2xl p-6 border border-blue-100 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">هل لديك حالة استخدام مختلفة؟</h3>
          <p className="text-sm text-gray-600 mb-4">تواصل معنا وسنساعدك في الاستفادة القصوى من المنصة</p>
          <Link
            to="/contact"
            className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
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

export default UseCasesPage;
