import React from 'react';
import { Edit2, Trash2, Phone, User, Truck, Car } from 'lucide-react'; // Fixed: Replaced SteeringWheel with Car
import { formatDate } from '../../utils/helpers';
import { Highlighter } from '../common/Highlighter'; 

interface VehicleCardProps {
  v: any;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onSelect: (v: any) => void;
  showDelete?: boolean;
  searchTerm?: string;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ v, onEdit, onDelete, onSelect, showDelete = true, searchTerm = '' }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div onClick={() => onSelect(v)} className="cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            <div>
                <h3 className="font-bold text-lg text-slate-800 uppercase bg-slate-100 px-2 py-1 rounded inline-block">
                    <Highlighter text={v.vehicle_number} highlight={searchTerm} />
                </h3>
                {v.vehicle_model && (
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Car size={12} className="text-slate-400"/>
                        {v.vehicle_model}
                    </div>
                )}
            </div>
            <span className="text-xs text-slate-400">{formatDate(v.created_at)}</span>
          </div>
          
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
                <User size={14} className="text-slate-400"/> 
                <span className="text-slate-400 text-xs uppercase mr-1">Owner:</span>
                <Highlighter text={v.owner_name} highlight={searchTerm} />
            </div>
            {v.driver_name && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Truck size={14} className="text-slate-400"/>
                    <span className="text-slate-400 text-xs uppercase mr-1">Driver:</span>
                    <Highlighter text={v.driver_name} highlight={searchTerm} />
                </div>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={14} className="text-slate-400"/> 
                <Highlighter text={v.contact || 'No Contact'} highlight={searchTerm} />
            </div>
          </div>
      </div>
      
      <div className="flex gap-2 pt-3 border-t border-slate-50">
        <button onClick={() => onEdit(v)} className="flex-1 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors">
            <Edit2 size={14}/> Edit
        </button>
        {showDelete && (
            <button onClick={() => onDelete(v.id)} className="flex-1 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2 transition-colors">
                <Trash2 size={14}/> Delete
            </button>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;