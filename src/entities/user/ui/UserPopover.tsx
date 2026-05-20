import { useRef, useEffect, useState, useCallback, ReactNode } from "react";
import { Portal } from "@shared/ui/Portal";
import { Crown, Calendar } from "lucide-react";


// ─── Types ─────────────────────────────────────────────────────────────────

export interface UserProfile {
  username: string;
  avatarUrl?: string | null;
  role?: string;
  roleColor?: string;
  joinedAt?: string;
  userId?: string;
  bio?: string;
}

interface UserPopoverProps extends UserProfile {
  children: ReactNode;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const POPOVER_WIDTH = 256;
const POPOVER_HEIGHT = 260;
const GAP = 8;
const HOVER_DELAY_MS = 150;
const HOVER_LEAVE_MS = 120;



// ─── Helpers ────────────────────────────────────────────────────────────────

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
}: {
  avatarUrl?: string | null;
  username: string;
  size: "sm" | "lg";
}) {
  const dim = size === "lg" ? "w-14 h-14" : "w-12 h-12";
  const iconSize = size === "lg" ? "w-7 h-7" : "w-6 h-6";

  return (
    <div
      className={`${dim} rounded-full bg-card shadow-lg shadow-black/30 overflow-hidden flex-shrink-0 ring-[2px] ring-card`}
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
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative w-full aspect-[2.5/1] rounded-t-2xl overflow-hidden bg-foreground/[0.04]">
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
  role,
  roleColor,
  joinedAt,
  userId,
  bio,
  children,
}: UserPopoverProps) {
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
            className="fixed z-[100] w-64 bg-card/95 backdrop-blur-xl rounded-2xl border border-border/30 shadow-2xl shadow-black/40 overflow-hidden"
            style={{ top: popoverPos.top, left: popoverPos.left }}
          >
            <BannerSection>
              <div className="absolute inset-0 flex items-center gap-2 p-3">
                <AvatarCircle
                  avatarUrl={avatarUrl}
                  username={username}
                  size="sm"
                />
                <UsernameOverlay username={username} />
              </div>
            </BannerSection>

            <div className="px-4 pt-3 pb-3 space-y-2.5">
              {/* Bio */}
              {bio && (
                <div>
                  <p className="text-[10px] font-semibold text-foreground/30 uppercase tracking-widest mb-1">
                    О себѣ
                  </p>
                  <p className="text-sm text-foreground/70 leading-snug line-clamp-3">{bio}</p>
                </div>
              )}

              {/* Role */}
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
