import { useEffect, useRef } from "react";
import { isTauri } from "@shared/lib/tauri";
import { useAppSelector } from "@app/hooks";
import { selectIsMuted } from "@entities/room/model/roomSelectors";
import { useSpeakingParticipants, useLocalParticipant } from "@livekit/components-react";

export function useOverlay() {
  const speakingParticipants = useSpeakingParticipants();
  const { localParticipant } = useLocalParticipant();
  const isMuted = useAppSelector(selectIsMuted);
  const lastEmit = useRef<string>("");

  useEffect(() => {
    if (!isTauri()) return;

    const speaking = speakingParticipants
      .filter((p) => p.identity !== localParticipant.identity)
      .map((p) => p.name || p.identity);

    const payload = JSON.stringify({ isMuted, speaking });

    if (payload === lastEmit.current) return;
    lastEmit.current = payload;

    import("@tauri-apps/api/event").then(({ emit }) => {
      emit("overlay-state", { isMuted, isDeafened: false, speaking });
    });
  }, [speakingParticipants, isMuted, localParticipant.identity]);
}
