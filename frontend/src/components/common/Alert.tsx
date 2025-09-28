import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ type, message, className = '' }) => {
  const baseClasses = 'flex items-center p-4 rounded-lg border';
  
  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };
  
  const Icon = icons[type];
  const classes = `${baseClasses} ${typeClasses[type]} ${className}`;
  
  return (
    <div className={classes}>
      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default Alert;