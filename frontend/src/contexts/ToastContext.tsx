import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { CatToaster, type CatToastPayload } from '../components/toast/CatToaster';
import { pickRandomToasterCatTheme, type ToasterCatTheme } from '../lib/catToastAssets';

type ShowToastOptions = {
  title: string;
  message: string;
  theme?: ToasterCatTheme;
};

type ToastContextValue = {
  showToast: (options: ShowToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<CatToastPayload | null>(null);

  const showToast = useCallback(({ title, message, theme }: ShowToastOptions) => {
    setToast({
      title,
      message,
      theme: theme ?? pickRandomToasterCatTheme(),
    });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <CatToaster toast={toast} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
