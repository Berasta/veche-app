import { useEffect } from "react";
import { pb } from "@api/pb";
import { useAppDispatch } from "@store/hooks";
import { messageReceived, messageUpdated, messageDeleted } from "@store/slices/messagesSlice";
import type { RecordSubscription } from "pocketbase";

let subscribed = false;

function normalizeMessage(record: any) {
  const author = record.expand?.user_id;
  return {
    id: record.id,
    channel_id: record.channel_id,
    user_id: record.user_id,
    content: record.content,
    edited_at: record.edited_at || null,
    is_deleted: record.is_deleted || false,
    created: record.created,
    author_name: author?.name || author?.username || "Пользователь",
    author_avatar: author?.avatar || null,
    author_avatar_url: author?.avatar && author?.collectionId
      ? `${import.meta.env.VITE_PB_URL || "http://localhost:8090"}/api/files/${author.collectionId}/${author.id}/${author.avatar}`
      : null,
    author_banner: author?.banner || undefined,
    images: [],
  };
}

export function useRealtime() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (subscribed) return;
    subscribed = true;

    // Subscribe to ALL messages (filtered by Redux reducers)
    pb.collection("messages").subscribe("*", (e: RecordSubscription) => {
      const msg = normalizeMessage(e.record);
      switch (e.action) {
        case "create": dispatch(messageReceived(msg)); break;
        case "update": dispatch(messageUpdated(msg)); break;
        case "delete": dispatch(messageDeleted(msg.id)); break;
      }
    }, { expand: "user_id" });

    return () => {
      pb.collection("messages").unsubscribe("*");
      subscribed = false;
    };
  }, [dispatch]);
}
