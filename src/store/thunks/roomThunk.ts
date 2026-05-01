import { createAsyncThunk } from "@reduxjs/toolkit";
import { Room, RoomEvent, Track } from "livekit-client";
import PocketBase from "pocketbase";
import {
  setConnecting,
  setConnected,
  setDisconnected,
  setError,
  setParticipants,
  updateSpeakers,
  updateLocalMute,
  Participant,
  setVolume,
  setScreenSharing,
} from "../slices/roomSlice";
import { RootState } from "../../store";

const PB_URL = import.meta.env.VITE_PB_URL || "http://localhost:8090";
const pb = new PocketBase(PB_URL);

// Room объект живёт вне Redux — он не сериализуемый (содержит WebSocket, WebRTC и т.д.)
// Redux хранит только сериализуемый стейт (строки, булевы, массивы участников)
let activeRoom: Room | null = null;
let activeChannelIdForCleanup: string | null = null;
let wakeLock: any = null;
export const audioElements: Record<string, HTMLAudioElement> = {};
export const screenShareElements: Record<string, HTMLVideoElement> = {};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildParticipants(room: Room): Participant[] {
  return [
    {
      identity: room.localParticipant.identity,
      name: "Вы",
      isSpeaking: room.localParticipant.isSpeaking,
      isMuted: !room.localParticipant.isMicrophoneEnabled,
      isLocal: true,
    },
    ...Array.from(room.remoteParticipants.values()).map((p) => ({
      identity: p.identity,
      name: p.name || p.identity,
      isSpeaking: p.isSpeaking,
      isMuted: !p.isMicrophoneEnabled,
      isLocal: false,
    })),
  ];
}

function cleanupAudio() {
  Object.values(audioElements).forEach((el) => el.remove());
  Object.keys(audioElements).forEach((k) => delete audioElements[k]);
}

// ─── Screen Wake Lock ──────────────────────────────────────────────────────────
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await (navigator as any).wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch {}
}

function releaseWakeLock() {
  try {
    if (wakeLock) { wakeLock.release(); wakeLock = null; }
  } catch {}
}

function cleanupScreenShare() {
  Object.values(screenShareElements).forEach((el) => el.remove());
  Object.keys(screenShareElements).forEach((k) => delete screenShareElements[k]);
}

// ─── Channel Participants ──────────────────────────────────────────────────────
async function addChannelParticipant(channelId: string) {
  try {
    const existing = await pb.collection("channel_participants").getList(1, 1, {
      filter: `channel_id = "${channelId}" && user_id = "${pb.authStore.record!.id}"`,
    });
    if (existing.items.length > 0) return;
    await pb.collection("channel_participants").create({
      channel_id: channelId,
      user_id: pb.authStore.record!.id,
      joined_at: new Date().toISOString(),
      is_muted: false,
    });
  } catch (e) {
    console.error("Failed to add channel participant", e);
  }
}

async function removeChannelParticipant(channelId: string) {
  try {
    const existing = await pb.collection("channel_participants").getList(1, 1, {
      filter: `channel_id = "${channelId}" && user_id = "${pb.authStore.record!.id}"`,
    });
    if (existing.items.length > 0) {
      await pb.collection("channel_participants").delete(existing.items[0].id);
    }
  } catch (e) {
    console.error("Failed to remove channel participant", e);
  }
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const joinChannel = createAsyncThunk(
  "room/join",
  async (
    { channelId, channelName, serverId }: { channelId: string; channelName: string; serverId: string },
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
    if (activeChannelIdForCleanup) await removeChannelParticipant(activeChannelIdForCleanup);
    releaseWakeLock();
    await activeRoom.disconnect();
    cleanupAudio();
    cleanupScreenShare();
    activeRoom = null;
      activeChannelIdForCleanup = null;
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
      const room = new Room({ adaptiveStream: true, dynacast: true });
      activeRoom = room;

      // 3. Вешаем события — диспатчим в Redux
      room.on(RoomEvent.ParticipantConnected, () => {
        dispatch(setParticipants(buildParticipants(room)));
      });

      room.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
        if (
          track.kind === Track.Kind.Video &&
          track.source === Track.Source.ScreenShare
        ) {
          const el = track.attach() as HTMLVideoElement;
          el.id = `screen-${participant.identity}`;
          el.style.cssText = "width:100%;height:100%;object-fit:contain;border-radius:8px";
          screenShareElements[participant.identity] = el;
          dispatch(setScreenSharing(true));
        }
        // ... остальной код
      });

      room.on(RoomEvent.TrackUnsubscribed, (track, _pub, participant) => {
        if (track.source === Track.Source.ScreenShare) {
          screenShareElements[participant.identity]?.remove();
          delete screenShareElements[participant.identity];
          if (Object.keys(screenShareElements).length === 0) {
            dispatch(setScreenSharing(false));
          }
        }
        // ... остальной код
      });

      room.on(RoomEvent.ParticipantDisconnected, () => {
        dispatch(setParticipants(buildParticipants(room)));
      });

      room.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
        if (track.kind === Track.Kind.Audio) {
          const el = track.attach() as HTMLAudioElement;
          el.id = `audio-${participant.identity}`;
          document.body.appendChild(el);
          audioElements[participant.identity] = el;
        }
        dispatch(setParticipants(buildParticipants(room)));
      });

      room.on(RoomEvent.TrackUnsubscribed, (track, _pub, participant) => {
        track.detach();
        audioElements[participant.identity]?.remove();
        delete audioElements[participant.identity];
        dispatch(setParticipants(buildParticipants(room)));
      });

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        dispatch(updateSpeakers(new Set(speakers.map((s) => s.identity))));
      });

      room.on(RoomEvent.TrackMuted, () => {
        dispatch(setParticipants(buildParticipants(room)));
      });

      room.on(RoomEvent.TrackUnmuted, () => {
        dispatch(setParticipants(buildParticipants(room)));
      });

      room.on(RoomEvent.Disconnected, () => {
        releaseWakeLock();
        if (activeChannelIdForCleanup) removeChannelParticipant(activeChannelIdForCleanup);
        cleanupAudio();
        cleanupScreenShare();
        activeRoom = null;
        activeChannelIdForCleanup = null;
        dispatch(setDisconnected());
      });

      // 4. Подключаемся
      await room.connect(res.ws_url, res.token);
      await room.localParticipant.setMicrophoneEnabled(true);

      // 5. Регистрируем участника в канале + блокируем экран
      await addChannelParticipant(channelId);
      requestWakeLock();
      activeChannelIdForCleanup = channelId;

      // 6. Обновляем стейт
      dispatch(setConnected({ channelId, channelName, serverId }));
      dispatch(setParticipants(buildParticipants(room)));
    } catch (e: any) {
      activeRoom = null;
      dispatch(setError(e.message || "Ошибка подключения"));
    }
  },
);

export const leaveChannel = createAsyncThunk(
  "room/leave",
  async (_, { dispatch }) => {
    if (activeChannelIdForCleanup) await removeChannelParticipant(activeChannelIdForCleanup);

    if (activeRoom) {
      await activeRoom.disconnect();
      cleanupAudio();
      cleanupScreenShare();
      activeRoom = null;
      activeChannelIdForCleanup = null;
    }
    dispatch(setDisconnected());
  },
);

export const toggleMute = createAsyncThunk(
  "room/toggleMute",
  async (_, { dispatch }) => {
    if (!activeRoom) return;
    const enabled = activeRoom.localParticipant.isMicrophoneEnabled;
    await activeRoom.localParticipant.setMicrophoneEnabled(!enabled);
    dispatch(updateLocalMute(enabled)); // enabled → теперь muted, и наоборот
  },
);

export const setParticipantVolume = createAsyncThunk(
  "room/setVolume",
  async (
    { identity, volume }: { identity: string; volume: number },
    { dispatch },
  ) => {
    const el = audioElements[identity];
    if (el) el.volume = volume / 100; // Конвертируем обратно в 0-1 для HTMLAudioElement
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
    const { resolution, fps } = (getState() as RootState).room
      .screenShareQuality;

    try {
      if (isSharing) {
        // Выключаем — без опций
        await activeRoom.localParticipant.setScreenShareEnabled(false);
      } else {
        // Включаем — с опциями качества
        await activeRoom.localParticipant.setScreenShareEnabled(true, {
          audio: true,
          selfBrowserSurface: "exclude",
          resolution: {
            width: RESOLUTION_MAP[resolution].width,
            height: RESOLUTION_MAP[resolution].height,
            frameRate: fps,
          },
          videoBitsPerSecond: 8_000_000, // 8 Mbps для лучшего качества
        });
      }
      dispatch(setScreenSharing(!isSharing));
    } catch (e: any) {
      if (e.name !== "NotAllowedError") dispatch(setError(e.message));
    }
  },
);
