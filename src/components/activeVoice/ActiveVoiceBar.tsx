import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  Maximize2,
  Ear,
  EarOff,
  Monitor,
  MonitorOff,
} from "lucide-react";
import {
  selectConnected,
  selectConnecting,
  selectReconnecting,
  selectActiveChannelName,
  selectActiveChannelId,
  selectActiveServerId,
  selectParticipants,
  selectIsMuted,
  selectSpeakingCount,
  selectIsScreenSharing,
  selectError,
  selectIsDeafened,
} from "../../store/selectors/roomSelectors";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  leaveChannel,
  toggleMute,
  toggleScreenShare,
  toggleDeafen,
} from "@store/thunks/roomThunk";
import { useState } from "react";
import { ScreenShareModal } from "./ScreenShareModal";
import { useNavigate } from "react-router";

export function ActiveVoiceBar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const connected = useAppSelector(selectConnected);
  const connecting = useAppSelector(selectConnecting);
  const reconnecting = useAppSelector(selectReconnecting);
  const isScreenSharing = useAppSelector(selectIsScreenSharing);
  const channelName = useAppSelector(selectActiveChannelName);
  const participants = useAppSelector(selectParticipants);
  const isMuted = useAppSelector(selectIsMuted);
  const isDeafened = useAppSelector(selectIsDeafened);
  const speakingCount = useAppSelector(selectSpeakingCount);
  const activeChannelId = useAppSelector(selectActiveChannelId);
  const activeServerId = useAppSelector(selectActiveServerId);
  const error = useAppSelector(selectError);

  const [showScreenModal, setShowScreenModal] = useState(false);

  if (!connected && !connecting && !error) return null;

  return (
    <>
      {error && (
        <div className="px-4 py-1.5 bg-destructive/10 text-destructive text-xs text-center">
          {error}
        </div>
      )}
      <div className="h-10 bg-card border-t border-border flex items-center px-3 gap-2 z-50">
        {/* Reconnecting banner */}
        {reconnecting && (
          <div className="absolute inset-x-0 -top-5 h-5 bg-yellow-500/10 text-yellow-600 text-[10px] flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
            Переподключение...
          </div>
        )}

        {connecting ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
            Подключение къ каналу...
          </div>
        ) : connected ? (
          <>
            {/* Channel info */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <Volume2 size={14} className="text-green-500" />
                {speakingCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-foreground truncate">
                    {channelName}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 flex-shrink-0">
                    {participants.length} уч.
                  </span>
                  {speakingCount > 0 && (
                    <span className="text-[10px] text-green-500 flex-shrink-0 font-medium">
                      · {speakingCount} говоритъ
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => dispatch(toggleMute())}
                title={isMuted ? "Включить микрофон" : "Выключить микрофон"}
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                  isMuted
                    ? "bg-red-500/20 text-red-500"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {isMuted ? <MicOff size={13} /> : <Mic size={13} />}
              </button>

              <button
                onClick={() => dispatch(toggleDeafen())}
                title={isDeafened ? "Включить звукъ" : "Оглушити"}
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                  isDeafened
                    ? "bg-red-500/20 text-red-500"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {isDeafened ? <EarOff size={13} /> : <Ear size={13} />}
              </button>

              <button
                onClick={() =>
                  isScreenSharing
                    ? dispatch(toggleScreenShare())
                    : setShowScreenModal(true)
                }
                title={isScreenSharing ? "Остановить показъ" : "Показать экранъ"}
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                  isScreenSharing
                    ? "bg-blue-500/20 text-blue-500"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {isScreenSharing ? <MonitorOff size={13} /> : <Monitor size={13} />}
              </button>

              {activeServerId && activeChannelId && (
                <button
                  onClick={() => navigate(`/app/server/${activeServerId}/voice/${activeChannelId}`)}
                  title="Раскрыть звонокъ"
                  className="w-7 h-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                >
                  <Maximize2 size={13} />
                </button>
              )}

              <div className="w-px h-4 bg-border mx-1" />

              <button
                onClick={() => dispatch(leaveChannel())}
                title="Покинуть каналъ"
                className="w-7 h-7 rounded-md hover:bg-red-500/20 text-muted-foreground hover:text-red-500 flex items-center justify-center transition-colors"
              >
                <PhoneOff size={13} />
              </button>
            </div>
          </>
        ) : null}
      </div>

      {showScreenModal && (
        <ScreenShareModal onClose={() => setShowScreenModal(false)} />
      )}
    </>
  );
}
