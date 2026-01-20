import React from 'react';
import { User } from 'firebase/auth';
import { ArrowLeft, TrendingUp } from 'lucide-react';

interface ReportsViewProps { 
    user: User; 
    onBack: () => void; // Added onBack prop
}

const ReportsView: React.FC<ReportsViewProps> = ({ user, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 pb-24 px-4 pt-4 md:px-6 transition-colors">
       <div className="flex items-center gap-3 mb-4">
           <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-700 dark:text-white">
               <ArrowLeft size={24}/>
           </button>
           <h1 className="text-2xl font-black text-slate-900 dark:text-white">Reports</h1>
       </div>
       <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
           <TrendingUp size={64} className="text-slate-300 dark:text-slate-700 mb-6"/>
           <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">Advanced Analytics</h3>
           <p className="text-sm text-slate-400 dark:text-slate-600 max-w-[240px] leading-relaxed">
               Detailed profit/loss graphs and exportable tax reports will be available in the next update.
           </p>
       </div>
    </div>
  );
};
export default ReportsView;
