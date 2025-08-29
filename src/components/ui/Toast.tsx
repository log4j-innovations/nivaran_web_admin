import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}



const toastConfig = {
  success: {
    icon: CheckCircle,
    color: 'bg-green-50 border-green-200 text-green-800',
    iconColor: 'text-green-600',
    progressColor: 'bg-green-500',
  },
  error: {
    icon: XCircle,
    color: 'bg-red-50 border-red-200 text-red-800',
    iconColor: 'text-red-600',
    progressColor: 'bg-red-500',
  },
  warning: {
    icon: AlertCircle,
    color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconColor: 'text-yellow-600',
    progressColor: 'bg-yellow-500',
  },
  info: {
    icon: Info,
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    iconColor: 'text-blue-600',
    progressColor: 'bg-blue-500',
  },
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(false);

  const config = toastConfig[type];
  const Icon = config.icon;

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  }, [id, onClose]);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration <= 0) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          handleClose();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, handleClose]);

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out mb-4
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className={`relative overflow-hidden rounded-xl border shadow-lg ${config.color} p-4 min-w-80 max-w-md`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold">{title}</h4>
            {message && (
              <p className="text-sm opacity-90 mt-1">{message}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
            <div
              className={`h-full transition-all duration-100 linear ${config.progressColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Toast Container Component
export const ToastContainer: React.FC<{ toasts: (ToastProps & { id: string })[] }> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
};
