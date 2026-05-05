import { useEffect, useState, useRef, useMemo } from "react";
import { toast } from "sonner";
import { X, Users, User, Circle } from "lucide-react";
import { UserPopover } from "@components/ui/UserPopover";
import { MembersSkeleton } from "@components/ui/Skeleton";
import { getRoleMap } from "@api/rolesApi";
import { pb, PB_URL } from "@api/pb";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import { useIsMobile } from "@components/ui/use-mobile";
import { selectVolumes } from "@store/selectors/roomSelectors";
import { setParticipantVolume } from "@store/thunks/roomThunk";

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
  members: Member[];
  loading: boolean;
  roleMap: Record<string, { name: string; color: string }>;
  groupedMembers: { roleName: string; roleColor?: string; members: Member[] }[];
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
                    <div key={member.id} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-foreground/[0.03] transition-colors">
                      <UserPopover username={member.username} avatarUrl={member.avatarUrl} bannerId={member.banner} userId={member.id} role={roleMap[member.id]?.name} roleColor={roleMap[member.id]?.color} joinedAt={member.joinedAt} volume={volumes[member.id]} onVolumeChange={(v) => onVolumeChange?.(member.id, v)}>
                        <div className="w-7 h-7 flex-shrink-0">
                          <div className="w-full h-full rounded-full overflow-hidden bg-foreground/5 flex items-center justify-center cursor-pointer">
                            {member.avatarUrl ? <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-3.5 h-3.5 text-foreground/30" strokeWidth={1.5} />}
                          </div>
                        </div>
                      </UserPopover>
                      <span className="text-sm truncate text-foreground/60" style={roleMap[member.id]?.color ? { color: roleMap[member.id].color } : {}}>{member.username}</span>
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
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [roleMap, setRoleMap] = useState<Record<string, { name: string; color: string }>>({});
  // Загрузка участников сервера (только при смене сервера)
  useEffect(() => {
    setLoading(true);
    getRoleMap(serverId).then(setRoleMap).catch((err) => {
      console.error("Ошибка загрузки ролей", err);
      toast.error("Не удалось загрузить роли града");
    });
    (async () => {
      try {
        const seen = new Set<string>();
        const result: Member[] = [];

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
            avatarUrl: user.avatar ? `${PB_URL}/api/files/${user.collectionId}/${user.id}/${user.avatar}` : null,
            banner: user.banner || undefined,
            joinedAt: entry.created || undefined,
          });
        }

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
                avatarUrl: (ownerUser as any).avatar ? `${PB_URL}/api/files/${(ownerUser as any).collectionId}/${ownerId}/${(ownerUser as any).avatar}` : null,
                banner: (ownerUser as any).banner || undefined,
                joinedAt: undefined,
              });
            } catch (err) {
              console.error("Ошибка загрузки владыки града", err);
            }
          }
        } catch (err) {
          console.error("Ошибка загрузки града", err);
          toast.error("Не удалось загрузить свѣдѣнiя о градѣ");
        }

        const channels = await pb.collection("channels").getFullList({ filter: `server_id = "${serverId}"` });
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
              avatarUrl: user.avatar ? `${PB_URL}/api/files/${user.collectionId}/${user.id}/${user.avatar}` : null,
            });
          }
        }

        setMembers(result);
      } catch (err) {
        console.error("Ошибка загрузки людей града", err);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [serverId]);

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
    groups.sort((a, b) => {
      if (a.roleName === "Участники") return 1;
      if (b.roleName === "Участники") return -1;
      return 0;
    });
    return groups;
  }, [members, roleMap]);

  return { members, loading, roleMap, groupedMembers };
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

  const translateX = panelVisible ? "translate-x-0" : "translate-x-full";
  return (
    <div className="fixed inset-0 z-[60] flex" onClick={onClose}>
      <div className="flex-1 bg-black/20 transition-opacity duration-200" />
      <div
        ref={panelRef}
        className={`w-[85vw] md:w-72 bg-background/60 backdrop-blur-xl flex flex-col transition-transform duration-200 ease-out relative ${translateX}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute left-0 top-0 bottom-0 w-px bg-foreground/5 pointer-events-none" />
        <ServerMembersContent serverId={serverId} onClose={onClose} />
      </div>
    </div>
  );
}
