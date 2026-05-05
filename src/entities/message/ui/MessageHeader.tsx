import { UserPopover } from "@shared/ui/UserPopover";
import { UserAvatar, type UserAvatarData } from "@shared/ui/UserAvatar";

export interface MessageHeaderProps {
  author: string;
  avatar?: string | null;
  time: string;
  userId?: string;
  role?: string;
  roleColor?: string;
  bannerId?: string | null;
  joinedAt?: string;
  frame?: string;
}

export function MessageHeader({ author, avatar, time, userId, role, roleColor, bannerId, joinedAt, frame }: MessageHeaderProps) {
  const user: UserAvatarData = { id: userId || "", username: author, avatarUrl: avatar, frame, role, roleColor };

  return (
    <div className="flex items-center gap-2 mb-1">
      <UserPopover username={author} avatarUrl={avatar} bannerId={bannerId} userId={userId} role={role} roleColor={roleColor} joinedAt={joinedAt} frame={frame}>
        <UserAvatar user={user} size="sm" showName />
      </UserPopover>
      <span className="text-xs text-foreground/40">{time}</span>
    </div>
  );
}
