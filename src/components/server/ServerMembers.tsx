import { useEffect, useState, useRef, useMemo } from "react";
import { X, Users, User } from "lucide-react";
import { Portal } from "@components/ui/Portal";
import { UserPopover } from "@components/ui/UserPopover";
import { MembersSkeleton } from "@components/ui/Skeleton";
import { getRoleMap } from "@api/rolesApi";
import { pb, PB_URL } from "@api/pb";
import { useAppSelector } from "@store/hooks";
import { selectParticipants } from "@store/selectors/roomSelectors";

interface ServerMembersProps {
  serverId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Member {
  id: string;
  username: string;
  avatarUrl: string | null;
  banner?: string;
  joinedAt?: string;
}

export function ServerMembers({ serverId, isOpen, onClose }: ServerMembersProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [roleMap, setRoleMap] = useState<Record<string, { name: string; color: string }>>({});
  const voiceParticipants = useAppSelector(selectParticipants);
  const [animState, setAnimState] = useState<"closed" | "entering" | "open" | "leaving">("closed");
  const panelRef = useRef<HTMLDivElement>(null);

  // Manage animation states
  useEffect(() => {
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
  }, [isOpen]);

  // Fetch data when panel opens
  useEffect(() => {
    if (animState !== "open") return;

    setLoading(true);
    getRoleMap(serverId).then(setRoleMap).catch(() => {});
    (async () => {
      try {
        const seen = new Set<string>();
        const result: Member[] = [];

        // 1. Server members from server_members
        const sm = await pb.collection("server_members").getFullList({
          filter: `server_id = "${serverId}"`,
          expand: "user_id",
        });
        for (const entry of sm as any[]) {
          const user = entry.expand?.user_id;
          if (!user || seen.has(user.id)) continue;
          seen.add(user.id);
          result.push({
            id: user.id,
            username: user.username || user.email || "Пользователь",
            avatarUrl: user.avatar
              ? `${PB_URL}/api/files/${user.collectionId}/${user.id}/${user.avatar}`
              : null,
            banner: user.banner || undefined,
            joinedAt: entry.created || undefined,
          });
        }

        // 2. Server owner (might not be in server_members)
        try {
          const serverRecord = await pb.collection("servers").getOne(serverId);
          const ownerId = (serverRecord as any).owner_id;
          if (ownerId && !seen.has(ownerId)) {
            try {
              const ownerUser = await pb.collection("users").getOne(ownerId);
              seen.add(ownerId);
              result.push({
                id: ownerId,
                username: (ownerUser as any).username || (ownerUser as any).email || "Владыка",
                avatarUrl: (ownerUser as any).avatar
                  ? `${PB_URL}/api/files/${(ownerUser as any).collectionId}/${ownerId}/${(ownerUser as any).avatar}`
                  : null,
                banner: (ownerUser as any).banner || undefined,
                joinedAt: undefined,
              });
            } catch {}
          }
        } catch {}

        // 3. Voice participants (might not be in server_members yet)
        for (const p of voiceParticipants) {
          if (!seen.has(p.identity)) {
            seen.add(p.identity);
            result.push({ id: p.identity, username: p.name, avatarUrl: null });
          }
        }

        // 3. Message authors as fallback
        const channels = await pb.collection("channels").getFullList({
          filter: `server_id = "${serverId}"`,
        });
        const channelIds = channels.map((c: any) => c.id);
        if (channelIds.length > 0) {
          const orFilters = channelIds.map((id) => `channel_id = "${id}"`).join(" || ");
          const messages = await pb.collection("messages").getList(1, 200, {
            filter: `(${orFilters}) && is_deleted = false`,
            sort: "-created",
            expand: "user_id",
          });
          for (const msg of messages.items as any[]) {
            const user = msg.expand?.user_id;
            if (!user || seen.has(user.id)) continue;
            seen.add(user.id);
            result.push({
              id: user.id,
              username: user.username || user.email || "Пользователь",
              avatarUrl: user.avatar
                ? `${PB_URL}/api/files/${user.collectionId}/${user.id}/${user.avatar}`
                : null,
            });
          }
        }

        setMembers(result);
      } catch {
        setMembers([]);
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animState, serverId]);

  // Group members by role
  const groupedMembers = useMemo(() => {
    const groups: { roleName: string; roleColor?: string; members: Member[] }[] = [];
    const roleOrder: Record<string, number> = {};

    for (const member of members) {
      const r = roleMap[member.id];
      const key = r?.name || "__none__";
      if (!(key in roleOrder)) {
        roleOrder[key] = groups.length;
        groups.push({ roleName: r?.name || "Участники", roleColor: r?.color, members: [] });
      }
      groups[roleOrder[key]].members.push(member);
    }

    // Sort: owner first, then by role
    groups.sort((a, b) => {
      if (a.roleName === "Участники") return 1;
      if (b.roleName === "Участники") return -1;
      return 0;
    });

    return groups;
  }, [members, roleMap]);

  if (animState === "closed") return null;

  const translateX = animState === "open" ? "translate-x-0" : "translate-x-full";

  return (
    <Portal>
      <div className="fixed inset-0 z-[60] bg-black/20 transition-opacity duration-200" onClick={onClose} />
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 bottom-0 z-[60] w-80 md:w-72 bg-card border-l border-border shadow-2xl flex flex-col transition-transform duration-200 ease-out ${translateX}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-12 px-4 flex items-center border-b border-border bg-sidebar/30 flex-shrink-0">
          <Users className="w-4 h-4 text-primary mr-2" strokeWidth={2} />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">
            Люди града — {members.length}
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <MembersSkeleton />
          ) : members.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">Нѣтъ людей въ градѣ</div>
          ) : (
            <div className="space-y-3">
              {groupedMembers.map((group) => (
                <div key={group.roleName}>
                  <div className="flex items-center gap-1.5 px-1 mb-1">
                    {group.roleColor && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.roleColor }} />}
                    <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
                      {group.roleName} — {group.members.length}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {group.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
                        <UserPopover username={member.username} avatarUrl={member.avatarUrl} bannerId={member.banner} role={roleMap[member.id]?.name} roleColor={roleMap[member.id]?.color} joinedAt={member.joinedAt}>
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center cursor-pointer">
                            {member.avatarUrl ? (
                              <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                            )}
                          </div>
                        </UserPopover>
                        <span className="text-sm truncate" style={roleMap[member.id]?.color ? { color: roleMap[member.id].color } : {}}>{member.username}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}
