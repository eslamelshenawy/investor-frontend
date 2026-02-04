import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Heart,
    Share2,
    Bookmark,
    MoreHorizontal,
    CheckCircle2,
    BarChart2,
    ExternalLink,
    Play,
    Clock,
    Headphones,
    Maximize2,
    FileText,
    Plus,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    AlertTriangle,
    Lightbulb,
    Scale,
    Flame,
    Calendar,
    Quote,
    Layers,
    Vote,
    MapPin,
    Info,
    Check,
    Megaphone,
    BookOpen,
    HelpCircle,
    ListChecks,
    CheckSquare
} from 'lucide-react';
import { FeedItem, FeedContentType } from '../types';
import WidgetChart from './WidgetChart';

interface FeedCardProps {
    item: FeedItem;
    onAction?: (action: string, itemId: string) => void;
    onLike?: (itemId: string) => void;
    onSave?: (itemId: string) => void;
}

const FeedCard: React.FC<FeedCardProps> = ({ item, onAction, onLike, onSave }) => {
    const navigate = useNavigate();
    const [liked, setLiked] = useState(item.hasLiked || false);
    const [saved, setSaved] = useState(item.hasSaved || false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // --- RENDERERS ---

    const renderSignalAlert = () => {
        const isPos = item.payload.isPositive;
        return (
            <div className={`mt-3 sm:mt-4 relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 border ${isPos ? 'bg-emerald-950/5 border-emerald-100' : 'bg-rose-950/5 border-rose-100'}`}>
                {/* Background Decor */}
                <div className={`absolute -right-10 -top-10 w-32 sm:w-40 h-32 sm:h-40 rounded-full blur-3xl opacity-20 ${isPos ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-5 text-center sm:text-right">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${isPos ? 'bg-white text-emerald-600 border-emerald-100' : 'bg-white text-rose-600 border-rose-100'}`}>
                        {isPos ? <TrendingUp size={24} className="sm:w-8 sm:h-8" /> : <AlertTriangle size={24} className="sm:w-8 sm:h-8" />}
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-1.5 sm:gap-2 mb-2">
                            <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-gray-400">تحليل فني</span>
                            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${isPos ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {isPos ? 'إشارة إيجابية' : 'تنبيه مخاطر'}
                            </span>
                        </div>
                        <div className="text-2xl sm:text-4xl font-black mb-1.5 sm:mb-2 tracking-tighter text-gray-900">
                            <span className={isPos ? 'text-emerald-600' : 'text-rose-600'}>
                                {isPos ? '+' : ''}{item.payload.delta}
                            </span>
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm font-medium leading-relaxed">
                            {item.payload.context}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const renderMarketPulse = () => {
        const isHot = item.payload.status === 'hot';
        const isWarm = item.payload.status === 'warm';
        const color = isHot ? 'orange' : isWarm ? 'yellow' : 'blue';

        return (
            <div className="mt-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm relative overflow-hidden group hover:border-gray-300 transition-colors">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">نبض القطاع</p>
                        <h3 className="text-xl font-black text-gray-900">{item.payload.sector}</h3>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-${color}-50 text-${color}-600 border border-${color}-100`}>
                        <Flame size={14} className={isHot ? 'animate-pulse' : ''} />
                        <span className="text-xs font-black uppercase">{isHot ? 'ساخن' : isWarm ? 'نشط' : 'هادئ'}</span>
                    </div>
                </div>

                {/* Meter */}
                <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 grid grid-cols-12 gap-0.5 opacity-30">
                        {[...Array(12)].map((_, i) => <div key={i} className="bg-white/50 h-full w-full"></div>)}
                    </div>
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-${color}-400 to-${color}-600`}
                        style={{ width: `${item.payload.score}%` }}
                    ></div>
                </div>

                <p className="mt-3 text-sm text-gray-500 font-medium">{item.payload.summary}</p>
            </div>
        );
    };

    const renderFact = () => (
        <div className="mt-3 sm:mt-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-amber-100/50 relative overflow-hidden text-center group">
            <Quote size={60} className="absolute top-2 left-2 sm:top-4 sm:left-4 text-amber-500/10 rotate-180 transform transition-transform group-hover:scale-110 sm:w-20 sm:h-20" />

            <div className="relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm border border-amber-100 text-amber-500">
                    <Lightbulb size={20} className="fill-current sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-amber-900/60 font-bold text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-2 sm:mb-3">حقيقة استثمارية</h4>
                <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 leading-relaxed font-serif">
                    "{item.payload.fact}"
                </p>
            </div>
        </div>
    );

    const renderComparison = () => (
        <div className="mt-4 flex flex-col md:flex-row items-stretch gap-4">
            {/* A */}
            <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-5 text-center hover:border-blue-200 transition-colors group">
                <div className="text-xs text-gray-400 font-bold uppercase mb-2">{item.payload.itemA.label}</div>
                <div className="text-3xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{item.payload.itemA.value}</div>
            </div>

            {/* VS */}
            <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400 border border-gray-200">
                    VS
                </div>
            </div>

            {/* B */}
            <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-5 text-center hover:border-purple-200 transition-colors group">
                <div className="text-xs text-gray-400 font-bold uppercase mb-2">{item.payload.itemB.label}</div>
                <div className="text-3xl font-black text-gray-400 group-hover:text-purple-600 transition-colors">{item.payload.itemB.value}</div>
            </div>
        </div>
    );

    const renderWeeklySnapshot = () => (
        <div className="mt-3 sm:mt-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
            {/* Abstract Shapes */}
            <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 -mr-10 sm:-mr-20 -mt-10 sm:-mt-20"></div>
            <div className="absolute bottom-0 left-0 w-28 sm:w-40 h-28 sm:h-40 bg-purple-500 rounded-full blur-[60px] opacity-20 -ml-5 sm:-ml-10 -mb-5 sm:-mb-10"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-white/10">
                    <h4 className="font-bold flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
                        <Calendar size={16} className="text-blue-400 sm:w-5 sm:h-5" />
                        ملخص الأسواق
                    </h4>
                    <span className="text-[10px] sm:text-xs bg-white/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-gray-300">الأسبوع 42</span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    {item.payload.highlights.map((point: any, idx: number) => (
                        <div key={idx} className="bg-white/5 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/5 hover:bg-white/10 transition-colors">
                            <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">{point.label}</p>
                            <p className="text-sm sm:text-lg font-bold text-white tracking-wide">{point.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderBreakingNews = () => (
        <div className="mt-3 sm:mt-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden animate-pulse-slow shadow-xl shadow-red-600/30">
            <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="relative z-10 flex flex-col sm:flex-row items-start gap-3 sm:gap-5">
                <div className="bg-white/20 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl animate-bounce backdrop-blur-sm border border-white/20 self-center sm:self-start">
                    <Megaphone size={22} className="text-white fill-white sm:w-7 sm:h-7" />
                </div>
                <div className="flex-1 text-center sm:text-right">
                    <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <span className="bg-white text-red-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-sm">عاجل</span>
                        <div className="w-1 h-1 rounded-full bg-red-300"></div>
                        <span className="text-red-100 text-[10px] sm:text-xs font-bold font-mono tracking-wider">{new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h3 className="text-lg sm:text-2xl lg:text-3xl font-black leading-tight mb-2 sm:mb-3 tracking-tight">
                        {item.payload.headline}
                    </h3>
                    <p className="text-red-50 text-xs sm:text-sm lg:text-base font-medium leading-relaxed opacity-90">
                        {item.payload.summary}
                    </p>
                </div>
            </div>
        </div>
    );

    const renderTerminology = () => (
        <div className="mt-3 sm:mt-4 bg-indigo-50/50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-indigo-100 relative overflow-hidden group hover:bg-indigo-50 transition-colors">
            <BookOpen size={100} className="absolute -left-4 -bottom-4 sm:-left-6 sm:-bottom-6 text-indigo-500/5 rotate-12 group-hover:rotate-6 transition-transform duration-700 sm:w-[140px] sm:h-[140px]" />
            <div className="relative z-10 text-center">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 text-indigo-600 mb-3 sm:mb-4 bg-white/60 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-indigo-100 backdrop-blur-sm">
                    <BookOpen size={12} className="sm:w-3.5 sm:h-3.5" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">قاموس المستثمر</span>
                </div>
                <h3 className="text-xl sm:text-3xl lg:text-4xl font-black text-indigo-900 mb-3 sm:mb-4 font-serif tracking-tight">
                    {item.payload.term}
                </h3>
                <div className="w-10 sm:w-12 h-1 bg-indigo-200 mx-auto rounded-full mb-4 sm:mb-5"></div>
                <p className="text-indigo-900/70 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base font-medium max-w-lg mx-auto">
                    {item.payload.definition}
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                    {item.tags.map(tag => (
                        <span key={tag} className="text-[9px] sm:text-[10px] bg-white text-indigo-500 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg border border-indigo-100 font-bold hover:shadow-sm transition-all cursor-default">#{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderQAndA = () => (
        <div className="mt-3 sm:mt-4 border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-gradient-to-b from-gray-50/50 to-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-blue-50 rounded-full blur-3xl -mr-8 sm:-mr-10 -mt-8 sm:-mt-10 opacity-60"></div>
            <div className="relative z-10">
                <div className="flex gap-2.5 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm text-gray-400">
                        <HelpCircle size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl rounded-tr-sm p-3 sm:p-4 shadow-sm text-xs sm:text-sm lg:text-base font-bold text-gray-800 leading-relaxed max-w-[85%]">
                        {item.payload.question}
                    </div>
                </div>
                <div className="flex gap-2.5 sm:gap-4 flex-row-reverse">
                    <div className="relative shrink-0">
                        <img src={item.payload.expertAvatar} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border-2 border-white shadow-md object-cover" />
                        <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 bg-blue-600 text-white rounded-full p-0.5 border-2 border-white">
                            <Check size={6} className="sm:w-2 sm:h-2" strokeWidth={4} />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl sm:rounded-2xl rounded-tl-sm p-3 sm:p-5 shadow-lg shadow-blue-500/20 text-xs sm:text-sm lg:text-base font-medium leading-relaxed max-w-[90%] relative">
                        <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
                        {item.payload.answer}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderChecklist = () => (
        <div className="mt-4 border border-gray-200 rounded-2xl p-6 bg-white shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h4 className="font-bold flex items-center gap-2 text-gray-900 text-lg">
                        <ListChecks size={22} className="text-green-600" />
                        {item.payload.listTitle}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 mr-8">أنجز الخطوات التالية</p>
                </div>
                <div className="text-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                    <span className="block text-xl font-black text-gray-900">{Math.round((item.payload.items.filter((i: any) => i.checked).length / item.payload.items.length) * 100)}%</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">اكتمال</span>
                </div>
            </div>
            <div className="space-y-3">
                {item.payload.items.map((checkItem: any, i: number) => (
                    <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer group ${checkItem.checked ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm'}`}>
                        <div className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm ${checkItem.checked ? 'bg-green-500 border-green-500 scale-100' : 'bg-white border-gray-300 group-hover:border-green-400 scale-90 group-hover:scale-100'}`}>
                            {checkItem.checked && <Check size={14} className="text-white stroke-[4]" />}
                        </div>
                        <div className="flex-1">
                            <span className={`text-sm font-bold block mb-0.5 transition-colors ${checkItem.checked ? 'text-green-900 line-through decoration-green-300' : 'text-gray-900'}`}>
                                {checkItem.text}
                            </span>
                            {checkItem.subtext && <span className="text-xs text-gray-400 block">{checkItem.subtext}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderPoll = () => (
        <div className="mt-4 border border-gray-200 rounded-2xl p-5 bg-gray-50/50">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold flex items-center gap-2 text-gray-800">
                    <Vote size={18} className="text-blue-600" />
                    تصويت الجمهور
                </h4>
                <span className="text-xs text-gray-500">{item.payload.totalVotes} صوت • ينتهي خلال 2 يوم</span>
            </div>
            <div className="space-y-3">
                {item.payload.options.map((opt: any, idx: number) => (
                    <div key={idx} className="relative group cursor-pointer">
                        <div className="flex justify-between text-xs font-bold mb-1 z-10 relative px-1">
                            <span>{opt.label}</span>
                            <span>{opt.percentage}%</span>
                        </div>
                        <div className="h-8 w-full bg-white border border-gray-200 rounded-lg overflow-hidden relative">
                            <div
                                className="h-full bg-blue-100 transition-all duration-1000 group-hover:bg-blue-200"
                                style={{ width: `${opt.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
            <button className="w-full mt-4 py-2.5 text-xs font-bold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">
                شارك برأيك
            </button>
        </div>
    );

    const renderEvent = () => (
        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row bg-white border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden group hover:border-blue-300 transition-colors">
            <div className="bg-blue-50 p-4 sm:p-6 flex flex-row sm:flex-col items-center justify-center sm:text-center w-full sm:w-28 md:w-32 shrink-0 border-b sm:border-b-0 sm:border-l border-blue-100 gap-2 sm:gap-0">
                <span className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase sm:mb-1">{item.payload.month}</span>
                <span className="text-2xl sm:text-4xl font-black text-blue-800 sm:mb-1">{item.payload.day}</span>
                <span className="text-[10px] sm:text-xs font-medium text-blue-600/70">{item.payload.time}</span>
            </div>
            <div className="p-4 sm:p-5 flex-1 relative">
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                    <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border ${item.payload.isOnline ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                        {item.payload.isOnline ? 'ONLINE' : 'IN-PERSON'}
                    </span>
                </div>
                <h3 className="font-bold text-sm sm:text-lg text-gray-900 mb-1.5 sm:mb-2 mt-6 sm:mt-4 md:mt-0">{item.payload.eventName}</h3>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    <MapPin size={12} className="sm:w-3.5 sm:h-3.5" />
                    {item.payload.location}
                </div>
                <button className="text-[10px] sm:text-xs font-bold bg-slate-900 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-slate-800 transition-colors">
                    سجل حضورك
                </button>
            </div>
        </div>
    );

    const renderExpertInsight = () => {
        if (!item.payload?.quote) return null;
        return (
            <div className="mt-3 sm:mt-4 p-5 sm:p-8 bg-slate-900 text-white rounded-xl sm:rounded-2xl relative overflow-hidden text-center sm:text-right">
                <Quote size={40} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/10 rotate-180 sm:w-[60px] sm:h-[60px]" />
                <div className="relative z-10">
                    <p className="text-base sm:text-xl lg:text-2xl font-serif leading-relaxed mb-4 sm:mb-6 opacity-90">
                        "{item.payload.quote}"
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4">
                        <img src={item.payload.expertImage} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-slate-700 object-cover" />
                        <div className="text-right">
                            <p className="font-bold text-xs sm:text-sm text-white">{item.payload.expertName}</p>
                            <p className="text-[10px] sm:text-xs text-slate-400">{item.payload.expertRole}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderPortfolio = () => (
        <div className="mt-4 border border-gray-100 rounded-2xl p-5 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-sm">توزيع المحفظة المقترح</h3>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">عائد: {item.payload.expectedReturn}%</span>
            </div>
            <div className="flex items-center gap-4 lg:gap-8">
                {/* CSS Pie Chart approximation */}
                <div className="relative w-28 h-28 rounded-full border-[16px] border-blue-500 shrink-0"
                    style={{ borderColor: 'transparent', background: `conic-gradient(#3b82f6 0% 40%, #a855f7 40% 70%, #22c55e 70% 90%, #f59e0b 90% 100%)` }}>
                    <div className="absolute inset-0 m-auto w-16 h-16 bg-white rounded-full"></div>
                </div>

                <div className="space-y-2 flex-1">
                    {item.payload.assets.map((asset: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="flex items-center gap-2 font-bold text-gray-600">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: asset.color }}></span>
                                {asset.name}
                            </span>
                            <span className="font-black text-gray-900">{asset.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderDashboardContent = () => (
        <div className="group cursor-pointer mt-3 sm:mt-4 relative rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-500" onClick={() => navigate(`/dashboards?id=${item.payload.dashboardId}`)}>
            <div className="aspect-[16/9] w-full bg-slate-100 relative overflow-hidden">
                <img
                    src={item.payload.previewImage}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt="Dashboard Preview"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-80"></div>

                {/* Top Tags */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-1.5 sm:gap-2">
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/90 backdrop-blur text-[10px] sm:text-xs font-bold rounded-md sm:rounded-lg shadow-sm text-slate-800 flex items-center gap-1 sm:gap-1.5">
                        <Layers size={10} className="text-blue-600 sm:w-3 sm:h-3" /> لوحة تفاعلية
                    </span>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 text-white translate-y-1 sm:translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-blue-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-0.5 sm:mb-1">بيانات حية</p>
                            <h3 className="text-base sm:text-2xl font-black mb-1 sm:mb-2">{item.title}</h3>
                            <div className="flex gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-300 font-medium">
                                <span>{item.payload.widgetCount} مؤشر</span>
                                <span>•</span>
                                <span>{(item.payload.views || 0).toLocaleString()} مشاهدة</span>
                            </div>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 sm:translate-x-4 group-hover:translate-x-0">
                            <ArrowUpRight size={16} className="sm:w-5 sm:h-5" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderArticleContent = () => (
        <div className="mt-3 sm:mt-4 group cursor-pointer" onClick={() => navigate('/dataset/d1')}>
            {item.payload.imageUrl && (
                <div className="rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4 relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-[2.5/1]">
                    <img
                        src={item.payload.imageUrl}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        alt="Article Cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                </div>
            )}
            <div>
                <h3 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2 group-hover:text-blue-700 transition-colors leading-tight">
                    {item.title}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm lg:text-base leading-relaxed line-clamp-2 sm:line-clamp-3">
                    {item.payload.excerpt}
                </p>
                <div className="mt-2 sm:mt-3 flex items-center text-blue-600 text-[10px] sm:text-xs font-bold gap-1 group-hover:gap-2 transition-all">
                    اقرأ المزيد <ArrowDownRight size={12} className="sm:w-3.5 sm:h-3.5" />
                </div>
            </div>
        </div>
    );

    // --- MAIN CARD LAYOUT ---

    return (
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 group hover:-translate-y-0.5 sm:hover:-translate-y-1">

            {/* Header */}
            <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative shrink-0">
                        <img
                            src={item.author.avatar || `https://ui-avatars.com/api/?name=${item.author.name}`}
                            className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl object-cover border-2 border-white shadow-sm"
                            alt={item.author.name}
                        />
                        {item.author.verified && (
                            <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white">
                                <CheckCircle2 size={8} className="sm:w-2.5 sm:h-2.5" strokeWidth={4} />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 text-xs sm:text-sm truncate">{item.author.name}</h3>
                        <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1 sm:gap-2 flex-wrap">
                            <span className="truncate max-w-[80px] sm:max-w-none">{item.author.role}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block"></span>
                            <span>{new Date(item.timestamp).toLocaleDateString('ar-SA')}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center shrink-0">
                    <button className="p-1.5 sm:p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors flex items-center justify-center">
                        <MoreHorizontal size={18} className="sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="mb-3 sm:mb-5">
                {/* Text for non-article types (Article handles its own title) */}
                {item.contentType !== FeedContentType.ARTICLE && item.contentType !== FeedContentType.DASHBOARD && (
                    <p className="text-gray-800 font-bold text-sm sm:text-base md:text-lg mb-2 sm:mb-3 leading-snug">
                        {item.title}
                    </p>
                )}

                {/* Dynamic Content Renderer */}
                {item.contentType === FeedContentType.DASHBOARD && renderDashboardContent()}
                {item.contentType === FeedContentType.ARTICLE && renderArticleContent()}
                {item.contentType === FeedContentType.SIGNAL_ALERT && renderSignalAlert()}
                {item.contentType === FeedContentType.MARKET_PULSE && renderMarketPulse()}
                {item.contentType === FeedContentType.FACT && renderFact()}
                {item.contentType === FeedContentType.COMPARISON && renderComparison()}
                {item.contentType === FeedContentType.WEEKLY_SNAPSHOT && renderWeeklySnapshot()}
                {item.contentType === FeedContentType.POLL && renderPoll()}
                {item.contentType === FeedContentType.EVENT && renderEvent()}
                {item.contentType === FeedContentType.EXPERT_INSIGHT && renderExpertInsight()}
                {item.contentType === FeedContentType.PORTFOLIO && renderPortfolio()}

                {/* NEW EDUCATIONAL */}
                {item.contentType === FeedContentType.BREAKING_NEWS && renderBreakingNews()}
                {item.contentType === FeedContentType.TERMINOLOGY && renderTerminology()}
                {item.contentType === FeedContentType.Q_AND_A && renderQAndA()}
                {item.contentType === FeedContentType.CHECKLIST && renderChecklist()}

                {/* Generic fallback for others */}
                {(item.contentType === FeedContentType.VIDEO || item.contentType === FeedContentType.AUDIO || item.contentType === FeedContentType.IMAGE || item.contentType === FeedContentType.WIDGET) && (
                    <div className="p-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm">محتوى {item.contentType}</p>
                    </div>
                )}
            </div>

            {/* Footer Action Bar */}
            <div className="pt-3 sm:pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex gap-1 sm:gap-2 md:gap-4">
                    <button
                        onClick={async () => {
                            if (isLiking) return;
                            setIsLiking(true);
                            if (onLike) {
                                await onLike(item.id);
                            }
                            setLiked(!liked);
                            setIsLiking(false);
                        }}
                        disabled={isLiking}
                        className={`group flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all ${liked ? 'bg-pink-50 text-pink-600' : 'hover:bg-gray-50 text-gray-500'} ${isLiking ? 'opacity-50' : ''}`}
                    >
                        <Heart size={16} className={`transition-transform group-hover:scale-110 sm:w-[18px] sm:h-[18px] ${liked ? 'fill-current' : ''} ${isLiking ? 'animate-pulse' : ''}`} />
                        <span className="text-[10px] sm:text-xs font-bold">{item.engagement.likes + (liked ? 1 : 0)}</span>
                    </button>

                    <button className="group flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-gray-50 text-gray-500 transition-all">
                        <Share2 size={16} className="transition-transform group-hover:scale-110 sm:w-[18px] sm:h-[18px]" />
                        <span className="text-[10px] sm:text-xs font-bold hidden xs:inline">مشاركة</span>
                    </button>
                </div>

                <button
                    onClick={async () => {
                        if (isSaving) return;
                        setIsSaving(true);
                        if (onSave) {
                            await onSave(item.id);
                        }
                        setSaved(!saved);
                        setIsSaving(false);
                    }}
                    disabled={isSaving}
                    className={`p-1.5 sm:p-2 rounded-lg transition-all ${saved ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'} ${isSaving ? 'opacity-50' : ''}`}
                >
                    <Bookmark size={18} className={`sm:w-5 sm:h-5 ${saved ? 'fill-current' : ''} ${isSaving ? 'animate-pulse' : ''}`} />
                </button>
            </div>
        </div>
    );
};

export default FeedCard;