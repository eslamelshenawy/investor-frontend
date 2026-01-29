import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ACTIVITY_DATA } from '../constants';

const ActivityChart: React.FC = () => {
  return (
    <div className="h-64 w-full mt-4" dir="ltr"> {/* Recharts needs LTR context usually for axes */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={ACTIVITY_DATA}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis 
            dataKey="date" 
            tick={{fontSize: 12, fill: '#6B7280'}} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{fontSize: 12, fill: '#6B7280'}} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{fill: '#F3F4F6'}}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Bar dataKey="downloads" fill="#002B5C" radius={[4, 4, 0, 0]} barSize={20} name="التنزيلات" />
          <Bar dataKey="views" fill="#00A3E0" radius={[4, 4, 0, 0]} barSize={20} name="المشاهدات" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;