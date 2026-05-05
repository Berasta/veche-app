import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../entities/user/authSlice";
import serversReducer from "../entities/server/serversSlice";
import channelsReducer from "../entities/channel/channelsSlice";
import roomReducer from "../entities/room/roomSlice";
import messagesReducer from "../entities/message/messagesSlice";
import presenceReducer from "../store/slices/presenceSlice";
import typingReducer from "../entities/typing/typingSlice";
import membersReducer from "../entities/member/membersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    servers: serversReducer,
    channels: channelsReducer,
    room: roomReducer,
    messages: messagesReducer,
    presence: presenceReducer,
    typing: typingReducer,
    members: membersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["room/updateSpeakers"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
