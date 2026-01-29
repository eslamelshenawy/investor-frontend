import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  MapPin, 
  Facebook, 
  Twitter, 
  Youtube, 
  MoreVertical,
  Heart,
  Image as ImageLucide,
  Briefcase,
  Mail,
  Calendar,
  Code,
  Globe,
  Plus,
  ArrowRight,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  UserCheck
} from 'lucide-react';

// --- Types ---
interface Friend {
  id: string;
  name: string;
  role: string;
  avatar: string;
  online: boolean;
}

interface GalleryItem {
  id: string;
  url: string;
  title: string;
  likes: number;
  comments: number;
}

// --- Dummy Data ---
const FRIENDS: Friend[] = [
  { id: '1', name: 'أحمد القحطاني', role: 'محلل مالي', avatar: 'https://i.pravatar.cc/150?u=1', online: true },
  { id: '2', name: 'سارة محمد', role: 'خبيرة استثمار', avatar: 'https://i.pravatar.cc/150?u=2', online: false },
  { id: '3', name: 'خالد ممدوح', role: 'اقتصادي', avatar: 'https://i.pravatar.cc/150?u=3', online: true },
  { id: '4', name: 'ليلى العتيبي', role: 'مديرة محافظ', avatar: 'https://i.pravatar.cc/150?u=4', online: true },
  { id: '5', name: 'عمر ياسين', role: 'مستشار قانوني', avatar: 'https://i.pravatar.cc/150?u=5', online: false },
  { id: '6', name: 'منى ابراهيم', role: 'محللة بيانات', avatar: 'https://i.pravatar.cc/150?u=6', online: true },
];

const GALLERY: GalleryItem[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80', title: 'تقرير السوق الأسبوعي', likes: 120, comments: 15 },
  { id: '2', url: 'https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80', title: 'تحليل قطاع الطاقة', likes: 85, comments: 8 },
  { id: '3', url: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&q=80', title: 'مؤشرات النمو 2030', likes: 240, comments: 32 },
  { id: '4', url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80', title: 'توقعات التضخم', likes: 56, comments: 4 },
  { id: '5', url: 'https://images.unsplash.com/photo-1526303322524-5114006c7104?auto=format&fit=crop&q=80', title: 'استثمارات التكنلوجيا', likes: 190, comments: 21 },
  { id: '6', url: 'https://images.unsplash.com/photo-1579532562310-a183d78211a2?auto=format&fit=crop&q=80', title: 'البحث الميداني', likes: 72, comments: 11 },
];

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('Profile');

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 animate-fadeIn" dir="rtl">
      {/* Page Header */}
      <div className="mb-6 text-right">
        <h2 className="text-xl font-bold text-gray-900">الملف الشخصي</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 justify-start">
          <span>الرئيسية</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span className="text-gray-900">ملف المستخدم</span>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        {/* Cover Image */}
        <div className="h-48 md:h-64 relative bg-gradient-to-r from-blue-100 via-indigo-100 to-emerald-50">
           <img 
            src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop" 
            alt="Cover" 
            className="w-full h-full object-cover opacity-40"
           />
           <button className="absolute bottom-4 right-4 bg-white/80 backdrop-blur text-gray-800 p-2 rounded-xl shadow-lg hover:bg-white transition-all">
              <ImageLucide size={18} />
           </button>
        </div>

        {/* Profile Info & Stats */}
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6 gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                <img src="https://i.pravatar.cc/150?u=mike" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                 <ImageLucide className="text-white" size={24} />
              </div>
            </div>

            {/* Basic Info */}
            <div className="text-center md:text-right flex-1 pt-12 md:pt-16">
              <h3 className="text-2xl font-black text-gray-900 leading-none">مايك نيلسن</h3>
              <p className="text-blue-600 font-bold mt-2 bg-blue-50 px-3 py-1 rounded-full inline-block text-xs uppercase tracking-widest">المشرف العام (Admin)</p>
            </div>

            {/* Stats */}
            <div className="flex gap-8 md:gap-12 py-2">
              <div className="text-center">
                <p className="text-xl font-black text-gray-900">938</p>
                <p className="text-xs text-gray-400 font-bold uppercase flex items-center gap-1 justify-center mt-1">
                   <ImageLucide size={12} /> منشوارت
                </p>
              </div>
              <div className="text-center border-x border-gray-100 px-8">
                <p className="text-xl font-black text-gray-900">3,586</p>
                <p className="text-xs text-gray-400 font-bold uppercase flex items-center gap-1 justify-center mt-1">
                  <Users size={12} /> متابعون
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-gray-900">2,659</p>
                <p className="text-xs text-gray-400 font-bold uppercase flex items-center gap-1 justify-center mt-1">
                   <UserPlus size={12} /> أتابعهم
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                  <Facebook size={18} fill="currentColor" />
                </button>
                <button className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center hover:bg-sky-400 hover:text-white transition-all shadow-sm">
                  <Twitter size={18} fill="currentColor" />
                </button>
              </div>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all">
                إضافة قصة جديد
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-t border-gray-100 pt-4 overflow-x-auto no-scrollbar gap-8">
             {[
               {id: 'Profile', label: 'البيانات الشخصية', icon: MoreVertical},
               {id: 'Friends', label: 'قائمة الأصدقاء', icon: Users},
               {id: 'Gallery', label: 'المعرض والتقارير', icon: ImageLucide}
             ].map(tab => (
               <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-1 py-3 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-800'}`}
               >
                 <tab.icon size={16} />
                 {tab.label}
                 {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* Dynamic Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-right">
        
        {/* --- Profile Section --- */}
        {activeTab === 'Profile' && (
          <>
            <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
               <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <h4 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2 justify-start"> نبذة عني <div className="w-2 h-2 bg-blue-600 rounded-full"></div></h4>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    محلل استثماري بخبرة تزيد عن 10 سنوات في أسواق الخليج. متخصص في تحليل البيانات الاقتصادية الكلية وتقديم التوصيات الاستراتيجية للمستثمرين الأفراد والمؤسسات.
                  </p>
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 text-sm text-gray-600 justify-start">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0"><Briefcase size={16}/></div>
                        <span>خبير رئيسي في رادار المستثمر</span>
                     </div>
                     <div className="flex items-center gap-3 text-sm text-gray-600 justify-start">
                        <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shrink-0"><Calendar size={16}/></div>
                        <span>انضم في يناير 2024</span>
                     </div>
                     <div className="flex items-center gap-3 text-sm text-gray-600 justify-start">
                        <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0"><Globe size={16}/></div>
                        <span>الرياض، المملكة العربية السعودية</span>
                     </div>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <h4 className="text-lg font-black text-gray-900 mb-6">الخبرات والمهارات</h4>
                  <div className="flex flex-wrap gap-2 justify-start">
                     {['التحليل المالي', 'استراتيجيات التداول', 'إدارة المحافظ', 'نمذجة البيانات', 'FinTech', 'الاستثمار العقاري'].map(skill => (
                        <span key={skill} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg border border-gray-100 hover:border-blue-200 hover:text-blue-600 cursor-default transition-all">
                           {skill}
                        </span>
                     ))}
                  </div>
               </div>
            </div>

            <div className="lg:col-span-8 space-y-6 order-1 lg:order-2">
               <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                     <h4 className="text-lg font-black text-gray-900">آخر التحليلات المنشورة</h4>
                     <button className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">عرض الكل <ChevronRight size={14} className="rtl:rotate-180"/></button>
                  </div>
                  <div className="space-y-4">
                     {[
                        {title: 'توقعات أسعار الطاقة للربع الثالث', date: 'منذ يومين', reach: '2.5k'},
                        {title: 'ملخص مؤشرات السوق المالية السعودية', date: 'منذ أسبوع', reach: '5.1k'}
                     ].map((p, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100 group cursor-pointer">
                           <div className="flex justify-between items-start">
                              <h5 className="font-bold text-gray-800 group-hover:text-blue-700">{p.title}</h5>
                              <span className="text-[10px] bg-white px-2 py-1 rounded-md text-gray-400 font-bold whitespace-nowrap">{p.date}</span>
                           </div>
                           <div className="flex items-center gap-3 mt-3 justify-start">
                              <div className="flex items-center gap-1 text-[11px] text-gray-400">
                                 <Users size={12}/> {p.reach} قراءة
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-gray-400">
                                 <MessageSquare size={12}/> 24 تعليق
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl text-white">
                     <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4"><TrendingUp size={20}/></div>
                     <h5 className="text-2xl font-black mb-1">94%</h5>
                     <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">دقة التوقعات السنوية</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-3xl text-white">
                     <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4"><Code size={20}/></div>
                     <h5 className="text-2xl font-black mb-1">12</h5>
                     <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider">نموذج تحليل ذكي</p>
                  </div>
               </div>
            </div>
          </>
        )}

        {/* --- Friends Section --- */}
        {activeTab === 'Friends' && (
          <div className="lg:col-span-12 space-y-6">
             <div className="flex justify-between items-center mb-2">
                <div>
                   <h4 className="text-xl font-black text-gray-900">الأصدقاء والزملاء</h4>
                   <p className="text-sm text-gray-500">لديك 42 صديق مشترك في الشبكة</p>
                </div>
                <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 flex items-center gap-2">
                   <Plus size={18} /> دعوة صديق
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FRIENDS.map(friend => (
                   <div key={friend.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all group flex items-center gap-4">
                      <div className="relative shrink-0">
                         <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-gray-50">
                            <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                         </div>
                         {friend.online && <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>}
                      </div>
                      <div className="flex-1">
                         <h5 className="font-bold text-gray-900 leading-none group-hover:text-blue-600 transition-colors">{friend.name}</h5>
                         <p className="text-[11px] text-blue-500 mt-1.5 font-bold uppercase tracking-wide">{friend.role}</p>
                      </div>
                      <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                         <MessageSquare size={18} />
                      </button>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* --- Gallery Section --- */}
        {activeTab === 'Gallery' && (
           <div className="lg:col-span-12 space-y-6">
              <div className="flex justify-between items-center">
                 <h4 className="text-xl font-black text-gray-900">معرض الوسائط والتقارير</h4>
                 <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white text-[10px] font-bold rounded-xl shadow-lg shadow-blue-500/20 uppercase tracking-widest">الكل</button>
                    <button className="px-4 py-2 bg-white border border-gray-100 text-gray-400 text-[10px] font-bold rounded-xl hover:bg-gray-50 transition-colors">الصور</button>
                    <button className="px-4 py-2 bg-white border border-gray-100 text-gray-400 text-[10px] font-bold rounded-xl hover:bg-gray-50 transition-colors">التقارير</button>
                 </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                 {GALLERY.map(item => (
                    <div key={item.id} className="group relative aspect-square rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 cursor-pointer">
                       <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                          <h5 className="text-white font-bold text-sm mb-2">{item.title}</h5>
                          <div className="flex items-center gap-4 text-white/80 text-[10px] justify-start">
                             <span className="flex items-center gap-1"><Heart size={12} fill="currentColor" /> {item.likes}</span>
                             <span className="flex items-center gap-1"><MessageSquare size={12}/> {item.comments}</span>
                          </div>
                       </div>
                    </div>
                 ))}
                 <div className="aspect-square rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-500 cursor-pointer transition-all">
                    <Plus size={32} className="mb-2 opacity-30" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">رفع جديد</span>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
