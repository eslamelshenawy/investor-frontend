/**
 * About Page - عن المنصة
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Database, TrendingUp, Users, Shield, Zap,
  Globe, BarChart3, Brain, ArrowLeft,
} from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#002B5C] to-[#004080] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Activity size={32} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">عن رادار المستثمر</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            منصة استثمارية ذكية تجمع البيانات الحكومية السعودية وتحللها بالذكاء الاصطناعي لتقديم رؤى استثمارية فريدة
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Mission */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">رسالتنا</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            نؤمن بأن البيانات المفتوحة هي مفتاح اتخاذ قرارات استثمارية ذكية. رادار المستثمر يحول البيانات الحكومية السعودية من أرقام خام إلى رؤى قابلة للتطبيق، مما يمكّن المستثمرين والمحللين من فهم السوق بشكل أعمق واتخاذ قرارات مبنية على بيانات حقيقية.
          </p>
        </section>

        {/* Features Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">ما يميزنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Database, title: 'بيانات حية', desc: 'أكثر من 17,400 مجموعة بيانات من المصادر الحكومية السعودية تتحدث تلقائياً', color: 'blue' },
              { icon: Brain, title: 'ذكاء اصطناعي', desc: 'تحليل البيانات وتوليد الإشارات والمحتوى باستخدام أحدث نماذج AI', color: 'purple' },
              { icon: TrendingUp, title: 'إشارات ذكية', desc: 'كشف الفرص والمخاطر الاستثمارية مع درجات ثقة وتأثير', color: 'emerald' },
              { icon: BarChart3, title: 'تقارير تفاعلية', desc: 'رسوم بيانية وتقارير قابلة للتخصيص والتصدير بأشكال متعددة', color: 'amber' },
              { icon: Shield, title: 'مصادر موثوقة', desc: 'جميع البيانات من مصادر حكومية رسمية ومنصة البيانات المفتوحة', color: 'red' },
              { icon: Zap, title: 'تحديث مستمر', desc: 'تحديث أوتوماتيكي للبيانات والتحليلات على مدار الساعة بدون تدخل يدوي', color: 'yellow' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-${f.color}-100`}>
                  <f.icon size={24} className={`text-${f.color}-600`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-[#002B5C] to-[#004080] rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-8 text-center">أرقام المنصة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { num: '17,400+', label: 'مجموعة بيانات' },
                { num: '129+', label: 'نقطة API' },
                { num: '12', label: 'نوع منشور' },
                { num: '9', label: 'مستويات صلاحيات' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-3xl font-bold mb-1">{s.num}</div>
                  <div className="text-white/70 text-sm">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">التقنيات المستخدمة</h2>
          <div className="flex flex-wrap gap-3">
            {['React 19', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Prisma', 'Gemini AI', 'Vite', 'TailwindCSS', 'PM2', 'SSE'].map(t => (
              <span key={t} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm">
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ابدأ الآن</h2>
          <p className="text-gray-600 mb-6">انضم إلى رادار المستثمر واحصل على رؤى استثمارية ذكية</p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="px-6 py-3 bg-[#002B5C] text-white rounded-xl font-bold hover:bg-[#003A7A] transition-colors">
              إنشاء حساب مجاني
            </Link>
            <Link to="/" className="px-6 py-3 bg-white text-[#002B5C] border border-[#002B5C] rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center gap-2">
              <ArrowLeft size={18} />
              الصفحة الرئيسية
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
