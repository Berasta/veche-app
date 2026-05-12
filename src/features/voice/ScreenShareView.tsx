import { useEffect, useRef, useState } from "react";
import { Monitor } from "lucide-react";
import { getP2PScreenShare } from "./lib/p2pScreenShare";

interface ScreenShareViewProps {
  sharerId: string;
}

export function ScreenShareView({ sharerId }: ScreenShareViewProps) {
  const mgr = getP2PScreenShare();
  const isLocalSharing = mgr ? sharerId === mgr.localIdentity : false;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(
    () => mgr?.remoteStream ?? null,
  );

  useEffect(() => {
    const m = getP2PScreenShare();
    if (!m) return;
    return m.subscribeStream(setStream);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    if (stream) {
      video.play().catch(() => {
        // Autoplay may be blocked in some contexts; user interaction will unblock it.
      });
    }
  }, [stream]);

  if (isLocalSharing) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-foreground/[0.02] rounded-xl m-3">
        <Monitor className="w-10 h-10 text-primary mb-2" strokeWidth={1.5} />
        <p className="text-sm text-foreground/60">Вы демонстрируете экранъ</p>
        <p className="text-xs text-foreground/30 mt-1">
          Другие участники видят ваш экранъ
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col m-3">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="flex-1 min-h-0 w-full object-contain rounded-xl bg-black"
        />
      ) : (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-foreground/[0.02] rounded-xl">
          <Monitor
            className="w-10 h-10 text-foreground/20 mb-2"
            strokeWidth={1.5}
          />
          <p className="text-sm text-foreground/40">Ожидание потока...</p>
        </div>
      )}
    </div>
  );
}
