import React from 'react';
import { TimelineEvent, TimelineEventType } from '../types';
import { 
  Database, 
  RefreshCw, 
  AlertTriangle, 
  TrendingUp, 
  Lightbulb, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface TimelineCardProps {
  event: TimelineEvent;
  onClick?: () => void;
}

const TimelineCard: React.FC<TimelineCardProps> = ({ event, onClick }) => {
  // 1. Icon Mapping
  const getEventIcon = () => {
    switch (event.type) {
      case TimelineEventType.NEW_DATA: return <Database size={18} className="text-blue-600" />;
      case TimelineEventType.UPDATE: return <RefreshCw size={18} className="text-indigo-600" />;
      case TimelineEventType.REVISION: return <AlertTriangle size={18} className="text-amber-600" />;
      case TimelineEventType.SIGNAL: return <TrendingUp size={18} className="text-emerald-600" />;
      case TimelineEventType.INSIGHT: return <Lightbulb size={18} className="text-purple-600" />;
      case TimelineEventType.RADAR: return <PieChart size={18} className="text-slate-600" />;
      default: return <Clock size={18} className="text-gray-500" />;
    }
  };

  const getEventColor = () => {
    switch (event.type) {
      case TimelineEventType.NEW_DATA: return 'border-l-blue-500 bg-blue-50/30';
      case TimelineEventType.UPDATE: return 'border-l-indigo-500 bg-indigo-50/30';
      case TimelineEventType.REVISION: return 'border-l-amber-500 bg-amber-50/30';
      case TimelineEventType.SIGNAL: return 'border-l-emerald-500 bg-emerald-50/30';
      case TimelineEventType.INSIGHT: return 'border-l-purple-500 bg-purple-50/30';
      default: return 'border-l-gray-300';
    }
  };

  // Helper to format "Time Ago"
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    return date.toLocaleDateString('ar-SA');
  };

  return (
    <div 
      onClick={onClick}
      className={`group relative flex flex-col md:flex-row gap-3 md:gap-4 p-4 md:p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${getEventColor()} active:scale-[0.98] md:active:scale-100`}
    >
      {/* Header / Icon Section */}
      <div className="flex items-start justify-between md:w-48 md:shrink-0 md:flex-col md:border-l md:border-gray-100 md:pl-4">
        <div className="flex items-center gap-3 mb-2 md:mb-0">
          <div className="p-2 rounded-lg bg-white shadow-sm border border-gray-100">
            {getEventIcon()}
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {event.type === TimelineEventType.NEW_DATA && 'بيانات جديدة'}
            {event.type === TimelineEventType.UPDATE && 'تحديث دوري'}
            {event.type === TimelineEventType.REVISION && 'تعديل تاريخي'}
            {event.type === TimelineEventType.SIGNAL && 'إشارة سوق'}
            {event.type === TimelineEventType.INSIGHT && 'رؤية ذكية'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
          <Clock size={12} />
          {getTimeAgo(event.timestamp)}
        </div>
      </div>

      {/* Body Section */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-gray-900 text-base md:text-lg leading-tight group-hover:text-blue-600 transition-colors">
            {event.title}
            </h3>
            {/* Impact Badge */}
            {event.impactScore > 70 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-600 border border-red-100 whitespace-nowrap ml-2">
                    تأثير مرتفع
                </span>
            )}
        </div>
        
        <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2 md:line-clamp-none">
          {event.summary}
        </p>

        {/* Footer Section: Source, Delta, Tags */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4 pt-3 border-t border-gray-50">
           {/* Source */}
           <div className="flex items-center gap-1.5">
             <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                {event.sourceName.substring(0,1)}
             </div>
             <span className="text-xs text-gray-500 font-medium truncate max-w-[100px]">{event.sourceName}</span>
             <CheckCircle2 size={12} className="text-blue-500" />
           </div>

           {/* Delta Indicator */}
           {event.delta && (
             <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${event.delta.isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {event.delta.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span dir="ltr">{event.delta.value}</span>
             </div>
           )}

           <div className="flex-1 hidden md:block"></div>

           {/* Tags */}
           <div className="flex gap-1 md:gap-2 overflow-x-auto no-scrollbar max-w-full">
             {event.tags.map(tag => (
               <span key={tag} className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded whitespace-nowrap">
                 #{tag}
               </span>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineCard;