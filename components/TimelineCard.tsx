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
  CheckCircle2,
  Sparkles,
  BarChart3,
  FileText,
  Zap
} from 'lucide-react';

interface TimelineCardProps {
  event: TimelineEvent;
  onClick?: () => void;
}

const TimelineCard: React.FC<TimelineCardProps> = ({ event, onClick }) => {
  // Icon Mapping with better visuals
  const getEventIcon = () => {
    switch (event.type) {
      case TimelineEventType.NEW_DATA: return <Database size={20} />;
      case TimelineEventType.UPDATE: return <RefreshCw size={20} />;
      case TimelineEventType.REVISION: return <AlertTriangle size={20} />;
      case TimelineEventType.SIGNAL: return <TrendingUp size={20} />;
      case TimelineEventType.INSIGHT: return <Lightbulb size={20} />;
      case TimelineEventType.RADAR: return <PieChart size={20} />;
      default: return <FileText size={20} />;
    }
  };

  const getEventStyles = () => {
    switch (event.type) {
      case TimelineEventType.NEW_DATA:
        return {
          border: 'border-l-blue-500',
          bg: 'bg-gradient-to-r from-blue-50/80 to-white',
          iconBg: 'bg-blue-500',
          iconText: 'text-white',
          badge: 'bg-blue-100 text-blue-700',
          label: 'بيانات جديدة'
        };
      case TimelineEventType.UPDATE:
        return {
          border: 'border-l-indigo-500',
          bg: 'bg-gradient-to-r from-indigo-50/80 to-white',
          iconBg: 'bg-indigo-500',
          iconText: 'text-white',
          badge: 'bg-indigo-100 text-indigo-700',
          label: 'تحديث'
        };
      case TimelineEventType.REVISION:
        return {
          border: 'border-l-amber-500',
          bg: 'bg-gradient-to-r from-amber-50/80 to-white',
          iconBg: 'bg-amber-500',
          iconText: 'text-white',
          badge: 'bg-amber-100 text-amber-700',
          label: 'تنبيه'
        };
      case TimelineEventType.SIGNAL:
        return {
          border: 'border-l-emerald-500',
          bg: 'bg-gradient-to-r from-emerald-50/80 to-white',
          iconBg: 'bg-emerald-500',
          iconText: 'text-white',
          badge: 'bg-emerald-100 text-emerald-700',
          label: 'إشارة'
        };
      case TimelineEventType.INSIGHT:
        return {
          border: 'border-l-purple-500',
          bg: 'bg-gradient-to-r from-purple-50/80 to-white',
          iconBg: 'bg-purple-500',
          iconText: 'text-white',
          badge: 'bg-purple-100 text-purple-700',
          label: 'رؤية ذكية'
        };
      default:
        return {
          border: 'border-l-gray-400',
          bg: 'bg-white',
          iconBg: 'bg-gray-500',
          iconText: 'text-white',
          badge: 'bg-gray-100 text-gray-700',
          label: 'حدث'
        };
    }
  };

  const styles = getEventStyles();

  // Format "Time Ago" in Arabic
  const getTimeAgo = (dateString: string) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'الآن';
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `منذ ${mins} ${mins === 1 ? 'دقيقة' : 'دقائق'}`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
    }
    return date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' });
  };

  // Impact score color
  const getImpactColor = (score: number) => {
    if (score >= 80) return 'bg-red-500 text-white';
    if (score >= 60) return 'bg-orange-500 text-white';
    if (score >= 40) return 'bg-yellow-500 text-white';
    return 'bg-gray-200 text-gray-600';
  };

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 ${styles.border} ${styles.bg}`}
    >
      {/* Main Content */}
      <div className="p-4 md:p-5">
        {/* Top Row: Type Badge + Time */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl ${styles.iconBg} ${styles.iconText} flex items-center justify-center shadow-sm`}>
              {getEventIcon()}
            </div>
            {/* Type Badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles.badge}`}>
              {styles.label}
            </span>
          </div>

          {/* Time + Impact */}
          <div className="flex items-center gap-2">
            {event.impactScore > 0 && (
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${getImpactColor(event.impactScore)}`}>
                {event.impactScore}
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
              <Clock size={12} />
              <span>{getTimeAgo(event.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base md:text-lg leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {event.title}
        </h3>

        {/* Summary */}
        {event.summary && (
          <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
            {event.summary}
          </p>
        )}

        {/* Footer: Source + Delta + Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100/50">
          {/* Source */}
          <div className="flex items-center gap-1.5 bg-white/80 px-2 py-1 rounded-lg border border-gray-100">
            <div className={`w-5 h-5 rounded-full ${styles.iconBg} flex items-center justify-center text-[10px] text-white font-bold`}>
              {event.sourceName?.substring(0, 1) || '؟'}
            </div>
            <span className="text-xs text-gray-600 font-medium truncate max-w-[120px]">
              {event.sourceName || 'مصدر غير محدد'}
            </span>
            <CheckCircle2 size={12} className="text-blue-500" />
          </div>

          {/* Delta Indicator */}
          {event.delta && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
              event.delta.isPositive
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {event.delta.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span dir="ltr">{event.delta.value}</span>
              {event.delta.label && (
                <span className="text-[10px] opacity-75 mr-1">{event.delta.label}</span>
              )}
            </div>
          )}

          <div className="flex-1"></div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {event.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="text-[10px] text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md whitespace-nowrap transition-colors"
                >
                  #{tag}
                </span>
              ))}
              {event.tags.length > 3 && (
                <span className="text-[10px] text-gray-400 px-1">
                  +{event.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-transparent transition-all duration-300 pointer-events-none"></div>
    </div>
  );
};

export default TimelineCard;
