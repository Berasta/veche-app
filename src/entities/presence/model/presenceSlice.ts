import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PresenceState {
  onlineUsers: Record<string, number>;
}

const initialState: PresenceState = {
  onlineUsers: {},
};

export const ONLINE_TIMEOUT = 5 * 60 * 1000;

const presenceSlice = createSlice({
  name: "presence",
  initialState,
  reducers: {
    markActive(state, action: PayloadAction<string>) {
      state.onlineUsers[action.payload] = Date.now();
    },
    markOffline(state, action: PayloadAction<string>) {
      delete state.onlineUsers[action.payload];
    },
    cleanStale(state) {
      const now = Date.now();
      for (const [id, ts] of Object.entries(state.onlineUsers)) {
        if (now - ts > ONLINE_TIMEOUT) {
          delete state.onlineUsers[id];
        }
      }
    },
    setVoiceParticipants(state, action: PayloadAction<string[]>) {
      const now = Date.now();
      for (const id of action.payload) {
        state.onlineUsers[id] = now;
      }
    },
  },
});

export const { markActive, markOffline, cleanStale, setVoiceParticipants } = presenceSlice.actions;

export default presenceSlice.reducer;
