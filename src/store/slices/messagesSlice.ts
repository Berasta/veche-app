// src/store/slices/messagesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RecordSubscription } from "pocketbase";
import { pb, PB_URL } from "../../api/pb";

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  edited_at: string | null;
  is_deleted: boolean;
  created: string;
  author_name: string;
  author_avatar: string | null;
  author_avatar_url: string | null;
  author_banner?: string;
  images: string[];
}

interface MessagesState {
  items: Message[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  channelId: string | null;
}

const initialState: MessagesState = {
  items: [],
  loading: false,
  hasMore: true,
  error: null,
  channelId: null,
};

const PAGE_SIZE = 50;

// ─── Thunks ───────────────────────────────────────────────────────────────────

// Загрузка первой страницы сообщений при открытии канала
export const fetchMessages = createAsyncThunk(
  "messages/fetch",
  async (channelId: string) => {
    const result = await pb.collection("messages").getList(1, PAGE_SIZE, {
      filter: `channel_id = "${channelId}" && is_deleted = false`,
      sort: "-created", // сначала новые
      expand: "user_id",
    });

    return {
      channelId,
      items: result.items.map(normalizeMessage),
      hasMore: result.totalPages > 1,
    };
  },
);

// Подгрузка старых сообщений (infinite scroll вверх)
export const fetchMoreMessages = createAsyncThunk(
  "messages/fetchMore",
  async ({ channelId, before }: { channelId: string; before: string }) => {
    const result = await pb.collection("messages").getList(1, PAGE_SIZE, {
      filter: `channel_id = "${channelId}" && is_deleted = false && created < "${before}"`,
      sort: "-created",
      expand: "user_id",
    });

    return {
      items: result.items.map(normalizeMessage),
      hasMore: result.totalPages > 1,
    };
  },
);

// Отправка сообщения
export const sendMessage = createAsyncThunk(
  "messages/send",
  async ({ channelId, content, files }: { channelId: string; content: string; files?: File[] }) => {
    const formData = new FormData();
    formData.append("channel_id", channelId);
    formData.append("user_id", pb.authStore.record!.id);
    formData.append("content", content.trim());
    if (files) {
      files.forEach((f) => formData.append("images", f));
    }

    const record = await pb.collection("messages").create(formData, { expand: "user_id" });

    return normalizeMessage(record);
  },
);

// Редактирование
export const editMessage = createAsyncThunk(
  "messages/edit",
  async ({ id, content }: { id: string; content: string }) => {
    const record = await pb.collection("messages").update(
      id,
      {
        content: content.trim(),
        edited_at: new Date().toISOString(),
      },
      { expand: "user_id" },
    );

    return normalizeMessage(record);
  },
);

// Удаление (soft delete)
export const deleteMessage = createAsyncThunk(
  "messages/delete",
  async (id: string) => {
    await pb.collection("messages").update(id, { is_deleted: true });
    return id;
  },
);

// Подписка на realtime обновления канала
// Возвращает функцию отписки — вызывай при размонтировании
export const subscribeToChannel = (channelId: string, dispatch: any) => {
  pb.collection("messages").subscribe(
    "*",
    (e: RecordSubscription) => {
      const msg = normalizeMessage(e.record);
      switch (e.action) {
        case "create":
          dispatch(messageReceived(msg));
          break;
        case "update":
          if (msg.is_deleted) {
            dispatch(messageDeleted(msg.id));
          } else {
            dispatch(messageUpdated(msg));
          }
          break;
        case "delete":
          dispatch(messageDeleted(msg.id));
          break;
      }
    },
    { filter: `channel_id = "${channelId}"`, expand: "user_id" },
  );

  return () => pb.collection("messages").unsubscribe("*");
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function normalizeMessage(record: any): Message {
  const author = record.expand?.user_id;
  const images: string[] = [];
  if (record.images) {
    const names = Array.isArray(record.images) ? record.images : [record.images];
    names.forEach((name: string) => {
      if (name) images.push(`${PB_URL}/api/files/${record.collectionId}/${record.id}/${name}`);
    });
  }
  return {
    id: record.id,
    channel_id: record.channel_id,
    user_id: record.user_id,
    content: record.content,
    edited_at: record.edited_at || null,
    is_deleted: record.is_deleted || false,
    created: record.created,
    author_name: author?.name || author?.username || "Пользователь",
    author_avatar: author?.avatar || null,
    author_avatar_url: author?.avatar && author?.collectionId
      ? `${PB_URL}/api/files/${author.collectionId}/${author.id}/${author.avatar}`
      : author?.avatar
        ? `${PB_URL}/api/files/_pb_users_auth_/${author.id}/${author.avatar}`
        : null,
    author_banner: author?.banner || undefined,
    images,
  };
}

// ─── Slice ────────────────────────────────────────────────────────────────────
const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    // Realtime события
    messageReceived(state, action: PayloadAction<Message>) {
      // Не добавляем дубликаты
      if (state.items.find((m) => m.id === action.payload.id)) return;
      // Новые сообщения в конец (список отсортирован от старых к новым в UI)
      state.items.push(action.payload);
    },
    messageUpdated(state, action: PayloadAction<Message>) {
      const idx = state.items.findIndex((m) => m.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    messageDeleted(state, action: PayloadAction<string>) {
      state.items = state.items.filter((m) => m.id !== action.payload);
    },
    clearMessages(state) {
      state.items = [];
      state.hasMore = true;
      state.channelId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchMessages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.channelId = action.payload.channelId;
        // Разворачиваем — в UI показываем от старых к новым
        state.items = [...action.payload.items].reverse();
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Ошибка загрузки";
      })

      // fetchMoreMessages
      .addCase(fetchMoreMessages.fulfilled, (state, action) => {
        // Старые сообщения добавляем в начало
        state.items = [...[...action.payload.items].reverse(), ...state.items];
        state.hasMore = action.payload.hasMore;
      })

      // sendMessage — оптимистичный апдейт не нужен, realtime придёт сам
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.error.message || "Не удалось отправить";
      })

      // editMessage
      .addCase(editMessage.fulfilled, (state, action) => {
        const idx = state.items.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })

      // deleteMessage
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m.id !== action.payload);
      });
  },
});

export const {
  messageReceived,
  messageUpdated,
  messageDeleted,
  clearMessages,
} = messagesSlice.actions;

export default messagesSlice.reducer;
