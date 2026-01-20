import React from 'react';
import { Edit2, Trash2, Calendar, Truck, Package, Hash, CreditCard, Banknote, Printer, Share2 } from 'lucide-react'; // Added Share2
import { formatDate, formatCurrency } from '../../utils/helpers';
import { Highlighter } from '../common/Highlighter';

interface LedgerCardProps {
  l: any;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onPrint?: (item: any) => void;
  showDelete?: boolean;
  searchTerm?: string;
}

const LedgerCard: React.FC<LedgerCardProps> = ({ l, onEdit, onDelete, onPrint, showDelete = true, searchTerm = '' }) => {
  const isPurchase = l.type === 'purchase';
  const itemCount = l.items ? l.items.length : 0;
  const firstItem = l.items && l.items[0] ? l.items[0].item_name : (l.item_name || 'General Item');

  const handleShare = (e: React.MouseEvent) => {
      e.stopPropagation();
      const text = `*Invoice Details*\nType: ${isPurchase ? 'Purchase' : 'Sale'}\nParty: ${l.party_name}\nDate: ${formatDate(l.date)}\nAmount: ${formatCurrency(l.total_amount)}\nInvoice No: ${l.invoice_no || 'NA'}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="group bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPurchase ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
      
      <div className="flex justify-between items-start mb-3 pl-2">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-base text-slate-800 leading-none">
                    <Highlighter text={l.party_name} highlight={searchTerm} />
                </h3>
                {l.invoice_no && (
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Hash size={10}/> <Highlighter text={l.invoice_no} highlight={searchTerm} />
                    </span>
                )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Calendar size={12}/> {formatDate(l.date)}</span>
                {l.vehicle && (
                    <span className="flex items-center gap-1 text-slate-500">
                        <Truck size={12}/> <Highlighter text={l.vehicle} highlight={searchTerm} />
                    </span>
                )}
            </div>
        </div>
        <div className="text-right">
            <div className="text-base font-bold text-slate-900 tabular-nums">{formatCurrency(l.total_amount)}</div>
            <div className={`text-[10px] font-bold uppercase flex items-center justify-end gap-1 ${isPurchase ? 'text-orange-600' : 'text-blue-600'}`}>
                {l.payment_mode === 'online' ? <CreditCard size={10}/> : <Banknote size={10}/>}
                {l.payment_mode || 'Cash'}
            </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-2.5 flex items-center justify-between ml-2">
         <div className="flex items-center gap-2 text-xs text-slate-600">
            <Package size={14} className="text-slate-400"/>
            <span className="font-medium truncate max-w-[140px]">
                <Highlighter text={firstItem} highlight={searchTerm} />
            </span>
            {itemCount > 1 && <span className="text-[10px] bg-white border border-slate-200 text-slate-500 px-1.5 rounded-full font-bold">+{itemCount - 1} more</span>}
         </div>
         
         <div className="flex items-center gap-2">
            {/* WhatsApp Share Button */}
            <button onClick={handleShare} className="text-green-500 hover:text-green-600 p-1.5 bg-white rounded-full shadow-sm hover:shadow active:scale-95 transition-all">
                <Share2 size={14} />
            </button>
            {onPrint && (
                <button onClick={(e) => { e.stopPropagation(); onPrint(l); }} className="text-slate-400 hover:text-slate-800 p-1.5 bg-white rounded-full shadow-sm hover:shadow active:scale-95 transition-all">
                    <Printer size={14} />
                </button>
            )}
            <button onClick={() => onEdit(l)} className="text-slate-400 hover:text-blue-600 p-1.5 bg-white rounded-full shadow-sm hover:shadow transition-colors">
                <Edit2 size={14} />
            </button>
            {showDelete && (
                <button onClick={() => onDelete(l.id)} className="text-slate-400 hover:text-red-600 p-1.5 bg-white rounded-full shadow-sm hover:shadow transition-colors">
                    <Trash2 size={14} />
                </button>
            )}
         </div>
      </div>
    </div>
  );
};

export default LedgerCard;