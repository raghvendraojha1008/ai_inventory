import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  TrendingUp, TrendingDown, Package, Users, 
  ShoppingCart, AlertTriangle, Clock, ArrowRight, Plus 
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { haptic } from '../../utils/haptics';

interface DashboardProps {
  user: User;
  onQuickAction: (type: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onQuickAction }) => {
  const [stats, setStats] = useState({
    todaySale: 0,
    monthSale: 0,
    lowStock: 0,
    receivable: 0,
    payable: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const todayStr = new Date().toISOString().split('T')[0];
        const currentMonth = todayStr.substring(0, 7); // YYYY-MM

        // 1. Fetch ALL Data (Safe Strategy - Avoids Index Errors)
        const [ledgerSnap, invSnap, partySnap] = await Promise.all([
            ApiService.getAll(user.uid, 'ledger_entries'),
            ApiService.getAll(user.uid, 'inventory'),
            ApiService.getAll(user.uid, 'parties')
        ]);

        let today = 0;
        let month = 0;
        let low = 0;
        let recv = 0;
        let pay = 0;
        const activity: any[] = [];

        // 2. Calculate Sales
        ledgerSnap.forEach(doc => {
            const d = doc.data();
            activity.push({ id: doc.id, ...d, _sortDate: d.date || '' });
            
            if (d.type === 'sell') {
                const amount = Number(d.total_amount) || 0;
                if (d.date === todayStr) today += amount;
                if (d.date && d.date.startsWith(currentMonth)) month += amount;
            }
        });

        // 3. Calculate Stock
        invSnap.forEach(doc => {
            const d = doc.data();
            if ((Number(d.current_stock) || 0) <= (Number(d.min_stock) || 5)) {
                low++;
            }
        });

        // 4. Calculate Parties
        partySnap.forEach(doc => {
            const d = doc.data();
            const bal = Number(d.opening_balance) || 0;
            if (bal > 0) recv += bal; // Positive = Receivable
            if (bal < 0) pay += Math.abs(bal); // Negative = Payable
        });

        // 5. Sort Activity (Newest First)
        activity.sort((a, b) => new Date(b._sortDate).getTime() - new Date(a._sortDate).getTime());

        setStats({ todaySale: today, monthSale: month, lowStock: low, receivable: recv, payable: pay });
        setRecentActivity(activity.slice(0, 5)); // Top 5

      } catch (e) {
        console.error("Dashboard Load Error", e);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [user]);

  const StatCard = ({ label, value, icon: Icon, color, subValue }: any) => (
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
          <div>
              <p className="text-slate-500 text-xs font-bold uppercase mb-1">{label}</p>
              <h3 className="text-2xl font-bold text-slate-800">
                  {typeof value === 'number' ? `₹${value.toLocaleString()}` : value}
              </h3>
              {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
              <Icon size={20} className="text-white"/>
          </div>
      </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24">
       {/* Greeting */}
       <div className="flex justify-between items-center">
           <div>
               <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
               <p className="text-slate-500 text-sm">Overview for today</p>
           </div>
           <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold">
               {new Date().toLocaleDateString()}
           </div>
       </div>

       {/* Key Stats */}
       <div className="grid grid-cols-2 gap-3">
           <StatCard 
                label="Today's Sale" 
                value={stats.todaySale} 
                icon={TrendingUp} 
                color="bg-green-500" 
                subValue={`Month: ₹${stats.monthSale.toLocaleString()}`}
           />
           <StatCard 
                label="Low Stock" 
                value={stats.lowStock} 
                icon={AlertTriangle} 
                color={stats.lowStock > 0 ? "bg-red-500 animate-pulse" : "bg-orange-400"}
                subValue="Items to reorder"
           />
           <StatCard 
                label="Receivable" 
                value={stats.receivable} 
                icon={ArrowRight} 
                color="bg-blue-500" 
                subValue="From Customers"
           />
           <StatCard 
                label="Payable" 
                value={stats.payable} 
                icon={ArrowRight} 
                color="bg-purple-500" 
                subValue="To Suppliers"
           />
       </div>

       {/* Quick Actions */}
       <div>
           <h3 className="text-sm font-bold text-slate-700 mb-3">Quick Actions</h3>
           <div className="grid grid-cols-4 gap-2">
               {[
                   { label: 'Sale', icon: ShoppingCart, color: 'bg-green-600', action: 'sales' },
                   { label: 'Purchase', icon: Package, color: 'bg-blue-600', action: 'purchases' },
                   { label: 'Payment', icon: TrendingDown, color: 'bg-purple-600', action: 'transactions' },
                   { label: 'Add User', icon: Users, color: 'bg-slate-700', action: 'customers' },
               ].map((btn) => (
                   <button 
                    key={btn.label}
                    onClick={() => onQuickAction(btn.action)}
                    className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-slate-100 shadow-sm active:scale-95 transition-all"
                   >
                       <div className={`p-3 rounded-full text-white ${btn.color}`}>
                           <btn.icon size={20}/>
                       </div>
                       <span className="text-xs font-bold text-slate-600">{btn.label}</span>
                   </button>
               ))}
           </div>
       </div>

       {/* Recent Activity */}
       <div>
           <div className="flex justify-between items-center mb-3">
               <h3 className="text-sm font-bold text-slate-700">Recent Activity</h3>
           </div>
           
           <div className="space-y-3">
               {loading ? <div className="text-center py-10 text-slate-400">Loading...</div> : 
                recentActivity.length === 0 ? <div className="text-center py-10 text-slate-400">No activity yet.</div> :
                recentActivity.map((item) => (
                   <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                       <div className="flex items-center gap-3">
                           <div className="bg-slate-100 p-2.5 rounded-lg text-slate-500">
                               {item.type === 'sell' ? <TrendingUp size={18} className="text-green-600"/> : 
                                item.type === 'purchase' ? <Package size={18} className="text-blue-600"/> :
                                <Clock size={18}/>}
                           </div>
                           <div>
                               <h4 className="font-bold text-slate-800 text-sm">{item.party_name || 'Unknown'}</h4>
                               <p className="text-xs text-slate-400 uppercase">{item.type || 'Record'}</p>
                           </div>
                       </div>
                       <div className="text-right">
                           <div className="font-bold text-slate-900">₹{item.total_amount || item.amount || 0}</div>
                           <div className="text-xs text-slate-400">{item.date}</div>
                       </div>
                   </div>
               ))}
           </div>
       </div>
    </div>
  );
};

export default Dashboard;
