import { useState, useRef, useEffect } from "react";
import { Move, Save, X, Crop } from "lucide-react";

interface BannerRepositionDialogProps {
  bannerUrl: string;
  filename: string;
  onSave: (x: number, y: number) => void;
  onClose: () => void;
}

const LS_PREFIX = "bannerPosition_";

function loadSaved(filename: string): { x: number; y: number } {
  try {
    const saved = localStorage.getItem(LS_PREFIX + filename);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { x: 50, y: 50 };
}

function saveToLS(filename: string, x: number, y: number) {
  localStorage.setItem(LS_PREFIX + filename, JSON.stringify({ x, y }));
}

export function BannerRepositionDialog({ bannerUrl, filename, onSave, onClose }: BannerRepositionDialogProps) {
  const saved = useRef(loadSaved(filename));
  const [pos, setPos] = useState(saved.current);
  const dragging = useRef(false);
  const startRef = useRef({ x: 0, y: 0, posX: 50, posY: 50 });

  useEffect(() => {
    const el = document.getElementById("banner-reposition-img");
    if (!el) return;

    const onMouseDown = (e: MouseEvent) => {
      dragging.current = true;
      startRef.current = { x: e.clientX, y: e.clientY, posX: pos.x, posY: pos.y };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      const newX = Math.max(0, Math.min(100, startRef.current.posX - dx / 3));
      const newY = Math.max(0, Math.min(100, startRef.current.posY - dy / 3));
      setPos({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      dragging.current = false;
    };

    el.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const handleSave = () => {
    saveToLS(filename, pos.x, pos.y);
    onSave(pos.x, pos.y);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Crop className="w-4 h-4 text-primary" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Выборъ области хоругви</h3>
              <p className="text-[11px] text-muted-foreground">Перетащите изображеніе, чтобы выбрать видимую область</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-md hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview */}
        <div className="p-6 bg-background/50">
          <div className="relative w-full aspect-[3.2/1] rounded-xl overflow-hidden border-2 border-border/50 bg-black/40">
            <img
              id="banner-reposition-img"
              src={bannerUrl}
              alt=""
              className="w-full h-full cursor-grab active:cursor-grabbing select-none"
              draggable={false}
              style={{ objectFit: "cover", objectPosition: `${pos.x}% ${pos.y}%` }}
            />
            {/* Center crosshair */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/40 rounded-full" />
            </div>
            {/* Instructions */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 pointer-events-none">
              <Move className="w-3.5 h-3.5 text-white/70" strokeWidth={2} />
              <span className="text-xs text-white/70">Перетащите для настройки области</span>
            </div>
          </div>
        </div>

        {/* Position info */}
        <div className="px-6 pb-2 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span>По горизонтали: {Math.round(pos.x)}%</span>
          <span>По вертикали: {Math.round(pos.y)}%</span>
        </div>

        {/* Buttons */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors">
            Отмѣна
          </button>
          <button onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors flex items-center gap-2">
            <Save className="w-3.5 h-3.5" strokeWidth={2} />
            Сохранити
          </button>
        </div>
      </div>
    </div>
  );
}
