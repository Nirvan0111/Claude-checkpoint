import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export type ToastTone = 'success' | 'info' | 'warn';

export interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  show: (message: string, tone?: ToastTone) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const TONE_ICON: Record<ToastTone, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-700" strokeWidth={1.75} />,
  info: <AlertCircle className="w-4 h-4 text-stone-700" strokeWidth={1.75} />,
  warn: <XCircle className="w-4 h-4 text-amber-700" strokeWidth={1.75} />,
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setItems((prev) => [...prev, { id, message, tone }]);
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const timers = items.map((item) =>
      window.setTimeout(() => {
        setItems((prev) => prev.filter((p) => p.id !== item.id));
      }, 2600)
    );
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [items]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none"
        data-testid="toast-region"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className="toast-enter pointer-events-auto flex items-center gap-2.5 bg-white border border-line rounded-xl px-4 py-2.5 shadow-panel text-sm text-ink-900 max-w-sm"
            data-testid={`toast-${t.tone}`}
          >
            {TONE_ICON[t.tone]}
            <span className="font-medium">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
