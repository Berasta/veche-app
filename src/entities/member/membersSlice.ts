import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { pb, PB_URL } from "../../api/pb";
import { getRoleMap } from "../../api/rolesApi";

export interface MemberData {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  banner?: string;
  avatarFrame?: string;
  bannerSkin?: string;
  joinedAt: string;
  role?: string;
  roleColor?: string;
}

interface MembersState {
  byServer: Record<string, {
    loaded: boolean;
    loading: boolean;
    members: MemberData[];
  }>;
}

const initialState: MembersState = {
  byServer: {},
};

export const fetchServerMembers = createAsyncThunk(
  "members/fetch",
  async (serverId: string, { rejectWithValue }) => {
    try {
      const [sm, roleMap] = await Promise.all([
        pb.collection("server_members").getFullList({
          filter: `server_id = "${serverId}"`,
          expand: "user_id",
        }, { $autoCancel: false }),
        getRoleMap(serverId),
      ]);

      const seen = new Set<string>();
      const members: MemberData[] = [];

      for (const entry of sm as any[]) {
        const user = entry.expand?.user_id;
        if (!user || seen.has(user.id)) continue;
        seen.add(user.id);
        const role = roleMap[user.id];
        members.push({
          id: entry.id,
          userId: user.id,
          username: user.username || user.email || "Пользователь",
          avatarUrl: user.avatar
            ? `${PB_URL}/api/files/${user.collectionId || "_pb_users_auth_"}/${user.id}/${user.avatar}`
            : null,
          banner: user.banner || undefined,
          avatarFrame: user.avatar_frame || undefined,
          bannerSkin: user.banner_skin || undefined,
          joinedAt: entry.created || "",
          role: role?.name,
          roleColor: role?.color,
        });
      }

      // Include owner if not already in members
      try {
        const server = await pb.collection("servers").getOne(serverId);
        const ownerId = (server as any).owner_id;
        if (ownerId && !seen.has(ownerId)) {
          try {
            const owner = await pb.collection("users").getOne(ownerId);
            const role = roleMap[ownerId];
            members.push({
              id: "",
              userId: ownerId,
              username: owner.username || "Владыка",
              avatarUrl: owner.avatar
                ? `${PB_URL}/api/files/${(owner as any).collectionId || "_pb_users_auth_"}/${ownerId}/${owner.avatar}`
                : null,
              banner: owner.banner || undefined,
              avatarFrame: owner.avatar_frame || undefined,
              bannerSkin: owner.banner_skin || undefined,
              joinedAt: "",
              role: role?.name,
              roleColor: role?.color,
            });
          } catch {}
        }
      } catch {}

      return { serverId, members };
    } catch (err) {
      console.error("fetchServerMembers error:", err);
      return rejectWithValue(err);
    }
  },
);

const membersSlice = createSlice({
  name: "members",
  initialState,
  reducers: {
    clearServerMembers(state, action: PayloadAction<string>) {
      delete state.byServer[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServerMembers.pending, (state, action) => {
        const sid = action.meta.arg;
        if (!state.byServer[sid]) {
          state.byServer[sid] = { loaded: false, loading: true, members: [] };
        } else {
          state.byServer[sid].loading = true;
        }
      })
      .addCase(fetchServerMembers.fulfilled, (state, action) => {
        state.byServer[action.payload.serverId] = {
          loaded: true,
          loading: false,
          members: action.payload.members,
        };
      })
      .addCase(fetchServerMembers.rejected, (state, action) => {
        const sid = action.meta.arg;
        if (state.byServer[sid]) {
          state.byServer[sid].loading = false;
        }
      });
  },
});

export const { clearServerMembers } = membersSlice.actions;
export default membersSlice.reducer;

// Selectors
export const selectServerMembers = (serverId: string) => (state: any) =>
  state.members.byServer[serverId]?.members ?? [];

export const selectServerMembersLoaded = (serverId: string) => (state: any) =>
  state.members.byServer[serverId]?.loaded ?? false;

export const selectMemberById = (serverId: string, userId: string) => (state: any) =>
  state.members.byServer[serverId]?.members.find((m: MemberData) => m.userId === userId);
