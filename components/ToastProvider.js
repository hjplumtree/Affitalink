import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

function getToastTone(status) {
  if (status === "success") {
    return {
      wrapper: "border-emerald-200 bg-emerald-50 text-emerald-800",
      icon: CheckCircle2,
    };
  }
  if (status === "error" || status === "warning") {
    return {
      wrapper: "border-red-200 bg-red-50 text-red-800",
      icon: AlertCircle,
    };
  }
  return {
    wrapper: "border-primary/20 bg-primary/[0.08] text-primary",
    icon: Info,
  };
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, status = "info", duration = 1800 }) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => current.concat({ id, title, status }));
    window.setTimeout(() => {
      setToasts((current) => current.filter((entry) => entry.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[200] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((entry) => {
          const tone = getToastTone(entry.status);
          const Icon = tone.icon;
          return (
            <div
              key={entry.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-[22px] border px-4 py-3 shadow-lift ${tone.wrapper}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="flex-1 text-sm font-medium leading-6">{entry.title}</p>
              <button type="button" onClick={() => dismiss(entry.id)} className="opacity-70 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastMessage() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastMessage must be used within ToastProvider");
  }
  return context.toast;
}
