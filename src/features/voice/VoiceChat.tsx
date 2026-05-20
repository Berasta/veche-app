import { useState, useCallback, useEffect } from "react";
import { Volume2, User, ArrowLeft, Clock } from "lucide-react";
import {
  useParticipants,
  useLocalParticipant,
  useSpeakingParticipants,
  RoomContext,
} from "@livekit/components-react";
import { getActiveRoom, subscribeRoom } from "@shared/lib/voiceRoom";
import { UserAvatar } from "@entities/user/ui/UserAvatar";
import { PageHeader } from "@shared/ui/PageHeader";
import { IconButton } from "@shared/ui/IconButton";
import { VoiceControls, type MuteMode } from "./VoiceControls";
import { ScreenShareView } from "./ScreenShareView";
import { getP2PScreenShare } from "./lib/p2pScreenShare";
import {
  getSavedScreenShareQuality,
  getQualityPresets,
  type ScreenShareQuality,
} from "./lib/p2pScreenShare";
import { useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import {
  selectActiveChannelName,
  selectIsDeafened,
  selectVolumes,
  selectError,
  selectCallStartedAt,
  selectConnectionQuality,
  selectConnected,
  selectConnecting,
  selectScreenSharerId,
} from "@entities/room/model/roomSelectors";
import {
  leaveChannel,
  toggleMute,
  toggleDeafen,
  setParticipantVolume,
} from "@store/thunks/roomThunk";
import { toast } from "sonner";
import { useVoiceData } from "@shared/hooks/useVoiceData";
import { useOverlay } from "@shared/hooks/useOverlay";
import { UserContextMenu } from "@entities/user/ui/UserContextMenu";

interface VoiceMemberData {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarFrame?: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  volume: number;
  role?: string;
  roleColor?: string;
  banner?: string;
  joinedAt?: string;
}

// Inner component — only rendered when RoomContext is guaranteed to exist.
function VoiceChatConnected({ serverId }: { serverId?: string }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useOverlay();

  // LiveKit хуки — работают внутри VoiceRoomProvider (RoomContext.Provider)
  const participants = useParticipants();
  const speakingParticipants = useSpeakingParticipants();
  const { isMicrophoneEnabled } = useLocalParticipant();

  // Redux — только для не-LiveKit стейта
  const connectError = useAppSelector(selectError);
  const channelName = useAppSelector(selectActiveChannelName);
  const isDeafened = useAppSelector(selectIsDeafened);
  const volumes = useAppSelector(selectVolumes);
  const callStartedAt = useAppSelector(selectCallStartedAt);
  const connectionQuality = useAppSelector(selectConnectionQuality);
  const screenSharerId = useAppSelector(selectScreenSharerId);

  const isMuted = !isMicrophoneEnabled;
  const speakingCount = speakingParticipants.length;

  const [callDuration, setCallDuration] = useState("");
  const [muteMode, setMuteMode] = useState<MuteMode>("toggle");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("muteMode");
      if (saved && ["toggle", "push-to-talk", "push-to-mute"].includes(saved)) {
        setMuteMode(saved as MuteMode);
      }
    } catch (err) {
      console.warn("[VoiceChat] Failed to read muteMode:", err);
    }
  }, []);

  useEffect(() => {
    if (!callStartedAt) { setCallDuration(""); return; }
    const tick = () => {
      const sec = Math.floor((Date.now() - callStartedAt) / 1000);
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      setCallDuration(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [callStartedAt]);

  const { userDataMap, roleMap, joinedAtMap } = useVoiceData(serverId, participants.map((p) => p.identity));

  const members: VoiceMemberData[] = participants.map((p) => {
    const ud = userDataMap[p.identity];
    return {
      id: p.identity,
      name: p.isLocal ? "Вы" : (ud?.username || p.name || p.identity),
      avatarUrl: ud?.avatarUrl,
      avatarFrame: ud?.avatarFrame,
      isSpeaking: p.isSpeaking,
      isMuted: !p.isMicrophoneEnabled,
      isDeafened: p.isLocal ? isDeafened : false,
      volume: volumes[p.identity] ?? 100,
      role: roleMap[p.identity]?.name,
      roleColor: roleMap[p.identity]?.color,
      banner: userDataMap[p.identity]?.banner,
      joinedAt: joinedAtMap[p.identity],
    };
  });

  const handleCollapse = useCallback(() => {
    navigate(serverId ? `/app/server/${serverId}` : "/app");
  }, [serverId, navigate]);

  const handleDisconnect = useCallback(() => {
    dispatch(leaveChannel());
    handleCollapse();
  }, [dispatch, handleCollapse]);

  const [screenShareQuality, setScreenShareQuality] = useState<ScreenShareQuality>(
    () => getSavedScreenShareQuality(),
  );

  const handleToggleScreenShare = useCallback(async () => {
    const mgr = getP2PScreenShare();
    if (!mgr) return;
    if (mgr.isLocalSharing) {
      mgr.stopSharing();
    } else {
      const result = await mgr.startSharing(screenShareQuality);
      if (result === "busy") toast.error("Кто-то уже демонстрирует экранъ");
    }
  }, [screenShareQuality]);

  return (
    <div className="flex-1 flex flex-col bg-background relative z-10 min-w-0 pt-14 md:pt-0">
      {/* Header */}
      <PageHeader
        icon={Volume2}
        title={channelName || "Глашатаи"}
        subtitle={
          <span className="flex items-center gap-2">
            {callDuration && (
              <span className="flex items-center gap-1 text-muted-foreground/70">
                <Clock size={11} strokeWidth={1.5} />
                {callDuration}
              </span>
            )}
            {connectionQuality !== "unknown" && (
              <span className={`flex items-center gap-1 text-[10px] ${
                connectionQuality === "excellent" ? "text-primary" :
                connectionQuality === "good" ? "text-primary/70" :
                connectionQuality === "poor" ? "text-yellow-500" :
                connectionQuality === "lost" ? "text-red-500" :
                "text-muted-foreground/50"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  connectionQuality === "excellent" ? "bg-primary" :
                  connectionQuality === "good" ? "bg-primary/70" :
                  connectionQuality === "poor" ? "bg-yellow-500" :
                  connectionQuality === "lost" ? "bg-red-500" :
                  "bg-muted-foreground/30"
                }`} />
                {connectionQuality === "excellent" ? "Отличное" :
                 connectionQuality === "good" ? "Хорошее" :
                 connectionQuality === "poor" ? "Плохое" :
                 connectionQuality === "lost" ? "Потеряно" : ""}
              </span>
            )}
            {participants.length > 0 && (
              <span>{participants.length} участник{participants.length === 1 ? "" : participants.length < 5 ? "а" : "ов"}</span>
            )}
          </span>
        }
        onMenuClick={handleCollapse}
        actions={
          <IconButton icon={ArrowLeft} onClick={handleCollapse} tooltip="Свернуть звонокъ" />
        }
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Screen share: takes all remaining space when active */}
        {screenSharerId && (
          <div className="flex-1 min-w-0 min-h-0">
            <ScreenShareView sharerId={screenSharerId} />
          </div>
        )}

        {/* Participants: sidebar when sharing, full width otherwise */}
        <div className={`flex flex-col min-h-0 flex-shrink-0 ${
          screenSharerId
            ? "md:w-52 w-full border-t md:border-t-0 md:border-l border-foreground/5"
            : "flex-1"
        }`}>
        {members.length > 0 && (
          <div className="w-full flex flex-col h-full">
            <div className="px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
              <User className="w-3.5 h-3.5 text-foreground/30" strokeWidth={1.5} />
              <span className="text-xs font-semibold text-foreground/30 uppercase tracking-wider">
                {members.length} участник{members.length === 1 ? "" : members.length < 5 ? "а" : "ов"}
                {speakingCount > 0 && (
                  <span className="text-primary ml-1.5 font-normal normal-case">
                    · {speakingCount}
                  </span>
                )}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
              {members.map((m) => (
                <UserContextMenu key={m.id} serverId={serverId} userId={m.id} username={m.name} isVoiceParticipant>
                  <div
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors cursor-pointer group
                      ${m.isSpeaking ? "bg-foreground/[0.06]" : "hover:bg-foreground/[0.03]"}
                    `}
                  >
                    <UserAvatar user={{ id: m.id, username: m.name, avatarUrl: m.avatarUrl, avatarFrame: m.avatarFrame, role: m.role, roleColor: m.roleColor, isSpeaking: m.isSpeaking, isMuted: m.isMuted, isDeafened: m.isDeafened }} size="md" isSpeaking={m.isSpeaking} showName />

                    {/* Speaking wave bars */}
                    {m.isSpeaking && (
                      <span className="flex items-center gap-px h-3 flex-shrink-0">
                        <span className="w-0.5 bg-primary rounded-full animate-[speak_0.4s_ease-in-out_infinite_0ms]" />
                        <span className="w-0.5 bg-primary rounded-full animate-[speak_0.4s_ease-in-out_infinite_100ms]" />
                        <span className="w-0.5 bg-primary rounded-full animate-[speak_0.4s_ease-in-out_infinite_200ms]" />
                      </span>
                    )}

                    {/* Volume */}
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={m.volume}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => dispatch(setParticipantVolume({ identity: m.id, volume: Number(e.target.value) }))}
                      className="w-16 h-1 rounded-full appearance-none cursor-pointer bg-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground/30 [&::-webkit-slider-thumb]:cursor-pointer"
                      aria-label="Громкость"
                    />
                  </div>
                </UserContextMenu>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Voice Controls */}
      <VoiceControls
        isMuted={isMuted}
        isDeafened={isDeafened}
        muteMode={muteMode}
        onToggleMute={() => dispatch(toggleMute())}
        onToggleDeafen={() => dispatch(toggleDeafen())}
        onDisconnect={handleDisconnect}
        isScreenSharing={screenSharerId !== null && screenSharerId === getP2PScreenShare()?.localIdentity}
        isScreenShareBusy={screenSharerId !== null && screenSharerId !== getP2PScreenShare()?.localIdentity}
        onToggleScreenShare={handleToggleScreenShare}
        screenShareQuality={screenShareQuality}
        onScreenShareQualityChange={(q) => setScreenShareQuality(q)}
      />

      {connectError && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20 text-destructive text-sm">
          {connectError}
        </div>
      )}
    </div>
  );
}

// Outer wrapper — guards against rendering LiveKit hooks without a RoomContext.
export function VoiceChat() {
  const connected = useAppSelector(selectConnected);
  const connecting = useAppSelector(selectConnecting);
  const navigate = useNavigate();
  const { serverId } = useParams();
  const [room, setRoom] = useState(() => getActiveRoom());

  useEffect(() => subscribeRoom(setRoom), []);

  // Redirect back if there's no active call and we're not in the process of connecting.
  useEffect(() => {
    if (!connected && !connecting) {
      navigate(serverId ? `/app/server/${serverId}` : "/app", { replace: true });
    }
  }, [connected, connecting, navigate, serverId]);

  if (!connected || !room) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Volume2 className="w-8 h-8 text-foreground/10 animate-pulse" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <RoomContext.Provider value={room}>
      <VoiceChatConnected serverId={serverId} />
    </RoomContext.Provider>
  );
}
