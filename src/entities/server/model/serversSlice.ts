import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Server } from '@shared/api/serverApi';
import * as serverApi from '@shared/api/serverApi';

export interface ServersState {
  servers: Server[];
  loading: boolean;
  error: string | null;
}

const initialState: ServersState = {
  servers: [],
  loading: false,
  error: null,
};

export const fetchServers = createAsyncThunk<Server[], string, { rejectValue: string }>(
  'servers/fetchServers',
  async (userId, { rejectWithValue }) => {
    try {
      return await serverApi.listServers(userId);
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.error || err.message || 'Failed to fetch servers');
    }
  }
);

const serversSlice = createSlice({
  name: 'servers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServers.fulfilled, (state, action: PayloadAction<Server[]>) => {
        state.loading = false;
        state.servers = action.payload;
      })
      .addCase(fetchServers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch servers';
      });
  },
});

export default serversSlice.reducer;
