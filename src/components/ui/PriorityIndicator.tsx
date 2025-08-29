import React from 'react';
import { Minus, Equal, ChevronUp, AlertCircle } from 'lucide-react';

type PriorityType = 'low' | 'medium' | 'high' | 'critical';

interface PriorityIndicatorProps {
  priority: PriorityType;
  variant?: 'badge' | 'icon' | 'full';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const priorityConfig = {
  low: {
    label: 'Low',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    iconColor: 'text-gray-600',
    icon: Minus,
    pulse: false,
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-600',
  },
  medium: {
    label: 'Medium',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    iconColor: 'text-yellow-600',
    icon: Equal,
    pulse: false,
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-600',
  },
  high: {
    label: 'High',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    iconColor: 'text-orange-600',
    icon: ChevronUp,
    pulse: true,
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-600',
  },
  critical: {
    label: 'Critical',
    color: 'bg-red-100 text-red-800 border-red-200',
    iconColor: 'text-red-600',
    icon: AlertCircle,
    pulse: true,
    bgClass: 'bg-red-100',
    textClass: 'text-red-600',
  },
};

const sizeConfig = {
  sm: {
    text: 'text-xs',
    padding: 'px-2 py-1',
    icon: 'w-3 h-3',
    iconOnly: 'w-6 h-6',
  },
  md: {
    text: 'text-sm',
    padding: 'px-3 py-1.5',
    icon: 'w-4 h-4',
    iconOnly: 'w-8 h-8',
  },
  lg: {
    text: 'text-base',
    padding: 'px-4 py-2',
    icon: 'w-5 h-5',
    iconOnly: 'w-10 h-10',
  },
};

export const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({
  priority,
  variant = 'badge',
  size = 'md',
  className = '',
}) => {
  const config = priorityConfig[priority];
  const sizeClasses = sizeConfig[size];
  const Icon = config.icon;

  const pulseClass = config.pulse ? 'animate-pulse' : '';

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full ${config.bgClass} ${sizeClasses.iconOnly} ${pulseClass} ${className}`}
        title={`${config.label} Priority`}
      >
        <Icon className={`${sizeClasses.icon} ${config.iconColor}`} />
      </div>
    );
  }

  // Badge variant
  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center space-x-1 font-medium border rounded-full transition-all duration-200 hover:scale-105 ${config.color} ${sizeClasses.text} ${sizeClasses.padding} ${pulseClass} ${className}`}
      >
        <Icon className={sizeClasses.icon} />
        <span>{config.label}</span>
      </span>
    );
  }

  // Full variant with icon and text
  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div
        className={`inline-flex items-center justify-center rounded-full ${config.bgClass} ${sizeClasses.iconOnly} ${pulseClass}`}
      >
        <Icon className={`${sizeClasses.icon} ${config.iconColor}`} />
      </div>
      <span className={`font-medium ${sizeClasses.text} ${config.textClass}`}>
        {config.label} Priority
      </span>
    </div>
  );
};
