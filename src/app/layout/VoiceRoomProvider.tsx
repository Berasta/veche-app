import { useState, useEffect, useRef } from "react";
import type { Room } from "livekit-client";
import { Track } from "livekit-client";
import {
  RoomContext,
  AudioTrack,
  useTracks,
  useParticipants,
  useLocalParticipant,
  useSpeakingParticipants,
  useRoomContext,
  isTrackReference,
} from "@livekit/components-react";
import { subscribeRoom, getActiveRoom } from "@shared/lib/voiceRoom";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { selectIsDeafened, selectVolumes } from "@entities/room/model/roomSelectors";
import {
  setParticipantCount,
  setSpeakingCount,
  setMuted,
  setScreenSharerId,
} from "@entities/room/model/roomSlice";
import {
  initP2PScreenShare,
  destroyP2PScreenShare,
} from "@features/voice/lib/p2pScreenShare";
import {
  playJoinSound,
  playLeaveSound,
  playScreenShareSound,
} from "@features/voice/lib/voiceSounds";
import { selectScreenSharerId } from "@entities/room/model/roomSelectors";

// Рендерит <audio> элементы для каждого удалённого участника с поддержкой
// индивидуальной громкости и оглушения (deafen).
function VoiceAudioRenderer() {
  const isDeafened = useAppSelector(selectIsDeafened);
  const volumes = useAppSelector(selectVolumes);

  const audioTracks = useTracks(
    [
      { source: Track.Source.Microphone, withPlaceholder: false },
      { source: Track.Source.ScreenShareAudio, withPlaceholder: false },
    ],
    { onlySubscribed: true },
  );

  return (
    <>
      {audioTracks.filter(isTrackReference).map((trackRef) => {
        const identity = trackRef.participant.identity;
        const vol = isDeafened ? 0 : (volumes[identity] ?? 100) / 100;
        return (
          <AudioTrack
            key={trackRef.publication.trackSid}
            trackRef={trackRef}
            volume={vol}
          />
        );
      })}
    </>
  );
}

// Синхронизирует реактивное состояние LiveKit с Redux для компонентов вне
// RoomContext (ActiveVoiceBar и пр.).
function VoiceStateSyncer() {
  const dispatch = useAppDispatch();
  const participants = useParticipants();
  const speakingParticipants = useSpeakingParticipants();
  const { isMicrophoneEnabled } = useLocalParticipant();

  useEffect(() => {
    dispatch(setParticipantCount(participants.length));
  }, [participants.length, dispatch]);

  useEffect(() => {
    dispatch(setSpeakingCount(speakingParticipants.length));
  }, [speakingParticipants.length, dispatch]);

  useEffect(() => {
    dispatch(setMuted(!isMicrophoneEnabled));
  }, [isMicrophoneEnabled, dispatch]);

  return null;
}

// Воспроизводит звуки при входе/выходе участников и начале демонстрации экрана.
function VoiceSoundSyncer() {
  const participants = useParticipants();
  const screenSharerId = useAppSelector(selectScreenSharerId);
  const prevCountRef = useRef<number | null>(null);
  const prevSharerRef = useRef<string | null>(null);
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    const count = participants.length;
    if (prevCountRef.current === null) {
      // первый рендер — запоминаем, но не играем
      prevCountRef.current = count;
      return;
    }
    if (count > prevCountRef.current) {
      playJoinSound();
    } else if (count < prevCountRef.current) {
      playLeaveSound();
    }
    prevCountRef.current = count;
  }, [participants.length]);

  useEffect(() => {
    // Не играем звук если шарит сам локальный участник
    if (
      screenSharerId !== null &&
      prevSharerRef.current === null &&
      screenSharerId !== localParticipant.identity
    ) {
      playScreenShareSound();
    }
    prevSharerRef.current = screenSharerId;
  }, [screenSharerId, localParticipant.identity]);

  return null;
}

// Initialises the P2P screen share manager and syncs sharer identity to Redux.
function P2PScreenShareSyncer() {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const mgr = initP2PScreenShare(room, localParticipant.identity);
    mgr.subscribeSharer((id) => dispatch(setScreenSharerId(id)));
    return () => destroyP2PScreenShare();
  }, [room, localParticipant.identity, dispatch]);

  return null;
}

// Оборачивает дочерние компоненты в LiveKit RoomContext когда есть активный Room.
// Без активного звонка просто рендерит children без контекста.
export function VoiceRoomProvider({ children }: { children: React.ReactNode }) {
  const [room, setRoom] = useState<Room | null>(() => getActiveRoom());

  useEffect(() => {
    return subscribeRoom(setRoom);
  }, []);

  return (
    <>
      {room && (
        <RoomContext.Provider value={room}>
          <VoiceAudioRenderer />
          <VoiceStateSyncer />
          <VoiceSoundSyncer />
          <P2PScreenShareSyncer />
        </RoomContext.Provider>
      )}
      {children}
    </>
  );
}
