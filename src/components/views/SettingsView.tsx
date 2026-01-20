import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  ArrowLeft, Moon, Volume2, LogOut, RefreshCw, 
  Database, ChevronRight, Sliders, Zap, List
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { DataService } from '../../services/data';
import { AppSettings, UserProfile } from '../../types';
import { useUI } from '../../context/UIContext';
import { setHapticsEnabled } from '../../utils/haptics';
import RecycleBin from '../common/RecycleBin';

interface SettingsViewProps {
  user: User;
  appSettings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  onBack: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, appSettings, onUpdateSettings, onBack }) => {
  const { showToast, confirm } = useUI();
  const [activeTab, setActiveTab] = useState<'profile' | 'lists' | 'config' | 'data'>('profile');
  const [loading, setLoading] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false);

  const [profile, setProfile] = useState<UserProfile>(appSettings.profile);
  const [customLists, setCustomLists] = useState(appSettings.custom_lists || { 
      expense_types: [], payment_modes: [], received_by_names: [], paid_by_names: [], purposes: [] 
  });
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
      setProfile(appSettings.profile);
      setCustomLists(appSettings.custom_lists || { 
          expense_types: [], payment_modes: [], received_by_names: [], paid_by_names: [], purposes: [] 
      });
  }, [appSettings]);

  const handleSaveProfile = async () => {
      setLoading(true);
      try {
          const newSettings = { ...appSettings, profile };
          await ApiService.updateSettings(user.uid, newSettings);
          onUpdateSettings(newSettings);
          showToast("Profile Saved", "success");
      } catch (e) { showToast("Save Failed", "error"); }
      setLoading(false);
  };

  const handleToggle = async (section: keyof AppSettings, field: string) => {
      const currentSection = (appSettings as any)[section] || {};
      const newSettings = { 
          ...appSettings, 
          [section]: { ...currentSection, [field]: !currentSection[field] } 
      };
      
      if (section === 'preferences' && field === 'haptics_enabled') {
          setHapticsEnabled(newSettings.preferences.haptics_enabled);
      }
      
      await ApiService.updateSettings(user.uid, newSettings);
      onUpdateSettings(newSettings);
  };

  const handleAddListItem = async (listName: string) => {
      if (!newItem.trim()) return;
      const currentList = customLists[listName as keyof typeof customLists] || [];
      if (currentList.includes(newItem)) return showToast("Item already exists", "error");

      const newLists = { ...customLists, [listName]: [...currentList, newItem] };
      setCustomLists(newLists);
      setNewItem('');
      
      const newSettings = { ...appSettings, custom_lists: newLists };
      await ApiService.updateSettings(user.uid, newSettings);
      onUpdateSettings(newSettings);
  };

  const handleDeleteListItem = async (listName: string, item: string) => {
      if (await confirm("Delete Item?", `Remove '${item}'?`)) {
          const currentList = customLists[listName as keyof typeof customLists] || [];
          const newLists = { ...customLists, [listName]: currentList.filter(i => i !== item) };
          setCustomLists(newLists);
          const newSettings = { ...appSettings, custom_lists: newLists };
          await ApiService.updateSettings(user.uid, newSettings);
          onUpdateSettings(newSettings);
      }
  };

  const handleBackup = async () => {
      setLoading(true);
      const res = await DataService.backupData(user.uid);
      showToast(res.message, res.success ? 'success' : 'error');
      setLoading(false);
  };

  if (showRecycleBin) return <RecycleBin user={user} onBack={() => setShowRecycleBin(false)} />;

  const ListEditor = ({ title, field }: { title: string, field: string }) => (
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm mb-4">
          <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3 text-sm flex items-center gap-2">
              <List size={14} className="text-blue-500"/> {title}
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
              {(customLists[field as keyof typeof customLists] || []).map((item, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 dark:text-slate-300">
                      {item}
                      <button onClick={() => handleDeleteListItem(field, item)} className="text-slate-400 hover:text-red-500 px-1">×</button>
                  </div>
              ))}
          </div>
          <div className="flex gap-2">
              <input 
                  className="flex-1 border dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Add new item..." 
                  value={newItem} 
                  onChange={e => setNewItem(e.target.value)} 
                  onKeyDown={e => { if(e.key === 'Enter') handleAddListItem(field); }} 
              />
              <button onClick={() => handleAddListItem(field)} className="bg-slate-900 dark:bg-blue-600 text-white p-2 rounded-lg font-bold text-xs uppercase">Add</button>
          </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 px-4 pb-6">
        {/* HEADER WITH BACK BUTTON */}
        <div className="flex items-center gap-3 mb-4 mt-2">
            <button onClick={onBack} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm active:scale-95 transition-all">
                <ArrowLeft size={20} className="text-slate-900 dark:text-white"/>
            </button>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Settings</h1>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
            {[
                { id: 'profile', label: 'Profile' },
                { id: 'config', label: 'Config' },
                { id: 'lists', label: 'Lists' },
                { id: 'data', label: 'Data' }
            ].map(tab => (
                <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id as any)} 
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700'}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>

        <div className="flex-1 overflow-y-auto pb-20">
            {activeTab === 'profile' && (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                        <Input label="Business Name" value={profile.firm_name} onChange={(v: string) => setProfile({...profile, firm_name: v})} />
                        <Input label="Owner Name" value={profile.owner_name} onChange={(v: string) => setProfile({...profile, owner_name: v})} />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid grid-cols-2 gap-4"><Input label="Phone" value={profile.contact} onChange={(v: string) => setProfile({...profile, contact: v})} /><Input label="State" value={profile.state} onChange={(v: string) => setProfile({...profile, state: v})} /></div>
                            {/* ADDED: Missing State Field */}
                            <Input label="State" value={profile.state} onChange={(v: string) => setProfile({...profile, state: v})} />
                        </div>
                        <Input label="Address" value={profile.address} onChange={(v: string) => setProfile({...profile, address: v})} />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid grid-cols-2 gap-4"><Input label="GSTIN" value={profile.gstin} onChange={(v: string) => setProfile({...profile, gstin: v})} /><Input label="Inv. Prefix" value={profile.invoice_prefix} onChange={(v: string) => setProfile({...profile, invoice_prefix: v})} placeholder="e.g. INV-" /></div>
                            {/* ADDED: Missing Prefix Field */}
                            <Input label="Inv. Prefix" value={profile.invoice_prefix} onChange={(v: string) => setProfile({...profile, invoice_prefix: v})} placeholder="e.g. INV-" />
                        </div>
                        <Input label="Currency" value={profile.currency_symbol} onChange={(v: string) => setProfile({...profile, currency_symbol: v})} w="w-24" />
                        
                        <button onClick={handleSaveProfile} disabled={loading} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold mt-2 shadow-lg active:scale-95 transition-all">
                            {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                    
                    <button onClick={() => window.location.reload()} className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                        <LogOut size={20}/> Logout App
                    </button>
                </div>
            )}

            {/* NEW CONFIG TAB */}
            {activeTab === 'config' && (
                <div className="space-y-4">
                    {/* PREFERENCES */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Sliders size={14}/> App Preferences</h3>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3"><Volume2 size={20} className="text-slate-400"/> <span className="font-bold text-slate-700 dark:text-white">Haptic Feedback</span></div>
                            <Toggle checked={appSettings.preferences?.haptics_enabled} onChange={() => handleToggle('preferences', 'haptics_enabled')} />
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3"><Moon size={20} className="text-slate-400"/> <span className="font-bold text-slate-700 dark:text-white">Dark Mode</span></div>
                            <Toggle checked={appSettings.preferences?.dark_mode} onChange={() => handleToggle('preferences', 'dark_mode')} />
                        </div>
                    </div>

                    {/* AUTOMATION */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Zap size={14}/> Automation</h3>
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-700 dark:text-white text-sm">Low Stock Warning</span>
                            <Toggle checked={appSettings.automation?.low_stock_warning} onChange={() => handleToggle('automation', 'low_stock_warning')} />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-700 dark:text-white text-sm">Allow Negative Stock</span>
                            <Toggle checked={appSettings.automation?.allow_negative_stock} onChange={() => handleToggle('automation', 'allow_negative_stock')} />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-700 dark:text-white text-sm">Show Delete Button</span>
                            <Toggle checked={appSettings.automation?.show_delete_btn} onChange={() => handleToggle('automation', 'show_delete_btn')} />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'config' && (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">Automation</h3>
                        <div className="flex justify-between items-center"><span className="font-bold text-slate-700 dark:text-white text-sm">Low Stock Warning</span><Toggle checked={appSettings.automation?.low_stock_warning} onChange={() => handleToggle('automation', 'low_stock_warning')} /></div>
                        <div className="flex justify-between items-center"><span className="font-bold text-slate-700 dark:text-white text-sm">Show Delete Button</span><Toggle checked={appSettings.automation?.show_delete_btn} onChange={() => handleToggle('automation', 'show_delete_btn')} /></div>
                         <div className="flex justify-between items-center"><span className="font-bold text-slate-700 dark:text-white text-sm">Allow Negative Stock</span><Toggle checked={appSettings.automation?.allow_negative_stock} onChange={() => handleToggle('automation', 'allow_negative_stock')} /></div>
                    </div>
                </div>
            )}
{activeTab === 'lists' && (
                <div>
                    {/* ADDED: Missing Lists */}
                    <ListEditor title="Expense Categories" field="expense_types" />
                    <ListEditor title="Payment Modes" field="payment_modes" />
<ListEditor title="Payment Purposes" field="purposes" /><ListEditor title="Received By" field="received_by_names" /><ListEditor title="Paid By" field="paid_by_names" />
                    <ListEditor title="Payment Purposes" field="purposes" />
                    <ListEditor title="Received By (Staff)" field="received_by_names" />
                    <ListEditor title="Paid By (Staff)" field="paid_by_names" />
                </div>
            )}

            {activeTab === 'data' && (
                <div className="space-y-4">
                    <button onClick={() => setShowRecycleBin(true)} className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group active:scale-95 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg"><RefreshCw size={24}/></div>
                            <div className="text-left"><h3 className="font-bold text-slate-800 dark:text-white">Recycle Bin</h3></div>
                        </div>
                        <ChevronRight className="text-slate-300"/>
                    </button>
                    <button onClick={handleBackup} className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group active:scale-95 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Database size={24}/></div>
                            <div className="text-left"><h3 className="font-bold text-slate-800 dark:text-white">Backup Data</h3></div>
                        </div>
                        <ChevronRight className="text-slate-300"/>
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

const Input = ({ label, value, onChange, w, placeholder }: any) => (
    <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{label}</label>
        <input 
            className={`w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 ${w || ''}`} 
            value={value || ''} 
            onChange={e => onChange(e.target.value)} 
            placeholder={placeholder}
        />
    </div>
);

const Toggle = ({ checked, onChange }: any) => (
    <div onClick={onChange} className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-all ${checked ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
);

export default SettingsView;
