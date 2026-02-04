
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate, useSearchParams, Navigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  PieChart,
  LogOut,
  Bell,
  Search,
  Plus,
  X,
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
  Bookmark
} from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import {
  UserRole,
  User,
  Dashboard,
  Widget,
  ChartType,
  TimelineEvent,
  TimelineEventType
} from './types';
import {
  CURRENT_USER,
  DATASETS,
  INITIAL_DASHBOARDS,
  WIDGETS,
  TIMELINE_EVENTS,
  FEED_ITEMS
} from './constants';
import WidgetCard from './components/WidgetCard';
import TimelineCard from './components/TimelineCard';
import HomeFeed from './components/HomeFeed';
import HomeFeedWrapper from './components/HomeFeedWrapper';
import DatasetContent from './components/DatasetContent';
import DecisionWizard from './components/DecisionWizard';
import UserProfile from './components/UserProfile';
import FollowersPage from './components/FollowersPage';
import FollowersWrapper from './components/FollowersWrapper';
import AISignalsPage from './components/AISignalsPage';
import OfficialDashboardsPage from './components/OfficialDashboardsPage';
import DashboardDetailPage from './components/DashboardDetailPage';
import ExpertBuilderPage from './components/ExpertBuilderPage';
import ExpertBuilderWrapper from './components/ExpertBuilderWrapper';
import FavoritesPage from './components/FavoritesPage';
import ChartBuilderPage from './components/ChartBuilderPage';
import AdminDashboardPage from './components/AdminDashboardPage';
import TimelineWrapper from './components/TimelineWrapper';
import DataAnalysisPage from './components/DataAnalysisPage';
import OfficialDashboardsWrapper from './components/OfficialDashboardsWrapper';
import DatasetsPage from './components/DatasetsPage';
import PublicHomePage from './components/PublicHomePage';

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
        onClick={() => navigate('/dashboard')}
        className={`flex flex-col items-center justify-center w-full space-y-1 cursor-pointer active:scale-90 transition-transform duration-200 ${isPathActive('/dashboard', true) ? 'text-blue-600' : 'text-gray-400'}`}
      >
        <Compass size={24} strokeWidth={isPathActive('/dashboard', true) ? 2.5 : 2} />
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
  const isActive = end
    ? (location.pathname === to || (to === '/dashboard' && location.pathname === '/'))
    : location.pathname.startsWith(to) && (to === '/dashboard' ? (location.pathname === '/dashboard' || location.pathname === '/') : true);

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
const Sidebar = ({ role, dashboards }: { role: string, dashboards: Dashboard[] }) => {
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
    // Handle backend role format (ADMIN) vs frontend format (Admin)
    const normalizedRole = role?.toUpperCase();
    const roleIndex = hierarchy.findIndex(r => r.toUpperCase() === normalizedRole || r === role);
    const targetIndex = hierarchy.indexOf(target);
    return roleIndex >= targetIndex;
  };

  const isAdmin = isAtLeast(UserRole.ADMIN);
  const isExpert = isAtLeast(UserRole.EXPERT);
  const isAnalyst = isAtLeast(UserRole.ANALYST);
  const isWriter = isAtLeast(UserRole.EXPERT);
  const isDesigner = role === UserRole.DESIGNER || isAtLeast(UserRole.ADMIN);
  const isContentManager = role === UserRole.CONTENT_MANAGER || isAtLeast(UserRole.SUPER_ADMIN);
  const isSuperAdmin = isAtLeast(UserRole.SUPER_ADMIN);
  const isCurbTron = role === UserRole.CURBTRON;

  const [sections, setSections] = useState({
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
        {/* Admin Panel - Top Priority */}
        {isAdmin && (
          <>
            <div className="mb-3">
              <NavItem to="/admin" icon={Shield} className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 hover:from-amber-500/30 hover:to-orange-500/30">
                لوحة التحكم
              </NavItem>
            </div>
            <div className="my-2 border-t border-slate-800/40 mx-2"></div>
          </>
        )}

        <NavGroup title="المحور الرئيسي" open={sections.discovery} onToggle={() => toggle('discovery')}>
          <NavItem to="/dashboard" icon={Compass} end>مركز الاكتشاف</NavItem>
          <NavItem to="/signals" icon={Zap}>إشارات السوق</NavItem>
          <NavItem to="/timeline" icon={Clock}>سجل التغييرات</NavItem>
          <NavItem to="/followers" icon={Users}>المجتمع</NavItem>
        </NavGroup>

        <div className="my-2 border-t border-slate-800/40 mx-2"></div>

        <NavGroup title="البيانات والتحليل" open={sections.data} onToggle={() => toggle('data')}>
          <NavItem to="/datasets" icon={Database}>مجموعات البيانات</NavItem>
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
          {dashboards.filter(d => d.type === 'user').map(d => (
            <NavItem key={d.id} to={`/my-dashboards?id=${d.id}`} icon={Layout} className="pl-8 opacity-70 scale-95 border-l border-slate-700 ml-4">{d.name}</NavItem>
          ))}
        </NavGroup>

        <NavGroup title="التطبيقات" open={sections.apps} onToggle={() => toggle('apps')}>
          <NavItem to="/profile" icon={UserIcon}>ملف المستخدم</NavItem>
        </NavGroup>
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
    if (pathname === '/' || pathname === '/dashboard') return { title: 'مركز الاكتشاف', section: 'الرئيسية' };
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

// --- Page: User Dashboards ---
const MyDashboards = ({
  dashboards,
  widgets,
  currentUser,
  onCreate,
  onAddWidget,
  onAddExternalWidget,
  onRemoveWidget
}: {
  dashboards: Dashboard[],
  widgets: Widget[],
  currentUser: User,
  onCreate: (name: string) => void,
  onAddWidget: (dashId: string, widgetId: string) => void,
  onAddExternalWidget: (dashId: string, idOrUrl: string, title?: string, desc?: string) => void,
  onRemoveWidget: (dashId: string, widgetId: string) => void
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramId = searchParams.get('id');

  const initialId = (paramId && dashboards.find(d => d.id === paramId)) ? paramId : dashboards[0]?.id || '';
  const [activeTab, setActiveTab] = useState(initialId);

  const [isModalOpen, setModalOpen] = useState(false);
  const [newDashName, setNewDashName] = useState('');
  const [isWidgetLibraryOpen, setWidgetLibraryOpen] = useState(false);

  const [externalInput, setExternalInput] = useState('');
  const [externalTitle, setExternalTitle] = useState('');
  const [externalDesc, setExternalDesc] = useState('');
  const [externalError, setExternalError] = useState('');

  const activeDashboard = dashboards.find(d => d.id === activeTab);
  const canAddUrl = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.EXPERT || currentUser.role === UserRole.ANALYST;

  useEffect(() => {
    if (paramId && dashboards.some(d => d.id === paramId)) {
      setActiveTab(paramId);
    } else if (!activeDashboard && dashboards.length > 0) {
      setActiveTab(dashboards[0].id);
    }
  }, [paramId, dashboards, activeDashboard]);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setSearchParams({ id });
  }

  const handleExternalSubmit = () => {
    setExternalError('');
    if (!externalInput) {
      setExternalError('الرجاء إدخال المعرف أو الرابط');
      return;
    }

    const isUrl = externalInput.startsWith('http');

    if (isUrl && !canAddUrl) {
      setExternalError('عذراً، إضافة روابط خارجية غير متاح لصلاحياتك الحالية.');
      return;
    }

    if (isUrl && !externalTitle) {
      setExternalError('الرجاء تحديد عنوان للمؤشر الخارجي');
      return;
    }

    if (activeDashboard) {
      onAddExternalWidget(activeDashboard.id, externalInput, externalTitle, externalDesc);
      setExternalInput('');
      setExternalTitle('');
      setExternalDesc('');
      setWidgetLibraryOpen(false);
    }
  };

  if (dashboards.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-[80vh]">
        <div className="bg-blue-50 p-6 rounded-full mb-4">
          <PieChart size={48} className="text-blue-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">ليس لديك أي لوحات خاصة</h2>
        <p className="text-gray-500 mt-2 mb-6 text-center max-w-md">قم بإنشاء لوحة خاصة بك وقم بإضافة المؤشرات التي تهمك لمتابعتها بشكل دوري.</p>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all"
        >
          <Plus size={20} />
          إنشاء لوحة جديدة
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8">
      <div className="flex justify-between items-start mb-6 lg:mb-8">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">لوحاتي</h2>
          <p className="text-sm text-gray-500 mt-1">تخصيص البيانات حسب اهتماماتك</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 shadow-sm font-medium transition-colors text-sm"
        >
          <Plus size={18} />
          لوحة جديدة
        </button>
      </div>

      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto gap-1 no-scrollbar">
        {dashboards.map(d => (
          <button
            key={d.id}
            onClick={() => handleTabChange(d.id)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap hover:bg-gray-50 rounded-t-lg ${activeTab === d.id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {d.name}
          </button>
        ))}
      </div>

      {activeDashboard && (
        <>
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setWidgetLibraryOpen(true)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors font-medium border border-blue-100 w-full md:w-auto justify-center"
            >
              <Plus size={16} /> إضافة Widget للوحة
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 min-h-[300px] pb-4">
            {activeDashboard.widgets.length === 0 ? (
              <div className="col-span-full border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-12 text-gray-400 bg-gray-50/50">
                <Plus size={40} className="mb-2 opacity-50" />
                <p>هذه اللوحة فارغة. أضف بعض البيانات!</p>
              </div>
            ) : (
              activeDashboard.widgets.map(widgetId => {
                const widget = widgets.find(w => w.id === widgetId);
                return widget ? (
                  <WidgetCard
                    key={widget.id}
                    widget={widget}
                    role={currentUser.role}
                    isCustomDashboard={true}
                    onRemove={() => onRemoveWidget(activeDashboard.id, widget.id)}
                  />
                ) : null;
              })
            )}
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scaleIn">
            <h3 className="text-lg font-bold mb-4">إنشاء لوحة جديدة</h3>
            <input
              autoFocus
              type="text"
              value={newDashName}
              onChange={(e) => setNewDashName(e.target.value)}
              placeholder="اسم اللوحة"
              className="w-full border border-gray-300 rounded-lg p-3 mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">إلغاء</button>
              <button
                onClick={() => {
                  if (newDashName) {
                    onCreate(newDashName);
                    setNewDashName('');
                    setModalOpen(false);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                إنشاء
              </button>
            </div>
          </div>
        </div>
      )}

      {isWidgetLibraryOpen && activeDashboard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl animate-scaleIn">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">مكتبة المؤشرات</h3>
                <p className="text-sm text-gray-500">اختر المؤشرات لإضافتها إلى "{activeDashboard.name}"</p>
              </div>
              <button onClick={() => setWidgetLibraryOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 flex-1 content-start">
              {widgets.filter(w => !activeDashboard.widgets.includes(w.id) && w.type !== ChartType.EXTERNAL).map(widget => (
                <div key={widget.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-400 transition-all flex justify-between items-center h-24">
                  <div>
                    <h4 className="font-bold text-gray-800 line-clamp-1">{widget.title}</h4>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-2 inline-block">{widget.category}</span>
                  </div>
                  <button
                    onClick={() => {
                      onAddWidget(activeDashboard.id, widget.id);
                      setWidgetLibraryOpen(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg shadow-blue-500/30"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setWidgetLibraryOpen(false)} className="w-full bg-gray-100 p-2 rounded text-gray-600 hover:bg-gray-200">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Page: Market Signals ---
const SignalsPage = ({ events }: { events: TimelineEvent[] }) => {
  const signalEvents = events.filter(e => e.type === TimelineEventType.SIGNAL || e.type === TimelineEventType.INSIGHT);
  const featured = signalEvents.find(e => e.impactScore > 75) || signalEvents[0];
  const list = signalEvents.filter(e => e.id !== featured?.id);

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="text-amber-500" fill="currentColor" />
          إشارات السوق الذكية
        </h2>
        <p className="text-sm lg:text-base text-gray-500 mt-1">تحليل فوري لأهم الفرص والمخاطر في السوق</p>
      </div>

      {featured && (
        <div className="mb-6 bg-slate-900 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.01]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-amber-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-md">
                FEATURED SIGNAL
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Clock size={12} /> {new Date(featured.timestamp).toLocaleDateString('ar-SA')}
              </span>
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold mb-4 leading-snug">{featured.title}</h3>
            <p className="text-slate-300 text-base lg:text-lg mb-6 max-w-3xl leading-relaxed opacity-90 line-clamp-3 lg:line-clamp-none">{featured.summary}</p>
            <div className="flex items-center gap-6 border-t border-slate-700/50 pt-6">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">الأثر</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-amber-500">{featured.impactScore}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6 pb-4">
        {list.map(ev => (
          <TimelineCard key={ev.id} event={ev} />
        ))}
      </div>
    </div>
  )
}

// --- Page: Timeline ---
const TimelinePage = ({ events }: { events: TimelineEvent[] }) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredEvents = useMemo(() => {
    if (filterType === 'ALL') return events;
    return events.filter(e => e.type === filterType);
  }, [events, filterType]);

  const filterOptions = [
    { id: 'ALL', label: 'الكل' },
    { id: TimelineEventType.NEW_DATA, label: 'بيانات' },
    { id: TimelineEventType.SIGNAL, label: 'إشارات' },
    { id: TimelineEventType.INSIGHT, label: 'رؤى' },
    { id: TimelineEventType.REVISION, label: 'تعديلات' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Clock className="text-blue-600" />
          سجل التغييرات
        </h2>
        <p className="text-sm lg:text-base text-gray-500 mt-2 lg:text-lg">
          تابع آخر التحديثات والإشارات الاقتصادية لحظة بلحظة.
        </p>
      </div>

      <div className="flex overflow-x-auto no-scrollbar pb-2 items-center gap-2 mb-6 lg:mb-8 bg-white p-2 rounded-xl shadow-sm border border-gray-100 lg:w-fit sticky top-[60px] lg:top-[72px] z-30 mx-[-16px] px-4 lg:static lg:mx-0 lg:px-2">
        {filterOptions.map(opt => (
          <button
            key={opt.id}
            onClick={() => setFilterType(opt.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filterType === opt.id
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 lg:border-none'
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 lg:space-y-6 relative before:absolute before:inset-0 before:mr-6 before:-ml-px before:w-0.5 before:bg-gradient-to-b before:from-gray-200 before:to-transparent before:hidden md:before:block pb-4">
        {filteredEvents.map((event) => (
          <div key={event.id} className="relative animate-fadeIn">
            <TimelineCard event={event} />
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App Component ---
const AppContent = () => {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<User>(() => ({
    ...CURRENT_USER,
    id: user?.id || CURRENT_USER.id,
    name: user?.name || CURRENT_USER.name,
    email: user?.email || CURRENT_USER.email,
    role: (user?.role as UserRole) || CURRENT_USER.role
  }));

  const [userDashboards, setUserDashboards] = useState<Dashboard[]>(() => {
    const saved = localStorage.getItem('userDashboards');
    return saved ? JSON.parse(saved) : INITIAL_DASHBOARDS.filter(d => d.type === 'user');
  });
  const [allWidgets, setAllWidgets] = useState<Widget[]>(WIDGETS);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const navigate = useNavigate();
  const officialDashboards = INITIAL_DASHBOARDS.filter(d => d.type === 'official');
  const allDashboards = [...officialDashboards, ...userDashboards];

  // Sync current user with auth user
  useEffect(() => {
    if (user) {
      setCurrentUser(prev => ({
        ...prev,
        id: user.id,
        name: user.name,
        nameAr: user.nameAr,
        email: user.email,
        role: (user.role as UserRole) || UserRole.STANDARD
      }));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('userDashboards', JSON.stringify(userDashboards));
  }, [userDashboards]);

  const handleCreateDashboard = (name: string) => {
    const newDash: Dashboard = {
      id: `udb-${Date.now()}`,
      name: name,
      type: 'user',
      widgets: [],
      ownerId: currentUser.id
    };
    setUserDashboards([...userDashboards, newDash]);
  };

  const handleAddWidget = (dashId: string, widgetId: string) => {
    setUserDashboards(prev => prev.map(d => {
      if (d.id === dashId && !d.widgets.includes(widgetId)) {
        return { ...d, widgets: [...d.widgets, widgetId] };
      }
      return d;
    }));
  };

  const handleAddExternalWidget = (dashId: string, idOrUrl: string, title?: string, desc?: string) => {
    const existingWidget = allWidgets.find(w => w.id === idOrUrl);
    if (existingWidget) {
      handleAddWidget(dashId, existingWidget.id);
      return;
    }
    if (idOrUrl.startsWith('http')) {
      const newWidget: Widget = {
        id: `ext-${Date.now()}`,
        title: title || 'مؤشر خارجي',
        type: ChartType.EXTERNAL,
        datasetId: 'external',
        category: 'External',
        tags: ['Custom', 'Metabase'],
        lastRefresh: new Date().toISOString().split('T')[0],
        description: desc || 'بيانات مستوردة من مصدر خارجي',
        data: [],
        embedUrl: idOrUrl
      };
      setAllWidgets(prev => [...prev, newWidget]);
      handleAddWidget(dashId, newWidget.id);
    }
  };

  const handleRemoveWidget = (dashId: string, widgetId: string) => {
    setUserDashboards(prev => prev.map(d => {
      if (d.id === dashId) {
        return { ...d, widgets: d.widgets.filter(w => w !== widgetId) };
      }
      return d;
    }));
  };

  const handlePublishDashboard = (name: string, desc: string, widgetIds: string[]) => {
    const newDash: Dashboard = {
      id: `odb_new_${Date.now()}`,
      name: name,
      type: 'official',
      widgets: widgetIds,
      ownerId: currentUser.id,
      description: desc,
      isPublic: true
    };
    setUserDashboards([...userDashboards, newDash]);
    alert(`تم نشر اللوحة "${name}" بنجاح! يمكن للجمهور الآن رؤيتها.`);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans overflow-x-hidden" dir="rtl">
      <Sidebar role={currentUser.role} dashboards={allDashboards} />

      <main className="flex-1 transition-all duration-300 pb-24 lg:pb-0 min-w-0">
        <Topbar onOpenWizard={() => setIsWizardOpen(true)} />
        <div className="animate-fadeIn">
          <Routes>
            <Route path="/" element={<HomeFeedWrapper user={currentUser} onOpenWizard={() => setIsWizardOpen(true)} />} />
            <Route path="/dashboard" element={<HomeFeedWrapper user={currentUser} onOpenWizard={() => setIsWizardOpen(true)} />} />
            <Route path="/dashboards" element={<OfficialDashboardsWrapper userRole={currentUser.role} />} />
            <Route path="/dashboards/:id" element={<DashboardDetailPage />} />
            <Route path="/signals" element={<AISignalsPage />} />
            <Route path="/timeline" element={<TimelineWrapper />} />
            <Route path="/followers" element={<FollowersWrapper />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/favorites" element={<FavoritesPage />} />

            <Route path="/expert-studio" element={
              <ExpertBuilderWrapper onPublishDashboard={handlePublishDashboard} />
            } />

            <Route path="/my-dashboards" element={
              <MyDashboards
                dashboards={userDashboards}
                widgets={allWidgets}
                currentUser={currentUser}
                onCreate={handleCreateDashboard}
                onAddWidget={handleAddWidget}
                onAddExternalWidget={handleAddExternalWidget}
                onRemoveWidget={handleRemoveWidget}
              />
            } />
            <Route path="/dataset/:id" element={<DatasetContent dataset={DATASETS[0]} onBack={() => navigate('/dashboard')} role={currentUser.role} />} />
            <Route path="/builder" element={<ChartBuilderPage />} />
            <Route path="/queries" element={<ChartBuilderPage />} />
            <Route path="/analysis" element={<DataAnalysisPage />} />
            <Route path="/verification" element={<DataAnalysisPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/datasets" element={<DatasetsPage />} />

            <Route path="*" element={<div className="p-10 text-center text-gray-400">جاري العمل على هذه الصفحة...</div>} />
          </Routes>
        </div>
      </main>

      <DecisionWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
      <MobileBottomNav />
    </div>
  );
};

// --- Guest Mobile Bottom Navigation ---
const GuestMobileBottomNav = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom,20px)] bg-white/95 backdrop-blur-lg border-t border-gray-200 z-50 lg:hidden flex justify-around items-center pt-3 px-4 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] transition-all">
      <div
        onClick={() => navigate('/')}
        className="flex flex-col items-center justify-center space-y-1 cursor-pointer text-blue-600"
      >
        <Compass size={24} strokeWidth={2.5} />
        <span className="text-[10px] font-bold">الرئيسية</span>
      </div>

      <div
        onClick={() => navigate('/login')}
        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30"
      >
        <UserIcon size={18} />
        تسجيل الدخول
      </div>

      <div
        onClick={() => navigate('/register')}
        className="flex flex-col items-center justify-center space-y-1 cursor-pointer text-gray-400 hover:text-blue-600"
      >
        <Plus size={24} strokeWidth={2} />
        <span className="text-[10px] font-bold">حساب جديد</span>
      </div>
    </div>
  );
};

// --- Public Home Page Layout (for guests) ---
const PublicHomeLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      {/* Simple Header for Guests */}
      <header className="h-[60px] lg:h-[72px] sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 border-b border-gray-200/80">
        <div className="px-4 lg:px-8 h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-lg text-gray-900">رادار المستثمر</h1>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Investor Radar</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#/login" className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors hidden sm:block">
              تسجيل الدخول
            </a>
            <a href="#/register" className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
              إنشاء حساب
            </a>
          </div>
        </div>
      </header>

      <main className="animate-fadeIn pb-24 lg:pb-0">
        <HomeFeedWrapper />
      </main>

      <GuestMobileBottomNav />
    </div>
  );
};

// --- Auth Aware App Wrapper ---
const AppWithAuth = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const publicPaths = ['/login', '/register', '/'];
  const isPublicPath = publicPaths.includes(location.pathname);

  // Redirect authenticated users from login/register to dashboard
  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    // Admin goes to admin dashboard, others to home feed
    const role = user?.role?.toUpperCase();
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      {/* Public routes - accessible without login */}
      <Route path="/" element={<PublicHomePage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

      {/* Protected routes - require authentication */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppContent />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const RootApp = () => (
  <Router>
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  </Router>
)

export default RootApp;
// Deploy trigger: 1770124566
