/**
 * Plan Details Page - تفاصيل الباقات
 * Public page showing detailed subscription plan information with comparison
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, X, Crown, Zap, Shield, Star, Users, BarChart3, Download, Database, Brain, ArrowLeft, ChevronDown } from 'lucide-react';

type PlanId = 'free' | 'analyst' | 'expert';

interface PlanFeature {
  name: string;
  free: boolean | string;
  analyst: boolean | string;
  expert: boolean | string;
}

interface PlanDetail {
  id: PlanId;
  name: string;
  nameEn: string;
  price: string;
  period: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  badgeColor: string;
  description: string;
  features: { text: string; icon: React.ElementType }[];
  useCases: string[];
  ctaText: string;
  ctaLink: string;
  popular: boolean;
}

const plans: PlanDetail[] = [
  {
    id: 'free',
    name: 'مجاني',
    nameEn: 'Free',
    price: '0',
    period: 'مجاناً للأبد',
    icon: Star,
    color: 'gray',
    gradient: 'from-gray-500 to-gray-600',
    badgeColor: 'bg-gray-100 text-gray-700',
    description: 'وصول أساسي للمنصة لتصفح البيانات ومتابعة الأسواق. مثالي للبدء واستكشاف المنصة.',
    features: [
      { text: 'تصفح اللوحات العامة', icon: BarChart3 },
      { text: 'عرض إشارات السوق (محدود)', icon: Zap },
      { text: '5 مفضلات كحد أقصى', icon: Star },
      { text: 'بحث أساسي في البيانات', icon: Database },
      { text: 'قراءة المحتوى المنشور', icon: Users },
    ],
    useCases: ['مستثمر مبتدئ', 'متابع للأسواق'],
    ctaText: 'ابدأ مجاناً',
    ctaLink: '/register',
    popular: false,
  },
  {
    id: 'analyst',
    name: 'محلل',
    nameEn: 'Analyst',
    price: '99',
    period: 'ر.س / شهرياً',
    icon: Zap,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-700',
    badgeColor: 'bg-blue-100 text-blue-700',
    description: 'تحليل متقدم مع أدوات بناء اللوحات والتصدير والتوصيات الذكية. للمحللين والمستثمرين النشطين.',
    features: [
      { text: 'جميع مميزات الباقة المجانية', icon: Check },
      { text: 'بناء لوحات بيانات مخصصة', icon: BarChart3 },
      { text: 'استعلامات مخصصة على البيانات', icon: Database },
      { text: 'تصدير البيانات (CSV / PDF)', icon: Download },
      { text: '50 مفضلة', icon: Star },
      { text: 'توصيات ذكية بالـ AI', icon: Brain },
      { text: 'إشعارات فورية', icon: Zap },
    ],
    useCases: ['محلل مالي', 'مستثمر نشط'],
    ctaText: 'اشترك الآن',
    ctaLink: '/register',
    popular: true,
  },
  {
    id: 'expert',
    name: 'خبير',
    nameEn: 'Expert',
    price: '299',
    period: 'ر.س / شهرياً',
    icon: Crown,
    color: 'amber',
    gradient: 'from-amber-500 to-amber-700',
    badgeColor: 'bg-amber-100 text-amber-700',
    description: 'وصول كامل مع أدوات الخبراء والتقارير المخصصة والـ API. للشركات والصناديق الاستثمارية.',
    features: [
      { text: 'جميع مميزات باقة المحلل', icon: Check },
      { text: 'استوديو الخبراء', icon: Crown },
      { text: 'تقارير مخصصة', icon: BarChart3 },
      { text: 'أدوات التحقق من البيانات', icon: Shield },
      { text: 'مفضلات غير محدودة', icon: Star },
      { text: 'تحليل AI ذو أولوية', icon: Brain },
      { text: 'وصول API كامل', icon: Database },
      { text: 'دعم فني أولوي', icon: Users },
    ],
    useCases: ['خبير استثمار', 'صندوق استثماري', 'شركة'],
    ctaText: 'اشترك الآن',
    ctaLink: '/register',
    popular: false,
  },
];

const comparisonFeatures: PlanFeature[] = [
  { name: 'تصفح اللوحات العامة', free: true, analyst: true, expert: true },
  { name: 'إشارات السوق', free: 'محدود', analyst: true, expert: true },
  { name: 'عدد المفضلات', free: '5', analyst: '50', expert: 'غير محدود' },
  { name: 'البحث في البيانات', free: 'أساسي', analyst: 'متقدم', expert: 'متقدم + فلاتر' },
  { name: 'قراءة المحتوى', free: true, analyst: true, expert: true },
  { name: 'بناء لوحات بيانات', free: false, analyst: true, expert: true },
  { name: 'استعلامات مخصصة', free: false, analyst: true, expert: true },
  { name: 'تصدير البيانات (CSV/PDF)', free: false, analyst: true, expert: true },
  { name: 'توصيات AI', free: false, analyst: true, expert: 'أولوية' },
  { name: 'إشعارات فورية', free: false, analyst: true, expert: true },
  { name: 'استوديو الخبراء', free: false, analyst: false, expert: true },
  { name: 'تقارير مخصصة', free: false, analyst: false, expert: true },
  { name: 'أدوات التحقق من البيانات', free: false, analyst: false, expert: true },
  { name: 'وصول API', free: false, analyst: false, expert: true },
  { name: 'دعم فني أولوي', free: false, analyst: false, expert: true },
];

const planFaqs = [
  {
    q: 'هل يمكنني تغيير الباقة في أي وقت؟',
    a: 'نعم، يمكنك الترقية أو تخفيض الباقة في أي وقت. عند الترقية يتم احتساب الفارق فقط. عند التخفيض يتم تفعيل الباقة الجديدة في بداية الدورة القادمة.',
  },
  {
    q: 'ما هي طرق الدفع المتاحة؟',
    a: 'نقبل الدفع عبر بطاقات الائتمان (Visa, Mastercard)، مدى، Apple Pay، وكذلك التحويل البنكي للاشتراكات السنوية.',
  },
  {
    q: 'هل يوجد خصم على الاشتراك السنوي؟',
    a: 'نعم، عند الاشتراك السنوي تحصل على شهرين مجاناً. باقة المحلل السنوية بـ 990 ر.س بدلاً من 1,188 ر.س، وباقة الخبير بـ 2,990 ر.س بدلاً من 3,588 ر.س.',
  },
  {
    q: 'هل يمكنني تجربة الباقة قبل الاشتراك؟',
    a: 'بالتأكيد! ابدأ بالباقة المجانية لاستكشاف المنصة. كما نقدم فترة تجريبية مجانية لمدة 7 أيام على باقتي المحلل والخبير.',
  },
  {
    q: 'هل يمكنني إلغاء الاشتراك؟',
    a: 'نعم، يمكنك إلغاء الاشتراك في أي وقت من إعدادات حسابك. ستستمر في الاستفادة من الباقة حتى نهاية الفترة المدفوعة.',
  },
  {
    q: 'ما الفرق بين إشارات السوق المحدودة والكاملة؟',
    a: 'في الباقة المجانية تشاهد أحدث 5 إشارات فقط مع تأخير 24 ساعة. في باقة المحلل والخبير تحصل على جميع الإشارات فور صدورها مع إشعارات فورية.',
  },
];

const PlanDetailsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PlanId>('analyst');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const activePlan = plans.find((p) => p.id === activeTab)!;

  const colorMap: Record<string, { bg: string; text: string; border: string; light: string; ring: string }> = {
    gray: { bg: 'bg-gray-600', text: 'text-gray-600', border: 'border-gray-300', light: 'bg-gray-50', ring: 'ring-gray-200' },
    blue: { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-300', light: 'bg-blue-50', ring: 'ring-blue-200' },
    amber: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-300', light: 'bg-amber-50', ring: 'ring-amber-200' },
  };

  const renderCellValue = (value: boolean | string) => {
    if (value === true) {
      return <Check size={18} className="text-emerald-500 mx-auto" />;
    }
    if (value === false) {
      return <X size={18} className="text-gray-300 mx-auto" />;
    }
    return <span className="text-sm font-medium text-gray-700">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#002B5C] to-[#004080] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Crown size={32} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">تفاصيل الباقات</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            تعرّف على كل باقة بالتفصيل واختر ما يناسب احتياجاتك الاستثمارية. قارن بين المميزات واتخذ القرار الأمثل.
          </p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors backdrop-blur-sm"
            >
              <ArrowLeft size={16} />
              صفحة الأسعار
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Plan Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
            {plans.map((plan) => {
              const isActive = activeTab === plan.id;
              const Icon = plan.icon;
              return (
                <button
                  key={plan.id}
                  onClick={() => setActiveTab(plan.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-l ${plan.gradient} text-white shadow-md`
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{plan.name}</span>
                  {plan.popular && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}`}>
                      شائع
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Plan Detail Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-16">
          {/* Plan Header */}
          <div className={`bg-gradient-to-l ${activePlan.gradient} p-8 text-white`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <activePlan.icon size={32} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl md:text-3xl font-bold">{activePlan.name}</h2>
                    <span className="text-sm bg-white/15 px-3 py-1 rounded-full backdrop-blur-sm">
                      {activePlan.nameEn}
                    </span>
                  </div>
                  <p className="text-white/80 mt-1 text-sm md:text-base max-w-lg">{activePlan.description}</p>
                </div>
              </div>
              <div className="text-center md:text-left">
                <div className="flex items-baseline gap-1 justify-center md:justify-start">
                  <span className="text-5xl font-bold">{activePlan.price}</span>
                  {activePlan.price !== '0' && <span className="text-lg text-white/80">ر.س</span>}
                </div>
                <p className="text-white/70 text-sm mt-1">{activePlan.period}</p>
              </div>
            </div>
          </div>

          {/* Plan Body */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Features List */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Check size={20} className={colorMap[activePlan.color].text} />
                  المميزات المتاحة
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activePlan.features.map((feature, i) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm ${colorMap[activePlan.color].light} ${colorMap[activePlan.color].border} border-opacity-30`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[activePlan.color].bg} bg-opacity-10`}>
                          <FeatureIcon size={16} className={colorMap[activePlan.color].text} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{feature.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Use Cases */}
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users size={20} className={colorMap[activePlan.color].text} />
                    لمن هذه الباقة؟
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {activePlan.useCases.map((useCase, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${colorMap[activePlan.color].light} ${colorMap[activePlan.color].text} border ${colorMap[activePlan.color].border} border-opacity-30`}
                      >
                        <Users size={14} />
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview Placeholder + CTA */}
              <div className="lg:col-span-1 space-y-6">
                {/* Preview Screenshot Area */}
                <div className={`rounded-2xl border-2 border-dashed ${colorMap[activePlan.color].border} p-6 text-center`}>
                  <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4 ${colorMap[activePlan.color].bg} bg-opacity-10`}>
                    <BarChart3 size={28} className={colorMap[activePlan.color].text} />
                  </div>
                  <p className="text-sm font-bold text-gray-700 mb-1">معاينة حية</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    لقطة شاشة توضيحية لواجهة باقة {activePlan.name} ستظهر هنا
                  </p>
                  <div className="mt-4 space-y-2">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-3 bg-gray-100 rounded-full" style={{ width: `${100 - n * 15}%`, marginRight: 'auto', marginLeft: 'auto' }} />
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Link
                  to={activePlan.ctaLink}
                  className={`block w-full text-center py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-md hover:shadow-lg bg-gradient-to-l ${activePlan.gradient} text-white hover:opacity-90`}
                >
                  {activePlan.ctaText}
                </Link>

                {activePlan.id !== 'free' && (
                  <p className="text-center text-xs text-gray-400">
                    تجربة مجانية لمدة 7 أيام - بدون التزام
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">مقارنة شاملة بين الباقات</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              قارن بين جميع المميزات المتاحة في كل باقة لاختيار الأنسب لاحتياجاتك
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-right py-4 px-6 text-sm font-bold text-gray-700 w-2/5">الميزة</th>
                    {plans.map((plan) => {
                      const Icon = plan.icon;
                      return (
                        <th key={plan.id} className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Icon size={20} className={colorMap[plan.color].text} />
                            <span className="text-sm font-bold text-gray-800">{plan.name}</span>
                            <span className="text-xs text-gray-400">
                              {plan.price === '0' ? 'مجاني' : `${plan.price} ر.س/شهر`}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, i) => (
                    <tr
                      key={i}
                      className={`border-b border-gray-50 transition-colors hover:bg-gray-50/50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                    >
                      <td className="py-3.5 px-6 text-sm text-gray-700 font-medium">{feature.name}</td>
                      <td className="py-3.5 px-4 text-center">{renderCellValue(feature.free)}</td>
                      <td className="py-3.5 px-4 text-center">{renderCellValue(feature.analyst)}</td>
                      <td className="py-3.5 px-4 text-center">{renderCellValue(feature.expert)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t border-gray-100">
                    <td className="py-4 px-6"></td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="py-4 px-4 text-center">
                        <Link
                          to={plan.ctaLink}
                          className={`inline-block px-5 py-2 rounded-lg text-sm font-bold transition-all hover:opacity-90 ${
                            plan.popular
                              ? `bg-gradient-to-l ${plan.gradient} text-white shadow-sm`
                              : `${colorMap[plan.color].light} ${colorMap[plan.color].text} border ${colorMap[plan.color].border}`
                          }`}
                        >
                          {plan.ctaText}
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">أسئلة شائعة حول الباقات</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              إجابات على أكثر الأسئلة شيوعاً حول الاشتراكات والباقات
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {planFaqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className={`bg-white rounded-xl border transition-all duration-200 ${
                    isOpen ? 'border-blue-200 shadow-sm' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-right"
                  >
                    <span className="font-bold text-gray-800 text-sm">{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-gray-400 flex-shrink-0 mr-4 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 -mt-1">
                      <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-[#002B5C] to-[#004080] rounded-2xl p-8 md:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-5 right-10 w-48 h-48 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-5 left-10 w-64 h-64 bg-blue-300 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">جاهز للبدء؟</h2>
              <p className="text-white/80 max-w-lg mx-auto mb-8">
                ابدأ مجاناً اليوم واكتشف كيف يمكن لرادار المستثمر مساعدتك في اتخاذ قرارات استثمارية أفضل
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-white text-[#002B5C] px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <Zap size={18} />
                  ابدأ الآن مجاناً
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors backdrop-blur-sm"
                >
                  <Users size={18} />
                  تواصل مع المبيعات
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Links */}
        <div className="text-center">
          <div className="flex justify-center gap-4 flex-wrap text-sm">
            <Link to="/pricing" className="text-blue-600 hover:text-blue-700 font-medium">
              صفحة الأسعار
            </Link>
            <span className="text-gray-300">|</span>
            <Link to="/faq" className="text-blue-600 hover:text-blue-700 font-medium">
              الأسئلة الشائعة
            </Link>
            <span className="text-gray-300">|</span>
            <Link to="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
              تواصل معنا
            </Link>
          </div>
          <div className="mt-6">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft size={16} />
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetailsPage;
