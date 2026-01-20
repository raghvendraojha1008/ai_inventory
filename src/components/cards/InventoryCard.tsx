import React from 'react';
import { Edit2, Trash2, Package, Layers, AlertTriangle, Tag, IndianRupee } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { Highlighter } from '../common/Highlighter';

interface InventoryCardProps {
  i: any;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  showDelete?: boolean;
  searchTerm?: string;
}

const InventoryCard: React.FC<InventoryCardProps> = ({ i, onEdit, onDelete, showDelete = true, searchTerm = '' }) => {
  const minStock = i.min_stock || 5;
  const isLowStock = (i.current_stock || 0) <= minStock;
  // Fallback for old data: use default_rate if sale_rate is missing
  const saleRate = i.sale_rate || i.default_rate || 0;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
      {isLowStock && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg z-10 flex items-center gap-1">
              <AlertTriangle size={10} /> LOW
          </div>
      )}
      <div>
          <div className="flex justify-between items-start mb-2">
            <div>
                <h3 className="font-bold text-base text-slate-800 line-clamp-1 pr-2">
                    <Highlighter text={i.name} highlight={searchTerm} />
                </h3>
                {i.hsn_code && <span className="text-[10px] text-slate-400 font-mono">HSN: {i.hsn_code}</span>}
            </div>
            <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600 flex-shrink-0">{i.unit}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-2">
             <div className={`p-2 rounded-lg ${isLowStock ? 'bg-red-50 border border-red-100' : 'bg-slate-50'}`}>
                 <div className={`text-[10px] uppercase font-bold ${isLowStock ? 'text-red-500' : 'text-slate-400'}`}>Stock</div>
                 <div className={`text-sm font-bold flex items-center gap-1 ${isLowStock ? 'text-red-700' : 'text-slate-800'}`}>
                    <Layers size={12} className={isLowStock ? 'text-red-500' : 'text-blue-500'}/> {i.current_stock}
                 </div>
             </div>
             <div className="p-2 bg-green-50 rounded-lg">
                 <div className="text-[10px] text-green-600 uppercase font-bold">Sell Price</div>
                 <div className="text-sm font-bold text-green-800 tabular-nums">
                    {formatCurrency(saleRate)}
                 </div>
             </div>
          </div>
          
          {/* Detailed Info Row */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Buy: {formatCurrency(i.purchase_rate || 0)}</span>
              <span>GST: {i.gst_percent || 0}%</span>
          </div>
      </div>
      
      <div className="flex gap-2 pt-3 border-t border-slate-50 mt-2">
        <button onClick={() => onEdit(i)} className="flex-1 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors">
            <Edit2 size={14}/> Edit
        </button>
        {showDelete && (
            <button onClick={() => onDelete(i.id)} className="flex-1 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2 transition-colors">
                <Trash2 size={14}/> Delete
            </button>
        )}
      </div>
    </div>
  );
};

export default InventoryCard;