import { ReactNode } from "react";
import { Crown, MicOff, EarOff } from "lucide-react";

export interface UserAvatarData {
  id: string;
  username: string;
  avatarUrl?: string | null;
  avatarFrame?: string;
  avatarAccessory?: string;
  role?: string;
  roleColor?: string;
  isSpeaking?: boolean;
  isMuted?: boolean;
  isDeafened?: boolean;
  joinedAt?: string;
  bannerId?: string;
}

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const SIZE_MAP: Record<AvatarSize, { dim: string; text: string; icon: string }> = {
  xs: { dim: "w-5 h-5", text: "text-[9px]", icon: "w-2.5 h-2.5" },
  sm: { dim: "w-6 h-6", text: "text-[10px]", icon: "w-3 h-3" },
  md: { dim: "w-8 h-8", text: "text-xs", icon: "w-3.5 h-3.5" },
  lg: { dim: "w-10 h-10", text: "text-sm", icon: "w-4 h-4" },
  xl: { dim: "w-14 h-14", text: "text-base", icon: "w-5 h-5" },
  "2xl": { dim: "w-20 h-20", text: "text-xl", icon: "w-7 h-7" },
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
        {/* Avatar image */}
        <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-foreground/5 ${s.text} font-bold text-foreground/40`}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <Crown className={s.icon} strokeWidth={1.5} />
          )}
        </div>
        {/* Speaking ring */}
        {speaking && (
          <div className="absolute inset-0 rounded-full ring-2 ring-primary ring-offset-1 ring-offset-background pointer-events-none" />
        )}
        {/* Status icons */}
        {user.isDeafened && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange-500 ring-[1.5px] ring-background flex items-center justify-center">
            <EarOff className="w-2 h-2 text-white" />
          </div>
        )}
        {!user.isDeafened && user.isMuted && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 ring-[1.5px] ring-background flex items-center justify-center">
            <MicOff className="w-2 h-2 text-white" />
          </div>
        )}
        {children}
      </div>

      {/* Name */}
      {showName && (
        <span
          className={`truncate ${s.text} font-medium ${
            speaking ? "text-foreground/80" : "text-foreground/50"
          }`}

        >
          {user.username}
        </span>
      )}
    </div>
  );
}
