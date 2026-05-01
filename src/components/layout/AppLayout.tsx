import { useState, useEffect } from "react";
import { ActiveVoiceBar } from "@components/activeVoice/ActiveVoiceBar";
import { GradList } from "@components/servers/GradList";
import { Outlet, useLocation } from "react-router";
import { MobileMenuProvider } from "./MobileMenuContext";
import { useAppDispatch } from "@store/hooks";
import { toggleMute } from "@store/thunks/roomThunk";
import { useTauriHotkeys } from "@hooks/useTauriHotkeys";
import { useRealtime } from "@hooks/useRealtime";
import { isTauri } from "@lib/tauri";

const DEFAULTS = {
  toggleMute: "Ctrl+Shift+M",
  toggleOverlay: "Ctrl+Shift+Space",
};

function migrateBindings(
  saved: Record<string, string>,
): Record<string, string> {
  const result = { ...DEFAULTS };
  for (const [key, val] of Object.entries(saved)) {
    result[key] = val.replace(/^Ctrl\+/i, "Cmd+");
  }
  return result;
}

function readBindings(): Record<string, string> {
  try {
    const saved = localStorage.getItem("hotkeyBindings");
    if (saved) return migrateBindings(JSON.parse(saved));
  } catch {}
  return DEFAULTS;
}

export const AppLayout = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isVoiceChat = location.pathname.includes("/voice/");
  const [bindings, setBindings] = useState(readBindings);

  useRealtime();

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
      <div className="h-screen w-screen overflow-hidden grid grid-rows-[1fr_auto]">
        <div className="min-h-0 flex overflow-hidden">
          <GradList />
          <Outlet />
        </div>
        {!isVoiceChat && <ActiveVoiceBar />}
      </div>
    </MobileMenuProvider>
  );
};
