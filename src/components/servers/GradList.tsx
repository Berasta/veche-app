import { Menu, X, Users, Plus } from "lucide-react";
import { Skeleton } from "@components/ui/Skeleton";
import { useEffect, useState } from "react";
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

export function GradList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { serverId } = useParams();
  const { isOpen: isMobileMenuOpen, toggle: toggleMobileMenu, close: closeMobileMenu } = useMobileMenu();

  const servers = useAppSelector((state) => state.servers.servers);
  const currentServer = servers.find((s) => s.id === serverId);
  const participants = useAppSelector(selectParticipants);
  const [showMembers, setShowMembers] = useState(false);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [newServerName, setNewServerName] = useState("");

  const handleCreateServer = async () => {
    if (!newServerName.trim() || !user?.id) return;
    try {
      const record = await pb.collection("servers").create({
        name: newServerName.trim(),
        owner_id: user.id,
        is_private: true,
      });
      dispatch(fetchServers(user.id));
      setNewServerName("");
      setShowCreateServer(false);
      navigate(AppRoutes.SERVER.replace(":serverId", record.id));
    } catch {}
  };

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchServers(user.id));
    }
  }, [dispatch, user?.id]);

  const onClickServer = (serverId: string) => {
    navigate(AppRoutes.SERVER.replace(":serverId", serverId));
    closeMobileMenu();
  };

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar/95 backdrop-blur-xl border-b border-sidebar-border z-50 flex items-center px-4">
        <button
          onClick={toggleMobileMenu}
          className="text-sidebar-foreground p-2 rounded-lg hover:bg-sidebar-accent transition"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <span className="ml-3 font-semibold text-sidebar-foreground truncate flex-1">
          {currentServer?.name || "Грады"}
        </span>

        {serverId && (
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="flex items-center gap-1 p-2 rounded-lg hover:bg-sidebar-accent transition text-sidebar-foreground/70 hover:text-sidebar-foreground"
            title="Люди града"
          >
            <Users size={18} strokeWidth={2} />
            {participants.length > 0 && (
              <span className="text-xs font-medium">{participants.length}</span>
            )}
          </button>
        )}
      </div>

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
              <div className="p-5">
                <input autoFocus value={newServerName} onChange={(e) => setNewServerName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateServer(); if (e.key === "Escape") setShowCreateServer(false); }}
                  placeholder="Названіе новаго града"
                  className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-2">
                <button onClick={() => setShowCreateServer(false)} className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors">Отмѣна</button>
                <button onClick={handleCreateServer} disabled={!newServerName.trim()} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors disabled:opacity-50">Создати</button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          mt-14 md:mt-0
          p-2 md:p-0
          fixed md:relative top-0 left-0
          h-full
          bg-sidebar/95 backdrop-blur-xl
          border-r border-sidebar-border
          z-50 transition-transform duration-300
          w-72 md:w-auto
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
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
