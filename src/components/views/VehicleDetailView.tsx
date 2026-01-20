import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  ArrowLeft, Truck, Calendar, MapPin, 
  IndianRupee, FileText, Filter, CheckCircle2 
} from 'lucide-react';
import { ExportService } from '../../services/export';
import { useUI } from '../../context/UIContext';

interface VehicleDetailProps {
  vehicle: any;
  user: User;
  onBack: () => void;
  appSettings: any;
}

const VehicleDetailView: React.FC<VehicleDetailProps> = ({ vehicle, user, onBack, appSettings }) => {
  const { showToast } = useUI();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<any[]>([]);
  
  // --- FILTERS ---
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]); // Default Today
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);     // Default Today
  // Vehicle No filter is implicit since we are viewing a specific vehicle, 
  // but we display it as a locked filter for clarity.

  useEffect(() => {
    const loadTrips = async () => {
        setLoading(true);
        try {
            // Fetch ALL sales where this vehicle was used
            const q = query(
                collection(db, `users/${user.uid}/ledger_entries`), 
                where('vehicle', '==', vehicle.vehicle_number),
                where('type', '==', 'sell')
            );
            const snap = await getDocs(q);
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            
            // Sort by Date Descending
            data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setTrips(data);
        } catch (e) { 
            console.error(e); 
            showToast("Failed to load vehicle history", "error");
        } finally { 
            setLoading(false); 
        }
    };
    loadTrips();
  }, [vehicle]);

  // --- CLIENT SIDE FILTERING ---
  const filteredTrips = trips.filter(t => {
      if (t.date < dateFrom || t.date > dateTo) return false;
      return true;
  });

  // --- TOTALS CALCULATION ---
  const totalRent = filteredTrips.reduce((sum, t) => sum + (Number(t.vehicle_rent) || 0), 0);
  const totalTrips = filteredTrips.length;

  // --- PDF EXPORT ---
  const handleDownload = async () => {
      if (filteredTrips.length === 0) return showToast("No records to export", "error");
      
      const headers = ['Date', 'Customer', 'Items', 'Rent'];
      const data = filteredTrips.map(t => ({
          Date: t.date,
          Customer: t.party_name,
          Items: t.items?.map((i:any) => i.item_name).join(', ') || '-',
          Rent: t.vehicle_rent || 0
      }));
      
      await ExportService.exportToCSV(data, Object.keys(data[0]), `Vehicle_${vehicle.vehicle_number}_Report.csv`);
      showToast("Report Saved", "success");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
        {/* HEADER */}
        <div className="bg-white p-4 border-b flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><ArrowLeft size={20}/></button>
                <div>
                    <h2 className="font-bold text-lg leading-none flex items-center gap-2">
                        <Truck size={18} className="text-blue-600"/>
                        {vehicle.vehicle_number}
                    </h2>
                    <span className="text-xs text-slate-500">{vehicle.owner_name} • {vehicle.driver_name || 'No Driver'}</span>
                </div>
            </div>
            <button onClick={handleDownload} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={20}/></button>
        </div>
        
        {/* FILTERS & STATS AREA */}
        <div className="p-4 bg-white border-b space-y-4">
            {/* Filter Inputs */}
            <div className="flex gap-3 items-end">
                <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Date From</label>
                    <input type="date" className="w-full bg-slate-50 border rounded-lg p-2 text-sm font-bold" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                </div>
                <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Date To</label>
                    <input type="date" className="w-full bg-slate-50 border rounded-lg p-2 text-sm font-bold" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>
            </div>

            {/* Active Filter Badge (Vehicle No) */}
            <div className="flex items-center gap-2">
                <div className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2 border border-slate-200">
                    <Filter size={12}/> Vehicle: {vehicle.vehicle_number}
                </div>
                <div className="text-xs text-slate-400 font-medium ml-auto">
                    {totalTrips} Records Found
                </div>
            </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="p-4 grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="text-slate-500 text-xs font-bold uppercase mb-1">Total Trips</div>
                <div className="text-2xl font-bold text-slate-900">{totalTrips}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="text-slate-500 text-xs font-bold uppercase mb-1">Total Rent</div>
                <div className="text-2xl font-bold text-green-600">₹{totalRent.toLocaleString()}</div>
            </div>
        </div>

        {/* SALE ORDER LIST */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase ml-1">Trip History</h3>
            
            {loading ? <div className="text-center py-10 text-slate-400">Loading history...</div> : 
             filteredTrips.length === 0 ? <div className="text-center py-10 text-slate-400">No trips found in this period.</div> :
             filteredTrips.map(trip => (
                <div key={trip.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{trip.date}</span>
                            <div className="font-bold text-slate-800 text-sm mt-1">{trip.party_name}</div>
                        </div>
                        <div className="text-right">
                             <div className="font-bold text-green-600">₹{trip.vehicle_rent || 0}</div>
                             <div className="text-[10px] text-slate-400">Rent</div>
                        </div>
                    </div>
                    {/* Items Summary */}
                    <div className="text-xs text-slate-500 border-t pt-2 mt-2">
                        {trip.items?.map((i: any, k: number) => (
                            <span key={k} className="mr-2">
                                {i.quantity} {i.unit} {i.item_name}
                            </span>
                        ))}
                    </div>
                    {/* Trip Status Indicator (Visual only) */}
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-green-600 font-bold">
                        <CheckCircle2 size={10}/> Trip Completed
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default VehicleDetailView;
