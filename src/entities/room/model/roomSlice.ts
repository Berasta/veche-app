import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RoomState {
  connected: boolean;
  connecting: boolean;
  reconnecting: boolean;
  error: string | null;
  activeChannelId: string | null;
  activeChannelName: string | null;
  activeServerId: string | null;
  participantCount: number;
  speakingCount: number;
  isMuted: boolean;
  volumes: Record<string, number>;
  connectionQuality: "excellent" | "good" | "poor" | "lost" | "unknown";
  isScreenSharing: boolean;
  screenShareQuality: {
    resolution: "1080p" | "720p" | "480p";
    fps: 15 | 30 | 60 | 120;
    bitrate: number;
    audio: boolean;
  };
  isDeafened: boolean;
  callStartedAt: number | null;
}

const initialState: RoomState = {
  connected: false,
  connecting: false,
  reconnecting: false,
  error: null,
  activeChannelId: null,
  activeChannelName: null,
  activeServerId: null,
  participantCount: 0,
  speakingCount: 0,
  isMuted: false,
  volumes: {},
  isScreenSharing: false,
  screenShareQuality: { resolution: "1080p", fps: 30, bitrate: 8, audio: true },
  isDeafened: false,
  callStartedAt: null,
  connectionQuality: "unknown",
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setConnecting(state, action: PayloadAction<boolean>) {
      state.connecting = action.payload;
    },
    setConnected(
      state,
      action: PayloadAction<{ channelId: string; channelName: string; serverId: string }>,
    ) {
      state.connected = true;
      state.connecting = false;
      state.reconnecting = false;
      state.error = null;
      state.activeChannelId = action.payload.channelId;
      state.activeChannelName = action.payload.channelName;
      state.activeServerId = action.payload.serverId;
      state.callStartedAt = Date.now();
    },
    setReconnecting(state, action: PayloadAction<boolean>) {
      state.reconnecting = action.payload;
    },
    setDisconnected(state) {
      state.connected = false;
      state.connecting = false;
      state.reconnecting = false;
      state.activeChannelId = null;
      state.activeChannelName = null;
      state.activeServerId = null;
      state.participantCount = 0;
      state.speakingCount = 0;
      state.isMuted = false;
      state.isDeafened = false;
      state.isScreenSharing = false;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.connecting = false;
    },
    setParticipantCount(state, action: PayloadAction<number>) {
      state.participantCount = action.payload;
    },
    setSpeakingCount(state, action: PayloadAction<number>) {
      state.speakingCount = action.payload;
    },
    setMuted(state, action: PayloadAction<boolean>) {
      state.isMuted = action.payload;
    },
    setVolume(
      state,
      action: PayloadAction<{ identity: string; volume: number }>,
    ) {
      state.volumes[action.payload.identity] = action.payload.volume;
    },
    setScreenSharing(state, action: PayloadAction<boolean>) {
      state.isScreenSharing = action.payload;
    },
    setScreenShareQuality(
      state,
      action: PayloadAction<{
        resolution: "1080p" | "720p" | "480p";
        fps: 15 | 30 | 60 | 120;
        bitrate: number;
        audio?: boolean;
      }>,
    ) {
      state.screenShareQuality = {
        ...state.screenShareQuality,
        ...action.payload,
      };
    },
    setDeafened(state, action: PayloadAction<boolean>) {
      state.isDeafened = action.payload;
    },
    setCallStartedAt(state, action: PayloadAction<number | null>) {
      state.callStartedAt = action.payload;
    },
    setConnectionQuality(state, action: PayloadAction<RoomState["connectionQuality"]>) {
      state.connectionQuality = action.payload;
    },
  },
});

export const {
  setConnecting,
  setConnected,
  setDisconnected,
  setReconnecting,
  setError,
  setParticipantCount,
  setSpeakingCount,
  setMuted,
  setVolume,
  setScreenSharing,
  setScreenShareQuality,
  setDeafened,
  setCallStartedAt,
  setConnectionQuality,
} = roomSlice.actions;

export default roomSlice.reducer;
