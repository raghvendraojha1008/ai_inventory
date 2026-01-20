import React from 'react';
import { Wallet, Edit2, Trash2 } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/helpers';

interface ExpenseRowProps {
  e: any;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}

const ExpenseRow: React.FC<ExpenseRowProps> = React.memo(({ e, onEdit, onDelete }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex justify-between items-center hover:bg-slate-50">
    <div className="flex items-center gap-3">
      <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Wallet size={20}/></div>
      <div>
        <h4 className="font-bold capitalize text-slate-800">{e.type} Expense</h4>
        <div className="text-xs text-slate-500">{e.note}</div>
        {e.type === 'salary' && <div className="text-xs font-semibold text-blue-600 mt-1">To: {e.employee_name}</div>}
      </div>
    </div>
    <div className="text-right">
      <div className="font-bold text-red-600 text-lg">-{formatCurrency(e.amount)}</div>
      <div className="text-xs text-slate-400">{formatDate(e.date)}</div>
      <div className="flex justify-end gap-2 mt-1 no-print">
        <button onClick={() => onEdit(e)} className="text-blue-500 p-1 hover:bg-blue-50 rounded"><Edit2 size={14}/></button>
        <button onClick={(ev) => { ev.stopPropagation(); onDelete(e.id); }} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={14}/></button>
      </div>
    </div>
  </div>
));

export default ExpenseRow;