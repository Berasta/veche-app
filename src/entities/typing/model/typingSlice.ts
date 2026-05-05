import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TypingState {
  // channelId -> { userId -> timestamp }
  typing: Record<string, Record<string, number>>;
}

const initialState: TypingState = {
  typing: {},
};

const TYPING_TIMEOUT = 4000;

const typingSlice = createSlice({
  name: "typing",
  initialState,
  reducers: {
    setTyping(state, action: PayloadAction<{ channelId: string; userId: string }>) {
      const { channelId, userId } = action.payload;
      if (!state.typing[channelId]) state.typing[channelId] = {};
      state.typing[channelId][userId] = Date.now();
    },
    clearTyping(state, action: PayloadAction<{ channelId: string; userId: string }>) {
      const { channelId, userId } = action.payload;
      if (state.typing[channelId]) delete state.typing[channelId][userId];
    },
    clearChannelTyping(state, action: PayloadAction<string>) {
      delete state.typing[action.payload];
    },
    cleanStaleTyping(state) {
      const now = Date.now();
      for (const ch of Object.keys(state.typing)) {
        for (const [uid, ts] of Object.entries(state.typing[ch])) {
          if (now - ts > TYPING_TIMEOUT) delete state.typing[ch][uid];
        }
        if (Object.keys(state.typing[ch]).length === 0) delete state.typing[ch];
      }
    },
  },
});

export const { setTyping, clearTyping, clearChannelTyping, cleanStaleTyping } = typingSlice.actions;

export const selectTypingUsers = (channelId: string) => (state: RootState) => {
  const channelTyping = state.typing.typing[channelId];
  if (!channelTyping) return [];
  const now = Date.now();
  return Object.entries(channelTyping)
    .filter(([, ts]) => now - ts < TYPING_TIMEOUT)
    .map(([userId]) => userId);
};

import { RootState } from "../index";

export default typingSlice.reducer;
