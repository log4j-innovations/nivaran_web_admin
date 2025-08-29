'use client';

import React from 'react';

interface ChartData {
  label: string;
  value: number;
  total: number;
  color: string;
}

interface SimpleChartProps {
  data: ChartData[];
  title: string;
  type?: 'progress' | 'bar' | 'pie';
  height?: number;
}

export default function SimpleChart({ data, title, type = 'progress', height = 200 }: SimpleChartProps) {
  const renderProgressChart = () => (
    <div className="space-y-4">
      {data.map((item, index) => {
        const percentage = (item.value / item.total) * 100;
        return (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{item.label}</span>
              <span className="text-gray-600">
                {item.value} / {item.total} ({percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${item.color}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderBarChart = () => (
    <div className="space-y-4">
      {data.map((item, index) => {
        const percentage = (item.value / item.total) * 100;
        const barHeight = (item.value / Math.max(...data.map(d => d.value))) * height;
        
        return (
          <div key={index} className="flex items-end space-x-3">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{item.label}</span>
                <span className="text-gray-600">{item.value}</span>
              </div>
              <div className="relative bg-gray-200 rounded-lg overflow-hidden" style={{ height: `${height}px` }}>
                <div
                  className={`absolute bottom-0 left-0 transition-all duration-500 ${item.color}`}
                  style={{ 
                    width: `${percentage}%`,
                    height: `${barHeight}px`
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    return (
      <div className="relative" style={{ width: height, height: height }}>
        <svg width={height} height={height} className="transform -rotate-90">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;
            
            const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
            const y2 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            return (
              <path
                key={index}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                fill={item.color.replace('bg-', '').split('-')[0]}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        
        {/* Legend */}
        <div className="absolute -right-32 top-0 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-sm text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      default:
        return renderProgressChart();
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {renderChart()}
    </div>
  );
}
