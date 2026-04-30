import { Monitor, X } from "lucide-react";
import { useRef, useEffect } from "react";
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

  useEffect(() => {
    if (!videoRef.current || !sharerIdentity) return;
    const el = screenShareElements[sharerIdentity];
    if (el) {
      videoRef.current.appendChild(el);
      el.style.cssText = "width:100%;height:100%;object-fit:contain";
    }
  }, [sharerIdentity]);

  return (
    <div className="relative bg-card/60 backdrop-blur-sm rounded-lg border border-border overflow-hidden mb-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between px-4 py-2 bg-sidebar/30 border-b border-border">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-primary" strokeWidth={2} />
          <span className="text-xs text-muted-foreground">
            {sharerName} показуетъ экранъ
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-md hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Область демонстрации */}
      <div className="aspect-video bg-black/90 flex items-center justify-center relative">
        <div ref={videoRef} className="absolute inset-0" />
      </div>
    </div>
  );
}
