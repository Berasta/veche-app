import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Channel } from "@shared/api/serverApi";
import * as serverApi from "@shared/api/serverApi";

export interface ChannelsState {
  channels: Channel[];
  loading: boolean;
  error: string | null;
}

const initialState: ChannelsState = {
  channels: [],
  loading: false,
  error: null,
};

export const fetchChannels = createAsyncThunk<
  Channel[],
  string,
  { rejectValue: string }
>("channels/fetchChannels", async (serverId, { rejectWithValue }) => {
  try {
    return await serverApi.listChannels(serverId);
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || err.message || "Failed to fetch channels",
    );
  }
});

const channelsSlice = createSlice({
  name: "channels",
  initialState,
  reducers: {
    clearChannels(state) {
      state.channels = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChannels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchChannels.fulfilled,
        (state, action: PayloadAction<Channel[]>) => {
          state.loading = false;
          state.channels = action.payload;
        },
      )
      .addCase(fetchChannels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch channels";
      });
  },
});

export const { clearChannels } = channelsSlice.actions;
export default channelsSlice.reducer;
