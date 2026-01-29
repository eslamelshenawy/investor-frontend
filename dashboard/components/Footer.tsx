import React from 'react';
import { Linkedin, Youtube, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20 pt-12 pb-6">
      <div className="container mx-auto px-4">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Section 1 */}
          <div>
            <h3 className="font-bold text-gov-blue mb-4">نظرة عامة</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-gov-blue">عن البوابة</a></li>
              <li><a href="#" className="hover:text-gov-blue">سياسة البيانات المفتوحة</a></li>
              <li><a href="#" className="hover:text-gov-blue">اتفاقية الاستخدام</a></li>
            </ul>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="font-bold text-gov-blue mb-4">روابط عامة</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-gov-blue">الفعاليات</a></li>
              <li><a href="#" className="hover:text-gov-blue">الأخبار</a></li>
              <li><a href="#" className="hover:text-gov-blue">المشاركة الإلكترونية</a></li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="font-bold text-gov-blue mb-4">الدعم الفني والمساعدة</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-gov-blue">الأسئلة الشائعة</a></li>
              <li><a href="#" className="hover:text-gov-blue">تواصل معنا</a></li>
              <li><a href="#" className="hover:text-gov-blue">خريطة الموقع</a></li>
            </ul>
          </div>

          {/* Social & Logos */}
          <div className="flex flex-col gap-6">
             <div className="flex gap-4">
                 <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gov-blue hover:text-white transition-colors">
                     <Linkedin size={20} />
                 </a>
                 <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gov-blue hover:text-white transition-colors">
                     <Youtube size={20} />
                 </a>
                 <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gov-blue hover:text-white transition-colors">
                     <Twitter size={20} />
                 </a>
                 <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gov-blue hover:text-white transition-colors">
                     <Instagram size={20} />
                 </a>
             </div>
             
             <div className="flex items-center gap-4 mt-auto">
                 {/* Vision 2030 Placeholder */}
                 <div className="h-12 w-20 border-2 border-gray-200 rounded flex items-center justify-center text-[10px] text-gray-400 font-bold">
                    VISION 2030
                 </div>
                 {/* SDAIA Placeholder */}
                 <div className="h-12 w-20 border-2 border-gray-200 rounded flex items-center justify-center text-[10px] text-gray-400 font-bold">
                    SDAIA
                 </div>
             </div>
          </div>

        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2025 المنصة الوطنية للبيانات المفتوحة. جميع الحقوق محفوظة.</p>
          <div className="flex gap-4">
              <a href="#" className="hover:text-gray-800">إمكانية الوصول</a>
              <span className="text-gray-300">|</span>
              <a href="#" className="hover:text-gray-800">سياسة الخصوصية</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;