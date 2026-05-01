import { useEffect, useState, useRef } from "react";
import { useAppSelector } from "@store/hooks";
import { useNavigate, useParams } from "react-router";
import { Palata } from "./Palata";
import { TextPalata } from "./TextPalata";
import { useAuth } from "@store/hooks/useAuth";
import { AppRoutes } from "@routes/routes";
import { useIsMobile } from "@components/ui/use-mobile";
import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSIONS } from "@api/rolesApi";
import {
  X,
  Volume2,
  MessageSquare,
  Plus,
  UserPlus,
  Settings,
  Pencil,
  Trash2,
} from "lucide-react";
import { pb } from "@api/pb";
import { fetchChannels } from "@store/slices/channelsSlice";
import { useAppDispatch } from "@store/hooks";
import { Portal } from "@components/ui/Portal";
import { InviteManager } from "@components/invite/InviteManager";
import { CreateChannelModal } from "./CreateChannelModal";
import { EditChannelModal } from "./EditChannelModal";
import { ConfirmModal } from "@components/ui/ConfirmModal";

interface PalataListProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onMobileItemClick?: () => void;
}

export function PalataList({ isMobileOpen, onMobileClose, onMobileItemClick }: PalataListProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { serverId } = useParams();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const currentServer = useAppSelector((state) => state.servers.servers).find(
    (server) => server.id === serverId,
  );
  const channels = useAppSelector((state) => state.channels.channels);
  const isOwner = currentServer?.owner_id === user?.id;
  const { can } = usePermissions(serverId);
  const canManageChannels = isOwner || can(PERMISSIONS.MANAGE_CHANNELS);
  const canManageInvites = isOwner || can(PERMISSIONS.MANAGE_INVITES);

  const [showInvites, setShowInvites] = useState(false);
  const [creatingType, setCreatingType] = useState<"text" | "voice" | null>(
    null,
  );
  const [newChannelName, setNewChannelName] = useState("");
  const [editingChannel, setEditingChannel] = useState<{ id: string; name: string } | null>(null);
  const [deletingChannelId, setDeletingChannelId] = useState<string | null>(null);
  const [participantCounts, setParticipantCounts] = useState<
    Record<string, number>
  >({});
  const userBtnRef = useRef<HTMLButtonElement>(null);

  // Fetch active participants for voice channels
  useEffect(() => {
    if (!serverId) return;
    (async () => {
      try {
        const chs = await pb.collection("channels").getFullList({
          filter: `server_id = "${serverId}"`,
        });
        const chIds = chs.map((c: any) => c.id);
        if (chIds.length === 0) return;

        const orFilter = chIds
          .map((id: string) => `channel_id = "${id}"`)
          .join(" || ");
        const result = await pb.collection("channel_participants").getFullList({
          filter: orFilter,
        });
        const counts: Record<string, number> = {};
        for (const p of result as any[]) {
          counts[p.channel_id] = (counts[p.channel_id] || 0) + 1;
        }
        setParticipantCounts(counts);
      } catch {
        // ignore
      }
    })();
  }, [serverId, channels]);

  const handleRenameChannel = async () => {
    if (!editingChannel || !editingChannel.name.trim()) return;
    try {
      await pb.collection("channels").update(editingChannel.id, { name: editingChannel.name.trim() });
      if (serverId) dispatch(fetchChannels(serverId));
      setEditingChannel(null);
    } catch {}
  };

  const handleDeleteChannel = async () => {
    if (!deletingChannelId) return;
    try {
      await pb.collection("channels").delete(deletingChannelId);
      if (serverId) dispatch(fetchChannels(serverId));
      setDeletingChannelId(null);
    } catch {}
  };

  const handleCreateChannel = async () => {
    const name = newChannelName.trim();
    if (!name || !serverId || !creatingType) return;
    try {
      await pb.collection("channels").create({
        name,
        server_id: serverId,
        type: creatingType,
      });
      dispatch(fetchChannels(serverId));
      setNewChannelName("");
      setCreatingType(null);
    } catch (err) {
      console.error("Ошибка созданiя палаты", err);
    }
  };

  const content = (
    <>
      {/* Заголовок */}
      <div className="h-12 px-4 flex items-center border-b border-border bg-sidebar/30">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground tracking-[0.1em] uppercase font-semibold truncate">
            {currentServer?.name || "Градъ"}
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {canManageInvites && (
            <button
              onClick={() => setShowInvites(true)}
              className="w-7 h-7 rounded-md hover:bg-sidebar-accent flex items-center justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
              title="Приглашенiя"
            >
              <UserPlus className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          )}

          {isOwner && serverId && (
            <button
              onClick={() => navigate(AppRoutes.SERVER_SETTINGS.replace(":serverId", serverId))}
              className="w-7 h-7 rounded-md hover:bg-sidebar-accent flex items-center justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
              title="Настройки града"
            >
              <Settings className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          )}

          {isMobile && onMobileClose && (
            <button
              onClick={onMobileClose}
              className="w-7 h-7 rounded-md hover:bg-sidebar-accent flex items-center justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Список палат */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {(channels.filter((c) => c.type === "text").length > 0 || canManageChannels) && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 px-1 mb-1.5">
              <div className="w-4 h-4 rounded bg-muted/40 flex items-center justify-center">
                <MessageSquare size={10} className="text-muted-foreground/60" strokeWidth={2} />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest flex-1">
                Текстовыя
              </span>
              {canManageChannels && (
                <button
                  onClick={() => {
                    setCreatingType("text");
                    setNewChannelName("");
                  }}
                  className="w-5 h-5 rounded hover:bg-sidebar-accent flex items-center justify-center text-muted-foreground/60 hover:text-sidebar-foreground transition-colors"
                  title="Создати палату"
                >
                  <Plus className="w-3 h-3" strokeWidth={2} />
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              {channels
                .filter((c) => c.type === "text")
                .map((palata, index) => (
                  <div key={palata.id} className="group relative">
                    <TextPalata
                      index={index}
                      channelId={palata.id}
                      channelName={palata.name}
                      serverId={palata.server_id}
                    />
                    {canManageChannels && (
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 bg-sidebar/90 rounded-md p-0.5">
                        <button
                          onClick={() => setEditingChannel({ id: palata.id, name: palata.name })}
                          className="w-5 h-5 rounded hover:bg-sidebar-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          title="Переименовати"
                        >
                          <Pencil className="w-3 h-3" strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => setDeletingChannelId(palata.id)}
                          className="w-5 h-5 rounded hover:bg-sidebar-accent flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                          title="Удалити"
                        >
                          <Trash2 className="w-3 h-3" strokeWidth={2} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {(channels.filter((c) => c.type === "voice" || !c.type).length > 0 ||
          canManageChannels) && (
          <div>
            <div className="flex items-center gap-1.5 px-1 mb-1.5">
              <div className="w-4 h-4 rounded bg-muted/40 flex items-center justify-center">
                <Volume2 size={10} className="text-muted-foreground/60" strokeWidth={2} />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest flex-1">
                Голосовыя
              </span>
              {canManageChannels && (
                <button
                  onClick={() => {
                    setCreatingType("voice");
                    setNewChannelName("");
                  }}
                  className="w-5 h-5 rounded hover:bg-sidebar-accent flex items-center justify-center text-muted-foreground/60 hover:text-sidebar-foreground transition-colors"
                  title="Создати палату"
                >
                  <Plus className="w-3 h-3" strokeWidth={2} />
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              {channels
                .filter((c) => c.type === "voice" || !c.type)
                .map((palata, index) => (
                  <div key={palata.id} className="group relative">
                    <Palata
                      index={index}
                      channelId={palata.id}
                      channelName={palata.name}
                      participantCount={participantCounts[palata.id] || 0}
                    />
                    {canManageChannels && (
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 bg-sidebar/90 rounded-md p-0.5">
                        <button
                          onClick={() => setEditingChannel({ id: palata.id, name: palata.name })}
                          className="w-5 h-5 rounded hover:bg-sidebar-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          title="Переименовати"
                        >
                          <Pencil className="w-3 h-3" strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => setDeletingChannelId(palata.id)}
                          className="w-5 h-5 rounded hover:bg-sidebar-accent flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                          title="Удалити"
                        >
                          <Trash2 className="w-3 h-3" strokeWidth={2} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {channels.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Нѣтъ палатъ въ сёмъ градѣ
          </p>
        )}
      </div>

      {/* User */}
      <div className="border-t border-sidebar-border/50 pt-1.5 px-1.5 pb-1.5 mt-auto">
        <button
          ref={userBtnRef}
          onClick={() => { navigate(AppRoutes.SETTINGS); onMobileClose?.(); }}
          className="flex items-center gap-2 w-full rounded-lg p-2 transition-all hover:bg-sidebar-accent/50 group cursor-pointer"
        >
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-sidebar-border/50 group-hover:ring-primary/30 transition-all">
              {user?.avatar_url ? (
                <img src={user.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xs font-bold text-sidebar-foreground">
                  {user?.username ? user.username[0].toUpperCase() : "Г"}
                </div>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-sidebar" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-xs font-medium text-sidebar-foreground truncate">
              {user?.username || "Гость градскій"}
            </div>
            <div className="text-[10px] text-sidebar-foreground/50 truncate">В сети</div>
          </div>
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors opacity-0 group-hover:opacity-100" title="Настройки">
            <Settings className="w-3.5 h-3.5" strokeWidth={2} />
          </div>
        </button>
      </div>
    </>
  );

  const modals = (
    <>
      {creatingType && (
        <CreateChannelModal type={creatingType} value={newChannelName} onChange={setNewChannelName}
          onSave={handleCreateChannel} onClose={() => setCreatingType(null)} />
      )}

      {editingChannel && (
        <EditChannelModal name={editingChannel.name} onChange={(name) => setEditingChannel({ ...editingChannel, name })}
          onSave={handleRenameChannel} onClose={() => setEditingChannel(null)} />
      )}

      {deletingChannelId && (
        <ConfirmModal title="Удалити палату" confirmLabel="Удалити" confirmVariant="destructive"
          onConfirm={handleDeleteChannel} onCancel={() => setDeletingChannelId(null)}>
          <p className="text-sm text-muted-foreground">Вы увѣрены, что хотите удалить сію палату? Это дѣйствіе необратимо.</p>
        </ConfirmModal>
      )}

      {/* Invite manager modal */}
      {showInvites && serverId && (
        <Portal>
          <div
            className="fixed inset-0 z-[70] bg-black/50 flex items-start justify-center pt-[10vh]"
            onClick={() => setShowInvites(false)}
          >
            <div
              className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[75vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5">
                <InviteManager serverId={serverId} />
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Rename channel modal */}
      {editingChannel && (
        <Portal>
          <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center" onClick={() => setEditingChannel(null)}>
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-5 py-4 border-b border-border">
                <h4 className="text-sm font-semibold text-foreground">Переименовати палату</h4>
              </div>
              <div className="p-5">
                <input
                  autoFocus
                  value={editingChannel.name}
                  onChange={(e) => setEditingChannel({ ...editingChannel, name: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") handleRenameChannel(); if (e.key === "Escape") setEditingChannel(null); }}
                  className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-2">
                <button onClick={() => setEditingChannel(null)} className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors">Отмѣна</button>
                <button onClick={handleRenameChannel} disabled={!editingChannel.name.trim()} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors">Сохранити</button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Delete channel confirmation */}
      {deletingChannelId && (
        <Portal>
          <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center" onClick={() => setDeletingChannelId(null)}>
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-5 py-4 border-b border-border">
                <h4 className="text-sm font-semibold text-foreground">Удалити палату</h4>
              </div>
              <div className="p-5">
                <p className="text-sm text-muted-foreground">Вы увѣрены, что хотите удалить сію палату? Это дѣйствіе необратимо.</p>
              </div>
              <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-2">
                <button onClick={() => setDeletingChannelId(null)} className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors">Отмѣна</button>
                <button onClick={handleDeleteChannel} className="px-4 py-2 rounded-lg bg-destructive hover:bg-destructive/80 text-destructive-foreground text-sm font-medium transition-colors">Удалити</button>
              </div>
            </div>
          </div>
        </Portal>
      )}


    </>
  );

  if (serverId) {
    return (
      <div className="h-full flex flex-col">
        {content}
        {modals}
      </div>
    );
  }

  // desktop without serverId — render inline + modals

  return (
    <div className="h-full w-60 bg-card/50 backdrop-blur-xl flex flex-col border-r border-border relative z-10">
      {content}
      {modals}
    </div>
  );
}
