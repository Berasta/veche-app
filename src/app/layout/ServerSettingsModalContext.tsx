import { createContext, useContext, useState, ReactNode } from "react";

interface ServerSettingsModalContextType {
  isOpen: boolean;
  serverId: string | null;
  open: (serverId: string) => void;
  close: () => void;
}

const ServerSettingsModalContext = createContext<ServerSettingsModalContextType>({
  isOpen: false,
  serverId: null,
  open: () => {},
  close: () => {},
});

export function ServerSettingsModalProvider({ children }: { children: ReactNode }) {
  const [serverId, setServerId] = useState<string | null>(null);
  return (
    <ServerSettingsModalContext.Provider
      value={{
        isOpen: !!serverId,
        serverId,
        open: (id) => setServerId(id),
        close: () => setServerId(null),
      }}
    >
      {children}
    </ServerSettingsModalContext.Provider>
  );
}

export function useServerSettingsModal() {
  return useContext(ServerSettingsModalContext);
}
