import { forwardRef, ReactNode } from "react";
import { Crown } from "lucide-react";
import { pb } from "@shared/api/pb";
import { getFrameClass } from "./UserPopover";

export interface UserAvatarData {
  id: string;
  username: string;
  avatarUrl?: string | null;
  frame?: string;
  role?: string;
  roleColor?: string;
  isSpeaking?: boolean;
  isMuted?: boolean;
  isDeafened?: boolean;
  joinedAt?: string;
  bannerId?: string;
}

type AvatarSize = "xs" | "sm" | "md" | "lg";

const SIZE_MAP: Record<AvatarSize, { dim: string; text: string; icon: string }> = {
  xs: { dim: "w-5 h-5", text: "text-[9px]", icon: "w-2.5 h-2.5" },
  sm: { dim: "w-6 h-6", text: "text-[10px]", icon: "w-3 h-3" },
  md: { dim: "w-8 h-8", text: "text-xs", icon: "w-3.5 h-3.5" },
  lg: { dim: "w-10 h-10", text: "text-sm", icon: "w-4 h-4" },
};

interface UserAvatarProps {
  user: UserAvatarData;
  size?: AvatarSize;
  showName?: boolean;
  isSpeaking?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

export function UserAvatar({ user, size = "md", showName, isSpeaking, onClick, children }: UserAvatarProps) {
  const s = SIZE_MAP[size];
  const frameClass = user.frame ? getFrameClass(user.frame) : "";
  const speaking = isSpeaking ?? user.isSpeaking;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 min-w-0 ${onClick ? "cursor-pointer" : ""}`}
    >
      {/* Avatar with optional frame */}
      <div className={`relative flex-shrink-0 ${s.dim}`}>
        {/* Speaking ring */}
        {speaking && (
          <span className={`absolute inset-0 rounded-full animate-ping bg-primary/20 ${s.dim}`} />
        )}
        <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-foreground/5 ${frameClass} ${s.text} font-bold text-foreground/40 ${speaking ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}`}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <Crown className={s.icon} strokeWidth={1.5} />
          )}
        </div>

        {/* Status dots */}
        {user.isDeafened && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-orange-500 ring-[1.5px] ring-background" />
        )}
        {!user.isDeafened && user.isMuted && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 ring-[1.5px] ring-background" />
        )}
        {children}
      </div>

      {/* Name */}
      {showName && (
        <span
          className={`truncate ${s.text} font-medium ${
            speaking ? "text-foreground/80" : "text-foreground/50"
          }`}
          style={speaking && user.roleColor ? { color: user.roleColor } : undefined}
        >
          {user.username}
        </span>
      )}
    </div>
  );
}
