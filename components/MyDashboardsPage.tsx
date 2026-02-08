import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  X,
  PieChart,
  Loader2,
  Wifi,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Trash2,
  RefreshCw,
  Star,
  Maximize2,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  Copy,
  GripVertical,
  Clock,
  Bot
} from 'lucide-react';
import { api } from '../src/services/api';
import { STORAGE_KEYS } from '../src/core/config/app.config';

// API Base URL for SSE streams
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Types matching backend Prisma model
interface DashboardRaw {
  id: string;
  userId: string;
  name: string;
  nameAr?: string;
  description?: string;
  widgets: string; // JSON string e.g. '["dataset_xxx"]'
  layout: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Parsed dashboard for UI use
interface Dashboard {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  widgetIds: string[]; // parsed from JSON string
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
  atomicType?: string;
  data?: any;
  config?: any;
  value?: string; // JSON string with currentValue, previousValue, changePercent, trend
  sourceUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Parsed value data from widget.value JSON
interface WidgetValueData {
  currentValue?: number | string;
  previousValue?: number | string;
  changePercent?: number;
  trend?: 'up' | 'down' | 'stable';
}

// Parse widget.value JSON safely
function parseWidgetValue(value?: string): WidgetValueData {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return {
      currentValue: parsed.currentValue,
      previousValue: parsed.previousValue,
      changePercent: typeof parsed.changePercent === 'number' ? parsed.changePercent : undefined,
      trend: parsed.trend,
    };
  } catch {
    return {};
  }
}

// Format date to Arabic-friendly relative or short date
function formatUpdateDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function parseDashboard(raw: DashboardRaw): Dashboard {
  let widgetIds: string[] = [];
  try {
    widgetIds = JSON.parse(raw.widgets || '[]');
  } catch {
    widgetIds = [];
  }
  return {
    id: raw.id,
    name: raw.nameAr || raw.name,
    nameAr: raw.nameAr,
    description: raw.description,
    widgetIds,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

const MyDashboardsPage: React.FC = () => {
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

  // Drag and drop states
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOverWidget, setDragOverWidget] = useState<string | null>(null);

  // Widget control states
  const [favoriteWidgets, setFavoriteWidgets] = useState<Set<string>>(new Set());
  const [expandedWidget, setExpandedWidget] = useState<Widget | null>(null);
  const [openMenuWidgetId, setOpenMenuWidgetId] = useState<string | null>(null);

  // Refs for EventSource cleanup
  const dashboardsEventSourceRef = useRef<EventSource | null>(null);
  const widgetsEventSourceRef = useRef<EventSource | null>(null);

  const activeDashboard = dashboards.find(d => d.id === activeTab);
  const loading = dashboardsStreaming && dashboards.length === 0;

  const getAuthToken = () => localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

  // WebFlux SSE Stream for User Dashboards
  const streamDashboards = useCallback(() => {
    const token = getAuthToken();
    const url = `${API_BASE_URL}/users/dashboards/stream${token ? `?token=${token}` : ''}`;
    console.log('[WebFlux] Connecting to user dashboards stream');

    const eventSource = new EventSource(url);
    dashboardsEventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('[WebFlux] User dashboards stream connected');
    };

    eventSource.addEventListener('dashboard', (e) => {
      try {
        const raw: DashboardRaw = JSON.parse(e.data);
        const dashboard = parseDashboard(raw);
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
      const response = await api.getUserDashboards();
      if (response.success && response.data) {
        const parsed = (response.data as unknown as DashboardRaw[]).map(parseDashboard);
        setDashboards(parsed);
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
    console.log('[WebFlux] Connecting to widgets stream');

    const eventSource = new EventSource(url);
    widgetsEventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('[WebFlux] Widgets stream connected');
    };

    eventSource.addEventListener('widget', (e) => {
      try {
        const widget: Widget = JSON.parse(e.data);
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
      const response = await api.getWidgets();
      if (response.success && response.data) {
        setWidgets(response.data as unknown as Widget[]);
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

    try {
      const response = await api.createUserDashboard({ name: newDashName.trim() });

      if (response.success && response.data) {
        const parsed = parseDashboard(response.data as unknown as DashboardRaw);
        setDashboards(prev => [...prev, parsed]);
        setActiveTab(parsed.id);
      } else {
        setCreateError('فشل في إنشاء اللوحة');
      }
    } catch (err) {
      console.error('Error creating dashboard:', err);
      setCreateError('حدث خطأ في إنشاء اللوحة');
    } finally {
      setIsCreating(false);
      setNewDashName('');
      setModalOpen(false);
    }
  };

  const handleAddWidget = async (widgetId: string) => {
    if (!activeDashboard) return;

    // Optimistic update
    const newWidgetIds = [...activeDashboard.widgetIds, widgetId];
    setDashboards(prev => prev.map(d => {
      if (d.id === activeDashboard.id) {
        return { ...d, widgetIds: newWidgetIds };
      }
      return d;
    }));

    try {
      await api.updateUserDashboard(activeDashboard.id, {
        widgets: JSON.stringify(newWidgetIds)
      });
    } catch (err) {
      console.error('Error adding widget:', err);
      // Revert on error
      setDashboards(prev => prev.map(d => {
        if (d.id === activeDashboard.id) {
          return { ...d, widgetIds: activeDashboard.widgetIds };
        }
        return d;
      }));
    }

    setWidgetLibraryOpen(false);
  };

  const handleRemoveWidget = async (widgetId: string) => {
    if (!activeDashboard) return;

    const newWidgetIds = activeDashboard.widgetIds.filter(w => w !== widgetId);

    // Optimistic update
    setDashboards(prev => prev.map(d => {
      if (d.id === activeDashboard.id) {
        return { ...d, widgetIds: newWidgetIds };
      }
      return d;
    }));

    try {
      await api.updateUserDashboard(activeDashboard.id, {
        widgets: JSON.stringify(newWidgetIds)
      });
    } catch (err) {
      console.error('Error removing widget:', err);
      // Revert on error
      setDashboards(prev => prev.map(d => {
        if (d.id === activeDashboard.id) {
          return { ...d, widgetIds: activeDashboard.widgetIds };
        }
        return d;
      }));
    }
  };

  const handleDeleteDashboard = async (dashId: string) => {
    try {
      await api.deleteUserDashboard(dashId);
      setDashboards(prev => prev.filter(d => d.id !== dashId));
      if (activeTab === dashId) {
        setActiveTab(dashboards.find(d => d.id !== dashId)?.id || '');
      }
    } catch (err) {
      console.error('Error deleting dashboard:', err);
    }
  };

  const refreshData = () => {
    setDashboards([]);
    setWidgets([]);
    setDashboardsStreaming(true);
    setWidgetsStreaming(true);

    if (dashboardsEventSourceRef.current) {
      dashboardsEventSourceRef.current.close();
    }
    if (widgetsEventSourceRef.current) {
      widgetsEventSourceRef.current.close();
    }

    streamDashboards();
    streamWidgets();
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', widgetId);
  };

  const handleDragOver = (e: React.DragEvent, widgetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedWidget && widgetId !== draggedWidget) {
      setDragOverWidget(widgetId);
    }
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
    setDragOverWidget(null);
  };

  const handleDrop = async (e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault();
    if (!activeDashboard || !draggedWidget || draggedWidget === targetWidgetId) {
      setDraggedWidget(null);
      setDragOverWidget(null);
      return;
    }

    const oldIds = [...activeDashboard.widgetIds];
    const fromIndex = oldIds.indexOf(draggedWidget);
    const toIndex = oldIds.indexOf(targetWidgetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const newIds = [...oldIds];
    newIds.splice(fromIndex, 1);
    newIds.splice(toIndex, 0, draggedWidget);

    // Optimistic update
    setDashboards(prev => prev.map(d =>
      d.id === activeDashboard.id ? { ...d, widgetIds: newIds } : d
    ));

    setDraggedWidget(null);
    setDragOverWidget(null);

    try {
      await api.updateUserDashboard(activeDashboard.id, {
        widgets: JSON.stringify(newIds)
      });
    } catch (err) {
      console.error('Error reordering widgets:', err);
      // Revert on error
      setDashboards(prev => prev.map(d =>
        d.id === activeDashboard.id ? { ...d, widgetIds: oldIds } : d
      ));
    }
  };

  // Widget control handlers
  const toggleFavorite = (widgetId: string) => {
    setFavoriteWidgets(prev => {
      const next = new Set(prev);
      if (next.has(widgetId)) {
        next.delete(widgetId);
      } else {
        next.add(widgetId);
      }
      return next;
    });
  };

  const handleMoveWidget = async (widgetId: string, direction: 'up' | 'down') => {
    if (!activeDashboard) return;
    const oldIds = [...activeDashboard.widgetIds];
    const index = oldIds.indexOf(widgetId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === oldIds.length - 1) return;

    const newIds = [...oldIds];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newIds[index], newIds[swapIndex]] = [newIds[swapIndex], newIds[index]];

    setDashboards(prev => prev.map(d =>
      d.id === activeDashboard.id ? { ...d, widgetIds: newIds } : d
    ));
    setOpenMenuWidgetId(null);

    try {
      await api.updateUserDashboard(activeDashboard.id, {
        widgets: JSON.stringify(newIds)
      });
    } catch (err) {
      console.error('Error moving widget:', err);
      setDashboards(prev => prev.map(d =>
        d.id === activeDashboard.id ? { ...d, widgetIds: oldIds } : d
      ));
    }
  };

  const handleDuplicateWidget = async (widgetId: string) => {
    if (!activeDashboard) return;
    const oldIds = [...activeDashboard.widgetIds];
    const index = oldIds.indexOf(widgetId);
    if (index === -1) return;

    const newIds = [...oldIds];
    newIds.splice(index + 1, 0, widgetId);

    setDashboards(prev => prev.map(d =>
      d.id === activeDashboard.id ? { ...d, widgetIds: newIds } : d
    ));
    setOpenMenuWidgetId(null);

    try {
      await api.updateUserDashboard(activeDashboard.id, {
        widgets: JSON.stringify(newIds)
      });
    } catch (err) {
      console.error('Error duplicating widget:', err);
      setDashboards(prev => prev.map(d =>
        d.id === activeDashboard.id ? { ...d, widgetIds: oldIds } : d
      ));
    }
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

        {/* Create Dashboard Modal in empty state */}
        {isModalOpen && <CreateDashboardModal
          newDashName={newDashName}
          setNewDashName={setNewDashName}
          isCreating={isCreating}
          createError={createError}
          onClose={() => setModalOpen(false)}
          onCreate={handleCreateDashboard}
        />}
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
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={() => handleDeleteDashboard(activeDashboard.id)}
              className="flex items-center gap-2 text-sm text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors font-medium border border-red-100"
            >
              <Trash2 size={16} /> حذف اللوحة
            </button>
            <button
              onClick={() => setWidgetLibraryOpen(true)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors font-medium border border-blue-100"
            >
              <Plus size={16} /> إضافة مؤشر
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 min-h-[300px] pb-4" onClick={() => openMenuWidgetId && setOpenMenuWidgetId(null)}>
            {activeDashboard.widgetIds.length === 0 ? (
              <div className="col-span-full border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-12 text-gray-400 bg-gray-50/50">
                <Plus size={40} className="mb-2 opacity-50" />
                <p>هذه اللوحة فارغة. أضف بعض المؤشرات!</p>
              </div>
            ) : (
              activeDashboard.widgetIds.map((widgetId, widgetIndex) => {
                const widget = widgets.find(w => w.id === widgetId);
                if (!widget) {
                  return (
                    <div
                      key={`${widgetId}-${widgetIndex}`}
                      className="bg-white rounded-xl border border-gray-200 p-5 relative"
                      draggable
                      onDragStart={(e) => handleDragStart(e, widgetId)}
                      onDragOver={(e) => handleDragOver(e, widgetId)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, widgetId)}
                    >
                      <button
                        onClick={() => handleRemoveWidget(widgetId)}
                        className="absolute top-3 left-3 p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                        title="إزالة"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                        <Loader2 className="w-5 h-5 animate-spin ml-2" />
                        جاري تحميل المؤشر...
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={`${widgetId}-${widgetIndex}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, widgetId)}
                    onDragOver={(e) => handleDragOver(e, widgetId)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, widgetId)}
                    className={`bg-white rounded-xl border p-5 hover:shadow-lg transition-all group relative cursor-grab ${
                      draggedWidget === widgetId ? 'opacity-50 border-blue-400' : ''
                    } ${
                      dragOverWidget === widgetId ? 'border-blue-500 border-2 shadow-blue-100 shadow-lg' : 'border-gray-200'
                    }`}
                  >
                    {/* Drag handle */}
                    <div className="absolute top-3 right-3 text-gray-300 group-hover:text-gray-500 transition-colors">
                      <GripVertical size={18} />
                    </div>

                    {/* Widget control buttons */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Star / Favorite */}
                      <button
                        onClick={() => toggleFavorite(widgetId)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          favoriteWidgets.has(widgetId)
                            ? 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100'
                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-yellow-500'
                        }`}
                        title="مفضلة"
                      >
                        <Star size={16} fill={favoriteWidgets.has(widgetId) ? 'currentColor' : 'none'} />
                      </button>

                      {/* Expand / Fullscreen */}
                      <button
                        onClick={() => setExpandedWidget(widget)}
                        className="p-1.5 bg-gray-50 text-gray-400 rounded-lg hover:bg-blue-50 hover:text-blue-500 transition-colors"
                        title="عرض كامل"
                      >
                        <Maximize2 size={16} />
                      </button>

                      {/* Settings / More menu */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuWidgetId(openMenuWidgetId === widgetId ? null : widgetId)}
                          className="p-1.5 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-100 hover:text-gray-600 transition-colors"
                          title="خيارات"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenuWidgetId === widgetId && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-30 w-40 py-1 animate-scaleIn">
                            <button
                              onClick={() => handleMoveWidget(widgetId, 'up')}
                              disabled={widgetIndex === 0}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <ChevronUp size={14} />
                              نقل لأعلى
                            </button>
                            <button
                              onClick={() => handleMoveWidget(widgetId, 'down')}
                              disabled={widgetIndex === activeDashboard.widgetIds.length - 1}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <ChevronDown size={14} />
                              نقل لأسفل
                            </button>
                            <button
                              onClick={() => handleDuplicateWidget(widgetId)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Copy size={14} />
                              نسخ
                            </button>
                            <div className="border-t border-gray-100 my-1" />
                            <button
                              onClick={() => { handleRemoveWidget(widgetId); setOpenMenuWidgetId(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                              إزالة
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleRemoveWidget(widgetId)}
                        className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                        title="إزالة"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {(() => {
                      const valueData = parseWidgetValue(widget.value);
                      const updateDateStr = formatUpdateDate(widget.updatedAt);
                      const changePercent = valueData.changePercent;
                      const isPositive = valueData.trend === 'up' || (changePercent !== undefined && changePercent > 0);
                      const isNegative = valueData.trend === 'down' || (changePercent !== undefined && changePercent < 0);
                      return (
                        <>
                          {/* Header row: icon + title + change badge */}
                          <div className="flex items-start gap-3 mb-3 pr-6">
                            <div className="w-10 h-10 bg-slate-700 text-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                              {(widget.atomicType === 'sparkline' || widget.type === 'line' || widget.type === 'SPARKLINE') ? <TrendingUp size={20} /> :
                               (widget.atomicType === 'progress' || widget.type === 'bar' || widget.type === 'PROGRESS') ? <BarChart3 size={20} /> :
                               <Activity size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 line-clamp-1 text-sm">
                                {widget.titleAr || widget.title}
                              </h3>
                              {/* Current value display */}
                              {valueData.currentValue !== undefined && (
                                <span className="text-lg font-bold text-gray-800">
                                  {typeof valueData.currentValue === 'number'
                                    ? valueData.currentValue.toLocaleString('ar-SA')
                                    : valueData.currentValue}
                                </span>
                              )}
                            </div>
                            {/* Change percentage badge */}
                            {changePercent !== undefined && (
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${
                                isPositive
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : isNegative
                                    ? 'bg-red-50 text-red-600'
                                    : 'bg-gray-100 text-gray-500'
                              }`}>
                                {isPositive && <TrendingUp size={14} />}
                                {isNegative && <TrendingDown size={14} />}
                                <span dir="ltr">
                                  {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Source name */}
                          {widget.category && (
                            <div className="flex items-center gap-1.5 mb-2 mr-13">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                المصدر: {widget.category}
                              </span>
                            </div>
                          )}

                          {/* Description */}
                          {widget.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {widget.description}
                            </p>
                          )}

                          {/* Placeholder chart area */}
                          <div className="mt-3 h-28 bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg flex items-center justify-center">
                            <span className="text-slate-400 text-sm">الرسم البياني</span>
                          </div>

                          {/* AI Analysis placeholder */}
                          <div className="mt-3 flex items-start gap-2 bg-slate-800/5 border border-slate-200 rounded-lg px-3 py-2">
                            <Bot size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-slate-400 italic leading-relaxed">
                              لا يوجد تحليل AI حالياً
                            </p>
                          </div>

                          {/* Last update date */}
                          {updateDateStr && (
                            <div className="mt-2 flex items-center gap-1.5 justify-end">
                              <Clock size={12} className="text-gray-400" />
                              <span className="text-[11px] text-gray-400">
                                آخر تحديث: {updateDateStr}
                              </span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Create Dashboard Modal */}
      {isModalOpen && <CreateDashboardModal
        newDashName={newDashName}
        setNewDashName={setNewDashName}
        isCreating={isCreating}
        createError={createError}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateDashboard}
      />}

      {/* Expanded Widget Modal */}
      {expandedWidget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setExpandedWidget(null)}>
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  {(expandedWidget.atomicType === 'sparkline' || expandedWidget.type === 'line') ? <TrendingUp size={24} /> :
                   (expandedWidget.atomicType === 'progress' || expandedWidget.type === 'bar') ? <BarChart3 size={24} /> :
                   <Activity size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {expandedWidget.titleAr || expandedWidget.title}
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {expandedWidget.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setExpandedWidget(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="إغلاق"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto">
              {expandedWidget.description && (
                <p className="text-gray-600 mb-6 text-base leading-relaxed">
                  {expandedWidget.description}
                </p>
              )}

              {/* Expanded chart area */}
              <div className="w-full h-[60vh] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                <span className="text-gray-400 text-lg">الرسم البياني - عرض كامل</span>
              </div>
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
                    .filter(w => !activeDashboard.widgetIds.includes(w.id))
                    .map(widget => (
                      <div
                        key={widget.id}
                        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-400 transition-all flex justify-between items-center"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            {(widget.atomicType === 'sparkline' || widget.type === 'line') ? <TrendingUp size={18} /> :
                             (widget.atomicType === 'progress' || widget.type === 'bar') ? <BarChart3 size={18} /> :
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

// Create Dashboard Modal Component
function CreateDashboardModal({ newDashName, setNewDashName, isCreating, createError, onClose, onCreate }: {
  newDashName: string;
  setNewDashName: (v: string) => void;
  isCreating: boolean;
  createError: string | null;
  onClose: () => void;
  onCreate: () => void;
}) {
  return (
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
          onKeyDown={(e) => e.key === 'Enter' && !isCreating && onCreate()}
          disabled={isCreating}
        />
        {createError && (
          <p className="text-red-500 text-sm mb-4">{createError}</p>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            disabled={isCreating}
          >
            إلغاء
          </button>
          <button
            onClick={onCreate}
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
  );
}

export default MyDashboardsPage;
