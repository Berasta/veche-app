import { UserPopover } from "@entities/user/ui/UserPopover";
import { UserAvatar } from "@entities/user/ui/UserAvatar";

export interface MessageHeaderProps {
  author: string;
  avatar?: string | null;
  time: string;
  userId?: string;
  role?: string;
  roleColor?: string;
  joinedAt?: string;
}

export function MessageHeader({ author, avatar, time, userId, role, roleColor, joinedAt }: MessageHeaderProps) {
  const user = { id: userId || "", username: author, avatarUrl: avatar, role, roleColor };

  return (
    <div className="flex items-center gap-2 mb-1">
      <UserPopover username={author} avatarUrl={avatar} userId={userId} role={role} roleColor={roleColor} joinedAt={joinedAt}>
        <UserAvatar user={user} size="sm" showName />
      </UserPopover>
      <span className="text-xs text-foreground/40">{time}</span>
    </div>
  );
}
