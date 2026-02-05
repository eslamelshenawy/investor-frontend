/**
 * Data Sources Page - مصادر البيانات
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, Building2, ExternalLink, Database, CheckCircle } from 'lucide-react';

const sources = [
  {
    name: 'منصة البيانات المفتوحة السعودية',
    nameEn: 'Saudi Open Data Portal',
    url: 'https://data.gov.sa',
    description: 'المصدر الرئيسي لجميع البيانات الحكومية المفتوحة في المملكة العربية السعودية',
    datasets: '17,400+',
    icon: Globe,
    color: 'bg-green-100 text-green-600',
  },
  {
    name: 'الهيئة العامة للإحصاء',
    nameEn: 'General Authority for Statistics',
    url: 'https://www.stats.gov.sa',
    description: 'الإحصاءات السكانية والاقتصادية والاجتماعية الرسمية',
    datasets: 'إحصاءات شاملة',
    icon: Building2,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    name: 'وزارة المالية',
    nameEn: 'Ministry of Finance',
    url: 'https://www.mof.gov.sa',
    description: 'بيانات الميزانية العامة والإيرادات والمصروفات الحكومية',
    datasets: 'بيانات مالية',
    icon: Building2,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    name: 'مؤسسة النقد العربي السعودي',
    nameEn: 'Saudi Central Bank (SAMA)',
    url: 'https://www.sama.gov.sa',
    description: 'بيانات القطاع المصرفي وأسعار الفائدة والتضخم',
    datasets: 'مؤشرات مالية',
    icon: Building2,
    color: 'bg-amber-100 text-amber-600',
  },
  {
    name: 'وزارة الموارد البشرية',
    nameEn: 'Ministry of Human Resources',
    url: 'https://www.hrsd.gov.sa',
    description: 'بيانات سوق العمل والتوظيف والتوطين',
    datasets: 'بيانات عمالية',
    icon: Building2,
    color: 'bg-cyan-100 text-cyan-600',
  },
  {
    name: 'الهيئة العامة للعقار',
    nameEn: 'Real Estate General Authority',
    url: 'https://www.rega.gov.sa',
    description: 'بيانات السوق العقاري والصفقات والمؤشرات العقارية',
    datasets: 'بيانات عقارية',
    icon: Building2,
    color: 'bg-rose-100 text-rose-600',
  },
];

const DataSourcesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-gradient-to-br from-[#002B5C] to-[#004080] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <Database size={36} className="mx-auto mb-3 text-white/80" />
          <h1 className="text-3xl font-bold mb-2">مصادر البيانات</h1>
          <p className="text-white/70 text-sm max-w-xl mx-auto">
            جميع بياناتنا مستمدة من مصادر حكومية رسمية وموثوقة
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Sources Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {sources.map((source, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${source.color}`}>
                  <source.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm">{source.name}</h3>
                  <p className="text-xs text-gray-400">{source.nameEn}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">{source.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-600 font-medium">{source.datasets}</span>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition"
                >
                  زيارة الموقع
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Verification Process */}
        <div className="mt-10 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">آلية التحقق من البيانات</h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'الاكتشاف', desc: 'مسح دوري لمنصة البيانات المفتوحة لاكتشاف مجموعات بيانات جديدة' },
              { step: '2', title: 'المزامنة', desc: 'سحب البيانات عبر واجهات برمجة التطبيقات الرسمية بشكل آمن' },
              { step: '3', title: 'التحقق', desc: 'فحص سلامة البيانات والتأكد من الاتساق مع الإصدارات السابقة' },
              { step: '4', title: 'المعالجة', desc: 'تنظيف وتصنيف البيانات وإثرائها بالتحليلات والإشارات الذكية' },
              { step: '5', title: 'العرض', desc: 'عرض البيانات في لوحات تفاعلية مع تحديثات في الوقت الحقيقي' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commitment */}
        <div className="mt-10 bg-green-50 rounded-2xl p-6 border border-green-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            التزامنا
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>- نعرض فقط بيانات من مصادر حكومية رسمية ومعتمدة</li>
            <li>- نذكر دائماً مصدر البيانات وتاريخ آخر تحديث</li>
            <li>- نوفر إمكانية التصدير حتى تتمكن من التحقق بنفسك</li>
            <li>- نبلّغ عن أي تأخير أو خلل في مزامنة البيانات</li>
          </ul>
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

export default DataSourcesPage;
