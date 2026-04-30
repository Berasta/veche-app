import { RootState } from "../index";

export const selectMessages = (s: RootState) => s.messages.items;
export const selectMessagesLoading = (s: RootState) => s.messages.loading;
export const selectHasMore = (s: RootState) => s.messages.hasMore;
export const selectChannelId = (s: RootState) => s.messages.channelId;
export const selectMessagesError = (s: RootState) => s.messages.error;
