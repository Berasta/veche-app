import {
  Mic,
  MicOff,
  Headphones,
  HeadphoneOff,
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
    <div className="border-t border-border bg-card/30 px-3 py-2">
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={onToggleMute}
          title={isMuted ? "Включити микрофонъ" : "Выключити микрофонъ"}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isMuted
              ? "bg-red-500/20 text-red-500"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {isMuted ? <MicOff size={15} /> : <Mic size={15} />}
        </button>

        <button
          onClick={onToggleDeafen}
          title={isDeafened ? "Включити звукъ" : "Оглушити"}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isDeafened
              ? "bg-red-500/20 text-red-500"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {isDeafened ? <HeadphoneOff size={15} /> : <Headphones size={15} />}
        </button>

        <button
          onClick={onToggleScreenShare}
          title={isScreenSharing ? "Остановити показъ" : "Показати свой экранъ"}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isScreenSharing
              ? "bg-blue-500/20 text-blue-500"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {isScreenSharing ? <MonitorOff size={15} /> : <Monitor size={15} />}
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button
          onClick={onDisconnect}
          title="Покинути голосовую палату"
          className="w-8 h-8 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-500 flex items-center justify-center transition-colors"
        >
          <PhoneOff size={15} />
        </button>
      </div>
    </div>
  );
}
