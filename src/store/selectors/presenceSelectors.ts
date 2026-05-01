import { RootState } from "../../store";
import { ONLINE_TIMEOUT } from "../slices/presenceSlice";

export const selectIsOnline = (userId: string) => (state: RootState) => {
  const ts = state.presence.onlineUsers[userId];
  if (!ts) return false;
  return Date.now() - ts < ONLINE_TIMEOUT;
};

export const selectOnlineUsers = (state: RootState) => state.presence.onlineUsers;
