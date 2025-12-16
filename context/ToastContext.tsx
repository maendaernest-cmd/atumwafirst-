import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, Bell, MessageCircle, DollarSign } from 'lucide-react';

type ToastType = 'success' | 'alert' | 'message' | 'earnings';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (title: string, message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((title: string, message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    
    // Auto dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4 md:px-0">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`pointer-events-auto w-full p-4 rounded-xl shadow-xl border flex items-start gap-3 animate-in slide-in-from-right duration-300 ${
              toast.type === 'alert' ? 'bg-white border-l-4 border-l-red-500 border-y-red-100 border-r-red-100' :
              toast.type === 'message' ? 'bg-white border-l-4 border-l-blue-500 border-y-blue-100 border-r-blue-100' :
              toast.type === 'earnings' ? 'bg-white border-l-4 border-l-green-500 border-y-green-100 border-r-green-100' :
              'bg-white border-slate-200'
            }`}
          >
             <div className={`p-2 rounded-full flex-shrink-0 ${
                 toast.type === 'alert' ? 'bg-red-50 text-red-600' :
                 toast.type === 'message' ? 'bg-blue-50 text-blue-600' :
                 toast.type === 'earnings' ? 'bg-green-50 text-green-600' :
                 'bg-slate-100 text-slate-600'
             }`}>
                {toast.type === 'alert' && <Bell size={20} />}
                {toast.type === 'message' && <MessageCircle size={20} />}
                {toast.type === 'earnings' && <DollarSign size={20} />}
                {toast.type === 'success' && <CheckCircle size={20} />}
             </div>
             <div className="flex-1 min-w-0">
                 <h4 className={`font-bold text-sm truncate ${
                     toast.type === 'alert' ? 'text-red-900' : 
                     toast.type === 'message' ? 'text-blue-900' :
                     toast.type === 'earnings' ? 'text-green-900' : 'text-slate-900'
                 }`}>{toast.title}</h4>
                 <p className="text-xs text-slate-600 mt-1 leading-relaxed">{toast.message}</p>
             </div>
             <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                 <X size={14} />
             </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};