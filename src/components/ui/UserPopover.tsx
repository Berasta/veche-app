import { useState, useRef, useEffect, ReactNode, useMemo } from "react";
import { Portal } from "./Portal";
import { Volume2, Crown, Calendar, X } from "lucide-react";
import { PB_URL } from "@api/pb";

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

function getBannerUrl(bannerId?: string | null, userId?: string): string | null {
  if (!bannerId || !userId) return null;
  const colId = "_pb_users_auth_";
  return `${PB_URL}/api/files/${colId}/${userId}/${bannerId}`;
}

function loadBannerPosition(bannerId?: string | null): { x: number; y: number } {
  if (!bannerId) return { x: 50, y: 50 };
  try {
    const saved = localStorage.getItem(`bannerPosition_${bannerId}`);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return { x: 50, y: 50 };
}

export function UserPopover({ username, avatarUrl, bannerId, role, roleColor, joinedAt, volume, onVolumeChange, userId, children }: UserPopoverProps) {
  const bannerUrl = useMemo(() => getBannerUrl(bannerId, userId), [bannerId, userId]);
  const bannerPos = useMemo(() => bannerUrl ? loadBannerPosition(bannerId) : null, [bannerId]);
  const [show, setShow] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>();

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

  const handleMouseEnter = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setShow(true), 200);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimer.current);
    setTimeout(() => setShow(false), 150);
  };

  const handleTriggerClick = () => {
    setShow(false);
    setShowModal(true);
  };

  return (
    <>
      <div ref={triggerRef} onClick={handleTriggerClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="inline-block cursor-pointer">
        {children}

        {show && (
          <Portal>
            <div
              ref={popoverRef}
              onMouseEnter={() => clearTimeout(hoverTimer.current)}
              onMouseLeave={() => setShow(false)}
              className="fixed z-[100] w-64 bg-card border border-border/50 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden backdrop-blur-xl"
              style={{ top: pos.top, left: pos.left }}
            >
              {/* Banner */}
              <div className="relative w-full aspect-[3.2/1] bg-black/10">
                {bannerUrl ? (
                  <img src={bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover"
                    style={bannerPos ? { objectPosition: `${bannerPos.x}% ${bannerPos.y}%` } : undefined} />
                ) : null}
              </div>

              {/* Avatar + Name (overlapping banner) */}
              <div className="flex items-end gap-3 px-4 -mt-6 pb-3">
                <div className="w-12 h-12 rounded-full bg-card ring-[3px] ring-card shadow-lg shadow-black/30 flex-shrink-0 overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-primary/70" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 pb-0.5">
                  <p className="text-sm font-bold text-foreground truncate leading-tight">{username}</p>
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

      {/* Minimal profile modal */}
      {showModal && (
        <Portal>
          <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Banner */}
              <div className="relative w-full aspect-[3.2/1] overflow-hidden bg-black/10">
                {bannerUrl ? (
                  <img src={bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover"
                    style={bannerPos ? { objectPosition: `${bannerPos.x}% ${bannerPos.y}%` } : undefined} />
                ) : null}
                <button onClick={() => setShowModal(false)}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors">
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>

              {/* Avatar + Name (overlapping banner) */}
              <div className="px-5 pb-5">
                <div className="flex items-end -mt-8 mb-4">
                  <div className="w-16 h-16 rounded-full bg-card ring-[3px] ring-card shadow-xl shadow-black/30 overflow-hidden flex-shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                        <Crown className="w-7 h-7 text-primary/60" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                </div>

                <h2 className="text-lg font-bold text-foreground">{username}</h2>

                {role && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: roleColor || "#888" }} />
                    <span className="text-sm text-muted-foreground">{role}</span>
                  </div>
                )}

                {joinedAt && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground/70">
                    <Calendar size={12} strokeWidth={1.5} />
                    <span>На серверѣ съ {new Date(joinedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
