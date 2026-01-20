import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Search, Trash2, Edit2 } from 'lucide-react'; // Added Edit2
import { ApiService } from '../../services/api';
import { useUI } from '../../context/UIContext';
import { AppSettings } from '../../types';
import Header from '../common/Header';

interface ExpensesViewProps { 
    user: User; 
    onEdit: (i: any) => void; 
    appSettings: AppSettings; 
}

const ExpensesView: React.FC<ExpensesViewProps> = ({ user, onEdit, appSettings }) => {
  const { confirm, showToast } = useUI();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
      const load = async () => {
          setLoading(true);
          try {
              const snap = await ApiService.getAll(user.uid, 'expenses');
              const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
              data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
              setExpenses(data);
          } catch(e) { console.error(e); } finally { setLoading(false); }
      };
      load();
  }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(await confirm("Delete?", "Undone.")) {
          await ApiService.delete(user.uid, 'expenses', id);
          setExpenses(p => p.filter(e => e.id !== id));
          showToast("Deleted", "success");
      }
  };

  const filtered = expenses.filter(e => 
      searchTerm ? e.category?.toLowerCase().includes(searchTerm) || e.notes?.toLowerCase().includes(searchTerm) : true
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 pb-20 px-4 pt-4 md:px-6 transition-colors">
       <Header title="Expenses" onAdd={() => onEdit(null)} count={filtered.length} />
       <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-4">
           <div className="relative">
               <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
               <input className="w-full pl-9 p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 dark:text-white outline-none" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
           </div>
       </div>
       <div className="flex-1 overflow-y-auto space-y-3">
           {loading ? <div className="text-center py-10 text-slate-400">Loading...</div> : filtered.map(item => (
               <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center">
                   <div>
                       <div className="flex items-center gap-2 mb-1">
                           <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">{item.date}</span>
                           <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">{item.category}</span>
                       </div>
                       <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.notes || 'No desc'}</div>
                   </div>
                   <div className="flex flex-col items-end gap-1">
                       <span className="font-bold text-slate-900 dark:text-white text-lg">₹{item.amount}</span>
                       <div className="flex gap-1">
                           <button onClick={() => onEdit(item)} className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-lg"><Edit2 size={14}/></button>
                           <button onClick={(e) => handleDelete(item.id, e)} className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg"><Trash2 size={14}/></button>
                       </div>
                   </div>
               </div>
           ))}
       </div>
    </div>
  );
};
export default ExpensesView;
