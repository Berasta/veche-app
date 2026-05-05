import { useRef, useEffect, useState, useCallback, ReactNode } from "react";
import { Portal } from "@shared/ui/Portal";
import { Volume2, Crown, Calendar } from "lucide-react";
import { PB_URL } from "@shared/api/pb";

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
  frame?: string;
  bannerSkin?: string;
  children: ReactNode;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const POPOVER_WIDTH = 256;
const POPOVER_HEIGHT = 220;
const GAP = 8;
const BANNER_COLLECTION = "_pb_users_auth_";

const BANNER_SKIN_CLASSES: Record<string, string> = {
  banner_golden: "bg-gradient-to-r from-yellow-400/60 via-amber-500/60 to-orange-600/60",
  banner_crimson: "bg-gradient-to-r from-red-600/60 via-rose-700/60 to-purple-800/60",
  banner_azure: "bg-gradient-to-r from-blue-500/60 via-cyan-600/60 to-teal-700/60",
  banner_emerald: "bg-gradient-to-r from-emerald-500/60 via-green-600/60 to-teal-800/60",
  banner_aurora: "bg-gradient-to-r from-green-400/50 via-blue-500/50 to-purple-600/50 animate-[aurora_4s_ease-in-out_infinite] bg-[length:200%_100%]",
  banner_inferno: "bg-gradient-to-r from-red-600/50 via-orange-500/50 to-yellow-400/50 animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]",
};

const FRAME_CLASSES: Record<string, string> = {
  frame_royal: "ring-2 ring-yellow-500",
  frame_violet: "ring-2 ring-violet-500",
  frame_ruby: "ring-2 ring-red-500",
  frame_ancient: "ring-2 ring-transparent animate-[frame-ancient_2s_ease-in-out_infinite]",
  frame_arcane: "ring-2 ring-transparent animate-[frame-arcane_2.5s_ease-in-out_infinite]",
  frame_rainbow: "ring-2 ring-transparent animate-[frame-rainbow_3s_linear_infinite]",
  frame_neon: "ring-2 ring-transparent animate-[frame-neon_1.5s_ease-in-out_infinite]",
  frame_fire: "ring-2 ring-transparent animate-[frame-flame_3s_ease-in-out_infinite]",
  frame_ice: "ring-2 ring-transparent animate-[frame-ice_3s_ease-in-out_infinite]",
  frame_shadow: "ring-2 ring-transparent animate-[frame-shadow_2s_ease-in-out_infinite]",
  frame_shine: "ring-2 ring-transparent animate-[frame-shine_3s_linear_infinite]",
  frame_aura: "ring-2 ring-transparent animate-[frame-aura_2.5s_ease-in-out_infinite]",
  frame_holo: "ring-2 ring-transparent animate-[frame-holo_4s_linear_infinite]",
  frame_pulsar: "ring-2 ring-transparent animate-[frame-pulsar_3s_ease-in-out_infinite]",
  frame_matrix: "ring-2 ring-transparent animate-[frame-matrix_2s_linear_infinite]",
  frame_stardust: "ring-2 ring-transparent animate-[frame-stardust_4s_ease-in-out_infinite]",
  frame_arc: "ring-2 ring-transparent animate-[frame-arc_2s_linear_infinite]",
  frame_storm: "ring-2 ring-transparent animate-[frame-storm_6s_ease-in-out_infinite]",
};

export function getFrameClass(frame: string): string {
  return FRAME_CLASSES[frame] || "ring-2 ring-card";
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildBannerUrl(
  bannerId?: string | null,
  userId?: string,
): string | null {
  if (!bannerId || !userId) return null;
  return `${PB_URL}/api/files/${BANNER_COLLECTION}/${userId}/${bannerId}`;
}

function loadBannerPosition(bannerId?: string | null): {
  x: number;
  y: number;
} {
  if (!bannerId) return { x: 50, y: 50 };
  try {
    const saved = localStorage.getItem(`bannerPosition_${bannerId}`);
    if (saved) return JSON.parse(saved);
  } catch {
    /* ignore */
  }
  return { x: 50, y: 50 };
}

function computePopoverPosition(trigger: HTMLElement): {
  top: number;
  left: number;
} {
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
  frame,
}: {
  avatarUrl?: string | null;
  username: string;
  size: "sm" | "lg";
  frame?: string;
}) {
  const dim = size === "lg" ? "w-14 h-14" : "w-12 h-12";
  const iconSize = size === "lg" ? "w-7 h-7" : "w-6 h-6";

  const frameClass = frame ? getFrameClass(frame) : "ring-[2px] ring-card";

  return (
    <div
      className={`${dim} rounded-full bg-card shadow-lg shadow-black/30 overflow-hidden flex-shrink-0 ${frameClass}`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={username}
          className="w-full h-full object-cover"
        />
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
  bannerSkin,
  bannerPos,
  children,
}: {
  bannerUrl: string | null;
  bannerSkin?: string;
  bannerPos: { x: number; y: number } | null;
  children: ReactNode;
}) {
  const skinClass = bannerSkin ? BANNER_SKIN_CLASSES[bannerSkin] : "";
  return (
    <div className="relative w-full aspect-[2.5/1] rounded-t-2xl overflow-hidden bg-black/10">
      {/* Custom banner image */}
      {bannerUrl && (
        <img
          src={bannerUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={bannerPos ? { objectPosition: `${bannerPos.x}% ${bannerPos.y}%` } : undefined}
        />
      )}
      {/* Banner skin overlay (semi-transparent gradient/pattern) */}
      {skinClass && (
        <div className={`absolute inset-0 ${skinClass}`} />
      )}
      {/* Dark gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10" />
      {children}
    </div>
  );
}

function RoleBadge({ role, color }: { role: string; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color || "#888" }} />
      <span className="text-sm text-foreground/60">{role}</span>
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
      <Calendar size={11} className="text-foreground/30 flex-shrink-0" strokeWidth={1.5} />
      <p className="text-sm text-foreground/40">{formatted}</p>
    </div>
  );
}

function UsernameOverlay({ username }: { username: string }) {
  return (
    <div className="inline-block px-2 py-0.5 rounded-md bg-black/30 backdrop-blur-sm">
      <p className="font-bold text-white drop-shadow-lg leading-tight">{username}</p>
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
  bannerSkin,
  role,
  roleColor,
  joinedAt,
  frame,
  userId,
  children,
}: UserPopoverProps) {
  const bannerUrl = buildBannerUrl(bannerId, userId);
  const bannerPos = bannerUrl ? loadBannerPosition(bannerId) : null;

  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { show, onMouseEnter, onMouseLeave, keepOpen, close } =
    useHoverPopover();

  useEffect(() => {
    if (!show || !triggerRef.current) return;
    setPopoverPos(computePopoverPosition(triggerRef.current));
  }, [show]);

  return (
    <>
      <div
        ref={triggerRef}
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
            className="fixed z-[100] w-64 bg-foreground/[0.02] backdrop-blur-xl rounded-2xl"
            style={{ top: popoverPos.top, left: popoverPos.left }}
          >
            <BannerSection bannerUrl={bannerUrl} bannerSkin={bannerSkin} bannerPos={bannerPos}>
              <div className="absolute inset-0 flex items-center gap-2 p-3">
                <AvatarCircle
                  avatarUrl={avatarUrl}
                  username={username}
                  size="sm"
                  frame={frame}
                />
                <UsernameOverlay username={username} />
              </div>
            </BannerSection>

            <div className="px-4 pt-3 pb-2 space-y-2">
              <div>
                <p className="text-[10px] font-semibold text-foreground/30 uppercase tracking-widest mb-1.5">
                  Чины
                </p>
                {role ? (
                  <RoleBadge role={role} color={roleColor} />
                ) : (
                  <p className="text-sm text-foreground/30">Нѣтъ чина</p>
                )}
              </div>
              {joinedAt && <JoinedDate joinedAt={joinedAt} />}
            </div>
          </div>
        </Portal>
      )}

    </>
  );
}
