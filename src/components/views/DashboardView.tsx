import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, 
  Wallet, AlertCircle, ShoppingCart, Truck, Users, 
  Package, ChevronRight, Plus
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { AppSettings } from '../../types';
import { useUI } from '../../context/UIContext';

interface DashboardViewProps {
  user: User;
  appSettings: AppSettings;
  onNavigate: (view: string) => void;
  onQuickAction: (action: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ user, appSettings, onNavigate, onQuickAction }) => {
  const [stats, setStats] = useState({
    sales: 0, purchases: 0, received: 0, paid: 0, receivable: 0, payable: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [ledgerSnap, transSnap] = await Promise.all([
          ApiService.getAll(user.uid, 'ledger_entries'),
          ApiService.getAll(user.uid, 'transactions')
        ]);

        let sales = 0, purchases = 0, received = 0, paid = 0;
        
        ledgerSnap.docs.forEach(doc => {
            const d = doc.data();
            const amt = Number(d.total_amount) || 0;
            if (d.type === 'sell') sales += amt;
            if (d.type === 'purchase') purchases += amt;
        });

        transSnap.docs.forEach(doc => {
            const d = doc.data();
            const amt = Number(d.amount) || 0;
            if (d.type === 'received') received += amt;
            if (d.type === 'paid') paid += amt;
        });

        setStats({
            sales, purchases, received, paid,
            receivable: sales - received, 
            payable: purchases - paid
        });
      } catch (e) { console.error(e); }
    };
    loadStats();
  }, [user]);

  const getFontSize = (val: number) => {
      const str = val.toLocaleString('en-IN');
      const len = str.length;
      if (len > 10) return "text-lg"; 
      if (len > 8) return "text-xl";
      if (len > 6) return "text-2xl"; 
      return "text-3xl"; 
  };

  const StatCard = ({ title, value, type, icon: Icon, onClick }: any) => {
      const isPositive = type === 'success';
      const colorClass = isPositive 
          ? 'text-green-600 bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400' 
          : 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400';
      const iconColor = isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
      return (
          <div onClick={onClick} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-all relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                  <div className={`p-2 rounded-xl ${colorClass}`}>
                      <Icon size={20} />
                  </div>
                  {isPositive ? <ArrowUpRight className={iconColor} size={18}/> : <ArrowDownRight className={iconColor} size={18}/>}
              </div>
              <div>
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{title}</div>
                  <div className={`font-black text-slate-900 dark:text-white mt-0.5 tracking-tight ${getFontSize(value)}`}>
                      {appSettings.profile.currency_symbol}{value.toLocaleString('en-IN')}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 p-4 pb-20 space-y-5 overflow-y-auto transition-colors duration-200">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">{appSettings.profile.firm_name}</h1>
                <p className="text-xs font-bold text-slate-400">Overview</p>
            </div>
            <button onClick={() => onQuickAction('ai')} className="bg-slate-900 dark:bg-blue-600 text-white p-2.5 rounded-xl shadow-lg active:scale-90 transition-all">
                <Plus size={24}/>
            </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <StatCard title="Total Sales" value={stats.sales} type="success" icon={TrendingUp} onClick={() => onNavigate('reports')} />
            <StatCard title="Total Purchase" value={stats.purchases} type="danger" icon={TrendingDown} onClick={() => onNavigate('reports')} />
            <StatCard title="Cash Received" value={stats.received} type="success" icon={Wallet} onClick={() => onNavigate('transactions')} />
            <StatCard title="Cash Paid" value={stats.paid} type="danger" icon={Wallet} onClick={() => onNavigate('transactions')} />
        </div>

        <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase ml-1">Quick Actions</h3>
            <div className="grid grid-cols-4 gap-2">
                <ActionButton label="Sale" icon={ShoppingCart} color="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" onClick={() => onQuickAction('sale')} />
                <ActionButton label="Purchase" icon={Package} color="bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" onClick={() => onQuickAction('purchase')} />
                <ActionButton label="Payment" icon={Wallet} color="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" onClick={() => onQuickAction('payment')} />
                {/* FIXED: Changed Vehicle to Expense */}
                <ActionButton label="Expense" icon={TrendingDown} color="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" onClick={() => onQuickAction('expense')} />
            </div>
        </div>

        <div className="bg-slate-900 dark:bg-slate-800 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10"><AlertCircle size={100}/></div>
            <div className="relative z-10">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Outstanding Balance</h3>
                <div className="flex gap-6">
                    <div>
                        <div className="text-xs text-slate-400 mb-1">You'll Get</div>
                        <div className={`font-bold text-green-400 ${getFontSize(stats.receivable)}`}>
                           {appSettings.profile.currency_symbol}{stats.receivable.toLocaleString('en-IN')}
                        </div>
                    </div>
                    <div className="w-px bg-slate-700 dark:bg-slate-600"></div>
                    <div>
                        <div className="text-xs text-slate-400 mb-1">You'll Give</div>
                        <div className={`font-bold text-red-400 ${getFontSize(stats.payable)}`}>
                           {appSettings.profile.currency_symbol}{stats.payable.toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="h-4"></div>
    </div>
  );
};

const ActionButton = ({ label, icon: Icon, color, onClick }: any) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl ${color} active:scale-95 transition-all border border-transparent dark:border-white/5 hover:border-black/5`}>
        <Icon size={22} />
        <span className="text-[10px] font-bold uppercase">{label}</span>
    </button>
);
export default DashboardView;
