import React, { useState, useMemo, useEffect } from 'react';
import { Widget, UserRole, ChartType } from '../types';
import WidgetChart from './WidgetChart';
import { 
  Sparkles, 
  Trash2, 
  MoreHorizontal, 
  Share2, 
  Maximize2, 
  Star, 
  Plus, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Globe,
  CheckCircle2,
  Lightbulb,
  X
} from 'lucide-react';
import { analyzeWidgetData } from '../services/geminiService';
import { generateMetabaseUrl } from '../services/metabaseService';
import { DATASETS } from '../constants';

interface WidgetCardProps {
  widget: Widget;
  role: UserRole;
  onRemove?: () => void;
  isCustomDashboard?: boolean;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ widget, role, onRemove, isCustomDashboard }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [iframeUrl, setIframeUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (widget.type === ChartType.EXTERNAL && widget.embedUrl) {
      if (widget.embedUrl.startsWith('metabase://')) {
        const dashboardId = parseInt(widget.embedUrl.split('dashboard/')[1]);
        if (!isNaN(dashboardId)) {
           generateMetabaseUrl(dashboardId).then(url => setIframeUrl(url));
        }
      } else {
        setIframeUrl(widget.embedUrl);
      }
    }
  }, [widget.embedUrl, widget.type]);

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    const result = await analyzeWidgetData(widget);
    setInsight(result);
    setAnalyzing(false);
  };

  const canAnalyze = (role === UserRole.ANALYST || role === UserRole.EXPERT || role === UserRole.ADMIN) && widget.type !== ChartType.EXTERNAL;

  const { currentValue, trendPercent, isPositive } = useMemo(() => {
    if (!widget.data || widget.data.length === 0) return { currentValue: 0, trendPercent: 0, isPositive: true };
    const last = widget.data[widget.data.length - 1].value;
    const prev = widget.data.length > 1 ? widget.data[widget.data.length - 2].value : last;
    const trend = prev !== 0 ? ((last - prev) / prev) * 100 : 0;
    return {
      currentValue: last,
      trendPercent: Math.abs(trend).toFixed(1),
      isPositive: trend >= 0
    };
  }, [widget.data]);

  const agencyName = DATASETS.find(d => d.id === widget.datasetId)?.agency || "مصدر خارجي";
  const isExternal = widget.type === ChartType.EXTERNAL;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col ${isExpanded ? 'fixed inset-0 z-[60] h-full rounded-none md:rounded-2xl md:inset-8 md:h-auto' : 'h-auto'}`}>
      
      {/* SECTION 1: Header Toolbar */}
      <div className="flex justify-between items-center p-3 border-b bg-gray-50/50 backdrop-blur-sm min-h-[52px]">
        <div className="flex items-center gap-2">
          {/* Action Button: Remove or Add */}
          {isCustomDashboard && onRemove ? (
             <button onClick={onRemove} className="h-9 w-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-red-500 hover:bg-red-50 shadow-sm active:scale-95 transition-all" title="إزالة">
               <Trash2 size={18} />
             </button>
          ) : (
            <button className="h-9 w-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 shadow-sm active:scale-95 transition-all" title="إضافة">
               <Plus size={20} />
             </button>
          )}

          {/* Expanded Actions - Show only on Desktop or if Expanded */}
          <div className="hidden sm:flex gap-2">
              <button className="h-9 w-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 shadow-sm transition-all" title="مفضلة">
                <Star size={18} />
              </button>
              <button onClick={() => setIsExpanded(!isExpanded)} className="h-9 w-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100 shadow-sm transition-all" title="تكبير/تصغير">
                <Maximize2 size={18} />
              </button>
          </div>
        </div>

        {/* Mobile Expand / Menu */}
        <div className="flex items-center gap-2">
            {/* Show resize on mobile right side */}
            <button onClick={() => setIsExpanded(!isExpanded)} className="sm:hidden h-9 w-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 active:scale-95 shadow-sm">
                {isExpanded ? <X size={18} /> : <Maximize2 size={18} />}
            </button>
            <button className="h-9 w-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 shadow-sm">
               <MoreHorizontal size={20} />
            </button>
        </div>
      </div>

      {/* Content Wrapper for Scrolling if Expanded */}
      <div className={`${isExpanded ? 'overflow-y-auto flex-1' : ''}`}>
          
          {/* SECTION 2: Title */}
          <div className="p-4 border-b border-gray-50 bg-white">
              <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                          {isExternal ? <Globe className="text-gray-400 shrink-0" size={16} /> : <BarChart3 className="text-gray-400 shrink-0" size={16} />}
                          <h2 className="text-sm lg:text-base font-bold text-gray-900 leading-tight">{widget.title}</h2>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{widget.description}</p>
                  </div>
              </div>
          </div>

          {/* SECTION 3: Value + Chart */}
          <div className={`p-4 border-b bg-white relative ${isExternal ? (isExpanded ? 'h-[60vh]' : 'h-64') : 'min-h-[160px]'}`}>
              {isExternal ? (
                  <div className="w-full h-full bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative">
                      {iframeUrl ? (
                          <iframe 
                            src={iframeUrl}
                            className="w-full h-full border-0"
                            title={widget.title}
                            sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                          />
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
                            <span className="text-xs">جاري التحميل...</span>
                          </div>
                      )}
                  </div>
              ) : (
                <div className="flex flex-col h-full justify-between">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-xs text-gray-500 mb-1 font-medium">القيمة الحالية</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-gray-900 tracking-tight">
                                    {currentValue.toLocaleString()}
                                </span>
                                {widget.type === ChartType.KPI && <span className="text-xs text-gray-400 font-medium">ريال</span>}
                            </div>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <span dir="ltr">{isPositive ? '+' : '-'}{trendPercent}%</span>
                        </div>
                    </div>
                    {/* Sparkline Area */}
                    <div className="h-24 w-full -mx-1">
                        <WidgetChart type={widget.type} data={widget.data} variant="sparkline" />
                    </div>
                </div>
              )}
          </div>

          {/* SECTION 4: Insight */}
          {!isExternal && (
              <div className="p-4 border-b bg-gray-50/30">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-blue-500" />
                        تحليل AI الذكي
                    </p>
                    {canAnalyze && !insight && !analyzing && (
                        <button 
                            onClick={handleAIAnalysis}
                            className="text-xs bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-all shadow-sm font-medium"
                        >
                            توليد تحليل
                        </button>
                    )}
                  </div>

                  {analyzing ? (
                      <div className="flex items-center gap-2 text-xs text-blue-600 animate-pulse bg-blue-50 p-3 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          جاري تحليل البيانات...
                      </div>
                  ) : insight ? (
                      <div className="text-xs leading-relaxed text-gray-700 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                          {insight}
                      </div>
                  ) : (
                      <div className="text-xs text-gray-400 text-center py-2 italic">
                          لا يوجد تحليل حالياً
                      </div>
                  )}
              </div>
          )}

          {/* SECTION 5: Footer */}
          <div className="bg-white px-4 py-3 flex items-center justify-between gap-4 mt-auto">
              <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 border border-gray-200 shrink-0">
                      {agencyName.substring(0, 1)}
                  </div>
                  <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-gray-700 truncate">{agencyName}</span>
                      <span className="text-[10px] text-gray-400 truncate">{widget.lastRefresh}</span>
                  </div>
              </div>
              
              <div className="flex gap-1 shrink-0">
                 {widget.tags.slice(0, 2).map(tag => (
                     <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                         #{tag}
                     </span>
                 ))}
              </div>
          </div>
      </div>
    </div>
  );
};

export default WidgetCard;