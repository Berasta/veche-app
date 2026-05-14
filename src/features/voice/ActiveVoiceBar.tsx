import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  Maximize2,
  Ear,
  EarOff,
  Monitor,
} from "lucide-react";
import {
  selectConnected,
  selectConnecting,
  selectReconnecting,
  selectActiveChannelName,
  selectActiveChannelId,
  selectActiveServerId,
  selectParticipantCount,
  selectIsMuted,
  selectSpeakingCount,
  selectError,
  selectIsDeafened,
  selectScreenSharerId,
} from "@entities/room/model/roomSelectors";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import {
  leaveChannel,
  toggleMute,
  toggleDeafen,
} from "@store/thunks/roomThunk";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { getP2PScreenShare, getSavedScreenShareQuality } from "./lib/p2pScreenShare";
import type { MuteMode } from "./VoiceControls";

export function ActiveVoiceBar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const connected = useAppSelector(selectConnected);
  const connecting = useAppSelector(selectConnecting);
  const reconnecting = useAppSelector(selectReconnecting);
  const channelName = useAppSelector(selectActiveChannelName);
  const participantCount = useAppSelector(selectParticipantCount);
  const isMuted = useAppSelector(selectIsMuted);
  const isDeafened = useAppSelector(selectIsDeafened);
  const speakingCount = useAppSelector(selectSpeakingCount);
  const activeChannelId = useAppSelector(selectActiveChannelId);
  const activeServerId = useAppSelector(selectActiveServerId);
  const error = useAppSelector(selectError);
  const screenSharerId = useAppSelector(selectScreenSharerId);

  const [muteMode, setMuteMode] = useState<MuteMode>("toggle");

  const isLocalSharing = screenSharerId !== null && screenSharerId === getP2PScreenShare()?.localIdentity;
  const isScreenShareBusy = screenSharerId !== null && !isLocalSharing;

  const handleToggleScreenShare = useCallback(async () => {
    const mgr = getP2PScreenShare();
    if (!mgr) return;
    if (mgr.isLocalSharing) {
      mgr.stopSharing();
    } else {
      const result = await mgr.startSharing(getSavedScreenShareQuality());
      if (result === "busy") toast.error("Кто-то уже демонстрирует экранъ");
    }
  }, []);

  // Читаем режим мьюта из localStorage
  useEffect(() => {
    const readMuteMode = () => {
      try {
        const saved = localStorage.getItem("muteMode");
        if (saved && ["toggle", "push-to-talk", "push-to-mute"].includes(saved)) {
          setMuteMode(saved as MuteMode);
        }
      } catch (err) {
        console.error("Ошибка чтенiя режима мьюта", err);
      }
    };
    readMuteMode();
    const interval = setInterval(readMuteMode, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!connected && !connecting && !error) return null;

  return (
    <>
      {error && (
        <div className="px-4 py-1.5 bg-red-500/10 text-red-500 text-xs text-center">
          {error}
        </div>
      )}
      <div className="h-10 bg-foreground/[0.02] backdrop-blur-xl flex items-center px-3 gap-2 z-50 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-foreground/5 pointer-events-none" />

        {connecting ? (
          <div className="flex items-center gap-2 text-xs text-foreground/40 flex-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
            Подключение къ каналу...
          </div>
        ) : connected ? (
          <>
            {/* Channel info */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <Volume2 size={14} className="text-primary" />
                {speakingCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-foreground/80 truncate">
                    {channelName}
                  </span>
                  <span className="text-[10px] text-foreground/30 flex-shrink-0">
                    {participantCount} уч.
                  </span>
                  {speakingCount > 0 && (
                    <span className="text-[10px] text-primary flex-shrink-0 font-medium">
                      · {speakingCount}
                    </span>
                  )}
                  {screenSharerId && (
                    <span title="Демонстрация экрана" className="flex-shrink-0">
                      <Monitor size={10} className="text-primary" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-0.5">
              <div className="relative">
                <button
                  onClick={() => dispatch(toggleMute())}
                  title={isMuted ? "Включить микрофон" : "Выключить микрофон"}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isMuted
                      ? "bg-red-500/15 text-red-500"
                      : "hover:bg-foreground/5 text-foreground/30 hover:text-foreground/60"
                  }`}
                >
                  {isMuted ? <MicOff size={13} /> : <Mic size={13} />}
                </button>
                {(muteMode === "push-to-talk" || muteMode === "push-to-mute") && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary/90 text-primary-foreground text-[8px] font-bold px-0.5 rounded leading-none">
                    {muteMode === "push-to-talk" ? "PTT" : "PTM"}
                  </span>
                )}
              </div>

              <button
                onClick={() => dispatch(toggleDeafen())}
                title={isDeafened ? "Включить звукъ" : "Оглушити"}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  isDeafened
                    ? "bg-red-500/15 text-red-500"
                    : "hover:bg-foreground/5 text-foreground/30 hover:text-foreground/60"
                }`}
              >
                {isDeafened ? <EarOff size={13} /> : <Ear size={13} />}
              </button>

              <button
                onClick={handleToggleScreenShare}
                disabled={isScreenShareBusy}
                title={
                  isLocalSharing
                    ? "Остановить демонстрацiю"
                    : isScreenShareBusy
                    ? "Демонстрацiя занята"
                    : "Демонстрировать экранъ"
                }
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  isLocalSharing
                    ? "bg-primary/15 text-primary"
                    : isScreenShareBusy
                    ? "text-foreground/20 cursor-not-allowed"
                    : "hover:bg-foreground/5 text-foreground/30 hover:text-foreground/60"
                }`}
              >
                <Monitor size={13} />
              </button>

              {activeServerId && activeChannelId && (
                <button
                  onClick={() => navigate(`/app/server/${activeServerId}/voice/${activeChannelId}`)}
                  title="Раскрыть звонокъ"
                  className="w-7 h-7 rounded-lg hover:bg-foreground/5 text-foreground/30 hover:text-foreground/60 flex items-center justify-center transition-colors"
                >
                  <Maximize2 size={13} />
                </button>
              )}

              <div className="w-px h-4 bg-foreground/10 mx-1" />

              <button
                onClick={() => dispatch(leaveChannel())}
                title="Покинуть каналъ"
                className="w-7 h-7 rounded-lg hover:bg-red-500/10 text-foreground/30 hover:text-red-500 flex items-center justify-center transition-colors"
              >
                <PhoneOff size={13} />
              </button>
            </div>
          </>
        ) : null}
      </div>

    </>
  );
}
