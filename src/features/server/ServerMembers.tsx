import { useState, useEffect, useRef, useMemo } from "react";
import { X, Users } from "lucide-react";
import { UserPopover } from "@entities/user/ui/UserPopover";
import { UserAvatar, type UserAvatarData } from "@entities/user/ui/UserAvatar";
import { MembersSkeleton } from "@shared/ui/Skeleton";
import { useAppSelector, useAppDispatch } from "@app/hooks";
import { useIsMobile } from "@shared/ui/use-mobile";
import { selectVolumes } from "@entities/room/model/roomSelectors";
import { setParticipantVolume } from "@store/thunks/roomThunk";
import { fetchServerMembers, selectServerMembers, selectServerMembersLoaded } from "@entities/member/model/membersSlice";
import type { MemberData } from "@entities/member/model/membersSlice";

interface ServerMembersProps {
  serverId: string;
  isOpen: boolean;
  onClose: () => void;
  inline?: boolean;
}

interface Member {
  id: string;
  username: string;
  avatarUrl: string | null;
  banner?: string;
  joinedAt?: string;
}

function MembersPanel({
  members, loading, roleMap, groupedMembers, onClose, showHeader = true, volumes = {}, onVolumeChange,
}: {
  members: MemberData[];
  loading: boolean;
  roleMap: Record<string, { name: string; color: string }>;
  groupedMembers: { roleName: string; roleColor?: string; members: MemberData[] }[];
  onClose: () => void;
  showHeader?: boolean;
  volumes?: Record<string, number>;
  onVolumeChange?: (identity: string, volume: number) => void;
}) {
  return (
    <>
      {showHeader && (
        <div className="h-11 px-4 flex items-center flex-shrink-0 relative">
          <Users className="w-3.5 h-3.5 text-foreground/30 mr-2" strokeWidth={1.5} />
          <span className="text-[10px] font-semibold text-foreground/30 uppercase tracking-wider flex-1">
            Люди града — {members.length}
          </span>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-foreground/5 flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors">
            <X className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
          <div className="absolute bottom-0 left-3 right-3 h-px bg-foreground/5" />
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? <MembersSkeleton /> : members.length === 0 ? (
          <div className="text-sm text-foreground/30 text-center py-8">Нѣтъ людей въ градѣ</div>
        ) : (
          <div className="space-y-3 pb-4">
            {groupedMembers.map((group) => (
              <div key={group.roleName}>
                <div className="flex items-center gap-1.5 px-1 mb-1">
                  {group.roleColor && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.roleColor }} />}
                  <span className="text-[10px] font-semibold text-foreground/25 uppercase tracking-widest">{group.roleName} — {group.members.length}</span>
                </div>
                <div className="space-y-0.5">
                  {group.members.map((member) => (
                    <div key={member.userId} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-foreground/[0.03] transition-colors">
                      <UserPopover username={member.username} avatarUrl={member.avatarUrl} bannerId={member.banner} userId={member.userId} role={member.role} roleColor={member.roleColor} joinedAt={member.joinedAt} volume={volumes[member.userId]} onVolumeChange={(v) => onVolumeChange?.(member.userId, v)} frame={member.avatarFrame}>
                        <UserAvatar user={member as UserAvatarData} size="md" showName />
                      </UserPopover>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function useMembers(serverId: string) {
  const dispatch = useAppDispatch();
  const members = useAppSelector(selectServerMembers(serverId));
  const loaded = useAppSelector(selectServerMembersLoaded(serverId));

  useEffect(() => {
    if (!loaded) dispatch(fetchServerMembers(serverId));
  }, [serverId, loaded, dispatch]);

  const roleMap = useMemo(() => {
    const map: Record<string, { name: string; color: string }> = {};
    for (const m of members) {
      if (m.role) map[m.userId] = { name: m.role, color: m.roleColor || "#888" };
    }
    return map;
  }, [members]);

  const groupedMembers = useMemo(() => {
    const groups: { roleName: string; roleColor?: string; members: MemberData[] }[] = [];
    const roleOrder: Record<string, number> = {};
    for (const member of members) {
      const r = roleMap[member.userId];
      const key = r?.name || "__none__";
      if (!(key in roleOrder)) {
        roleOrder[key] = groups.length;
        groups.push({ roleName: r?.name || "Участники", roleColor: r?.color, members: [] });
      }
      groups[roleOrder[key]].members.push(member);
    }
    groups.sort((a, b) => {
      if (a.roleName === "Участники") return 1;
      if (b.roleName === "Участники") return -1;
      return 0;
    });
    return groups;
  }, [members, roleMap]);

  return { members, loading: !loaded, roleMap, groupedMembers };
}

function ServerMembersContent({ serverId, onClose, showHeader }: { serverId: string; onClose: () => void; showHeader?: boolean }) {
  const dispatch = useAppDispatch();
  const { members, loading, roleMap, groupedMembers } = useMembers(serverId);
  const volumes = useAppSelector(selectVolumes);
  return (
    <MembersPanel
      members={members}
      loading={loading}
      roleMap={roleMap}
      groupedMembers={groupedMembers}
      onClose={onClose}
      showHeader={showHeader}
      volumes={volumes}
      onVolumeChange={(identity, v) => dispatch(setParticipantVolume({ identity, volume: v }))}
    />
  );
}

export function ServerMembers({ serverId, isOpen, onClose, inline }: ServerMembersProps) {
  const [animState, setAnimState] = useState<"closed" | "entering" | "open" | "leaving">("closed");
  const panelRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (inline) return;
    if (isOpen) {
      setAnimState("entering");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimState("open"));
      });
    } else {
      setAnimState("leaving");
      const timer = setTimeout(() => setAnimState("closed"), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, inline]);

  if (inline) {
    return <ServerMembersContent serverId={serverId} onClose={onClose} showHeader={false} />;
  }

  if (animState === "closed") return null;

  const panelVisible = animState === "open";

  if (isMobile) {
    const translateY = panelVisible ? "translate-y-0" : "translate-y-full";
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />
        <div
          ref={panelRef}
          className={`fixed bottom-0 left-0 right-0 z-[70] bg-sidebar backdrop-blur-xl border-t border-sidebar-border rounded-t-2xl max-h-[85vh] flex flex-col transition-transform duration-300 ease-out ${translateY}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center pt-2 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-sidebar-border/50" />
          </div>
          <ServerMembersContent serverId={serverId} onClose={onClose} />
        </div>
      </>
    );
  }

  return (
    <div
      ref={panelRef}
      className={`w-72 bg-background/60 backdrop-blur-xl flex flex-col flex-shrink-0 relative transition-all duration-200 ${panelVisible ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-px bg-foreground/5 pointer-events-none" />
      <ServerMembersContent serverId={serverId} onClose={onClose} />
    </div>
  );
}
