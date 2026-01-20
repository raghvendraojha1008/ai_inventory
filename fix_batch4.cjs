const fs = require('fs');
const path = require('path');

const writeFile = (relPath, content) => {
    const fullPath = path.join(__dirname, relPath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content);
    console.log(`✨ Batch 4 (Highlighter): ${relPath}`);
};

// ---------------------------------------------------------
// 1. HIGHLIGHTER COMPONENT (New Utility)
// ---------------------------------------------------------
const highlighterContent = `import React from 'react';

interface HighlighterProps {
  text: string;
  highlight: string;
  className?: string;
}

export const Highlighter: React.FC<HighlighterProps> = ({ text, highlight, className = '' }) => {
  if (!highlight || !text) return <span className={className}>{text}</span>;

  const parts = text.toString().split(new RegExp(\`(\${highlight})\`, 'gi'));
  
  return (
    <span className={className}>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 text-slate-900 rounded-sm px-0.5 shadow-sm font-bold">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};`;

// ---------------------------------------------------------
// 2. UPDATE VEHICLE CARD (With Highlight & Haptics)
// ---------------------------------------------------------
const vehicleCardContent = `import React from 'react';
import { Edit2, Trash2, Phone, User, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { Highlighter } from '../common/Highlighter'; // Import

interface VehicleCardProps {
  v: any;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onSelect: (v: any) => void;
  showDelete?: boolean;
  searchTerm?: string; // Added prop
}

const VehicleCard: React.FC<VehicleCardProps> = ({ v, onEdit, onDelete, onSelect, showDelete = true, searchTerm = '' }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div onClick={() => onSelect(v)} className="cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-slate-800 uppercase bg-slate-100 px-2 py-1 rounded">
                <Highlighter text={v.vehicle_number} highlight={searchTerm} />
            </h3>
            <span className="text-xs text-slate-400">{formatDate(v.created_at)}</span>
          </div>
          <div className="space-y-1 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
                <User size={14} className="text-slate-400"/> 
                <Highlighter text={v.owner_name} highlight={searchTerm} />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={14} className="text-slate-400"/> 
                <Highlighter text={v.contact} highlight={searchTerm} />
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

export default VehicleCard;`;

// ---------------------------------------------------------
// 3. UPDATE PARTY CARD (With Highlight & Haptics)
// ---------------------------------------------------------
const partyCardContent = `import React from 'react';
import { Edit2, Trash2, Phone, MapPin } from 'lucide-react';
import { Highlighter } from '../common/Highlighter';

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
                <span className={\`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full \${p.role === 'customer' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}\`}>
                    {p.role}
                </span>
            </div>
          </div>
          <div className="space-y-1 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={14} className="text-slate-400"/> 
                <Highlighter text={p.contact || 'No Contact'} highlight={searchTerm} />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 truncate">
                <MapPin size={14} className="text-slate-400 flex-shrink-0"/> 
                <Highlighter text={p.city || p.address || 'No Address'} highlight={searchTerm} />
            </div>
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

export default PartyCard;`;

// ---------------------------------------------------------
// 4. UPDATE INVENTORY CARD (With Highlight & Haptics)
// ---------------------------------------------------------
const inventoryCardContent = `import React from 'react';
import { Edit2, Trash2, Package, Layers } from 'lucide-react';
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
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-base text-slate-800 line-clamp-1">
                <Highlighter text={i.name} highlight={searchTerm} />
            </h3>
            <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{i.unit}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
             <div className="p-2 bg-slate-50 rounded-lg">
                 <div className="text-[10px] text-slate-400 uppercase font-bold">Stock</div>
                 <div className="text-sm font-bold text-slate-800 flex items-center gap-1">
                    <Layers size={12} className="text-blue-500"/> {i.current_stock}
                 </div>
             </div>
             <div className="p-2 bg-slate-50 rounded-lg">
                 <div className="text-[10px] text-slate-400 uppercase font-bold">Rate</div>
                 <div className="text-sm font-bold text-slate-800 tabular-nums">
                    {formatCurrency(i.default_rate)}
                 </div>
             </div>
          </div>
      </div>
      
      <div className="flex gap-2 pt-2 border-t border-slate-50">
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

export default InventoryCard;`;

// ---------------------------------------------------------
// 5. UPDATE TRANSACTION ROW (With Highlight)
// ---------------------------------------------------------
const transactionRowContent = `import React from 'react';
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
        <div className={\`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 \${isReceived ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}\`}>
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
        <span className={\`text-sm font-bold tabular-nums \${isReceived ? 'text-green-600' : 'text-slate-800'}\`}>
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

export default TransactionRow;`;

// ---------------------------------------------------------
// 6. UPDATE VIEWS TO PASS SEARCH TERM
// ---------------------------------------------------------

const vehiclesViewContent = `import React, { useState, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import { Truck } from 'lucide-react';
import { ApiService } from '../../services/api';
import { ExportService } from '../../services/export';
import { usePaginatedData } from '../../hooks/usePaginatedData';
import { useUI } from '../../context/UIContext';
import { getCurrentMonthRange } from '../../utils/helpers';
import { AppSettings } from '../../types';
import { haptic } from '../../utils/haptics'; 
import Header from '../common/Header';
import FilterBar from '../common/FilterBar';
import VehicleCard from '../cards/VehicleCard';
import EmptyState from '../common/EmptyState';
import { LoadingStack } from '../common/Skeleton';

interface VehiclesViewProps {
  user: User;
  onEdit: (item: any, callback?: (data: any) => void) => void;
  onSelectVehicle: (vehicle: any) => void;
  appSettings?: AppSettings;
}

const VehiclesView: React.FC<VehiclesViewProps> = ({ user, onEdit, onSelectVehicle, appSettings }) => {
    const { showToast, confirm } = useUI();
    const [filter, setFilter] = useState('');
    const [dateRange, setDateRange] = useState(() => appSettings?.automation.enable_date_filter ? getCurrentMonthRange() : { start: '', end: '' });

    const config = useMemo(() => ({ sortField: 'created_at', searchField: 'vehicle_number', searchTerm: filter, dateFilter: dateRange }), [filter, dateRange]);
    const { data, loading, hasMore, loadMore, setData, refresh } = usePaginatedData(user.uid, 'vehicles', config);
    
    const handleEdit = (item: any) => { 
        haptic.medium();
        onEdit(item, (updatedData: any) => { 
            if (item) setData(prev => prev.map(p => p.id === item.id ? { ...p, ...updatedData } : p)); 
            else refresh(); 
        }); 
    };
    
    const handleDelete = useCallback(async (id: string) => { 
        if (!id) return;
        haptic.heavy();
        const confirmed = await confirm("Delete Vehicle", "Are you sure?");
        if (confirmed) { 
            try { 
                await ApiService.vehicles.delete(user.uid, id); 
                setData(prev => prev.filter(p => p.id !== id));
                showToast("Vehicle deleted successfully", "success");
                haptic.success();
            } catch (e: any) { 
                showToast("Failed to delete: " + e.message, "error"); 
                haptic.error();
            } 
        } 
    }, [user.uid, setData, confirm, showToast]);
  
    const handleExport = async (type: string) => {
        haptic.light();
        if (type === 'pdf') { 
            const columns = ['Vehicle No', 'Owner', 'Contact'];
            const pdfData = data.map(v => ({ 'Vehicle No': v.vehicle_number, Owner: v.owner_name, Contact: v.contact }));
            const res = await ExportService.toPDF(pdfData, "Vehicles Report", columns);
            if (res.success && res.path) showToast("PDF Saved", "success", "OPEN", () => ExportService.openFile(res.path!, 'application/pdf'));
            else showToast("PDF Failed", "error");
            return;
        }
        const result = await ExportService.toCSV(data, 'vehicle_list');
        if (result && result.success) showToast("File Saved!", "success", "OPEN", () => { if (result.path) ExportService.openFile(result.path, 'text/csv'); });
    };
  
    return (
      <div className="p-4 md:p-6 pb-20">
        <Header title="Vehicles" onExport={handleExport} onAdd={() => handleEdit(null)} count={data.length} />
        <FilterBar onSearch={setFilter} onDateChange={setDateRange} searchTerm={filter} dateRange={dateRange} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading && data.length === 0 ? <LoadingStack type="card" count={4} /> :
            data.map(v => (
              <VehicleCard 
                  key={v.id} 
                  v={v} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                  onSelect={onSelectVehicle} 
                  showDelete={appSettings?.automation.show_delete_btn ?? true}
                  searchTerm={filter}
              />
          ))}
        </div>
        
        {!loading && data.length === 0 && (
            <EmptyState 
                icon={Truck} 
                title="No Vehicles Found" 
                description={filter ? "No vehicles match your search." : "Start by adding your delivery vehicles to track expenses."} 
                actionLabel={filter ? "Clear Search" : "Add Vehicle"}
                onAction={filter ? () => setFilter('') : () => handleEdit(null)}
            />
        )}
        
        {hasMore && <button onClick={loadMore} className="w-full py-3 mt-4 bg-white border border-slate-200 shadow-sm rounded-lg hover:bg-slate-50 font-bold text-slate-600">Load More</button>}
      </div>
    );
};

export default VehiclesView;`;

const partiesViewContent = `import React, { useState, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import { Users } from 'lucide-react';
import { ApiService } from '../../services/api';
import { ExportService } from '../../services/export';
import { usePaginatedData } from '../../hooks/usePaginatedData';
import { useUI } from '../../context/UIContext';
import { getCurrentMonthRange } from '../../utils/helpers';
import { AppSettings } from '../../types';
import { haptic } from '../../utils/haptics';
import Header from '../common/Header';
import FilterBar from '../common/FilterBar';
import PartyCard from '../cards/PartyCard';
import EmptyState from '../common/EmptyState';
import { LoadingStack } from '../common/Skeleton';

interface PartiesViewProps {
  user: User;
  onEdit: (item: any, callback?: (data: any) => void) => void;
  roleFilter: 'customer' | 'supplier';
  title: string;
  onSelectParty: (party: any) => void;
  appSettings?: AppSettings;
}

const PartiesView: React.FC<PartiesViewProps> = ({ user, onEdit, roleFilter, title, onSelectParty, appSettings }) => {
  const { showToast, confirm } = useUI();
  const [filter, setFilter] = useState('');
  const [dateRange, setDateRange] = useState(() => appSettings?.automation.enable_date_filter ? getCurrentMonthRange() : { start: '', end: '' });

  const config = useMemo(() => ({ sortField: 'created_at', searchField: 'name', searchTerm: filter, dateFilter: dateRange }), [filter, dateRange]);
  const { data, loading, hasMore, loadMore, setData, refresh } = usePaginatedData(user.uid, 'parties', config);
  const filteredData = useMemo(() => data.filter(d => d.role === roleFilter), [data, roleFilter]);
  
  const handleEdit = (item: any) => { 
      haptic.medium();
      onEdit(item, (updatedData: any) => { 
          if (item) setData(prev => prev.map(p => p.id === item.id ? { ...p, ...updatedData } : p)); 
          else refresh(); 
      }); 
  };
  
  const handleDelete = useCallback(async (id: string) => { 
      if (!id) return;
      haptic.heavy();
      const confirmed = await confirm("Delete Party", "Are you sure?");
      if (confirmed) { 
          try { 
              await ApiService.parties.delete(user.uid, id); 
              setData(prev => prev.filter(p => p.id !== id));
              showToast("Party deleted successfully", "success");
              haptic.success();
          } catch (e: any) { 
              showToast("Failed to delete: " + e.message, "error");
              haptic.error();
          } 
      } 
  }, [user.uid, setData, confirm, showToast]);

  const handleExport = async (type: string) => {
      haptic.light();
      if (type === 'pdf') { 
          const columns = ['Name', 'Role', 'Contact', 'City'];
          const pdfData = filteredData.map(p => ({ Name: p.name, Role: p.role, Contact: p.contact, City: p.city || '-' }));
          const res = await ExportService.toPDF(pdfData, \`\${title} Report\`, columns);
          if (res.success && res.path) showToast("PDF Saved", "success", "OPEN", () => ExportService.openFile(res.path!, 'application/pdf'));
          else showToast("PDF Failed", "error");
          return;
      }
      const result = await ExportService.toCSV(filteredData, \`\${roleFilter}_list\`);
      if (result && result.success) showToast("File Saved!", "success", "OPEN", () => { if (result.path) ExportService.openFile(result.path, 'text/csv'); });
  };

  return (
    <div className="p-4 md:p-6 pb-20">
      <Header title={title} onExport={handleExport} onAdd={() => handleEdit(null)} count={filteredData.length} />
      <FilterBar onSearch={setFilter} onDateChange={setDateRange} searchTerm={filter} dateRange={dateRange} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && filteredData.length === 0 ? <LoadingStack type="card" count={4} /> :
          filteredData.map(p => (
            <PartyCard 
                key={p.id} 
                p={p} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
                onSelect={onSelectParty} 
                showDelete={appSettings?.automation.show_delete_btn ?? true}
                searchTerm={filter}
            />
        ))}
      </div>
      
      {!loading && filteredData.length === 0 && (
          <EmptyState 
              icon={Users} 
              title={\`No \${title} Found\`} 
              description={filter ? "Try changing your search terms." : \`Add your first \${roleFilter} to start tracking.\`} 
              actionLabel={filter ? "Clear Search" : "Add New"}
              onAction={filter ? () => setFilter('') : () => handleEdit(null)}
          />
      )}
      
      {hasMore && <button onClick={loadMore} className="w-full py-3 mt-4 bg-white border border-slate-200 shadow-sm rounded-lg hover:bg-slate-50 font-bold text-slate-600">Load More</button>}
    </div>
  );
};

export default PartiesView;`;

const inventoryViewContent = `import React, { useState, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import { Package } from 'lucide-react';
import { ApiService } from '../../services/api';
import { ExportService } from '../../services/export';
import { usePaginatedData } from '../../hooks/usePaginatedData';
import { useUI } from '../../context/UIContext';
import { getCurrentMonthRange } from '../../utils/helpers';
import { AppSettings } from '../../types';
import { haptic } from '../../utils/haptics';
import Header from '../common/Header';
import FilterBar from '../common/FilterBar';
import InventoryCard from '../cards/InventoryCard';
import EmptyState from '../common/EmptyState';
import { LoadingStack } from '../common/Skeleton'; 

interface InventoryViewProps {
  user: User;
  onEdit: (item: any, callback?: (data: any) => void) => void;
  appSettings?: AppSettings;
}

const InventoryView: React.FC<InventoryViewProps> = ({ user, onEdit, appSettings }) => {
  const { showToast, confirm } = useUI();
  const [filter, setFilter] = useState('');
  const [dateRange, setDateRange] = useState(() => appSettings?.automation.enable_date_filter ? getCurrentMonthRange() : { start: '', end: '' });
  
  const config = useMemo(() => ({ sortField: 'created_at', searchField: 'name', searchTerm: filter, dateFilter: dateRange }), [filter, dateRange]);
  const { data, loading, hasMore, loadMore, setData, refresh } = usePaginatedData(user.uid, 'inventory', config);
  
  const handleEdit = (item: any) => { 
      haptic.medium();
      onEdit(item, (updatedData: any) => { if (item) setData(prev => prev.map(p => p.id === item.id ? { ...p, ...updatedData } : p)); else refresh(); }); 
  };
  
  const handleDelete = useCallback(async (id: string) => { 
      if (!id) return;
      haptic.heavy();
      const confirmed = await confirm("Delete Item", "Are you sure?");
      if (confirmed) { 
          try { await ApiService.inventory.delete(user.uid, id); setData(prev => prev.filter(p => p.id !== id)); showToast("Item deleted successfully", "success"); haptic.success(); } 
          catch (e: any) { showToast("Failed to delete: " + e.message, "error"); haptic.error(); } 
      } 
  }, [user.uid, setData, confirm, showToast]);
  
  const handleExport = async (type: string) => {
      haptic.light();
      if (type === 'pdf') { 
          const columns = ['Name', 'Stock', 'Unit', 'Rate', 'HSN'];
          const pdfData = data.map(i => ({ Name: i.name, Stock: i.current_stock, Unit: i.unit, Rate: i.default_rate, HSN: i.hsn_code || '-' }));
          const res = await ExportService.toPDF(pdfData, "Inventory Report", columns);
          if (res.success && res.path) showToast("PDF Saved", "success", "OPEN", () => ExportService.openFile(res.path!, 'application/pdf'));
          else showToast("PDF Failed", "error");
          return;
      }
      const result = await ExportService.toCSV(data, 'inventory_list');
      if (result && result.success) showToast("File Saved!", "success", "OPEN", () => { if (result.path) ExportService.openFile(result.path, 'text/csv'); });
  };

  return (
    <div className="p-4 md:p-6 pb-20">
      <Header title="Inventory" onExport={handleExport} onAdd={() => handleEdit(null)} count={data.length} />
      <FilterBar onSearch={setFilter} onDateChange={setDateRange} searchTerm={filter} dateRange={dateRange} />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && data.length === 0 
            ? <LoadingStack type="card" count={4} /> 
            : data.map(i => (
                <InventoryCard 
                    key={i.id} 
                    i={i} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                    showDelete={appSettings?.automation.show_delete_btn ?? true}
                    searchTerm={filter}
                />
            ))
        }
      </div>
      
      {!loading && data.length === 0 && <EmptyState icon={Package} title="Inventory Empty" description="Add your products to track stock." actionLabel="Add Item" onAction={() => handleEdit(null)} />}
      
      {hasMore && <button onClick={loadMore} className="w-full py-3 mt-4 bg-white border border-slate-200 shadow-sm rounded-lg hover:bg-slate-50 font-bold text-slate-600">Load More</button>}
    </div>
  );
};

export default InventoryView;`;

const transactionsViewContent = `import React, { useState, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import { AlertCircle } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { AppSettings } from '../../types';
import { ApiService } from '../../services/api';
import { ExportService } from '../../services/export';
import { usePaginatedData } from '../../hooks/usePaginatedData';
import { getCurrentMonthRange, formatDate } from '../../utils/helpers';
import { useUI } from '../../context/UIContext';
import Header from '../common/Header';
import FilterBar from '../common/FilterBar';
import TransactionRow from '../cards/TransactionRow';
import { LoadingStack } from '../common/Skeleton'; 
import { PullToRefresh } from '../common/PullToRefresh';

interface TransactionsViewProps {
  user: User;
  onEdit: (item: any, callback?: (data: any) => void) => void;
  appSettings: AppSettings;
}

const TransactionsView: React.FC<TransactionsViewProps> = ({ user, onEdit, appSettings }) => {
  const { showToast, confirm } = useUI();
  const [filter, setFilter] = useState(''); 
  const [dateRange, setDateRange] = useState(() => appSettings.automation.enable_date_filter ? getCurrentMonthRange() : { start: '', end: '' });
  const [typeFilter, setTypeFilter] = useState<'all' | 'received' | 'paid'>('all');
  
  const config = useMemo(() => ({ sortField: 'date', searchField: 'party_name', searchTerm: filter, dateFilter: dateRange }), [filter, dateRange]);
  const { data, loading, hasMore, idxErr, loadMore, setData, refresh } = usePaginatedData(user.uid, 'transactions', config);
  const filteredData = useMemo(() => data.filter(item => typeFilter === 'all' || item.type === typeFilter), [data, typeFilter]);
  
  const subSwipeHandlers = useSwipeable({
      onSwipedLeft: () => { if (typeFilter === 'all') setTypeFilter('received'); else if (typeFilter === 'received') setTypeFilter('paid'); },
      onSwipedRight: () => { if (typeFilter === 'paid') setTypeFilter('received'); else if (typeFilter === 'received') setTypeFilter('all'); },
      preventScrollOnSwipe: true, trackMouse: false
  });

  const handleExport = async (type: string) => { 
      if (type === 'pdf') { 
          const columns = ['Date', 'Type', 'Party', 'Amount', 'Mode'];
          const pdfData = filteredData.map(t => ({ Date: formatDate(t.date), Type: t.type, Party: t.party_name, Amount: t.amount, Mode: t.payment_mode }));
          const res = await ExportService.toPDF(pdfData, "Transactions Report", columns);
          if (res.success && res.path) showToast("PDF Saved", "success", "OPEN", () => ExportService.openFile(res.path!, 'application/pdf'));
          else showToast("PDF Failed", "error");
          return; 
      }
      ExportService.toCSV(filteredData, 'transactions'); 
  };
  
  const handleEdit = (item: any) => { 
      onEdit(item, (updatedData: any) => { if (item) setData(prev => prev.map(p => p.id === item.id ? { ...p, ...updatedData } : p)); else refresh(); }); 
  };
  
  const handleDelete = useCallback(async (id: string) => { 
      if (!id) return;
      const confirmed = await confirm("Delete Transaction", "Are you sure?");
      if (confirmed) { 
          try { await ApiService.transactions.delete(user.uid, id); setData(prev => prev.filter(p => p.id !== id)); showToast("Transaction deleted successfully", "success"); } 
          catch(e: any) { showToast("Failed to delete: " + e.message, "error"); } 
      } 
  }, [user.uid, setData, confirm, showToast]);

  return (
    <PullToRefresh onRefresh={refresh}>
        <div className="p-4 md:p-6 pb-20">
          <Header title="Transactions" onExport={handleExport} onAdd={() => handleEdit(null)} count={filteredData.length} />
          
          <div {...subSwipeHandlers} className="mb-4">
              <div className="flex gap-2 overflow-x-auto pb-2 no-print touch-pan-x">
                  {['all', 'received', 'paid'].map(t => (
                     <button key={t} onClick={() => setTypeFilter(t as any)} className={\`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all whitespace-nowrap \${typeFilter === t ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}\`}>{t}</button>
                  ))}
              </div>
              <FilterBar onSearch={setFilter} onDateChange={setDateRange} searchTerm={filter} dateRange={dateRange} />
          </div>

          {idxErr && <div className="p-4 mb-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200 flex items-center gap-2"><AlertCircle size={20}/> Index missing.</div>}
          
          <div className="grid gap-3">
            {loading && data.length === 0 
                ? <LoadingStack type="row" count={6} /> 
                : filteredData.map(t => (
                    <TransactionRow 
                        key={t.id} 
                        t={t} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete} 
                        showDelete={appSettings.automation.show_delete_btn ?? true} 
                        searchTerm={filter}
                    />
                ))
            }
          </div>
          {!loading && hasMore && <button onClick={loadMore} className="w-full py-3 mt-4 bg-white border border-slate-200 shadow-sm rounded-lg hover:bg-slate-50 text-slate-600 font-medium">Load More</button>}
        </div>
    </PullToRefresh>
  );
};
export default TransactionsView;`;

// ---------------------------------------------------------
// APPLY UPDATES
// ---------------------------------------------------------
writeFile('src/components/common/Highlighter.tsx', highlighterContent);
writeFile('src/components/cards/VehicleCard.tsx', vehicleCardContent);
writeFile('src/components/cards/PartyCard.tsx', partyCardContent);
writeFile('src/components/cards/InventoryCard.tsx', inventoryCardContent);
writeFile('src/components/cards/TransactionRow.tsx', transactionRowContent);
writeFile('src/components/views/VehiclesView.tsx', vehiclesViewContent);
writeFile('src/components/views/PartiesView.tsx', partiesViewContent);
writeFile('src/components/views/InventoryView.tsx', inventoryViewContent);
writeFile('src/components/views/TransactionsView.tsx', transactionsViewContent);

console.log('✨ Batch 4 Complete: Search Highlighting applied!');