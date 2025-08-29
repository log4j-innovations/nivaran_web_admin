'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface SLAIndicatorProps {
  deadline: Date;
  targetHours: number;
  size?: 'sm' | 'md' | 'lg';
  showCountdown?: boolean;
}

export default function SLAIndicator({ 
  deadline, 
  targetHours, 
  size = 'md',
  showCountdown = true 
}: SLAIndicatorProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [slaStatus, setSlaStatus] = useState<'normal' | 'warning' | 'critical' | 'breached'>('normal');

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const remaining = deadline.getTime() - now.getTime();
      const hoursRemaining = remaining / (1000 * 60 * 60);
      
      setTimeRemaining(hoursRemaining);
      
      // Determine SLA status
      if (hoursRemaining < 0) {
        setSlaStatus('breached');
      } else if (hoursRemaining < 6) {
        setSlaStatus('critical');
      } else if (hoursRemaining < 24) {
        setSlaStatus('warning');
      } else {
        setSlaStatus('normal');
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [deadline]);

  const getStatusConfig = () => {
    switch (slaStatus) {
      case 'breached':
        return {
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: XCircle,
          text: 'SLA Breached',
          description: 'Deadline exceeded'
        };
      case 'critical':
        return {
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: AlertTriangle,
          text: 'Critical',
          description: 'Less than 6 hours'
        };
      case 'warning':
        return {
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: Clock,
          text: 'Warning',
          description: 'Less than 24 hours'
        };
      case 'normal':
        return {
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: CheckCircle,
          text: 'On Track',
          description: 'Within SLA'
        };
    }
  };

  const formatTimeRemaining = (hours: number) => {
    if (hours < 0) {
      const absHours = Math.abs(hours);
      if (absHours < 24) {
        return `${Math.floor(absHours)}h overdue`;
      } else {
        const days = Math.floor(absHours / 24);
        const remainingHours = Math.floor(absHours % 24);
        return `${days}d ${remainingHours}h overdue`;
      }
    } else if (hours < 24) {
      return `${Math.floor(hours)}h remaining`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.floor(hours % 24);
      return `${days}d ${remainingHours}h remaining`;
    }
  };

  const getProgressPercentage = () => {
    const totalTime = targetHours;
    const elapsed = totalTime - timeRemaining;
    return Math.max(0, Math.min(100, (elapsed / totalTime) * 100));
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
      text: 'text-xs'
    },
    md: {
      container: 'px-3 py-2 text-sm',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    lg: {
      container: 'px-4 py-3 text-base',
      icon: 'w-5 h-5',
      text: 'text-base'
    }
  };

  return (
    <div className={`inline-flex items-center space-x-2 ${sizeClasses[size].container} ${config.bg} ${config.border} border rounded-full ${config.color}`}>
      <Icon className={sizeClasses[size].icon} />
      
      <div className="flex flex-col">
        <span className={`font-medium ${sizeClasses[size].text}`}>
          {config.text}
        </span>
        
        {showCountdown && (
          <span className={`text-xs opacity-75 ${sizeClasses[size].text}`}>
            {formatTimeRemaining(timeRemaining)}
          </span>
        )}
      </div>

      {/* Progress Bar for larger sizes */}
      {size === 'lg' && (
        <div className="ml-2 w-16 bg-white/50 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              slaStatus === 'breached' ? 'bg-red-500' :
              slaStatus === 'critical' ? 'bg-orange-500' :
              slaStatus === 'warning' ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      )}
    </div>
  );
}
