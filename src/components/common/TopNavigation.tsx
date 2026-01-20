import React, { useState, useEffect } from 'react';
import { Menu, Mic, Cloud, CloudOff, Wifi, WifiOff } from 'lucide-react';
import { useUI } from '../../context/UIContext';

interface TopNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openCommandCenter: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ activeTab, setActiveTab, openCommandCenter }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="bg-white px-4 py-3 flex justify-between items-center shadow-sm sticky top-0 z-50 safe-area-top">
      <div className="flex items-center gap-3">
        {/* LOGO / MENU */}
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
          S
        </div>
        
        {/* SYNC INDICATOR */}
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isOnline ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
           {isOnline ? <Cloud size={12} /> : <CloudOff size={12} />}
           {isOnline ? 'Synced' : 'Offline'}
        </div>
      </div>

      <h1 className="font-bold text-lg capitalize text-slate-800 absolute left-1/2 -translate-x-1/2">
        {activeTab.replace('-', ' ')}
      </h1>

      <button 
        onClick={openCommandCenter}
        className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"
      >
        <Mic size={20} />
      </button>
    </div>
  );
};

export default TopNavigation;