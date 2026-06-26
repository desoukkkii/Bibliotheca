import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ToastItem, ToastType } from "../types";

interface ToastContextValue {
  addToast: (msg: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (msg: string, type: ToastType = "info") => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, msg, type }]);
      setTimeout(() => removeToast(id), 3500);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-3 sm:top-4 left-3 right-3 sm:left-auto sm:right-4 z-[999] flex flex-col gap-2.5 pointer-events-none max-w-[380px] sm:w-full">
        {toasts.map((t) => {
          const config: Record<string, { bg: string; text: string; border: string; icon: string; bar: string }> = {
            info: { bg: "bg-white", text: "text-blue-700", border: "border-blue-200", icon: "fa-circle-info", bar: "bg-blue-500" },
            s: { bg: "bg-white", text: "text-green-700", border: "border-green-200", icon: "fa-circle-check", bar: "bg-green-500" },
            e: { bg: "bg-white", text: "text-red-600", border: "border-red-200", icon: "fa-circle-exclamation", bar: "bg-red-500" },
            w: { bg: "bg-white", text: "text-amber-700", border: "border-amber-200", icon: "fa-triangle-exclamation", bar: "bg-amber-500" },
          };
          const c = config[t.type] || config.info;
          return (
            <div
              key={t.id}
              className={`flex items-start gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-3 rounded-lg ${c.bg} ${c.text} shadow-lg border ${c.border} animate-toast-in pointer-events-auto relative overflow-hidden`}
            >
              <i aria-hidden="true" className={`fa-solid ${c.icon} text-sm shrink-0 mt-0.5`} />
              <span className="text-xs sm:text-[0.83rem] font-medium leading-snug flex-1">{t.msg}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-current opacity-40 hover:opacity-100 transition-opacity duration-[0.15s] bg-transparent border-none cursor-pointer p-1 min-touch flex items-center justify-center"
                aria-label="Dismiss"
              >
                <i aria-hidden="true" className="fa-solid fa-xmark text-sm" />
              </button>
              <div className={`absolute bottom-0 left-0 h-[3px] ${c.bar} animate-toast-bar rounded-full`} />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
