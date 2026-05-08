// src/features/room/roomSelectors.ts
import { RootState } from "@app/store";

export const selectConnected = (s: RootState) => s.room.connected;
export const selectConnecting = (s: RootState) => s.room.connecting;
export const selectError = (s: RootState) => s.room.error;
export const selectActiveChannelId = (s: RootState) => s.room.activeChannelId;
export const selectActiveChannelName = (s: RootState) =>
  s.room.activeChannelName;
export const selectActiveServerId = (s: RootState) =>
  s.room.activeServerId;

export const selectIsMuted = (s: RootState) => s.room.isMuted;
export const selectParticipantCount = (s: RootState) => s.room.participantCount;
export const selectSpeakingCount = (s: RootState) => s.room.speakingCount;

export const selectVolumes = (s: RootState) => s.room.volumes;
export const selectIsScreenSharing = (s: RootState) => s.room.isScreenSharing;
export const selectScreenShareQuality = (s: RootState) =>
  s.room.screenShareQuality;
export const selectIsDeafened = (s: RootState) => s.room.isDeafened;
export const selectReconnecting = (s: RootState) => s.room.reconnecting;
export const selectCallStartedAt = (s: RootState) => s.room.callStartedAt;
export const selectConnectionQuality = (s: RootState) => s.room.connectionQuality;
