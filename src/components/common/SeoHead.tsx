import { useEffect } from 'react';

const SeoHead = () => {
  useEffect(() => {
    document.title = "AI Shopkeeper Ledger - Enterprise Edition";
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page { size: A4; margin: 1cm; }
        html, body { height: auto !important; overflow: visible !important; background: white !important; font-size: 10pt; color: black; font-family: sans-serif; }
        .no-print, .fixed, button, input, select, textarea, .bg-slate-900, .bg-blue-600, nav { display: none !important; }
        .print-only { display: block !important; }
        #root, main, .flex-1, .h-screen { 
            position: static !important; 
            width: 100% !important; 
            height: auto !important; 
            overflow: visible !important; 
            padding: 0 !important; 
            margin: 0 !important; 
            display: block !important;
        }
        .card, .bg-white { box-shadow: none; border: 1px solid #ccc; break-inside: avoid; margin-bottom: 10px; }
        .grid { display: block !important; }
        .grid > * { margin-bottom: 10px; break-inside: avoid; }
        h2 { border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 15px; }
      }
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);
  return null;
};

export default SeoHead;