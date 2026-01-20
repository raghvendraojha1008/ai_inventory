import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { X, Mic, Send, Image as ImageIcon, Loader2, AlertTriangle } from 'lucide-react';
import { GeminiService } from '../../services/gemini';
import { ApiService } from '../../services/api';
import { useUI } from '../../context/UIContext';
import { AppSettings } from '../../types';
import { haptic } from '../../utils/haptics';

interface CommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSuccess?: () => void;    // Added Prop
  appSettings?: AppSettings; // Added Prop
}

const CommandModal: React.FC<CommandModalProps> = ({ isOpen, onClose, user, onSuccess, appSettings }) => {
  const { showToast } = useUI();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleProcess = async () => {
      if (!input.trim() && !file) return;
      setLoading(true);
      setError('');
      haptic.medium();
      
      try {
          const commands = await GeminiService.processInput(input, file);
          
          if (!commands || commands.length === 0) {
              throw new Error("Could not understand command.");
          }

          let count = 0;
          for (const cmd of commands) {
              const { collection, ...data } = cmd;
              if (collection) {
                  await ApiService.add(user.uid, collection, { 
                      ...data, 
                      created_at: new Date().toISOString() 
                  });
                  count++;
              }
          }
          
          showToast(`${count} Actions Processed`, 'success');
          haptic.success();
          
          if (onSuccess) onSuccess(); // Trigger refresh
          
          setInput('');
          setFile(null);
          onClose();

      } catch (e: any) {
          console.error(e);
          haptic.error();
          setError(e.message || "Processing failed");
      } finally {
          setLoading(false);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                <div>
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white">AI Command Center</h2>
                    <p className="text-xs text-slate-500">Type, or Upload Image/Audio</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full dark:text-white"><X size={20}/></button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 flex gap-2 items-center text-red-600 dark:text-red-400 text-xs font-bold px-6">
                    <AlertTriangle size={14}/> {error}
                </div>
            )}

            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                <textarea 
                    className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl resize-none outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                    placeholder="e.g. 'Add customer Mohit from Delhi'"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                />
                
                <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <input type="file" className="hidden" accept="image/*,audio/*" onChange={e => setFile(e.target.files?.[0] || null)} />
                    <ImageIcon size={20} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{file ? file.name : "Upload Image (OCR) or Audio"}</span>
                </label>
            </div>

            <div className="p-4 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <button 
                    onClick={handleProcess} 
                    disabled={loading || (!input && !file)}
                    className="w-full py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
                >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <><Send size={18} /> Process Command</>}
                </button>
            </div>
        </div>
    </div>
  );
};
export default CommandModal;
