import React, { memo } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'gray';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  style?: React.CSSProperties;
}

const colorVariants = {
  blue: {
    iconBg: 'bg-blue-100',
    text: 'text-blue-600',
    valueColor: 'text-blue-600',
  },
  green: {
    iconBg: 'bg-green-100',
    text: 'text-green-600',
    valueColor: 'text-green-600',
  },
  red: {
    iconBg: 'bg-red-100',
    text: 'text-red-600',
    valueColor: 'text-red-600',
  },
  yellow: {
    iconBg: 'bg-yellow-100',
    text: 'text-yellow-600',
    valueColor: 'text-yellow-600',
  },
  gray: {
    iconBg: 'bg-gray-100',
    text: 'text-gray-600',
    valueColor: 'text-gray-600',
  },
};

const StatsCardComponent: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  className = '',
  style,
}) => {
  const colors = colorVariants[color];

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-6 ${className}`}
      style={style}
    >
      {/* Header with title and icon */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">
          {title}
        </h3>
        <div className={`w-8 h-8 ${colors.iconBg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
      </div>

      {/* Value and trend */}
      <div className="mb-2">
        <div className="flex items-center space-x-2">
          <span className={`text-3xl font-bold ${colors.valueColor}`}>
            {value}
          </span>
          {trend && (
            <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              +{trend.value}%
            </span>
          )}
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-sm text-gray-500 mb-2">
        {subtitle}
      </p>

      {/* Trend info */}
      {trend && (
        <div className="flex items-center text-xs text-gray-400">
          <span>vs last month</span>
          <div className={`ml-2 w-2 h-2 rounded-full ${trend.isPositive ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const StatsCard = memo(StatsCardComponent);
