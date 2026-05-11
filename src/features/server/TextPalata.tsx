import { Hash, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

interface Props {
  channelId: string;
  channelName: string;
  serverId: string;
  index: number;
  isLocked?: boolean;
  canManage?: boolean;
}

export function TextPalata({ channelId, channelName, serverId, index, isLocked, canManage }: Props) {
  const navigate = useNavigate();
  const { channelId: activeChannelId } = useParams();
  const isActive = activeChannelId === channelId;

  const handleClick = () => {
    if (isLocked && !canManage) {
      toast.error("Сія палата заперта");
      return;
    }
    navigate(`/app/server/${serverId}/text/${channelId}`);
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -2 }}
      className={`cursor-pointer w-full px-2.5 py-2 rounded-xl text-left transition-all duration-100 flex items-center gap-2.5 group ${
        isLocked && !canManage ? "opacity-60" : ""
      } ${
        isActive
          ? "bg-primary/8 text-foreground"
          : "hover:bg-foreground/[0.03] text-foreground/60 hover:text-foreground/80"
      }`}
    >
      <Hash size={14} strokeWidth={1.5} className={isActive ? "text-primary" : "text-foreground/30"} />
      <span className={`text-sm flex-1 min-w-0 truncate ${isActive ? "font-medium" : ""}`}>{channelName}</span>
      {isLocked && (
        <Lock size={11} strokeWidth={1.5} className="text-foreground/30 flex-shrink-0" />
      )}
    </motion.button>
  );
}
