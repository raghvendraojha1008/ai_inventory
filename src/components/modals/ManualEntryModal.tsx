import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { 
  X, Save, Plus, Trash2, Calendar, Truck, User as UserIcon, 
  Package, Hash, MapPin, Phone, FileText, IndianRupee, AlertOctagon,
  Percent, Tag, UserCheck, Briefcase, Wallet
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { Sanitizer } from '../../services/sanitizer'; 
import { AppSettings } from '../../types';
import { haptic } from '../../utils/haptics';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase'; 
import { useUI } from '../../context/UIContext'; 

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  user: User | null;
  initialData?: any;
  appSettings: AppSettings;
  onUpdateSettings?: (s: AppSettings) => void;
  onSuccess?: (data: any) => void;
}

const AutoComplete = ({ label, value, onChange, options, icon: Icon, placeholder = '' }: any) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<any>(null);
    const safeOptions = Array.isArray(options) ? options : [];
    const safeValue = Sanitizer.asString(value);

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setShowSuggestions(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = safeOptions.filter((opt: string) => 
        Sanitizer.asString(opt).toLowerCase().includes(safeValue.toLowerCase())
    );

    return (
        <div className="mb-3 relative" ref={wrapperRef}>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">{Icon && <Icon size={12}/>} {label}</label>
            <input className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                value={safeValue} 
                onChange={(e) => { onChange(e.target.value); setShowSuggestions(true); }} 
                onFocus={() => setShowSuggestions(true)} 
                placeholder={placeholder} 
            />
            {showSuggestions && filtered.length > 0 && (
                <div className="absolute z-50 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {filtered.map((opt: string, i: number) => (
                        <div key={i} className="p-2 text-sm hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-200" onClick={() => { onChange(opt); setShowSuggestions(false); }}>{opt}</div>
                    ))}
                </div>
            )}
        </div>
    );
};

const InputField = ({ label, field, type='text', icon: Icon, placeholder, value, onChange, disabled }: any) => (
    <div className="mb-3">
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">{Icon && <Icon size={12}/>} {label}</label>
        <input className={`w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 ${disabled ? 'bg-slate-100 dark:bg-slate-900 text-slate-400' : 'bg-slate-50 dark:bg-slate-800 dark:text-white'}`}
            type={type} 
            value={Sanitizer.asString(value)} 
            onChange={e => onChange(field, e.target.value)} 
            placeholder={placeholder} 
            disabled={disabled} 
        />
    </div>
);

const ManualEntryModal: React.FC<ManualEntryModalProps> = ({ isOpen, onClose, type, user, initialData, appSettings, onSuccess, onUpdateSettings }) => {
  const { showToast } = useUI();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [items, setItems] = useState<any[]>([{ item_name: '', quantity: '', rate: '', unit: 'Pcs', total: 0, hsn_code: '', gst_percent: 0 }]);
  
  // Lists
  const [customers, setCustomers] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [fullInventory, setFullInventory] = useState<any[]>([]); 
  const [itemList, setItemList] = useState<string[]>([]);
  
  const expenseTypes = appSettings.custom_lists?.expense_types || [];
  const paymentModes = appSettings.custom_lists?.payment_modes || [];
  const receivedByList = appSettings.custom_lists?.received_by_names || [];
  const paidByList = appSettings.custom_lists?.paid_by_names || [];
  const purposes = appSettings.custom_lists?.purposes || [];

  const visibility = appSettings.field_visibility || {};
  const [creditAlert, setCreditAlert] = useState<string>('');
  const isEditMode = !!initialData?.id;

  useEffect(() => {
    if (isOpen && user) {
        const fetchData = async () => {
            try {
                const [pSnap, vSnap, iSnap] = await Promise.all([
                    ApiService.getAll(user.uid, 'parties'),
                    ApiService.getAll(user.uid, 'vehicles'),
                    ApiService.getAll(user.uid, 'inventory')
                ]);
                const pData = pSnap.docs.map(d => d.data());
                setCustomers(Sanitizer.cleanList(pData.filter((p: any) => p.role === 'customer').map((p: any) => p.name)));
                setSuppliers(Sanitizer.cleanList(pData.filter((p: any) => p.role === 'supplier').map((p: any) => p.name)));
                setVehicles(Sanitizer.cleanList(vSnap.docs.map(d => d.data().vehicle_number)));
                
                const iData = iSnap.docs.map(d => d.data());
                setFullInventory(iData);
                setItemList(Sanitizer.cleanList(iData.map((d: any) => d.name)));
            } catch (e) { console.error(e); }
        };
        fetchData();

        if (initialData) {
            setFormData({ ...initialData });
            if (initialData.items) setItems(initialData.items);
        } else {
            const defaults: any = { date: new Date().toISOString().split('T')[0] };
            if (type === 'sales') { defaults.payment_mode = 'Credit'; defaults.payment_received_by = 'Owner'; }
            if (type === 'purchases') { defaults.paid_by = 'Owner'; }
            if (type === 'transactions') { defaults.type = 'received'; defaults.payment_mode = 'Cash'; }
            if (type === 'inventory') { defaults.gst_percent = 18; defaults.price_type = 'exclusive'; }
            setFormData(defaults);
        }
    }
  }, [isOpen, initialData, type, user]);

  const handleChange = (field: string, value: any) => setFormData((prev: any) => ({ ...prev, [field]: value }));
  
  const handleItemChange = (index: number, field: string, value: any) => {
      const newItems = [...items];
      newItems[index][field] = value;
      if (field === 'item_name') {
          const matchedItem = fullInventory.find(i => i.name === value);
          if (matchedItem) {
              newItems[index].hsn_code = matchedItem.hsn_code || '';
              newItems[index].gst_percent = matchedItem.gst_percent || 0;
              newItems[index].unit = matchedItem.unit || 'Pcs';
              if (type === 'sales' && matchedItem.sale_rate) newItems[index].rate = matchedItem.sale_rate;
              if (type === 'purchases' && matchedItem.purchase_rate) newItems[index].rate = matchedItem.purchase_rate;
          }
      }
      if (field === 'quantity' || field === 'rate') {
          newItems[index].total = (Number(newItems[index].quantity)||0) * (Number(newItems[index].rate)||0);
      }
      setItems(newItems);
  };
  
  const calculateGrandTotal = () => items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      setLoading(true);
      haptic.medium();
      try {
          const payload = { ...formData };
          let targetCollection = '';
          
          if (type === 'sales' || type === 'purchases') {
              targetCollection = 'ledger_entries';
              payload.type = type === 'sales' ? 'sell' : 'purchase';
              payload.items = items;
              payload.total_amount = calculateGrandTotal();
          } 
          else if (type === 'transactions') targetCollection = 'transactions';
          else if (type === 'inventory') targetCollection = 'inventory';
          else if (type === 'expenses') targetCollection = 'expenses';

          if (!targetCollection) return;

          if (initialData?.id) await ApiService.update(user.uid, targetCollection, initialData.id, payload);
          else { payload.created_at = new Date().toISOString(); await ApiService.add(user.uid, targetCollection, payload); }
          
          if (onSuccess) onSuccess(payload);
          onClose();
          haptic.success();
      } catch (e) { console.error(e); showToast("Error saving record.", "error"); haptic.error(); } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 w-full sm:w-[600px] rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl safe-area-bottom border border-slate-100 dark:border-slate-800">
            <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 rounded-t-3xl">
                <h2 className="font-bold text-lg capitalize flex items-center gap-2 dark:text-white">{initialData ? 'Edit' : 'New'} {type.replace('_', ' ')}</h2>
                <button onClick={onClose} className="p-2 bg-white dark:bg-slate-800 rounded-full border dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-white"><X size={18}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <form id="entry-form" onSubmit={handleSubmit}>
                    {/* TRANSACTIONS */}
                    {type === 'transactions' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Type</label>
                                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                        <button type="button" onClick={() => handleChange('type', 'received')} className={`flex-1 py-2 rounded-md text-sm font-bold ${formData.type === 'received' ? 'bg-white dark:bg-slate-700 shadow text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>Received</button>
                                        <button type="button" onClick={() => handleChange('type', 'paid')} className={`flex-1 py-2 rounded-md text-sm font-bold ${formData.type === 'paid' ? 'bg-white dark:bg-slate-700 shadow text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>Paid</button>
                                    </div>
                                </div>
                                <InputField label="Date" field="date" type="date" icon={Calendar} value={formData.date} onChange={handleChange} />
                            </div>
                            <AutoComplete label={formData.type === 'received' ? "Customer Name" : "Supplier Name"} value={formData.party_name || ''} onChange={(v: string) => handleChange('party_name', v)} options={formData.type === 'received' ? customers : suppliers} icon={UserIcon} />
                            <InputField label="Amount" field="amount" type="number" icon={IndianRupee} value={formData.amount} onChange={handleChange} />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="mb-3">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Payment Mode</label>
                                    <select className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-sm" value={formData.payment_mode || ''} onChange={e => handleChange('payment_mode', e.target.value)}>{paymentModes.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                </div>
                                {formData.type === 'received' ? (visibility.transactions?.received_by && <InputField label="Received By" field="received_by" value={formData.received_by} onChange={handleChange} />) : (visibility.transactions?.paid_by && <InputField label="Paid By" field="paid_by" value={formData.paid_by} onChange={handleChange} />)}
                            </div>
                            {visibility.transactions?.notes && <InputField label="Notes" field="notes" value={formData.notes} onChange={handleChange} />}
                        </>
                    )}

                    {/* SALES / PURCHASES */}
                    {(type === 'sales' || type === 'purchases') && (
                        <>
                           <div className="grid grid-cols-3 gap-3">
                               <div className="col-span-1"><InputField label="Date" field="date" type="date" icon={Calendar} value={formData.date} onChange={handleChange} /></div>
                               <div className="col-span-2">{visibility.ledger?.invoice_no && <InputField label="Invoice No" field="invoice_no" icon={Hash} value={formData.invoice_no} onChange={handleChange} />}</div>
                           </div>
                           <AutoComplete label={type === 'sales' ? "Customer" : "Supplier"} value={formData.party_name || ''} onChange={(v: string) => handleChange('party_name', v)} options={type === 'sales' ? customers : suppliers} icon={UserIcon} />
                           
                           <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                               <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">Items</label>
                               {items.map((item, idx) => (
                                   <div key={idx} className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700 last:border-0 last:pb-0">
                                       <div className="flex gap-2 mb-2">
                                           <div className="flex-[2]"><AutoComplete label="" value={item.item_name} onChange={(v: string) => handleItemChange(idx, 'item_name', v)} options={itemList} placeholder="Item Name" /></div>
                                           <input className="w-16 p-2 text-sm border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded h-[42px]" placeholder="Unit" value={item.unit} onChange={e => handleItemChange(idx, 'unit', e.target.value)} />
                                       </div>
                                       <div className="flex gap-2 items-center">
                                           <input className="flex-1 p-2 text-sm border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded min-w-[60px]" type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} />
                                           <span className="text-slate-400">x</span>
                                           <input className="flex-1 p-2 text-sm border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded min-w-[60px]" type="number" placeholder="Rate" value={item.rate} onChange={e => handleItemChange(idx, 'rate', e.target.value)} />
                                           <div className="flex-1 font-bold text-right text-sm dark:text-white">₹{item.total}</div>
                                           <button type="button" onClick={() => { if(items.length>1) setItems(items.filter((_, i) => i !== idx)) }} className="p-2 text-red-500"><Trash2 size={16}/></button>
                                       </div>
                                   </div>
                               ))}
                               <button type="button" onClick={() => setItems([...items, { item_name: '', quantity: '', rate: '', unit: 'Pcs', total: 0 }])} className="w-full py-2 bg-white dark:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-300 flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-slate-600"><Plus size={14}/> Add Item</button>
                           </div>
                           {visibility.ledger?.notes && <InputField label="Notes" field="notes" value={formData.notes} onChange={handleChange} />}
                        </>
                    )}

                    {/* INVENTORY */}
                    {type === 'inventory' && (
                        <>
                             <InputField label="Item Name" field="name" icon={Package} value={formData.name} onChange={handleChange} />
                             <div className="grid grid-cols-2 gap-3"><InputField label="Unit" field="unit" placeholder="Pcs/Kg" value={formData.unit} onChange={handleChange} />{visibility.inventory?.hsn_code && <InputField label="HSN Code" field="hsn_code" icon={Hash} value={formData.hsn_code} onChange={handleChange} />}</div>
                             <div className="grid grid-cols-2 gap-3"><InputField label="Sell Rate" field="sale_rate" type="number" icon={IndianRupee} value={formData.sale_rate} onChange={handleChange} /><InputField label="Purchase Rate" field="purchase_rate" type="number" icon={IndianRupee} value={formData.purchase_rate} onChange={handleChange} /></div>
                             <InputField label="Current Stock" field="current_stock" type="number" value={formData.current_stock} onChange={handleChange} />
                        </>
                    )}

                    {/* EXPENSES */}
                    {type === 'expenses' && (
                        <>
                            <InputField label="Date" field="date" type="date" value={formData.date} onChange={handleChange} />
                            <div className="mb-3"><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Category</label><select className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white border dark:border-slate-700 p-2.5 rounded-lg text-sm" value={formData.category || ''} onChange={e => handleChange('category', e.target.value)}>{expenseTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                            <InputField label="Amount" field="amount" type="number" icon={IndianRupee} value={formData.amount} onChange={handleChange} />
                            <InputField label="Note" field="notes" value={formData.notes} onChange={handleChange} />
                        </>
                    )}
                </form>
            </div>

            <div className="p-4 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-b-2xl pb-8 md:pb-4">
                <button type="submit" form="entry-form" disabled={loading} className="w-full bg-slate-900 dark:bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                    {loading ? 'Saving...' : <><Save size={20}/> Save Record</>}
                </button>
            </div>
        </div>
    </div>
  );
};
export default ManualEntryModal;
