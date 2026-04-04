// src/contextapi/ToastContext.jsx
import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { X, BadgeCheck, CircleAlert, Info, TriangleAlert } from 'lucide-react';

const ToastContext = createContext(null);

// Ensure this is a NAMED EXPORT
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider />");
  return ctx;
};

function Toasts({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => {
        let Icon = Info;
        let theme = { 
          border: "border-indigo-400", 
          icon: "text-indigo-400", 
          progress: "bg-indigo-400" 
        };

        if (t.type === 'success') {
          Icon = BadgeCheck;
          theme = { border: "border-green-500", icon: "text-green-500", progress: "bg-green-500" };
        } else if (t.type === 'error') {
          Icon = CircleAlert;
          theme = { border: "border-red-500", icon: "text-red-500", progress: "bg-red-500" };
        } else if (t.type === 'warning') {
          Icon = TriangleAlert;
          theme = { border: "border-yellow-500", icon: "text-yellow-500", progress: "bg-yellow-500" };
        }

        return (
          <div key={t.id} className="relative w-72 bg-white rounded-md shadow-lg border border-slate-200 overflow-hidden pointer-events-auto">
            {/* Top Accent Line */}
            <div className={`h-1.5 w-full ${theme.border}`} />
            
            <div className="px-4 py-4 flex items-center gap-3">
              <Icon className={`w-6 h-6 flex-shrink-0 ${theme.icon}`} />
              <span className="flex-1 text-sm font-semibold text-slate-700">{t.message}</span>
              <button onClick={() => remove(t.id)} className="text-slate-300 hover:text-slate-500 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar Animation */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-100">
              <div 
                className={`h-full ${theme.progress}`}
                style={{ animation: `toast-progress ${t.ttl || 3500}ms linear forwards` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((type, message, ttl = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, ttl }]);
    setTimeout(() => removeToast(id), ttl);
  }, [removeToast]);

  const api = useMemo(() => ({
    success: (msg) => pushToast("success", msg),
    error: (msg) => pushToast("error", msg),
    warning: (msg) => pushToast("warning", msg),
    info: (msg) => pushToast("info", msg),
  }), [pushToast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toasts toasts={toasts} remove={removeToast} />
    </ToastContext.Provider>
  );
}
