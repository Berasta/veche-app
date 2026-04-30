import { useState, useEffect, useCallback } from "react";
import { Volume2, User, ArrowLeft } from "lucide-react";
import { ScreenShareModal, type ShareOptions } from "./ScreenShareModal";
import { PageHeader } from "../ui/PageHeader";
import { IconButton } from "../ui/IconButton";
import { VoiceMemberCard, type VoiceMember } from "./VoiceMemberCard";
import { ScreenShareDisplay } from "./ScreenShareDisplay";
import { VoiceControls } from "./VoiceControls";
import { useNavigate, useParams } from "react-router";
import { useOverlay } from "@hooks/useOverlay";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  selectActiveChannelName,
  selectParticipants,
  selectIsMuted,
  selectIsScreenSharing,
  selectError,
  selectSpeakingCount,
  selectVolumes,
} from "@store/selectors/roomSelectors";
import {
  leaveChannel,
  toggleMute,
  toggleScreenShare,
  setParticipantVolume,
  screenShareElements,
} from "@store/thunks/roomThunk";
import { setScreenShareQuality } from "@store/slices/roomSlice";
import { getUserById } from "@api/userApi";
import { pb } from "@api/pb";
import { getRoleMap } from "@api/rolesApi";

export function VoiceChat() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { serverId } = useParams();

  useOverlay();

  const connectError = useAppSelector(selectError);

  const channelName = useAppSelector(selectActiveChannelName);
  const participants = useAppSelector(selectParticipants);
  const isMuted = useAppSelector(selectIsMuted);
  const isScreenSharing = useAppSelector(selectIsScreenSharing);
  const speakingCount = useAppSelector(selectSpeakingCount);
  const volumes = useAppSelector(selectVolumes);

  const [isDeafened, setIsDeafened] = useState(false);
  const [showScreenShareModal, setShowScreenShareModal] = useState(false);
  const [userDataMap, setUserDataMap] = useState<
    Record<string, { username: string; avatarUrl?: string; banner?: string }>
  >({});
  const [roleMap, setRoleMap] = useState<Record<string, { name: string; color: string }>>({});
  const [joinedAtMap, setJoinedAtMap] = useState<Record<string, string>>({});

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
            data: { username: user.username, avatarUrl: user.avatar_url, banner: user.banner },
          };
        } catch {
          return { id, data: { username: id, avatarUrl: undefined, banner: undefined } };
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

  useEffect(() => {
    if (!serverId) return;
    getRoleMap(serverId).then(setRoleMap).catch(() => {});
    pb.collection("server_members").getFullList({
      filter: `server_id = "${serverId}"`,
    }).then((list) => {
      const map: Record<string, string> = {};
      for (const entry of list as any[]) {
        map[entry.user_id] = entry.created;
      }
      setJoinedAtMap(map);
    }).catch(() => {});
  }, [serverId]);

  const voiceMembers: VoiceMember[] = participants.map((p) => {
    const ud = userDataMap[p.identity];
    return {
      id: p.identity,
      name: ud?.username || p.name,
      avatarUrl: ud?.avatarUrl,
      icon: User,
      isSpeaking: p.isSpeaking,
      isMuted: p.isMuted,
      isScreenSharing: false,
    };
  });

  const handleStartScreenShare = useCallback((options: ShareOptions) => {
    const qualityMap = {
      low: "480p" as const,
      medium: "720p" as const,
      high: "1080p" as const,
    };
    dispatch(setScreenShareQuality({ resolution: qualityMap[options.quality], fps: options.fps }));
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
          participants.length > 0
            ? `${participants.length} участниковъ`
            : undefined
        }
        onMenuClick={handleCollapse}
        actions={
          <IconButton icon={ArrowLeft} onClick={handleCollapse} tooltip="Свернуть звонокъ" />
        }
      />

      {/* Voice Members */}
      <div className="flex-1 overflow-y-auto p-2 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Screen Share */}
          {isScreenSharing && sharerName && sharingIdentity && (
            <ScreenShareDisplay sharerName={sharerName} sharerIdentity={sharingIdentity} />
          )}

          {/* Participants */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-3">
              Въ голосовой палатѣ — {voiceMembers.length}
              {speakingCount > 0 && (
                <span className="text-green-500 ml-1">
                  · {speakingCount} говоритъ
                </span>
              )}
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {voiceMembers.map((member, index) => (
                <VoiceMemberCard
                  key={member.id}
                  member={member}
                  index={index}
                  volume={volumes[member.id]}
                  onVolumeChange={(v) => dispatch(setParticipantVolume({ identity: member.id, volume: v }))}
                  role={roleMap[member.id]?.name}
                  roleColor={roleMap[member.id]?.color}
                  bannerId={userDataMap[member.id]?.banner}
                  joinedAt={joinedAtMap[member.id]}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Voice Controls */}
      <VoiceControls
        isMuted={isMuted}
        isDeafened={isDeafened}
        isScreenSharing={isScreenSharing}
        onToggleMute={() => dispatch(toggleMute())}
        onToggleDeafen={() => setIsDeafened(!isDeafened)}
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

    </div>
  );
}
