import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4 text-amber-600">
            <div className="p-2 bg-amber-100 rounded-full"><AlertTriangle size={24} /></div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        </div>
        <p className="text-slate-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-md transition-colors">Confirm Action</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;