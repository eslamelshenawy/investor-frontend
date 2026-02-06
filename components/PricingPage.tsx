/**
 * Pricing Page - الأسعار والاشتراكات
 * Integrated with subscription API
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, Star, Zap, Crown, Loader2, CreditCard, X, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../src/services/api';

const PLAN_CONFIG = [
  {
    id: 'FREE',
    name: 'المجاني',
    nameEn: 'Free',
    icon: Star,
    color: 'gray',
    monthlyPrice: 0,
    annualPrice: 0,
    popular: false,
    features: [
      'تصفح مجموعات البيانات',
      'عرض الإشارات الذكية',
      'قراءة المحتوى المنشور',
      'حفظ 10 مفضلات',
      'بحث أساسي',
    ],
  },
  {
    id: 'ANALYST',
    name: 'محلل',
    nameEn: 'Analyst',
    icon: Zap,
    color: 'blue',
    monthlyPrice: 9900,
    annualPrice: 99000,
    popular: true,
    features: [
      'كل مميزات المجاني',
      'تصدير البيانات (CSV/PDF/Excel)',
      'إنشاء لوحات بيانات مخصصة',
      'استعلامات متقدمة',
      'توصيات ذكاء اصطناعي',
      'تنبيهات فورية',
      '50 مفضلة',
      'دعم عبر البريد',
    ],
  },
  {
    id: 'EXPERT',
    name: 'خبير',
    nameEn: 'Expert',
    icon: Crown,
    color: 'amber',
    monthlyPrice: 29900,
    annualPrice: 299000,
    popular: false,
    features: [
      'كل مميزات المحلل',
      'استوديو الخبراء',
      'تقارير مخصصة',
      'أدوات التحقق من البيانات',
      'API كامل',
      'دعم أولوية',
      'مفضلات غير محدودة',
      'لوحات بيانات غير محدودة',
    ],
  },
];

function formatPrice(halalas: number): string {
  return (halalas / 100).toLocaleString('ar-SA');
}

const PricingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [currentPlan, setCurrentPlan] = useState('FREE');
  const [subscriptionStatus, setSubscriptionStatus] = useState('');
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      api.getMySubscription().then(res => {
        if (res.success && res.data) {
          setCurrentPlan(res.data.plan.id);
          setSubscriptionStatus(res.data.status);
          setSubscriptionEnd(res.data.endDate);
        }
      });
    }
  }, [isAuthenticated]);

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }

    if (planId === 'FREE' || planId === currentPlan) return;

    setShowCheckout(planId);
  };

  const confirmSubscription = async () => {
    if (!showCheckout) return;
    setProcessing(true);

    // Create payment
    const callbackUrl = `${window.location.origin}/#/subscription/callback`;
    const res = await api.createSubscriptionPayment(showCheckout, billingCycle, callbackUrl);

    if (res.success && res.data) {
      if (res.data.mode === 'simulation') {
        // Dev mode - activate directly
        const activateRes = await api.activateSubscription(res.data.paymentId, showCheckout, billingCycle);
        if (activateRes.success) {
          setCurrentPlan(showCheckout);
          setSubscriptionStatus('ACTIVE');
          setShowCheckout(null);
          setSuccessMessage('تم تفعيل الاشتراك بنجاح!');
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } else if (res.data.paymentUrl) {
        // Redirect to Moyasar payment page
        window.location.href = res.data.paymentUrl;
        return;
      }
    }

    setProcessing(false);
  };

  const handleCancel = async () => {
    if (!confirm('هل أنت متأكد من إلغاء الاشتراك؟ سيبقى اشتراكك نشطاً حتى نهاية الفترة الحالية.')) return;

    setLoading(true);
    const res = await api.cancelSubscription();
    setLoading(false);

    if (res.success) {
      setSubscriptionStatus('CANCELLED');
      setSuccessMessage('تم إلغاء الاشتراك. سيبقى نشطاً حتى نهاية الفترة.');
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#002B5C] to-[#004080] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">خطط الأسعار</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            اختر الخطة المناسبة لاحتياجاتك. ابدأ مجاناً وقم بالترقية في أي وقت.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                billingCycle === 'MONTHLY' ? 'bg-white text-blue-900' : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              شهري
            </button>
            <button
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                billingCycle === 'ANNUAL' ? 'bg-white text-blue-900' : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              سنوي
              <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">وفر شهرين</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="container mx-auto px-4 max-w-5xl mt-6">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 text-center font-bold text-sm">
            {successMessage}
          </div>
        </div>
      )}

      {/* Plans */}
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLAN_CONFIG.map((plan) => {
            const price = billingCycle === 'ANNUAL' ? plan.annualPrice : plan.monthlyPrice;
            const isCurrentPlan = plan.id === currentPlan;
            const isCancelled = isCurrentPlan && subscriptionStatus === 'CANCELLED';

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl p-6 border-2 relative ${
                  plan.popular ? 'border-blue-500 shadow-lg shadow-blue-500/10' : isCurrentPlan ? 'border-emerald-500' : 'border-gray-100'
                }`}
              >
                {plan.popular && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    الأكثر شيوعاً
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    خطتك الحالية
                  </div>
                )}

                <div className="text-center mb-6">
                  <plan.icon size={32} className={`mx-auto mb-3 ${isCurrentPlan ? 'text-emerald-600' : plan.popular ? 'text-blue-600' : 'text-gray-400'}`} />
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-3">
                    {price === 0 ? (
                      <span className="text-4xl font-bold text-gray-900">مجاني</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-gray-900">{formatPrice(price)}</span>
                        <span className="text-sm text-gray-500 mr-1">ر.س / {billingCycle === 'ANNUAL' ? 'سنوياً' : 'شهرياً'}</span>
                      </>
                    )}
                  </div>
                  {billingCycle === 'ANNUAL' && plan.monthlyPrice > 0 && (
                    <p className="text-xs text-emerald-600 mt-1 font-medium">
                      يعادل {formatPrice(Math.round(plan.annualPrice / 12))} ر.س/شهر
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check size={16} className={isCurrentPlan ? 'text-emerald-500' : plan.popular ? 'text-blue-500' : 'text-emerald-500'} />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <div className="space-y-2">
                    {plan.id !== 'FREE' && (
                      <>
                        {isCancelled ? (
                          <div className="text-center text-sm text-amber-600 font-medium py-2">
                            ملغى - ينتهي {subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString('ar-SA') : ''}
                          </div>
                        ) : (
                          <button
                            onClick={handleCancel}
                            disabled={loading}
                            className="block w-full text-center py-3 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors text-sm"
                          >
                            {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'إلغاء الاشتراك'}
                          </button>
                        )}
                      </>
                    )}
                    <div className="text-center py-2 text-emerald-600 font-bold text-sm">
                      مفعّل
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    className={`block w-full text-center py-3 rounded-xl font-bold transition-colors ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : plan.id === 'FREE'
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {plan.id === 'FREE' ? 'الخطة المجانية' : 'اشترك الآن'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ hint */}
        <div className="text-center mt-12">
          <p className="text-gray-500 mb-4">لديك أسئلة حول الأسعار؟</p>
          <div className="flex justify-center gap-4">
            <Link to="/plan-details" className="text-blue-600 hover:text-blue-700 font-medium">
              تفاصيل الخطط
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

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !processing && setShowCheckout(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900">تأكيد الاشتراك</h3>
              <button onClick={() => !processing && setShowCheckout(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {(() => {
              const plan = PLAN_CONFIG.find(p => p.id === showCheckout);
              if (!plan) return null;
              const price = billingCycle === 'ANNUAL' ? plan.annualPrice : plan.monthlyPrice;
              return (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">{plan.name}</span>
                      <span className="text-lg font-black text-gray-900">{formatPrice(price)} ر.س</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      {billingCycle === 'ANNUAL' ? 'اشتراك سنوي' : 'اشتراك شهري'}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-500 bg-blue-50 rounded-xl p-3">
                    <CreditCard size={18} className="text-blue-500 shrink-0" />
                    <span>الدفع عبر Visa، Mastercard، مدى، Apple Pay</span>
                  </div>

                  <button
                    onClick={confirmSubscription}
                    disabled={processing}
                    className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                  >
                    {processing ? (
                      <><Loader2 size={18} className="animate-spin" /> جارٍ المعالجة...</>
                    ) : (
                      <><CreditCard size={18} /> ادفع {formatPrice(price)} ر.س</>
                    )}
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    يمكنك إلغاء الاشتراك في أي وقت. الدفع آمن ومشفر.
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPage;
