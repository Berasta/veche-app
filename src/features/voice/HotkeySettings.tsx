import { useState, useEffect, useCallback } from "react";
import { Keyboard, Info } from "lucide-react";
import { isTauri } from "@shared/lib/tauri";

export type MuteMode = "toggle" | "push-to-talk" | "push-to-mute";

interface HotkeyEntry {
  id: string;
  label: string;
  defaultShortcut: string;
  description?: string;
}

const HOTKEYS: HotkeyEntry[] = [
  { 
    id: "toggleMute", 
    label: "Вкл/Выкл микрофонъ", 
    defaultShortcut: "Cmd+Shift+M",
    description: "Переключение микрофона (работаетъ въ режиме Toggle)"
  },
  { 
    id: "pushToTalk", 
    label: "Push-to-Talk", 
    defaultShortcut: "Space",
    description: "Зажать чтобы говорить (работаетъ въ режиме Push-to-Talk)"
  },
  { 
    id: "pushToMute", 
    label: "Push-to-Mute", 
    defaultShortcut: "Cmd+M",
    description: "Зажать чтобы замьютиться (работаетъ въ режиме Push-to-Mute)"
  },
  { 
    id: "toggleDeafen", 
    label: "Вкл/Выкл звукъ", 
    defaultShortcut: "Cmd+Shift+D",
    description: "Оглушить/включить звукъ"
  },
  { 
    id: "toggleOverlay", 
    label: "Показать/Скрыть оверлей", 
    defaultShortcut: "Cmd+Shift+O" 
  },
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

function loadMuteMode(): MuteMode {
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
  const [muteMode, setMuteMode] = useState<MuteMode>(loadMuteMode);
  const [recording, setRecording] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("hotkeyBindings", JSON.stringify(bindings));
  }, [bindings]);

  useEffect(() => {
    localStorage.setItem("muteMode", muteMode);
  }, [muteMode]);

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

  const getActiveHotkeys = () => {
    const baseHotkeys = HOTKEYS.filter(h => 
      h.id !== "toggleMute" && 
      h.id !== "pushToTalk" && 
      h.id !== "pushToMute"
    );

    if (muteMode === "toggle") {
      return [
        HOTKEYS.find(h => h.id === "toggleMute")!,
        ...baseHotkeys
      ];
    } else if (muteMode === "push-to-talk") {
      return [
        HOTKEYS.find(h => h.id === "pushToTalk")!,
        ...baseHotkeys
      ];
    } else {
      return [
        HOTKEYS.find(h => h.id === "pushToMute")!,
        ...baseHotkeys
      ];
    }
  };

  const activeHotkeys = getActiveHotkeys();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Keyboard className="w-5 h-5 text-primary" strokeWidth={2} />
        <h3 className="text-base font-semibold text-foreground">Горячия клавиши</h3>
      </div>

      {/* Режим мьюта */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Режимъ работы микрофона
        </label>
        <div className="space-y-2">
          <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors">
            <input
              type="radio"
              name="muteMode"
              value="toggle"
              checked={muteMode === "toggle"}
              onChange={(e) => setMuteMode(e.target.value as MuteMode)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Toggle (Переключеніе)</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Нажатіе клавиши переключаетъ мьютъ вкл/выкл
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors">
            <input
              type="radio"
              name="muteMode"
              value="push-to-talk"
              checked={muteMode === "push-to-talk"}
              onChange={(e) => setMuteMode(e.target.value as MuteMode)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Push-to-Talk</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Микрофонъ включенъ только пока зажата клавиша
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors">
            <input
              type="radio"
              name="muteMode"
              value="push-to-mute"
              checked={muteMode === "push-to-mute"}
              onChange={(e) => setMuteMode(e.target.value as MuteMode)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Push-to-Mute</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Микрофонъ выключается пока зажата клавиша
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Горячие клавиши */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Назначеніе клавишъ
        </label>
        <div className="space-y-2">
          {activeHotkeys.map((hotkey) => (
            <div
              key={hotkey.id}
              className="flex items-start justify-between py-2 gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground">{hotkey.label}</div>
                {hotkey.description && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {hotkey.description}
                  </div>
                )}
              </div>
              <button
                onClick={() => setRecording(recording === hotkey.id ? null : hotkey.id)}
                onKeyDown={recording === hotkey.id ? handleKeyDown(hotkey.id) : undefined}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-mono border min-w-[140px] text-center flex-shrink-0
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

      {/* Информация */}
      <div className="flex gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground">
          <p className="mb-1">
            <strong className="text-foreground">Совѣтъ:</strong> Для Push-to-Talk рекомендуется использовать удобную клавишу, 
            которую легко зажимать (например, Space или боковая кнопка мыши).
          </p>
          <p>
            Push-to-Mute удобенъ, если вы хотите быть всегда слышимыми, но иногда нужно временно отключиться.
          </p>
        </div>
      </div>
    </div>
  );
}
