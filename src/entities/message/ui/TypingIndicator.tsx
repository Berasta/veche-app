import { useAppSelector } from "@app/hooks";
import { selectTypingUsers } from "@entities/typing/model/typingSlice";
import { useAuth } from "@entities/user/model/useAuth";
import { useEffect, useState } from "react";

const USER_NAMES: Record<string, string> = {};

export function TypingIndicator({ channelId, userNames }: { channelId?: string; userNames?: Record<string, string> }) {
  const typingUserIds = useAppSelector((state) => channelId ? selectTypingUsers(channelId)(state) : []);
  const { user } = useAuth();
  const [dots, setDots] = useState("");

  // Animate dots
  useEffect(() => {
    if (typingUserIds.length === 0) return;
    const t = setInterval(() => setDots((p) => p.length >= 3 ? "" : p + "."), 500);
    return () => clearInterval(t);
  }, [typingUserIds.length > 0]);

  const others = typingUserIds.filter((id) => id !== user?.id);
  if (others.length === 0) return null;

  const names = others.map((id) => userNames?.[id] || "Кто-то");
  const label = names.length === 1
    ? `${names[0]} печатаетъ${dots}`
    : names.length === 2
      ? `${names[0]} и ${names[1]} печатаютъ${dots}`
      : `${names[0]} и другие печатаютъ${dots}`;

  return (
    <span className="text-[10px] text-muted-foreground/50 italic">
      {label}
    </span>
  );
}
