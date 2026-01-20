import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Search, Phone, MapPin, Trash2, Briefcase, User as UserIcon, X, Save, Edit2 } from 'lucide-react';
import { ApiService } from '../../services/api';
import { useUI } from '../../context/UIContext';
import PartyDetailView from './PartyDetailView';
import Header from '../common/Header';

interface PartiesViewProps { user: User; }

const PartiesView: React.FC<PartiesViewProps> = ({ user }) => {
  const { showToast, confirm } = useUI();
  const [parties, setParties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'supplier'>('all');
  const [selectedParty, setSelectedParty] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({ name: '', contact: '', address: '', role: 'customer' });

  const fetchParties = async () => {
      setLoading(true);
      try {
          const snap = await ApiService.getAll(user.uid, 'parties');
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setParties(data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchParties(); }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(await confirm("Delete Party?", "This will remove all history.")) {
          await ApiService.delete(user.uid, 'parties', id);
          setParties(prev => prev.filter(p => p.id !== id));
          showToast("Party Deleted", "success");
      }
  };

  const handleEdit = (party: any, e: React.MouseEvent) => {
      e.stopPropagation();
      setFormData({ ...party });
      setShowModal(true);
  };

  const handleSave = async () => {
      if (!formData.name) return showToast("Name is required", "error");
      try {
          if (formData.id) {
              // UPDATE
              await ApiService.update(user.uid, 'parties', formData.id, formData);
              showToast("Party Updated", "success");
          } else {
              // CREATE
              await ApiService.add(user.uid, 'parties', { ...formData, created_at: new Date().toISOString() });
              showToast("Party Added", "success");
          }
          setShowModal(false);
          setFormData({ name: '', contact: '', address: '', role: 'customer' });
          fetchParties();
      } catch (e) { showToast("Failed to save", "error"); }
  };

  const filtered = parties.filter(p => {
      if (roleFilter !== 'all' && p.role !== roleFilter) return false;
      if (searchTerm && !p.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
  });

  if (selectedParty) return <PartyDetailView party={selectedParty} user={user} onBack={() => setSelectedParty(null)} />;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 pb-20 px-4 pt-4 md:px-6 transition-colors">
       <Header title="Parties" onAdd={() => { setFormData({ name: '', contact: '', address: '', role: 'customer' }); setShowModal(true); }} count={filtered.length} />

       <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-4 space-y-3">
           <div className="flex gap-2">
               <div className="flex-1 relative">
                   <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                   <input className="w-full pl-9 p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 dark:text-white outline-none" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
               </div>
               <select className="bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm font-bold outline-none" value={roleFilter} onChange={(e:any) => setRoleFilter(e.target.value)}>
                   <option value="all">All</option>
                   <option value="customer">Customers</option>
                   <option value="supplier">Suppliers</option>
               </select>
           </div>
       </div>

       <div className="flex-1 overflow-y-auto space-y-3">
           {loading ? <div className="text-center py-10 text-slate-400">Loading...</div> : filtered.map(item => (
               <div key={item.id} onClick={() => setSelectedParty(item)} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center active:scale-95 transition-transform">
                   <div>
                       <div className="flex items-center gap-2 mb-1">
                           <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1 ${item.role === 'customer' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'}`}>
                               {item.role === 'customer' ? <UserIcon size={10}/> : <Briefcase size={10}/>} {item.role}
                           </span>
                       </div>
                       <div className="font-bold text-slate-800 dark:text-white text-base">{item.name}</div>
                       <div className="text-xs text-slate-400 mt-1 flex flex-col gap-0.5">
                           {item.contact && <span className="flex items-center gap-1"><Phone size={10}/> {item.contact}</span>}
                           {item.address && <span className="flex items-center gap-1"><MapPin size={10}/> {item.address}</span>}
                       </div>
                   </div>
                   <div className="flex flex-col items-end gap-1">
                       <div className="flex gap-1">
                           <button onClick={(e) => handleEdit(item, e)} className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-lg"><Edit2 size={16}/></button>
                           <button onClick={(e) => handleDelete(item.id, e)} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg"><Trash2 size={16}/></button>
                       </div>
                   </div>
               </div>
           ))}
       </div>

       {showModal && (
           <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
               <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-4 shadow-2xl border border-slate-100 dark:border-slate-800">
                   <div className="flex justify-between items-center mb-4">
                       <h3 className="font-bold text-lg dark:text-white">{formData.id ? 'Edit' : 'Add'} Party</h3>
                       <button onClick={() => setShowModal(false)}><X className="dark:text-white" size={20}/></button>
                   </div>
                   <div className="space-y-3">
                       <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                       <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold" placeholder="Phone" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
                       <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold" placeholder="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                       <select className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                           <option value="customer">Customer</option>
                           <option value="supplier">Supplier</option>
                       </select>
                       <button onClick={handleSave} className="w-full bg-slate-900 dark:bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-2"><Save size={18}/> Save Party</button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};
export default PartiesView;
