import { useRef, useEffect, useState, useCallback, ReactNode } from "react";
import { Portal } from "./Portal";
import { Volume2, Crown, Calendar, X } from "lucide-react";
import { PB_URL } from "@api/pb";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface UserProfile {
  username: string;
  avatarUrl?: string | null;
  bannerId?: string | null;
  role?: string;
  roleColor?: string;
  joinedAt?: string;
  userId?: string;
}

interface UserPopoverProps extends UserProfile {
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  children: ReactNode;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const POPOVER_WIDTH = 256;
const POPOVER_HEIGHT = 220;
const GAP = 8;
const HOVER_DELAY_MS = 200;
const HOVER_LEAVE_MS = 150;
const BANNER_COLLECTION = "_pb_users_auth_";

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildBannerUrl(bannerId?: string | null, userId?: string): string | null {
  if (!bannerId || !userId) return null;
  return `${PB_URL}/api/files/${BANNER_COLLECTION}/${userId}/${bannerId}`;
}

function loadBannerPosition(bannerId?: string | null): { x: number; y: number } {
  if (!bannerId) return { x: 50, y: 50 };
  try {
    const saved = localStorage.getItem(`bannerPosition_${bannerId}`);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return { x: 50, y: 50 };
}

function computePopoverPosition(
  trigger: HTMLElement,
): { top: number; left: number } {
  const rect = trigger.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const top =
    spaceBelow > POPOVER_HEIGHT + GAP || spaceBelow >= spaceAbove
      ? rect.bottom + GAP
      : rect.top - POPOVER_HEIGHT - GAP;
  const left = Math.max(
    GAP,
    Math.min(
      rect.left + rect.width / 2 - POPOVER_WIDTH / 2,
      window.innerWidth - POPOVER_WIDTH - GAP,
    ),
  );
  return { top, left };
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function AvatarCircle({
  avatarUrl,
  username,
  size,
}: {
  avatarUrl?: string | null;
  username: string;
  size: "sm" | "lg";
}) {
  const dim = size === "lg" ? "w-14 h-14" : "w-12 h-12";
  const ring = size === "lg" ? "ring-[3px]" : "ring-[2px]";
  const iconSize = size === "lg" ? "w-7 h-7" : "w-6 h-6";

  return (
    <div
      className={`${dim} ${ring} rounded-full bg-card ring-card shadow-lg shadow-black/30 overflow-hidden flex-shrink-0`}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Crown className={`${iconSize} text-primary/70`} strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}

function BannerSection({
  bannerUrl,
  bannerPos,
  children,
}: {
  bannerUrl: string | null;
  bannerPos: { x: number; y: number } | null;
  children: ReactNode;
}) {
  return (
    <div className="relative w-full aspect-[2.5/1] rounded-t-2xl overflow-hidden bg-black/10">
      {bannerUrl && (
        <img
          src={bannerUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={bannerPos ? { objectPosition: `${bannerPos.x}% ${bannerPos.y}%` } : undefined}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10" />
      {children}
    </div>
  );
}

function BannerModalSection({
  bannerUrl,
  bannerPos,
  onClose,
  children,
}: {
  bannerUrl: string | null;
  bannerPos: { x: number; y: number } | null;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="relative w-full aspect-[3.2/1] rounded-t-2xl overflow-hidden bg-black/10">
      {bannerUrl && (
        <img
          src={bannerUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={bannerPos ? { objectPosition: `${bannerPos.x}% ${bannerPos.y}%` } : undefined}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
      <button
        onClick={onClose}
        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
        aria-label="Закрыти"
      >
        <X className="w-3.5 h-3.5 text-white" />
      </button>
      {children}
    </div>
  );
}

function RoleBadge({ role, color }: { role: string; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color || "#888" }} />
      <span className="text-sm font-medium text-foreground">{role}</span>
    </div>
  );
}

function JoinedDate({ joinedAt }: { joinedAt: string }) {
  const formatted = new Date(joinedAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <div className="flex items-center gap-1.5">
      <Calendar size={11} className="text-muted-foreground/50 flex-shrink-0" strokeWidth={1.5} />
      <p className="text-sm text-muted-foreground/70">{formatted}</p>
    </div>
  );
}

function UsernameOverlay({
  username,
  size,
}: {
  username: string;
  size: "popover" | "modal";
}) {
  const textClass =
    size === "modal"
      ? "text-lg font-bold text-white drop-shadow-lg leading-tight"
      : "text-sm font-bold text-white drop-shadow-lg truncate leading-tight max-w-[90%] text-center";

  return (
    <div className="inline-block px-2 py-0.5 rounded-md bg-black/30 backdrop-blur-sm">
      <p className={textClass}>{username}</p>
    </div>
  );
}

function VolumeSlider({
  volume,
  onChange,
}: {
  volume?: number;
  onChange?: (volume: number) => void;
}) {
  if (onChange === undefined || volume === undefined) return null;

  return (
    <div className="px-4 pb-4">
      <div className="bg-muted/30 backdrop-blur-sm border border-border/50 rounded-xl px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <Volume2 size={13} className="text-muted-foreground/70 flex-shrink-0" strokeWidth={1.5} />
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer bg-muted/60 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:shadow-primary/30"
            aria-label="Громкость"
          />
          <span className="text-[11px] font-medium text-muted-foreground/80 w-6 text-right flex-shrink-0 tabular-nums">
            {volume}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

function useHoverPopover() {
  const [show, setShow] = useState(false);
  const enterTimer = useRef<ReturnType<typeof setTimeout>>();
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      clearTimeout(enterTimer.current);
      clearTimeout(leaveTimer.current);
    };
  }, []);

  const onMouseEnter = useCallback(() => {
    clearTimeout(leaveTimer.current);
    clearTimeout(enterTimer.current);
    enterTimer.current = setTimeout(() => setShow(true), HOVER_DELAY_MS);
  }, []);

  const onMouseLeave = useCallback(() => {
    clearTimeout(enterTimer.current);
    clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => setShow(false), HOVER_LEAVE_MS);
  }, []);

  const keepOpen = useCallback(() => {
    clearTimeout(leaveTimer.current);
  }, []);

  const close = useCallback(() => {
    clearTimeout(enterTimer.current);
    clearTimeout(leaveTimer.current);
    setShow(false);
  }, []);

  return { show, setShow, onMouseEnter, onMouseLeave, keepOpen, close };
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function UserPopover({
  username,
  avatarUrl,
  bannerId,
  role,
  roleColor,
  joinedAt,
  volume,
  onVolumeChange,
  userId,
  children,
}: UserPopoverProps) {
  const bannerUrl = buildBannerUrl(bannerId, userId);
  const bannerPos = bannerUrl ? loadBannerPosition(bannerId) : null;

  const [showModal, setShowModal] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { show, onMouseEnter, onMouseLeave, keepOpen, close } = useHoverPopover();

  useEffect(() => {
    if (!show || !triggerRef.current) return;
    setPopoverPos(computePopoverPosition(triggerRef.current));
  }, [show]);

  const handleTriggerClick = useCallback(() => {
    close();
    setShowModal(true);
  }, [close]);

  return (
    <>
      <div
        ref={triggerRef}
        onClick={handleTriggerClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="inline-block cursor-pointer"
      >
        {children}
      </div>

      {/* Hover popover */}
      {show && (
        <Portal>
          <div
            ref={popoverRef}
            onMouseEnter={keepOpen}
            onMouseLeave={close}
            className="fixed z-[100] w-64 bg-card border border-border/50 rounded-2xl shadow-2xl shadow-black/20 backdrop-blur-xl"
            style={{ top: popoverPos.top, left: popoverPos.left }}
          >
            <BannerSection bannerUrl={bannerUrl} bannerPos={bannerPos}>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
                <AvatarCircle avatarUrl={avatarUrl} username={username} size="sm" />
                <UsernameOverlay username={username} size="popover" />
              </div>
            </BannerSection>

            <div className="px-4 pt-3 pb-2 space-y-2">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-1.5">
                  Чины
                </p>
                {role ? (
                  <RoleBadge role={role} color={roleColor} />
                ) : (
                  <p className="text-sm text-muted-foreground/50">Нѣтъ чина</p>
                )}
              </div>
              {joinedAt && <JoinedDate joinedAt={joinedAt} />}
            </div>
          </div>
        </Portal>
      )}

      {/* Modal */}
      {showModal && (
        <Portal>
          <div
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <BannerModalSection bannerUrl={bannerUrl} bannerPos={bannerPos} onClose={() => setShowModal(false)}>
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-3">
                  <AvatarCircle avatarUrl={avatarUrl} username={username} size="lg" />
                  <UsernameOverlay username={username} size="modal" />
                </div>
              </BannerModalSection>

              <div className="px-5 pb-5 pt-4 space-y-2">
                {role && <RoleBadge role={role} color={roleColor} />}
                {joinedAt && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
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
