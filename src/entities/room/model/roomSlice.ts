import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Participant {
  identity: string;
  name: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isLocal: boolean;
}

interface RoomState {
  connected: boolean;
  connecting: boolean;
  reconnecting: boolean;
  error: string | null;
  activeChannelId: string | null;
  activeChannelName: string | null;
  activeServerId: string | null;
  participants: Participant[];
  volumes: Record<string, number>;
  connectionQuality: "excellent" | "good" | "poor" | "lost" | "unknown";
  isScreenSharing: boolean;
  screenShareQuality: {
    resolution: "1080p" | "720p" | "480p";
    fps: 15 | 30 | 60 | 120;
    bitrate: number;
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
  participants: [],
  volumes: {},
  isScreenSharing: false,
  screenShareQuality: { resolution: "1080p", fps: 30, bitrate: 8 },
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
      state.participants = [];
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.connecting = false;
    },
    setParticipants(state, action: PayloadAction<Participant[]>) {
      state.participants = action.payload;
    },
    updateSpeakers(state, action: PayloadAction<Set<string>>) {
      state.participants = state.participants.map((p) => ({
        ...p,
        isSpeaking: action.payload.has(p.identity),
      }));
    },
    updateLocalMute(state, action: PayloadAction<boolean>) {
      const local = state.participants.find((p) => p.isLocal);
      if (local) local.isMuted = action.payload;
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
      }>,
    ) {
      state.screenShareQuality = action.payload;
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
  setParticipants,
  updateSpeakers,
  updateLocalMute,
  setVolume,
  setScreenSharing,
  setScreenShareQuality,
  setDeafened,
  setCallStartedAt,
  setConnectionQuality,
} = roomSlice.actions;

export default roomSlice.reducer;
