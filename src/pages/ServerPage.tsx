import { useAppDispatch, useAppSelector } from "@store/hooks";
import { fetchChannels } from "@store/slices/channelsSlice";
import { useParams, useNavigate } from "react-router";
import { useEffect } from "react";
import { GramotaArea } from "@components/server/GramotaArea";
import { useMobileMenu } from "@components/layout/MobileMenuContext";

export const ServerPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { serverId, channelId } = useParams();
  const { toggle: toggleMobileMenu } = useMobileMenu();

  const channels = useAppSelector((state) => state.channels.channels);
  const serverChannels = channels.filter((c) => c.server_id === serverId);
  const currentChannel = serverChannels.find((c) => c.id === channelId);

  useEffect(() => {
    if (serverId) {
      dispatch(fetchChannels(serverId));
    }
  }, [dispatch, serverId]);

  useEffect(() => {
    if (!serverId || channelId) return;
    const textChannels = serverChannels.filter((c) => c.type === "text");
    if (textChannels.length > 0) {
      navigate(`/app/server/${serverId}/text/${textChannels[0].id}`, { replace: true });
    }
  }, [serverId, channelId, serverChannels, navigate]);

  return (
    <div className="flex w-full min-w-0">
      <GramotaArea
        channelId={channelId}
        channelName={currentChannel?.name}
        serverId={serverId}
        onMenuClick={toggleMobileMenu}
      />
    </div>
  );
};
