import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Search, Truck, Trash2, User as UserIcon, X, Save, Edit2 } from 'lucide-react';
import { ApiService } from '../../services/api';
import { useUI } from '../../context/UIContext';
import Header from '../common/Header';

interface VehiclesViewProps { user: User; }

const VehiclesView: React.FC<VehiclesViewProps> = ({ user }) => {
  const { showToast, confirm } = useUI();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({ vehicle_number: '', owner_name: '', driver_name: '' });

  const fetchVehicles = async () => {
      setLoading(true);
      try {
          const snap = await ApiService.getAll(user.uid, 'vehicles');
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setVehicles(data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchVehicles(); }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(await confirm("Delete Vehicle?", "This cannot be undone.")) {
          await ApiService.delete(user.uid, 'vehicles', id);
          setVehicles(prev => prev.filter(v => v.id !== id));
          showToast("Vehicle Deleted", "success");
      }
  };

  const handleEdit = (vehicle: any) => {
      setFormData({ ...vehicle });
      setShowModal(true);
  };

  const handleSave = async () => {
      if (!formData.vehicle_number) return showToast("Vehicle Number is required", "error");
      try {
          if (formData.id) {
              // UPDATE
              await ApiService.update(user.uid, 'vehicles', formData.id, formData);
              showToast("Vehicle Updated", "success");
          } else {
              // CREATE
              await ApiService.add(user.uid, 'vehicles', { ...formData, created_at: new Date().toISOString() });
              showToast("Vehicle Added", "success");
          }
          setShowModal(false);
          setFormData({ vehicle_number: '', owner_name: '', driver_name: '' });
          fetchVehicles();
      } catch (e) { showToast("Failed to save", "error"); }
  };

  const filtered = vehicles.filter(v => 
      searchTerm ? v.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 pb-20 px-4 pt-4 md:px-6 transition-colors">
       <Header title="Vehicles" onAdd={() => { setFormData({ vehicle_number: '', owner_name: '', driver_name: '' }); setShowModal(true); }} count={filtered.length} />

       <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-4">
           <div className="relative">
               <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
               <input className="w-full pl-9 p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 dark:text-white outline-none" placeholder="Search Number..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
           </div>
       </div>

       <div className="flex-1 overflow-y-auto space-y-3">
           {loading ? <div className="text-center py-10 text-slate-400">Loading...</div> : filtered.map(item => (
               <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center">
                   <div>
                       <div className="flex items-center gap-2 mb-1">
                           <span className="text-xs font-bold text-slate-700 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1"><Truck size={12}/> {item.vehicle_number}</span>
                       </div>
                       <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-col gap-0.5">
                           {item.owner_name && <span className="flex items-center gap-1"><UserIcon size={10}/> Owner: {item.owner_name}</span>}
                           {item.driver_name && <span className="flex items-center gap-1"><UserIcon size={10}/> Driver: {item.driver_name}</span>}
                       </div>
                   </div>
                   <div className="flex gap-1">
                       <button onClick={() => handleEdit(item)} className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-lg"><Edit2 size={16}/></button>
                       <button onClick={(e) => handleDelete(item.id, e)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-full"><Trash2 size={16}/></button>
                   </div>
               </div>
           ))}
       </div>

       {showModal && (
           <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
               <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-4 shadow-2xl border border-slate-100 dark:border-slate-800">
                   <div className="flex justify-between items-center mb-4">
                       <h3 className="font-bold text-lg dark:text-white">{formData.id ? 'Edit' : 'Add'} Vehicle</h3>
                       <button onClick={() => setShowModal(false)}><X className="dark:text-white" size={20}/></button>
                   </div>
                   <div className="space-y-3">
                       <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold" placeholder="Vehicle Number (e.g. UP70...)" value={formData.vehicle_number} onChange={e => setFormData({...formData, vehicle_number: e.target.value})} />
                       <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold" placeholder="Owner Name" value={formData.owner_name} onChange={e => setFormData({...formData, owner_name: e.target.value})} />
                       <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold" placeholder="Driver Name" value={formData.driver_name} onChange={e => setFormData({...formData, driver_name: e.target.value})} />
                       <button onClick={handleSave} className="w-full bg-slate-900 dark:bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-2"><Save size={18}/> Save Vehicle</button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};
export default VehiclesView;
