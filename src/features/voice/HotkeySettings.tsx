import { useState, useEffect, useCallback } from "react";
import { Keyboard, X, RotateCcw } from "lucide-react";

const STORAGE_KEY = "hotkeyBindings";
const DEFAULT_MUTE = "Ctrl+Shift+M";

function loadMuteKey(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.toggleMute ?? DEFAULT_MUTE;
    }
  } catch {}
  return DEFAULT_MUTE;
}

function saveMuteKey(key: string) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, toggleMute: key }));
  } catch {}
}

function formatKey(e: KeyboardEvent): string | null {
  const mods: string[] = [];
  if (e.ctrlKey || e.metaKey) mods.push("Ctrl");
  if (e.shiftKey) mods.push("Shift");
  if (e.altKey) mods.push("Alt");

  const ignored = ["Control", "Shift", "Alt", "Meta", "OS"];
  if (ignored.includes(e.key)) return null;

  const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
  if (!mods.length) return null; // требуем хотя бы один модификатор
  return [...mods, key].join("+");
}

export function HotkeySettings() {
  const [muteKey, setMuteKey] = useState(loadMuteKey);
  const [recording, setRecording] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    if (e.key === "Escape") {
      setRecording(false);
      return;
    }
    const combo = formatKey(e);
    if (!combo) return;
    setMuteKey(combo);
    saveMuteKey(combo);
    setRecording(false);
  }, []);

  useEffect(() => {
    if (!recording) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [recording, handleKeyDown]);

  const resetToDefault = () => {
    setMuteKey(DEFAULT_MUTE);
    saveMuteKey(DEFAULT_MUTE);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Keyboard className="w-3.5 h-3.5 text-foreground/30 shrink-0" strokeWidth={1.5} />
          <span className="text-sm text-foreground/60 truncate">Мутъ микрофона</span>
        </div>

        {recording ? (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-primary animate-pulse">нажмите сочетанiе...</span>
            <button
              onClick={() => setRecording(false)}
              className="w-6 h-6 rounded-lg hover:bg-foreground/5 text-foreground/30 hover:text-foreground/60 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3" strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setRecording(true)}
            title="Нажмите чтобы измѣнить"
            className="px-3 py-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-sm text-foreground/70 font-mono transition-colors shrink-0"
          >
            {muteKey}
          </button>
        )}
      </div>

      <p className="text-xs text-foreground/25 leading-relaxed">
        Нажмите на кнопку и введите новое сочетанiе клавишъ.{" "}
        <button
          onClick={resetToDefault}
          className="inline-flex items-center gap-1 underline hover:text-foreground/40 transition-colors"
        >
          <RotateCcw className="w-2.5 h-2.5" strokeWidth={1.5} />
          Сбросить
        </button>
      </p>
    </div>
  );
}
