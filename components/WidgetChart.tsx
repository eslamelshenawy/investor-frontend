import React from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { ChartType, WidgetDataPoint } from '../types';

interface WidgetChartProps {
  type: ChartType;
  data: WidgetDataPoint[];
  color?: string;
  variant?: 'default' | 'sparkline';
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded text-xs text-right z-50">
        <p className="font-bold text-gray-700 mb-1">{label}</p>
        <p className="text-blue-600 font-mono">
          {payload[0].value?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const WidgetChart: React.FC<WidgetChartProps> = ({ type, data, color = '#3b82f6', variant = 'default' }) => {
  const isSparkline = variant === 'sparkline';
  
  if (type === ChartType.KPI && !isSparkline) {
    const value = data[0]?.value || 0;
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-gray-800">{value.toLocaleString()}</span>
        <span className="text-sm text-gray-500 mt-2">مليون ريال</span>
      </div>
    );
  }

  // Sparkline configuration
  const margin = isSparkline ? { top: 5, right: 5, left: 5, bottom: 5 } : { top: 10, right: 30, left: 0, bottom: 0 };
  const strokeWidth = isSparkline ? 2 : 3;
  const showAxes = !isSparkline;
  const showGrid = !isSparkline;
  const showLegend = !isSparkline;

  return (
    <ResponsiveContainer width="100%" height="100%">
      {(() => {
        switch (type) {
          case ChartType.AREA:
            return (
              <AreaChart data={data} margin={margin}>
                <defs>
                  <linearGradient id={`colorGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                {showAxes && <XAxis dataKey="name" tick={{fill: '#6b7280', fontSize: 12}} />}
                {showAxes && <YAxis tick={{fill: '#6b7280', fontSize: 12}} />}
                {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />}
                <Tooltip content={<CustomTooltip />} cursor={!isSparkline} />
                <Area type="monotone" dataKey="value" stroke={color} strokeWidth={strokeWidth} fillOpacity={1} fill={`url(#colorGradient-${color})`} />
              </AreaChart>
            );
          case ChartType.BAR:
            return (
              <BarChart data={data} margin={margin}>
                {showAxes && <XAxis dataKey="name" tick={{fill: '#6b7280', fontSize: 12}} />}
                {showAxes && <YAxis tick={{fill: '#6b7280', fontSize: 12}} />}
                {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />}
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
              </BarChart>
            );
          case ChartType.PIE:
            return (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={isSparkline ? 15 : 60}
                  outerRadius={isSparkline ? 25 : 80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                {showLegend && <Legend layout="vertical" verticalAlign="middle" align="left" wrapperStyle={{fontSize: '12px'}} />}
              </PieChart>
            );
          default: // LINE
            return (
              <LineChart data={data} margin={margin}>
                {showAxes && <XAxis dataKey="name" tick={{fill: '#6b7280', fontSize: 12}} />}
                {showAxes && <YAxis tick={{fill: '#6b7280', fontSize: 12}} />}
                {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />}
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={color} 
                  strokeWidth={strokeWidth} 
                  dot={!isSparkline ? {r: 4} : false} 
                  activeDot={{r: 6}} 
                />
              </LineChart>
            );
        }
      })()}
    </ResponsiveContainer>
  );
};

export default WidgetChart;