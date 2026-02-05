/**
 * Data Trust Page - لماذا نثق بهذه البيانات؟
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Database, CheckCircle, Lock, RefreshCw, FileCheck } from 'lucide-react';

const steps = [
  {
    icon: Database,
    title: 'مصادر حكومية رسمية',
    description: 'جميع البيانات مستمدة من منصة البيانات المفتوحة السعودية (data.gov.sa) والجهات الحكومية الرسمية مثل الهيئة العامة للإحصاء ووزارة المالية.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: RefreshCw,
    title: 'تحديث مستمر',
    description: 'يتم مزامنة البيانات بشكل دوري عبر واجهات برمجة التطبيقات (APIs) مع المصادر الرسمية لضمان حداثة البيانات ودقتها.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: FileCheck,
    title: 'تحقق آلي',
    description: 'تمر البيانات بعمليات تحقق آلية تشمل فحص الاتساق، اكتشاف القيم الشاذة، والتأكد من سلامة البنية قبل عرضها على المنصة.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Lock,
    title: 'أمان وتشفير',
    description: 'جميع الاتصالات مشفرة عبر HTTPS، وتُخزن البيانات على خوادم آمنة مع نسخ احتياطية. نلتزم بأعلى معايير حماية البيانات.',
    color: 'bg-amber-100 text-amber-600',
  },
];

const DataTrustPage = () => {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-gradient-to-br from-[#002B5C] to-[#004080] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <ShieldCheck size={36} className="mx-auto mb-3 text-white/80" />
          <h1 className="text-3xl font-bold mb-2">لماذا نثق بهذه البيانات؟</h1>
          <p className="text-white/70 text-sm max-w-xl mx-auto">
            منهجيتنا في جمع البيانات والتحقق منها تضمن دقة وموثوقية التحليلات المقدمة
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Steps */}
        <div className="grid gap-6 md:grid-cols-2">
          {steps.map((step, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${step.color}`}>
                <step.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-10 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">أرقام الثقة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '17,400+', label: 'مجموعة بيانات' },
              { value: '100%', label: 'مصادر حكومية' },
              { value: '24/7', label: 'مراقبة مستمرة' },
              { value: 'SSL', label: 'تشفير كامل' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Methodology */}
        <div className="mt-10 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">منهجية التحقق</h2>
          <div className="space-y-3">
            {[
              'التحقق من هوية المصدر عبر شهادات SSL وعناوين DNS الرسمية',
              'مقارنة البيانات المستلمة مع الإصدارات السابقة لاكتشاف التغييرات غير المتوقعة',
              'فحص القيم المفقودة والقيم الشاذة باستخدام خوارزميات إحصائية',
              'تسجيل كل عملية مزامنة مع طابع زمني وحالة المعالجة',
              'إشعار فوري للفريق التقني عند اكتشاف أي خلل في البيانات',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700">{item}</p>
              </div>
            ))}
          </div>
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

export default DataTrustPage;
