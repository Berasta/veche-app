import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Monitor,
  MonitorOff,
  PhoneOff,
} from "lucide-react";

interface VoiceControlsProps {
  isMuted: boolean;
  isDeafened: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleDeafen: () => void;
  onToggleScreenShare: () => void;
  onDisconnect: () => void;
}

export function VoiceControls({
  isMuted,
  isDeafened,
  isScreenSharing,
  onToggleMute,
  onToggleDeafen,
  onToggleScreenShare,
  onDisconnect,
}: VoiceControlsProps) {
  return (
    <div className="border-t border-border bg-card/30 backdrop-blur-xl px-4 py-3">
      <div className="flex items-center justify-center gap-2 max-w-lg mx-auto">
        {/* Микрофон */}
        <button
          onClick={onToggleMute}
          title={isMuted ? "Включити микрофонъ" : "Выключити микрофонъ"}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center transition-all
            ${
              isMuted
                ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                : "bg-muted/50 text-foreground hover:bg-muted"
            }
          `}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* Оглушение */}
        <button
          onClick={onToggleDeafen}
          title={isDeafened ? "Включити звукъ" : "Оглушити"}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center transition-all
            ${
              isDeafened
                ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                : "bg-muted/50 text-foreground hover:bg-muted"
            }
          `}
        >
          {isDeafened ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        {/* Демонстрация экрана */}
        <button
          onClick={onToggleScreenShare}
          title={
            isScreenSharing
              ? "Остановити показъ"
              : "Показати свой экранъ"
          }
          className={`
            w-12 h-12 rounded-full flex items-center justify-center transition-all
            ${
              isScreenSharing
                ? "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
                : "bg-muted/50 text-foreground hover:bg-muted"
            }
          `}
        >
          {isScreenSharing ? (
            <MonitorOff size={20} />
          ) : (
            <Monitor size={20} />
          )}
        </button>

        {/* Выход */}
        <button
          onClick={onDisconnect}
          title="Покинути голосовую палату"
          className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/30 flex items-center justify-center transition-all"
        >
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  );
}
