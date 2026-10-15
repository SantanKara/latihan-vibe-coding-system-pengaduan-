import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

const STYLES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
};

const ICONS = {
  success: '✅',
  error: '⛔',
  warning: '⚠️',
  info: 'ℹ️',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const show = useCallback(
    (message, type = 'info', duration = 3500) => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        timers.current[id] = setTimeout(() => remove(id), duration);
      }
      return id;
    },
    [remove]
  );

  const value = useMemo(
    () => ({
      show,
      success: (msg, dur) => show(msg, 'success', dur),
      error: (msg, dur) => show(msg, 'error', dur),
      warning: (msg, dur) => show(msg, 'warning', dur),
      info: (msg, dur) => show(msg, 'info', dur),
      remove,
    }),
    [show, remove]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-3 sm:items-end sm:px-4"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg animate-slide-in ${
              STYLES[toast.type] || STYLES.info
            }`}
          >
            <span aria-hidden="true">{ICONS[toast.type] || ICONS.info}</span>
            <p className="flex-1 leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => remove(toast.id)}
              className="-m-1 rounded-lg p-1 text-current/70 transition hover:text-current"
              aria-label="Tutup notifikasi"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast harus dipakai di dalam ToastProvider');
  return ctx;
}
