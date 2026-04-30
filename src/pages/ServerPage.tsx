import { useAppDispatch, useAppSelector } from "@store/hooks";
import { fetchChannels } from "@store/slices/channelsSlice";
import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { GramotaArea } from "@components/server/GramotaArea";
import { ServerMembers } from "@components/server/ServerMembers";
import { useIsMobile } from "@components/ui/use-mobile";

export const ServerPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { serverId, channelId } = useParams();
  const isMobile = useIsMobile();
  const [showMembers, setShowMembers] = useState(false);

  const channels = useAppSelector((state) => state.channels.channels);
  const currentChannel = channels.find((c) => c.id === channelId);

  useEffect(() => {
    if (serverId) {
      dispatch(fetchChannels(serverId));
    }
  }, [dispatch, serverId]);

  // Auto-redirect to the first text channel (desktop only)
  useEffect(() => {
    if (!serverId || channelId || isMobile) return;
    const textChannels = channels.filter((c) => c.type === "text");
    if (textChannels.length > 0) {
      navigate(`/app/server/${serverId}/text/${textChannels[0].id}`, { replace: true });
    }
  }, [serverId, channelId, channels, navigate, isMobile]);

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
