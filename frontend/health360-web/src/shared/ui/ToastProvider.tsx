import { Alert, Snackbar } from '@mui/material';
import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';

export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

export interface AppToast {
  id: string;
  message: string;
  severity: ToastSeverity;
  createdAt: number;
}

interface ToastState {
  open: boolean;
  message: string;
  severity: ToastSeverity;
}

interface ToastContextValue {
  showToast: (message: string, severity?: ToastSeverity) => void;
  toasts: AppToast[];
  unreadCount: number;
  markToastsRead: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const MAX_TOASTS = 8;

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'success' });
  const [toasts, setToasts] = useState<AppToast[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const showToast = useCallback((message: string, severity: ToastSeverity = 'success') => {
    setToast({ open: true, message, severity });
    setToasts((current) => [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, message, severity, createdAt: Date.now() },
      ...current,
    ].slice(0, MAX_TOASTS));
    setUnreadCount((count) => count + 1);
  }, []);

  const markToastsRead = useCallback(() => setUnreadCount(0), []);

  const value = useMemo(
    () => ({ showToast, toasts, unreadCount, markToastsRead }),
    [showToast, toasts, unreadCount, markToastsRead],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ top: { xs: 72, md: 80 } }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((current) => ({ ...current, open: false }))}
          sx={{ borderRadius: 2.5, minWidth: 280, boxShadow: 'var(--h360-shadow-md)' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
