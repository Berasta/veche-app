import { useAppDispatch, useAppSelector } from "@store/hooks";
import { fetchChannels, clearChannels } from "@store/slices/channelsSlice";
import { useParams, useNavigate } from "react-router";
import { useEffect, useState, useRef } from "react";
import { GramotaArea } from "@components/server/GramotaArea";
import { ServerMembers } from "@components/server/ServerMembers";
import { useIsMobile } from "@components/ui/use-mobile";
import { Loader2, Castle } from "lucide-react";

export const ServerPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { serverId, channelId } = useParams();
  const isMobile = useIsMobile();
  const [showMembers, setShowMembers] = useState(false);
  const prevServerRef = useRef(serverId);

  const channels = useAppSelector((state) => state.channels.channels);
  const channelsLoading = useAppSelector((state) => state.channels.loading);
  const serverChannels = channels.filter((c) => c.server_id === serverId);
  const currentChannel = serverChannels.find((c) => c.id === channelId);

  useEffect(() => {
    if (serverId) {
      if (prevServerRef.current !== serverId) {
        dispatch(clearChannels());
        prevServerRef.current = serverId;
      }
      dispatch(fetchChannels(serverId));
    }
  }, [dispatch, serverId]);

  useEffect(() => {
    if (!serverId || channelId || isMobile) return;
    const textChannels = serverChannels.filter((c) => c.type === "text");
    if (textChannels.length > 0) {
      navigate(`/app/server/${serverId}/text/${textChannels[0].id}`, { replace: true });
    }
  }, [serverId, channelId, serverChannels, navigate, isMobile]);

  // Show loading state while switching servers
  if (serverId && !channelId && (channelsLoading || serverChannels.length === 0)) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <Castle className="w-10 h-10 text-primary/30 mx-auto mb-4" strokeWidth={1.5} />
          <Loader2 className="w-5 h-5 animate-spin text-primary/50 mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">Загрузка града...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0">
      <GramotaArea
        channelId={channelId}
        channelName={currentChannel?.name}
        serverId={serverId}
        onMenuClick={undefined}
        showMembers={isMobile ? false : showMembers}
        onToggleMembers={isMobile ? undefined : () => setShowMembers(!showMembers)}
      />
      {serverId && !isMobile && (
        <ServerMembers
          serverId={serverId}
          isOpen={showMembers}
          onClose={() => setShowMembers(false)}
        />
      )}
    </div>
  );
};
