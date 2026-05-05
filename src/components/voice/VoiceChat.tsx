import { useState, useCallback, useEffect, useRef } from "react";
import { Volume2, User, ArrowLeft, MicOff, Monitor, Clock } from "lucide-react";
import { ScreenShareModal, type ShareOptions } from "./ScreenShareModal";
import { PageHeader } from "../ui/PageHeader";
import { IconButton } from "../ui/IconButton";
import { ScreenShareDisplay } from "./ScreenShareDisplay";
import { VoiceControls } from "./VoiceControls";
import { useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  selectActiveChannelName,
  selectParticipants,
  selectIsMuted,
  selectIsDeafened,
  selectIsScreenSharing,
  selectSpeakingCount,
  selectVolumes,
  selectError,
  selectCallStartedAt,
  selectConnectionQuality,
} from "@store/selectors/roomSelectors";
import {
  leaveChannel,
  toggleMute,
  toggleDeafen,
  toggleScreenShare,
  setParticipantVolume,
  screenShareElements,
} from "@store/thunks/roomThunk";
import { setScreenShareQuality } from "@store/slices/roomSlice";
import { useVoiceData } from "@hooks/useVoiceData";
import { useOverlay } from "@hooks/useOverlay";
import { UserContextMenu } from "@components/ui/UserContextMenu";

interface VoiceMemberData {
  id: string;
  name: string;
  avatarUrl?: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  volume: number;
  role?: string;
  roleColor?: string;
  banner?: string;
  joinedAt?: string;
}

export function VoiceChat() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { serverId } = useParams();

  useOverlay();

  const connectError = useAppSelector(selectError);

  const channelName = useAppSelector(selectActiveChannelName);
  const participants = useAppSelector(selectParticipants);
  const isMuted = useAppSelector(selectIsMuted);
  const isDeafened = useAppSelector(selectIsDeafened);
  const isScreenSharing = useAppSelector(selectIsScreenSharing);
  const speakingCount = useAppSelector(selectSpeakingCount);
  const volumes = useAppSelector(selectVolumes);

  const callStartedAt = useAppSelector(selectCallStartedAt);
  const connectionQuality = useAppSelector(selectConnectionQuality);
  const [callDuration, setCallDuration] = useState("");

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

  const [showScreenShareModal, setShowScreenShareModal] = useState(false);
  const { userDataMap, roleMap, joinedAtMap } = useVoiceData(serverId, participants.map((p) => p.identity));

  const members: VoiceMemberData[] = participants.map((p) => {
    const ud = userDataMap[p.identity];
    return {
      id: p.identity,
      name: ud?.username || p.name,
      avatarUrl: ud?.avatarUrl,
      isSpeaking: p.isSpeaking,
      isMuted: p.isMuted,
      isDeafened: p.isLocal ? isDeafened : false,
      volume: volumes[p.identity] ?? 100,
      role: roleMap[p.identity]?.name,
      roleColor: roleMap[p.identity]?.color,
      banner: userDataMap[p.identity]?.banner,
      joinedAt: joinedAtMap[p.identity],
    };
  });

  const handleStartScreenShare = useCallback((options: ShareOptions) => {
    const qualityMap = {
      low: "480p" as const,
      medium: "720p" as const,
      high: "1080p" as const,
    };
    dispatch(setScreenShareQuality({ resolution: qualityMap[options.quality], fps: options.fps, bitrate: (options as any).bitrate || 8 }));
    dispatch(toggleScreenShare());
    setShowScreenShareModal(false);
  }, [dispatch]);

  const handleCollapse = useCallback(() => {
    navigate(serverId ? `/app/server/${serverId}` : "/app");
  }, [serverId, navigate]);

  const handleDisconnect = useCallback(() => {
    dispatch(leaveChannel());
    handleCollapse();
  }, [dispatch, handleCollapse]);

  const sharingIdentities = Object.keys(screenShareElements);
  const sharingIdentity = sharingIdentities.length > 0 ? sharingIdentities[0] : undefined;
  const sharerName = sharingIdentity
    ? userDataMap[sharingIdentity]?.username || sharingIdentity
    : undefined;

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
                connectionQuality === "excellent" ? "text-green-500" :
                connectionQuality === "good" ? "text-green-400" :
                connectionQuality === "poor" ? "text-yellow-500" :
                connectionQuality === "lost" ? "text-red-500" :
                "text-muted-foreground/50"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  connectionQuality === "excellent" ? "bg-green-500" :
                  connectionQuality === "good" ? "bg-green-400" :
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

      {/* Main area: sidebar layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Screen share / main area */}
        <div className="flex-1 flex flex-col min-h-0 p-2 md:p-4">
          {isScreenSharing && sharerName && sharingIdentity ? (
            <ScreenShareDisplay sharerName={sharerName} sharerIdentity={sharingIdentity} />
          ) : (
            <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-foreground/10 bg-black/5">
              <div className="text-center">
                <Volume2 className="w-12 h-12 text-foreground/10 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-sm text-foreground/20">Нѣтъ демонстрации экрана</p>
              </div>
            </div>
          )}
        </div>

        {/* Participants sidebar */}
        {members.length > 0 && (
          <div className="w-full md:w-56 lg:w-64 flex flex-col bg-background/40">
            <div className="px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
              <User className="w-3.5 h-3.5 text-foreground/30" strokeWidth={1.5} />
              <span className="text-xs font-semibold text-foreground/30 uppercase tracking-wider">
                {members.length} участник{members.length === 1 ? "" : members.length < 5 ? "а" : "ов"}
                {speakingCount > 0 && (
                  <span className="text-green-500 ml-1.5 font-normal normal-case">
                    · {speakingCount} говоритъ
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
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold
                        ${m.avatarUrl ? "" : m.isSpeaking ? "bg-foreground/10 text-foreground/60" : "bg-foreground/5 text-foreground/30"}
                      `}>
                        {m.avatarUrl ? (
                          <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          m.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      {/* Muted badge */}
                      {m.isMuted && !m.isDeafened && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center ring-[1.5px] ring-background">
                          <MicOff className="w-2 h-2 text-white" />
                        </div>
                      )}
                      {m.isDeafened && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-orange-500 flex items-center justify-center ring-[1.5px] ring-background">
                          <MicOff className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Name + role */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm truncate ${m.isSpeaking ? "text-foreground/80 font-medium" : "text-foreground/40"}`}
                          style={m.roleColor && m.isSpeaking ? { color: m.roleColor } : undefined}>
                          {m.name}
                        </span>
                        {m.isSpeaking && <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />}
                      </div>
                    </div>

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

      {/* Voice Controls */}
      <VoiceControls
        isMuted={isMuted}
        isDeafened={isDeafened}
        isScreenSharing={isScreenSharing}
        onToggleMute={() => dispatch(toggleMute())}
        onToggleDeafen={() => dispatch(toggleDeafen())}
        onToggleScreenShare={() => {
          if (isScreenSharing) {
            dispatch(toggleScreenShare());
          } else {
            setShowScreenShareModal(true);
          }
        }}
        onDisconnect={handleDisconnect}
      />

      {/* Screen Share Modal */}
      {showScreenShareModal && (
        <ScreenShareModal
          onClose={() => setShowScreenShareModal(false)}
          onStart={handleStartScreenShare}
        />
      )}

      {connectError && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20 text-destructive text-sm">
          {connectError}
        </div>
      )}
    </div>
  );
}
