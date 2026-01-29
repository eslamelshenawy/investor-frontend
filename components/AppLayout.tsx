/**
 * App Layout - تخطيط التطبيق
 * Main layout with Sidebar, Topbar, and content area
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  LogOut,
  Bell,
  Search,
  Plus,
  User as UserIcon,
  Activity,
  Star,
  ChevronDown,
  ChevronLeft,
  Clock,
  Zap,
  Home,
  Compass,
  Sparkles,
  Users,
  Database,
  Shield,
  Cpu,
  PenTool,
  BookOpen,
  Palette,
  Image as ImageIcon,
  ClipboardList,
  Layout,
  LayoutTemplate,
  PieChart,
  Bookmark
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import DecisionWizard from './DecisionWizard';

// Types
enum UserRole {
  STANDARD = 'STANDARD',
  ANALYST = 'ANALYST',
  EXPERT = 'EXPERT',
  WRITER = 'WRITER',
  DESIGNER = 'DESIGNER',
  CONTENT_MANAGER = 'CONTENT_MANAGER',
  EDITOR = 'EDITOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  CURBTRON = 'CURBTRON'
}

// --- Mobile Bottom Navigation ---
const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isPathActive = (path: string, end: boolean = false) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom,20px)] bg-white/95 backdrop-blur-lg border-t border-gray-200 z-50 lg:hidden flex justify-around items-start pt-3 px-2 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] transition-all">
      <div
        onClick={() => navigate('/')}
        className={`flex flex-col items-center justify-center w-full space-y-1 cursor-pointer active:scale-90 transition-transform duration-200 ${isPathActive('/', true) ? 'text-blue-600' : 'text-gray-400'}`}
      >
        <Compass size={24} strokeWidth={isPathActive('/', true) ? 2.5 : 2} />
        <span className="text-[10px] font-bold">الرئيسية</span>
      </div>

      <div
        onClick={() => navigate('/signals')}
        className={`flex flex-col items-center justify-center w-full space-y-1 cursor-pointer active:scale-90 transition-transform duration-200 ${isPathActive('/signals') ? 'text-blue-600' : 'text-gray-400'}`}
      >
        <Zap size={24} strokeWidth={isPathActive('/signals') ? 2.5 : 2} />
        <span className="text-[10px] font-bold">إشارات</span>
      </div>

      <div className="relative -top-8 cursor-pointer active:scale-90 transition-transform duration-200 group" onClick={() => navigate('/my-dashboards')}>
        <div className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/40 border-[4px] border-slate-50 group-hover:bg-blue-700">
          <Plus size={28} />
        </div>
      </div>

      <div
        onClick={() => navigate('/dashboards')}
        className={`flex flex-col items-center justify-center w-full space-y-1 cursor-pointer active:scale-90 transition-transform duration-200 ${isPathActive('/dashboards') ? 'text-blue-600' : 'text-gray-400'}`}
      >
        <LayoutDashboard size={24} strokeWidth={isPathActive('/dashboards') ? 2.5 : 2} />
        <span className="text-[10px] font-bold">اللوحات</span>
      </div>

      <div
        onClick={() => navigate('/timeline')}
        className={`flex flex-col items-center justify-center w-full space-y-1 cursor-pointer active:scale-90 transition-transform duration-200 ${isPathActive('/timeline') ? 'text-blue-600' : 'text-gray-400'}`}
      >
        <Clock size={24} strokeWidth={isPathActive('/timeline') ? 2.5 : 2} />
        <span className="text-[10px] font-bold">السجل</span>
      </div>
    </div>
  );
};

// --- Safe Navigation Helper ---
interface NavItemProps {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  end?: boolean;
  className?: string;
  badge?: React.ReactNode;
}

const NavItem = ({ to, icon: Icon, children, end = false, className = '', badge = null }: NavItemProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = end ? location.pathname === to : location.pathname.startsWith(to) && (to === '/' ? location.pathname === '/' : true);

  const baseClass = `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer select-none`;
  const activeClass = `bg-blue-600 text-white shadow-lg shadow-blue-900/40`;
  const inactiveClass = `hover:bg-slate-800 text-slate-400 hover:text-white`;

  return (
    <div
      onClick={() => navigate(to)}
      className={`${baseClass} ${isActive ? activeClass : inactiveClass} ${className}`}
    >
      {Icon && <Icon size={18} className={`group-hover:scale-110 transition-transform duration-200 ${isActive ? "fill-white text-white" : ""}`} />}
      {children}
      {badge}
    </div>
  );
};

// --- NavGroup Helper ---
const NavGroup = ({ title, open, onToggle, children }: { title: string, open: boolean, onToggle: () => void, children: React.ReactNode }) => (
  <div className="mb-2">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all mb-1 group"
    >
      <span className="text-[10px] font-bold uppercase tracking-widest group-hover:text-blue-400 transition-colors">{title}</span>
      <ChevronDown size={14} className={`transition-transform duration-300 text-slate-600 group-hover:text-slate-400 ${open ? 'rotate-180' : ''}`} />
    </button>
    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  </div>
);

// --- Sidebar Component ---
const Sidebar = ({ role }: { role: string }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const isAtLeast = (target: UserRole) => {
    const hierarchy = [
      UserRole.STANDARD,
      UserRole.ANALYST,
      UserRole.EXPERT,
      UserRole.WRITER,
      UserRole.DESIGNER,
      UserRole.CONTENT_MANAGER,
      UserRole.EDITOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.CURBTRON
    ];
    return hierarchy.indexOf(role as UserRole) >= hierarchy.indexOf(target);
  };

  const isAdmin = isAtLeast(UserRole.ADMIN);
  const isExpert = isAtLeast(UserRole.EXPERT);
  const isAnalyst = isAtLeast(UserRole.ANALYST);
  const isWriter = isAtLeast(UserRole.EXPERT);
  const isDesigner = role === UserRole.DESIGNER || isAtLeast(UserRole.ADMIN);
  const isContentManager = role === UserRole.CONTENT_MANAGER || isAtLeast(UserRole.SUPER_ADMIN);
  const isSuperAdmin = isAtLeast(UserRole.SUPER_ADMIN);
  const isCurbTron = role === UserRole.CURBTRON;

  const [sections, setSections] = React.useState({
    discovery: true,
    data: true,
    workspace: true,
    apps: false,
    authoring: true,
    creative: true,
    editorial: true,
    admin: true
  });

  const toggle = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen sticky top-0 hidden lg:flex flex-col shadow-2xl z-50 overflow-hidden border-l border-slate-800">
      {/* Brand */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3 bg-slate-950/20 shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Activity size={24} className="text-white" />
        </div>
        <div>
          <h1 className="font-black text-lg tracking-tight leading-none bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">رادار المستثمر</h1>
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1 opacity-80 underline decoration-blue-500/30 underline-offset-4">Investor Radar</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        <NavGroup title="المحور الرئيسي" open={sections.discovery} onToggle={() => toggle('discovery')}>
          <NavItem to="/" icon={Compass} end>مركز الاكتشاف</NavItem>
          <NavItem to="/signals" icon={Zap}>إشارات السوق</NavItem>
          <NavItem to="/timeline" icon={Clock}>سجل التغييرات</NavItem>
          <NavItem to="/followers" icon={Users}>المجتمع</NavItem>
        </NavGroup>

        <div className="my-2 border-t border-slate-800/40 mx-2"></div>

        <NavGroup title="البيانات والتحليل" open={sections.data} onToggle={() => toggle('data')}>
          <NavItem to="/dashboards" icon={LayoutDashboard}>كل اللوحات</NavItem>
          {isExpert && (
            <NavItem to="/expert-studio" icon={LayoutTemplate} className="text-amber-400 hover:text-amber-300 shadow-amber-500/10 hover:shadow-amber-500/20">استوديو الخبراء</NavItem>
          )}
          {isAnalyst && (
            <>
              <NavItem to="/builder" icon={PieChart}>بناء اللوحات</NavItem>
              <NavItem to="/queries" icon={Search}>المسح البياني</NavItem>
            </>
          )}
        </NavGroup>

        <div className="my-2 border-t border-slate-800/40 mx-2"></div>

        <NavGroup title="مساحتي" open={sections.workspace} onToggle={() => toggle('workspace')}>
          <NavItem to="/favorites" icon={Bookmark}>مفضلتي</NavItem>
          <NavItem to="/my-dashboards" icon={Star}>لوحاتي الخاصة</NavItem>
        </NavGroup>

        <NavGroup title="التطبيقات" open={sections.apps} onToggle={() => toggle('apps')}>
          <NavItem to="/profile" icon={UserIcon}>ملف المستخدم</NavItem>
        </NavGroup>

        {(isWriter || isDesigner || isContentManager || isAdmin) && (
          <div className="my-2 border-t border-slate-800/40 mx-2"></div>
        )}

        {isWriter && (
          <NavGroup title="Authoring Center" open={sections.authoring} onToggle={() => toggle('authoring')}>
            <NavItem to="/writer/create" icon={PenTool}>إنشاء منشور</NavItem>
            <NavItem to="/writer/drafts" icon={BookOpen}>مسوداتي</NavItem>
            <NavItem to="/writer/research" icon={Database}>المراجع</NavItem>
          </NavGroup>
        )}

        {isDesigner && (
          <NavGroup title="Creative Studio" open={sections.creative} onToggle={() => toggle('creative')}>
            <NavItem to="/designer/assets" icon={ImageIcon}>Asset Manager</NavItem>
            <NavItem to="/designer/upload" icon={Palette}>رفع تصاميم</NavItem>
          </NavGroup>
        )}

        {isContentManager && (
          <NavGroup title="Editorial Desk" open={sections.editorial} onToggle={() => toggle('editorial')}>
            <NavItem to="/editorial/approvals" icon={ClipboardList}>مراجعة المحتوى</NavItem>
            <NavItem to="/editorial/schedule" icon={Clock}>جدولة المنشورات</NavItem>
          </NavGroup>
        )}

        {isAdmin && (
          <NavGroup title="System Admin" open={sections.admin} onToggle={() => toggle('admin')}>
            <NavItem to="/admin" icon={Shield}>لوحة التحكم</NavItem>
            <NavItem to="/admin/datasets" icon={Database}>قواعد البيانات</NavItem>
            {isSuperAdmin && <NavItem to="/super/users" icon={Users}>المستخدمين</NavItem>}
            {isCurbTron && <NavItem to="/curbtron/core" icon={Cpu}>CurbTron Nexus</NavItem>}
          </NavGroup>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/30 backdrop-blur-sm shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-white hover:bg-red-500/10 rounded-lg w-full text-sm font-medium transition-colors border border-transparent hover:border-red-500/20 group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
};

// --- Topbar Component ---
const Topbar = ({ onOpenWizard }: { onOpenWizard: () => void }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getPageInfo = (pathname: string) => {
    if (pathname === '/') return { title: 'مركز الاكتشاف', section: 'الرئيسية' };
    if (pathname.includes('/dashboards')) return { title: 'اللوحات الرسمية', section: 'البيانات' };
    if (pathname.includes('/my-dashboards')) return { title: 'مساحة العمل الخاصة', section: 'لوحاتي' };
    if (pathname.includes('/signals')) return { title: 'إشارات السوق', section: 'الذكاء الاصطناعي' };
    if (pathname.includes('/timeline')) return { title: 'سجل التغييرات', section: 'المتابعة' };
    if (pathname.includes('/followers')) return { title: 'اكتشاف المتابعين', section: 'المجتمع' };
    if (pathname.includes('/admin')) return { title: 'إدارة النظام', section: 'Admin' };
    if (pathname.includes('/dataset')) return { title: 'تفاصيل البيانات', section: 'الستكشاف' };
    if (pathname.includes('/builder')) return { title: 'Dashboard Builder', section: 'تحليل' };
    if (pathname.includes('/queries')) return { title: 'الاستعلامات', section: 'تحليل' };
    if (pathname.includes('/profile')) return { title: 'ملف المستخدم', section: 'التطبيقات' };
    return { title: 'لوحة التحكم', section: 'رادار' };
  };

  const { title, section } = getPageInfo(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-[60px] lg:h-[72px] sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 border-b border-gray-200/80 transition-all duration-300">
      <div className="px-4 lg:px-8 h-full flex items-center justify-between gap-3 lg:gap-6">

        <div className="flex items-center flex-1 gap-4 lg:gap-10">
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
              <Activity size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm hidden sm:block">رادار المستثمر</span>
          </div>

          <div className="relative group w-full max-w-md hidden md:block">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full py-2.5 pr-10 pl-12 text-sm text-gray-900 bg-gray-100/50 border border-gray-200/60 rounded-xl focus:ring-4 focus:ring-blue-50/10 focus:border-blue-500 focus:bg-white transition-all placeholder-gray-400 shadow-sm hover:bg-white"
              placeholder="ابحث عن مؤشر، تقرير، أو خبير..."
            />
          </div>

          <div className="hidden xl:flex items-center gap-2 text-sm text-gray-400 font-medium">
            <span className="hover:text-gray-800 cursor-pointer transition-colors flex items-center gap-1">
              <Home size={14} className="mb-0.5" />
              {section}
            </span>
            <ChevronLeft size={14} className="text-gray-300 rtl:rotate-180" />
            <span className="text-gray-900 font-bold bg-gray-100/80 px-3 py-1 rounded-lg border border-gray-200/50 shadow-sm">
              {title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-5">
          <button
            onClick={onOpenWizard}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl lg:px-4 lg:py-2 text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 border border-blue-500 overflow-hidden group relative"
          >
            <Sparkles size={18} className="group-hover:animate-spin" />
            <span className="hidden lg:inline relative z-10">المستشار الذكي</span>
          </button>

          <button className="relative p-2 lg:p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100 group">
            <Bell size={22} className="group-hover:animate-swing" />
          </button>

          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 cursor-pointer pl-2 pr-1 py-1 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200/60 group"
          >
            <div className="hidden lg:block text-left">
              <p className="text-sm font-bold text-gray-800 leading-none mb-1 group-hover:text-blue-700 transition-colors">
                {user?.nameAr || user?.name || 'مستخدم'}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide group-hover:text-blue-500/70">
                {user?.role || 'STANDARD'}
              </p>
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl border border-gray-100 shadow-sm bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold group-hover:ring-2 ring-blue-500/20 transition-all">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// --- Main App Layout ---
const AppLayout = () => {
  const { user } = useAuth();
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans overflow-x-hidden" dir="rtl">
      <Sidebar role={user?.role || 'STANDARD'} />

      <main className="flex-1 transition-all duration-300 pb-24 lg:pb-0 min-w-0">
        <Topbar onOpenWizard={() => setIsWizardOpen(true)} />
        <div className="animate-fadeIn">
          <Outlet />
        </div>
      </main>

      <DecisionWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
      <MobileBottomNav />
    </div>
  );
};

export default AppLayout;
