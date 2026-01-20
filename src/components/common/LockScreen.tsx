import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Fingerprint, Delete } from 'lucide-react';

interface LockScreenProps {
  pin: string;
  onUnlock: () => void;
  enableBiometrics?: boolean;
}

const LockScreen: React.FC<LockScreenProps> = ({ pin, onUnlock, enableBiometrics }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (input.length === 4) {
      if (input === pin) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => {
          setInput('');
          setError(false);
        }, 500);
      }
    }
  }, [input, pin, onUnlock]);

  const handleNum = (num: string) => {
    if (input.length < 4) setInput(prev => prev + num);
  };

  const handleBackspace = () => setInput(prev => prev.slice(0, -1));

  return (
    <div className="fixed inset-0 bg-slate-900 text-white z-[60] flex flex-col items-center justify-center p-8">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
          <Lock size={32} />
        </div>
        <h1 className="text-2xl font-black">App Locked</h1>
        <p className="text-slate-400 text-sm mt-1">Enter PIN to access</p>
      </div>

      <div className="flex gap-4 mb-12">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${i < input.length ? 'bg-blue-500 scale-110' : 'bg-slate-700'} ${error ? 'bg-red-500 animate-pulse' : ''}`} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 w-full max-w-xs">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button key={num} onClick={() => handleNum(num.toString())} className="h-20 w-20 rounded-full bg-slate-800 hover:bg-slate-700 font-bold text-2xl flex items-center justify-center transition-all active:scale-90">
            {num}
          </button>
        ))}
        <div className="flex items-center justify-center">
           {enableBiometrics && <button className="text-blue-500"><Fingerprint size={32}/></button>}
        </div>
        <button onClick={() => handleNum('0')} className="h-20 w-20 rounded-full bg-slate-800 hover:bg-slate-700 font-bold text-2xl flex items-center justify-center transition-all active:scale-90">0</button>
        <button onClick={handleBackspace} className="h-20 w-20 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-all active:scale-90">
           <Delete size={28}/>
        </button>
      </div>
    </div>
  );
};
export default LockScreen;
