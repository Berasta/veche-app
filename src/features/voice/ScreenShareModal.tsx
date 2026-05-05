import { X, MonitorPlay, Settings } from "lucide-react";
import { useState } from "react";
import { useAppDispatch } from "@app/hooks";
import { toggleScreenShare } from "@store/thunks/roomThunk";
import { setScreenShareQuality } from "@entities/room/roomSlice";

const QUALITY_MAP = {
  low: { width: 854, height: 480 },
  medium: { width: 1280, height: 720 },
  high: { width: 1920, height: 1080 },
} as const;

type Quality = keyof typeof QUALITY_MAP;
type Fps = 15 | 30 | 60 | 120;

interface Props {
  onClose: () => void;
}

const LS_KEY = "screenShareQuality";

function loadSavedQuality(): { quality: Quality; fps: Fps; bitrate: number } {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return { quality: "medium", fps: 30, bitrate: 8 };
}

function saveQuality(quality: Quality, fps: Fps, bitrate: number) {
  localStorage.setItem(LS_KEY, JSON.stringify({ quality, fps, bitrate }));
}

const BITRATES = [4, 8, 16, 32, 64];

export function ScreenShareModal({ onClose }: Props) {
  const dispatch = useAppDispatch();

  const saved = loadSavedQuality();
  const [shareAudio, setShareAudio] = useState(false);
  const [quality, setQuality] = useState<Quality>(saved.quality);
  const [fps, setFps] = useState<Fps>(saved.fps);
  const [bitrate, setBitrate] = useState(saved.bitrate);

  const handleQuality = (q: Quality) => { setQuality(q); saveQuality(q, fps, bitrate); };
  const handleFps = (f: Fps) => { setFps(f); saveQuality(quality, f, bitrate); };
  const handleBitrate = (b: number) => { setBitrate(b); saveQuality(quality, fps, b); };

  const handleStart = async () => {
    dispatch(setScreenShareQuality({
      resolution: quality === "low" ? "480p" : quality === "medium" ? "720p" : "1080p",
      fps,
      bitrate,
    }));

    dispatch(toggleScreenShare({
      audio: shareAudio,
      resolution: {
        width: QUALITY_MAP[quality].width,
        height: QUALITY_MAP[quality].height,
        frameRate: fps,
      },
    } as any));

    onClose();
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
          {/* Audio Option */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="flex-1">
                <div className="text-sm text-foreground">
                  Показати звукъ съ экрана
                </div>
                <div className="text-xs text-muted-foreground">
                  Другіе услышатъ звуки изъ вашего экрана
                </div>
              </div>
              <input
                type="checkbox"
                checked={shareAudio}
                onChange={(e) => setShareAudio(e.target.checked)}
                className="sr-only"
              />
            </label>
          </div>

          {/* Quality */}
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

          {/* FPS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" strokeWidth={2} />
              <span className="text-sm font-semibold text-foreground">
                Частота кадровъ
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {([15, 30, 60, 120] as const).map((f) => (
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

          {/* Bitrate */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" strokeWidth={2} />
              <span className="text-sm font-semibold text-foreground">
                Битрейт
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {BITRATES.map((b) => (
                <button
                  key={b}
                  onClick={() => handleBitrate(b)}
                  className={`
                    px-2 py-2 rounded-md text-xs font-medium transition-all
                    ${bitrate === b
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }
                  `}
                >
                  {b} Мбит
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
