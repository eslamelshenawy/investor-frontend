import React from 'react';
import { 
  Star, 
  Download, 
  Globe, 
  ShieldCheck, 
  RefreshCw,
  Info 
} from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 sticky top-[140px]">
      {/* Main Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 bg-gov-blue text-white font-bold flex items-center gap-2">
          <Info size={18} />
          فهرس الخصائص
        </div>
        
        <div className="divide-y divide-gray-50">
          
          <div className="p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                <Star size={18} />
              </div>
              <span className="text-sm font-medium text-gray-600">التقييم الرسمي</span>
            </div>
            <div className="flex text-yellow-400">
               <Star size={16} fill="currentColor" />
               <Star size={16} fill="currentColor" />
               <Star size={16} fill="currentColor" />
               <Star size={16} fill="currentColor" />
               <Star size={16} className="text-gray-300" />
            </div>
          </div>

          <div className="p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Download size={18} />
              </div>
              <span className="text-sm font-medium text-gray-600">إجمالي التحميلات</span>
            </div>
            <span className="font-bold text-gray-800">1,204</span>
          </div>

          <div className="p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Globe size={18} />
              </div>
              <span className="text-sm font-medium text-gray-600">اللغة الرئيسية</span>
            </div>
            <span className="font-bold text-gray-800">العربية</span>
          </div>

          <div className="p-4 flex flex-col gap-3 group hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <ShieldCheck size={18} />
              </div>
              <span className="text-sm font-medium text-gray-600">نوع الرخصة</span>
            </div>
            <a href="#" className="text-xs text-gov-blue font-bold hover:underline mr-11">
              رخصة البيانات المفتوحة (V2)
            </a>
          </div>

           <div className="p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <RefreshCw size={18} />
              </div>
              <span className="text-sm font-medium text-gray-600">التحديث</span>
            </div>
            <span className="font-bold text-gray-800">شهري</span>
          </div>

        </div>
      </div>
      
      {/* Help Banner */}
      <div className="bg-gradient-to-br from-gov-light/20 to-blue-50 p-6 rounded-2xl border border-gov-light/20 text-center">
          <p className="text-xs text-gov-blue font-bold mb-3">هل واجهت مشكلة في البيانات؟</p>
          <button className="w-full bg-white text-gov-blue border border-gov-blue/20 py-2 rounded-xl text-[10px] font-bold hover:bg-gov-blue hover:text-white transition-all">
              فتح تذكرة دعم فني
          </button>
      </div>
    </div>
  );
};

export default Sidebar;