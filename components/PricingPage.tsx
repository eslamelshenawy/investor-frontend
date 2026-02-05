/**
 * Pricing Page - الأسعار
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowLeft, Star, Zap, Crown } from 'lucide-react';

const plans = [
  {
    name: 'المجاني',
    nameEn: 'Free',
    price: '0',
    period: 'مجاناً للأبد',
    icon: Star,
    color: 'gray',
    popular: false,
    features: [
      'تصفح مجموعات البيانات',
      'عرض الإشارات الذكية',
      'قراءة المحتوى المنشور',
      'حفظ 10 مفضلات',
      'تحليل أساسي',
      'لوحة بيانات واحدة',
    ],
  },
  {
    name: 'المحترف',
    nameEn: 'Pro',
    price: '99',
    period: 'ريال / شهرياً',
    icon: Zap,
    color: 'blue',
    popular: true,
    features: [
      'كل مميزات المجاني',
      'تصدير البيانات (CSV/PDF/Excel)',
      'إنشاء محتوى وتحليلات',
      'مفضلات غير محدودة',
      '5 لوحات بيانات مخصصة',
      'إشعارات فورية',
      'تنبيهات الإشارات',
      'دعم عبر البريد',
    ],
  },
  {
    name: 'المؤسسات',
    nameEn: 'Enterprise',
    price: 'مخصص',
    period: 'حسب الاتفاق',
    icon: Crown,
    color: 'amber',
    popular: false,
    features: [
      'كل مميزات المحترف',
      'API مفتوح للتكامل',
      'لوحات بيانات غير محدودة',
      'تقارير مخصصة بالـ AI',
      'إدارة فريق متعددة',
      'SLA مضمون',
      'مدير حساب مخصص',
      'تدريب وإعداد',
    ],
  },
];

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#002B5C] to-[#004080] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">خطط الأسعار</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            اختر الخطة المناسبة لاحتياجاتك. ابدأ مجاناً وقم بالترقية في أي وقت.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl p-6 border-2 relative ${
                plan.popular ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-gray-100'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                  الأكثر شيوعاً
                </div>
              )}

              <div className="text-center mb-6">
                <plan.icon size={32} className={`mx-auto mb-3 ${plan.popular ? 'text-blue-600' : 'text-gray-400'}`} />
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-3">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.price !== 'مخصص' && <span className="text-sm text-gray-500 mr-1">ريال</span>}
                </div>
                <p className="text-sm text-gray-500 mt-1">{plan.period}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check size={16} className={plan.popular ? 'text-blue-500' : 'text-emerald-500'} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to={plan.price === 'مخصص' ? '/contact' : '/register'}
                className={`block w-full text-center py-3 rounded-xl font-bold transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {plan.price === 'مخصص' ? 'تواصل معنا' : plan.price === '0' ? 'ابدأ مجاناً' : 'اشترك الآن'}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ hint */}
        <div className="text-center mt-12">
          <p className="text-gray-500 mb-4">لديك أسئلة حول الأسعار؟</p>
          <div className="flex justify-center gap-4">
            <Link to="/faq" className="text-blue-600 hover:text-blue-700 font-medium">
              الأسئلة الشائعة
            </Link>
            <span className="text-gray-300">|</span>
            <Link to="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
              تواصل معنا
            </Link>
          </div>
        </div>

        {/* Back */}
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

export default PricingPage;
