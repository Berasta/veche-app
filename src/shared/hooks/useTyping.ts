import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch } from "@app/hooks";
import { setTyping, cleanStaleTyping } from "@entities/typing/typingSlice";
import { useAuth } from "@entities/user/useAuth";

export function useTypingBroadcast(channelId?: string) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // Broadcast typing while user is typing (every 2s)
  const startTyping = useCallback(() => {
    if (!channelId || !user?.id) return;

    // Mark immediately
    dispatch(setTyping({ channelId, userId: user.id }));

    // Keep marking while typing (debounced)
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      dispatch(setTyping({ channelId, userId: user.id }));
    }, 2000);
  }, [channelId, user?.id, dispatch]);

  const stopTyping = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Periodic cleanup of stale typing indicators
  useEffect(() => {
    const cleanup = setInterval(() => dispatch(cleanStaleTyping()), 3000);
    return () => clearInterval(cleanup);
  }, [dispatch]);

  return { startTyping, stopTyping };
}
