import { createAsyncThunk } from "@reduxjs/toolkit";
import { Room, RoomEvent, ConnectionQuality, LocalVideoTrack, Track } from "livekit-client";
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
  setScreenSharing,
} from "@entities/room/model/roomSlice";
import { setActiveRoom } from "@shared/lib/voiceRoom";
import type { AppDispatch, RootState } from "@app/store";

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

const RESOLUTION_MAP = {
  "1080p": { width: 1920, height: 1080 },
  "720p": { width: 1280, height: 720 },
  "480p": { width: 854, height: 480 },
};

export const toggleScreenShare = createAsyncThunk(
  "room/toggleScreenShare",
  async (_, { dispatch, getState }) => {
    if (!activeRoom) return;

    const isSharing = activeRoom.localParticipant.isScreenShareEnabled;
    const { resolution, fps, bitrate, audio } = (getState() as RootState).room
      .screenShareQuality;

    try {
      if (isSharing) {
        // Выключаем — без опций
        await activeRoom.localParticipant.setScreenShareEnabled(false);
      } else {
        const captureOptions = {
          selfBrowserSurface: "exclude",
          resolution: {
            width: RESOLUTION_MAP[resolution].width,
            height: RESOLUTION_MAP[resolution].height,
            frameRate: fps,
          },
          contentHint: "motion",
        } as const;
        const publishOptions = {
          videoEncoding: {
            maxBitrate: bitrate * 1_000_000,
            maxFramerate: fps,
          },
        };

        if (audio) {
          try {
            await activeRoom.localParticipant.setScreenShareEnabled(
              true,
              { ...captureOptions, audio: true },
              publishOptions,
            );
          } catch (audioErr: any) {
            // System audio capture is often unsupported on Windows/WebView2.
            // Retry without audio rather than failing entirely.
            const msg: string = audioErr?.message ?? "";
            const isAudioError =
              audioErr?.name === "NotSupportedError" ||
              audioErr?.name === "NotReadableError" ||
              msg.includes("audio") ||
              msg.includes("loopback");
            if (isAudioError) {
              toast.error(
                "Захватъ системного звука не поддерживается — демонстрацiя безъ звука",
              );
              await activeRoom.localParticipant.setScreenShareEnabled(
                true,
                { ...captureOptions, audio: false },
                publishOptions,
              );
            } else {
              throw audioErr;
            }
          }
        } else {
          await activeRoom.localParticipant.setScreenShareEnabled(
            true,
            { ...captureOptions, audio: false },
            publishOptions,
          );
        }
      }
      dispatch(setScreenSharing(!isSharing));
    } catch (e: any) {
      if (e.name !== "NotAllowedError") dispatch(setError(e.message));
    }
  },
);

/**
 * Publish a pre-captured MediaStream as a screen share track directly to LiveKit.
 * Used when the custom screen picker successfully captures without the OS dialog.
 * The stream is stopped automatically when the user calls toggleScreenShare() to stop.
 */
export function publishCustomScreenShare(
  stream: MediaStream,
  fps: number,
  bitrate: number,
) {
  return async (dispatch: AppDispatch): Promise<void> => {
    if (!activeRoom) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }

    const videoTrackRaw = stream.getVideoTracks()[0];
    if (!videoTrackRaw) return;

    try {
      const videoTrack = new LocalVideoTrack(videoTrackRaw, undefined, false);
      await activeRoom.localParticipant.publishTrack(videoTrack, {
        source: Track.Source.ScreenShare,
        videoEncoding: {
          maxBitrate: bitrate * 1_000_000,
          maxFramerate: fps,
        },
      });
      dispatch(setScreenSharing(true));
    } catch (e: any) {
      stream.getTracks().forEach((t) => t.stop());
      if (e.name !== "NotAllowedError") dispatch(setError(e.message));
    }
  };
}
