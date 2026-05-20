import { useState, useEffect } from "react";
import { ActiveVoiceBar } from "@features/voice/ActiveVoiceBar";
import { GradList } from "@features/server/GradList";
import { Outlet, useLocation } from "react-router";
import { MobileMenuProvider } from "./MobileMenuContext";
import { VoiceRoomProvider } from "./VoiceRoomProvider";
import { SettingsModalProvider, useSettingsModal } from "./SettingsModalContext";
import { ServerSettingsModalProvider, useServerSettingsModal } from "./ServerSettingsModalContext";
import { Settings } from "@pages/Settings";
import { ServerSettingsPage } from "@pages/ServerSettingsPage";
import { Portal } from "@shared/ui/Portal";
import { useAppDispatch } from "@store/hooks";
import { toggleMute } from "@store/thunks/roomThunk";
import { useTauriHotkeys } from "@shared/hooks/useTauriHotkeys";
import { useRealtime } from "@shared/hooks/useRealtime";
import { useDeepLinks } from "@shared/hooks/useDeepLinks";
import { isTauri } from "@shared/lib/tauri";

const DEFAULTS = {
  toggleMute: "Ctrl+M",
  toggleOverlay: "Ctrl+Shift+Space",
};

// True only on macOS desktop Tauri build (titleBarStyle: Overlay is macOS-only)
function readBindings(): Record<string, string> {
  try {
    const saved = localStorage.getItem("hotkeyBindings");
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULTS, ...parsed };
    }
  } catch (err) {
    console.error("Ошибка чтенiя горячихъ клавишъ", err);
  }
  return DEFAULTS;
}

export const AppLayout = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isVoiceChat = location.pathname.includes("/voice/");
  const [bindings, setBindings] = useState(readBindings);

  useRealtime();
  useDeepLinks();

  useEffect(() => {
    const interval = setInterval(() => setBindings(readBindings()), 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleOverlay = async () => {
    if (!isTauri()) return;
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("toggle_overlay");
  };

  useTauriHotkeys([
    {
      id: "toggleMute",
      shortcut: bindings.toggleMute,
      action: () => dispatch(toggleMute()),
    },
    {
      id: "toggleOverlay",
      shortcut: bindings.toggleOverlay,
      action: toggleOverlay,
    },
  ]);

  return (
    <MobileMenuProvider>
      <ServerSettingsModalProvider>
        <SettingsModalProvider>
        <VoiceRoomProvider>
          <div className="h-dvh w-screen overflow-hidden grid grid-rows-[1fr_auto]">
            <div className="min-h-0 flex overflow-hidden pt-12 md:pt-0">
              <GradList />
              <Outlet />
            </div>
            {!isVoiceChat && <ActiveVoiceBar />}
          </div>
        </VoiceRoomProvider>
        <SettingsModalRenderer />
      </SettingsModalProvider>
      <ServerSettingsModalRenderer />
    </ServerSettingsModalProvider>
    </MobileMenuProvider>
  );
};

function SettingsModalRenderer() {
  const { isOpen, close } = useSettingsModal();
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!rendered) return null;

  return (
    <Portal>
      <div
        className={`fixed inset-0 z-[200] flex items-center justify-center p-4 ${
          visible ? "" : "pointer-events-none"
        }`}
        onClick={close}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 250ms ease",
          }}
        />
        <div
          className="relative bg-background rounded-2xl w-[680px] h-[540px] max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-2rem)] flex overflow-hidden shadow-2xl shadow-black/40"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(0.96)",
            transition: "opacity 280ms cubic-bezier(0.16,1,0.3,1), transform 280ms cubic-bezier(0.16,1,0.3,1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Settings onClose={close} />
        </div>
      </div>
    </Portal>
  );
}

function ServerSettingsModalRenderer() {
  const { isOpen, serverId, close } = useServerSettingsModal();
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!rendered || !serverId) return null;

  return (
    <Portal>
      <div
        className={`fixed inset-0 z-[200] flex items-center justify-center p-4 ${visible ? "" : "pointer-events-none"}`}
        onClick={close}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          style={{ opacity: visible ? 1 : 0, transition: "opacity 250ms ease" }}
        />
        <div
          className="relative bg-background rounded-2xl w-[680px] h-[540px] max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-2rem)] flex overflow-hidden shadow-2xl shadow-black/40"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(0.96)",
            transition: "opacity 280ms cubic-bezier(0.16,1,0.3,1), transform 280ms cubic-bezier(0.16,1,0.3,1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ServerSettingsPage serverIdProp={serverId} onClose={close} />
        </div>
      </div>
    </Portal>
  );
}
