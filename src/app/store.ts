import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../entities/user/model/authSlice";
import serversReducer from "../entities/server/model/serversSlice";
import channelsReducer from "../entities/channel/model/channelsSlice";
import roomReducer from "../entities/room/model/roomSlice";
import messagesReducer from "../entities/message/model/messagesSlice";
import presenceReducer from "../entities/presence/model/presenceSlice";
import typingReducer from "../entities/typing/model/typingSlice";
import membersReducer from "../entities/member/model/membersSlice";
import { notificationMiddleware } from "../store/middleware/notificationMiddleware";

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
    }).concat(notificationMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
