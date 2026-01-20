import React from 'react';
import { Edit2, Trash2, Phone, MapPin, CreditCard } from 'lucide-react';
import { Highlighter } from '../common/Highlighter';
import { formatCurrency } from '../../utils/helpers';

interface PartyCardProps {
  p: any;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onSelect: (p: any) => void;
  showDelete?: boolean;
  searchTerm?: string;
}

const PartyCard: React.FC<PartyCardProps> = ({ p, onEdit, onDelete, onSelect, showDelete = true, searchTerm = '' }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div onClick={() => onSelect(p)} className="cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            <div>
                <h3 className="font-bold text-lg text-slate-800">
                    <Highlighter text={p.name} highlight={searchTerm} />
                </h3>
                {p.gstin && <span className="text-[10px] text-slate-400 font-mono block">GSTIN: <Highlighter text={p.gstin} highlight={searchTerm} /></span>}
            </div>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${p.role === 'customer' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                {p.role}
            </span>
          </div>
          
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={14} className="text-slate-400"/> 
                <Highlighter text={p.contact || 'No Contact'} highlight={searchTerm} />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 truncate">
                <MapPin size={14} className="text-slate-400 flex-shrink-0"/> 
                <Highlighter text={p.city || p.address || 'No Address'} highlight={searchTerm} />
            </div>
            {p.opening_balance > 0 && (
                <div className="flex items-center gap-2 text-xs text-orange-600 font-medium">
                    <CreditCard size={12} /> Op. Bal: {formatCurrency(p.opening_balance)}
                </div>
            )}
          </div>
      </div>
      
      <div className="flex gap-2 pt-3 border-t border-slate-50">
        <button onClick={() => onEdit(p)} className="flex-1 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors">
            <Edit2 size={14}/> Edit
        </button>
        {showDelete && (
            <button onClick={() => onDelete(p.id)} className="flex-1 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2 transition-colors">
                <Trash2 size={14}/> Delete
            </button>
        )}
      </div>
    </div>
  );
};

export default PartyCard;