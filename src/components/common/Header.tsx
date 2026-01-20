import React from 'react';
import { Plus } from 'lucide-react';

interface HeaderProps {
  title: string;
  onAdd: () => void;
  count?: number;
}

const Header: React.FC<HeaderProps> = ({ title, onAdd, count }) => {
  return (
    <div className="flex justify-between items-center mb-4 pt-2">
        <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
            {count !== undefined && (
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">
                    {count} Records
                </p>
            )}
        </div>
        <button 
            onClick={onAdd} 
            className="w-12 h-12 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-300/50 dark:shadow-none active:scale-90 transition-all"
        >
            <Plus size={24} strokeWidth={3} />
        </button>
    </div>
  );
};
export default Header;
