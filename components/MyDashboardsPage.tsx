import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  X,
  PieChart,
  Loader2,
  Wifi,
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Activity,
  Trash2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

// API Base URL for SSE streams
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Types
interface Dashboard {
  id: string;
  name: string;
  description?: string;
  type: 'user' | 'official';
  widgets: string[];
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Widget {
  id: string;
  title: string;
  titleAr?: string;
  description?: string;
  category: string;
  type: string;
  chartType?: string;
  data?: any;
  config?: any;
}

const MyDashboardsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramId = searchParams.get('id');

  // Data states
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');

  // Streaming states
  const [dashboardsStreaming, setDashboardsStreaming] = useState(true);
  const [widgetsStreaming, setWidgetsStreaming] = useState(true);

  // UI states
  const [isModalOpen, setModalOpen] = useState(false);
  const [newDashName, setNewDashName] = useState('');
  const [isWidgetLibraryOpen, setWidgetLibraryOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Refs for EventSource cleanup
  const dashboardsEventSourceRef = useRef<EventSource | null>(null);
  const widgetsEventSourceRef = useRef<EventSource | null>(null);

  const activeDashboard = dashboards.find(d => d.id === activeTab);
  const loading = dashboardsStreaming && dashboards.length === 0;

  // WebFlux SSE Stream for User Dashboards
  const streamDashboards = useCallback(() => {
    const url = `${API_BASE_URL}/dashboards/user/stream`;
    console.log('[WebFlux] Connecting to user dashboards stream:', url);

    const eventSource = new EventSource(url, { withCredentials: true });
    dashboardsEventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('[WebFlux] User dashboards stream connected');
    };

    eventSource.addEventListener('dashboard', (e) => {
      try {
        const dashboard = JSON.parse(e.data);
        console.log('[WebFlux] Received dashboard:', dashboard.name);
        setDashboards(prev => {
          if (prev.some(d => d.id === dashboard.id)) return prev;
          return [...prev, dashboard];
        });
      } catch (err) {
        console.error('[WebFlux] Error parsing dashboard:', err);
      }
    });

    eventSource.addEventListener('complete', () => {
      console.log('[WebFlux] Dashboards stream complete');
      setDashboardsStreaming(false);
      eventSource.close();
    });

    eventSource.onerror = (err) => {
      console.error('[WebFlux] Dashboards stream error:', err);
      eventSource.close();
      fetchDashboardsRegular();
    };
  }, []);

  // Regular API fallback for dashboards
  const fetchDashboardsRegular = useCallback(async () => {
    try {
      console.log('[API] Fetching user dashboards via regular API...');
      const response = await fetch(`${API_BASE_URL}/dashboards/user`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setDashboards(data.data);
        }
      }
    } catch (err) {
      console.error('[API] Error fetching dashboards:', err);
    } finally {
      setDashboardsStreaming(false);
    }
  }, []);

  // WebFlux SSE Stream for Widgets Library
  const streamWidgets = useCallback(() => {
    const url = `${API_BASE_URL}/widgets/stream`;
    console.log('[WebFlux] Connecting to widgets stream:', url);

    const eventSource = new EventSource(url);
    widgetsEventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('[WebFlux] Widgets stream connected');
    };

    eventSource.addEventListener('widget', (e) => {
      try {
        const widget = JSON.parse(e.data);
        console.log('[WebFlux] Received widget:', widget.title);
        setWidgets(prev => {
          if (prev.some(w => w.id === widget.id)) return prev;
          return [...prev, widget];
        });
      } catch (err) {
        console.error('[WebFlux] Error parsing widget:', err);
      }
    });

    eventSource.addEventListener('complete', () => {
      console.log('[WebFlux] Widgets stream complete');
      setWidgetsStreaming(false);
      eventSource.close();
    });

    eventSource.onerror = (err) => {
      console.error('[WebFlux] Widgets stream error:', err);
      eventSource.close();
      fetchWidgetsRegular();
    };
  }, []);

  // Regular API fallback for widgets
  const fetchWidgetsRegular = useCallback(async () => {
    try {
      console.log('[API] Fetching widgets via regular API...');
      const response = await fetch(`${API_BASE_URL}/widgets`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setWidgets(data.data);
        }
      }
    } catch (err) {
      console.error('[API] Error fetching widgets:', err);
    } finally {
      setWidgetsStreaming(false);
    }
  }, []);

  // Initialize streams on mount
  useEffect(() => {
    streamDashboards();
    streamWidgets();

    return () => {
      if (dashboardsEventSourceRef.current) {
        dashboardsEventSourceRef.current.close();
      }
      if (widgetsEventSourceRef.current) {
        widgetsEventSourceRef.current.close();
      }
    };
  }, [streamDashboards, streamWidgets]);

  // Set active tab based on URL param or first dashboard
  useEffect(() => {
    if (paramId && dashboards.some(d => d.id === paramId)) {
      setActiveTab(paramId);
    } else if (!activeTab && dashboards.length > 0) {
      setActiveTab(dashboards[0].id);
    }
  }, [paramId, dashboards, activeTab]);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setSearchParams({ id });
  };

  const handleCreateDashboard = async () => {
    if (!newDashName.trim()) return;

    setIsCreating(true);
    setCreateError(null);

    // Generate a temporary local ID
    const tempId = `local-dash-${Date.now()}`;
    const newDashboard: Dashboard = {
      id: tempId,
      name: newDashName.trim(),
      type: 'user',
      widgets: [],
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch(`${API_BASE_URL}/dashboards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newDashName, type: 'user', widgets: [] })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Use API response data
          setDashboards(prev => [...prev, data.data]);
          setActiveTab(data.data.id);
        } else {
          // API returned success but no data, use local
          setDashboards(prev => [...prev, newDashboard]);
          setActiveTab(tempId);
        }
      } else {
        // API failed, add locally anyway for better UX
        console.log('API failed, creating dashboard locally');
        setDashboards(prev => [...prev, newDashboard]);
        setActiveTab(tempId);
      }
    } catch (err) {
      console.error('Error creating dashboard:', err);
      // Even on error, create locally for better UX
      setDashboards(prev => [...prev, newDashboard]);
      setActiveTab(tempId);
    } finally {
      setIsCreating(false);
      setNewDashName('');
      setModalOpen(false);
    }
  };

  const handleAddWidget = async (widgetId: string) => {
    if (!activeDashboard) return;

    try {
      const response = await fetch(`${API_BASE_URL}/dashboards/${activeDashboard.id}/widgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ widgetId })
      });

      if (response.ok) {
        setDashboards(prev => prev.map(d => {
          if (d.id === activeDashboard.id && !d.widgets.includes(widgetId)) {
            return { ...d, widgets: [...d.widgets, widgetId] };
          }
          return d;
        }));
      }
    } catch (err) {
      console.error('Error adding widget:', err);
    }

    setWidgetLibraryOpen(false);
  };

  const handleRemoveWidget = async (widgetId: string) => {
    if (!activeDashboard) return;

    try {
      await fetch(`${API_BASE_URL}/dashboards/${activeDashboard.id}/widgets/${widgetId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      setDashboards(prev => prev.map(d => {
        if (d.id === activeDashboard.id) {
          return { ...d, widgets: d.widgets.filter(w => w !== widgetId) };
        }
        return d;
      }));
    } catch (err) {
      console.error('Error removing widget:', err);
    }
  };

  const refreshData = () => {
    setDashboards([]);
    setWidgets([]);
    setDashboardsStreaming(true);
    setWidgetsStreaming(true);
    streamDashboards();
    streamWidgets();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-4">
          <Wifi className="w-5 h-5 animate-pulse text-blue-600" />
          <span className="text-blue-600 font-medium">جاري تحميل لوحاتك عبر WebFlux...</span>
        </div>
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // Empty state
  if (!dashboardsStreaming && dashboards.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-[80vh]">
        <div className="bg-blue-50 p-6 rounded-full mb-4">
          <PieChart size={48} className="text-blue-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">ليس لديك أي لوحات خاصة</h2>
        <p className="text-gray-500 mt-2 mb-6 text-center max-w-md">
          قم بإنشاء لوحة خاصة بك وقم بإضافة المؤشرات التي تهمك لمتابعتها بشكل دوري.
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all"
        >
          <Plus size={20} />
          إنشاء لوحة جديدة
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 lg:mb-8">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">لوحاتي</h2>
          <p className="text-sm text-gray-500 mt-1">تخصيص البيانات حسب اهتماماتك</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Streaming indicator */}
          {(dashboardsStreaming || widgetsStreaming) && (
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full text-sm text-blue-600">
              <Wifi className="w-4 h-4 animate-pulse" />
              <span>جاري التحميل...</span>
            </div>
          )}
          <button
            onClick={refreshData}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
            title="تحديث"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 shadow-sm font-medium transition-colors text-sm"
          >
            <Plus size={18} />
            لوحة جديدة
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto gap-1 no-scrollbar">
        {dashboards.map(d => (
          <button
            key={d.id}
            onClick={() => handleTabChange(d.id)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap hover:bg-gray-50 rounded-t-lg ${
              activeTab === d.id
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>

      {/* Active Dashboard Content */}
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
                if (!widget) return null;

                return (
                  <div
                    key={widgetId}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all group relative"
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveWidget(widgetId)}
                      className="absolute top-3 left-3 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                      title="إزالة"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                        {widget.chartType === 'line' ? <TrendingUp size={20} /> :
                         widget.chartType === 'bar' ? <BarChart3 size={20} /> :
                         <Activity size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 line-clamp-1">
                          {widget.titleAr || widget.title}
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {widget.category}
                        </span>
                      </div>
                    </div>

                    {widget.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {widget.description}
                      </p>
                    )}

                    {/* Placeholder chart area */}
                    <div className="mt-4 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-sm">الرسم البياني</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Create Dashboard Modal */}
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
              onKeyDown={(e) => e.key === 'Enter' && !isCreating && handleCreateDashboard()}
              disabled={isCreating}
            />
            {createError && (
              <p className="text-red-500 text-sm mb-4">{createError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                disabled={isCreating}
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateDashboard}
                disabled={isCreating || !newDashName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  'إنشاء'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Widget Library Modal */}
      {isWidgetLibraryOpen && activeDashboard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl animate-scaleIn">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">مكتبة المؤشرات</h3>
                <p className="text-sm text-gray-500">
                  اختر المؤشرات لإضافتها إلى "{activeDashboard.name}"
                </p>
              </div>
              <button
                onClick={() => setWidgetLibraryOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              {widgetsStreaming && widgets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                  <span className="text-gray-500">جاري تحميل المؤشرات...</span>
                </div>
              ) : widgets.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  لا توجد مؤشرات متاحة
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {widgets
                    .filter(w => !activeDashboard.widgets.includes(w.id))
                    .map(widget => (
                      <div
                        key={widget.id}
                        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-400 transition-all flex justify-between items-center"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            {widget.chartType === 'line' ? <TrendingUp size={18} /> :
                             widget.chartType === 'bar' ? <BarChart3 size={18} /> :
                             <Activity size={18} />}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 line-clamp-1">
                              {widget.titleAr || widget.title}
                            </h4>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {widget.category}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddWidget(widget.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg shadow-blue-500/30"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setWidgetLibraryOpen(false)}
                className="w-full bg-gray-100 p-2 rounded text-gray-600 hover:bg-gray-200"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDashboardsPage;
