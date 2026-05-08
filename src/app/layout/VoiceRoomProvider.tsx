import { useState, useEffect } from "react";
import type { Room } from "livekit-client";
import { Track } from "livekit-client";
import {
  RoomContext,
  AudioTrack,
  useTracks,
  useParticipants,
  useLocalParticipant,
  useSpeakingParticipants,
} from "@livekit/components-react";
import { subscribeRoom, getActiveRoom } from "@shared/lib/voiceRoom";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { selectIsDeafened, selectVolumes } from "@entities/room/model/roomSelectors";
import {
  setParticipantCount,
  setSpeakingCount,
  setMuted,
  setScreenSharing,
} from "@entities/room/model/roomSlice";

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
      {audioTracks.map((trackRef) => {
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
  const { isMicrophoneEnabled, isScreenShareEnabled } = useLocalParticipant();

  useEffect(() => {
    dispatch(setParticipantCount(participants.length));
  }, [participants.length, dispatch]);

  useEffect(() => {
    dispatch(setSpeakingCount(speakingParticipants.length));
  }, [speakingParticipants.length, dispatch]);

  useEffect(() => {
    dispatch(setMuted(!isMicrophoneEnabled));
  }, [isMicrophoneEnabled, dispatch]);

  useEffect(() => {
    dispatch(setScreenSharing(isScreenShareEnabled));
  }, [isScreenShareEnabled, dispatch]);

  return null;
}

// Оборачивает дочерние компоненты в LiveKit RoomContext когда есть активный Room.
// Без активного звонка просто рендерит children без контекста.
export function VoiceRoomProvider({ children }: { children: React.ReactNode }) {
  const [room, setRoom] = useState<Room | null>(() => getActiveRoom());

  useEffect(() => {
    return subscribeRoom(setRoom);
  }, []);

  if (!room) {
    return <>{children}</>;
  }

  return (
    <RoomContext.Provider value={room}>
      <VoiceAudioRenderer />
      <VoiceStateSyncer />
      {children}
    </RoomContext.Provider>
  );
}
