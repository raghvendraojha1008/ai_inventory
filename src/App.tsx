import React, { useState, useEffect } from 'react';
import { ApiService } from './services/api';
import { AppSettings } from './types';
import { DEFAULT_SETTINGS } from './config/constants';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import LoginView from './components/auth/LoginView';
import DashboardView from './components/views/DashboardView';
import LedgerView from './components/views/LedgerView';
import TransactionsView from './components/views/TransactionsView';
import InventoryView from './components/views/InventoryView';
import PartiesView from './components/views/PartiesView';
import VehiclesView from './components/views/VehiclesView';
import SettingsView from './components/views/SettingsView';
import ExpensesView from './components/views/ExpensesView';
import ReportsView from './components/views/ReportsView';
import CommandModal from './components/common/CommandModal';
import LockScreen from './components/common/LockScreen';
import ManualEntryModal from './components/modals/ManualEntryModal';
import { Mic, LayoutDashboard, BookOpen, Users, Settings } from 'lucide-react';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showAI, setShowAI] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [hasInitialLockCheck, setHasInitialLockCheck] = useState(false);
  
  const [entryModal, setEntryModal] = useState<{ open: boolean; type: string; data?: any }>({ open: false, type: 'sales' });

  useEffect(() => {
      if (appSettings.preferences?.dark_mode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
  }, [appSettings.preferences?.dark_mode]);

  useEffect(() => {
    if (user) {
        const loadSettings = async () => {
             const savedData = await ApiService.settings.get(user.uid);
             if (savedData) setAppSettings({ ...DEFAULT_SETTINGS, ...savedData });
        };
        loadSettings();
    }
  }, [user]);

  useEffect(() => {
       if (user && appSettings.security?.enabled && appSettings.security?.pin && !hasInitialLockCheck) {
           setIsLocked(true);
           setHasInitialLockCheck(true);
       }
  }, [appSettings.security, user, hasInitialLockCheck]);

  const updateSettings = (newSettings: AppSettings) => setAppSettings(newSettings);

  const openManual = (type: string, data?: any) => setEntryModal({ open: true, type, data });

  const handleQuickAction = (action: string) => {
      if (action === 'ai') return setShowAI(true);
      if (action === 'sale') return openManual('sales');
      if (action === 'purchase') return openManual('purchases');
      if (action === 'payment') return openManual('transactions');
      if (action === 'expense') return openManual('expenses');
      if (action === 'vehicle') return setActiveTab('vehicles');
  };

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-bold text-slate-400">Loading...</div>;
  if (!user) return <LoginView />;

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden transition-colors duration-200 ${appSettings.preferences?.dark_mode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
       {isLocked ? (
           <LockScreen pin={appSettings.security?.pin || '0000'} onUnlock={() => setIsLocked(false)} enableBiometrics={appSettings.security?.enable_biometrics} /> 
       ) : (
           <>
               <div className="flex-1 overflow-hidden relative pt-12">
                   {activeTab === 'dashboard' && <DashboardView user={user} appSettings={appSettings} onNavigate={setActiveTab} onQuickAction={handleQuickAction} />}
                   
                   {/* FIXED: Passed onEdit to all views so the Pencil button works */}
                   {activeTab === 'ledger' && <LedgerView user={user} onAdd={() => openManual('sales')} onEdit={(item) => openManual(item.type === 'sell' ? 'sales' : 'purchases', item)} />}
                   {activeTab === 'transactions' && <TransactionsView user={user} onAdd={() => openManual('transactions')} onEdit={(item) => openManual('transactions', item)} />}
                   {activeTab === 'inventory' && <InventoryView user={user} settings={appSettings} onAdd={() => openManual('inventory')} onEdit={(item) => openManual('inventory', item)} />}
                   
                   {activeTab === 'parties' && <PartiesView user={user} />}
                   {activeTab === 'vehicles' && <VehiclesView user={user} />}
                   {activeTab === 'expenses' && <ExpensesView user={user} appSettings={appSettings} onEdit={(item) => openManual('expenses', item)} />}
                   {activeTab === 'reports' && <ReportsView user={user} onBack={() => setActiveTab('dashboard')} />}
                   {activeTab === 'settings' && <div className="h-full block"><SettingsView user={user} appSettings={appSettings} onUpdateSettings={updateSettings} onBack={() => setActiveTab('dashboard')} /></div>}
               </div>

               {activeTab !== 'settings' && (
                   <div className="bg-white dark:bg-slate-900 border-t dark:border-slate-800 p-2 pb-6 flex justify-around items-center safe-area-bottom z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                       <NavBtn id="dashboard" label="Home" icon={LayoutDashboard} active={activeTab} onClick={setActiveTab} />
                       <NavBtn id="ledger" label="Ledger" icon={BookOpen} active={activeTab} onClick={setActiveTab} />
                       <div className="relative -top-6">
                           <button onClick={() => setShowAI(true)} className="w-16 h-16 bg-slate-900 dark:bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-slate-900/30 active:scale-95 transition-all border-4 border-slate-50 dark:border-slate-950">
                               <Mic size={28} />
                           </button>
                       </div>
                       <NavBtn id="parties" label="Parties" icon={Users} active={activeTab} onClick={setActiveTab} />
                       <NavBtn id="settings" label="Settings" icon={Settings} active={activeTab} onClick={setActiveTab} />
                   </div>
               )}

               {showAI && <CommandModal isOpen={showAI} onClose={() => setShowAI(false)} user={user} onSuccess={() => {}} appSettings={appSettings} />}
               
               {entryModal.open && (
                   <ManualEntryModal 
                       isOpen={entryModal.open} 
                       onClose={() => setEntryModal({ ...entryModal, open: false })}
                       type={entryModal.type}
                       user={user}
                       initialData={entryModal.data}
                       appSettings={appSettings}
                   />
               )}
           </>
       )}
    </div>
  );
};

const NavBtn = ({ id, label, icon: Icon, active, onClick }: any) => (
    <button onClick={() => onClick(id)} className={`flex flex-col items-center gap-1 p-2 transition-all ${active === id ? 'text-slate-900 dark:text-blue-400 scale-110' : 'text-slate-400 dark:text-slate-600'}`}>
        <Icon size={24} strokeWidth={active === id ? 3 : 2} />
        <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </button>
);

export default function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <AppContent />
      </UIProvider>
    </AuthProvider>
  );
}
