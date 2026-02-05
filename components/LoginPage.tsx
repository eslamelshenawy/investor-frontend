/**
 * Login Page - صفحة تسجيل الدخول
 * Modern split-layout design with branding
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
  TrendingUp,
  Shield,
  BarChart3,
  Zap,
  ArrowLeft,
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

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      const role = result.user?.role?.toUpperCase();
      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error || 'حدث خطأ في تسجيل الدخول');
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Right Side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 items-center justify-center p-12 overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-32 left-16 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
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
            منصتك الذكية لتحليل
            <span className="text-blue-400"> البيانات الاستثمارية </span>
            في المملكة العربية السعودية
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10">
            اتخذ قرارات استثمارية مبنية على بيانات حكومية رسمية وتحليلات ذكاء اصطناعي متقدمة.
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

      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 sm:p-8 relative">
        {/* Mobile logo */}
        <div className="absolute top-6 right-6 lg:hidden flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-black text-gray-900 text-sm">رادار المستثمر</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-2">مرحباً بعودتك</h2>
            <p className="text-gray-500 text-sm">سجّل دخولك للوصول إلى لوحة التحكم</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-6 flex items-center gap-3 text-red-700 text-sm animate-shake">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-11 pl-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm"
                  placeholder="example@email.com"
                  dir="ltr"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-11 pl-12 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm"
                  placeholder="••••••••"
                  dir="ltr"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                />
                <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">تذكرني</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                نسيت كلمة المرور؟
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2 active:scale-[0.98] disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  جارٍ تسجيل الدخول...
                </>
              ) : (
                <>
                  تسجيل الدخول
                  <ArrowLeft size={18} />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              ليس لديك حساب؟{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-400 text-[11px] mt-6">
            بتسجيل الدخول، فإنك توافق على{' '}
            <span className="underline cursor-pointer hover:text-gray-500">شروط الاستخدام</span>
            {' '}و{' '}
            <span className="underline cursor-pointer hover:text-gray-500">سياسة الخصوصية</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
