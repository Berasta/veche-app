import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  selectActiveChannelId,
  selectConnected,
  selectConnecting,
} from "@store/selectors/roomSelectors";
import { joinChannel } from "@store/thunks/roomThunk";
import { Loader2, Volume2 } from "lucide-react";
import { motion } from "motion/react";
import { useParams, useNavigate } from "react-router";

interface Props {
  channelId: string;
  channelName: string;
  index: number;
  participantCount?: number;
  participantAvatars?: string[];
}

export function Palata({ channelId, channelName, index, participantCount = 0 }: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { serverId } = useParams();
  const activeChannelId = useAppSelector(selectActiveChannelId);
  const connected = useAppSelector(selectConnected);
  const connecting = useAppSelector(selectConnecting);

  const isActive = activeChannelId === channelId;
  const isThisConnecting = connecting && activeChannelId === null;

  const handleClick = () => {
    if (!serverId) return;
    // Если уже активен звонок — открываем раскрытый вид
    if (connected && activeChannelId) {
      navigate(`/app/server/${serverId}/voice/${activeChannelId}`);
      return;
    }
    try { if ('wakeLock' in navigator) (navigator as any).wakeLock.request('screen'); } catch (err) { console.error("wakeLock error in Palata", err); }
    dispatch(joinChannel({ channelId, channelName, serverId }));
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -2 }}
      className={`
        cursor-pointer w-full px-2 py-1.5 rounded-md text-left
        transition-all duration-100 flex items-center gap-2 group
        ${
          isActive
            ? "bg-muted text-foreground"
            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        }
      `}
    >
      {isThisConnecting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Volume2
          size={16}
          strokeWidth={2}
          className={isActive ? "text-green-500" : ""}
        />
      )}
      <span className="flex-1 min-w-0 truncate">{channelName}</span>
      {participantCount > 0 && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="flex -space-x-1.5">
            {participantAvatars?.slice(0, 3).map((url, i) => (
              <div key={i} className="w-4 h-4 rounded-full ring-[1.5px] ring-sidebar overflow-hidden bg-sidebar/50 flex-shrink-0">
                {url ? (
                  <img src={url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
              </div>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{participantCount}</span>
        </div>
      )}
      {isActive && (
        <span className="text-xs text-green-500 flex-shrink-0 ml-1">●</span>
      )}
    </motion.button>
  );
}
