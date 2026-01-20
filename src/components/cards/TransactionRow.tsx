import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Edit2, Trash2, Calendar } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { Highlighter } from '../common/Highlighter';

interface TransactionRowProps {
  t: any;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  showDelete?: boolean;
  searchTerm?: string;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ t, onEdit, onDelete, showDelete = true, searchTerm = '' }) => {
  const isReceived = t.type === 'received';
  
  return (
    <div className="group bg-white rounded-lg p-3 border border-slate-100 hover:border-blue-200 transition-all shadow-sm hover:shadow-md flex items-center justify-between gap-3">
      {/* Icon & Main Info */}
      <div className="flex items-center gap-3 overflow-hidden flex-1">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isReceived ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {isReceived ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-800 truncate">
                <Highlighter text={t.party_name} highlight={searchTerm} />
            </h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium uppercase tracking-wide">
              {t.payment_mode}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-slate-400 flex items-center gap-1">
               <Calendar size={10}/> {formatDate(t.date)}
            </span>
            {t.notes && (
                <span className="text-xs text-slate-400 truncate max-w-[120px] border-l border-slate-200 pl-2">
                    <Highlighter text={t.notes} highlight={searchTerm} />
                </span>
            )}
          </div>
        </div>
      </div>

      {/* Amount & Actions */}
      <div className="text-right flex flex-col items-end">
        <span className={`text-sm font-bold tabular-nums ${isReceived ? 'text-green-600' : 'text-slate-800'}`}>
          {isReceived ? '+' : '-'}{formatCurrency(t.amount)}
        </span>
        
        {/* Actions are always visible on touch, or hover on desktop */}
        <div className="flex items-center gap-3 mt-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(t)} className="text-slate-400 hover:text-blue-600 transition-colors p-1">
            <Edit2 size={16} />
          </button>
          {showDelete && (
              <button onClick={() => onDelete(t.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1">
                <Trash2 size={16} />
              </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionRow;