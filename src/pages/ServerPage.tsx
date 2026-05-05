import { useAppDispatch, useAppSelector } from "@app/hooks";
import { fetchChannels } from "@entities/channel/model/channelsSlice";
import { fetchServerMembers, selectServerMembersLoaded } from "@entities/member/model/membersSlice";
import { Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { GramotaArea } from "@features/server/GramotaArea";
import { ServerMembers } from "@features/server/ServerMembers";
import { useIsMobile } from "@shared/ui/use-mobile";

export const ServerPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { serverId, channelId } = useParams();
  const isMobile = useIsMobile();
  const [showMembers, setShowMembers] = useState(true);

  const channels = useAppSelector((state) => state.channels.channels);
  const serverChannels = channels.filter((c) => c.server_id === serverId);
  const currentChannel = serverChannels.find((c) => c.id === channelId);
  const channelsLoading = useAppSelector((state) => state.channels.loading);
  const membersLoaded = useAppSelector((state) => serverId ? selectServerMembersLoaded(serverId)(state) : false);
  const loading = !channelId && !!(serverId && (channelsLoading || !membersLoaded));

  useEffect(() => {
    if (serverId) {
      dispatch(fetchChannels(serverId));
      dispatch(fetchServerMembers(serverId));
    }
  }, [dispatch, serverId]);

  useEffect(() => {
    if (!serverId || channelId || isMobile) return;
    const textChannels = serverChannels.filter((c) => c.type === "text");
    if (textChannels.length > 0) {
      navigate(`/app/server/${serverId}/text/${textChannels[0].id}`, { replace: true });
    }
  }, [serverId, channelId, serverChannels, navigate, isMobile]);

  return (
    <div className="flex w-full min-w-0">
      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-background/40">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin text-foreground/20 mx-auto" />
            <p className="text-xs text-foreground/20 mt-2">Загрузка града...</p>
          </div>
        </div>
      ) : (
        <GramotaArea
          channelId={channelId}
          channelName={currentChannel?.name}
          serverId={serverId}
          onMenuClick={undefined}
          showMembers={showMembers}
          onToggleMembers={isMobile ? undefined : () => setShowMembers(!showMembers)}
        />
      )}
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
