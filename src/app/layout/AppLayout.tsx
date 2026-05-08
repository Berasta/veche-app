import { useState, useEffect } from "react";
import { ActiveVoiceBar } from "@features/voice/ActiveVoiceBar";
import { GradList } from "@features/server/GradList";
import { Outlet, useLocation } from "react-router";
import { MobileMenuProvider } from "./MobileMenuContext";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { toggleMute, toggleDeafen } from "@store/thunks/roomThunk";
import { selectIsMuted } from "@entities/room/model/roomSelectors";
import { useTauriHotkeys } from "@shared/hooks/useTauriHotkeys";
import { useRealtime } from "@shared/hooks/useRealtime";
import { isTauri } from "@shared/lib/tauri";
import type { MuteMode } from "@features/voice/HotkeySettings";

const DEFAULTS = {
  toggleMute: "Ctrl+Shift+M",
  pushToTalk: "Space",
  pushToMute: "Ctrl+M",
  toggleDeafen: "Ctrl+Shift+D",
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
  } catch (err) {
    console.error("Ошибка чтенiя горячихъ клавишъ", err);
  }
  return DEFAULTS;
}

function readMuteMode(): MuteMode {
  try {
    const saved = localStorage.getItem("muteMode");
    if (saved && ["toggle", "push-to-talk", "push-to-mute"].includes(saved)) {
      return saved as MuteMode;
    }
  } catch (err) {
    console.error("Ошибка чтенiя режима мьюта", err);
  }
  return "toggle";
}

export const AppLayout = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isVoiceChat = location.pathname.includes("/voice/");
  const isOnboarding = location.pathname.includes("/onboarding");
  const [bindings, setBindings] = useState(readBindings);
  const [muteMode, setMuteMode] = useState(readMuteMode);
  const isMuted = useAppSelector(selectIsMuted);

  useRealtime();

  useEffect(() => {
    const interval = setInterval(() => {
      setBindings(readBindings());
      setMuteMode(readMuteMode());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleOverlay = async () => {
    if (!isTauri()) return;
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("toggle_overlay");
  };

  // Логика для Push-to-Talk: unmute при нажатии, mute при отпускании
  const handlePushToTalkDown = () => {
    if (isMuted) {
      dispatch(toggleMute());
    }
  };

  const handlePushToTalkUp = () => {
    if (!isMuted) {
      dispatch(toggleMute());
    }
  };

  // Логика для Push-to-Mute: mute при нажатии, unmute при отпускании
  const handlePushToMuteDown = () => {
    if (!isMuted) {
      dispatch(toggleMute());
    }
  };

  const handlePushToMuteUp = () => {
    if (isMuted) {
      dispatch(toggleMute());
    }
  };

  // Формируем список хоткеев в зависимости от режима
  const hotkeys = [];

  if (muteMode === "toggle") {
    hotkeys.push({
      id: "toggleMute",
      shortcut: bindings.toggleMute,
      action: () => dispatch(toggleMute()),
    });
  } else if (muteMode === "push-to-talk") {
    hotkeys.push({
      id: "pushToTalk",
      shortcut: bindings.pushToTalk,
      action: () => {}, // Не используется, только onKeyDown/onKeyUp
      onKeyDown: handlePushToTalkDown,
      onKeyUp: handlePushToTalkUp,
    });
  } else if (muteMode === "push-to-mute") {
    hotkeys.push({
      id: "pushToMute",
      shortcut: bindings.pushToMute,
      action: () => {}, // Не используется, только onKeyDown/onKeyUp
      onKeyDown: handlePushToMuteDown,
      onKeyUp: handlePushToMuteUp,
    });
  }

  hotkeys.push(
    {
      id: "toggleDeafen",
      shortcut: bindings.toggleDeafen,
      action: () => dispatch(toggleDeafen()),
    },
    {
      id: "toggleOverlay",
      shortcut: bindings.toggleOverlay,
      action: toggleOverlay,
    }
  );

  useTauriHotkeys(hotkeys);

  return (
    <MobileMenuProvider>
      <div className="h-dvh w-screen overflow-hidden grid grid-rows-[1fr_auto]">
        <div className={`min-h-0 flex overflow-hidden ${isOnboarding ? "" : "pt-12 md:pt-0"}`}>
          <GradList />
          <Outlet />
        </div>
        {!isVoiceChat && !isOnboarding && <ActiveVoiceBar />}
      </div>
    </MobileMenuProvider>
  );
};
