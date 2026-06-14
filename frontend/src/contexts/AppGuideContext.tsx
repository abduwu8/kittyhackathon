import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { disableAppGuidePeek, isAppGuidePeekDisabled } from '../lib/appGuideStorage';

type AppGuideContextValue = {
  isOpen: boolean;
  activeSection: string | null;
  peekDisabled: boolean;
  isPeekVisible: boolean;
  peekResetKey: number;
  openGuide: () => void;
  closeGuide: () => void;
  setActiveSection: (section: string | null) => void;
  setPeekVisible: (visible: boolean) => void;
  disablePeekPermanently: () => Promise<void>;
  resetPeekOnHome: () => void;
};

const AppGuideContext = createContext<AppGuideContextValue | null>(null);

type AppGuideProviderProps = {
  children: ReactNode;
};

export function AppGuideProvider({ children }: AppGuideProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [peekDisabled, setPeekDisabled] = useState(false);
  const [isPeekVisible, setPeekVisible] = useState(false);
  const [peekResetKey, setPeekResetKey] = useState(0);

  useEffect(() => {
    isAppGuidePeekDisabled().then((disabled) => {
      setPeekDisabled(disabled);
    });
  }, []);

  const openGuide = useCallback(() => {
    setPeekVisible(false);
    setIsOpen(true);
  }, []);

  const closeGuide = useCallback(() => {
    setIsOpen(false);
  }, []);

  const disablePeekPermanently = useCallback(async () => {
    await disableAppGuidePeek();
    setPeekDisabled(true);
    setPeekVisible(false);
  }, []);

  const resetPeekOnHome = useCallback(() => {
    if (peekDisabled) {
      return;
    }

    setPeekResetKey((key) => key + 1);
  }, [peekDisabled]);

  const value = useMemo(
    () => ({
      isOpen,
      activeSection,
      peekDisabled,
      isPeekVisible,
      peekResetKey,
      openGuide,
      closeGuide,
      setActiveSection,
      setPeekVisible,
      disablePeekPermanently,
      resetPeekOnHome,
    }),
    [
      activeSection,
      closeGuide,
      disablePeekPermanently,
      isOpen,
      isPeekVisible,
      openGuide,
      peekDisabled,
      peekResetKey,
      resetPeekOnHome,
    ],
  );

  return <AppGuideContext.Provider value={value}>{children}</AppGuideContext.Provider>;
}

export function useAppGuide() {
  const context = useContext(AppGuideContext);

  if (!context) {
    throw new Error('useAppGuide must be used within AppGuideProvider');
  }

  return context;
}

export function useOptionalAppGuide() {
  return useContext(AppGuideContext);
}
