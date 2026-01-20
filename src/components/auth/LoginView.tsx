import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag } from 'lucide-react';

const LoginView = () => {
  const { loginWithGoogle, loading } = useAuth();

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl w-full max-w-sm text-center border border-slate-100 dark:border-slate-800">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-blue-600/30">
          <ShoppingBag size={32} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Shop Ledger</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Manage your business with AI</p>
        
        <button 
          onClick={loginWithGoogle} 
          disabled={loading}
          className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'Connecting...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  );
};
export default LoginView;
