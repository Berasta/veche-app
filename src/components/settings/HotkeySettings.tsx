import { useState, useEffect, useCallback, useRef } from "react";
import { Keyboard } from "lucide-react";
import { isTauri } from "@lib/tauri";

interface HotkeyEntry {
  id: string;
  label: string;
  defaultShortcut: string;
}

const HOTKEYS: HotkeyEntry[] = [
  { id: "toggleMute", label: "Вкл/Выкл микрофонъ", defaultShortcut: "Cmd+Shift+M" },
  { id: "toggleOverlay", label: "Показать/Скрыть оверлей", defaultShortcut: "Cmd+Shift+O" },
];

function parseKey(event: React.KeyboardEvent): string {
  const parts: string[] = [];
  if (event.metaKey) parts.push("Cmd");
  if (event.ctrlKey) parts.push("Ctrl");
  if (event.shiftKey) parts.push("Shift");
  if (event.altKey) parts.push("Alt");

  const key = event.key === " " ? "Space" : event.key;
  if (!["Control", "Shift", "Alt", "Meta"].includes(key)) {
    parts.push(key.length === 1 ? key.toUpperCase() : key);
  }

  return parts.join("+");
}

function loadDefaults(): Record<string, string> {
  const defaults: Record<string, string> = {};
  HOTKEYS.forEach((h) => { defaults[h.id] = h.defaultShortcut; });
  return defaults;
}

async function reregisterShortcut(oldShortcut: string | undefined, newShortcut: string) {
  if (!isTauri()) return;
  const { register, unregister } = await import("@tauri-apps/plugin-global-shortcut");
  if (oldShortcut && oldShortcut !== newShortcut) {
    try { await unregister(oldShortcut); } catch (e) {
      console.error("Failed to unregister shortcut", oldShortcut, e);
    }
  }
  try { await register(newShortcut, () => {}); } catch (e) {
    console.error("Failed to register", newShortcut, e);
  }
}

export function HotkeySettings() {
  const defaults = loadDefaults();
  const [bindings, setBindings] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("hotkeyBindings");
      if (saved) return { ...defaults, ...JSON.parse(saved) };
    } catch (err) {
      console.error("Ошибка чтенiя сохраненныхъ горячихъ клавишъ", err);
    }
    return defaults;
  });
  const [recording, setRecording] = useState<string | null>(null);
  const prevBindings = useRef(bindings);

  useEffect(() => {
    localStorage.setItem("hotkeyBindings", JSON.stringify(bindings));
  }, [bindings]);

  useEffect(() => {
    const prev = prevBindings.current;
    for (const id of HOTKEYS.map((h) => h.id)) {
      const oldS = prev[id];
      const newS = bindings[id];
      if (oldS !== newS) reregisterShortcut(oldS, newS);
    }
    prevBindings.current = bindings;
  }, [bindings]);

  const handleKeyDown = useCallback((id: string) => (e: React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shortcut = parseKey(e);
    if (shortcut) {
      setBindings((prev) => ({ ...prev, [id]: shortcut }));
      setRecording(null);
    }
  }, []);

  if (!isTauri()) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Keyboard className="w-5 h-5 text-primary" strokeWidth={2} />
          <h3 className="text-base font-semibold text-foreground">Горячия клавиши</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Горячия клавиши доступны только въ десктопном приложеніи.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Keyboard className="w-5 h-5 text-primary" strokeWidth={2} />
        <h3 className="text-base font-semibold text-foreground">Горячия клавиши</h3>
      </div>

      <div className="space-y-2">
        {HOTKEYS.map((hotkey) => (
          <div
            key={hotkey.id}
            className="flex items-center justify-between py-2"
          >
            <span className="text-sm text-foreground">{hotkey.label}</span>
            <button
              onClick={() => setRecording(recording === hotkey.id ? null : hotkey.id)}
              onKeyDown={recording === hotkey.id ? handleKeyDown(hotkey.id) : undefined}
              className={`
                px-3 py-1.5 rounded-md text-sm font-mono border min-w-[140px] text-center
                ${recording === hotkey.id
                  ? "border-primary bg-primary/10 text-primary animate-pulse"
                  : "border-border bg-input-background text-foreground hover:border-primary/50"
                }
              `}
            >
              {recording === hotkey.id ? "..." : bindings[hotkey.id]}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
