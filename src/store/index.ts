import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import serversReducer from "./slices/serversSlice";
import channelsReducer from "./slices/channelsSlice";
import roomReducer from "./slices/roomSlice";
import messagesReducer from "./slices/messagesSlice";
import presenceReducer from "./slices/presenceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    servers: serversReducer,
    channels: channelsReducer,
    room: roomReducer,
    messages: messagesReducer,
    presence: presenceReducer,
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
