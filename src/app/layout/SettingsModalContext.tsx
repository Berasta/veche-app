import { createContext, useContext, useState, ReactNode } from "react";

interface SettingsModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const SettingsModalContext = createContext<SettingsModalContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function SettingsModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SettingsModalContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </SettingsModalContext.Provider>
  );
}

export function useSettingsModal() {
  return useContext(SettingsModalContext);
}
