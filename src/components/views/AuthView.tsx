import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { ShieldCheck, LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

const AuthView = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    try {
      setLoading(true);
      setError('');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
          setError(err.message || "Google Sign-In failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill all fields"); return; }
    try {
      setLoading(true);
      setError('');
      if (isLogin) await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative safe-area-bottom">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl p-8 z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
             <ShieldCheck className="text-white" size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
        <p className="text-center text-slate-500 mb-8 text-sm">Secure Cloud Ledger for Shopkeepers</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-6 flex items-center gap-2 animate-in slide-in-from-top-2"><AlertCircle size={16} /> {error}</div>}

        <form onSubmit={handleEmail} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Email</label>
            <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)}/>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Password</label>
            <input type="password" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}/>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-slate-800">
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? <LogIn size={18}/> : <UserPlus size={18}/>)} {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="relative my-8"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Or continue with</span></div></div>

        <button onClick={handleGoogle} disabled={loading} className="w-full bg-white border border-slate-200 text-slate-700 py-3.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-2">
          {loading ? <Loader2 className="animate-spin text-slate-400"/> : <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G"/>} Sign in with Google
        </button>

        <p className="text-center mt-8 text-sm text-slate-500">{isLogin ? "Don't have an account?" : "Already have an account?"} <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-bold ml-1 hover:underline">{isLogin ? 'Sign Up' : 'Log In'}</button></p>
      </div>
      
      {/* Copyright Footer - NOW INSIDE THE VIEW */}
      <div className="mt-8 text-slate-400 text-xs font-bold">
         &copy; Prayagraj Associates
      </div>
    </div>
  );
};
export default AuthView;
