/**
 * Infographic Builder - أداة تصميم الإنفوجرافيك
 * Template-based infographic designer for DESIGNER role
 */

import React, { useState, useRef } from 'react';
import {
  Palette,
  Type,
  BarChart3,
  Download,
  Save,
  Eye,
  ArrowRight,
  Image,
  Loader2,
  Check,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
  PieChart,
  Activity,
} from 'lucide-react';
import { api } from '../src/services/api';
import { useNavigate } from 'react-router-dom';

interface DataItem {
  label: string;
  value: number;
  color: string;
}

interface InfographicState {
  template: string;
  title: string;
  subtitle: string;
  source: string;
  data: DataItem[];
  bgColor: string;
  accentColor: string;
  textColor: string;
  showTrend: boolean;
  trendDirection: 'up' | 'down' | 'neutral';
  trendText: string;
  footerText: string;
}

const COLORS = [
  '#002B5C', '#004080', '#1E40AF', '#2563EB', '#3B82F6',
  '#059669', '#10B981', '#D97706', '#DC2626', '#7C3AED',
  '#0891B2', '#6366F1', '#EC4899', '#14B8A6', '#F59E0B',
];

const ITEM_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#EC4899'];

const TEMPLATES = [
  { id: 'bars', name: 'أعمدة', icon: BarChart3, desc: 'مقارنة بيانات بأعمدة' },
  { id: 'stats', name: 'إحصائيات', icon: Activity, desc: 'أرقام وإحصائيات بارزة' },
  { id: 'pie', name: 'دائري', icon: PieChart, desc: 'نسب مئوية بشكل دائري' },
];

const InfographicBuilder = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saved, setSaved] = useState(false);

  const [state, setState] = useState<InfographicState>({
    template: 'bars',
    title: 'عنوان الإنفوجرافيك',
    subtitle: 'وصف مختصر للبيانات المعروضة',
    source: 'البوابة الوطنية للبيانات المفتوحة',
    data: [
      { label: 'القطاع الأول', value: 85, color: ITEM_COLORS[0] },
      { label: 'القطاع الثاني', value: 65, color: ITEM_COLORS[1] },
      { label: 'القطاع الثالث', value: 45, color: ITEM_COLORS[2] },
      { label: 'القطاع الرابع', value: 30, color: ITEM_COLORS[3] },
    ],
    bgColor: '#002B5C',
    accentColor: '#3B82F6',
    textColor: '#FFFFFF',
    showTrend: true,
    trendDirection: 'up',
    trendText: 'نمو 12% مقارنة بالعام السابق',
    footerText: 'رادار المستثمر - بيانات حكومية موثوقة',
  });

  const updateData = (index: number, field: keyof DataItem, value: string | number) => {
    const newData = [...state.data];
    (newData[index] as any)[field] = value;
    setState({ ...state, data: newData });
  };

  const addDataItem = () => {
    if (state.data.length >= 8) return;
    setState({
      ...state,
      data: [...state.data, { label: 'عنصر جديد', value: 50, color: ITEM_COLORS[state.data.length % ITEM_COLORS.length] }],
    });
  };

  const removeDataItem = (index: number) => {
    if (state.data.length <= 1) return;
    setState({ ...state, data: state.data.filter((_, i) => i !== index) });
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    setExporting(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        backgroundColor: state.bgColor,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `infographic-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }

    setExporting(false);
  };

  const handleSaveAsDraft = async () => {
    setSaving(true);

    const res = await api.createContentPost({
      type: 'INFOGRAPHIC',
      title: state.title,
      titleAr: state.title,
      body: state.subtitle,
      bodyAr: state.subtitle,
      tags: ['إنفوجرافيك', 'بيانات'],
      metadata: {
        template: state.template,
        designState: state,
      },
    });

    setSaving(false);

    if (res.success) {
      setSaved(true);
      setTimeout(() => navigate('/my-content'), 1500);
    }
  };

  const maxValue = Math.max(...state.data.map(d => d.value));

  const TrendIcon = state.trendDirection === 'up' ? TrendingUp : state.trendDirection === 'down' ? TrendingDown : Minus;

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Controls */}
        <div className="w-full lg:w-80 bg-white border-l border-gray-200 p-4 lg:h-screen lg:overflow-y-auto lg:sticky lg:top-0">
          <h2 className="font-black text-gray-900 text-lg mb-4 flex items-center gap-2">
            <Palette size={20} className="text-blue-600" />
            أداة الإنفوجرافيك
          </h2>

          {/* Template Selection */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">القالب</label>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setState({ ...state, template: t.id })}
                  className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                    state.template === t.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <t.icon size={18} className="mx-auto mb-1" />
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Text Fields */}
          <div className="space-y-3 mb-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">العنوان</label>
              <input
                value={state.title}
                onChange={e => setState({ ...state, title: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">الوصف</label>
              <input
                value={state.subtitle}
                onChange={e => setState({ ...state, subtitle: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">المصدر</label>
              <input
                value={state.source}
                onChange={e => setState({ ...state, source: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Colors */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-gray-500 mb-2">لون الخلفية</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.slice(0, 10).map(c => (
                <button
                  key={c}
                  onClick={() => setState({ ...state, bgColor: c })}
                  className={`w-7 h-7 rounded-lg border-2 transition-all ${state.bgColor === c ? 'border-white ring-2 ring-blue-500' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Data Items */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-500">البيانات</label>
              <button onClick={addDataItem} className="text-xs text-blue-600 font-bold hover:text-blue-700">+ إضافة</button>
            </div>
            <div className="space-y-2">
              {state.data.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                  <input
                    value={item.label}
                    onChange={e => updateData(i, 'label', e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded py-1 px-2 text-xs focus:outline-none focus:border-blue-400"
                    placeholder="التسمية"
                  />
                  <input
                    type="number"
                    value={item.value}
                    onChange={e => updateData(i, 'value', parseInt(e.target.value) || 0)}
                    className="w-16 bg-white border border-gray-200 rounded py-1 px-2 text-xs text-center focus:outline-none focus:border-blue-400"
                    dir="ltr"
                  />
                  <input
                    type="color"
                    value={item.color}
                    onChange={e => updateData(i, 'color', e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0"
                  />
                  {state.data.length > 1 && (
                    <button onClick={() => removeDataItem(i)} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Trend */}
          <div className="mb-5">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-2">
              <input
                type="checkbox"
                checked={state.showTrend}
                onChange={e => setState({ ...state, showTrend: e.target.checked })}
                className="rounded"
              />
              إظهار الاتجاه
            </label>
            {state.showTrend && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  {(['up', 'down', 'neutral'] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setState({ ...state, trendDirection: d })}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                        state.trendDirection === d ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {d === 'up' ? 'صعود ↑' : d === 'down' ? 'هبوط ↓' : 'ثابت →'}
                    </button>
                  ))}
                </div>
                <input
                  value={state.trendText}
                  onChange={e => setState({ ...state, trendText: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-blue-400"
                  placeholder="نص الاتجاه"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              تحميل كصورة PNG
            </button>
            <button
              onClick={handleSaveAsDraft}
              disabled={saving || saved}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-800 disabled:opacity-50"
            >
              {saved ? <><Check size={16} /> تم الحفظ!</> : saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> حفظ كمسودة</>}
            </button>
          </div>
        </div>

        {/* Preview Canvas */}
        <div className="flex-1 p-4 lg:p-8 flex items-start justify-center">
          <div
            ref={canvasRef}
            className="w-full max-w-[600px] rounded-2xl overflow-hidden shadow-2xl"
            style={{ backgroundColor: state.bgColor, color: state.textColor }}
          >
            {/* Header */}
            <div className="p-8 pb-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <span className="text-white/60 text-xs font-bold">رادار المستثمر</span>
              </div>
              <h1 className="text-2xl font-black leading-tight mb-2">{state.title}</h1>
              <p className="text-white/70 text-sm">{state.subtitle}</p>
            </div>

            {/* Chart Area */}
            <div className="px-8 py-6">
              {/* Bars Template */}
              {state.template === 'bars' && (
                <div className="space-y-4">
                  {state.data.map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold">{item.label}</span>
                        <span className="text-sm font-black">{item.value}%</span>
                      </div>
                      <div className="h-8 bg-white/10 rounded-lg overflow-hidden">
                        <div
                          className="h-full rounded-lg transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (item.value / maxValue) * 100)}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Stats Template */}
              {state.template === 'stats' && (
                <div className="grid grid-cols-2 gap-4">
                  {state.data.map((item, i) => (
                    <div key={i} className="bg-white/10 rounded-2xl p-5 text-center">
                      <div className="text-3xl font-black mb-1" style={{ color: item.color }}>{item.value}%</div>
                      <div className="text-sm text-white/70">{item.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pie Template */}
              {state.template === 'pie' && (
                <div className="flex items-center gap-6">
                  <div className="relative w-40 h-40 shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      {(() => {
                        const total = state.data.reduce((sum, d) => sum + d.value, 0);
                        let currentAngle = 0;
                        return state.data.map((item, i) => {
                          const percentage = (item.value / total) * 100;
                          const dashArray = `${percentage} ${100 - percentage}`;
                          const dashOffset = -currentAngle;
                          currentAngle += percentage;
                          return (
                            <circle
                              key={i}
                              cx="50" cy="50" r="40"
                              fill="none"
                              stroke={item.color}
                              strokeWidth="20"
                              strokeDasharray={dashArray}
                              strokeDashoffset={dashOffset}
                              className="transition-all duration-500"
                              style={{ strokeLinecap: 'butt' }}
                            />
                          );
                        });
                      })()}
                    </svg>
                  </div>
                  <div className="flex-1 space-y-3">
                    {state.data.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-sm flex-1">{item.label}</span>
                        <span className="text-sm font-bold">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Trend */}
            {state.showTrend && (
              <div className="mx-8 mb-4 bg-white/10 rounded-xl p-3 flex items-center gap-3">
                <TrendIcon
                  size={20}
                  className={
                    state.trendDirection === 'up' ? 'text-emerald-400' :
                    state.trendDirection === 'down' ? 'text-red-400' : 'text-amber-400'
                  }
                />
                <span className="text-sm">{state.trendText}</span>
              </div>
            )}

            {/* Footer */}
            <div className="px-8 py-4 bg-black/10 flex items-center justify-between">
              <span className="text-xs text-white/50">المصدر: {state.source}</span>
              <span className="text-xs text-white/50">{state.footerText}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfographicBuilder;
