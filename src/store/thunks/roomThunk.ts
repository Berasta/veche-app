import { createAsyncThunk } from "@reduxjs/toolkit";
import { Room, RoomEvent, ConnectionQuality } from "livekit-client";
import { pb } from "@shared/api/pb";
import { toast } from "sonner";
import {
  setConnecting,
  setConnected,
  setDisconnected,
  setReconnecting,
  setError,
  setVolume,
  setDeafened,
  setConnectionQuality,
} from "@entities/room/model/roomSlice";
import { setActiveRoom } from "@shared/lib/voiceRoom";
import { destroyP2PScreenShare } from "@features/voice/lib/p2pScreenShare";
import type { RootState } from "@app/store";

// Room объект живёт вне Redux — он не сериализуемый (содержит WebSocket, WebRTC и т.д.)
// Redux хранит только сериализуемый стейт (строки, булевы, числа)
let activeRoom: Room | null = null;
let wakeLock: any = null;

// ─── Screen Wake Lock ──────────────────────────────────────────────────────────
async function requestWakeLock() {
  try {
    if ("wakeLock" in navigator) {
      wakeLock = await (navigator as any).wakeLock.request("screen");
      wakeLock.addEventListener("release", () => {
        wakeLock = null;
      });
    }
  } catch (err) {
    console.error("wakeLock request error", err);
  }
}

function releaseWakeLock() {
  try {
    if (wakeLock) {
      wakeLock.release();
      wakeLock = null;
    }
  } catch (err) {
    console.error("wakeLock release error", err);
  }
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const joinChannel = createAsyncThunk(
  "room/join",
  async (
    {
      channelId,
      channelName,
      serverId,
    }: { channelId: string; channelName: string; serverId: string },
    { dispatch, getState },
  ) => {
    const state = getState() as RootState;

    // Если кликнули на уже активный канал — выходим
    if (state.room.activeChannelId === channelId) {
      dispatch(leaveChannel());
      return;
    }

    // Если в другом канале — сначала выходим
    if (activeRoom) {
      releaseWakeLock();
      setActiveRoom(null);
      await activeRoom.disconnect();
      activeRoom = null;
    }

    dispatch(setConnecting(true));

    try {
      // 0. Проверяем, не заперта ли палата
      const channel = await pb.collection("channels").getOne(channelId);
      if (channel.is_locked) {
        // Проверяем права пользователя — владелец сервера или MANAGE_CHANNELS проходит
        const userId = pb.authStore.record?.id;
        let canEnter = false;
        if (userId) {
          try {
            const server = await pb.collection("servers").getOne(serverId);
            canEnter = server.owner_id === userId;
            if (!canEnter) {
              const members = await pb.collection("members").getFullList({
                filter: `server_id = "${serverId}" && user_id = "${userId}"`,
                expand: "role_id",
              });
              const perms: string[] = members[0]?.expand?.role_id?.permissions ?? [];
              canEnter = perms.includes("manage_channels");
            }
          } catch { /* сервер недоступен — не даём войти */ }
        }
        if (!canEnter) {
          dispatch(setConnecting(false));
          dispatch(setError("Сія палата заперта"));
          return;
        }
      }

      // 1. Получаем LiveKit токен от PocketBase
      const res = await pb.send("/api/livekit-token", {
        method: "POST",
        body: { channel_id: channelId },
        headers: { Authorization: `Bearer ${pb.authStore.token}` },
      });

      // 2. Создаём Room
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });
      activeRoom = room;

      // 3. Минимальный набор событий для Redux-стейта (UI-состояния соединения)
      room.on(RoomEvent.Disconnected, () => {
        releaseWakeLock();
        setActiveRoom(null);
        activeRoom = null;
        dispatch(setDisconnected());
      });

      room.on(RoomEvent.Reconnecting, () => {
        dispatch(setReconnecting(true));
      });

      room.on(RoomEvent.Reconnected, () => {
        dispatch(setReconnecting(false));
      });

      room.on(RoomEvent.ConnectionQualityChanged, (quality: ConnectionQuality) => {
        const map: Record<ConnectionQuality, "unknown" | "poor" | "good" | "excellent" | "lost"> = {
          [ConnectionQuality.Unknown]: "unknown",
          [ConnectionQuality.Poor]: "poor",
          [ConnectionQuality.Good]: "good",
          [ConnectionQuality.Excellent]: "excellent",
          [ConnectionQuality.Lost]: "lost",
        };
        dispatch(setConnectionQuality(map[quality] ?? "unknown"));
      });

      // 4. Подключаемся
      await room.connect(res.ws_url, res.token);

      // 5. Включаем микрофон с сохранённым устройством (если есть)
      const savedInput = localStorage.getItem("audioInput");
      try {
        await room.localParticipant.setMicrophoneEnabled(true, {
          deviceId: savedInput || undefined,
        });
      } catch (micErr: any) {
        if (micErr.name === "NotAllowedError") {
          toast.error("Разрешите доступъ къ микрофону въ настройкахъ системы");
        } else if (
          micErr.message?.includes("requested device not found") ||
          micErr.name === "NotFoundError"
        ) {
          localStorage.removeItem("audioInput");
          try {
            await room.localParticipant.setMicrophoneEnabled(true);
          } catch {}
        } else {
          console.error("Ошибка включенiя микрофона", micErr);
        }
      }

      // 6. Уведомляем React-контекст о новом Room (VoiceRoomProvider подключится)
      setActiveRoom(room);
      requestWakeLock();

      // 7. Обновляем Redux-стейт
      dispatch(setConnected({ channelId, channelName, serverId }));
    } catch (e: any) {
      setActiveRoom(null);
      activeRoom = null;
      dispatch(setError(e.message || "Ошибка подключения"));
    }
  },
);

export const leaveChannel = createAsyncThunk(
  "room/leave",
  async (_, { dispatch }) => {
    destroyP2PScreenShare();
    if (activeRoom) {
      releaseWakeLock();
      setActiveRoom(null);
      await activeRoom.disconnect();
      activeRoom = null;
    }
    dispatch(setDisconnected());
  },
);

export const toggleMute = createAsyncThunk(
  "room/toggleMute",
  async () => {
    if (!activeRoom) return;
    const enabled = activeRoom.localParticipant.isMicrophoneEnabled;
    await activeRoom.localParticipant.setMicrophoneEnabled(!enabled);
    // VoiceStateSyncer в VoiceRoomProvider обновит Redux реактивно через useLocalParticipant
  },
);

export const toggleDeafen = createAsyncThunk(
  "room/toggleDeafen",
  async (_, { dispatch, getState }) => {
    if (!activeRoom) return;
    const { isDeafened } = (getState() as RootState).room;
    const newDeafened = !isDeafened;
    // При выходе из оглушения — включаем микрофон, при оглушении — выключаем
    await activeRoom.localParticipant.setMicrophoneEnabled(isDeafened);
    // VoiceAudioRenderer будет передавать volume=0 всем AudioTrack когда isDeafened=true
    dispatch(setDeafened(newDeafened));
  },
);

export const setParticipantVolume = createAsyncThunk(
  "room/setVolume",
  async (
    { identity, volume }: { identity: string; volume: number },
    { dispatch },
  ) => {
    // VoiceAudioRenderer реактивно применит новую громкость к AudioTrack
    dispatch(setVolume({ identity, volume }));
  },
);
