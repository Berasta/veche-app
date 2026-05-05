import { UserPopover } from "../ui/UserPopover";

export interface MessageHeaderProps {
  author: string;
  avatar?: string;
  time: string;
  userId?: string;
  role?: string;
  roleColor?: string;
  bannerId?: string;
  joinedAt?: string;
  frame?: string;
}

export function MessageHeader({ author, avatar, time, userId, role, roleColor, bannerId, joinedAt, frame }: MessageHeaderProps) {
  const initials = author.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2 mb-1">
      <UserPopover username={author} avatarUrl={avatar} bannerId={bannerId} userId={userId} role={role} roleColor={roleColor} joinedAt={joinedAt} frame={frame}>
        <div className="flex items-center gap-1.5 cursor-pointer">
          <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] font-bold text-muted-foreground">{initials}</span>
            )}
          </div>
          <span className="text-sm font-medium" style={roleColor ? { color: roleColor } : {}}>{author}</span>
        </div>
      </UserPopover>
      <span className="text-xs text-muted-foreground">{time}</span>
    </div>
  );
}
