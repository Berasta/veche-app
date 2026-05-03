import { X, MonitorPlay, Settings } from "lucide-react";
import { useState } from "react";

export interface ShareOptions {
  audio: boolean;
  quality: "low" | "medium" | "high";
  fps: 15 | 30 | 60;
}

interface ScreenShareModalProps {
  onClose: () => void;
  onStart: (options: ShareOptions) => void;
}

const LS_KEY = "screenShareQuality";

function loadSavedQuality(): { quality: ShareOptions["quality"]; fps: ShareOptions["fps"] } {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return { quality: "medium", fps: 30 };
}

function saveQuality(quality: ShareOptions["quality"], fps: ShareOptions["fps"]) {
  localStorage.setItem(LS_KEY, JSON.stringify({ quality, fps }));
}

export function ScreenShareModal({ onClose, onStart }: ScreenShareModalProps) {
  const saved = loadSavedQuality();
  const [shareAudio, setShareAudio] = useState(false);
  const [quality, setQuality] = useState<ShareOptions["quality"]>(saved.quality);
  const [fps, setFps] = useState<ShareOptions["fps"]>(saved.fps);

  const handleQuality = (q: ShareOptions["quality"]) => { setQuality(q); saveQuality(q, fps); };
  const handleFps = (f: ShareOptions["fps"]) => { setFps(f); saveQuality(quality, f); }; 

  const handleStart = () => {
    onStart({ audio: shareAudio, quality, fps });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-sidebar/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-primary" strokeWidth={2} />
            <h3 className="text-base font-semibold text-foreground">
              Показати свой экранъ
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={shareAudio}
                onChange={(e) => setShareAudio(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-input-background text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="text-sm text-foreground">
                  Показати звукъ съ экрана
                </div>
                <div className="text-xs text-muted-foreground">
                  Другіе услышатъ звуки изъ вашего экрана
                </div>
              </div>
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" strokeWidth={2} />
              <span className="text-sm font-semibold text-foreground">
                Качество изображенія
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["low", "medium", "high"] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuality(q)}
                  className={`
                    px-3 py-2 rounded-md text-xs font-medium transition-all
                    ${
                      quality === q
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }
                  `}
                >
                  {q === "low" && "Низкое"}
                  {q === "medium" && "Среднее"}
                  {q === "high" && "Высокое"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" strokeWidth={2} />
              <span className="text-sm font-semibold text-foreground">
                Частота кадровъ
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {([15, 30, 60] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => handleFps(f)}
                  className={`
                    px-3 py-2 rounded-md text-xs font-medium transition-all
                    ${
                      fps === f
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }
                  `}
                >
                  {f} FPS
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-sidebar/20 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors"
          >
            Отмѣна
          </button>
          <button
            onClick={handleStart}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors shadow-sm"
          >
            Начати показъ
          </button>
        </div>
      </div>
    </div>
  );
}
