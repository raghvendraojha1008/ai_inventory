import React, { useState, useRef, useEffect } from 'react';
import { List } from 'lucide-react';

interface SuggestionsInputProps {
  value: string;
  onChange: (e: any) => void;
  placeholder: string;
  list?: any[];
  displayKey?: string;
}

const SuggestionsInput: React.FC<SuggestionsInputProps> = React.memo(({ value, onChange, placeholder, list = [], displayKey = 'name' }) => {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
      <div className="relative w-full min-w-0" ref={ref}>
          <div className="flex w-full">
              <input 
                type="text" 
                placeholder={placeholder} 
                className="flex-1 min-w-0 border p-3 rounded-l-lg font-bold outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" 
                value={value} 
                onChange={onChange}
                onFocus={() => setShow(true)} 
              />
              <button type="button" onClick={() => setShow(!show)} className="bg-slate-100 border border-l-0 px-3 rounded-r-lg hover:bg-slate-200 text-slate-500 flex-shrink-0">
                <List size={16}/>
              </button>
          </div>
          {show && list.length > 0 && (
              <div className="absolute z-50 left-0 right-0 bg-white border rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                  {list.map((item: any, i: number) => (
                      <div key={i} onClick={() => { 
                          onChange({ target: { value: item[displayKey] } }); 
                          setShow(false); 
                      }} className="p-3 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0 text-slate-700">
                          {item[displayKey]}
                      </div>
                  ))}
              </div>
          )}
      </div>
  );
});

export default SuggestionsInput;