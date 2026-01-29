
import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  Target, 
  MapPin, 
  Wallet,
  TrendingUp,
  BarChart2,
  AlertCircle
} from 'lucide-react';

interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const DecisionWizard: React.FC<WizardProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    sector: '',
    region: '',
    budget: ''
  });

  const sectors = [
    { id: 'tech', label: 'التقنية والابتكار', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'realestate', label: 'العقارات والإنشاءات', icon: MapPin, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'industry', label: 'الصناعة والتعدين', icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'tourism', label: 'السياحة والترفيه', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-50' }
  ];

  const regions = ['الرياض', 'مكة المكرمة', 'المنطقة الشرقية', 'المدينة المنورة', 'نيوم'];
  const budgets = ['أقل من 500 ألف', '500 ألف - 2 مليون', '2 مليون - 10 مليون', 'أكثر من 10 مليون'];

  if (!isOpen) return null;

  const progress = (step / 4) * 100;

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fadeIn" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
           <div 
             className="h-full bg-blue-600 transition-all duration-500 ease-out"
             style={{ width: `${progress}%` }}
           ></div>
        </div>

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-gray-900 leading-tight">مساعد الاستثمار الذكي</h3>
            <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">الخطوة {step} من 4</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 min-h-[400px]">
          {step === 1 && (
            <div className="animate-fadeIn">
              <h4 className="text-xl font-bold mb-6 text-gray-800">ما هو القطاع الذي تهتم به؟</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sectors.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => { setFormData({...formData, sector: s.label}); handleNext(); }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 group ${formData.sector === s.label ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'}`}
                  >
                    <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <s.icon size={24} />
                    </div>
                    <span className="font-bold text-gray-700">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fadeIn">
              <h4 className="text-xl font-bold mb-6 text-gray-800">في أي منطقة تخطط للاستثمار؟</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {regions.map(r => (
                  <div 
                    key={r}
                    onClick={() => { setFormData({...formData, region: r}); handleNext(); }}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer font-bold text-center ${formData.region === r ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}
                  >
                    {r}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fadeIn">
              <h4 className="text-xl font-bold mb-6 text-gray-800">حدد نطاق الميزانية التقديرية (ريال سعودي)</h4>
              <div className="space-y-3">
                {budgets.map(b => (
                  <div 
                    key={b}
                    onClick={() => { setFormData({...formData, budget: b}); handleNext(); }}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer font-bold flex justify-between items-center ${formData.budget === b ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}
                  >
                    <span>{b}</span>
                    <Wallet size={18} className="opacity-40" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fadeIn space-y-8">
              <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-xl shadow-blue-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <h4 className="text-xl font-bold mb-2 relative z-10">توصية المستشار لـ {formData.region}</h4>
                <p className="text-blue-100 text-sm opacity-90 relative z-10">بناءً على اختيارك لقطاع {formData.sector} بميزانية {formData.budget}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <TrendingUp className="mx-auto text-green-500 mb-2" size={20} />
                    <p className="text-lg font-black text-gray-900">مرتفع</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">الطلب المتوقع</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <BarChart2 className="mx-auto text-blue-500 mb-2" size={20} />
                    <p className="text-lg font-black text-gray-900">4.2%</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">نمو سنوي</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <AlertCircle className="mx-auto text-amber-500 mb-2" size={20} />
                    <p className="text-lg font-black text-gray-900">متوسط</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">مستوى المخاطرة</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed bg-blue-50/50 p-4 rounded-2xl border border-blue-100 italic">
                "تشير البيانات التاريخية في {formData.region} إلى أن قطاع {formData.sector} يشهد زخماً كبيراً حالياً، وننصحك بالتركيز على المناطق الشمالية لتحقيق أقصى عائد."
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between gap-4">
            {step > 1 && step < 4 && (
                <button 
                  onClick={handleBack}
                  className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors"
                >
                  <ChevronRight size={18} className="rotate-180" /> السابق
                </button>
            )}
            
            {step < 4 ? (
               <div className="flex-1 flex justify-end">
                    <button 
                        onClick={step === 4 ? onClose : handleNext}
                        className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                        {step === 3 ? 'عرض النتائج' : 'الاستمرار'}
                        <ChevronLeft size={18} />
                    </button>
               </div>
            ) : (
                <button 
                    onClick={onClose}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all"
                >
                    تم، ابدأ استكشاف البيانات
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default DecisionWizard;
