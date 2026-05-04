import { ReactNode, useState } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { AnimatePresence, motion } from "motion/react";
import { MicOff, Mic, Volume2, UserX, Ear } from "lucide-react";
import { usePermissions } from "@hooks/usePermissions";
import { PERMISSIONS } from "@api/rolesApi";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { selectVolumes } from "@store/selectors/roomSelectors";
import { setParticipantVolume } from "@store/thunks/roomThunk";

interface UserContextMenuProps {
  serverId?: string;
  userId: string;
  username: string;
  isVoiceParticipant?: boolean;
  children: ReactNode;
}

export function UserContextMenu({ serverId, userId, username, isVoiceParticipant, children }: UserContextMenuProps) {
  const dispatch = useAppDispatch();
  const volumes = useAppSelector(selectVolumes);
  const volume = volumes[userId];
  const { can } = usePermissions(serverId);
  const canKick = can(PERMISSIONS.KICK_MEMBERS);
  const canMute = can(PERMISSIONS.MUTE_MEMBERS);
  const isMuted = volume === 0;

  const handleToggleMute = () => {
    dispatch(setParticipantVolume({ identity: userId, volume: isMuted ? 100 : 0 }));
  };

  const [open, setOpen] = useState(false);

  return (
    <ContextMenu.Root open={open} onOpenChange={setOpen}>
      <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
      <AnimatePresence>
        {open && (
          <ContextMenu.Portal forceMount>
            <ContextMenu.Content asChild forceMount
              className="min-w-44 bg-card border border-border/50 rounded-xl shadow-2xl shadow-black/20 backdrop-blur-xl p-1 z-[200]"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              >
          {/* Volume slider for voice participants */}
          {isVoiceParticipant && (
            <>
              <div className="px-2.5 py-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <Volume2 size={12} className="text-muted-foreground/60" strokeWidth={1.5} />
                  <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Громкость</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume ?? 100}
                  onChange={(e) => dispatch(setParticipantVolume({ identity: userId, volume: Number(e.target.value) }))}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer bg-muted/60 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <span className="text-[10px] text-muted-foreground/50 mt-1 block text-right">{volume ?? 100}%</span>
              </div>
              <ContextMenu.Separator className="h-px bg-border/50 mx-2" />
            </>
          )}

          {/* Mute (anyone can mute for themselves) */}
          {isVoiceParticipant && (
            <ContextMenu.Item
              onClick={handleToggleMute}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-foreground hover:bg-muted/50 outline-none cursor-pointer transition-colors"
            >
              {isMuted ? <Mic className="w-4 h-4" strokeWidth={1.5} /> : <MicOff className="w-4 h-4" strokeWidth={1.5} />}
              <span>{isMuted ? "Включить звукъ" : "Отключити звукъ"}</span>
            </ContextMenu.Item>
          )}

          {/* Server mute (requires permission) */}
          {canMute && isVoiceParticipant && (
            <ContextMenu.Item
              onClick={() => {}}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-foreground hover:bg-muted/50 outline-none cursor-pointer transition-colors"
            >
              <Ear className="w-4 h-4" strokeWidth={1.5} />
              <span>Заглушити на серверѣ</span>
            </ContextMenu.Item>
          )}

          {/* Kick (requires permission) */}
          {canKick && (
            <ContextMenu.Item
              onClick={() => {}}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 outline-none cursor-pointer transition-colors"
            >
              <UserX className="w-4 h-4" strokeWidth={1.5} />
              <span>Изгнати изъ града</span>
            </ContextMenu.Item>
          )}

          {!isVoiceParticipant && !canKick && (
            <div className="px-2.5 py-3 text-xs text-muted-foreground/50 text-center">Нѣтъ дѣйствій</div>
          )}
          </motion.div>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
