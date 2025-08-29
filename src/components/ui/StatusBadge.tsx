import React from 'react';
import { CheckCircle, Clock, AlertTriangle, XCircle, Zap } from 'lucide-react';

type StatusType = 'pending' | 'in_progress' | 'resolved' | 'escalated' | 'closed';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    dotColor: 'bg-yellow-500',
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: Zap,
    dotColor: 'bg-blue-500',
  },
  resolved: {
    label: 'Resolved',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    dotColor: 'bg-green-500',
  },
  escalated: {
    label: 'Escalated',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertTriangle,
    dotColor: 'bg-red-500',
  },
  closed: {
    label: 'Closed',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: XCircle,
    dotColor: 'bg-gray-500',
  },
};

const sizeConfig = {
  sm: {
    text: 'text-xs',
    padding: 'px-2 py-1',
    icon: 'w-3 h-3',
    dot: 'w-1.5 h-1.5',
  },
  md: {
    text: 'text-sm',
    padding: 'px-3 py-1.5',
    icon: 'w-4 h-4',
    dot: 'w-2 h-2',
  },
  lg: {
    text: 'text-base',
    padding: 'px-4 py-2',
    icon: 'w-5 h-5',
    dot: 'w-2.5 h-2.5',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const config = statusConfig[status];
  const sizeClasses = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center space-x-1.5 font-medium border rounded-full transition-all duration-200 hover:scale-105 ${config.color} ${sizeClasses.text} ${sizeClasses.padding} ${className}`}
    >
      {showIcon && (
        <Icon className={sizeClasses.icon} />
      )}
      <span>{config.label}</span>
      <div className={`${config.dotColor} ${sizeClasses.dot} rounded-full`}></div>
    </span>
  );
};
