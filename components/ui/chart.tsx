'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';

export interface ChartProps {
  data: any[];
  type?: 'bar' | 'line' | 'area' | 'pie';
  xAxisKey?: string;
  series: {
    key: string;
    color?: string;
    name?: string;
  }[];
  height?: number | string;
  className?: string;
  hideGrid?: boolean;
}

const defaultColors = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-xl backdrop-blur-md">
        <p className="text-sm font-semibold mb-2">{label || payload[0].name}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color || entry.payload.fill }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const Chart: React.FC<ChartProps> = ({
  data,
  type = 'bar',
  xAxisKey = 'name',
  series,
  height = 300,
  className,
  hideGrid = false,
}) => {
  const commonProps = {
    data,
    margin: { top: 10, right: 10, left: -20, bottom: 0 },
  };

  if (type === 'pie') {
    return (
      <div className={cn("w-full flex justify-center items-center", className)} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={5}
              dataKey={series[0].key}
              nameKey={xAxisKey}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || defaultColors[index % defaultColors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const renderSeries = () => {
    return series.map((s, index) => {
      const color = s.color || defaultColors[index % defaultColors.length];
      
      if (type === 'bar') {
        return <Bar key={s.key} dataKey={s.key} name={s.name || s.key} fill={color} radius={[4, 4, 0, 0]} />;
      }
      if (type === 'line') {
        return <Line key={s.key} type="monotone" dataKey={s.key} name={s.name || s.key} stroke={color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />;
      }
      if (type === 'area') {
        return (
          <Area 
            key={s.key} 
            type="monotone" 
            dataKey={s.key} 
            name={s.name || s.key} 
            stroke={color} 
            fill={color} 
            fillOpacity={0.2} 
          />
        );
      }
      return null;
    });
  };

  const ChartComponent = type === 'bar' ? BarChart : type === 'line' ? LineChart : AreaChart;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent {...commonProps}>
          {!hideGrid && (
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
          )}
          <XAxis 
            dataKey={xAxisKey} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
          {renderSeries()}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};
