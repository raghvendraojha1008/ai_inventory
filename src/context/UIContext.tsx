import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast, { ToastType } from '../components/common/Toast';
import ConfirmDialog from '../components/common/ConfirmDialog';

// UPDATED INTERFACE: Added onAction and actionLabel
interface ToastData { 
    id: string; 
    message: string; 
    type: ToastType; 
    actionLabel?: string;
    onAction?: () => void;
}

interface UIContextType {
  // Update function signature
  showToast: (message: string, type?: ToastType, actionLabel?: string, onAction?: () => void) => void;
  confirm: (title: string, message: string) => Promise<boolean>;
}

const UIContext = createContext<UIContextType | null>(null);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  // ... confirm state logic (keep existing) ...
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    resolve: ((value: boolean) => void) | null;
  }>({ isOpen: false, title: '', message: '', resolve: null });

  // UPDATED: showToast now accepts action parameters
  const showToast = useCallback((message: string, type: ToastType = 'success', actionLabel?: string, onAction?: () => void) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, actionLabel, onAction }]);
  }, []);

  const closeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ... confirm logic (keep existing) ...
  const confirm = useCallback((title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({ isOpen: true, title, message, resolve });
    });
  }, []);
  const handleConfirm = () => { if (confirmState.resolve) confirmState.resolve(true); setConfirmState(prev => ({ ...prev, isOpen: false })); };
  const handleCancel = () => { if (confirmState.resolve) confirmState.resolve(false); setConfirmState(prev => ({ ...prev, isOpen: false })); };

  return (
    <UIContext.Provider value={{ showToast, confirm }}>
      {children}
      <div className="fixed top-5 right-5 z-[70] flex flex-col gap-2 pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-2">
            {toasts.map(t => (
                // Passing action props to Toast component
                <Toast key={t.id} {...t} onClose={closeToast} />
            ))}
        </div>
      </div>
      <ConfirmDialog isOpen={confirmState.isOpen} title={confirmState.title} message={confirmState.message} onConfirm={handleConfirm} onCancel={handleCancel} />
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within a UIProvider");
  return context;
};