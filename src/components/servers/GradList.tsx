import { MessageSquare, Volume2, Users, Plus, X } from "lucide-react";
import { Skeleton } from "@components/ui/Skeleton";
import { useEffect, useState, useRef } from "react";
import { ServerButton } from "./ServerButton";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { fetchServers } from "@store/slices/serversSlice";
import { useAuth } from "@store/hooks/useAuth";
import { useNavigate, useParams } from "react-router";
import { AppRoutes } from "@routes/routes";
import { PalataList } from "@components/server/PalataList";
import { ServerMembers } from "@components/server/ServerMembers";
import { useMobileMenu } from "@components/layout/MobileMenuContext";
import { selectParticipants } from "@store/selectors/roomSelectors";
import { pb } from "@api/pb";
import { Portal } from "@components/ui/Portal";
import { useIsMobile } from "@components/ui/use-mobile";

export function GradList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { serverId } = useParams();
  const { close: closeMobileMenu } = useMobileMenu();
  const isMobile = useIsMobile();

  const servers = useAppSelector((state) => state.servers.servers);
  const currentServer = servers.find((s) => s.id === serverId);
  const participants = useAppSelector(selectParticipants);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [newServerName, setNewServerName] = useState("");
  const [newServerAvatar, setNewServerAvatar] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleCreateServer = async () => {
    if (!newServerName.trim() || !user?.id || creating) return;
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append("name", newServerName.trim());
      formData.append("owner_id", user.id);
      formData.append("is_private", "true");
      if (newServerAvatar) formData.append("avatar", newServerAvatar);

      const record = await pb.collection("servers").create(formData);
      dispatch(fetchServers(user.id));
      setNewServerName("");
      setNewServerAvatar(null);
      setShowCreateServer(false);
      navigate(AppRoutes.SERVER.replace(":serverId", record.id));
    } catch {} finally { setCreating(false); }
  };

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchServers(user.id));
    }
  }, [dispatch, user?.id]);

  const onClickServer = (serverId: string) => {
    navigate(AppRoutes.SERVER.replace(":serverId", serverId));
    closeMobileMenu();
    setShowDrawer(false);
  };

  // ── MOBILE: bottom nav + unified drawer ────────────────
  if (isMobile) {
    return (
      <>
        {showMembers && serverId && (
          <ServerMembers serverId={serverId} isOpen={showMembers} onClose={() => setShowMembers(false)} />
        )}

        {/* Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-sidebar/95 backdrop-blur-xl border-t border-sidebar-border z-50 flex items-center justify-around px-2 safe-area-bottom">
          <button
            onClick={() => setShowDrawer(true)}
            className="flex flex-col items-center gap-0.5 p-1 text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors min-w-0 flex-1"
          >
            <div className="relative">
              <MessageSquare size={20} strokeWidth={1.5} />
              {currentServer && (
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            <span className="text-[9px] font-semibold uppercase tracking-wider">Грады</span>
          </button>
          <button
            className="flex flex-col items-center gap-0.5 p-1 text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors min-w-0 flex-1"
          >
            <Volume2 size={20} strokeWidth={1.5} />
            <span className="text-[9px] font-semibold uppercase tracking-wider">Гласъ</span>
          </button>
          <button
            onClick={() => serverId && setShowMembers(true)}
            disabled={!serverId}
            className="flex flex-col items-center gap-0.5 p-1 text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors min-w-0 flex-1 disabled:opacity-30"
          >
            <div className="relative">
              <Users size={20} strokeWidth={1.5} />
              {participants.length > 0 && (
                <span className="absolute -top-1 -right-2 text-[9px] font-bold text-primary">{participants.length}</span>
              )}
            </div>
            <span className="text-[9px] font-semibold uppercase tracking-wider">Люди</span>
          </button>
        </div>

        {/* Unified Drawer (bottom sheet) */}
        {showDrawer && (
          <>
            <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setShowDrawer(false)} />
            <div className="fixed bottom-0 left-0 right-0 z-[70] bg-sidebar backdrop-blur-xl border-t border-sidebar-border rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-up safe-area-bottom">
              {/* Handle */}
              <div className="flex justify-center pt-2 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full bg-sidebar-border/50" />
              </div>

              {/* Server rows (horizontal scroll) */}
              <div className="flex gap-2.5 px-4 py-3 overflow-x-auto flex-shrink-0 border-b border-sidebar-border/50">
                {servers && servers.length > 0 ? (
                  servers.map((grad) => (
                    <button
                      key={grad.id}
                      onClick={() => onClickServer(grad.id)}
                      className={`flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden ring-2 transition-all ${
                        grad.id === serverId ? "ring-primary ring-offset-2 ring-offset-sidebar" : "ring-sidebar-border/50 hover:ring-primary/50"
                      }`}
                    >
                      {grad.avatar_url ? (
                        <img src={grad.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-sidebar-foreground">
                          {grad.name[0]}
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="w-12 h-12 rounded-xl flex-shrink-0" />
                  ))
                )}
                <button
                  onClick={() => { setShowDrawer(false); setShowCreateServer(true); }}
                  className="flex-shrink-0 w-12 h-12 rounded-xl border-2 border-dashed border-sidebar-border/50 flex items-center justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground hover:border-sidebar-foreground/30 transition-all"
                  title="Создати градъ"
                >
                  <Plus className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>

              {/* Channel list */}
              <div className="flex-1 overflow-y-auto">
                {serverId ? (
                  <PalataList onMobileItemClick={() => setShowDrawer(false)} />
                ) : (
                  <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                    Изберите градъ
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {showCreateServer && (
          <Portal>
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setShowCreateServer(false)}>
              <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-4 border-b border-border">
                  <h4 className="text-sm font-semibold text-foreground">Создати градъ</h4>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0 cursor-pointer group" onClick={() => avatarInputRef.current?.click()}>
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted ring-2 ring-border/50 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                        {newServerAvatar ? (
                          <img src={URL.createObjectURL(newServerAvatar)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Plus className="w-6 h-6 text-muted-foreground/50" strokeWidth={1.5} />
                        )}
                      </div>
                      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setNewServerAvatar(e.target.files?.[0] || null)} />
                    </div>
                    <input autoFocus value={newServerName} onChange={(e) => setNewServerName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleCreateServer(); if (e.key === "Escape") setShowCreateServer(false); }}
                      placeholder="Названіе новаго града"
                      className="flex-1 bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
                <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-2">
                  <button onClick={() => setShowCreateServer(false)} className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors">Отмѣна</button>
                  <button onClick={handleCreateServer} disabled={!newServerName.trim() || creating} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors disabled:opacity-50">{creating ? "Созданіе..." : "Создати"}</button>
                </div>
              </div>
            </div>
          </Portal>
        )}
      </>
    );
  }

  // ── DESKTOP ────────────────────────────────────────────
  return (
    <>
      {showMembers && serverId && (
        <ServerMembers serverId={serverId} isOpen={showMembers} onClose={() => setShowMembers(false)} />
      )}

      {showCreateServer && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setShowCreateServer(false)}>
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-5 py-4 border-b border-border">
                <h4 className="text-sm font-semibold text-foreground">Создати градъ</h4>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0 cursor-pointer group" onClick={() => avatarInputRef.current?.click()}>
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted ring-2 ring-border/50 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                      {newServerAvatar ? (
                        <img src={URL.createObjectURL(newServerAvatar)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Plus className="w-6 h-6 text-muted-foreground/50" strokeWidth={1.5} />
                      )}
                    </div>
                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setNewServerAvatar(e.target.files?.[0] || null)} />
                  </div>
                  <input autoFocus value={newServerName} onChange={(e) => setNewServerName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleCreateServer(); if (e.key === "Escape") setShowCreateServer(false); }}
                    placeholder="Названіе новаго града"
                    className="flex-1 bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-2">
                <button onClick={() => setShowCreateServer(false)} className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors">Отмѣна</button>
                <button onClick={handleCreateServer} disabled={!newServerName.trim() || creating} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors disabled:opacity-50">{creating ? "Созданіе..." : "Создати"}</button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* SIDEBAR */}
      <div className="p-2 md:p-0 flex-shrink-0 border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl">
        <div className="flex h-full">
          {/* Список градов */}
          <div className="flex flex-col p-2 gap-2 flex-shrink-0">
            {servers && servers.length > 0 ? (
              servers.map((grad, index) => (
                <ServerButton
                  key={grad.id}
                  name={grad.name}
                  avatarUrl={grad.avatar_url}
                  isSelected={grad.id === serverId}
                  index={index}
                  onClick={() => onClickServer(grad.id)}
                />
              ))
            ) : (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-12 h-12 rounded-lg" />
                ))}
              </>
            )}
            <button
              onClick={() => setShowCreateServer(true)}
              className="w-12 h-12 rounded-lg border-2 border-dashed border-sidebar-border/50 flex items-center justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground hover:border-sidebar-foreground/30 transition-all flex-shrink-0"
              title="Создати градъ"
            >
              <Plus className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          <div className="flex-1 min-w-0 overflow-hidden">
            <PalataList onMobileItemClick={closeMobileMenu} />
          </div>
        </div>
      </div>
    </>
  );
}
