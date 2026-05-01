// src/components/ActiveVoiceBar.tsx
import {
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  Volume2,
  Maximize2,
  Ear,
  EarOff,
} from "lucide-react";

import {
  selectConnected,
  selectConnecting,
  selectActiveChannelName,
  selectActiveChannelId,
  selectActiveServerId,
  selectParticipants,
  selectIsMuted,
  selectSpeakingCount,
  selectIsScreenSharing,
  selectError,
  selectVolumes,
  selectIsDeafened,
} from "../../store/selectors/roomSelectors";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  leaveChannel,
  toggleMute,
  toggleScreenShare,
  toggleDeafen,
} from "@store/thunks/roomThunk";
import { useState, useEffect } from "react";
import { ScreenShareModal } from "./ScreenShareModal";
import { useNavigate } from "react-router";
import { UserPopover } from "@components/ui/UserPopover";
import { getUserById } from "@api/userApi";
import { setParticipantVolume } from "@store/thunks/roomThunk";

export function ActiveVoiceBar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const connected = useAppSelector(selectConnected);
  const connecting = useAppSelector(selectConnecting);
  const isScreenSharing = useAppSelector(selectIsScreenSharing);
  const channelName = useAppSelector(selectActiveChannelName);
  const participants = useAppSelector(selectParticipants);
  const isMuted = useAppSelector(selectIsMuted);
  const isDeafened = useAppSelector(selectIsDeafened);
  const speakingCount = useAppSelector(selectSpeakingCount);
  const activeChannelId = useAppSelector(selectActiveChannelId);
  const activeServerId = useAppSelector(selectActiveServerId);

  const [showScreenModal, setShowScreenModal] = useState(false);
  const error = useAppSelector(selectError);
  const volumes = useAppSelector(selectVolumes);
  const [userDataMap, setUserDataMap] = useState<
    Record<string, { username: string; avatarUrl?: string }>
  >({});

  useEffect(() => {
    const ids = participants.map((p) => p.identity);
    const missing = ids.filter((id) => !userDataMap[id]);
    if (missing.length === 0) return;
    let cancelled = false;
    Promise.all(
      missing.map(async (id) => {
        try {
          const user = await getUserById(id);
          return {
            id,
            data: { username: user.username, avatarUrl: user.avatar_url },
          };
        } catch {
          return { id, data: { username: id, avatarUrl: undefined } };
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      setUserDataMap((prev) => {
        const next = { ...prev };
        results.forEach((r) => {
          next[r.id] = r.data;
        });
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [participants]);

  return (
    <>
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-b border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}
      <div
      className={`
      bottom-0 left-0 right-0 z-50
      bg-background border-t border-border
      px-3 py-2 md:px-4 md:py-2 flex items-center gap-2 md:gap-3 shadow-lg
    `}
      >
        <button
          onClick={() =>
            console.log("=== HOTKEY DEBUG ===", {
              connected: document.querySelector("[data-debug-hotkeys]"),
            })
          }
          className="hidden"
        >
          debug
        </button>
        <div
          data-debug-hotkeys
          className="hidden text-[10px] text-muted-foreground font-mono px-2"
        >
          {import.meta.env.DEV ? "DEV" : "PROD"}
        </div>
        {!connected && !connecting ? (
          <div className="text-sm text-muted-foreground">
            Нет активной голосовой связи
          </div>
        ) : null}
        {/* Канал */}
        <div
          className={`flex items-center gap-2 flex-1 min-w-0 ${!connected ? "invisible" : ""}`}
        >
          <div className="relative">
            <Volume2 size={18} className="text-green-500" />
            {speakingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm md:text-base font-medium truncate">
              {channelName}
            </p>
            <p className="text-xs text-muted-foreground">
              {connecting
                ? "Подключение..."
                : `${participants.length} участник${
                    participants.length === 1
                      ? ""
                      : participants.length < 5
                        ? "а"
                        : "ов"
                  }`}
            </p>
          </div>
        </div>

        {/* Аватары участников — скрываем на мобильных */}
        <div className="hidden md:flex items-center">
          {participants.slice(0, 4).map((p) => {
            const ud = userDataMap[p.identity];
            return (
              <div key={p.identity} className="-mr-2 last:mr-0">
                <UserPopover
                  username={ud?.username || p.name}
                  avatarUrl={ud?.avatarUrl}
                  volume={volumes[p.identity]}
                  onVolumeChange={(v) =>
                    dispatch(
                      setParticipantVolume({ identity: p.identity, volume: v }),
                    )
                  }
                >
                  <div
                    className={`w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold overflow-hidden cursor-pointer ${
                      p.isSpeaking
                        ? "ring-2 ring-primary"
                        : p.isMuted
                          ? "opacity-60"
                          : ""
                    } ${p.isLocal ? "bg-violet-600 text-white" : "bg-muted text-foreground"}`}
                  >
                    {ud?.avatarUrl ? (
                      <img
                        src={ud.avatarUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (ud?.username || p.name).charAt(0).toUpperCase()
                    )}
                  </div>
                </UserPopover>
              </div>
            );
          })}
          {participants.length > 4 && (
            <div className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs flex-shrink-0">
              +{participants.length - 4}
            </div>
          )}
        </div>

        {/* Кол-во участников на мобильных */}
        {connected && participants.length > 0 && (
          <div className="md:hidden text-xs text-muted-foreground flex-shrink-0">
            {participants.length} уч.
          </div>
        )}

        {/* Раскрыть звонок */}
        {connected && activeServerId && activeChannelId && (
          <button
            onClick={() =>
              navigate(`/app/server/${activeServerId}/voice/${activeChannelId}`)
            }
            title="Раскрыти звонокъ"
            className="p-2 md:p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <Maximize2 size={16} />
          </button>
        )}

        {/* Контролы */}
        <div
          className={`flex items-center gap-0.5 md:gap-1 ${!connected ? "invisible" : ""}`}
        >
          <button
            onClick={() => dispatch(toggleMute())}
            title={isMuted ? "Включить микрофон" : "Выключить микрофон"}
            className={`
            p-2 md:p-2 rounded-md transition-colors
            ${
              isMuted
                ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            }
          `}
          >
            {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          <button
            onClick={() => dispatch(leaveChannel())}
            title="Выйти из канала"
            className="p-2 md:p-2 rounded-md bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
          >
            <PhoneOff size={16} />
          </button>

          <div className="relative">
            <button
              onClick={() =>
                isScreenSharing
                  ? dispatch(toggleScreenShare())
                  : setShowScreenModal(true)
              }
              className={`
              p-2 md:p-2 rounded-md transition-colors
              ${
                isScreenSharing
                  ? "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }
            `}
            >
              {isScreenSharing ? (
                <MonitorOff size={16} />
              ) : (
                <Monitor size={16} />
              )}
            </button>

            {showScreenModal && (
              <ScreenShareModal onClose={() => setShowScreenModal(false)} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
