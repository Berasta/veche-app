export function formatMessageTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const min = Math.floor(diff / 60000);

  if (min < 1) return "только что";
  if (min < 60) return `${min} мин. назад`;

  const hours = Math.floor(min / 60);
  if (hours < 6) return `${hours} ч. назад`;

  const today = now.toDateString() === d.toDateString();
  if (today) return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  const yesterday = new Date(now.getTime() - 86400000).toDateString() === d.toDateString();
  if (yesterday) return "вчера " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) + " " +
    d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}
