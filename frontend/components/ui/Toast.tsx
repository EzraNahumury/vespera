"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; kind: ToastKind; message: string };

type ToastContextValue = {
  toast: (kind: ToastKind, message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const ICONS = {
  success: <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />,
  error: <XCircle className="w-4 h-4 text-red-500" />,
  info: <Info className="w-4 h-4 text-black/50" />,
};

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const toast = useCallback((kind: ToastKind, message: string) => {
    const id = ++counter;
    setToasts(t => [...t, { id, kind, message }]);
    setTimeout(() => remove(id), 5000);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            className="flex items-center gap-3 bg-white rounded-xl border border-black/5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-4 py-3"
          >
            {ICONS[t.kind]}
            <span className="text-sm text-black/80 flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="text-black/30 hover:text-black/60 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
