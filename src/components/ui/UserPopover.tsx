import { useState, useRef, useEffect, ReactNode, useCallback, useMemo } from "react";
import { Portal } from "./Portal";
import { Volume2, Crown, Calendar } from "lucide-react";
import { banners } from "../BannerSelector";

interface UserPopoverProps {
  username: string;
  avatarUrl?: string | null;
  bannerId?: string | null;
  role?: string;
  roleColor?: string;
  joinedAt?: string;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  userId?: string;
  children: ReactNode;
}

const POPOVER_WIDTH = 256;
const POPOVER_HEIGHT = 200;
const GAP = 8;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getBanner(bannerId?: string | null, username?: string) {
  if (bannerId) {
    const found = banners.find((b) => b.id === bannerId);
    if (found) return found;
  }
  return banners[hashString(username || "") % banners.length];
}

export function UserPopover({ username, avatarUrl, bannerId, role, roleColor, joinedAt, volume, onVolumeChange, userId, children }: UserPopoverProps) {
  const banner = useMemo(() => getBanner(bannerId, username), [username, bannerId]);
  const [show, setShow] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!show || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const top = spaceBelow > POPOVER_HEIGHT + GAP || spaceBelow >= spaceAbove
      ? rect.bottom + GAP
      : rect.top - POPOVER_HEIGHT - GAP;
    const left = Math.max(GAP, Math.min(rect.left + rect.width / 2 - POPOVER_WIDTH / 2, window.innerWidth - POPOVER_WIDTH - GAP));
    setPos({ top, left });
  }, [show]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
      triggerRef.current && !triggerRef.current.contains(e.target as Node)
    ) {
      setShow(false);
    }
  }, []);

  useEffect(() => {
    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [show, handleClickOutside]);

  const handleClick = () => setShow((prev) => !prev);

  return (
    <div ref={triggerRef} onClick={handleClick} className="inline-block cursor-pointer">
      {children}

      {show && (
        <Portal>
          <div
            ref={popoverRef}
            className="fixed z-[100] w-64 bg-card border border-border/50 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden backdrop-blur-xl"
            style={{ top: pos.top, left: pos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Banner with avatar on the left */}
            <div className={`relative h-20 bg-gradient-to-br ${banner.gradient} overflow-hidden`}>
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: banner.pattern }} />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 flex items-end gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ring-[3px] ring-card shadow-lg shadow-black/20 overflow-hidden flex-shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Crown className="w-6 h-6 text-primary/70" strokeWidth={1.5} />
                  )}
                </div>
                <div className="min-w-0 pb-0.5">
                  <p className="text-sm font-bold text-foreground drop-shadow-sm truncate leading-tight">{username}</p>
                </div>
              </div>
            </div>

            {/* Role section */}
            <div className="px-4 pt-3 pb-2 space-y-2">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-1.5">Чины</p>
                {role ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: roleColor || "#888" }} />
                    <span className="text-sm font-medium text-foreground">{role}</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/50">Нѣтъ чина</p>
                )}
              </div>
              {joinedAt && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-1">На серверѣ</p>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={11} className="text-muted-foreground/50 flex-shrink-0" strokeWidth={1.5} />
                    <p className="text-sm text-muted-foreground/70">{new Date(joinedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Volume slider */}
            {onVolumeChange && volume !== undefined && (
              <div className="px-4 pb-4">
                <div className="bg-muted/30 backdrop-blur-sm border border-border/50 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Volume2 size={13} className="text-muted-foreground/70 flex-shrink-0" strokeWidth={1.5} />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={volume}
                      onChange={(e) => onVolumeChange(Number(e.target.value))}
                      className="flex-1 h-1 rounded-full appearance-none cursor-pointer bg-muted/60 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:shadow-primary/30"
                    />
                    <span className="text-[11px] font-medium text-muted-foreground/80 w-6 text-right flex-shrink-0 tabular-nums">{volume}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Portal>
      )}
    </div>
  );
}
