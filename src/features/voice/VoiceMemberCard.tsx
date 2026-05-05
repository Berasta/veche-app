import type { LucideIcon } from "lucide-react";
import { MicOff, Monitor, EarOff } from "lucide-react";
import { motion } from "motion/react";
import { UserPopover } from "@components/ui/UserPopover";

export interface VoiceMember {
  id: string;
  name: string;
  icon: LucideIcon;
  avatarUrl?: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isDeafened?: boolean;
  isScreenSharing: boolean;
}

interface VoiceMemberCardProps {
  member: VoiceMember;
  index: number;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  role?: string;
  roleColor?: string;
  bannerId?: string;
  joinedAt?: string;
}

export function VoiceMemberCard({ member, index, volume, onVolumeChange, role, roleColor, bannerId, joinedAt }: VoiceMemberCardProps) {
  const initials = member.name.charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        relative rounded-lg border p-4 flex flex-col items-center gap-3
        transition-all duration-200 group cursor-pointer select-none
        ${
          member.isSpeaking
            ? "border-primary/50 bg-primary/5 shadow-md shadow-primary/10"
            : "border-border bg-card/40 hover:bg-card/60 hover:border-primary/30"
        }
      `}
    >
      {/* Аватар с иконками статуса */}
      <UserPopover
        username={member.name}
        avatarUrl={member.avatarUrl}
        bannerId={bannerId}
        role={role}
        roleColor={roleColor}
        joinedAt={joinedAt}
        volume={volume}
        onVolumeChange={onVolumeChange}
      >
        <div className="relative flex-shrink-0">
          {/* Speaking animation ring */}
          {member.isSpeaking && (
            <span className="absolute inset-0 w-14 h-14 rounded-full animate-ping bg-primary/20" />
          )}
          <div
            className={`
              relative w-14 h-14 rounded-full flex items-center justify-center overflow-hidden
              transition-all duration-200 cursor-pointer
              ${member.isSpeaking ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
              ${member.isMuted ? "opacity-60" : ""}
            `}
          >
            {member.avatarUrl ? (
              <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-sm font-bold
                ${member.isSpeaking ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}
              `}>
                {initials}
              </div>
            )}
          </div>

          {/* Deafen icon (local user only) */}
          {member.isDeafened && (
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center ring-[2px] ring-background">
              <EarOff className="w-2.5 h-2.5 text-white" />
            </div>
          )}

          {/* Muted icon */}
          {!member.isDeafened && member.isMuted && (
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center ring-[2px] ring-background">
              <MicOff className="w-2.5 h-2.5 text-white" />
            </div>
          )}

          {/* Screen share icon */}
          {member.isScreenSharing && (
            <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center ring-[2px] ring-background">
              <Monitor className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
      </UserPopover>

      {/* Имя */}
      <div className="text-center min-w-0 w-full">
        <p className="text-sm font-medium text-foreground truncate">
          {member.name}
        </p>
      </div>

      {/* Статусы */}
      <div className="flex items-center gap-2">
        {member.isSpeaking && (
          <span className="text-xs text-primary font-medium">Говоритъ</span>
        )}
      </div>

    </motion.div>
  );
}
