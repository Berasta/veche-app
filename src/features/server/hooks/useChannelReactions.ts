import { useState, useRef, useCallback, useEffect } from "react";
import { fetchReactions, addReaction, removeReaction } from "@shared/api/reactionApi";
import { pb } from "@shared/api/pb";
import type { ReactionGroup } from "@entities/message/ui/ReactionsBar";
import type { Message } from "@entities/message/model/messagesSlice";

/**
 * Manages reaction state for a channel: loading, real-time updates, and toggling.
 */
export function useChannelReactions(
  channelId: string | undefined,
  messages: Message[],
  userId: string | undefined,
) {
  const [reactionMap, setReactionMap] = useState<Record<string, ReactionGroup[]>>({});
  const reactionGenRef = useRef(0);

  const buildReactionMap = useCallback(
    async (chId: string) => {
      const gen = ++reactionGenRef.current;
      const all = await fetchReactions(chId);
      if (gen !== reactionGenRef.current) return;

      const grouped: Record<string, Record<string, { emoji: string; userIds: Set<string> }>> = {};
      for (const r of all) {
        if (!grouped[r.message_id]) grouped[r.message_id] = {};
        if (!grouped[r.message_id][r.emoji]) {
          grouped[r.message_id][r.emoji] = { emoji: r.emoji, userIds: new Set() };
        }
        grouped[r.message_id][r.emoji].userIds.add(r.user_id);
      }

      const result: Record<string, ReactionGroup[]> = {};
      for (const [msgId, groups] of Object.entries(grouped)) {
        result[msgId] = Object.values(groups).map((g) => ({
          emoji: g.emoji,
          count: g.userIds.size,
          hasMe: g.userIds.has(userId ?? ""),
        }));
      }

      if (gen !== reactionGenRef.current) return;
      setReactionMap(result);
    },
    [userId],
  );

  useEffect(() => {
    if (!channelId || messages.length === 0) return;
    buildReactionMap(channelId);
  }, [channelId, messages, buildReactionMap]);

  useEffect(() => {
    if (!channelId) return;
    pb.collection("reactions").subscribe("*", () => {
      buildReactionMap(channelId);
    });
    return () => {
      pb.collection("reactions").unsubscribe("*");
    };
  }, [channelId, buildReactionMap]);

  const handleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      const existing = reactionMap[messageId]?.find((r) => r.emoji === emoji);
      if (existing?.hasMe) {
        await removeReaction(messageId, emoji);
      } else {
        await addReaction(messageId, emoji);
      }
      if (channelId) {
        await buildReactionMap(channelId);
      }
    },
    [reactionMap, channelId, buildReactionMap],
  );

  return { reactionMap, handleReaction };
}
