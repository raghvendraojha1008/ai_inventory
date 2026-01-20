import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { 
  X, Loader2, UploadCloud, CheckCircle2, ArrowRight, 
  AlertTriangle, Image as ImageIcon, FileAudio, Maximize2, Minimize2, Trash2, Edit2, Save
} from 'lucide-react';
import { haptic } from '../../utils/haptics';
import { ApiService } from '../../services/api';
import { GeminiService } from '../../services/gemini';
import { AppSettings } from '../../types';
import { collection, query, where, getDocs } from 'firebase/firestore'; 
import { db } from '../../config/firebase'; 

interface CommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
  appSettings?: AppSettings; // Added AppSettings Prop
}

const CommandModal: React.FC<CommandModalProps> = ({ isOpen, onClose, user, onSuccess, appSettings }) => {
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<any[] | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        setTranscript('');
        setErrorMsg('');
        setScannedData(null);
        setSelectedFile(null);
        setPreview(null);
        setIsExpanded(false);
        setEditingIndex(null);
        setEditForm({});
    }
  }, [isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setSelectedFile(file);
          if (file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onloadend = () => setPreview(reader.result as string);
              reader.readAsDataURL(file);
          } else {
              setPreview(null); 
          }
          haptic.selection();
      }
  };

  const processInput = async () => {
      if ((!transcript && !selectedFile) || !user) return;
      setProcessing(true);
      setErrorMsg('');

      try {
          const isAudio = selectedFile?.type.startsWith('audio/');
          const isImage = selectedFile?.type.startsWith('image/');
          
          const data = await GeminiService.processInput(
              transcript, 
              isImage ? selectedFile : null,
              isAudio ? selectedFile : null
          );
          
          if (!data || data.length === 0) throw new Error("Could not understand command.");
          setScannedData(data);
          haptic.success();
      } catch (e: any) {
          setErrorMsg(e.message || "Failed to process.");
          haptic.error();
      } finally {
          setProcessing(false);
      }
  };

  const deleteItem = (index: number) => {
      if (!scannedData) return;
      const newData = scannedData.filter((_, i) => i !== index);
      setScannedData(newData.length > 0 ? newData : null);
      haptic.medium();
  };

  const startEditing = (index: number, item: any) => {
      setEditingIndex(index);
      setEditForm({ ...item });
      haptic.selection();
  };

  const saveEdit = () => {
      if (!scannedData || editingIndex === null) return;
      const newData = [...scannedData];
      const updatedItem = { ...editForm };
      
      if (updatedItem.amount) updatedItem.amount = Number(updatedItem.amount);
      if (updatedItem.total_amount) updatedItem.total_amount = Number(updatedItem.total_amount);
      
      if (updatedItem.items && Array.isArray(updatedItem.items)) {
          updatedItem.items = updatedItem.items.map((i: any) => ({
              ...i,
              total: (Number(i.quantity)||0) * (Number(i.rate)||0)
          }));
          updatedItem.total_amount = updatedItem.items.reduce((sum: number, i: any) => sum + i.total, 0);
      }

      newData[editingIndex] = updatedItem;
      setScannedData(newData);
      setEditingIndex(null);
      setEditForm({});
      haptic.success();
  };

  const executeSave = async () => {
      if (!scannedData || !user) return;
      haptic.medium();
      setProcessing(true);
      setErrorMsg('');

      try {
          for (const item of scannedData) {
              const collectionName = item.collection;
              if (!collectionName) continue;
              const { collection: _, ...payload } = item;

              // --- CRITICAL SAFETY CHECK: INVENTORY STOCK ---
              if (collectionName === 'ledger_entries' && payload.type === 'sell' && payload.items) {
                  for (const lineItem of payload.items) {
                      const q = query(collection(db, `users/${user.uid}/inventory`), where('name', '==', lineItem.item_name));
                      const snap = await getDocs(q);
                      
                      if (!snap.empty) {
                          const stockData = snap.docs[0].data() as any;
                          const currentStock = Number(stockData.current_stock) || 0;
                          const reqQty = Number(lineItem.quantity) || 0;

                          if (reqQty > currentStock) {
                              const allowNegative = appSettings?.automation?.allow_negative_stock;
                              
                              if (!allowNegative) {
                                  // STRICT BLOCK
                                  throw new Error(`Insufficient Stock for ${lineItem.item_name}. Available: ${currentStock}. Enable 'Allow Low Stock' in settings to override.`);
                              } else {
                                  // ALLOW BUT WARN
                                  console.warn(`Low stock warning for ${lineItem.item_name}`);
                              }
                          }
                      }
                  }
              }

              await ApiService.add(user.uid, collectionName, payload);
          }
          
          haptic.success();
          if (onSuccess) onSuccess();
          onClose();
      } catch (e: any) {
          setErrorMsg(e.message); 
          haptic.error();
      } finally {
          setProcessing(false);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200">
        <div className={`bg-white w-full sm:w-[550px] sm:mx-auto rounded-t-3xl sm:rounded-3xl p-6 flex flex-col relative transition-all duration-300 ${isExpanded ? 'h-[90vh]' : 'max-h-[85vh] h-auto'}`}>
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 flex-none">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">AI Command Center</h2>
                    <p className="text-xs text-slate-500">Type, or Upload Image/Audio</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                        {isExpanded ? <Minimize2 size={20}/> : <Maximize2 size={20}/>}
                    </button>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20}/></button>
                </div>
            </div>

            {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2 font-bold animate-pulse flex-none">
                    <AlertTriangle size={16}/> {errorMsg}
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto mb-4 scrollbar-hide">
                {scannedData ? (
                    <div className="space-y-3">
                        <div className="text-sm font-bold text-green-700 bg-green-50 p-2 rounded flex items-center gap-2">
                            <CheckCircle2 size={16}/> Ready to Save ({scannedData.length})
                        </div>
                        
                        {scannedData.map((item, idx) => (
                            <div key={idx} className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-sm relative group">
                                {editingIndex === idx ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-blue-600">Editing Record</span>
                                            <button onClick={saveEdit} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"><Save size={16}/></button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {item.party_name !== undefined && <input className="border p-1 rounded" placeholder="Name" value={editForm.party_name} onChange={e => setEditForm({...editForm, party_name: e.target.value})} />}
                                            {item.amount !== undefined && <input type="number" className="border p-1 rounded" placeholder="Amount" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} />}
                                            {item.vehicle !== undefined && <input className="border p-1 rounded" placeholder="Vehicle" value={editForm.vehicle} onChange={e => setEditForm({...editForm, vehicle: e.target.value})} />}
                                            {item.vehicle_rent !== undefined && <input type="number" className="border p-1 rounded" placeholder="Rent" value={editForm.vehicle_rent} onChange={e => setEditForm({...editForm, vehicle_rent: e.target.value})} />}
                                        </div>
                                        {editForm.items && Array.isArray(editForm.items) && (
                                            <div className="bg-white p-2 rounded border mt-2">
                                                {editForm.items.map((it: any, k: number) => (
                                                    <div key={k} className="flex gap-1 mb-1">
                                                        <input className="w-12 border rounded text-center" value={it.quantity} onChange={e => {
                                                            const newItems = [...editForm.items];
                                                            newItems[k].quantity = e.target.value;
                                                            setEditForm({...editForm, items: newItems});
                                                        }} />
                                                        <input className="flex-1 border rounded px-1" value={it.item_name} onChange={e => {
                                                            const newItems = [...editForm.items];
                                                            newItems[k].item_name = e.target.value;
                                                            setEditForm({...editForm, items: newItems});
                                                        }} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            <button onClick={() => startEditing(idx, item)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Edit2 size={14}/></button>
                                            <button onClick={() => deleteItem(idx)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 size={14}/></button>
                                        </div>
                                        <div className="flex justify-between items-start pr-16">
                                            <span className="font-bold text-slate-700 uppercase text-[10px] bg-slate-200 px-1.5 py-0.5 rounded tracking-wider">{item.collection}</span>
                                            {(item.total_amount > 0 || item.amount > 0) && <span className="font-bold text-slate-900">₹{item.total_amount || item.amount}</span>}
                                        </div>
                                        <div className="mt-1 font-medium text-slate-800">
                                            {item.party_name || item.name || item.category || 'Record'} 
                                            {item.vehicle && <span className="ml-2 text-slate-500 text-xs bg-white border px-1 rounded">🚛 {item.vehicle}</span>}
                                        </div>
                                        {item.items && (
                                            <div className="text-xs text-slate-500 mt-1 pl-2 border-l-2 border-slate-300">
                                                {item.items.map((i:any, k:number) => <div key={k}>{i.quantity} {i.unit} {i.item_name}</div>)}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {preview && <div className="relative h-48 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-none"><img src={preview} className="w-full h-full object-contain" alt="Preview" /><button onClick={() => { setSelectedFile(null); setPreview(null); }} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"><X size={14}/></button></div>}
                        {selectedFile && !preview && <div className="bg-blue-50 p-4 rounded-xl text-blue-600 font-bold flex items-center justify-between flex-none"><div className="flex items-center gap-3"><FileAudio size={24}/> <div className="text-sm truncate max-w-[200px]">{selectedFile.name}</div></div><button onClick={() => setSelectedFile(null)} className="text-blue-400 hover:text-blue-700"><X size={18}/></button></div>}
                        <textarea className={`w-full bg-slate-50 p-4 rounded-xl border border-slate-200 font-medium outline-none resize-none focus:ring-2 focus:ring-blue-500 transition-all ${isExpanded ? 'flex-1 min-h-[300px]' : 'h-32'}`} placeholder="e.g. Sold 200 cement to Amit, Vehicle UP70 AB 1234..." value={transcript} onChange={(e) => setTranscript(e.target.value)} />
                        <input type="file" accept="image/*,audio/*" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                        <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-2 flex-none"><UploadCloud size={20}/> Upload Image (OCR) or Audio</button>
                    </div>
                )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-50 flex-none">
                {scannedData ? (
                    <>
                        <button onClick={() => setScannedData(null)} className="px-6 py-4 rounded-xl font-bold text-slate-600 border border-slate-200">Back</button>
                        <button onClick={executeSave} disabled={processing} className="flex-1 bg-green-600 text-white rounded-xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all py-4">
                            {processing ? <Loader2 className="animate-spin"/> : <CheckCircle2 size={24}/>} Confirm Save
                        </button>
                    </>
                ) : (
                    <button onClick={processInput} disabled={(!transcript && !selectedFile) || processing} className="flex-1 bg-slate-900 text-white rounded-xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all py-4">
                        {processing ? <Loader2 className="animate-spin"/> : <ArrowRight size={24}/>} Process Command
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};
export default CommandModal;
