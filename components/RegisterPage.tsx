/**
 * Register Page - صفحة التسجيل
 * Modern split-layout design matching login page
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  User,
  Check,
  TrendingUp,
  Shield,
  BarChart3,
  Zap,
  ArrowLeft,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const FEATURES = [
  {
    icon: BarChart3,
    title: 'بيانات حكومية موثوقة',
    desc: 'أكثر من 17,000 مجموعة بيانات من البوابة الوطنية',
  },
  {
    icon: Zap,
    title: 'إشارات استثمارية ذكية',
    desc: 'تحليلات فورية مدعومة بالذكاء الاصطناعي',
  },
  {
    icon: TrendingUp,
    title: 'لوحات تحكم تفاعلية',
    desc: 'تصور البيانات الاقتصادية في الوقت الحقيقي',
  },
  {
    icon: Shield,
    title: 'أمان وخصوصية',
    desc: 'تشفير كامل وحماية متقدمة لبياناتك',
  },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const passwordRequirements = [
    { id: 'length', label: '8 أحرف على الأقل', test: (p: string) => p.length >= 8 },
    { id: 'upper', label: 'حرف كبير واحد على الأقل', test: (p: string) => /[A-Z]/.test(p) },
    { id: 'lower', label: 'حرف صغير واحد على الأقل', test: (p: string) => /[a-z]/.test(p) },
    { id: 'number', label: 'رقم واحد على الأقل', test: (p: string) => /\d/.test(p) },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    const allRequirementsMet = passwordRequirements.every(req => req.test(formData.password));
    if (!allRequirementsMet) {
      setError('الرجاء التأكد من متطلبات كلمة المرور');
      return;
    }

    setIsLoading(true);
    const result = await register({
      name: formData.name,
      nameAr: formData.nameAr || formData.name,
      email: formData.email,
      password: formData.password,
    });
    setIsLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'حدث خطأ في التسجيل');
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Right Side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 items-center justify-center p-12 overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-32 left-16 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="relative z-10 max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <Activity size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">رادار المستثمر</h1>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-[0.3em] mt-1">Investor Radar</p>
            </div>
          </div>

          {/* Tagline */}
          <h2 className="text-2xl font-bold text-white/90 leading-relaxed mb-4">
            انضم إلى مجتمع
            <span className="text-emerald-400"> المستثمرين الأذكياء </span>
            في المملكة
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10">
            حساب مجاني يمنحك الوصول الكامل لأدوات التحليل والبيانات الاقتصادية السعودية.
          </p>

          {/* Features */}
          <div className="space-y-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all">
                  <f.icon size={18} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">{f.title}</h3>
                  <p className="text-slate-500 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats bar */}
          <div className="mt-12 flex items-center gap-8 pt-8 border-t border-white/5">
            <div>
              <p className="text-2xl font-black text-white">17K+</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">مجموعة بيانات</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className="text-2xl font-black text-white">52</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">قطاع اقتصادي</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className="text-2xl font-black text-white">24/7</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">تحديث مستمر</p>
            </div>
          </div>
        </div>
      </div>

      {/* Left Side - Register Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 sm:p-8 relative overflow-y-auto">
        {/* Mobile logo */}
        <div className="absolute top-6 right-6 lg:hidden flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-black text-gray-900 text-sm">رادار المستثمر</span>
        </div>

        <div className="w-full max-w-sm my-auto py-16 lg:py-4">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 mb-2">إنشاء حساب جديد</h2>
            <p className="text-gray-500 text-sm">انضم إلينا واكتشف فرص الاستثمار</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-5 flex items-center gap-3 text-red-700 text-sm">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">الاسم بالإنجليزية *</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pr-11 pl-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm"
                  placeholder="Ahmed Mohammed"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Arabic Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">الاسم بالعربية</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="nameAr"
                  value={formData.nameAr}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pr-11 pl-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm"
                  placeholder="أحمد محمد"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">البريد الإلكتروني *</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pr-11 pl-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm"
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">كلمة المرور *</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pr-11 pl-12 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm"
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {passwordRequirements.map(req => (
                    <div
                      key={req.id}
                      className={`flex items-center gap-1.5 text-xs transition-colors ${
                        req.test(formData.password) ? 'text-emerald-600' : 'text-gray-400'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        req.test(formData.password) ? 'bg-emerald-100' : 'bg-gray-100'
                      }`}>
                        <Check size={10} strokeWidth={3} />
                      </div>
                      {req.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">تأكيد كلمة المرور *</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full bg-gray-50 border rounded-xl py-2.5 pr-11 pl-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-300'
                      : 'border-gray-200'
                  }`}
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">كلمتا المرور غير متطابقتين</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2 active:scale-[0.98] disabled:shadow-none mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  جارٍ إنشاء الحساب...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  إنشاء الحساب
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                تسجيل الدخول
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-400 text-[11px] mt-4">
            بإنشاء الحساب، فإنك توافق على{' '}
            <span className="underline cursor-pointer hover:text-gray-500">شروط الاستخدام</span>
            {' '}و{' '}
            <span className="underline cursor-pointer hover:text-gray-500">سياسة الخصوصية</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
