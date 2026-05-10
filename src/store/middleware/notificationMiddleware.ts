import type { Middleware } from "@reduxjs/toolkit";
import { messageReceived } from "@entities/message/model/messagesSlice";
import { isTauri } from "@shared/lib/tauri";
import { pb } from "@shared/api/pb";

async function sendTrayNotification(title: string, body: string) {
  try {
    const { isPermissionGranted, requestPermission, sendNotification } =
      await import("@tauri-apps/plugin-notification");

    let granted = await isPermissionGranted();
    if (!granted) {
      const permission = await requestPermission();
      granted = permission === "granted";
    }

    if (granted) {
      sendNotification({ title, body });
    }
  } catch (err) {
    console.warn("[notifications] Failed to send notification:", err);
  }
}

export const notificationMiddleware: Middleware = () => (next) => (action) => {
  const result = next(action);

  if (!isTauri()) return result;
  if (!messageReceived.match(action)) return result;

  const myId = pb.authStore.record?.id;
  if (action.payload.user_id === myId) return result;

  // Only notify when window is not focused
  if (document.hasFocus()) return result;

  const content = action.payload.content?.trim();
  const hasImages = action.payload.images?.length > 0;
  const body = content
    ? content.slice(0, 120)
    : hasImages
      ? "📎 Изображенiе"
      : "Новое сообщенiе";

  sendTrayNotification("Вече", body);

  return result;
};
