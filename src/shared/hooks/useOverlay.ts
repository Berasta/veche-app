import { useEffect, useRef } from "react";
import { isTauri } from "@shared/lib/tauri";
import { useAppSelector } from "@app/hooks";
import { selectParticipants, selectIsMuted } from "@entities/room/model/roomSelectors";

export function useOverlay() {
  const participants = useAppSelector(selectParticipants);
  const isMuted = useAppSelector(selectIsMuted);
  const lastEmit = useRef<string>("");

  useEffect(() => {
    if (!isTauri()) return;

    const speaking = participants
      .filter((p) => p.isSpeaking && !p.isLocal)
      .map((p) => p.name);

    const payload = JSON.stringify({ isMuted, speaking });

    if (payload === lastEmit.current) return;
    lastEmit.current = payload;

    import("@tauri-apps/api/event").then(({ emit }) => {
      emit("overlay-state", { isMuted, isDeafened: false, speaking });
    });
  }, [participants, isMuted]);
}
