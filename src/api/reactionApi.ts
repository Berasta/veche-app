import { pb } from "./pb";

export interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created: string;
}

export async function fetchReactions(channelId: string): Promise<Reaction[]> {
  const result = await pb.collection("reactions").getFullList<Reaction>({
    filter: `message_id.channel_id = "${channelId}"`,
  }, { $autoCancel: false });
  return result;
}

export async function addReaction(messageId: string, emoji: string): Promise<void> {
  const existing = await pb.collection("reactions").getList(1, 1, {
    filter: `message_id = "${messageId}" && user_id = "${pb.authStore.record!.id}" && emoji = "${emoji}"`,
  });
  if (existing.items.length > 0) return;
  await pb.collection("reactions").create({
    message_id: messageId,
    user_id: pb.authStore.record!.id,
    emoji,
  });
}

export async function removeReaction(messageId: string, emoji: string): Promise<void> {
  const existing = await pb.collection("reactions").getList(1, 1, {
    filter: `message_id = "${messageId}" && user_id = "${pb.authStore.record!.id}" && emoji = "${emoji}"`,
  });
  if (existing.items.length > 0) {
    await pb.collection("reactions").delete(existing.items[0].id);
  }
}
