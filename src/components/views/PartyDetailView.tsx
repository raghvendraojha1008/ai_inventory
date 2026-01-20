import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  ArrowLeft, FileText, Phone, MapPin, 
  ShoppingBag, Banknote, List, Filter, X, Truck, 
  PieChart
} from 'lucide-react';
import { ExportService } from '../../services/export';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useUI } from '../../context/UIContext';

interface PartyDetailProps {
  party: any;
  user: User;
  onBack: () => void;
}

const PartyDetailView: React.FC<PartyDetailProps> = ({ party, user, onBack }) => {
  const { showToast } = useUI();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'details' | 'all' | 'orders' | 'payments'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [itemFilter, setItemFilter] = useState('');     
  const [sendToFilter, setSendToFilter] = useState(''); 

  const isSupplier = party.role === 'supplier';

  useEffect(() => {
    const loadHistory = async () => {
        setLoading(true);
        try {
            const q1 = query(collection(db, `users/${user.uid}/ledger_entries`), where('party_name', '==', party.name));
            const q2 = query(collection(db, `users/${user.uid}/transactions`), where('party_name', '==', party.name));
            const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
            
            const list = [
                ...snap1.docs.map(d => ({ ...d.data(), id: d.id, _type: 'invoice' })),
                ...snap2.docs.map(d => ({ ...d.data(), id: d.id, _type: 'payment' }))
            ];
            list.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setHistory(list);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    loadHistory();
  }, [party]);

  const dateFilteredData = useMemo(() => {
      return history.filter(h => {
          if (dateFrom && h.date < dateFrom) return false;
          if (dateTo && h.date > dateTo) return false;
          return true;
      });
  }, [history, dateFrom, dateTo]);

  const detailsStats = useMemo(() => {
      let totalBusiness = 0;
      let totalPayment = 0;
      const itemMap: Record<string, { qty: number, amount: number, unit: string }> = {};

      dateFilteredData.forEach(h => {
          if (h._type === 'invoice') {
              totalBusiness += (Number(h.total_amount) || 0);
              if (h.items) {
                  h.items.forEach((i: any) => {
                      const key = i.item_name;
                      if (!itemMap[key]) itemMap[key] = { qty: 0, amount: 0, unit: i.unit };
                      itemMap[key].qty += (Number(i.quantity) || 0);
                      itemMap[key].amount += (Number(i.total) || 0);
                  });
              }
          } else {
              totalPayment += (Number(h.amount) || 0);
          }
      });

      const itemBreakdown = Object.entries(itemMap)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.amount - a.amount);

      return { totalBusiness, totalPayment, itemBreakdown };
  }, [dateFilteredData]);

  const listViewData = useMemo(() => {
      return dateFilteredData.filter(h => {
          if (viewMode === 'orders' && h._type !== 'invoice') return false;
          if (viewMode === 'payments' && h._type !== 'payment') return false;
          
          if (!isSupplier && itemFilter) {
              if (h._type === 'payment') return false;
              const hasItem = h.items?.some((i: any) => i.item_name === itemFilter);
              if (!hasItem) return false;
          }
          if (isSupplier && sendToFilter) {
              if (h._type === 'payment') return false;
              if (h.send_to !== sendToFilter) return false;
          }
          return true;
      });
  }, [dateFilteredData, viewMode, itemFilter, sendToFilter, isSupplier]);

  const { partyItems, sendToCustomers } = useMemo(() => {
      const items = new Set<string>();
      const customers = new Set<string>();
      history.forEach(h => {
          if (h._type === 'invoice') {
              if (h.items) h.items.forEach((i: any) => items.add(i.item_name));
              if (h.send_to) customers.add(h.send_to);
          }
      });
      return { partyItems: Array.from(items).sort(), sendToCustomers: Array.from(customers).sort() };
  }, [history]);

  const handleDownload = async () => {
      if (listViewData.length === 0 && viewMode !== 'details') return showToast("No data to export", "error");
      const doc = new jsPDF();
      doc.setFontSize(18); doc.text(party.name, 14, 15);
      doc.setFontSize(10); doc.text(`Period: ${dateFrom || 'Start'} to ${dateTo || 'Present'}`, 14, 22);

      if (viewMode === 'details') {
          doc.text("SUMMARY REPORT", 14, 30);
          doc.text(`Total ${isSupplier ? 'Purchased' : 'Sold'}: ${detailsStats.totalBusiness}`, 14, 36);
          doc.text(`Total ${isSupplier ? 'Paid' : 'Received'}: ${detailsStats.totalPayment}`, 14, 42);
          const rows = detailsStats.itemBreakdown.map(i => [i.name, `${i.qty} ${i.unit}`, i.amount.toLocaleString()]);
          (doc as any).autoTable({ startY: 50, head: [['Item', 'Total Qty', 'Total Amount']], body: rows });
      } else {
          const rows = listViewData.map(h => [
              h.date, h._type === 'invoice' ? 'Order' : 'Payment',
              h._type === 'invoice' ? (h.items?.map((i:any) => i.item_name).join(', ') || 'Items') : (h.payment_mode || 'Cash'),
              h.total_amount || h.amount
          ]);
          (doc as any).autoTable({ startY: 30, head: [['Date', 'Type', 'Details', 'Amount']], body: rows });
      }
      const base64 = doc.output('datauristring').split(',')[1];
      await ExportService.saveAndOpenFile(base64, `Statement_${party.name}.pdf`, 'application/pdf');
  };

  const QuickFilterBtn = ({ mode, label, icon: Icon }: any) => (
      <button 
          onClick={() => setViewMode(mode)}
          className={`flex-1 p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${viewMode === mode ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 shadow-md' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'}`}
      >
          <Icon size={18} />
          <span className="text-xs font-bold">{label}</span>
      </button>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors">
        {/* HEADER */}
        <div className="bg-white dark:bg-slate-900 p-4 border-b dark:border-slate-800 flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white"><ArrowLeft size={20}/></button>
                <div>
                    <h2 className="font-bold text-lg leading-none dark:text-white">{party.name}</h2>
                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">{party.role}</span>
                </div>
            </div>
            <button onClick={handleDownload} className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg active:scale-95 transition-all">
                <FileText size={20}/>
            </button>
        </div>

        {/* CONTROLS */}
        <div className="p-4 space-y-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <div className="flex gap-2">
                <QuickFilterBtn mode="all" label="All" icon={List} />
                <QuickFilterBtn mode="orders" label="Orders" icon={ShoppingBag} />
                <QuickFilterBtn mode="payments" label="Payments" icon={Banknote} />
                <QuickFilterBtn mode="details" label="Details" icon={PieChart} />
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex gap-2 items-center text-xs font-bold text-slate-400 uppercase mb-1">
                    <Filter size={12}/> Date Range
                </div>
                <div className="flex gap-2">
                    <input type="date" className="flex-1 bg-white dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-bold" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                    <span className="self-center text-slate-300">-</span>
                    <input type="date" className="flex-1 bg-white dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-bold" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>
                
                {viewMode !== 'details' && (
                    <>
                        {!isSupplier && partyItems.length > 0 && (
                            <div className="relative">
                                <select className="w-full bg-white dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-bold appearance-none" value={itemFilter} onChange={e => setItemFilter(e.target.value)}>
                                    <option value="">Item Filter (All)</option>
                                    {partyItems.map(item => <option key={item} value={item}>{item}</option>)}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                                {itemFilter && <button onClick={() => setItemFilter('')} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400"><X size={12}/></button>}
                            </div>
                        )}
                        {isSupplier && sendToCustomers.length > 0 && (
                            <div className="relative">
                                <select className="w-full bg-white dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-bold appearance-none" value={sendToFilter} onChange={e => setSendToFilter(e.target.value)}>
                                    <option value="">Send To Filter (All)</option>
                                    {sendToCustomers.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                                {sendToFilter && <button onClick={() => setSendToFilter('')} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400"><X size={12}/></button>}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
            {viewMode === 'details' ? (
                <div className="p-4 space-y-4">
                     <div className="grid grid-cols-2 gap-3">
                         <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                             <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><ShoppingBag size={10}/> Total {isSupplier ? 'Purchased' : 'Sold'}</div>
                             <div className="text-xl font-bold text-slate-900 dark:text-white">₹{detailsStats.totalBusiness.toLocaleString()}</div>
                         </div>
                         <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                             <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Banknote size={10}/> Total {isSupplier ? 'Paid' : 'Received'}</div>
                             <div className="text-xl font-bold text-green-600 dark:text-green-400">₹{detailsStats.totalPayment.toLocaleString()}</div>
                         </div>
                     </div>
                     
                     <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                         <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-600 dark:text-slate-400 uppercase flex items-center gap-2">
                             <List size={14}/> Item Breakdown
                         </div>
                         {detailsStats.itemBreakdown.length === 0 ? (
                             <div className="p-8 text-center text-slate-400 text-xs">No items found in this period.</div>
                         ) : (
                             <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                 {detailsStats.itemBreakdown.map((item, idx) => (
                                     <div key={idx} className="p-3 flex justify-between items-center">
                                         <div>
                                             <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.name}</div>
                                             <div className="text-xs text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 inline-block px-1.5 rounded mt-0.5">
                                                 {item.qty} {item.unit}
                                             </div>
                                         </div>
                                         <div className="text-right font-bold text-slate-700 dark:text-slate-300">
                                             ₹{item.amount.toLocaleString()}
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         )}
                     </div>
                </div>
            ) : (
                <div className="p-4 space-y-3">
                    {loading ? <div className="text-center py-10 text-slate-400">Loading...</div> : 
                     listViewData.length === 0 ? <div className="text-center py-10 text-slate-400">No records found.</div> :
                     listViewData.map((item, i) => (
                         <div key={i} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                             <div className="flex justify-between items-start">
                                 <div>
                                     <div className="flex items-center gap-2 mb-1">
                                         <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">{item.date}</span>
                                         <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${item._type === 'invoice' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'}`}>
                                             {item._type === 'invoice' ? 'ORDER' : 'PAYMENT'}
                                         </span>
                                     </div>
                                     <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                                        {item._type === 'invoice' ? (
                                            <span>{item.items?.map((it:any) => `${it.quantity} ${it.item_name}`).join(', ')}</span>
                                        ) : (
                                            `${item.payment_mode || 'Cash'} - ${item.payment_purpose || 'Payment'}`
                                        )}
                                     </div>
                                 </div>
                                 <div className="font-bold text-lg text-slate-900 dark:text-white">₹{item.total_amount || item.amount}</div>
                             </div>
                             {item._type === 'invoice' && item.send_to && (
                                 <div className="border-t border-slate-50 dark:border-slate-800 pt-2 text-[10px] text-green-600 dark:text-green-400 font-bold flex gap-2 items-center">
                                     <Truck size={12}/> Sent To: {item.send_to}
                                 </div>
                             )}
                         </div>
                     ))
                    }
                </div>
            )}
        </div>
    </div>
  );
};
export default PartyDetailView;
