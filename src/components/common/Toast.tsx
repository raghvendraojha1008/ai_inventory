import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
  actionLabel?: string;     // New Prop
  onAction?: () => void;    // New Prop
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onClose, actionLabel, onAction }) => {
  useEffect(() => {
    // Longer timeout if there is an action button
    const duration = actionLabel ? 6000 : 3000;
    const timer = setTimeout(() => onClose(id), duration); 
    return () => clearTimeout(timer);
  }, [id, onClose, actionLabel]);

  const bg = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info
  }[type];

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border min-w-[300px] animate-in slide-in-from-top-2 fade-in duration-300 ${bg}`}>
      <Icon size={20} />
      <span className="flex-1 text-sm font-medium">{message}</span>
      
      {/* New Action Button */}
      {actionLabel && onAction && (
          <button 
            onClick={() => { onAction(); onClose(id); }}
            className="px-3 py-1 bg-white/50 hover:bg-white/80 rounded border border-transparent hover:border-black/10 text-xs font-bold uppercase transition-colors"
          >
            {actionLabel}
          </button>
      )}

      <button onClick={() => onClose(id)} className="opacity-70 hover:opacity-100"><X size={16} /></button>
    </div>
  );
};

export default Toast;