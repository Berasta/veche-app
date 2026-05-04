import { Monitor, Maximize2, Minimize2, X } from "lucide-react";
import { useRef, useEffect, useState, useCallback } from "react";
import { screenShareElements } from "@store/thunks/roomThunk";

interface ScreenShareDisplayProps {
  sharerName: string;
  sharerIdentity?: string;
  onClose?: () => void;
}

export function ScreenShareDisplay({
  sharerName,
  sharerIdentity,
  onClose,
}: ScreenShareDisplayProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!videoRef.current || !sharerIdentity) return;
    const container = videoRef.current;
    const el = screenShareElements[sharerIdentity];
    if (el) {
      container.appendChild(el);
      el.style.cssText = "width:100%;height:100%;object-fit:contain";
      el.play().catch(() => {});
    }
    return () => {
      if (el && container.contains(el)) {
        container.removeChild(el);
      }
    };
  }, [sharerIdentity]);

  const handleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  return (
    <div ref={containerRef} className="relative bg-card/60 backdrop-blur-sm rounded-lg border border-border overflow-hidden mb-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between px-4 py-2 bg-sidebar/30 border-b border-border">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-primary" strokeWidth={2} />
          <span className="text-xs text-muted-foreground">
            {sharerName} показуетъ экранъ
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleFullscreen}
            className="w-6 h-6 rounded-md hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title={isFullscreen ? "Свернуть" : "На весь экранъ"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-md hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Область демонстрации */}
      <div className="aspect-video bg-black/90 flex items-center justify-center relative">
        <div ref={videoRef} className="absolute inset-0" />
      </div>
    </div>
  );
}
