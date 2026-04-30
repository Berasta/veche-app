import { Menu, X } from "lucide-react";
import { Skeleton } from "@components/ui/Skeleton";
import { useEffect } from "react";
import { ServerButton } from "./ServerButton";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { fetchServers } from "@store/slices/serversSlice";
import { useAuth } from "@store/hooks/useAuth";
import { useNavigate, useParams } from "react-router";
import { AppRoutes } from "@routes/routes";
import { PalataList } from "@components/server/PalataList";
import { useMobileMenu } from "@components/layout/MobileMenuContext";

export function GradList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { serverId } = useParams();
  const { isOpen: isMobileMenuOpen, toggle: toggleMobileMenu, close: closeMobileMenu } = useMobileMenu();

  const servers = useAppSelector((state) => state.servers.servers);
  const currentServer = servers.find((s) => s.id === serverId);

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

        <span className="ml-3 font-semibold text-sidebar-foreground truncate">
          {currentServer?.name || "Грады"}
        </span>
      </div>

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
          <div className="flex flex-col p-2 gap-2 mb-1 flex-shrink-0">
            {servers && servers.length > 0 ? (
              servers.map((grad, index) => (
                <ServerButton
                  key={grad.id}
                  name={grad.name}
                  avatarUrl={grad.avatar_url}
                  isSelected={false}
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
          </div>

          <div className="flex-1 min-w-0 overflow-hidden">
            <PalataList onMobileItemClick={closeMobileMenu} />
          </div>
        </div>
      </div>
    </>
  );
}
