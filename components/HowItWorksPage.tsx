/**
 * How It Works Page - كيف يعمل
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Database, Brain, TrendingUp, BarChart3, Users, Bell,
  ArrowDown, ArrowLeft, CheckCircle2,
} from 'lucide-react';

const steps = [
  {
    icon: Database,
    title: 'جمع البيانات',
    desc: 'نجمع البيانات من منصة البيانات المفتوحة السعودية وأكثر من 17,400 مجموعة بيانات حكومية',
    details: [
      'مزامنة تلقائية كل 6 ساعات',
      'تخزين مؤقت ذكي بـ Redis',
      'اكتشاف مجموعات بيانات جديدة تلقائياً',
      'معاينة سريعة وتحميل كامل on-demand',
    ],
    color: 'blue',
  },
  {
    icon: Brain,
    title: 'التحليل بالذكاء الاصطناعي',
    desc: 'نحلل البيانات باستخدام Google Gemini لاستخراج أنماط واتجاهات استثمارية',
    details: [
      'تحليل اتجاهات السوق',
      'مقارنة فترات زمنية',
      'اكتشاف الأنماط المخفية',
      'توليد تقارير قطاعية',
    ],
    color: 'purple',
  },
  {
    icon: TrendingUp,
    title: 'توليد الإشارات',
    desc: 'نولد إشارات استثمارية ذكية مع درجات ثقة وتأثير لمساعدتك في اتخاذ القرار',
    details: [
      'إشارات فرص استثمارية',
      'تنبيهات المخاطر',
      'درجات ثقة وتأثير',
      'تصنيف حسب القطاع والمنطقة',
    ],
    color: 'emerald',
  },
  {
    icon: BarChart3,
    title: 'عرض النتائج',
    desc: 'نعرض النتائج في لوحات بيانات تفاعلية ورسوم بيانية قابلة للتخصيص',
    details: [
      'رسوم بيانية تفاعلية',
      'تصدير PDF و Excel',
      'لوحات بيانات مخصصة',
      'بث مباشر SSE للتحديثات',
    ],
    color: 'amber',
  },
];

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#002B5C] to-[#004080] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">كيف يعمل رادار المستثمر؟</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            أربع خطوات بسيطة لتحويل البيانات الحكومية إلى رؤى استثمارية قابلة للتطبيق
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {steps.map((step, i) => (
          <div key={i}>
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-start gap-5">
                <div className="shrink-0">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-${step.color}-100 relative`}>
                    <step.icon size={28} className={`text-${step.color}-600`} />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#002B5C] text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.desc}</p>
                  <ul className="space-y-2">
                    {step.details.map((d, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 size={16} className={`text-${step.color}-500 shrink-0`} />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="flex justify-center py-3">
                <ArrowDown size={24} className="text-gray-300" />
              </div>
            )}
          </div>
        ))}

        {/* Roles */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">أدوار المستخدمين</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Users, title: 'مستخدم', desc: 'تصفح البيانات والمحتوى، حفظ المفضلات، التعليق والإعجاب' },
              { icon: TrendingUp, title: 'محلل / خبير', desc: 'إنشاء تحليلات ومقارنات ورؤى معمقة حسب التخصص' },
              { icon: Bell, title: 'مدير محتوى', desc: 'مراجعة المحتوى وجدولته ونشره وإدارة سير العمل' },
            ].map((r, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 text-center">
                <r.icon size={28} className="text-[#002B5C] mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">{r.title}</h3>
                <p className="text-xs text-gray-500">{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center mt-12">
          <div className="flex justify-center gap-4">
            <Link to="/register" className="px-6 py-3 bg-[#002B5C] text-white rounded-xl font-bold hover:bg-[#003A7A] transition-colors">
              ابدأ مجاناً
            </Link>
            <Link to="/" className="px-6 py-3 bg-white text-[#002B5C] border border-[#002B5C] rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center gap-2">
              <ArrowLeft size={18} />
              الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
