import {
  Mic,
  MicOff,
  Ear,
  EarOff,
  PhoneOff,
  Monitor,
  MonitorOff,
} from "lucide-react";

export type MuteMode = "toggle" | "push-to-talk" | "push-to-mute";

interface VoiceControlsProps {
  isMuted: boolean;
  isDeafened: boolean;
  onToggleMute: () => void;
  onToggleDeafen: () => void;
  onDisconnect: () => void;
  muteMode?: MuteMode;
  isScreenSharing?: boolean;
  isScreenShareBusy?: boolean;
  onToggleScreenShare?: () => void;
}

export function VoiceControls({
  isMuted,
  isDeafened,
  onToggleMute,
  onToggleDeafen,
  onDisconnect,
  muteMode = "toggle",
  isScreenSharing = false,
  isScreenShareBusy = false,
  onToggleScreenShare,
}: VoiceControlsProps) {
  const getMuteLabel = () => {
    if (muteMode === "push-to-talk") {
      return isMuted ? "Зажмите клавишу чтобы говорить" : "Отпустите клавишу";
    } else if (muteMode === "push-to-mute") {
      return isMuted ? "Отпустите клавишу" : "Зажмите клавишу чтобы замьютиться";
    }
    return isMuted ? "Включити микрофонъ" : "Выключити микрофонъ";
  };

  const getModeIndicator = () => {
    if (muteMode === "push-to-talk") return "PTT";
    if (muteMode === "push-to-mute") return "PTM";
    return null;
  };

  const modeIndicator = getModeIndicator();

  return (
    <div className="bg-foreground/[0.02] backdrop-blur-xl px-4 py-2.5">
      <div className="flex items-center justify-center gap-2">
        <div className="relative">
          <button
            onClick={onToggleMute}
            title={getMuteLabel()}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              isMuted
                ? "bg-red-500/15 text-red-500"
                : "text-foreground/30 hover:text-foreground/60 hover:bg-foreground/5"
            }`}
          >
            {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          {modeIndicator && (
            <span className="absolute -top-1 -right-1 bg-primary/90 text-primary-foreground text-[9px] font-bold px-1 py-0.5 rounded leading-none">
              {modeIndicator}
            </span>
          )}
        </div>

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

        <div className="w-px h-5 bg-foreground/10" />

        {onToggleScreenShare && (
          <button
            onClick={onToggleScreenShare}
            disabled={isScreenShareBusy && !isScreenSharing}
            title={
              isScreenSharing
                ? "Остановить демонстрацiю экрана"
                : isScreenShareBusy
                ? "Кто-то уже демонстрирует экранъ"
                : "Демонстрировать экранъ"
            }
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              isScreenSharing
                ? "bg-primary/15 text-primary"
                : isScreenShareBusy
                ? "text-foreground/20 cursor-not-allowed"
                : "text-foreground/30 hover:text-foreground/60 hover:bg-foreground/5"
            }`}
          >
            {isScreenSharing ? <MonitorOff size={16} /> : <Monitor size={16} />}
          </button>
        )}

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
