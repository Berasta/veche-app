import {
  Mic,
  MicOff,
  Ear,
  EarOff,
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
    <div className="bg-foreground/[0.02] backdrop-blur-xl px-4 py-2.5">
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={onToggleMute}
          title={isMuted ? "Включити микрофонъ" : "Выключити микрофонъ"}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            isMuted
              ? "bg-red-500/15 text-red-500"
              : "text-foreground/30 hover:text-foreground/60 hover:bg-foreground/5"
          }`}
        >
          {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <button
          onClick={onToggleDeafen}
          title={isDeafened ? "Включити звукъ" : "Оглушити"}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            isDeafened
              ? "bg-red-500/15 text-red-500"
              : "text-foreground/30 hover:text-foreground/60 hover:bg-foreground/5"
          }`}
        >
          {isDeafened ? <EarOff size={16} /> : <Ear size={16} />}
        </button>

        <button
          onClick={onToggleScreenShare}
          title={isScreenSharing ? "Остановити показъ" : "Показати свой экранъ"}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            isScreenSharing
              ? "bg-blue-500/15 text-blue-500"
              : "text-foreground/30 hover:text-foreground/60 hover:bg-foreground/5"
          }`}
        >
          {isScreenSharing ? <MonitorOff size={16} /> : <Monitor size={16} />}
        </button>

        <div className="w-px h-5 bg-foreground/10" />

        <button
          onClick={onDisconnect}
          title="Покинути голосовую палату"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground/30 hover:text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <PhoneOff size={16} />
        </button>
      </div>
    </div>
  );
}
