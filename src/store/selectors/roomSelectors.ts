// src/features/room/roomSelectors.ts
import { RootState } from "../../store";

export const selectConnected = (s: RootState) => s.room.connected;
export const selectConnecting = (s: RootState) => s.room.connecting;
export const selectError = (s: RootState) => s.room.error;
export const selectParticipants = (s: RootState) => s.room.participants;
export const selectActiveChannelId = (s: RootState) => s.room.activeChannelId;
export const selectActiveChannelName = (s: RootState) =>
  s.room.activeChannelName;
export const selectActiveServerId = (s: RootState) =>
  s.room.activeServerId;

export const selectLocalParticipant = (s: RootState) =>
  s.room.participants.find((p) => p.isLocal);

export const selectIsMuted = (s: RootState) =>
  s.room.participants.find((p) => p.isLocal)?.isMuted ?? false;

export const selectSpeakingCount = (s: RootState) =>
  s.room.participants.filter((p) => p.isSpeaking).length;

export const selectVolumes = (s: RootState) => s.room.volumes;
export const selectIsScreenSharing = (s: RootState) => s.room.isScreenSharing;
export const selectScreenShareQuality = (s: RootState) =>
  s.room.screenShareQuality;
export const selectIsDeafened = (s: RootState) => s.room.isDeafened;
export const selectReconnecting = (s: RootState) => s.room.reconnecting;
