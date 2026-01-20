import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, actionLabel, onAction }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center fade-in">
        <div className="bg-slate-100 p-6 rounded-full mb-4 shadow-inner">
            <Icon size={32} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-1">{title}</h3>
        <p className="text-sm text-slate-400 max-w-xs mx-auto mb-6 leading-relaxed">{description}</p>
        {actionLabel && onAction && (
            <button 
                onClick={onAction} 
                className="text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors active:scale-95"
            >
                {actionLabel}
            </button>
        )}
    </div>
);

export default EmptyState;