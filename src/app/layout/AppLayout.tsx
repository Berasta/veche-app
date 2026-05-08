import { useState, useEffect } from "react";
import { ActiveVoiceBar } from "@features/voice/ActiveVoiceBar";
import { GradList } from "@features/server/GradList";
import { Outlet, useLocation } from "react-router";
import { MobileMenuProvider } from "./MobileMenuContext";
import { VoiceRoomProvider } from "./VoiceRoomProvider";
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
  const isOnboarding = location.pathname.includes("/onboarding");
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
      <VoiceRoomProvider>
        <div className="h-dvh w-screen overflow-hidden grid grid-rows-[1fr_auto]">
          <div className={`min-h-0 flex overflow-hidden ${isOnboarding ? "" : "pt-12 md:pt-0"}`}>
            <GradList />
            <Outlet />
          </div>
          {!isVoiceChat && !isOnboarding && <ActiveVoiceBar />}
        </div>
      </VoiceRoomProvider>
    </MobileMenuProvider>
  );
};
