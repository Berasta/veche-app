import { useEffect, useRef } from "react";
import { pb } from "@api/pb";
import { useAppDispatch } from "@store/hooks";
import { markActive } from "@store/slices/presenceSlice";

export function useRealtime() {
  const dispatch = useAppDispatch();
  const heartbeatRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    // Heartbeat: mark current user as active periodically
    heartbeatRef.current = setInterval(() => {
      const uid = pb.authStore.record?.id;
      if (uid) dispatch(markActive(uid));
    }, 30000);

    // Mark user active on mount
    const uid = pb.authStore.record?.id;
    if (uid) dispatch(markActive(uid));

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [dispatch]);
}
