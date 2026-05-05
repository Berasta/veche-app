import type { Message } from "@store/slices/messagesSlice";

export interface GroupedMessage {
  msg: Message;
  showHeader: boolean;
  dateLabel?: string;
}

export function groupMessages(messages: Message[]): GroupedMessage[] {
  const result: GroupedMessage[] = [];
  let lastAuthor = "";
  let lastDate = "";

  for (const msg of messages) {
    const msgDate = new Date(msg.created);
    const dateKey = msgDate.toDateString();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let dateLabel: string | undefined;
    if (dateKey !== lastDate) {
      lastDate = dateKey;
      if (dateKey === today) dateLabel = "Сегодня";
      else if (dateKey === yesterday) dateLabel = "Вчера";
      else dateLabel = msgDate.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
    }

    const showHeader = msg.user_id !== lastAuthor || dateLabel !== undefined;
    if (msg.user_id !== lastAuthor) lastAuthor = msg.user_id;

    result.push({ msg, showHeader, dateLabel });
  }
  return result;
}
