import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { ArrowLeft, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useUI } from '../../context/UIContext';

interface RecycleBinProps { user: User; onBack: () => void; }

const RecycleBin: React.FC<RecycleBinProps> = ({ user, onBack }) => {
  const { showToast, confirm } = useUI();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeleted = async () => {
    setLoading(true);
    try {
        const collections = ['ledger_entries', 'transactions', 'parties', 'vehicles', 'inventory', 'expenses'];
        let allDeleted: any[] = [];
        
        for (const col of collections) {
            // Note: This requires your delete logic to set '_deleted: true' instead of hard deleting.
            // Since we implemented hard delete (deleteDoc) in previous steps, this might be empty initially.
            // This is a placeholder for future "Soft Delete" functionality.
            const q = query(collection(db, `users/${user.uid}/${col}`), where('_deleted', '==', true));
            const snap = await getDocs(q);
            snap.forEach(d => allDeleted.push({ id: d.id, ...d.data(), _col: col }));
        }
        setItems(allDeleted);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchDeleted(); }, [user]);

  const handleRestore = async (item: any) => {
      await updateDoc(doc(db, `users/${user.uid}/${item._col}`, item.id), { _deleted: false });
      setItems(prev => prev.filter(i => i.id !== item.id));
      showToast("Restored", "success");
  };

  const handlePermanentDelete = async (item: any) => {
      if(await confirm("Delete Forever?", "Cannot undo.")) {
          await deleteDoc(doc(db, `users/${user.uid}/${item._col}`, item.id));
          setItems(prev => prev.filter(i => i.id !== item.id));
          showToast("Deleted Permanently", "success");
      }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 pt-12 px-4">
        <div className="flex items-center gap-3 mb-6">
            <button onClick={onBack} className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm active:scale-95"><ArrowLeft size={20} className="dark:text-white"/></button>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Recycle Bin</h1>
        </div>
        
        {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-50">
                <Trash2 size={48} className="mb-2"/>
                <p>Bin is empty</p>
            </div>
        ) : (
            <div className="space-y-3">
                {items.map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl flex justify-between items-center shadow-sm">
                        <div>
                           <div className="font-bold dark:text-white">{item.name || item.party_name || 'Unknown Item'}</div>
                           <div className="text-xs text-slate-400 uppercase">{item._col}</div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleRestore(item)} className="p-2 bg-green-50 text-green-600 rounded-lg"><RefreshCw size={18}/></button>
                            <button onClick={() => handlePermanentDelete(item)} className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 size={18}/></button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};
export default RecycleBin;
