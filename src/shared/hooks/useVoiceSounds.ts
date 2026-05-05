import { useEffect, useRef } from "react";
import { useAppSelector } from "@app/hooks";
import { selectParticipants } from "@entities/room/roomSelectors";
import { playJoinSound, playLeaveSound } from "@shared/lib/sounds";

export function useVoiceSounds() {
  const participants = useAppSelector(selectParticipants);
  const prevIdsRef = useRef<Set<string>>(new Set());
  const localIdRef = useRef<string | null>(null);

  useEffect(() => {
    const currentIds = new Set(participants.map((p) => p.identity));
    const local = participants.find((p) => p.isLocal);
    if (local) localIdRef.current = local.identity;

    const prevIds = prevIdsRef.current;

    // Skip on first mount
    if (prevIds.size > 0) {
      const joined = [...currentIds].filter((id) => !prevIds.has(id) && id !== localIdRef.current);
      const left = [...prevIds].filter((id) => !currentIds.has(id) && id !== localIdRef.current);

      joined.forEach(() => playJoinSound());
      left.forEach(() => playLeaveSound());
    }

    prevIdsRef.current = currentIds;
  }, [participants]);
}
