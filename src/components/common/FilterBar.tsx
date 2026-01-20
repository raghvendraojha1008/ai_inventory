import React, { useState, useEffect } from 'react';
import { Search, Calendar, X } from 'lucide-react';
import { useDebounce } from '../../hooks/usePaginatedData'; 

interface FilterBarProps {
  onSearch: (term: string) => void;
  onDateChange: (range: { start: string, end: string }) => void;
  searchTerm?: string;
  dateRange?: { start: string, end: string };
}

const FilterBar: React.FC<FilterBarProps> = ({ onSearch, onDateChange, searchTerm, dateRange }) => {
  const [val, setVal] = useState(searchTerm || '');
  const dbVal = useDebounce(val, 400); 

  useEffect(() => { if (dbVal !== undefined) onSearch(dbVal); }, [dbVal, onSearch]);

  const hasDateFilter = dateRange?.start || dateRange?.end;

  // Helper to handle date clearing
  const clearDates = () => {
      onDateChange && onDateChange({ start: '', end: '' });
  };

  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 mb-4 flex flex-col gap-3 no-print">
      {/* Search Input */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input 
          className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm transition-all" 
          placeholder="Search records..." 
          value={val} 
          onChange={e => setVal(e.target.value)} 
        />
        {val && (
          <button onClick={() => setVal('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
      </div>
      
      {/* Date Range - With Placeholder Logic */}
      <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
        <div className="flex items-center justify-center pl-1 text-slate-500">
            <Calendar size={16}/>
        </div>
        
        <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
                <span className="absolute top-0 left-0 text-[9px] font-bold text-slate-400 uppercase pointer-events-none">From</span>
                <input 
                  type={dateRange?.start ? "date" : "text"} 
                  onFocus={(e) => e.target.type = 'date'} 
                  onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                  placeholder="DD-MM-YYYY"
                  className="w-full bg-transparent border-0 p-0 pt-3 text-xs font-bold text-slate-800 focus:ring-0 h-8 placeholder:text-slate-400"
                  value={dateRange?.start || ''} 
                  onChange={e => onDateChange && onDateChange({ ...dateRange!, start: e.target.value })}
                />
            </div>
            <div className="w-px h-6 bg-slate-300"></div>
            <div className="relative flex-1">
                <span className="absolute top-0 left-0 text-[9px] font-bold text-slate-400 uppercase pointer-events-none">To</span>
                <input 
                  type={dateRange?.end ? "date" : "text"}
                  onFocus={(e) => e.target.type = 'date'} 
                  onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                  placeholder="DD-MM-YYYY"
                  className="w-full bg-transparent border-0 p-0 pt-3 text-xs font-bold text-slate-800 focus:ring-0 h-8 placeholder:text-slate-400"
                  value={dateRange?.end || ''} 
                  onChange={e => onDateChange && onDateChange({ ...dateRange!, end: e.target.value })}
                />
            </div>
        </div>
        
        {hasDateFilter && (
            <button 
                onClick={clearDates}
                className="p-1.5 bg-slate-200 rounded-full text-slate-500 hover:bg-slate-300 transition-colors"
            >
                <X size={12} />
            </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;