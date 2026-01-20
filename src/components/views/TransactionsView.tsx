import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Search, Trash2, Edit2 } from 'lucide-react';
import { ApiService } from '../../services/api';
import { useUI } from '../../context/UIContext';
import Header from '../common/Header';

interface TransactionsViewProps { user: User; onAdd: () => void; onEdit: (item: any) => void; }

const TransactionsView: React.FC<TransactionsViewProps> = ({ user, onAdd, onEdit }) => {
  const { showToast, confirm } = useUI();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'received' | 'paid'>('all');

  useEffect(() => {
      const load = async () => {
          setLoading(true);
          try {
              const snap = await ApiService.getAll(user.uid, 'transactions');
              const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
              data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
              setTransactions(data);
          } catch (e) { console.error(e); } finally { setLoading(false); }
      };
      load();
  }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(await confirm("Delete?", "Cannot be undone.")) {
          await ApiService.delete(user.uid, 'transactions', id);
          setTransactions(p => p.filter(i => i.id !== id));
          showToast("Deleted", "success");
      }
  };

  const filtered = transactions.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (searchTerm && !t.party_name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 pb-20 px-4 pt-4 md:px-6 transition-colors">
       <Header title="Transactions" onAdd={onAdd} count={filtered.length} />
       <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-4 space-y-3">
           <div className="flex gap-2">
               <div className="flex-1 relative">
                   <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                   <input className="w-full pl-9 p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 dark:text-white outline-none" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
               </div>
               <select className="bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm font-bold outline-none" value={filterType} onChange={(e:any) => setFilterType(e.target.value)}>
                   <option value="all">All</option>
                   <option value="received">Received</option>
                   <option value="paid">Paid</option>
               </select>
           </div>
       </div>
       <div className="flex-1 overflow-y-auto space-y-3">
           {loading ? <div className="text-center py-10 text-slate-400">Loading...</div> : filtered.map(item => (
               <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center">
                   <div>
                       <div className="flex items-center gap-2 mb-1">
                           <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">{item.date}</span>
                           <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${item.type === 'received' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>{item.type === 'received' ? 'RECEIVED' : 'PAID'}</span>
                       </div>
                       <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.party_name}</div>
                   </div>
                   <div className="flex flex-col items-end gap-1">
                       <span className={`font-black text-lg ${item.type === 'received' ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>{item.type === 'received' ? '+' : '-'} ₹{item.amount?.toLocaleString()}</span><div className="flex gap-1"><button onClick={() => onEdit(item)} className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-lg"><Edit2 size={14}/></button>
                       <div className="flex gap-1">
                           <button onClick={() => onEdit(item)} className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-lg"><Edit2 size={14}/></button>
                           <button onClick={(e) => handleDelete(item.id, e)} className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg active:scale-95"><Trash2 size={14}/></button></div>
                       </div>
                   </div>
               </div>
           ))}
       </div>
    </div>
  );
};
export default TransactionsView;
